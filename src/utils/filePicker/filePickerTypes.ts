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
  allowMultiple?: boolean; // optional, defaults to single selection
  maxSelectable?: number; // optional, defaults to 1
}

export type FilePickerType = 'camera' | 'gallery' | 'documents';
