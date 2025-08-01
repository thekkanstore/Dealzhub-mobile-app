import React, {useEffect, useRef, useState} from 'react';
import {useNotificationPermission} from '../../hooks/useNotificationPermission';
import notificationPermissionManager, {
  NotificationPermissionStatus,
} from '../../utils/notifictiaon/notificationPermissionManager';
import {
  TKModalPermissionDialog,
  TKModalSettingsDialog,
} from '../TKCustomNotificationDialogs/TKPermissionModals';
import {hideDialog, showDialog} from '../TKGlobalModalManager/TKGlobalModalManager';

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

  useEffect(() => {
    // Only trigger callbacks if user has interacted and permission status has changed from initial
    if (hasUserInteracted && initialPermissionStatus.current !== permissionStatus) {
      if (permissionStatus === NotificationPermissionStatus.GRANTED) {
        onPermissionGranted?.();
      } else if (
        permissionStatus === NotificationPermissionStatus.DENIED ||
        permissionStatus === NotificationPermissionStatus.BLOCKED
      ) {
        onPermissionDenied?.();
      }
    }
  }, [permissionStatus, onPermissionGranted, onPermissionDenied, hasUserInteracted]);

  return null;
};
