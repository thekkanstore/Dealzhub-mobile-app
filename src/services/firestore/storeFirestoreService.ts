import firestore from '@react-native-firebase/firestore';
import {FireStoreCollections} from '../../config/common/firestoreCollections';
import {IStoreTable} from '../../config/models/store';

// Get specific user data
async function getStoreData(userId: string): Promise<IStoreTable | null> {
  try {
    const storeSnapshot = await firestore()
      .collection(FireStoreCollections.STORES)
      .where('userId', '==', userId)
      .get();
    if (!storeSnapshot.empty) {
      const storeDoc = storeSnapshot.docs[0];
      return storeDoc.data() as IStoreTable;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting store data:', error);
    return null;
  }
}

// Function specifically for creating new user data
async function createNewUserStore(
  storeData: Omit<IStoreTable, 'id'>,
): Promise<{success: boolean; userId: string | null; message: string}> {
  try {
    const storeCollection = firestore().collection(FireStoreCollections.STORES);
    const newstoreData = {
      ...storeData,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
    };

    await storeCollection.doc().set(newstoreData);

    // Verify the user was created
    const storeDetails = await getStoreData(storeData.userId);
    if (storeDetails) {
      return Promise.resolve({
        success: true,
        data: storeDetails,
        userId: storeData.userId,
        message: 'Store created successfully',
      });
    } else {
      return Promise.reject('Store creation failed');
    }
  } catch (error) {
    return Promise.reject({
      success: false,
      userId: null,
      message: `Error creating Store: ${error}`,
    });
  }
}

export {getStoreData, createNewUserStore};
