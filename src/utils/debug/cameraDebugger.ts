import {Platform, Alert} from 'react-native';
import {launchCamera, MediaType} from 'react-native-image-picker';
import {check, request, PERMISSIONS, RESULTS} from 'react-native-permissions';

export const testCameraDirectly = () => {
  console.log('=== TESTING CAMERA DIRECTLY ===');

  const options = {
    mediaType: 'photo' as MediaType,
    quality: 0.8,
    maxWidth: 1920,
    maxHeight: 1920,
    includeBase64: false,
  };

  launchCamera(options, response => {
    console.log('Direct camera response:', response);

    if (response.didCancel) {
      console.log('User canceled camera');
      Alert.alert('Camera', 'User canceled camera');
    } else if (response.errorMessage) {
      console.log('Camera error:', response.errorMessage);
      Alert.alert('Camera Error', response.errorMessage);
    } else if (response.assets && response.assets[0]) {
      console.log('Camera success:', response.assets[0]);
      Alert.alert('Camera Success', `Got image: ${response.assets[0].fileName}`);
    } else {
      console.log('Unknown camera response');
      Alert.alert('Camera', 'Unknown response');
    }
  });
};

export const checkCameraPermissionStatus = async () => {
  if (Platform.OS !== 'ios') return;

  try {
    const status = await check(PERMISSIONS.IOS.CAMERA);
    console.log('Current camera permission status:', status);

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
    console.log('Camera permission request result:', result);

    Alert.alert('Permission Result', `Result: ${result}`, [
      {text: 'OK'},
      {text: 'Test Camera', onPress: testCameraDirectly},
    ]);
  } catch (error) {
    console.error('Error requesting camera permission:', error);
  }
};
