import {Platform, Alert, PermissionsAndroid} from 'react-native';
import {RESULTS, requestNotifications} from 'react-native-permissions';
import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {strings} from '../language/langauageUtils';

export enum NotificationPermissionStatus {
  GRANTED = 'granted',
  DENIED = 'denied',
  BLOCKED = 'blocked',
  UNAVAILABLE = 'unavailable',
  NOT_REQUESTED = 'not_requested',
}

interface NotificationPermissionResult {
  status: NotificationPermissionStatus;
  canAskAgain: boolean;
}

export interface CustomPermissionDialogProps {
  title: string;
  message: string;
  allowText: string;
  notNowText: string;
  onAllow: () => void;
  onNotNow: () => void;
}

export interface CustomSettingsDialogProps {
  title: string;
  message: string;
  goToSettingsText: string;
  cancelText: string;
  onGoToSettings: () => void;
  onCancel: () => void;
}

export type CustomPermissionDialog = React.ComponentType<CustomPermissionDialogProps>;
export type CustomSettingsDialog = React.ComponentType<CustomSettingsDialogProps>;

class NotificationPermissionManager {
  private static instance: NotificationPermissionManager;
  private static readonly PERMISSION_STORAGE_KEY = 'notification_permission_asked';
  private static readonly PERMISSION_DENIED_COUNT_KEY = 'notification_permission_denied_count';
  private static readonly MAX_PERMISSION_REQUESTS = 2;

  private customPermissionDialog: CustomPermissionDialog | null = null;
  private customSettingsDialog: CustomSettingsDialog | null = null;
  private showCustomDialog: ((component: React.ReactElement) => Promise<void>) | null = null;
  private hideCustomDialog: (() => void) | null = null;

  private constructor() {}

  static getInstance(): NotificationPermissionManager {
    if (!NotificationPermissionManager.instance) {
      NotificationPermissionManager.instance = new NotificationPermissionManager();
    }
    return NotificationPermissionManager.instance;
  }

  /**
   * Configure custom dialog components and handlers
   */
  configureCustomDialogs({
    permissionDialog,
    settingsDialog,
    showDialog,
    hideDialog,
  }: {
    permissionDialog?: CustomPermissionDialog;
    settingsDialog?: CustomSettingsDialog;
    showDialog?: (component: React.ReactElement) => Promise<void>;
    hideDialog?: () => void;
  }) {
    this.customPermissionDialog = permissionDialog || null;
    this.customSettingsDialog = settingsDialog || null;
    this.showCustomDialog = showDialog || null;
    this.hideCustomDialog = hideDialog || null;
  }

  /**
   * Converts permission result to our custom status
   */
  private mapPermissionResult(result: string): NotificationPermissionStatus {
    switch (result) {
      case RESULTS.GRANTED:
        return NotificationPermissionStatus.GRANTED;
      case RESULTS.DENIED:
        return NotificationPermissionStatus.DENIED;
      case RESULTS.BLOCKED:
      case RESULTS.LIMITED:
        return NotificationPermissionStatus.BLOCKED;
      case RESULTS.UNAVAILABLE:
        return NotificationPermissionStatus.UNAVAILABLE;
      default:
        return NotificationPermissionStatus.NOT_REQUESTED;
    }
  }

