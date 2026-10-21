import AsyncStorage from '@react-native-async-storage/async-storage';
import {getProductById} from '../../services/firestore/productFirestoreService';

export const CART_STORAGE_KEY = 'dealzhub_store_carts';

export interface LocalCartItem {
  id: string;
  productId: string;
  name: string;
  image?: string | null;
  images?: string[] | null;
  actualPrice?: number | string;
  discountPrice?: number | string;
  unitPrice: number;
  quantity: number;
  cartQuantity: number;
  selectedSize?: string | null;
  selectedWeight?: string | null;
  unit?: string;
  unitValue?: number;
  storeId: string;
  store?: any;
  itemTotalPrice: number;
  addedAt: number;
}

export type LocalStoreCarts = Record<string, LocalCartItem[]>;

/**
 * Retrieves the store carts persisted in local device cache (AsyncStorage).
 */
export const getLocalStoreCarts = async (): Promise<LocalStoreCarts> => {
  try {
    const raw = await AsyncStorage.getItem(CART_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (error) {
    console.error('Error reading local store carts:', error);
    return {};
  }
};

/**
 * Persists the store carts into local device cache.
 */
export const saveLocalStoreCarts = async (carts: LocalStoreCarts): Promise<void> => {
  try {
    await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(carts));
  } catch (error) {
    console.error('Error saving local store carts:', error);
  }
};

/**
 * Clears the local store carts from AsyncStorage.
 */
export const clearLocalStoreCarts = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(CART_STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing local store carts:', error);
  }
};

/**
 * Adds an item to the local cached store carts (for guest / non-logged-in sessions).
 */
export const addLocalCartItem = async (
  productId: string,
  options?: {
    quantity?: number;
    selectedSize?: string | null;
    selectedWeight?: string | null;
    unitPrice?: number;
    productData?: any;
  },
): Promise<LocalStoreCarts> => {
  try {
    const storeCarts = await getLocalStoreCarts();
    let productData = options?.productData;

    if (!productData) {
      try {
        productData = await getProductById(productId);
      } catch (err) {
        console.warn('Could not fetch product for local cart:', err);
      }
    }

    const storeId =
      productData?.storeId || productData?.store?.id || 'default_store';
    const quantity = Math.max(1, options?.quantity || 1);
    const selectedSize = options?.selectedSize || null;
    const selectedWeight = options?.selectedWeight || null;

    const unitPrice =
      options?.unitPrice !== undefined
        ? options.unitPrice
        : parseFloat(
            String(
              productData?.discountPrice ||
                productData?.price ||
                productData?.actualPrice ||
                '0',
            ),
          ) || 0;

    const storeItems = storeCarts[storeId] || [];
    const existingIndex = storeItems.findIndex(item => {
      const matchId = item.id === productId || item.productId === productId;
      const matchSize = (item.selectedSize || null) === selectedSize;
      const matchWeight = (item.selectedWeight || null) === selectedWeight;
      return matchId && matchSize && matchWeight;
    });

    let updatedStoreItems = [...storeItems];
    if (existingIndex > -1) {
      const existing = updatedStoreItems[existingIndex];
      const newQty = (existing.quantity || existing.cartQuantity || 1) + quantity;
      updatedStoreItems[existingIndex] = {
        ...existing,
        quantity: newQty,
        cartQuantity: newQty,
        unitPrice,
        itemTotalPrice: Math.round(unitPrice * newQty * 100) / 100,
      };
    } else {
      updatedStoreItems.push({
        id: productId,
        productId,
        name: productData?.name || 'Product',
        image:
          (productData?.images && productData.images[0]) ||
          productData?.image ||
          '',
        images: productData?.images || [],
        actualPrice: productData?.actualPrice || 0,
        discountPrice: productData?.discountPrice || 0,
        unitPrice,
        quantity,
        cartQuantity: quantity,
        selectedSize,
        selectedWeight,
        unit: productData?.unit || 'pcs',
        unitValue: productData?.unitValue || 1,
        storeId,
        store: productData?.store || null,
        itemTotalPrice: Math.round(unitPrice * quantity * 100) / 100,
        addedAt: Date.now(),
      });
    }

    const updatedStoreCarts: LocalStoreCarts = {
      ...storeCarts,
      [storeId]: updatedStoreItems,
    };

    await saveLocalStoreCarts(updatedStoreCarts);
    return updatedStoreCarts;
  } catch (error) {
    console.error('Error adding to local cart:', error);
    return getLocalStoreCarts();
  }
};

/**
 * Updates item quantity in local cache, removing if quantity <= 0.
 */
