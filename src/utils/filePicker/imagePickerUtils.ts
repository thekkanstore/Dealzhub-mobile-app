import {
  launchImageLibrary,
  launchCamera,
  ImagePickerResponse,
  MediaType,
} from 'react-native-image-picker';
import {showErrorToast} from '../common/toastUtils';
import {FilePickerResult, FilePickerOptions} from './filePickerTypes';
import {checkFilePickerPermissions, handlePermissionDenied} from './permissionUtils';
import {validateFileSize} from './fileSizeValidation';

const validateImageFile = (
  file: any,
  options: FilePickerOptions,
): {isValid: boolean; errorMessage?: string} => {
  // Check file size using the new validation utility
  if (file.fileSize) {
    const sizeValidation = validateFileSize(file.fileSize, options);
    if (!sizeValidation.isValid) {
      return {isValid: false, errorMessage: sizeValidation.errorMessage};
    }
  }
  // Check file type for images
  if (file.type && file.type.startsWith('image/')) {
    if (!options.allowedTypes?.includes('image')) {
      showErrorToast('Image files are not allowed');
      return {isValid: false, errorMessage: 'Image files are not allowed'};
    }
  }
  return {isValid: true};
};

export const pickImageFromCamera = async (
  options: FilePickerOptions,
  onSuccess: (file: FilePickerResult) => void,
  onError: (error: string) => void,
): Promise<void> => {
  try {
    // On iOS, react-native-image-picker handles permissions automatically
    // We'll trust that the UI component has already handled permission requests
    const pickerOptions = {
      mediaType: 'photo' as MediaType,
      quality: options.imageQuality || 0.8,
      maxWidth: options.maxImageWidth || 1920,
      maxHeight: options.maxImageHeight || 1920,
      includeBase64: false,
    };

    console.log('Launching camera with options:', pickerOptions);

    launchCamera(pickerOptions, (response: ImagePickerResponse) => {
      console.log('Camera response:', response);
      
      if (response.didCancel) {
        onError('Image picking canceled');
        return;
      }

      if (response.errorMessage) {
        console.error('Camera error:', response.errorMessage);
        onError(`Failed to pick image: ${response.errorMessage}`);
        return;
      }

      if (response.assets && response.assets[0]) {
        const asset = response.assets[0];
        console.log('Camera asset:', asset);
        
        const isValidImage = validateImageFile(asset, options);
        if (!isValidImage.isValid) {
          onError(isValidImage.errorMessage || 'Invalid image file');
          return;
        }

        const fileResult: FilePickerResult = {
          uri: asset.uri || '',
          name: asset.fileName || `image_${Date.now()}.jpg`,
          type: asset.type || 'image/jpeg',
          size: asset.fileSize || 0,
          path: asset.uri,
        };

        console.log('Camera success:', fileResult);
        onSuccess(fileResult);
      } else {
        onError('No image selected');
      }
    });
  } catch (error) {
    console.error('Camera picker error:', error);
    onError('Failed to pick image');
  }
};

export const pickImageFromGallery = async (
  options: FilePickerOptions,
  onSuccess: (file: FilePickerResult) => void,
  onError: (error: string) => void,
): Promise<void> => {
  try {
    const hasPermission = await checkFilePickerPermissions('gallery');
    if (!hasPermission) {
      handlePermissionDenied('gallery', onError);
      return;
    }

    const pickerOptions = {
      mediaType: 'photo' as MediaType,
      quality: options.imageQuality || 0.8,
      maxWidth: options.maxImageWidth || 1920,
      maxHeight: options.maxImageHeight || 1920,
      includeBase64: false,
    };

    launchImageLibrary(pickerOptions, (response: ImagePickerResponse) => {
      if (response.didCancel) {
        onError('Image picking canceled');
        return;
      }

      if (response.errorMessage) {
        onError(`Failed to pick image: ${response.errorMessage}`);
        return;
      }

      if (response.assets && response.assets[0]) {
        const asset = response.assets[0];

        const isValidImage = validateImageFile(asset, options);
        if (!isValidImage.isValid) {
          onError(isValidImage.errorMessage || 'Invalid image file');
          return;
        }

        const fileResult: FilePickerResult = {
          uri: asset.uri || '',
          name: asset.fileName || `image_${Date.now()}.jpg`,
          type: asset.type || 'image/jpeg',
          size: asset.fileSize || 0,
          path: asset.uri,
        };

        onSuccess(fileResult);
      }
    });
  } catch (error) {
    onError('Failed to pick image');
  }
};
