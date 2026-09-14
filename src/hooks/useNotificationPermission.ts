import { useCallback, useEffect, useState } from 'react';

export type NotificationStatus = 'unsupported' | 'default' | 'granted' | 'denied';

function readStatus(): NotificationStatus {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported';
  return Notification.permission as NotificationStatus;
}

/**
 * Reports the browser notification permission. Never prompts on load —
 * request() must be called from a user gesture.
 */
export function useNotificationPermission() {
  const [status, setStatus] = useState<NotificationStatus>('unsupported');

  useEffect(() => {
    setStatus(readStatus());
  }, []);

  const request = useCallback(async (): Promise<NotificationStatus> => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      setStatus('unsupported');
      return 'unsupported';
    }
    try {
      const result = (await Notification.requestPermission()) as NotificationStatus;
      setStatus(result);
      return result;
    } catch {
      const current = readStatus();
      setStatus(current);
      return current;
    }
  }, []);

  return { status, request, supported: status !== 'unsupported' };
}
