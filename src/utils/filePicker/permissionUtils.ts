import {Platform, Alert, Linking} from 'react-native';
import {
  request,
  requestMultiple,
  check,
  PERMISSIONS,
  RESULTS,
  PermissionStatus,
} from 'react-native-permissions';
import {showErrorToast} from '../common/toastUtils';
import {FilePickerType} from './filePickerTypes';

/**
 * Android API level constants for permission logic
 */
const ANDROID_API_LEVELS = {
  MARSHMALLOW: 23, // Android 6.0 - Runtime permissions introduced
  PIE: 28, // Android 9 - Last version requiring READ_EXTERNAL_STORAGE
  Q: 29, // Android 10 - Scoped storage introduced
  TIRAMISU: 33, // Android 13 - Granular media permissions
  UPSIDE_DOWN_CAKE: 34, // Android 14 - Partial photo access
} as const;

/**
 * Get Android API level using Platform.Version
 * Returns the Android API level as a number
 */
const getAndroidApiLevel = (): number => {
  if (Platform.OS !== 'android') {
    return 0;
  }
  return typeof Platform.Version === 'string' ? parseInt(Platform.Version, 10) : Platform.Version;
};

/**
 * Get Android gallery permissions based on API level
 * Following the research findings for optimal permission strategy
 */
const getAndroidGalleryPermissions = (): string[] => {
  const apiLevel = getAndroidApiLevel();

  if (apiLevel >= ANDROID_API_LEVELS.TIRAMISU) {
    // Android 13+: System photo picker doesn't need permissions
    // We removed READ_MEDIA_IMAGES and READ_MEDIA_VIDEO to comply with Play Store policies
    return [];
  } else if (apiLevel >= ANDROID_API_LEVELS.MARSHMALLOW) {
    // Android 6-12: Legacy READ_EXTERNAL_STORAGE
    return [PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE];
  } else {
    // Android 5.1 and below: Permissions granted at install time
    return [];
  }
};

/**
 * Check if gallery permissions are granted based on Android version
 */
const checkAndroidGalleryPermissions = async (): Promise<boolean> => {
  const apiLevel = getAndroidApiLevel();

  // For Android 5.1 and below, permissions are granted at install time
  if (apiLevel < ANDROID_API_LEVELS.MARSHMALLOW) {
    return true;
  }

  const requiredPermissions = getAndroidGalleryPermissions();

  if (requiredPermissions.length === 0) {
    return true;
  }

  if (requiredPermissions.length === 1) {
    const result = await request(requiredPermissions[0] as any);
    return result === RESULTS.GRANTED;
  }

  // For multiple permissions (Android 13+)
  const results = await requestMultiple(requiredPermissions as any);

  // Check if at least one media permission is granted
  return Object.values(results).some(result => result === RESULTS.GRANTED);
};

/**
 * Request Android gallery permissions with proper fallback strategy
 */
const requestAndroidGalleryPermissions = async (): Promise<{
  granted: boolean;
  partialAccess: boolean;
  permissions: Record<string, PermissionStatus>;
}> => {
  const apiLevel = getAndroidApiLevel();

  // For Android 5.1 and below, permissions are granted at install time
  if (apiLevel < ANDROID_API_LEVELS.MARSHMALLOW) {
    return {granted: true, partialAccess: false, permissions: {}};
  }

  const requiredPermissions = getAndroidGalleryPermissions();

  if (requiredPermissions.length === 0) {
    return {granted: true, partialAccess: false, permissions: {}};
  }

  if (requiredPermissions.length === 1) {
    const result = await request(requiredPermissions[0] as any);
    return {
      granted: result === RESULTS.GRANTED,
      partialAccess: false,
      permissions: {[requiredPermissions[0]]: result},
    };
  }

  // For multiple permissions (Android 13+)
  const results = await requestMultiple(requiredPermissions as any);

  // On Android 14+, user might grant partial access
  const hasFullAccess = results[PERMISSIONS.ANDROID.READ_MEDIA_IMAGES] === RESULTS.GRANTED;
  const hasAnyAccess = Object.values(results).some(result => result === RESULTS.GRANTED);

  return {
    granted: hasAnyAccess,
    partialAccess:
      apiLevel >= ANDROID_API_LEVELS.UPSIDE_DOWN_CAKE && hasAnyAccess && !hasFullAccess,
    permissions: results,
  };
};

