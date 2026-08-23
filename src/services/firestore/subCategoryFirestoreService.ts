import firestore, {serverTimestamp} from '@react-native-firebase/firestore';
import {FireStoreCollections} from '../../config/common/firestoreCollections';
import {ISubCategory} from '../../config/models/subcategory';

// Get sub-categories for a specific store and main category
async function getSubCategories(storeId: string, categoryId: string): Promise<ISubCategory[]> {
  try {
    if (!storeId || !categoryId) return [];

    const snapshot = await firestore()
      .collection(FireStoreCollections.SUB_CATEGORIES)
      .where('storeId', '==', storeId)
      .where('categoryId', '==', categoryId)
      .where('isActive', '==', true)
      .get();

    const subCategories = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as ISubCategory[];

    return subCategories.sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error('Error getting sub-categories:', error);
    return [];
  }
}

// Create a new sub-category (with duplicate checks)
async function createSubCategory(
  name: string,
  storeId: string,
  categoryId: string,
): Promise<ISubCategory> {
  const trimmedName = name.trim();
  const nameLower = trimmedName.toLowerCase();

  // Check for duplicates
  const duplicateCheck = await firestore()
    .collection(FireStoreCollections.SUB_CATEGORIES)
    .where('storeId', '==', storeId)
    .where('categoryId', '==', categoryId)
    .where('nameLower', '==', nameLower)
    .where('isActive', '==', true)
    .get();

  if (!duplicateCheck.empty) {
    throw new Error('subCategoryExists');
  }

  const subCategoryData = {
    name: trimmedName,
    nameLower,
    categoryId,
    storeId,
    isActive: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const docRef = await firestore()
    .collection(FireStoreCollections.SUB_CATEGORIES)
    .add(subCategoryData);

  return {
    id: docRef.id,
    ...subCategoryData,
  } as unknown as ISubCategory;
}

// Update a sub-category name
async function updateSubCategory(id: string, name: string): Promise<void> {
  const trimmedName = name.trim();
  const nameLower = trimmedName.toLowerCase();

  // Fetch target subcategory to check store/category context for duplicate checks
  const subCategoryDoc = await firestore()
    .collection(FireStoreCollections.SUB_CATEGORIES)
    .doc(id)
    .get();

  if (!subCategoryDoc.exists) {
    throw new Error('Sub-category not found');
  }

  const data = subCategoryDoc.data() as ISubCategory;

  // Check for duplicates (excluding the current document)
  const duplicateCheck = await firestore()
    .collection(FireStoreCollections.SUB_CATEGORIES)
    .where('storeId', '==', data.storeId)
    .where('categoryId', '==', data.categoryId)
    .where('nameLower', '==', nameLower)
    .where('isActive', '==', true)
    .get();

  const isDuplicate = duplicateCheck.docs.some(doc => doc.id !== id);
  if (isDuplicate) {
    throw new Error('subCategoryExists');
  }

  await firestore().collection(FireStoreCollections.SUB_CATEGORIES).doc(id).update({
    name: trimmedName,
    nameLower,
    updatedAt: serverTimestamp(),
  });
}

// Soft delete a sub-category
async function deleteSubCategory(id: string): Promise<void> {
  await firestore().collection(FireStoreCollections.SUB_CATEGORIES).doc(id).update({
    isActive: false,
    updatedAt: serverTimestamp(),
  });
}

export {
  getSubCategories,
  createSubCategory,
  updateSubCategory,
  deleteSubCategory,
};
