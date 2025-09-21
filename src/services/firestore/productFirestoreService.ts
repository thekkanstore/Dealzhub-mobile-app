import firestore, {serverTimestamp} from '@react-native-firebase/firestore';
import {FireStoreCollections} from '../../config/common/firestoreCollections';
import {
  IGetProductsParams,
  IGetProductsResponse,
  IProduct,
  IProductRequestBody,
  IProductTable,
} from '../../config/models/product';

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

async function getProductsByStore({
  storeId,
  categoryId,
  limit = 10,
  lastDoc,
}: IGetProductsParams): Promise<IGetProductsResponse> {
  try {
    // Strategy 1: Try with ordering first (requires composite index)
    let query = firestore()
      .collection(FireStoreCollections.PRODUCTS)
      .where('storeId', '==', storeId)
      .where('isActive', '==', true);

    // Add category filter if provided
    if (categoryId) {
      query = query.where('categoryId', '==', categoryId);
    }

    // Add ordering - this will work once you create the index
    query = query.orderBy('createdAt', 'desc');

    // Add pagination
    if (lastDoc) {
      query = query.startAfter(lastDoc);
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

export {createNewProduct, getProductsByStore, getProductById, updateProductDetails};
