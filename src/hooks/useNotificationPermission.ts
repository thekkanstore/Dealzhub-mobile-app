import {useState, useEffect, useCallback} from 'react';
import notificationPermissionManager, {
  NotificationPermissionStatus,
} from '../utils/notifictiaon/notificationPermissionManager';

interface UseNotificationPermissionResult {
  permissionStatus: NotificationPermissionStatus;
  isLoading: boolean;
  requestPermission: () => Promise<void>;
  checkPermission: () => Promise<void>;
  shouldShowRequest: boolean;
  canAskAgain: boolean;
  hasBeenRequested: boolean;
  deniedCount: number;
}

export const useNotificationPermission = (): UseNotificationPermissionResult => {
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermissionStatus>(
    NotificationPermissionStatus.NOT_REQUESTED,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [shouldShowRequest, setShouldShowRequest] = useState(false);
  const [canAskAgain, setCanAskAgain] = useState(true);
  const [hasBeenRequested, setHasBeenRequested] = useState(false);
  const [deniedCount, setDeniedCount] = useState(0);

  const checkPermission = useCallback(async () => {
    setIsLoading(true);
    try {
      const contextResult = await notificationPermissionManager.getPermissionStatusWithContext();

      setPermissionStatus(contextResult.status);
      setHasBeenRequested(contextResult.hasBeenRequested);
      setCanAskAgain(contextResult.canAskAgain);
      setDeniedCount(contextResult.deniedCount);

      const shouldShow = await notificationPermissionManager.shouldShowPermissionRequest();
      setShouldShowRequest(shouldShow);
    } catch (error) {
      console.error('Error checking notification permission:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await notificationPermissionManager.requestPermissions();
      setPermissionStatus(result.status);
      setCanAskAgain(result.canAskAgain);

      // Refresh the context after permission request
      const contextResult = await notificationPermissionManager.getPermissionStatusWithContext();
      setHasBeenRequested(contextResult.hasBeenRequested);
      setDeniedCount(contextResult.deniedCount);

      const shouldShow = await notificationPermissionManager.shouldShowPermissionRequest();
      setShouldShowRequest(shouldShow);
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Check permission status on mount
  useEffect(() => {
    checkPermission();
  }, [checkPermission]);

  return {
    permissionStatus,
    isLoading,
    requestPermission,
    checkPermission,
    shouldShowRequest,
    canAskAgain,
    hasBeenRequested,
    deniedCount,
  };
};