/**
 * Get Android document permissions based on API level
 * For consistency with image picker, we'll request storage permissions for documents too
 */
const getAndroidDocumentPermissions = (): string[] => {
  const apiLevel = getAndroidApiLevel();

  if (apiLevel >= ANDROID_API_LEVELS.TIRAMISU) {
    // Android 13+: System picker doesn't need permissions
    return [];
  } else if (apiLevel >= ANDROID_API_LEVELS.MARSHMALLOW) {
    // Android 6-12: Legacy READ_EXTERNAL_STORAGE for document access
    return [PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE];
  } else {
    // Android 5.1 and below: Permissions granted at install time
    return [];
  }
};

/**
 * Check if document permissions are granted based on Android version
 */
const checkAndroidDocumentPermissions = async (): Promise<boolean> => {
  const apiLevel = getAndroidApiLevel();

  // For Android 5.1 and below, permissions are granted at install time
  if (apiLevel < ANDROID_API_LEVELS.MARSHMALLOW) {
    return true;
  }

  const requiredPermissions = getAndroidDocumentPermissions();

  if (requiredPermissions.length === 0) {
    return true;
  }

  if (requiredPermissions.length === 1) {
    const result = await request(requiredPermissions[0] as any);
    return result === RESULTS.GRANTED;
  }

  // For multiple permissions (Android 13+)
  const results = await requestMultiple(requiredPermissions as any);

  // Check if at least one permission is granted
  return Object.values(results).some(result => result === RESULTS.GRANTED);
};

/**
 * Request Android document permissions with proper strategy
 */
const requestAndroidDocumentPermissions = async (): Promise<{
  granted: boolean;
  permissions: Record<string, PermissionStatus>;
}> => {
  const apiLevel = getAndroidApiLevel();

  // For Android 5.1 and below, permissions are granted at install time
  if (apiLevel < ANDROID_API_LEVELS.MARSHMALLOW) {
    return {granted: true, permissions: {}};
  }

  const requiredPermissions = getAndroidDocumentPermissions();

  if (requiredPermissions.length === 0) {
    return {granted: true, permissions: {}};
  }

  if (requiredPermissions.length === 1) {
    const result = await request(requiredPermissions[0] as any);
    return {
      granted: result === RESULTS.GRANTED,
      permissions: {[requiredPermissions[0]]: result},
    };
  }

  // For multiple permissions (Android 13+)
  const results = await requestMultiple(requiredPermissions as any);

  const hasAnyAccess = Object.values(results).some(result => result === RESULTS.GRANTED);

  return {
    granted: hasAnyAccess,
    permissions: results,
  };
};

export const checkFilePickerPermissions = async (type: FilePickerType): Promise<boolean> => {
  try {
    if (Platform.OS === 'ios') {
      const permission = type === 'camera' ? PERMISSIONS.IOS.CAMERA : PERMISSIONS.IOS.PHOTO_LIBRARY;

      // First check current permission status
      const currentStatus = await check(permission);

      // If already granted or limited (iOS 14+ partial access), return true
      if (currentStatus === RESULTS.GRANTED || currentStatus === RESULTS.LIMITED) {
        return true;
      }

      // If denied or not determined, request permission
      const result = await request(permission);
      return result === RESULTS.GRANTED || result === RESULTS.LIMITED;
    } else {
      // Android permission handling
      if (type === 'camera') {
        const result = await request(PERMISSIONS.ANDROID.CAMERA);
        return result === RESULTS.GRANTED;
      } else if (type === 'documents') {
        // For document access, check storage permissions based on Android version
        return await checkAndroidDocumentPermissions();
      } else if (type === 'gallery') {
        // Use comprehensive Android gallery permission strategy
        return await checkAndroidGalleryPermissions();
      }

      return false;
    }
  } catch (error) {
    console.error('Permission check error:', error);
    return false;
  }
};

/**
 * Enhanced gallery permission request with detailed result
 */
