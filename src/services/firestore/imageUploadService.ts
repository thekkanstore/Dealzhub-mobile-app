import storage from '@react-native-firebase/storage';
import {FilePickerResult} from '../../utils/filePicker/filePickerTypes';

export interface ImageUploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

export const firestoreImageUploadService = async (
  imageUri: string | undefined,
  folder = 'images',
): Promise<ImageUploadResult> => {
  try {
    // Validate input
    if (!imageUri || typeof imageUri !== 'string') {
      return {
        success: false,
        error: 'Invalid image URI provided',
      };
    }

    // Create a unique filename
    const filename = `${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
    const reference = storage().ref(`${folder}/${filename}`);

    // Upload the file
    const uploadTask = reference.putFile(imageUri);

    // Wait for upload to complete
    await uploadTask;

    // Get the download URL
    const downloadURL = await reference.getDownloadURL();

    return {
      success: true,
      url: downloadURL,
    };
  } catch (error: any) {
    let errorMessage = 'Failed to upload image';

    if (error.code === 'storage/unauthorized') {
      errorMessage = 'Unauthorized access to storage';
    } else if (error.code === 'storage/canceled') {
      errorMessage = 'Upload was canceled';
    } else if (error.code === 'storage/unknown') {
      errorMessage = 'Unknown storage error occurred';
    } else if (error.message) {
      errorMessage = error.message;
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
};

export const deleteImageFromStorage = async (imageUrl: string): Promise<boolean> => {
  try {
    if (!imageUrl || typeof imageUrl !== 'string') {
      console.error('Invalid image URL provided');
      return false;
    }

    const reference = storage().refFromURL(imageUrl);

    // Check if file exists before trying to delete
    try {
      await reference.getMetadata();
    } catch (metadataError: any) {
      if (metadataError.code === 'storage/object-not-found') {
        return true; // Consider it successful since the goal (file not existing) is achieved
      }
      throw metadataError;
    }

    await reference.delete();
    return true;
  } catch (error: any) {
    if (error.code === 'storage/object-not-found') {
      return true;
    }
    console.error('Error deleting image:', error);
    return false;
  }
};

export const checkImageExists = async (imageUrl: string): Promise<boolean> => {
  try {
    if (!imageUrl || typeof imageUrl !== 'string') {
      return false;
    }

    const reference = storage().refFromURL(imageUrl);
    await reference.getMetadata();
    return true;
  } catch (error: any) {
    if (error.code === 'storage/object-not-found') {
      return false;
    }
    console.error('Error checking if image exists:', error);
    return false;
  }
};

export const uploadFilePickerResult = async (
  file: FilePickerResult,
  folder = 'images',
): Promise<ImageUploadResult> => {
  try {
    // Check if we have a valid URI
    const imageUri = file.uri || file.path;

    if (!imageUri) {
      return {
        success: false,
        error: 'No valid file URI found in the file result',
      };
    }

    // Use the existing upload service
    return await firestoreImageUploadService(imageUri, folder);
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to upload file',
    };
  }
};
