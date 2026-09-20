import firestore, {serverTimestamp} from '@react-native-firebase/firestore';
import {getAuth} from '@react-native-firebase/auth';
import {FireStoreCollections} from '../../config/common/firestoreCollections';
import {IStoreTable} from '../../config/models/store';

// Get specific user data
async function getStoreBasedOnUserIdData(userId: string): Promise<IStoreTable | null> {
  try {
    if (!userId) {
      const authUser = getAuth().currentUser;
      if (!authUser) return null;
      userId = authUser.uid;
    }

    const idList: string[] = [];
    const emailList: string[] = [];

    if (userId) {
      idList.push(userId);
      if (userId.includes('@')) {
        emailList.push(userId);
        emailList.push(userId.trim().toLowerCase());
      }
    }

    const authCurrentUser = getAuth().currentUser;
    if (authCurrentUser?.uid && !idList.includes(authCurrentUser.uid)) {
      idList.push(authCurrentUser.uid);
    }
    if (authCurrentUser?.email) {
      const email = authCurrentUser.email;
      if (!emailList.includes(email)) emailList.push(email);
      if (!emailList.includes(email.trim().toLowerCase())) emailList.push(email.trim().toLowerCase());
    }

    // Try looking up user document to get associated email and ID
    if (!userId.includes('@')) {
      try {
        const idSnapshot = await firestore()
          .collection(FireStoreCollections.USERS)
          .where('id', '==', userId)
          .get();
        if (!idSnapshot.empty) {
          const docData = idSnapshot.docs[0].data();
          if (docData?.email) {
            const docEmail = docData.email;
            if (!emailList.includes(docEmail)) emailList.push(docEmail);
            if (!emailList.includes(docEmail.trim().toLowerCase())) emailList.push(docEmail.trim().toLowerCase());
          }
          if (docData?.userId && !idList.includes(docData.userId)) {
            idList.push(docData.userId);
          }
        }
      } catch (e) {
        console.log('Error looking up user doc for email in getStoreBasedOnUserIdData:', e);
      }
    }

    const storeCollection = firestore().collection(FireStoreCollections.STORES);

    // 1. Query by userId matching any known user ID
    if (idList.length > 0) {
      const storeSnapshot = await storeCollection
        .where('userId', 'in', idList.slice(0, 10))
        .get();

      if (!storeSnapshot.empty) {
        const storeDoc = storeSnapshot.docs[0];
        return {
          id: storeDoc.id,
          ...storeDoc.data(),
        } as IStoreTable;
      }
    }

    // 2. Query by email matching any known user email
    const uniqueEmails = Array.from(new Set(emailList.filter(Boolean)));
    if (uniqueEmails.length > 0) {
      const emailSnapshot = await storeCollection
        .where('email', 'in', uniqueEmails.slice(0, 10))
        .get();

      if (!emailSnapshot.empty) {
        const storeDoc = emailSnapshot.docs[0];
        return {
          id: storeDoc.id,
          ...storeDoc.data(),
        } as IStoreTable;
      }
    }

    return null;
  } catch (error) {
    console.error('Error getting store data:', error);
    return null;
  }
}

