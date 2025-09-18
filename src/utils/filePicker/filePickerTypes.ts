import {PhotoQuality} from 'react-native-image-picker';

export interface FilePickerResult {
  uri?: string;
  name: string;
  type?: string;
  size?: number;
  path?: string;
  apiUri?: string;
  isVerified?: boolean | null;
}

export interface FilePickerOptions {
  allowedTypes?: ('image' | 'pdf' | 'document')[];
  maxSizeInMB?: number;
  minSizeInMB?: number;
  imageQuality?: PhotoQuality;
  maxImageWidth?: number;
  maxImageHeight?: number;
}

export type FilePickerType = 'camera' | 'gallery' | 'documents';
