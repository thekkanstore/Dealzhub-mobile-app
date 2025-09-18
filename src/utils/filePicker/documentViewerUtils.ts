import {viewDocument} from '@react-native-documents/viewer';
import {Linking} from 'react-native';
import {showErrorToast} from '../common/toastUtils';
import {strings} from '../language/langauageUtils';

export const openDocumentViewer = async (fileUri: string, mimeType?: string): Promise<void> => {
  try {
    // For S3 URLs, try to determine MIME type from URL or default based on context
    let finalMimeType = mimeType;
    if (!finalMimeType) {
      if (fileUri.includes('.pdf')) {
        finalMimeType = 'application/pdf';
      } else if (fileUri.includes('.jpg') || fileUri.includes('.jpeg')) {
        finalMimeType = 'image/jpeg';
      } else if (fileUri.includes('.png')) {
        finalMimeType = 'image/png';
      } else if (fileUri.includes('s3.amazonaws.com')) {
        // For S3 URLs without extension, try PDF first
        finalMimeType = 'application/pdf';
      } else {
        finalMimeType = 'application/pdf';
      }
    }

    try {
      await viewDocument({
        uri: fileUri,
        mimeType: finalMimeType,
      });
    } catch (viewerError) {
      // Fallback: Open in external browser for S3 URLs
      const canOpen = await Linking.canOpenURL(fileUri);
      if (canOpen) {
        await Linking.openURL(fileUri);
      } else {
        throw new Error('Cannot open document');
      }
    }
  } catch (error) {
    console.error('Error opening document viewer:', error);
    showErrorToast(strings('error.unableToOpenDocumentViewer'));
  }
};
