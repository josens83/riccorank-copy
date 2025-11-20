'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';

declare global {
  interface Window {
    Intercom: any;
    intercomSettings: any;
  }
}

export default function IntercomChat() {
  const { data: session } = useSession();

  useEffect(() => {
    const appId = process.env.NEXT_PUBLIC_INTERCOM_APP_ID;

    if (!appId) {
      console.warn('Intercom App ID not configured');
      return;
    }

    // Load Intercom script
    const script = document.createElement('script');
    script.innerHTML = `
      (function(){var w=window;var ic=w.Intercom;if(typeof ic==="function"){ic('reattach_activator');ic('update',w.intercomSettings);}else{var d=document;var i=function(){i.c(arguments);};i.q=[];i.c=function(args){i.q.push(args);};w.Intercom=i;var l=function(){var s=d.createElement('script');s.type='text/javascript';s.async=true;s.src='https://widget.intercom.io/widget/${appId}';var x=d.getElementsByTagName('script')[0];x.parentNode.insertBefore(s,x);};if(document.readyState==='complete'){l();}else if(w.attachEvent){w.attachEvent('onload',l);}else{w.addEventListener('load',l,false);}}})();
    `;
    document.body.appendChild(script);

    // Configure Intercom
    const intercomSettings: any = {
      app_id: appId,
      alignment: 'right',
      horizontal_padding: 20,
      vertical_padding: 20,
    };

    // Add user data if logged in
    if (session?.user) {
      intercomSettings.user_id = session.user.id;
      intercomSettings.name = session.user.name;
      intercomSettings.email = session.user.email;
      intercomSettings.created_at = Math.floor(new Date().getTime() / 1000);

      // Add custom attributes
      if (session.user.role) {
        intercomSettings.role = session.user.role;
      }
    }

    window.intercomSettings = intercomSettings;

    // Initialize Intercom
    if (window.Intercom) {
      window.Intercom('boot', intercomSettings);
    }

    // Cleanup
    return () => {
      if (window.Intercom) {
        window.Intercom('shutdown');
      }
    };
  }, [session]);

  return null; // Intercom widget is injected by script
}

/**
 * Show Intercom messenger
 */
export function showIntercom() {
  if (window.Intercom) {
    window.Intercom('show');
  }
}

/**
 * Hide Intercom messenger
 */
export function hideIntercom() {
  if (window.Intercom) {
    window.Intercom('hide');
  }
}

/**
 * Show new message in Intercom
 */
export function showIntercomNewMessage(message?: string) {
  if (window.Intercom) {
    window.Intercom('showNewMessage', message);
  }
}

/**
 * Track event in Intercom
 */
export function trackIntercomEvent(eventName: string, metadata?: Record<string, any>) {
  if (window.Intercom) {
    window.Intercom('trackEvent', eventName, metadata);
  }
}

/**
 * Update Intercom user data
 */
export function updateIntercomUser(data: Record<string, any>) {
  if (window.Intercom) {
    window.Intercom('update', data);
  }
}
