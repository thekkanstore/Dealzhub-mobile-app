import firestore, {FieldValue, serverTimestamp} from '@react-native-firebase/firestore';
import {getAuth} from '@react-native-firebase/auth';
import {IUserTable} from '../../config/models/users';
import {FireStoreCollections} from '../../config/common/firestoreCollections';
import {Roles} from '../../config/common/constants';
import {getStoreBasedOnUserIdData} from './storeFirestoreService';

// Helper function to resolve user document by UID or by email field fallback
async function getUserDocument(userId: string) {
  let userDoc = await firestore().collection(FireStoreCollections.USERS).doc(userId).get();
  
  if (!userDoc.exists() && !userId.includes('@')) {
    // Try querying by the 'id' field matching the UID first
    const idSnapshot = await firestore()
      .collection(FireStoreCollections.USERS)
      .where('id', '==', userId)
      .get();
    if (!idSnapshot.empty) {
      userDoc = idSnapshot.docs[0] as any;
    } else {
      // Fallback: Query by current user's email
      const email = getAuth().currentUser?.email;
      if (email) {
        const emailSnapshot = await firestore()
          .collection(FireStoreCollections.USERS)
          .where('email', '==', email)
          .get();
        if (!emailSnapshot.empty) {
          userDoc = emailSnapshot.docs[0] as any;
        }
      }
    }
  }
  return userDoc;
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
    console.log('[checkIsUserRegistrationCompleted] userId:', userId);
    const userDoc = await getUserDocument(userId);
    console.log('[checkIsUserRegistrationCompleted] userDoc exists:', userDoc.exists);
    if (!userDoc.exists) return false;
    const data = userDoc.data();
    console.log('[checkIsUserRegistrationCompleted] userDoc data:', data);
    const {role = []} = data as IUserTable;
    if (role.length === 0) return false;
    if (role.includes(Roles.VENDOR)) {
      const storeDetails = await getStoreBasedOnUserIdData(userDoc.id);
      console.log('[checkIsUserRegistrationCompleted] storeDetails:', storeDetails);
      return !!storeDetails;
    }
    return true;
  } catch (error) {
    console.error('Error checking user existence:', error);
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

export {
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
