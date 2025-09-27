// navigation/types.ts
import {CompositeNavigationProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {IProduct} from '../config/models/product';
// Define the param list for the root stack
export type RootStackParamList = {
  AuthStack: undefined | {screen?: keyof AuthStackParamList; params?: any};
  HomeStack: {screen?: keyof HomeStackParamList; params?: any};
  BottomTabStack: {screen?: keyof BottomTabStackParamList; params?: any};
  RegisterUserStack: {screen?: keyof RegisterUserStackParamList; params?: any};
};

// Define the param list for the auth stack
export type AuthStackParamList = {
  Login: undefined;
  ForgotPassword: undefined;
  GettingStarted: undefined;
};

// Define the param list for the home stack
export type HomeStackParamList = {
  Home: undefined;
  Profile: undefined;
  Settings: undefined;
  RegisterUserStack: {screen?: keyof RegisterUserStackParamList; params?: any};
  VendorStack: {screen?: keyof VendorStackParamList; params?: any};
};

export type FavoritesStackParamList = {
  Favorites: undefined;
  VendorStack: {screen?: keyof VendorStackParamList; params?: any};
};
export type CartStackParamList = {
  Cart: undefined;
  VendorStack: {screen?: keyof VendorStackParamList; params?: any};
};
export type VendorStackParamList = {
  Vendor: undefined;
  RegisterUserStack: {screen?: keyof RegisterUserStackParamList; params?: any};
  ProductUpdate?: {
    productDetails?: IProduct;
    isUpdate?: boolean;
    isVendor?: boolean;
  };
  ProductDetails: {
    productId: string;
    isStackChange?: boolean;
    isVendor?: boolean;
  };
};
export type RegisterUserStackParamList = {
  UserDetails: {
    isEdit?: boolean;
  };
  ChooseUserType: undefined;
  StoreDetails: undefined;
};

export type BottomTabStackParamList = {
  HomeTab: undefined;
  Orders: undefined;
  ProfileTab: undefined;
  VendorTab: undefined;
};

// Create a combined param list for easier navigation
export type RootParamList = RootStackParamList & HomeStackParamList & AuthStackParamList;

// Navigation props for screens in AuthStack
export type AuthStackNavigationProp = StackNavigationProp<AuthStackParamList>;

// Navigation props for screens in HomeStack
export type HomeScreenNavigationProp = CompositeNavigationProp<
  StackNavigationProp<HomeStackParamList, 'Home'>,
  StackNavigationProp<RootStackParamList>
>;
export type VendorScreenNavigationProp = CompositeNavigationProp<
  StackNavigationProp<VendorStackParamList, 'Vendor'>,
  StackNavigationProp<RootStackParamList>
>;
export type FavoritesScreenNavigationProp = CompositeNavigationProp<
  StackNavigationProp<FavoritesStackParamList, 'Favorites'>,
  StackNavigationProp<RootStackParamList>
>;
export type CartScreenNavigationProp = CompositeNavigationProp<
  StackNavigationProp<CartStackParamList, 'Cart'>,
  StackNavigationProp<RootStackParamList>
>;
export type UserRegisterScreenNavigationProp = CompositeNavigationProp<
  StackNavigationProp<RegisterUserStackParamList, 'UserDetails'>,
  StackNavigationProp<RootStackParamList>
>;

// Root navigation prop - can navigate to any screen
export type RootNavigationProp = StackNavigationProp<RootParamList>;
