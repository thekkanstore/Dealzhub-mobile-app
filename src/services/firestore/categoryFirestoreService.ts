import firestore, {serverTimestamp} from '@react-native-firebase/firestore';
import {FireStoreCollections} from '../../config/common/firestoreCollections';
import {ICategoryTable} from '../../config/models/category';

// Get all categories
async function getAllCategories(): Promise<ICategoryTable[]> {
  try {
    const categoriesSnapshot = await firestore()
      .collection(FireStoreCollections.CATEGORIES)
      .where('isActive', '==', true)
      .get();
    const categories = categoriesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as ICategoryTable[];

    return categories.sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error('Error getting categories:', error);
    return [];
  }
}

// Get specific category data
async function getCategoryById(categoryId: string): Promise<ICategoryTable | null> {
  try {
    const categoryDoc = await firestore()
      .collection(FireStoreCollections.CATEGORIES)
      .doc(categoryId)
      .get();

    if (categoryDoc.exists()) {
      return {
        id: categoryDoc.id,
        ...categoryDoc.data(),
      } as ICategoryTable;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting category:', error);
    return null;
  }
}

// Function to create a new category
async function createCategory(
  categoryData: Omit<ICategoryTable, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<{success: boolean; categoryId: string | null; message: string}> {
  try {
    const categoryCollection = firestore().collection(FireStoreCollections.CATEGORIES);
    const newCategoryData = {
      ...categoryData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isActive: categoryData.isActive ?? true,
    };

    const categoryRef = await categoryCollection.add(newCategoryData);

    // Verify the category was created
    const createdCategory = await getCategoryById(categoryRef.id);
    if (createdCategory) {
      return {
        success: true,
        categoryId: categoryRef.id,
        message: 'Category created successfully',
      };
    } else {
      return {
        success: false,
        categoryId: null,
        message: 'Category creation failed',
      };
    }
  } catch (error) {
    return {
      success: false,
      categoryId: null,
      message: `Error creating category: ${error}`,
    };
  }
}

// Function to seed multiple categories
async function seedCategories(
  categories: Array<Omit<ICategoryTable, 'id' | 'createdAt' | 'updatedAt'>>,
): Promise<{
  success: boolean;
  createdCategories: string[];
  failedCategories: string[];
  message: string;
}> {
  const createdCategories: string[] = [];
  const failedCategories: string[] = [];

  try {
    for (const category of categories) {
      const result = await createCategory(category);
      if (result.success && result.categoryId) {
        createdCategories.push(result.categoryId);
      } else {
        failedCategories.push(category.name);
      }
    }

    return {
      success: createdCategories.length > 0,
      createdCategories,
      failedCategories,
      message: `Created ${createdCategories.length} categories. Failed: ${failedCategories.length}`,
    };
  } catch (error) {
    return {
      success: false,
      createdCategories,
      failedCategories: categories.map(c => c.name),
      message: `Error seeding categories: ${error}`,
    };
  }
}

// Predefined categories to seed
const defaultCategories: Array<Omit<ICategoryTable, 'id' | 'createdAt' | 'updatedAt'>> = [
  {name: 'Electronics', isActive: true},
  {name: 'Clothing', isActive: true},
  {name: 'Food & Beverages', isActive: true},
  {name: 'Home & Garden', isActive: true},
  {name: 'Sports & Outdoors', isActive: true},
  {name: 'Books', isActive: true},
  {name: 'Health & Beauty', isActive: true},
  {name: 'Automotive', isActive: true},
  {name: 'Toys & Games', isActive: true},
  {name: 'Office Supplies', isActive: true},
];

// Function to seed default categories
function seedDefaultCategories(): Promise<{
  success: boolean;
  createdCategories: string[];
  failedCategories: string[];
  message: string;
}> {
  return seedCategories(defaultCategories);
}

export {
  getAllCategories,
  getCategoryById,
  createCategory,
  seedCategories,
  seedDefaultCategories,
  defaultCategories,
};
