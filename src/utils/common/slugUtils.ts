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
 * Generates a unique store slug matching the web collision handling.
 * If the base slug is already used by another store, appends a random 4-digit number (e.g. -4829).
 */
export const generateUniqueStoreSlug = async (
  storeName: string,
  currentStoreId: string | null = null,
): Promise<string> => {
  const baseSlug = generateBaseSlug(storeName);
  try {
    const snapshot = await firestore().collection(FireStoreCollections.STORES).get();

    const usedSlugs = new Set<string>();
    const storeList: Array<{id: string; slug?: string; storeName?: string}> = [];

    snapshot.forEach(docSnap => {
      if (currentStoreId && docSnap.id === currentStoreId) {
        return; // Exclude current store
      }
      const data = docSnap.data();
      storeList.push({id: docSnap.id, ...data});
      if (data.slug) {
        usedSlugs.add(data.slug.toLowerCase().trim());
      }
    });

    const assignedSlugs = new Set(usedSlugs);
    for (const s of storeList) {
      if (!s.slug && s.storeName) {
        const sBase = generateBaseSlug(s.storeName);
        assignedSlugs.add(sBase);
      }
    }

    // If baseSlug is not taken by any other store, use it cleanly without numbers
    if (!assignedSlugs.has(baseSlug)) {
      return baseSlug;
    }

    // If already in use, append a random 4-digit number (e.g., -4829)
    let candidateSlug = '';
    do {
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      candidateSlug = `${baseSlug}-${randomNum}`;
    } while (assignedSlugs.has(candidateSlug));

    return candidateSlug;
  } catch (error) {
    console.error('Error generating unique store slug:', error);
    return baseSlug;
  }
};
