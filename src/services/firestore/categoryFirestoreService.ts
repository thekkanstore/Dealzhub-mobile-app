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
  {
    name: 'Electronic & Electric appliances',
    key: 'electronic_electric_appliances',
    isActive: true,
    image:
      'https://firebasestorage.googleapis.com/v0/b/thekkans.firebasestorage.app/o/categories%2FElectronic%20%26%20Electric%20appliances.png?alt=media&token=84107526-e25b-4a4e-a843-53589081e47a',
  },
  {
    name: 'Vehicle & Accessories',
    key: 'vehicle_accessories',
    isActive: true,
    image:
      'https://firebasestorage.googleapis.com/v0/b/thekkans.firebasestorage.app/o/categories%2FVehicle%20%26%20Accessories.png?alt=media&token=75f11771-b657-4ad4-ab61-b97359f89a4e',
  },
  {
    name: 'Building & Construction Materials',
    key: 'building_construction_materials',
    isActive: true,
    image:
      'https://firebasestorage.googleapis.com/v0/b/thekkans.firebasestorage.app/o/categories%2FBuilding%20%26%20Construction%20Materials.png?alt=media&token=10e98d50-682d-42d7-b371-607a668dfafa',
  },
  {
    name: 'Fashion',
    key: 'building_construction_materials',
    isActive: true,
    image:
      'https://firebasestorage.googleapis.com/v0/b/thekkans.firebasestorage.app/o/categories%2FFashion.png?alt=media&token=ddbaea0b-108b-457d-8c1e-1ba49fa559ae',
  },
  {
    name: 'Baby & kids / gift',
    key: 'baby_kids_gift',
    isActive: true,
    image:
      'https://firebasestorage.googleapis.com/v0/b/thekkans.firebasestorage.app/o/categories%2FBaby%20%26%20kids%20%3A%20gift.png?alt=media&token=b53dea9b-098e-4abc-8eaa-0e21bb51011f',
  },
  {
    name: 'stationery & toys',
    key: 'stationary_toys',
    isActive: true,
    image:
      'https://firebasestorage.googleapis.com/v0/b/thekkans.firebasestorage.app/o/categories%2Fstationery%20%26%20toys.png?alt=media&token=05aff6fc-01fe-4e56-bcc5-0d4c09bf8904',
  },
  {
    name: 'Beauty & personal care',
    key: 'beauty_personal_care',
    isActive: true,
    image:
      'https://firebasestorage.googleapis.com/v0/b/thekkans.firebasestorage.app/o/categories%2FBeauty%20%26%20personal%20care.png?alt=media&token=f179e4fe-0eba-4fa8-b13a-b3eb5b839003',
  },
  {
    name: 'Food & Drinks',
    key: 'food_drinks',
    isActive: true,
    image:
      'https://firebasestorage.googleapis.com/v0/b/thekkans.firebasestorage.app/o/categories%2FFood%20%26%20Drink.png?alt=media&token=7bc284cf-3295-4b5f-978b-06d291a9880d',
  },
  {
    name: 'Sports & fitness',
    key: 'sports_fitness',
    isActive: true,
    image:
      'https://firebasestorage.googleapis.com/v0/b/thekkans.firebasestorage.app/o/categories%2FSports%20%26%20fitness.png?alt=media&token=f63dc70e-d390-48e1-9432-ac2fa1e38997',
  },
  {
    name: 'Musical instrument',
    key: 'musical_instrument',
    isActive: true,
    image:
      'https://firebasestorage.googleapis.com/v0/b/thekkans.firebasestorage.app/o/categories%2FMusical%20instrument.png?alt=media&token=4bd33cfe-f571-44c1-9c5a-454a0823bde7',
  },
  {
    name: 'Education, learning & job',
    key: 'education_learning_job',
    isActive: true,
    image:
      'https://firebasestorage.googleapis.com/v0/b/thekkans.firebasestorage.app/o/categories%2FEducation%2C%20learning%20%26%20job.png?alt=media&token=4b09ba92-5446-44a8-aed1-ba9e8a6d13cb',
  },
  {
    name: 'Plant, seed & Gardening',
    key: 'plant_seed_gardening',
    isActive: true,
    image:
      'https://firebasestorage.googleapis.com/v0/b/thekkans.firebasestorage.app/o/categories%2FPlant%2C%20seed%20%26%20Gardening.png?alt=media&token=f58909d9-015e-4324-a87c-684d57a19c9b',
  },
  {
    name: 'Homemade product ',
    key: 'homemade_product',
    isActive: true,
    image:
      'https://firebasestorage.googleapis.com/v0/b/thekkans.firebasestorage.app/o/categories%2FHomemade%20product%20.png?alt=media&token=81b29fd5-d0fc-4d11-b42e-2f42d77f3a9f',
  },
  {
    name: 'fruits & vegitables',
    key: 'fruits_vegitables',
    isActive: true,
    image:
      'https://firebasestorage.googleapis.com/v0/b/thekkans.firebasestorage.app/o/categories%2Ffruits%20%26%20vegitables.png?alt=media&token=6341b96e-8a8d-4673-91b8-382dedd1c4e7',
  },
  {
    name: 'Furniture',
    key: 'furniture',
    isActive: true,
    image:
      'https://firebasestorage.googleapis.com/v0/b/thekkans.firebasestorage.app/o/categories%2FFurniture.png?alt=media&token=06eb8437-3b19-430d-bbf9-86e2412a0054',
  },
  {
    name: 'Mobile phone & accessories',
    key: 'mobile_phone_accessories',
    isActive: true,
    image:
      'https://firebasestorage.googleapis.com/v0/b/thekkans.firebasestorage.app/o/categories%2FMobile%20phone%20%26%20accessories.png?alt=media&token=1f8d4837-1488-4fcb-887e-83728aa04e03',
  },
  {
    name: 'Real Estate & property',
    key: 'real_estate_property',
    isActive: true,
    image:
      'https://firebasestorage.googleapis.com/v0/b/thekkans.firebasestorage.app/o/categories%2FReal%20Estate%20%26%20property.png?alt=media&token=fcf0abef-1b22-4453-a5f0-7ae4e6072376',
  },
  {
    name: 'Grocery & Essentials',
    key: 'grocery_essentials',
    isActive: true,
    image:
      'https://firebasestorage.googleapis.com/v0/b/thekkans.firebasestorage.app/o/categories%2FGrocery%20%26%20Essentials.png?alt=media&token=3c76b49d-38be-4934-8944-a5e6b7ca4f37',
  },
  {
    name: 'Events',
    key: 'events',
    isActive: true,
    image:
      'https://firebasestorage.googleapis.com/v0/b/thekkans.firebasestorage.app/o/categories%2FEvents.png?alt=media&token=99cb2a44-7c77-4ed2-86ed-590a6e567ab7',
  },
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
