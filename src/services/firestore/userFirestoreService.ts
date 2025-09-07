import firestore from '@react-native-firebase/firestore';
import {IUserTable} from '../../config/models/users';
import {FireStoreCollections} from '../../config/common/firestoreCollections';
import {Roles} from '../../config/common/constants';
import {getStoreData} from './storeFirestoreService';

// Enhanced check user exists with more data
async function checkUserExists(userId: string): Promise<boolean> {
  try {
    const userDoc = await firestore().collection(FireStoreCollections.USERS).doc(userId).get();
    return userDoc.exists();
  } catch (error) {
    console.error('Error checking user existence:', error);
    return false;
  }
}
async function checkIsUserRegistrationCompleted(userId: string): Promise<boolean> {
  try {
    const userDoc = await firestore().collection(FireStoreCollections.USERS).doc(userId).get();
    if (!userDoc.exists()) return false;
    const {role = []} = userDoc.data() as IUserTable;
    if (role.length === 0) return false;
    if (role.includes(Roles.VENDOR)) {
      const storeDetails = await getStoreData(userId);
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
    const userDoc = await firestore().collection(FireStoreCollections.USERS).doc(userId).get();

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
      typeof userData & {createdAt: Date; updatedAt: Date; isActive: boolean}
    > = {
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
    };

    if (isUpdate) {
      delete newUserData.createdAt;
      await usersCollection.doc(userData.id).update(newUserData);
    } else {
      await usersCollection.doc(userData.id).set(newUserData);
    }
    const verifyUser = await usersCollection.doc(userData.id).get();
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
    await firestore().collection(FireStoreCollections.USERS).doc(userId).update({
      role: roles,
      updatedAt: new Date(),
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

    await firestore().collection(FireStoreCollections.USERS).doc(userId).update({
      role: updatedRoles,
      updatedAt: new Date(),
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
    await firestore().collection(FireStoreCollections.USERS).doc(userId).update({
      role: updatedRoles,
      updatedAt: new Date(),
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

export {
  checkUserExists,
  checkIsUserRegistrationCompleted,
  getUserData,
  createNewUser,
  updateUserRoles,
  addUserRole,
  removeUserRole,
};
