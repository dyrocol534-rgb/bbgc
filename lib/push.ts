import webpush from 'web-push';

const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || 'BICpScIz-3HP8lngqryopgt9bjp6Obavx9t32UT8Ji9EbOQsMQXNGbhLWXnH9ajA7HX4Mvk0I3rEMlafCoFVXy8';
const privateKey = process.env.VAPID_PRIVATE_KEY || 'BVw5-mF03pupIWVFxsVz_uGyTEAIwvarMlghrREqkKU';
const subject = process.env.VAPID_SUBJECT || 'mailto:admin@bluebuff.in';

webpush.setVapidDetails(subject, publicKey, privateKey);

export interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  url?: string;
  data?: any;
}

export async function sendWebPush(subscription: webpush.PushSubscription, payload: PushPayload) {
  const notificationPayload = JSON.stringify({
    title: payload.title,
    body: payload.body,
    icon: payload.icon || '/logo.png',
    badge: payload.badge || '/logo.png',
    image: payload.image || undefined,
    url: payload.url || '/',
    data: {
      url: payload.url || '/',
      ...payload.data,
    },
  });

  return webpush.sendNotification(subscription, notificationPayload);
}

export { webpush };
