import firestore from '@react-native-firebase/firestore';
import {FireStoreCollections} from '../../config/common/firestoreCollections';

/**
 * Generates a clean base URL slug from a store name.
 * e.g., "My Super Store" -> "my-super-store"
 */
export const generateBaseSlug = (storeName: string): string => {
  if (!storeName || typeof storeName !== 'string') return 'shop';
  const cleaned = storeName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return cleaned || 'shop';
};

/**
 * Checks if a store slug is already registered in Firestore (O(1) point query).
 */
export const isStoreSlugTaken = async (
  slug: string,
  currentStoreId: string | null = null,
): Promise<boolean> => {
  if (!slug) return false;
  const normalizedSlug = slug.toLowerCase().trim();
  const snapshot = await firestore()
    .collection(FireStoreCollections.STORES)
    .where('slug', '==', normalizedSlug)
    .limit(1)
    .get();

  if (snapshot.empty) return false;
  if (currentStoreId && snapshot.docs[0].id === currentStoreId) return false;
  return true;
};

/**
 * Generates a unique store slug matching the web collision handling.
 * If the base slug is already used by another store, appends a random 4-digit number (e.g. -4829).
 */
export const generateUniqueStoreSlug = async (
  storeName: string,
  currentStoreId: string | null = null,
): Promise<string> => {
  const baseSlug = generateBaseSlug(storeName);
  try {
    const isTaken = await isStoreSlugTaken(baseSlug, currentStoreId);
    if (!isTaken) {
      return baseSlug;
    }

    let candidateSlug = '';
    let attempts = 0;
    do {
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      candidateSlug = `${baseSlug}-${randomNum}`;
      attempts++;
    } while (attempts < 5 && (await isStoreSlugTaken(candidateSlug, currentStoreId)));

    return candidateSlug;
  } catch (error) {
    console.error('Error generating unique store slug:', error);
    return baseSlug;
  }
};
