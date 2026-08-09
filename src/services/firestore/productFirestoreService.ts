import firestore, {serverTimestamp} from '@react-native-firebase/firestore';
import {FireStoreCollections} from '../../config/common/firestoreCollections';
import {
  IGetProductsParams,
  IGetProductsResponse,
  IGetProductsWithDetailsResponse,
  IProduct,
  IProductRequestBody,
  IProductTable,
} from '../../config/models/product';

function generateSearchTokens(text: string): string[] {
  const tokens = new Set<string>();
  const normalizedText = text.toLowerCase().trim();

  // Split by spaces and create tokens
  const words = normalizedText.split(/\s+/);

  words.forEach(word => {
    // Add full word
    tokens.add(word);

    // Add n-grams (substrings) for partial matching
    for (let i = 0; i < word.length; i++) {
      for (let j = i + 2; j <= word.length; j++) {
        tokens.add(word.substring(i, j));
      }
    }
  });

  return Array.from(tokens);
}

async function createNewProduct(
  productData: IProductRequestBody,
): Promise<{success: boolean; productId: string | null; message: string}> {
  try {
    const storeCollection = firestore().collection(FireStoreCollections.PRODUCTS);
    const newProductRef = storeCollection.doc();
    const productId = newProductRef.id;

    const newProductData = {
      ...productData,
      id: productId,
      nameLower: productData.name?.toLowerCase(),
      searchTokens: generateSearchTokens(productData.name.toLowerCase() || ''),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isActive: true,
    };
    await newProductRef.set(newProductData);
    const productDetails = await getProductById(productId);
    if (productDetails) {
      return Promise.resolve({
        success: true,
        data: productDetails,
        productId: productId,
        message: 'Product Added Successfully',
      });
    } else {
      return Promise.reject('Product creation failed');
    }
  } catch (error) {
    return Promise.reject({
      success: false,
      userId: null,
      message: `Error creating Product: ${error}`,
    });
  }
}

async function updateProductDetails(
  productId: string,
  productData: IProductRequestBody,
): Promise<{success: boolean; productId: string | null; message: string}> {
  try {
    const newProductData = {
      ...productData,
      id: productId,
      nameLower: productData.name?.toLowerCase(),
      searchTokens: generateSearchTokens(productData.name.toLowerCase() || ''),
      updatedAt: serverTimestamp(),
    };
    await firestore()
      .collection(FireStoreCollections.PRODUCTS)
      .doc(productId)
      .update(newProductData);
    const productDetails = await getProductById(productId);
    if (productDetails) {
      return Promise.resolve({
        success: true,
        data: productDetails,
        productId: productId,
        message: 'Product updated  Successfully',
      });
    } else {
      return Promise.reject('Product creation failed');
    }
  } catch (error) {
    return Promise.reject({
      success: false,
      userId: null,
      message: `Error creating Product: ${error}`,
    });
  }
}

async function getProductsList({
  storeId,
  categoryId,
  limit = 10,
  lastDoc,
  isActive,
  location,
}: IGetProductsParams): Promise<IGetProductsResponse> {
  try {
    // Strategy 1: Try with ordering first (requires composite index)
    let query: any = firestore().collection(FireStoreCollections.PRODUCTS);

    // Add category filter if provided
    if (isActive !== undefined) {
      query = query.where('isActive', '==', isActive);
    }
    if (storeId) {
      query = query.where('storeId', '==', storeId);
    }
    if (categoryId) {
      query = query.where('categoryId', '==', categoryId);
    }

    // Add ordering - this will work once you create the index
    query = query.orderBy('createdAt', 'desc');

    // Add pagination
    if (lastDoc) {
      query = query.startAfter(lastDoc);
    }

    if (location) {
      query = query.where('store.city', '==', location); // or 'store.state'
    }

    query = query.limit(limit);

    const snapshot = await query.get();

    const products: IProductTable[] = snapshot.docs.map(
      doc =>
        ({
          ...doc.data(),
          id: doc.id,
        }) as unknown as IProductTable,
    );

    // Get the last document for next page
    const lastDocument = snapshot.docs[snapshot.docs.length - 1];

    // Check if there are more documents
    const hasMore = snapshot.docs.length === limit;

    return {
      products,
      lastDoc: lastDocument,
      hasMore,
      total: products.length,
    };
  } catch (error: any) {
    console.error('Error fetching products with ordering:', error);
    throw new Error(`Failed to fetch products: ${error}`);
  }
}