export const updateLocalCartQuantity = async (
  storeId: string,
  itemMatch: {
    id: string;
    selectedSize?: string | null;
    selectedWeight?: string | null;
  },
  newQuantity: number,
): Promise<LocalStoreCarts> => {
  const storeCarts = await getLocalStoreCarts();
  const storeItems = storeCarts[storeId] || [];

  const existingIndex = storeItems.findIndex(item => {
    const matchId = item.id === itemMatch.id || item.productId === itemMatch.id;
    const matchSize = (item.selectedSize || null) === (itemMatch.selectedSize || null);
    const matchWeight = (item.selectedWeight || null) === (itemMatch.selectedWeight || null);
    return matchId && matchSize && matchWeight;
  });

  if (existingIndex === -1) {
    return storeCarts;
  }

  let updatedStoreItems = [...storeItems];
  if (newQuantity <= 0) {
    updatedStoreItems.splice(existingIndex, 1);
  } else {
    const item = updatedStoreItems[existingIndex];
    const uPrice =
      item.unitPrice !== undefined
        ? item.unitPrice
        : parseFloat(String(item.discountPrice || item.actualPrice || '0')) || 0;
    updatedStoreItems[existingIndex] = {
      ...item,
      quantity: newQuantity,
      cartQuantity: newQuantity,
      itemTotalPrice: Math.round(uPrice * newQuantity * 100) / 100,
    };
  }

  const updatedStoreCarts = {...storeCarts};
  if (updatedStoreItems.length === 0) {
    delete updatedStoreCarts[storeId];
  } else {
    updatedStoreCarts[storeId] = updatedStoreItems;
  }

  await saveLocalStoreCarts(updatedStoreCarts);
  return updatedStoreCarts;
};

/**
 * Clears an entire store cart in local cache.
 */
export const clearLocalStoreCart = async (
  storeId: string,
): Promise<LocalStoreCarts> => {
  const storeCarts = await getLocalStoreCarts();
  const updatedStoreCarts = {...storeCarts};
  delete updatedStoreCarts[storeId];
  await saveLocalStoreCarts(updatedStoreCarts);
  return updatedStoreCarts;
};

/**
 * Removes a product from all local store carts.
 */
export const removeLocalCartItem = async (
  productId: string,
): Promise<LocalStoreCarts> => {
  const storeCarts = await getLocalStoreCarts();
  const updatedStoreCarts: LocalStoreCarts = {};

  for (const [sId, items] of Object.entries(storeCarts)) {
    if (Array.isArray(items)) {
      const remaining = items.filter(
        item => item.id !== productId && item.productId !== productId,
      );
      if (remaining.length > 0) {
        updatedStoreCarts[sId] = remaining;
      }
    }
  }

  await saveLocalStoreCarts(updatedStoreCarts);
  return updatedStoreCarts;
};

/**
 * Merges local guest store carts with cloud store carts upon login.
 */
export const mergeLocalCartsWithCloud = (
  cloudStoreCarts: Record<string, any[]>,
  localStoreCarts: Record<string, any[]>,
): {mergedCarts: Record<string, any[]>; hasChanges: boolean} => {
  let hasChanges = false;
  const mergedCarts: Record<string, any[]> = {...cloudStoreCarts};

  Object.entries(localStoreCarts || {}).forEach(([sId, items]) => {
    if (!Array.isArray(items) || items.length === 0) return;
    if (!mergedCarts[sId] || mergedCarts[sId].length === 0) {
      mergedCarts[sId] = items;
      hasChanges = true;
    } else {
      const currentStoreItems = [...mergedCarts[sId]];
      items.forEach(localItem => {
        const existIdx = currentStoreItems.findIndex(
          e =>
            (e.productId || e.id) === (localItem.productId || localItem.id) &&
            (e.selectedSize || null) === (localItem.selectedSize || null) &&
            (e.selectedWeight || null) === (localItem.selectedWeight || null),
        );
        if (existIdx > -1) {
          const maxQty = Math.max(
            currentStoreItems[existIdx].quantity || 1,
            localItem.quantity || 1,
          );
          if (maxQty !== currentStoreItems[existIdx].quantity) {
            hasChanges = true;
          }
          currentStoreItems[existIdx].quantity = maxQty;
          currentStoreItems[existIdx].cartQuantity = maxQty;
          const uPrice =
            currentStoreItems[existIdx].unitPrice !== undefined
              ? currentStoreItems[existIdx].unitPrice
              : parseFloat(
                  String(
                    currentStoreItems[existIdx].discountPrice ||
                      currentStoreItems[existIdx].actualPrice ||
                      '0',
                  ),
                ) || 0;
          currentStoreItems[existIdx].itemTotalPrice =
            Math.round(uPrice * maxQty * 100) / 100;
        } else {
          currentStoreItems.push(localItem);
          hasChanges = true;
        }
      });
      mergedCarts[sId] = currentStoreItems;
    }
  });

  return {mergedCarts, hasChanges};
};
