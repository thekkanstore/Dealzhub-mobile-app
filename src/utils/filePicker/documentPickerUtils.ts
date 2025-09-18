import {pick, types, keepLocalCopy} from '@react-native-documents/picker';
import ReactNativeBlobUtil from 'react-native-blob-util';
import {FilePickerResult, FilePickerOptions} from './filePickerTypes';
import {checkFilePickerPermissions, handlePermissionDenied} from './permissionUtils';
import {validateFileSize} from './fileSizeValidation';

const processVirtualFile = async (
  file: any,
  finalName: string,
): Promise<{uri: string; name: string}> => {
  const convertibleToMimeTypes = file.convertibleToMimeTypes;
  const virtualFileMeta =
    convertibleToMimeTypes.find((meta: any) => meta.mimeType === 'application/pdf') ||
    convertibleToMimeTypes[0];

  if (virtualFileMeta) {
    const fileName = `${finalName.split('.')[0]}.${virtualFileMeta.extension || 'pdf'}`;

    const copyResult = await keepLocalCopy({
      files: [
        {
          uri: file.uri,
          fileName: fileName,
          convertVirtualFileToType: virtualFileMeta.mimeType,
        },
      ],
      destination: 'cachesDirectory',
    });

    if (copyResult[0].status === 'success') {
      return {
        uri: copyResult[0].localUri,
        name: fileName,
      };
    } else {
      throw new Error('Failed to convert virtual file');
    }
  }

  throw new Error('No compatible format found');
};

const processContentUri = async (
  file: any,
  finalName: string,
): Promise<{uri: string; name: string}> => {
  const fileName = finalName || `document_${Date.now()}.pdf`;
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
  const cachePath = `${ReactNativeBlobUtil.fs.dirs.CacheDir}/${sanitizedFileName}`;

  try {
    // Use ReactNativeBlobUtil.fs.cp for content URIs instead of readFile
    // This properly handles content URIs and scoped storage restrictions
    await ReactNativeBlobUtil.fs.cp(file.uri, cachePath);
    return {
      uri: `file://${cachePath}`,
      name: sanitizedFileName,
    };
  } catch (error) {
    console.error('Error copying content URI:', error);
    return Promise.reject(error);
  }
};

export const pickDocument = async (
  options: FilePickerOptions,
  onSuccess: (file: FilePickerResult) => void,
  onError: (error: string) => void,
): Promise<void> => {
  try {
    // Check document permissions first
    const hasPermission = await checkFilePickerPermissions('documents');
    if (!hasPermission) {
      handlePermissionDenied('documents', onError);
      return;
    }

    // Configure allowed document types
    const documentTypes = [];
    const allowedTypes = options.allowedTypes || ['pdf'];

    if (allowedTypes.includes('pdf')) {
      documentTypes.push(types.pdf);
    }

    if (allowedTypes.includes('document')) {
      documentTypes.push(types.doc);
      documentTypes.push(types.docx);
      documentTypes.push(types.plainText);
    }

    if (allowedTypes.includes('image')) {
      documentTypes.push(types.images);
    }

    const result = await pick({
      type: documentTypes.length > 0 ? documentTypes : [types.allFiles],
      allowMultiSelection: false,
      allowVirtualFiles: true, // Allow virtual files like Google Drive documents
      copyTo: 'cachesDirectory', // Built-in copy to handle content URIs automatically
    });
    if (result && result[0]) {
      const file = result[0];

      // Validate file size using the new validation utility
      if (file.size) {
        const sizeValidation = validateFileSize(file.size, options);
        if (!sizeValidation.isValid) {
          onError(sizeValidation.errorMessage || 'Invalid file size');
          return;
        }
      }

      // Validate file type
      const isValidFileType = () => {
        if (allowedTypes.includes('image') && file.type?.includes('image')) {
          return true;
        }
        if (allowedTypes.includes('pdf') && file.type?.includes('pdf')) {
          return true;
        }
        if (
          allowedTypes.includes('document') &&
          (file.type?.includes('application/msword') ||
            file.type?.includes('application/vnd.openxmlformats') ||
            file.type?.includes('text/plain'))
        ) {
          return true;
        }
        return false;
      };

      if (!isValidFileType()) {
        const allowedTypesText = allowedTypes.join(', ');
        onError(`Only ${allowedTypesText} files are allowed`);
        return;
      }

      let finalUri = file.uri;
      let finalName = file.name || `document_${Date.now()}`;

      try {
        // Handle virtual files (Google Drive, etc.)
        if ((file as any).isVirtual && (file as any).convertibleToMimeTypes) {
          const result = await processVirtualFile(file, finalName);
          finalUri = result.uri;
          finalName = result.name;
        }
        // For regular content URIs, copy to cache directory as file
        else if (file.uri.startsWith('content://')) {
          const result = await processContentUri(file, finalName);
          finalUri = result.uri;
          finalName = result.name;
        }

        const fileResult: FilePickerResult = {
          uri: finalUri,
          name: finalName,
          type: file.type || 'application/pdf',
          size: file.size || 0,
          path: finalUri,
        };

        onSuccess(fileResult);
      } catch (processingError) {
        onError('Failed to process document. Please try a different file.');
      }
    }
  } catch (error) {
    onError('Failed to pick document');
  }
};
