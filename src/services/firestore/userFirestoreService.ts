import firestore, {FieldValue, serverTimestamp} from '@react-native-firebase/firestore';
import {getAuth} from '@react-native-firebase/auth';
import {IUserTable} from '../../config/models/users';
import {FireStoreCollections} from '../../config/common/firestoreCollections';
import {Roles} from '../../config/common/constants';
import {getStoreBasedOnUserIdData} from './storeFirestoreService';

// Helper function to resolve user document by UID, document ID, userId field, or email
async function getUserDocument(userId: string) {
  const usersCollection = firestore().collection(FireStoreCollections.USERS);
  const currentAuth = getAuth().currentUser;
  const authEmail = currentAuth?.email ? currentAuth.email.trim() : null;
  const authUid = currentAuth?.uid || null;

  // 1. Try direct doc ID lookup by userId
  if (userId) {
    const directDoc = await usersCollection.doc(userId).get();
    if (directDoc.exists()) {
      return directDoc;
    }
  }

  // 2. Try direct doc ID lookup by auth UID or auth email
  if (authUid && authUid !== userId) {
    const uidDoc = await usersCollection.doc(authUid).get();
    if (uidDoc.exists()) {
      return uidDoc;
    }
  }

  if (authEmail) {
    const emailDoc = await usersCollection.doc(authEmail).get();
    if (emailDoc.exists()) {
      return emailDoc;
    }
    const lowerEmailDoc = await usersCollection.doc(authEmail.toLowerCase()).get();
    if (lowerEmailDoc.exists()) {
      return lowerEmailDoc;
    }
  }

  // 3. Query by 'id' or 'userId' field matching userId or authUid
  const idCandidates = Array.from(new Set([userId, authUid].filter(Boolean))) as string[];
  for (const idToTry of idCandidates) {
    const idSnap = await usersCollection.where('id', '==', idToTry).limit(1).get();
    if (!idSnap.empty && idSnap.docs[0].exists()) {
      return idSnap.docs[0];
    }
    const userIdSnap = await usersCollection.where('userId', '==', idToTry).limit(1).get();
    if (!userIdSnap.empty && userIdSnap.docs[0].exists()) {
      return userIdSnap.docs[0];
    }
  }

  // 4. Query by email field
  const emailCandidates = Array.from(
    new Set([authEmail, authEmail?.toLowerCase(), userId.includes('@') ? userId : null, userId.includes('@') ? userId.toLowerCase() : null].filter(Boolean)),
  ) as string[];

  for (const emailToTry of emailCandidates) {
    const emailSnap = await usersCollection.where('email', '==', emailToTry).limit(1).get();
    if (!emailSnap.empty && emailSnap.docs[0].exists()) {
      return emailSnap.docs[0];
    }
  }

  // If not found, return empty doc reference
  return await usersCollection.doc(userId || authUid || 'unknown').get();
}

// Helper function to update user document (supporting UID vs email resolution)
async function updateUserDocument(userId: string, data: any) {
  const userDoc = await getUserDocument(userId);
  if (!userDoc.exists()) {
    throw new Error('User not found');
  }
  await userDoc.ref.update(data);
}

// Enhanced check user exists with more data
async function checkUserExists(userId: string): Promise<boolean> {
  try {
    const userDoc = await getUserDocument(userId);
    return userDoc.exists();
  } catch (error) {
    console.error('Error checking user existence:', error);
    return false;
  }
}

