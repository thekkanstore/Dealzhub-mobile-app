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
    const hasPermission = await checkFilePickerPermissions('camera');
    if (!hasPermission) {
      handlePermissionDenied('camera', onError);
      return;
    }
    const pickerOptions = {
      mediaType: 'photo' as MediaType,
      quality: options.imageQuality ?? 1,
      maxWidth: options.maxImageWidth ?? 1920,
      maxHeight: options.maxImageHeight ?? 1920,
      includeBase64: false,
    };

    launchCamera(pickerOptions, (response: ImagePickerResponse) => {
      if (response?.didCancel) {
        if (typeof onError === 'function') {
          onError('Image picking canceled');
        }
        return;
      }

      if (response?.errorMessage) {
        if (typeof onError === 'function') {
          onError(`Failed to pick image: ${response.errorMessage}`);
        }
        return;
      }

      if (response.assets && response.assets[0]) {
        const asset = response.assets[0];
        const isValidImage = validateImageFile(asset, options);
        if (!isValidImage.isValid) {
          if (typeof onError === 'function') {
            onError(isValidImage.errorMessage || 'Invalid image file');
          }
          return;
        }

        const fileResult: FilePickerResult = {
          uri: asset.uri || '',
          name: asset.fileName || `image_${Date.now()}.jpg`,
          type: asset.type || 'image/jpeg',
          size: asset.fileSize || 0,
          path: asset.uri,
        };
        if (typeof onSuccess === 'function') {
          onSuccess(fileResult);
        } else if (typeof onError === 'function') {
          onError('Invalid success callback');
        }
      } else {
        if (typeof onError === 'function') {
          onError('No image selected');
        }
      }
    });
  } catch (error) {
    if (typeof onError === 'function') {
      onError('Failed to pick image');
    }
  }
};

export const pickImageFromGallery = async (
  options: FilePickerOptions,
  onSuccess: (file: FilePickerResult) => void,
  onError: (error: string) => void,
  onSuccessMultiple?: (files: FilePickerResult[]) => void,
): Promise<void> => {
  try {
    const hasPermission = await checkFilePickerPermissions('gallery');
    if (!hasPermission) {
      handlePermissionDenied('gallery', onError);
      return;
    }

    const pickerOptions = {
      mediaType: 'photo' as MediaType,
      quality: options.imageQuality ?? 0.9,
      maxWidth: options.maxImageWidth ?? 1920,
      maxHeight: options.maxImageHeight ?? 1920,
      includeBase64: false,
      // Enable multi-select in gallery when allowed
      selectionLimit: options.allowMultiple ? Math.max(1, options.maxSelectable ?? 1) : 1,
    };

    launchImageLibrary(pickerOptions, (response: ImagePickerResponse) => {
      if (response.didCancel) {
        if (typeof onError === 'function') {
          onError('Image picking canceled');
        }
        return;
      }

      if (response.errorMessage) {
        if (typeof onError === 'function') {
          onError(`Failed to pick image: ${response.errorMessage}`);
        }
        return;
      }

      if (response.assets && response.assets.length) {
        // If multiple is allowed, return all selected files up to selectionLimit
        if (options.allowMultiple) {
          const files: FilePickerResult[] = [];
          for (const asset of response.assets) {
            const isValidImage = validateImageFile(asset, options);
            if (!isValidImage.isValid) {
              if (typeof onError === 'function') {
                onError(isValidImage.errorMessage || 'Invalid image file');
              }
              return;
            }

            files.push({
              uri: asset.uri || '',
              name: asset.fileName || `image_${Date.now()}.jpg`,
              type: asset.type || 'image/jpeg',
              size: asset.fileSize || 0,
              path: asset.uri,
            });
          }
          if (onSuccessMultiple) {
            onSuccessMultiple(files);
          } else if (files[0]) {
            if (typeof onSuccess === 'function') {
              onSuccess(files[0]);
            } else if (typeof onError === 'function') {
              onError('Invalid success callback');
            }
          } else {
            if (typeof onError === 'function') {
              onError('No image selected');
            }
          }
        } else {
          // Single selection behavior
          const asset = response.assets[0];
          const isValidImage = validateImageFile(asset, options);
          if (!isValidImage.isValid) {
            if (typeof onError === 'function') {
              onError(isValidImage.errorMessage || 'Invalid image file');
            }
            return;
          }

          const fileResult: FilePickerResult = {
            uri: asset.uri || '',
            name: asset.fileName || `image_${Date.now()}.jpg`,
            type: asset.type || 'image/jpeg',
            size: asset.fileSize || 0,
            path: asset.uri,
          };
          if (typeof onSuccess === 'function') {
            onSuccess(fileResult);
          } else if (typeof onError === 'function') {
            onError('Invalid success callback');
          }
        }
      } else {
        if (typeof onError === 'function') {
          onError('No image selected');
        }
      }
    });
  } catch (error) {
    if (typeof onError === 'function') {
      onError('Failed to pick image');
    }
  }
};
