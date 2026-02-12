import {Linking} from 'react-native';

/**
 * Deep Link Utility
 * Provides helper functions for handling deep links in the Thekkan Vendor app
 */

const DEEP_LINK_SCHEME = 'dealszhub://';

export const DeepLinkUtils = {
  /**
   * Opens a deep link URL
   * @param path - The path to navigate to (without the scheme)
   * @example openDeepLink('home')
   * @example openDeepLink('vendor/STORE123')
   */
  openDeepLink: async (path: string): Promise<boolean> => {
    try {
      const url = `${DEEP_LINK_SCHEME}${path}`;
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
        return true;
      }
      console.warn(`Cannot open deep link: ${url}`);
      return false;
    } catch (error) {
      console.error('Error opening deep link:', error);
      return false;
    }
  },

  /**
   * Navigation helpers for specific screens
   */
  navigate: {
    // Auth screens
    login: () => DeepLinkUtils.openDeepLink('login'),
    gettingStarted: () => DeepLinkUtils.openDeepLink('getting-started'),
    forgotPassword: () => DeepLinkUtils.openDeepLink('forgot-password'),

    // Main navigation
    home: () => DeepLinkUtils.openDeepLink('home'),
    profile: () => DeepLinkUtils.openDeepLink('profile'),
    settings: () => DeepLinkUtils.openDeepLink('settings'),
    search: () => DeepLinkUtils.openDeepLink('search'),

    // Vendor management
    myStore: () => DeepLinkUtils.openDeepLink('my-store'),
    createProduct: () => DeepLinkUtils.openDeepLink('my-store/product/update'),
    editProduct: (productId: string) =>
      DeepLinkUtils.openDeepLink(`my-store/product/update/${productId}`),
    viewMyProduct: (productId: string) =>
      DeepLinkUtils.openDeepLink(`my-store/product/${productId}`),

    // Store browsing
    vendors: () => DeepLinkUtils.openDeepLink('vendor'),
    vendorStore: (storeId: string) => DeepLinkUtils.openDeepLink(`vendor/${storeId}`),

    // Products
    product: (productId: string) => DeepLinkUtils.openDeepLink(`product/${productId}`),

    // Shopping
    cart: () => DeepLinkUtils.openDeepLink('cart'),
    favorites: () => DeepLinkUtils.openDeepLink('favorites'),

    // Registration
    userDetails: () => DeepLinkUtils.openDeepLink('register/user-details'),
    chooseUserType: () => DeepLinkUtils.openDeepLink('register/choose-type'),
    storeDetails: () => DeepLinkUtils.openDeepLink('register/store-details'),
  },

  /**
   * Get the initial URL that opened the app (if any)
   */
  getInitialURL: async (): Promise<string | null> => {
    try {
      return await Linking.getInitialURL();
    } catch (error) {
      console.error('Error getting initial URL:', error);
      return null;
    }
  },

  /**
   * Add a listener for deep link events
   * @param callback - Function to call when a deep link is received
   * @returns Cleanup function to remove the listener
   */
  addDeepLinkListener: (callback: (url: string) => void) => {
    const subscription = Linking.addEventListener('url', event => {
      callback(event.url);
    });

    return () => {
      subscription.remove();
    };
  },

  /**
   * Parse a deep link URL to extract the path and parameters
   * @param url - The deep link URL
   * @returns Object with path and params
   */
  parseDeepLink: (url: string) => {
    if (!url.startsWith(DEEP_LINK_SCHEME)) {
      return null;
    }

    const path = url.replace(DEEP_LINK_SCHEME, '');
    const [route, ...paramParts] = path.split('/');

    return {
      route,
      params: paramParts,
      fullPath: path,
    };
  },

  /**
   * Check if a URL is a valid deep link for this app
   */
  isValidDeepLink: (url: string): boolean => {
    return url.startsWith(DEEP_LINK_SCHEME);
  },

  /**
   * Build a deep link URL
   * @param path - The path
   * @param params - Optional parameters
   */
  buildDeepLink: (path: string, params?: Record<string, string>): string => {
    let url = `${DEEP_LINK_SCHEME}${path}`;

    if (params && Object.keys(params).length > 0) {
      const queryString = Object.entries(params)
        .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
        .join('&');
      url += `?${queryString}`;
    }

    return url;
  },
};

// Export individual functions for convenience
export const {
  openDeepLink,
  getInitialURL,
  addDeepLinkListener,
  parseDeepLink,
  isValidDeepLink,
  buildDeepLink,
} = DeepLinkUtils;

export default DeepLinkUtils;

