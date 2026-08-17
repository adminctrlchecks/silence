/**
 * Minimal ambient types for the Google Identity Services client script
 * (https://accounts.google.com/gsi/client), loaded via next/script in
 * GoogleSignInButton. Only the surface we actually call is typed.
 */
export {};

interface GoogleCredentialResponse {
  credential: string;
  select_by?: string;
}

interface GoogleIdConfiguration {
  client_id: string;
  callback: (response: GoogleCredentialResponse) => void;
  auto_select?: boolean;
  itp_support?: boolean;
  use_fedcm_for_prompt?: boolean;
}

interface GooglePromptMomentNotification {
  isDisplayMoment: () => boolean;
  isDisplayed: () => boolean;
  isNotDisplayed: () => boolean;
  isSkippedMoment: () => boolean;
  isDismissedMoment: () => boolean;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: GoogleIdConfiguration) => void;
          prompt: (momentListener?: (notification: GooglePromptMomentNotification) => void) => void;
          cancel: () => void;
        };
      };
    };
  }
}
