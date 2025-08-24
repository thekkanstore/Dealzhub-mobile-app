import React, {useEffect, useRef, useState} from 'react';
import Toast from 'react-native-toast-message';
import notifee from '@notifee/react-native';
import {useNotificationPermission} from '../../../hooks/useNotificationPermission';
import notificationPermissionManager, {
  NotificationPermissionStatus,
} from '../../../utils/notifictiaon/notificationPermissionManager';
import {
  TKModalPermissionDialog,
  TKModalSettingsDialog,
} from '../TKCustomNotificationDialogs/TKPermissionModals';
import {hideDialog, showDialog} from '../TKGlobalModalManager/TKGlobalModalManager';
import messaging from '@react-native-firebase/messaging';
import {useAppSelector} from '../../../redux/hooks';

interface NotificationPermissionWithCustomDialogProps {
  onPermissionGranted?: () => void;
  onPermissionDenied?: () => void;
  autoRequestOnMount?: boolean;
}

export const TKNotificationPermissionHandler: React.FC<
  NotificationPermissionWithCustomDialogProps
> = ({onPermissionGranted, onPermissionDenied, autoRequestOnMount = true}) => {
  const {permissionStatus, requestPermission, shouldShowRequest} = useNotificationPermission();
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const initialPermissionStatus = useRef<NotificationPermissionStatus | null>(null);
  const isShowNotificationPermissionModal = useAppSelector(
    state => state.system.isShowNotificationPermission,
  );

  useEffect(() => {
    // Store initial permission status
    if (initialPermissionStatus.current === null) {
      initialPermissionStatus.current = permissionStatus;
    }
  }, [permissionStatus]);

  useEffect(() => {
    // Configure the notification permission manager to use custom dialogs
    notificationPermissionManager.configureCustomDialogs({
      permissionDialog: TKModalPermissionDialog,
      settingsDialog: TKModalSettingsDialog,
      showDialog,
      hideDialog,
    });
  }, []);

  useEffect(() => {
    setTimeout(() => {
      if (autoRequestOnMount && shouldShowRequest) {
        // Mark that user interaction will occur
        setHasUserInteracted(true);
        requestPermission();
      }
    }, 300);
  }, [autoRequestOnMount, shouldShowRequest, requestPermission]);

  // Set up notification handlers
  useEffect(() => {
    console.log('Setting up notification handlers, permission status:', permissionStatus);

    // Always set up the listener, not just when permission is granted
    // Handle foreground messages
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      console.log('Received foreground message:', remoteMessage);

      // Display notification when app is in foreground
      if (remoteMessage.notification) {
        // Show Notifee notification for better native experience
        try {
          await notifee.displayNotification({
            title: remoteMessage.notification.title || 'Notification',
            body: remoteMessage.notification.body || 'You have a new message',
            android: {
              channelId: 'default',
              smallIcon: 'ic_launcher',
              pressAction: {
                id: 'default',
              },
            },
            ios: {
              sound: 'default',
            },
          });
        } catch (error) {
          console.error('Failed to display Notifee notification:', error);
        }
      } else if (remoteMessage.data) {
        // Handle data-only messages
        console.log('Showing toast for data message:', remoteMessage.data);

        // Show Toast notification
        Toast.show({
          type: 'info',
          text1: (remoteMessage.data.title as string) || 'Data Message',
          text2: (remoteMessage.data.body as string) || 'You have a new data message',
          visibilityTime: 4000,
          autoHide: true,
          topOffset: 60,
        });

        // Show Notifee notification for data messages
        try {
          await notifee.displayNotification({
            title: (remoteMessage.data.title as string) || 'Data Message',
            body: (remoteMessage.data.body as string) || 'You have a new data message',
            android: {
              channelId: 'default',
              smallIcon: 'ic_launcher',
              pressAction: {
                id: 'default',
              },
            },
            ios: {
              sound: 'default',
            },
          });
        } catch (error) {
          console.error('Failed to display Notifee data notification:', error);
        }
      } else {
        console.log('No notification or data in message');
      }
    });

    // Handle notification opened from background/quit state
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          // Handle navigation or actions when app opens from notification
          console.log('App opened from notification:', remoteMessage);
        }
      });

    // Handle notification opened from background state
    const unsubscribeOnNotificationOpenedApp = messaging().onNotificationOpenedApp(
      remoteMessage => {
        // Handle navigation or actions when app opens from background notification
        console.log('App opened from background notification:', remoteMessage);
      },
    );

    return () => {
      unsubscribe();
      unsubscribeOnNotificationOpenedApp();
    };
  }, []);

  const tokenStatus = async () => {
    const token = await messaging().getToken();
    // Store or use the FCM token as needed
    console.log('FCM Token:', token);
    return token;
  };

  console.log(permissionStatus, 'permissionStatus');
  const initializeNotifee = async () => {
    try {
      // Request Notifee permissions
      await notifee.requestPermission();
      await notifee.createChannel({
        id: 'default',
        name: 'Default Channel',
        description: 'Default notification channel',
        importance: 4, // High importance
      });

      // Handle notification events
      const unsubscribeEvents = notifee.onForegroundEvent(({type, detail}) => {
        switch (type) {
          case 1: // PRESS
            console.log('User pressed notification', detail.notification);
            break;
          case 2: // DISMISS
            console.log('User dismissed notification', detail.notification);
            break;
        }
      });

      return unsubscribeEvents;
    } catch (error) {
      console.error('Failed to initialize Notifee:', error);
    }
  };

  useEffect(() => {
    // Only trigger callbacks if user has interacted and permission status has changed from initial
    let cleanup: Promise<(() => void) | undefined> | undefined;

    if (
      (hasUserInteracted || isShowNotificationPermissionModal) &&
      initialPermissionStatus.current !== permissionStatus
    ) {
      if (permissionStatus === NotificationPermissionStatus.GRANTED) {
        tokenStatus();
        cleanup = initializeNotifee();
        onPermissionGranted?.();
      } else if (
        permissionStatus === NotificationPermissionStatus.DENIED ||
        permissionStatus === NotificationPermissionStatus.BLOCKED
      ) {
        onPermissionDenied?.();
      }
    }

    return () => {
      cleanup?.then((unsubscribe: (() => void) | undefined) => {
        unsubscribe?.();
      });
    };
  }, [
    permissionStatus,
    onPermissionGranted,
    onPermissionDenied,
    hasUserInteracted,
    isShowNotificationPermissionModal,
  ]);

  return null;
};
