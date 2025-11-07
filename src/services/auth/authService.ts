import {
  GoogleAuthProvider,
  getAuth,
  signInWithCredential,
  signOut,
} from '@react-native-firebase/auth';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import messaging from '@react-native-firebase/messaging';
import {showErrorToast} from '../../utils/common/toastUtils';
import {strings} from '../../utils/language/langauageUtils';
import {updateNewUserStatus, updateUserInfo} from '../../redux/userSlice';
import {updateNotificationPermissionModalVisibility} from '../../redux/systemSlice';
import {
  checkIsUserRegistrationCompleted,
  updateNotificationStatus,
} from '../firestore/userFirestoreService';

async function onGoogleButtonPress() {
  try {
    // Check if your device supports Google Play
    await GoogleSignin.hasPlayServices({showPlayServicesUpdateDialog: true});
    // Get the users ID token
    const signInResult = await GoogleSignin.signIn();

    if (!signInResult.data?.idToken || !signInResult.data?.user.id) {
      throw new Error('No ID token found');
    }
    // Create a Google credential with the token
    const googleCredential = GoogleAuthProvider.credential(signInResult.data?.idToken);
    const data = await signInWithCredential(getAuth(), googleCredential);
    try {
      const userExists = await checkIsUserRegistrationCompleted(signInResult.data?.user.id ?? '');
      updateNewUserStatus(!userExists);
    } catch (error) {
      /* empty */
    } finally {
      updateUserInfo(signInResult.data);
    }
    try {
      const token = await messaging().getToken();
      updateNotificationStatus(signInResult.data?.user.id ?? '', token);
    } catch (error) {
      // Handle error if needed
    }
    return data;
  } catch (error) {
    console.error("Google Sign-In Error: ", error);
    showErrorToast(strings('login.failedSignIn'));
  }
}

async function logout() {
  try {
    // Sign out from Firebase
    await signOut(getAuth());

    // Sign out from Google
    await GoogleSignin.signOut();

    // Clear user info from Redux
    updateUserInfo(null);

    return {success: true};
  } catch (error) {
    showErrorToast('Failed to logout');
    return {success: false, error};
  }
}

export default {onGoogleSignIn: onGoogleButtonPress, logout};
