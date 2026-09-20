import {Alert, Platform} from 'react-native';
import {launchCamera, MediaType, PhotoQuality} from 'react-native-image-picker';
import {check, PERMISSIONS, request} from 'react-native-permissions';

export const testCameraDirectly = () => {
  const options = {
    mediaType: 'photo' as MediaType,
    quality: 0.8 as PhotoQuality,
    maxWidth: 1920,
    maxHeight: 1920,
    includeBase64: false,
  };

  launchCamera(options, response => {
    if (response.didCancel) {
      Alert.alert('Camera', 'User canceled camera');
    } else if (response.errorMessage) {
      Alert.alert('Camera Error', response.errorMessage);
    } else if (response.assets && response.assets[0]) {
      Alert.alert('Camera Success', `Got image: ${response.assets[0].fileName}`);
    } else {
      Alert.alert('Camera', 'Unknown response');
    }
  });
};

export const checkCameraPermissionStatus = async () => {
  if (Platform.OS !== 'ios') return;

  try {
    const status = await check(PERMISSIONS.IOS.CAMERA);

    Alert.alert('Camera Permission Status', `Current status: ${status}`, [
      {text: 'OK'},
      {text: 'Request Permission', onPress: requestCameraPermission},
      {text: 'Test Camera', onPress: testCameraDirectly},
    ]);
  } catch (error) {
    console.error('Error checking camera permission:', error);
  }
};

export const requestCameraPermission = async () => {
  if (Platform.OS !== 'ios') return;

  try {
    const result = await request(PERMISSIONS.IOS.CAMERA);

    Alert.alert('Permission Result', `Result: ${result}`, [
      {text: 'OK'},
      {text: 'Test Camera', onPress: testCameraDirectly},
    ]);
  } catch (error) {
    console.error('Error requesting camera permission:', error);
  }
};