async function getProductById(productId: string): Promise<IProduct | null> {
  try {
    const productDoc = await firestore()
      .collection(FireStoreCollections.PRODUCTS)
      .doc(productId)
      .get();
    if (productDoc.exists()) {
      const productData = {id: productDoc.id, ...productDoc.data()};
      return productData as unknown as IProduct;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting product by ID:', error);
    return null;
  }
}

async function updateProductStatus(
  productId: string,
  isActive: boolean,
): Promise<{success: boolean; message: string; productId: string}> {
  try {
    await firestore().collection(FireStoreCollections.PRODUCTS).doc(productId).update({
      isActive: isActive,
      updatedAt: serverTimestamp(),
    });
    return {
      success: true,
      message: 'Product status updated successfully',
      productId: productId,
    };
  } catch (error) {
    console.error('Error updating user roles:', error);
    return {
      success: false,
      message: `Error updating user roles: ${error}`,
      productId: productId,
    };
  }
}

async function deleteProduct(productId: string): Promise<{success: boolean; message: string; productId: string}> {
  try {
    await firestore().collection(FireStoreCollections.PRODUCTS).doc(productId).delete();
    return {
      success: true,
      message: 'Product deleted successfully',
      productId: productId,
    };
  } catch (error) {
    console.error('Error deleting product:', error);
    return {
      success: false,
      message: `Error deleting product: ${error}`,
      productId: productId,
    };
  }
}

async function searchProductsByName(productName: string): Promise<IProductTable[]> {
  try {
    const searchTerm = productName.toLowerCase();
    const query = firestore()
      .collection(FireStoreCollections.PRODUCTS)
      .where('searchTokens', 'array-contains', searchTerm)
      .limit(20);

    const snapshot = await query.get();

    const products: IProductTable[] = snapshot.docs.map(
      doc =>
        ({
          ...doc.data(),
          id: doc.id,
        }) as unknown as IProductTable,
    );

    if (products.length === 0) return products;

    const uniqueStoreIds = [...new Set(products.map(p => p.storeId).filter(Boolean))];
    const uniqueCategoryIds = [...new Set(products.map(p => p.categoryId).filter(Boolean))];

    const [storesMap, categoriesMap] = await Promise.all([
      batchGetStores(uniqueStoreIds),
      batchGetCategories(uniqueCategoryIds),
    ]);

    const productsWithDetails: IProductTable[] = products.map(product => ({
      ...product,
      store: storesMap[product.storeId],
      category: categoriesMap[product.categoryId],
    })) as unknown as IProductTable[];

    return productsWithDetails;
  } catch (error: any) {
    console.error('Error searching products by name:', error);
    throw new Error(`Failed to search products: ${error}`);
  }
}

async function getProductsListWithDetails({
  storeId,
  categoryId,
  limit = 10,
  lastDoc,
  isActive,
  location,
}: IGetProductsParams): Promise<IGetProductsWithDetailsResponse> {
  try {
    // First, get the products using the existing logic
    const productsResponse = await getProductsList({
      storeId,
      categoryId,
      limit,
      lastDoc,
      isActive,
      location,
    });

    if (productsResponse.products.length === 0) {
      return {
        products: [],
        lastDoc: productsResponse.lastDoc,
        hasMore: productsResponse.hasMore,
        total: 0,
      };
    }

    // Extract unique store IDs and category IDs from products
    const uniqueStoreIds = [...new Set(productsResponse.products.map(p => p.storeId).filter(Boolean))];
    const uniqueCategoryIds = [...new Set(productsResponse.products.map(p => p.categoryId).filter(Boolean))];

    // Batch fetch stores and categories
    const [storesMap, categoriesMap] = await Promise.all([
      batchGetStores(uniqueStoreIds),
      batchGetCategories(uniqueCategoryIds),
    ]);

    // Combine products with their store and category details
    const productsWithDetails: IProduct[] = productsResponse.products.map(product => ({
      ...product,
      store: storesMap[product.storeId],
      category: categoriesMap[product.categoryId],
    }));

    return {
      products: productsWithDetails,
      lastDoc: productsResponse.lastDoc,
      hasMore: productsResponse.hasMore,
      total: productsWithDetails.length,
    };
  } catch (error: any) {
    console.error('Error fetching products with details:', error);
    throw new Error(`Failed to fetch products with details: ${error}`);
  }
}

async function batchGetStores(storeIds: string[]): Promise<Record<string, any>> {
  try {
    if (storeIds.length === 0) return {};

    const storesMap: Record<string, any> = {};
    const batch = firestore().batch();

    // Firestore batch read limit is 500, but we'll use smaller chunks for better performance
    const chunks = chunkArray(storeIds, 100);

    for (const chunk of chunks) {
      const storePromises = chunk.map(storeId =>
        firestore().collection(FireStoreCollections.STORES).doc(storeId).get(),
      );

      const storeSnapshots = await Promise.all(storePromises);

      storeSnapshots.forEach((snapshot, index) => {
        if (snapshot.exists()) {
          storesMap[chunk[index]] = {
            id: snapshot.id,
            ...snapshot.data(),
          };
        }
      });
    }

    return storesMap;
  } catch (error) {
    console.error('Error batch fetching stores:', error);
    return {};
  }
}

async function batchGetCategories(categoryIds: string[]): Promise<Record<string, any>> {
  try {
    if (categoryIds.length === 0) return {};

    const categoriesMap: Record<string, any> = {};

    // Firestore batch read limit is 500, but we'll use smaller chunks for better performance
    const chunks = chunkArray(categoryIds, 100);

    for (const chunk of chunks) {
      const categoryPromises = chunk.map(categoryId =>
        firestore().collection(FireStoreCollections.CATEGORIES).doc(categoryId).get(),
      );

      const categorySnapshots = await Promise.all(categoryPromises);

      categorySnapshots.forEach((snapshot, index) => {
        if (snapshot.exists()) {
          categoriesMap[chunk[index]] = {
            id: snapshot.id,
            ...snapshot.data(),
          };
        }
      });
    }

    return categoriesMap;
  } catch (error) {
    console.error('Error batch fetching categories:', error);
    return {};
  }
}

// Helper function to split array into chunks
function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}

export async function updateAllProductsWithSearchTokens() {
  try {
    const snapshot = await firestore().collection(FireStoreCollections.PRODUCTS).get();

    const batch = firestore().batch();
    let batchCount = 0;

    for (const doc of snapshot.docs) {
      const data = doc.data();
      const productName = data.name || '';
      const searchTokens = generateSearchTokens(productName);

      batch.update(doc.ref, {
        searchTokens: searchTokens,
        nameLower: productName.toLowerCase(),
      });

      batchCount++;

      // Firestore batch limit is 500 operations
      if (batchCount === 500) {
        await batch.commit();
        batchCount = 0;
      }
    }

    // Commit remaining operations
    if (batchCount > 0) {
      await batch.commit();
    }
  } catch (error) {
    console.error('Error updating products:', error);
  }
}
export {
  createNewProduct,
  getProductsList,
  getProductsListWithDetails,
  getProductById,
  updateProductDetails,
  updateProductStatus,
  deleteProduct,
  searchProductsByName,
};
