import {Platform} from 'react-native';
import {check, request, PERMISSIONS, RESULTS} from 'react-native-permissions';

export const debugPermissions = async () => {
  if (Platform.OS !== 'ios') {
    console.log('Permission Debug: Android platform detected');
    return;
  }

  console.log('=== iOS PERMISSION DEBUG START ===');

  const permissions = [
    {name: 'Camera', permission: PERMISSIONS.IOS.CAMERA},
    {name: 'Photo Library', permission: PERMISSIONS.IOS.PHOTO_LIBRARY},
  ];

  for (const perm of permissions) {
    try {
      console.log(`\n--- Checking ${perm.name} ---`);

      // Check current status
      const currentStatus = await check(perm.permission);
      console.log(`Current status: ${currentStatus}`);

      // If not granted, try to request
      if (currentStatus !== RESULTS.GRANTED && currentStatus !== RESULTS.LIMITED) {
        console.log(`Requesting ${perm.name} permission...`);
        const result = await request(perm.permission);
        console.log(`Request result: ${result}`);

        if (result === RESULTS.GRANTED || result === RESULTS.LIMITED) {
          console.log(`✅ ${perm.name} permission granted`);
        } else {
          console.log(`❌ ${perm.name} permission denied: ${result}`);
        }
      } else {
        console.log(`✅ ${perm.name} already granted`);
      }
    } catch (error) {
      console.error(`Error checking ${perm.name}:`, error);
    }
  }

  console.log('\n=== iOS PERMISSION DEBUG END ===');
};

export const checkSinglePermission = async (type: 'camera' | 'gallery') => {
  if (Platform.OS !== 'ios') return false;

  const permission = type === 'camera' ? PERMISSIONS.IOS.CAMERA : PERMISSIONS.IOS.PHOTO_LIBRARY;

  try {
    const status = await check(permission);
    console.log(`${type} permission status:`, status);
    return status === RESULTS.GRANTED || status === RESULTS.LIMITED;
  } catch (error) {
    console.error(`Error checking ${type} permission:`, error);
    return false;
  }
};
