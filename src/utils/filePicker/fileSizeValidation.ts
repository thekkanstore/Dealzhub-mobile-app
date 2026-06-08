import {FilePickerOptions} from './filePickerTypes';

/**
 * Validates file size against min and max limits
 * @param fileSizeInBytes - File size in bytes
 * @param options - File picker options containing size limits
 * @returns Object with isValid boolean and error message if invalid
 */
export const validateFileSize = (
  fileSizeInBytes: number,
  options: FilePickerOptions,
): {isValid: boolean; errorMessage?: string} => {
  const fileSizeInMB = fileSizeInBytes / (1024 * 1024);
  // Check minimum size
  if (options.minSizeInMB && fileSizeInMB < options.minSizeInMB) {
    return {
      isValid: false,
      errorMessage: `File size must be at least ${options.minSizeInMB}MB`,
    };
  }

  // Check maximum size
  if (options.maxSizeInMB && fileSizeInMB > options.maxSizeInMB) {
    return {
      isValid: false,
      errorMessage: `File size exceeds ${options.maxSizeInMB}MB limit`,
    };
  }
  return {isValid: true};
};

/**
 * Formats file size for display
 * @param sizeInBytes - File size in bytes
 * @returns Formatted string (e.g., "2.5 MB", "150 KB")
 */
export const formatFileSize = (sizeInBytes: number): string => {
  if (sizeInBytes < 1024) {
    return `${sizeInBytes} B`;
  } else if (sizeInBytes < 1024 * 1024) {
    return `${(sizeInBytes / 1024).toFixed(1)} KB`;
  } else {
    return `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`;
  }
};
