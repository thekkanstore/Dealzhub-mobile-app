declare module 'react-native-share' {
  export interface ShareOptions {
    title?: string;
    message?: string;
    url?: string;
    urls?: string[];
    type?: string;
    subject?: string;
    email?: string;
    recipient?: string;
    excludedActivityTypes?: string[];
    failOnCancel?: boolean;
    showAppsToView?: boolean;
    filename?: string;
    saveToFiles?: boolean;
  }

  export interface ShareSingleOptions extends ShareOptions {
    social: string;
    forceDialog?: boolean;
  }

  export default class Share {
    static open(options: ShareOptions): Promise<{success: boolean; message?: string}>;
    static shareSingle(options: ShareSingleOptions): Promise<{success: boolean; message?: string}>;
  }
}

