import {
  GoogleAuthProvider,
  getAuth,
  signInWithCredential,
  signOut,
  signInWithEmailAndPassword,
  AppleAuthProvider,
} from '@react-native-firebase/auth';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {appleAuth} from '@invertase/react-native-apple-authentication';
import messaging from '@react-native-firebase/messaging';
import {showErrorToast} from '../../utils/common/toastUtils';
import {strings} from '../../utils/language/langauageUtils';
import {updateNewUserStatus, updateUserInfo, updateGuestStatus} from '../../redux/userSlice';
import {
  checkIsUserRegistrationCompleted,
  updateNotificationStatus,
} from '../firestore/userFirestoreService';
import firestore from '@react-native-firebase/firestore';
import {FireStoreCollections} from '../../config/common/firestoreCollections';
import {store} from '../../redux/store';

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

const onAppleButtonPress = async () => {
  try {
    // Perform Apple sign-in request
    const appleAuthRequestResponse = await appleAuth.performRequest({
      requestedOperation: appleAuth.Operation.LOGIN,
      requestedScopes: [appleAuth.Scope.FULL_NAME, appleAuth.Scope.EMAIL],
    });

    // Ensure the request returned an identity token
    const {identityToken, nonce, fullName, email} = appleAuthRequestResponse;

    if (!identityToken) {
      throw new Error('Apple Sign-In failed – no identity token returned');
    }

    // Create a Firebase AppleAuthProvider credential
    const appleCredential = AppleAuthProvider.credential(identityToken, nonce);

    // Sign in to Firebase with the Apple credential
    const data = await signInWithCredential(getAuth(), appleCredential);
    const firebaseUid = data.user.uid;

    // Apple only provides full name & email on the FIRST sign-in
    const displayName =
      [fullName?.givenName, fullName?.familyName].filter(Boolean).join(' ') ||
      data.user.displayName ||
      'Apple User';

    // Check if the user has completed registration
    try {
      const userExists = await checkIsUserRegistrationCompleted(firebaseUid);
      updateNewUserStatus(!userExists);
    } catch (error) {
      /* empty */
    }

    // Map to the same shape as Google sign-in for Redux consistency
    const appleUser = {
      user: {
        id: firebaseUid,
        name: displayName,
        email: email || data.user.email || '',
        photo: data.user.photoURL || null,
        familyName: fullName?.familyName || '',
        givenName: fullName?.givenName || '',
      },
      idToken: identityToken,
      serverAuthCode: null,
      scopes: [],
    };

    updateUserInfo(appleUser);

    // Register FCM token
    try {
      const token = await messaging().getToken();
      updateNotificationStatus(firebaseUid, token);
    } catch (error) {
      // Handle error if needed
    }

    return data;
  } catch (error: any) {
    // Don't show error toast if user cancelled the flow
    if (error?.code !== appleAuth.Error.CANCELED) {
      console.error('Apple Sign-In Error Code: ', error?.code, 'Message: ', error?.message, error);
      showErrorToast(strings('login.failedSignIn') + ' (' + (error?.code || 'Unknown') + ')');
    }
  }
};

async function onEmailLogin(email: string, password: string) {
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
    // Sign out from Firebase (may fail if user was just deleted)
    try {
      await signOut(getAuth());
    } catch (e) {
      console.log('Firebase signout skipped/failed', e);
    }

    // Sign out from Google (may fail if not logged in via Google)
    try {
      await GoogleSignin.signOut();
    } catch (e) {
      console.log('Google signout skipped/failed', e);
    }
  } catch (error) {
    console.error('Logout error', error);
  } finally {
    // Always clear local Redux state so the user is never trapped
    updateUserInfo(null);
    updateNewUserStatus(false);
    updateGuestStatus(false);
  }
  return {success: true};
}

async function deleteAccount() {
  try {
    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (!currentUser) {
      throw new Error('No authenticated user found');
    }

    // Delete user from Firestore DB using the ID currently stored in Redux
    // This is required because Google Sign-In stores the DB document under the Google ID, not the Firebase UID.
    try {
      const state = store.getState();
      const reduxUserId = state.user.user?.user?.id;
      
      // Delete using Redux ID if available, otherwise fallback to Firebase UID
      const docIdToDelete = reduxUserId || currentUser.uid;
      
      if (docIdToDelete) {
        await firestore().collection(FireStoreCollections.USERS).doc(docIdToDelete).delete();
      }
      
      // Also attempt to delete by Firebase UID just in case it's different and exists
      if (reduxUserId && reduxUserId !== currentUser.uid) {
        await firestore().collection(FireStoreCollections.USERS).doc(currentUser.uid).delete();
      }
    } catch (dbError) {
      console.error('Failed to delete user from Firestore:', dbError);
    }

    // Delete user from Firebase Auth
    await currentUser.delete();

    // Clear local state using existing logout flow
    await logout();
    
    return {success: true};
  } catch (error: any) {
    console.error('Delete Account Error: ', error);
    if (error.code === 'auth/requires-recent-login') {
        showErrorToast('Please logout and login again to delete your account.');
    } else {
        showErrorToast('Failed to delete account. Please try again.');
    }
    return {success: false, error};
  }
}

export default {onGoogleSignIn: onGoogleButtonPress, onAppleSignIn: onAppleButtonPress, logout, onEmailLogin, deleteAccount};
