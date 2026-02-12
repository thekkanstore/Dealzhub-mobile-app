declare module 'react-native-view-shot' {
  import {RefObject} from 'react';

  export interface CaptureOptions {
    format?: 'png' | 'jpg' | 'webm' | 'raw';
    quality?: number;
    result?: 'tmpfile' | 'base64' | 'data-uri' | 'zip-base64';
    snapshotContentContainer?: boolean;
  }

  export function captureRef<T = any>(
    view: RefObject<T> | T,
    options?: CaptureOptions,
  ): Promise<string>;

  export function captureScreen(options?: CaptureOptions): Promise<string>;
}