  /**
   * Checks current notification permission status
   */
  async checkPermissionStatus(): Promise<NotificationPermissionStatus> {
    try {
      if (Platform.OS === 'ios') {
        // For iOS, we use requestNotifications to get permission status
        // Since there's no direct check for notifications, we'll check if it's been requested
        const hasBeenRequested = await this.hasPermissionBeenRequested();
        if (!hasBeenRequested) {
          return NotificationPermissionStatus.NOT_REQUESTED;
        } else {
          // If it has been requested, we need to determine current status
          // This will be handled by the requestNotifications call
          return NotificationPermissionStatus.NOT_REQUESTED;
        }
      } else {
        // For Android API 33+, check POST_NOTIFICATIONS permission
        const result = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS as any,
        );
        return result ? NotificationPermissionStatus.GRANTED : NotificationPermissionStatus.DENIED;
      }
    } catch (error) {
      console.error('Error checking notification permission:', error);
      return NotificationPermissionStatus.UNAVAILABLE;
    }
  }

  /**
   * Gets the count of times permission has been denied
   */
  private async getPermissionDeniedCount(): Promise<number> {
    try {
      const count = await AsyncStorage.getItem(
        NotificationPermissionManager.PERMISSION_DENIED_COUNT_KEY,
      );
      return count ? parseInt(count, 10) : 0;
    } catch (error) {
      console.error('Error getting permission denied count:', error);
      return 0;
    }
  }

  /**
   * Increments the permission denied count
   */
  private async incrementPermissionDeniedCount(): Promise<void> {
    try {
      const currentCount = await this.getPermissionDeniedCount();
      await AsyncStorage.setItem(
        NotificationPermissionManager.PERMISSION_DENIED_COUNT_KEY,
        (currentCount + 1).toString(),
      );
    } catch (error) {
      console.error('Error incrementing permission denied count:', error);
    }
  }

  /**
   * Checks if we can still ask for permission based on denial count
   */
  private async canAskForPermission(): Promise<boolean> {
    const deniedCount = await this.getPermissionDeniedCount();
    return deniedCount < NotificationPermissionManager.MAX_PERMISSION_REQUESTS;
  }

  /**
   * Shows a custom permission rationale dialog
   */
  private showPermissionRationale(): Promise<boolean> {
    return new Promise(resolve => {
      // If custom dialog is configured, use it
      if (this.customPermissionDialog && this.showCustomDialog) {
        const CustomDialog = this.customPermissionDialog;
        const dialogElement = React.createElement(CustomDialog, {
          title: strings('notificationPermission.title'),
          message: strings('notificationPermission.message'),
          allowText: strings('notificationPermission.allowNotifications'),
          notNowText: strings('notificationPermission.notNow'),
          onAllow: () => {
            this.hideCustomDialog?.();
            resolve(true);
          },
          onNotNow: () => {
            this.hideCustomDialog?.();
            resolve(false);
          },
        });

        this.showCustomDialog(dialogElement).catch(() => {
          // If custom dialog fails, fallback to native alert
          Alert.alert(
            strings('notificationPermission.title'),
            strings('notificationPermission.message'),
            [
              {
                text: strings('notificationPermission.notNow'),
                onPress: () => resolve(false),
                style: 'cancel',
              },
              {
                text: strings('notificationPermission.allowNotifications'),
                onPress: () => resolve(true),
              },
            ],
            {cancelable: false},
          );
        });
      } else {
        // Fallback to native Alert
        Alert.alert(
          strings('notificationPermission.title'),
          strings('notificationPermission.message'),
          [
            {
              text: strings('notificationPermission.notNow'),
              onPress: () => resolve(false),
              style: 'cancel',
            },
            {
              text: strings('notificationPermission.allowNotifications'),
              onPress: () => resolve(true),
            },
          ],
          {cancelable: false},
        );
      }
    });
  }

  /**
   * Shows settings redirect dialog when permission is blocked
   */
  private showSettingsDialog(): Promise<boolean> {
    return new Promise(resolve => {
      // If custom dialog is configured, use it
      if (this.customSettingsDialog && this.showCustomDialog) {
        const CustomDialog = this.customSettingsDialog;
        const dialogElement = React.createElement(CustomDialog, {
          title: strings('notificationPermission.settingsTitle'),
          message: strings('notificationPermission.settingsMessage'),
          goToSettingsText: strings('notificationPermission.goToSettings'),
          cancelText: strings('notificationPermission.cancel'),
          onGoToSettings: () => {
            this.hideCustomDialog?.();
            // Open device settings - you can customize this
            resolve(true);
          },
          onCancel: () => {
            this.hideCustomDialog?.();
            resolve(false);
          },
        });

        this.showCustomDialog(dialogElement).catch(() => {
          // If custom dialog fails, fallback to native alert
          Alert.alert(
            strings('notificationPermission.settingsTitle'),
            strings('notificationPermission.settingsMessage'),
            [
              {
                text: strings('notificationPermission.cancel'),
                onPress: () => resolve(false),
                style: 'cancel',
              },
              {
                text: strings('notificationPermission.goToSettings'),
                onPress: () => {
                  // Open device settings - you can customize this
                  resolve(true);
                },
              },
            ],
            {cancelable: false},
          );
        });
      } else {
        // Fallback to native Alert
        Alert.alert(
          strings('notificationPermission.settingsTitle'),
          strings('notificationPermission.settingsMessage'),
          [
            {
              text: strings('notificationPermission.cancel'),
              onPress: () => resolve(false),
              style: 'cancel',
            },
            {
              text: strings('notificationPermission.goToSettings'),
              onPress: () => {
                // Open device settings - you can customize this
                resolve(true);
              },
            },
          ],
          {cancelable: false},
        );
      }
    });
  }

  /**
   * Requests notification permission from the system
   */
  private async requestSystemPermission(): Promise<NotificationPermissionStatus> {
    try {
      if (Platform.OS === 'ios') {
        // Use react-native-permissions to request iOS notification permission
        const {status} = await requestNotifications(['alert', 'sound', 'badge']);
        return this.mapPermissionResult(status);
      } else {
        // For Android API 33+, request POST_NOTIFICATIONS permission
        const result = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS as any,
        );
        return this.mapPermissionResult(result);
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return NotificationPermissionStatus.UNAVAILABLE;
    }
  }

  /**
   * Main method to request notification permissions with proper flow
   */
  async requestPermissions(): Promise<NotificationPermissionResult> {
    try {
      // Check current permission status
      const currentStatus = await this.checkPermissionStatus();

      // If already granted, return immediately
      if (currentStatus === NotificationPermissionStatus.GRANTED) {
        return {
          status: currentStatus,
          canAskAgain: false,
        };
      }

      // If permission is blocked, show settings dialog
      if (currentStatus === NotificationPermissionStatus.BLOCKED) {
        await this.showSettingsDialog();
        return {
          status: currentStatus,
          canAskAgain: false,
        };
      }

      // Check if we can still ask for permission
      const canAsk = await this.canAskForPermission();
      if (!canAsk) {
        return {
          status: currentStatus,
          canAskAgain: false,
        };
      }

      // Show permission rationale
      const userWantsToGrant = await this.showPermissionRationale();
      if (!userWantsToGrant) {
        await this.incrementPermissionDeniedCount();
        return {
          status: NotificationPermissionStatus.DENIED,
          canAskAgain: await this.canAskForPermission(),
        };
      }

      // Request system permission
      const systemResult = await this.requestSystemPermission();

      // If denied, increment counter
      if (systemResult === NotificationPermissionStatus.DENIED) {
        await this.incrementPermissionDeniedCount();
      }

      // Mark that we've asked for permission
      await AsyncStorage.setItem(NotificationPermissionManager.PERMISSION_STORAGE_KEY, 'true');

      return {
        status: systemResult,
        canAskAgain: await this.canAskForPermission(),
      };
    } catch (error) {
      console.error('Error in requestPermissions:', error);
      return {
        status: NotificationPermissionStatus.UNAVAILABLE,
        canAskAgain: false,
      };
    }
  }

  /**
   * Checks if permission has been requested before
   */
  async hasPermissionBeenRequested(): Promise<boolean> {
    try {
      const hasBeenAsked = await AsyncStorage.getItem(
        NotificationPermissionManager.PERMISSION_STORAGE_KEY,
      );
      return hasBeenAsked === 'true';
    } catch (error) {
      console.error('Error checking if permission was requested:', error);
      return false;
    }
  }

  /**
   * Resets permission request tracking (useful for testing or fresh starts)
   */
  async resetPermissionTracking(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        NotificationPermissionManager.PERMISSION_STORAGE_KEY,
        NotificationPermissionManager.PERMISSION_DENIED_COUNT_KEY,
      ]);
    } catch (error) {
      console.error('Error resetting permission tracking:', error);
    }
  }

  /**
   * Checks if we should show permission request based on business logic
   */
  async shouldShowPermissionRequest(): Promise<boolean> {
    const currentStatus = await this.checkPermissionStatus();
    const hasBeenRequested = await this.hasPermissionBeenRequested();
    const canAsk = await this.canAskForPermission();

    // Don't show if already granted or unavailable
    if (
      currentStatus === NotificationPermissionStatus.GRANTED ||
      currentStatus === NotificationPermissionStatus.UNAVAILABLE
    ) {
      return false;
    }

    // Don't show if blocked
    if (currentStatus === NotificationPermissionStatus.BLOCKED) {
      return false;
    }

    // Don't show if we've exceeded max requests
    if (!canAsk) {
      return false;
    }

    // Show if not requested before or if denied but can still ask
    return !hasBeenRequested || (currentStatus === NotificationPermissionStatus.DENIED && canAsk);
  }

  /**
   * Gets permission status with additional context
   */
  async getPermissionStatusWithContext(): Promise<{
    status: NotificationPermissionStatus;
    hasBeenRequested: boolean;
    canAskAgain: boolean;
    deniedCount: number;
  }> {
    const status = await this.checkPermissionStatus();
    const hasBeenRequested = await this.hasPermissionBeenRequested();
    const canAskAgain = await this.canAskForPermission();
    const deniedCount = await this.getPermissionDeniedCount();

    return {
      status,
      hasBeenRequested,
      canAskAgain,
      deniedCount,
    };
  }
}

export default NotificationPermissionManager.getInstance();
