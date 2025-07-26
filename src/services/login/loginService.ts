import {GoogleAuthProvider, getAuth, signInWithCredential} from '@react-native-firebase/auth';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {showErrorToast} from '../../utils/common/toastUtils';
import {strings} from '../../utils/language/langauageUtils';
import {updateUserInfo} from '../../redux/userSlice';

async function onGoogleButtonPress() {
  try {
    // Check if your device supports Google Play
    await GoogleSignin.hasPlayServices({showPlayServicesUpdateDialog: true});
    // Get the users ID token
    const signInResult = await GoogleSignin.signIn();
    // Try the new style of google-sign in result, from v13+ of that module
    const idToken = signInResult.data?.idToken;
    if (!idToken) {
      throw new Error('No ID token found');
    }
    // Create a Google credential with the token
    const googleCredential = GoogleAuthProvider.credential(idToken);

    const data = await signInWithCredential(getAuth(), googleCredential);
    updateUserInfo(signInResult.data);
    return data;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log(error, 'error');
    showErrorToast(strings('login.failedSignIn'));
  }
}

export default {onGoogleSignIn: onGoogleButtonPress};
