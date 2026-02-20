import {
  GoogleAuthProvider,
  getAuth,
  signInWithCredential,
  signOut,
  signInWithEmailAndPassword,
} from '@react-native-firebase/auth';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import messaging from '@react-native-firebase/messaging';
import {showErrorToast} from '../../utils/common/toastUtils';
import {strings} from '../../utils/language/langauageUtils';
import {updateNewUserStatus, updateUserInfo} from '../../redux/userSlice';
import {
  checkIsUserRegistrationCompleted,
  updateNotificationStatus,
} from '../firestore/userFirestoreService';

const onGoogleButtonPress = async () => {
  try {
    // Check if your device supports Google Play
    await GoogleSignin.hasPlayServices({showPlayServicesUpdateDialog: true});
    // Get the users ID token
    const signInResult = (await GoogleSignin.signIn())?.data;

    console.log('signInResult', signInResult);
    if (!signInResult.idToken || !signInResult.user.id) {
      throw new Error('No ID token found');
    }
    // Create a Google credential with the token
    const googleCredential = GoogleAuthProvider.credential(signInResult.idToken);
    const data = await signInWithCredential(getAuth(), googleCredential);
    try {
      const userExists = await checkIsUserRegistrationCompleted(signInResult.user.id ?? '');
      updateNewUserStatus(!userExists);
    } catch (error) {
      /* empty */
    } finally {
      updateUserInfo(signInResult);
    }
    try {
      const token = await messaging().getToken();
      updateNotificationStatus(signInResult.user.id ?? '', token);
    } catch (error) {
      // Handle error if needed
    }
    return data;
  } catch (error) {
    console.error('Google Sign-In Error: ', error);
    showErrorToast(strings('login.failedSignIn'));
  }
};

async function onDemoLogin(email: string, password: string) {
  try {
    const auth = getAuth();
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    try {
      const userExists = await checkIsUserRegistrationCompleted(user.uid);
      updateNewUserStatus(!userExists);
    } catch (error) {
      /* empty */
    }

    const idToken = await user.getIdToken();
    const mockGoogleUser = {
      user: {
        id: user.uid,
        name: user.displayName || 'Demo User',
        email: user.email || email,
        photo: user.photoURL,
        familyName: '',
        givenName: user.displayName || 'Demo User',
      },
      idToken: idToken,
      serverAuthCode: null,
      scopes: [],
    };

    updateUserInfo(mockGoogleUser);

    try {
      const token = await messaging().getToken();
      updateNotificationStatus(user.uid, token);
    } catch (error) {
      // Handle error if needed
    }

    return userCredential;
  } catch (error) {
    console.error('Demo Login Error: ', error);
    showErrorToast('Failed to sign in with demo account');
    throw error;
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

export default {onGoogleSignIn: onGoogleButtonPress, logout, onDemoLogin};
