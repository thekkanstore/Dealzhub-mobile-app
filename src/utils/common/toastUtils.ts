import Toast from 'react-native-toast-message';

export const showErrorToast = (message: string) => {
  try {
    Toast.show({
      type: 'customError',
      text1: message,
      position: 'top',
      visibilityTime: 2000,
      autoHide: true,
      topOffset: 30,
    });
  } catch (error) {
    // Do nothing on error
  }
};

export const showSuccessToast = (message: string) => {
  try {
    // Add a small delay to ensure UI is ready
    setTimeout(() => {
      Toast.show({
        type: 'customSuccess',
        text1: message,
        position: 'top',
        visibilityTime: 3000, // Increased visibility time
        autoHide: true,
        topOffset: 50, // Increased offset
      });
    }, 100);
  } catch (error) {
    // Do nothing on error
  }
};

export const testToast = () => {
  showErrorToast('Test Error Toast');
};

export const testSuccessToast = () => {
  showSuccessToast('Test Success Toast');
};

export const errorHandler = (error: any) => {
  const errorMessage =
    error?.response?.data?.message || error?.response?.data?.error || 'Something went wrong';
  showErrorToast(errorMessage);
};