async function checkIsUserRegistrationCompleted(userId: string): Promise<boolean> {
  try {
    const userDoc = await getUserDocument(userId);
    if (!userDoc.exists()) return false;
    const data = userDoc.data() as IUserTable | undefined;
    if (!data) return false;

    // If user has basic required profile info (name/phoneNumber/role), registration is complete
    if (data.name || data.phoneNumber || (data as any).mobileNumber || (data.role && data.role.length > 0)) {
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error checking user registration completion:', error);
    return false;
  }
}

// Get specific user data
async function getUserData(userId: string): Promise<IUserTable | null> {
  try {
    const userDoc = await getUserDocument(userId);

    if (userDoc.exists()) {
      const userData = {id: userDoc.id, ...userDoc.data()};
      return userData as IUserTable;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
}

// Function specifically for creating new user data
async function createNewUser(
  userData: IUserTable,
  isUpdate = false,
): Promise<{success: boolean; userId: string | null; message: string}> {
  try {
    const usersCollection = firestore().collection(FireStoreCollections.USERS);
    // // If userId is provided, check if user already exists
    // if (userData.id) {
    //   const existingUser = await usersCollection.doc(userData.id).get();
    //   if (existingUser.exists()) {
    //     return Promise.reject({
    //       success: false,
    //       userId: null,
    //       message: 'User already exists',
    //     });
    //   }
    // }

    // Prepare user data with timestamps
    const newUserData: Partial<
      typeof userData & {createdAt: FieldValue; updatedAt: FieldValue; isActive: boolean}
    > = {
      ...userData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isActive: true,
    };

    if (isUpdate) {
      delete newUserData.createdAt;
      await updateUserDocument(userData.id, newUserData);
    } else {
      await usersCollection.doc(userData.id).set(newUserData);
    }
    const verifyUser = await getUserDocument(userData.id);
    if (verifyUser.exists()) {
      return Promise.resolve({
        success: true,
        data: verifyUser.data(),
        userId: userData.id,
        message: isUpdate ? 'User details updated successfully' : 'User created successfully',
      });
    } else {
      return Promise.reject(isUpdate ? 'User update failed' : 'User creation verification failed');
    }
  } catch (error) {
    console.error('Error creating new user:', error);
    return Promise.reject({
      success: false,
      userId: null,
      message: isUpdate ? 'User details update failed' : `Error creating user: ${error}`,
    });
  }
}

// Function to update user roles
async function updateUserRoles(
  userId: string,
  roles: Array<string>,
): Promise<{success: boolean; message: string}> {
  try {
    const userExists = await checkUserExists(userId);
    if (!userExists) {
      return {
        success: false,
        message: 'User not found',
      };
    }

    // Update user roles with timestamp
    await updateUserDocument(userId, {
      role: roles,
      updatedAt: serverTimestamp(),
    });
    return {
      success: true,
      message: 'User roles updated successfully',
    };
  } catch (error) {
    console.error('Error updating user roles:', error);
    return {
      success: false,
      message: `Error updating user roles: ${error}`,
    };
  }
}

// Function to add a role to existing user roles
async function addUserRole(
  userId: string,
  newRole: string,
): Promise<{success: boolean; message: string}> {
  try {
    const userData = await getUserData(userId);
    if (!userData) {
      return {
        success: false,
        message: 'User not found',
      };
    }

    const currentRoles = userData.role || [];

    if (currentRoles.includes(newRole)) {
      return {
        success: false,
        message: 'Role already exists for this user',
      };
    }

    const updatedRoles = [...currentRoles, newRole];

    await updateUserDocument(userId, {
      role: updatedRoles,
      updatedAt: serverTimestamp(),
    });

    return {
      success: true,
      message: 'User role added successfully',
    };
  } catch (error) {
    return {
      success: false,
      message: `Error adding user role: ${error}`,
    };
  }
}

// Function to remove a role from user roles
async function removeUserRole(
  userId: string,
  roleToRemove: string,
): Promise<{success: boolean; message: string}> {
  try {
    // Get current user data
    const userData = await getUserData(userId);
    if (!userData) {
      return {
        success: false,
        message: 'User not found',
      };
    }

    // Get current roles
    const currentRoles = userData.role || [];

    // Check if role exists
    if (!currentRoles.includes(roleToRemove)) {
      return {
        success: false,
        message: 'Role does not exist for this user',
      };
    }

    // Remove role from existing roles
    const updatedRoles = currentRoles.filter(role => role !== roleToRemove);

    // Update user with filtered roles
    await updateUserDocument(userId, {
      role: updatedRoles,
      updatedAt: serverTimestamp(),
    });
    return {
      success: true,
      message: 'User role removed successfully',
    };
  } catch (error) {
    console.error('Error removing user role:', error);
    return {
      success: false,
      message: `Error removing user role: ${error}`,
    };
  }
}

async function addToFavorite(
  userId: string,
  id: string,
): Promise<{success: boolean; message: string}> {
  try {
    const userData = await getUserData(userId);
    if (!userData) {
      return {
        success: false,
        message: 'User not found',
      };
    }
    const favoritesList = userData.favorites || [];
    const updateFavorites = [...favoritesList, id];
    await updateUserDocument(userId, {
      favorites: updateFavorites,
      updatedAt: serverTimestamp(),
    });
    return {
      success: true,
      message: 'User role added successfully',
    };
  } catch (error) {
    return {
      success: false,
      message: `Error adding user role: ${error}`,
    };
  }
}
async function removeFromFavorite(
  userId: string,
  id: string,
): Promise<{success: boolean; message: string}> {
  try {
    const userData = await getUserData(userId);
    if (!userData) {
      return {
        success: false,
        message: 'User not found',
      };
    }

    const favoritesList = userData.favorites || [];

    const updateFavorites = favoritesList.filter(item => item !== id);

    await updateUserDocument(userId, {
      favorites: updateFavorites,
      updatedAt: serverTimestamp(),
    });

    return {
      success: true,
      message: 'User role added successfully',
    };
  } catch (error) {
    return {
      success: false,
      message: `Error adding user role: ${error}`,
    };
  }
}

async function addToCart(userId: string, id: string): Promise<{success: boolean; message: string}> {
  try {
    const userData = await getUserData(userId);
    if (!userData) {
      return {
        success: false,
        message: 'User not found',
      };
    }
    const cartList = userData.cartItems || [];
    const updatedCartItems = [...cartList, id];
    await updateUserDocument(userId, {
      cartItems: updatedCartItems,
      updatedAt: serverTimestamp(),
    });
    return {
      success: true,
      message: 'User role added successfully',
    };
  } catch (error) {
    return {
      success: false,
      message: `Error adding user role: ${error}`,
    };
  }
}

async function removeFromCart(
  userId: string,
  id: string,
): Promise<{success: boolean; message: string}> {
  try {
    const userData = await getUserData(userId);
    if (!userData) {
      return {
        success: false,
        message: 'User not found',
      };
    }
    const cartItemsList = userData.cartItems || [];
    const updatedCartItems = cartItemsList.filter(item => item !== id);
    await updateUserDocument(userId, {
      cartItems: updatedCartItems,
      updatedAt: serverTimestamp(),
    });
    return {
      success: true,
      message: 'User role added successfully',
    };
  } catch (error) {
    return {
      success: false,
      message: `Error adding user role: ${error}`,
    };
  }
}

async function updateNotificationStatus(
  userId: string,
  notification: string | null,
): Promise<{success: boolean; message: string}> {
  try {
    const userExists = await checkUserExists(userId);
    if (!userExists) {
      return {
        success: false,
        message: 'User not found',
      };
    }

    // Update user roles with timestamp
    await updateUserDocument(userId, {
      notification,
      updatedAt: serverTimestamp(),
    });
    return {
      success: true,
      message: 'User notification status updated successfully',
    };
  } catch (error) {
    console.error('Error updating user notification:', error);
    return {
      success: false,
      message: `Error updating user notification: ${error}`,
    };
  }
}

export async function updateUserRole(userId: string, roleToAdd: string, email?: string) {
  try {
    const userDocSnap = await getUserDocument(userId || email || '');
    if (userDocSnap && userDocSnap.exists()) {
      const currentData = userDocSnap.data() || {};
      const roles: string[] = Array.isArray(currentData.role) ? [...currentData.role] : ['user'];
      if (!roles.includes(roleToAdd)) {
        roles.push(roleToAdd);
        await firestore().collection(FireStoreCollections.USERS).doc(userDocSnap.id).update({
          role: roles,
          updatedAt: serverTimestamp(),
        });
      }
    }
  } catch (e) {
    console.warn('Error updating user role:', e);
  }
}

export {
  getUserDocument,
  checkUserExists,
  checkIsUserRegistrationCompleted,
  getUserData,
  createNewUser,
  updateUserRoles,
  addUserRole,
  removeUserRole,
  addToFavorite,
  removeFromFavorite,
  addToCart,
  removeFromCart,
  updateNotificationStatus,
};