async function getStoreById(storeId: string): Promise<IStoreTable | null> {
  try {
    const productDoc = await firestore().collection(FireStoreCollections.STORES).doc(storeId).get();
    if (productDoc.exists()) {
      const productData = {id: productDoc.id, ...productDoc.data()};
      return productData as unknown as IStoreTable;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting product by ID:', error);
    return null;
  }
}

import {generateUniqueStoreSlug} from '../../utils/common/slugUtils';

// Function specifically for creating or updating user store data without duplicates
async function createNewUserStore(
  storeData: Omit<IStoreTable, 'id'>,
): Promise<{success: boolean; userId: string | null; message: string; data?: IStoreTable}> {
  try {
    const authUser = getAuth().currentUser;
    if (!authUser) {
      return Promise.reject({
        success: false,
        userId: null,
        message: 'Your login session has expired. Please sign out and sign in again.',
      });
    }

    const storeCollection = firestore().collection(FireStoreCollections.STORES);
    
    // Check if store already exists for this user ID or email
    let existingStore = await getStoreBasedOnUserIdData(storeData.userId);
    
    if (!existingStore && storeData.email) {
      const normalizedEmail = storeData.email.trim().toLowerCase();
      const emailSnap = await storeCollection
        .where('email', 'in', [storeData.email, normalizedEmail])
        .get();
      if (!emailSnap.empty) {
        const docSnap = emailSnap.docs[0];
        existingStore = {
          id: docSnap.id,
          ...docSnap.data(),
        } as IStoreTable;
      }
    }

    if (existingStore && existingStore.id) {
      // Existing store found: Merge and update rather than creating a duplicate
      let slug = existingStore.slug;
      let storeUrl = existingStore.storeUrl;
      if (!slug && (storeData.storeName || existingStore.storeName)) {
        slug = await generateUniqueStoreSlug(storeData.storeName || existingStore.storeName, existingStore.id);
        storeUrl = `https://dealzhub.co.in/shop/${slug}`;
      }

      const updateData: any = {
        ...storeData,
        email: storeData.email ? storeData.email.trim().toLowerCase() : existingStore.email,
        updatedAt: serverTimestamp(),
      };
      if (slug) updateData.slug = slug;
      if (storeUrl) updateData.storeUrl = storeUrl;

      await storeCollection.doc(existingStore.id).set(updateData, {merge: true});

      const storeDetails = await getStoreById(existingStore.id);
      return {
        success: true,
        data: storeDetails || existingStore,
        userId: storeData.userId,
        message: 'Store updated successfully',
      };
    }

    // No existing store found: Generate slug & storeUrl for new store
    const slug = await generateUniqueStoreSlug(storeData.storeName);
    const storeUrl = `https://dealzhub.co.in/shop/${slug}`;

    const newstoreData = {
      ...storeData,
      email: storeData.email ? storeData.email.trim().toLowerCase() : '',
      slug,
      storeUrl,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isActive: true,
    };

    const newDocRef = storeCollection.doc();
    await newDocRef.set(newstoreData);

    // Verify the store was created
    const storeDetails = await getStoreById(newDocRef.id) || await getStoreBasedOnUserIdData(storeData.userId);
    if (storeDetails) {
      return {
        success: true,
        data: storeDetails,
        userId: storeData.userId,
        message: 'Store created successfully',
      };
    } else {
      return Promise.reject('Store creation failed');
    }
  } catch (error: any) {
    return Promise.reject({
      success: false,
      userId: null,
      message: `Error creating Store: ${error?.message || error}`,
    });
  }
}

async function updateUserStore(
  userId: string,
  updateData: Partial<Omit<IStoreTable, 'id' | 'userId' | 'createdAt'>>,
): Promise<{success: boolean; userId: string | null; message: string; data?: IStoreTable}> {
  try {
    const storeCollection = firestore().collection(FireStoreCollections.STORES);

    // Find the store document for this user using getStoreBasedOnUserIdData (supports UID & email resolution)
    const storeDetails = await getStoreBasedOnUserIdData(userId);

    if (!storeDetails) {
      return Promise.reject({
        success: false,
        userId: null,
        message: 'Store not found for this user',
      });
    }

    const updatedStoreData = {
      ...updateData,
      ...(updateData.email ? {email: updateData.email.trim().toLowerCase()} : {}),
      updatedAt: serverTimestamp(),
    };

    await storeCollection.doc(storeDetails.id).update(updatedStoreData);

    // Verify the store was updated
    const updatedStoreDetails = await getStoreById(storeDetails.id) || await getStoreBasedOnUserIdData(userId);
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
    const currentStore = await getStoreBasedOnUserIdData(userId);

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

import {updateUserRole} from './userFirestoreService';

export async function activateStoreSubscriptionAfterPayment(
  orderId: string,
  storeId?: string,
): Promise<{success: boolean; store?: IStoreTable; message?: string}> {
  try {
    const storeCollection = firestore().collection(FireStoreCollections.STORES);
    let targetStoreDoc: any = null;

    if (storeId) {
      const directSnap = await storeCollection.doc(storeId).get();
      if (directSnap.exists()) {
        targetStoreDoc = directSnap;
      }
    }

    if (!targetStoreDoc && orderId) {
      const orderSnap = await storeCollection.where('paymentOrderId', '==', orderId).limit(1).get();
      if (!orderSnap.empty) {
        targetStoreDoc = orderSnap.docs[0];
      }
    }

    if (!targetStoreDoc) {
      // Fallback: check current auth user's store
      const userStore = await getStoreBasedOnUserIdData('');
      if (userStore && userStore.id) {
        targetStoreDoc = await storeCollection.doc(userStore.id).get();
      }
    }

    if (!targetStoreDoc || !targetStoreDoc.exists()) {
      return {success: false, message: 'Store not found for this payment order'};
    }

    const storeData = targetStoreDoc.data() || {};
    const plan = storeData.subscriptionPlan || '12_months';
    const days = plan === '3_months' ? 90 : 365;
    const startDate = new Date();
    const endDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

    await storeCollection.doc(targetStoreDoc.id).set(
      {
        paymentStatus: 'PAID',
        vendorStatus: 'approved',
        subscriptionStartDate: startDate,
        subscriptionEndDate: endDate,
        updatedAt: serverTimestamp(),
      },
      {merge: true},
    );

    // Update user role to vendor
    if (storeData.userId || storeData.email) {
      await updateUserRole(storeData.userId, 'vendor', storeData.email);
    }

    const updatedStore = await getStoreById(targetStoreDoc.id);
    return {success: true, store: updatedStore || undefined};
  } catch (error: any) {
    console.error('Error activating store subscription:', error);
    return {success: false, message: error?.message || 'Failed to activate store'};
  }
}

export {
  getStoreBasedOnUserIdData,
  createNewUserStore,
  updateUserStore,
  addCategoriesToStore,
  getStoreById,
};