export const requestGalleryPermissions = async (): Promise<{
  granted: boolean;
  partialAccess: boolean;
  shouldUsePhotoPicker: boolean;
  permissions: Record<string, PermissionStatus>;
}> => {
  try {
    if (Platform.OS === 'ios') {
      // First check current status
      const currentStatus = await check(PERMISSIONS.IOS.PHOTO_LIBRARY);

      // If already granted or limited, don't request again
      if (currentStatus === RESULTS.GRANTED || currentStatus === RESULTS.LIMITED) {
        return {
          granted: true,
          partialAccess: currentStatus === RESULTS.LIMITED,
          shouldUsePhotoPicker: false,
          permissions: {[PERMISSIONS.IOS.PHOTO_LIBRARY]: currentStatus},
        };
      }

      // Only request if not determined or blocked
      const result = await request(PERMISSIONS.IOS.PHOTO_LIBRARY);
      return {
        granted: result === RESULTS.GRANTED || result === RESULTS.LIMITED,
        partialAccess: result === RESULTS.LIMITED,
        shouldUsePhotoPicker: result !== RESULTS.GRANTED && result !== RESULTS.LIMITED,
        permissions: {[PERMISSIONS.IOS.PHOTO_LIBRARY]: result},
      };
    } else {
      const result = await requestAndroidGalleryPermissions();

      return {
        granted: result.granted,
        partialAccess: result.partialAccess,
        shouldUsePhotoPicker: !result.granted || result.partialAccess,
        permissions: result.permissions,
      };
    }
  } catch (error) {
    console.error('Gallery permission request error:', error);
    return {
      granted: false,
      partialAccess: false,
      shouldUsePhotoPicker: true,
      permissions: {},
    };
  }
};

/**
 * Enhanced document permission request with detailed result
 */
export const requestDocumentPermissions = async (): Promise<{
  granted: boolean;
  permissions: Record<string, PermissionStatus>;
}> => {
  try {
    if (Platform.OS === 'ios') {
      // iOS doesn't require special permissions for document picker
      return {
        granted: true,
        permissions: {},
      };
    } else {
      const result = await requestAndroidDocumentPermissions();
      return {
        granted: result.granted,
        permissions: result.permissions,
      };
    }
  } catch (error) {
    return {
      granted: false,
      permissions: {},
    };
  }
};

/**
 * Enhanced permission denied handler with photo picker recommendation
 */
export const handlePermissionDenied = (
  type: FilePickerType,
  onError?: (error: string) => void,
  onUsePhotoPicker?: () => void,
) => {
  if (type === 'gallery' && onUsePhotoPicker) {
    Alert.alert(
      'Gallery Access',
      'For better privacy and user experience, we recommend using the built-in photo picker instead of requiring gallery permissions.',
      [
        {text: 'Cancel', style: 'cancel', onPress: () => onError?.('Permission denied')},
        {text: 'Use Photo Picker', onPress: onUsePhotoPicker},
        {
          text: 'Grant Permission',
          onPress: () => {
            setTimeout(() => {
              Linking.openSettings().catch(() => {
                showErrorToast('Unable to open settings');
              });
            }, 100);
          },
        },
      ],
    );
  } else {
    Alert.alert('Permission Required', `Please grant ${type} permission to continue`, [
      {text: 'Cancel', style: 'cancel', onPress: () => onError?.('Permission denied')},
      {
        text: 'Settings',
        onPress: () => {
          Linking.openSettings().catch(() => {
            showErrorToast('Unable to open settings');
          });
        },
      },
    ]);
  }
};

/**
 * Get permission strategy recommendations based on Android version
 */
export const getPermissionStrategy = async (): Promise<{
  recommendPhotoPicker: boolean;
  requiresPermission: boolean;
  supportedPermissions: string[];
  apiLevel: number;
}> => {
  if (Platform.OS === 'ios') {
    return {
      recommendPhotoPicker: true,
      requiresPermission: true,
      supportedPermissions: [PERMISSIONS.IOS.PHOTO_LIBRARY],
      apiLevel: 0,
    };
  }

  const apiLevel = getAndroidApiLevel();

  return {
    recommendPhotoPicker: true, // Always recommend photo picker for privacy
    requiresPermission: apiLevel >= ANDROID_API_LEVELS.MARSHMALLOW,
    supportedPermissions: getAndroidGalleryPermissions(),
    apiLevel,
  };
};
