import React, {useEffect, useRef, useState} from 'react';
import Toast from 'react-native-toast-message';
import notifee from '@notifee/react-native';
import {useNotificationPermission} from '../../hooks/useNotificationPermission';
import notificationPermissionManager, {
  NotificationPermissionStatus,
} from '../../utils/notifictiaon/notificationPermissionManager';
import {
  TKModalPermissionDialog,
  TKModalSettingsDialog,
} from '../TKCustomNotificationDialogs/TKPermissionModals';
import {hideDialog, showDialog} from '../TKGlobalModalManager/TKGlobalModalManager';
import messaging from '@react-native-firebase/messaging';
import {useAppSelector} from '../../redux/hooks';

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
  console.log('Permission status:>>', permissionStatus);

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
    if (autoRequestOnMount && shouldShowRequest) {
      // Mark that user interaction will occur
      setHasUserInteracted(true);
      requestPermission();
    }
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
        console.log('Showing toast for notification:', remoteMessage.notification);
        Toast.show({
          type: 'success',
          text1: remoteMessage.notification.title || 'Notification',
          text2: remoteMessage.notification.body || 'You have a new message',
          visibilityTime: 4000,
          autoHide: true,
          topOffset: 60,
        });
        await notifee.displayNotification({
          title: 'remoteMessage.notification.title',
          body: ' remoteMessage.notification.body',
          android: {
            channelId: 'default',
          },
        });
      } else if (remoteMessage.data) {
        // Handle data-only messages
        console.log('Showing toast for data message:', remoteMessage.data);
        Toast.show({
          type: 'info',
          text1: (remoteMessage.data.title as string) || 'Data Message',
          text2: (remoteMessage.data.body as string) || 'You have a new data message',
          visibilityTime: 4000,
          autoHide: true,
          topOffset: 60,
        });
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
  useEffect(() => {
    // Only trigger callbacks if user has interacted and permission status has changed from initial
    if (
      (hasUserInteracted || isShowNotificationPermissionModal) &&
      initialPermissionStatus.current !== permissionStatus
    ) {
      if (permissionStatus === NotificationPermissionStatus.GRANTED) {
        tokenStatus();
        onPermissionGranted?.();
      } else if (
        permissionStatus === NotificationPermissionStatus.DENIED ||
        permissionStatus === NotificationPermissionStatus.BLOCKED
      ) {
        onPermissionDenied?.();
      }
    }
  }, [
    permissionStatus,
    onPermissionGranted,
    onPermissionDenied,
    hasUserInteracted,
    isShowNotificationPermissionModal,
  ]);

  return null;
};
