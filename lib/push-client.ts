export function isPushSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
}

export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function getExistingSubscription(): Promise<PushSubscription | null> {
  if (!isPushSupported()) return null;
  try {
    let reg = await navigator.serviceWorker.getRegistration();
    if (!reg) {
      reg = await navigator.serviceWorker.register('/sw.js');
    }
    await navigator.serviceWorker.ready;
    return await reg.pushManager.getSubscription();
  } catch (err) {
    console.error('Error getting push subscription:', err);
    return null;
  }
}

export async function subscribeUserToPush(): Promise<{ success: boolean; subscription?: PushSubscription; error?: string }> {
  if (!isPushSupported()) {
    return { success: false, error: 'Push notifications are not supported by this browser.' };
  }

  try {
    // 1. Request Notification Permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      return { success: false, error: 'Notification permission was denied.' };
    }

    // 2. Fetch Public VAPID Key
    const res = await fetch('/api/notifications/public-key');
    const { publicKey } = await res.json();
    if (!publicKey) {
      return { success: false, error: 'Failed to retrieve server public key.' };
    }

    // 3. Register or get ServiceWorker
    let reg = await navigator.serviceWorker.getRegistration();
    if (!reg) {
      reg = await navigator.serviceWorker.register('/sw.js');
    }
    await navigator.serviceWorker.ready;

    const applicationServerKey = urlBase64ToUint8Array(publicKey);
    
    let subscription = await reg.pushManager.getSubscription();
    if (!subscription) {
      subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey as any,
      });
    }

    // 4. Determine device type
    const ua = navigator.userAgent;
    const deviceType = /Mobi|Android/i.test(ua) ? 'Mobile' : /Tablet|iPad/i.test(ua) ? 'Tablet' : 'Desktop';

    // 5. Send subscription to server
    await fetch('/api/notifications/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subscription: subscription.toJSON(),
        deviceType,
        userAgent: ua,
      }),
    });

    return { success: true, subscription };
  } catch (error: any) {
    console.error('Push subscribe error:', error);
    let errorMsg = error.message || 'Failed to subscribe to push notifications.';
    if (error.name === 'AbortError' || errorMsg.includes('push service error')) {
      errorMsg = 'Push service unreachable. If you are using Brave, enable "Use Google services for push messaging" in brave://settings/privacy, or check if an ad-blocker is blocking push services.';
    }
    return { success: false, error: errorMsg };
  }
}

export async function unsubscribeUserFromPush(): Promise<{ success: boolean; error?: string }> {
  if (!isPushSupported()) return { success: true };

  try {
    const reg = await navigator.serviceWorker.ready;
    const subscription = await reg.pushManager.getSubscription();

    if (subscription) {
      const endpoint = subscription.endpoint;
      await subscription.unsubscribe();

      await fetch('/api/notifications/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint }),
      });
    }

    return { success: true };
  } catch (error: any) {
    console.error('Push unsubscribe error:', error);
    return { success: false, error: error.message || 'Failed to unsubscribe.' };
  }
}
