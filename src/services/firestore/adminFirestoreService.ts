import firestore from '@react-native-firebase/firestore';
import {FireStoreCollections} from '../../config/common/firestoreCollections';
import {IAdmin} from '../../config/models/admin';

// Get specific category data
async function getAppConfig(): Promise<IAdmin | null> {
  try {
    const appConfigDoc = await firestore()
      .collection(FireStoreCollections.APP_CONFIG)
      .doc('admin')
      .get();

    if (appConfigDoc.exists()) {
      return {
        ...appConfigDoc.data(),
      } as IAdmin;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting category:', error);
    return null;
  }
}

export {getAppConfig};
