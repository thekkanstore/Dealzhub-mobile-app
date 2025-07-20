import {useState, useEffect, useCallback} from 'react';
import {Platform, Alert, Linking} from 'react-native';
import {
  request,
  check,
  PERMISSIONS,
  RESULTS,
  openSettings,
  PermissionStatus,
} from 'react-native-permissions';
import Geolocation from '@react-native-community/geolocation';
import {showErrorToast} from '../utils/common/toastUtils';

// Custom hook for location permissions
export const useLocationPermission = () => {
  const [permissionStatus, setPermissionStatus] = useState<PermissionStatus | null>(null);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isGpsEnabled, setIsGpsEnabled] = useState<boolean | null>(null);

  // Get the appropriate permission based on platform
  const getLocationPermission = useCallback(() => {
    return Platform.OS === 'ios'
      ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
      : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;
  }, []);

  // Check if GPS/Location Services are enabled
  const checkGpsStatus = () => {
    return new Promise(resolve => {
      Geolocation.getCurrentPosition(
        () => {
          // GPS is enabled and working
          setIsGpsEnabled(true);
          resolve(true);
        },
        _error => {
          switch (_error.code) {
            case 2: // POSITION_UNAVAILABLE - GPS might be disabled
              setIsGpsEnabled(false);
              resolve(false);
              break;
            case 1: // PERMISSION_DENIED - Permission issue, not GPS
              setIsGpsEnabled(null);
              resolve(null);
              break;
            case 3: // TIMEOUT - Could be GPS issue
              setIsGpsEnabled(false);
              resolve(false);
              break;
            default:
              setIsGpsEnabled(false);
              resolve(false);
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 10000, // Longer timeout for release builds
          maximumAge: 60000, // Allow cached location for 1 minute
        },
      );
    });
  };

  // Prompt user to enable GPS/Location Services
  const promptToEnableGps = () => {
    const title = Platform.OS === 'ios' ? 'Location Services Disabled' : 'GPS Disabled';
    const message =
      Platform.OS === 'ios'
        ? 'Please enable Location Services in Settings to use location features.'
        : 'Please enable GPS/Location Services to use location features.';

    Alert.alert(title, message, [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Open Settings',
        onPress: () => {
          if (Platform.OS === 'ios') {
            Linking.openURL('app-settings:');
          } else {
            // For Android, open location settings
            Linking.sendIntent('android.settings.LOCATION_SOURCE_SETTINGS');
          }
        },
      },
    ]);
  };

  // Check current permission status
  const checkPermissionStatus = useCallback(async () => {
    try {
      const permission = getLocationPermission();
      const result = await check(permission);
      setPermissionStatus(result);
      return result;
    } catch (err: any) {
      setError(err.message);
      return RESULTS.UNAVAILABLE;
    }
  }, [getLocationPermission]);

  // Request location permission
  const requestLocationPermission = async (onPermissionDenied?: () => void) => {
    try {
      setLoading(true);
      setError(null);

      const permission = getLocationPermission();
      const result = await request(permission);

      setPermissionStatus(result);

      switch (result) {
        case RESULTS.GRANTED: {
          // After permission is granted, check if GPS is enabled
          const gpsEnabled = await checkGpsStatus();
          if (gpsEnabled === false) {
            promptToEnableGps();
            return false;
          }
          return true;
        }
        case RESULTS.DENIED:
          Alert.alert(
            'Permission Denied',
            'Location permission was denied. Some features may not work properly.',
            [{text: 'OK', onPress: onPermissionDenied}],
          );
          return false;

        case RESULTS.BLOCKED:
          Alert.alert(
            'Permission Blocked',
            'Location permission is blocked. Please enable it in settings to use this feature.',
            [
              {text: 'Cancel', style: 'cancel', onPress: onPermissionDenied},
              {text: 'Open Settings', onPress: openSettings},
            ],
          );
          return false;

        case RESULTS.UNAVAILABLE:
          Alert.alert(
            'Feature Unavailable',
            'Location services are not available on this device.',
            [{text: 'OK', onPress: onPermissionDenied}],
          );
          return false;

        default:
          return false;
      }
    } catch (err: any) {
      onPermissionDenied?.();
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Get current location
  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      setLoading(true);
      setError(null);

      Geolocation.getCurrentPosition(
        position => {
          const coords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
          };
          setLocation(coords);
          setLoading(false);
          resolve(coords);
        },
        error => {
          setError(error.message);
          setLoading(false);

          // Handle specific error codes
          switch (error.code) {
            case 1: // PERMISSION_DENIED
              Alert.alert(
                'Permission Required',
                'Location permission is required to get your current location.',
                [
                  {text: 'Cancel', style: 'cancel'},
                  {
                    text: 'Grant Permission',
                    onPress: requestLocationPermission,
                  },
                ],
              );
              break;
            case 2: // POSITION_UNAVAILABLE
              Alert.alert(
                'Location Unavailable',
                'Unable to determine your location. Please check your GPS settings.',
                [{text: 'OK'}],
              );
              break;
            case 3: // TIMEOUT
              // Retry with network-based location
              setTimeout(() => {
                Geolocation.getCurrentPosition(
                  position => {
                    const coords = {
                      latitude: position.coords.latitude,
                      longitude: position.coords.longitude,
                      accuracy: position.coords.accuracy,
                      timestamp: position.timestamp,
                    };
                    setLocation(coords);
                    setLoading(false);
                    resolve(coords);
                  },
                  () => {
                    showErrorToast('Unable to get location. Please check GPS settings.');
                    setLoading(false);
                  },
                  {
                    enableHighAccuracy: true || false,
                    timeout: 20000,
                    maximumAge: 20000,
                  },
                );
              }, 1000);
              break;
            default:
              showErrorToast('An error occurred while getting your location.');
          }
          reject(error);
        },
        {
          enableHighAccuracy: true || false,
          timeout: 20000,
          maximumAge: 20000,
        },
      );
    });
  };

  // Watch location changes
  const watchLocation = (
    callback: (
      coords: {
        latitude: number;
        longitude: number;
        accuracy: number;
        timestamp: number;
      } | null,
      error?: any,
    ) => void,
  ) => {
    const watchId = Geolocation.watchPosition(
      position => {
        const coords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
        };
        setLocation(coords);
        if (callback) {
          callback(coords);
        }
      },
      error => {
        setError(error.message);
        if (callback) {
          callback(null, error);
        }
      },
      {
        enableHighAccuracy: false,
        timeout: 30000,
        maximumAge: 0,
        distanceFilter: 10, // Update every 10 meters
      },
    );

    return watchId;
  };

  // Stop watching location
  const stopWatchingLocation = (watchId: number) => {
    Geolocation.clearWatch(watchId);
  };

  // Request permission and get location in one function
  const requestLocationAndGetPosition = async () => {
    const hasPermission = await requestLocationPermission();
    if (hasPermission) {
      return getCurrentLocation();
    }
    return null;
  };

  // Check permission on mount
  useEffect(() => {
    checkPermissionStatus();
  }, [checkPermissionStatus]);

  return {
    permissionStatus,
    location,
    loading,
    error,
    isGpsEnabled,
    checkPermissionStatus,
    requestLocationPermission,
    getCurrentLocation,
    watchLocation,
    stopWatchingLocation,
    requestLocationAndGetPosition,
    checkGpsStatus,
    promptToEnableGps,
  };
};
