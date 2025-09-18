import firestore, {serverTimestamp} from '@react-native-firebase/firestore';
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
      return {
        id: storeDoc.id,
        ...storeDoc.data(),
      } as IStoreTable;
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
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
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

async function updateUserStore(
  userId: string,
  updateData: Partial<Omit<IStoreTable, 'id' | 'userId' | 'createdAt'>>,
): Promise<{success: boolean; userId: string | null; message: string}> {
  try {
    const storeCollection = firestore().collection(FireStoreCollections.STORES);

    // Find the store document for this user
    const storeSnapshot = await storeCollection.where('userId', '==', userId).get();

    if (storeSnapshot.empty) {
      return Promise.reject({
        success: false,
        userId: null,
        message: 'Store not found for this user',
      });
    }

    const storeDoc = storeSnapshot.docs[0];
    const updatedStoreData = {
      ...updateData,
      updatedAt: serverTimestamp(),
    };

    await storeDoc.ref.update(updatedStoreData);

    // Verify the store was updated
    const updatedStoreDetails = await getStoreData(userId);
    if (updatedStoreDetails) {
      return Promise.resolve({
        success: true,
        data: updatedStoreDetails,
        userId: userId,
        message: 'Store updated successfully',
      });
    } else {
      return Promise.reject('Store update verification failed');
    }
  } catch (error) {
    return Promise.reject({
      success: false,
      userId: null,
      message: `Error updating Store: ${error}`,
    });
  }
}

async function addCategoriesToStore(
  userId: string,
  newCategories: string[],
): Promise<{success: boolean; userId: string | null; message: string; data?: IStoreTable}> {
  try {
    // First, fetch the current store details
    const currentStore = await getStoreData(userId);

    if (!currentStore) {
      return Promise.reject({
        success: false,
        userId: null,
        message: 'Store not found for this user',
      });
    }

    // Get existing categories or initialize as empty array
    const existingCategories = currentStore.categories || [];

    // Filter out categories that already exist to prevent duplicates
    const categoriesToAdd = newCategories.filter(
      category => !existingCategories.includes(category),
    );

    // If no new categories to add, return early
    if (categoriesToAdd.length === 0) {
      return Promise.resolve({
        success: true,
        userId: userId,
        message: 'No new categories to add (all categories already exist)',
        data: currentStore,
      });
    }

    // Combine existing and new categories
    const updatedCategories = [...existingCategories, ...categoriesToAdd];

    // Update the store with the new categories
    const updateResult = await updateUserStore(userId, {
      categories: updatedCategories,
    });

    return Promise.resolve({
      success: true,
      userId: userId,
      message: `Successfully added ${categoriesToAdd.length} new categories`,
      data: updateResult.data as IStoreTable,
    });
  } catch (error) {
    return Promise.reject({
      success: false,
      userId: null,
      message: `Error adding categories to store: ${error}`,
    });
  }
}

export {getStoreData, createNewUserStore, updateUserStore, addCategoriesToStore};
