import React, {useMemo} from 'react';
import {StyleSheet, Text, View, Image} from 'react-native';

import TKHeader from '../../components/Common/TKHeader/TKHeader';
import {strings} from '../../utils/language/langauageUtils';
import {moderateScale} from '../../config/styles/responsiveSize';
import TKButton from '../../components/Common/TKButton/TKButton';
import {colors} from '../../config/styles/colors';
import {navigationStrings} from '../../navigation/navigationStrings';
import {useGetStoreDetails} from '../../react-queries/store/storeQueries';
import TKRenderIf from '../../components/Common/TKRenderIf/TKRenderIf';
import StoreDetailsCard from '../../components/Vendor/StoreDetailsCard/StoreDetailsCard';
import {VendorScreenNavigationProp, VendorStackParamList} from '../../navigation/rootparamstypes';
import CategoryHeaderTabBar from '../../components/Vendor/CategoryHeaderTabBar/CategoryHeaderTabBar';
import {VendorHeaderSkeleton} from '../../components/Common/Skeleton';
import {useGetCategoriesList} from '../../react-queries/categories/categoriesQuery';
import {CategoryListHeaderTabs} from '../../config/common/constants';
import {RouteProp} from '@react-navigation/native';
import {VendorService} from '../../services/vendor/vendorService';
import {fontFamily} from '../../config/styles/fontFamily';
import {useAppSelector} from '../../redux/hooks';
import {updateGuestStatus} from '../../redux/userSlice';

interface Props {
  navigation: VendorScreenNavigationProp;
  route: RouteProp<VendorStackParamList, 'Vendor'>;
}

const Vendor: React.FC<Props> = ({navigation, route}) => {
  const {isFromProductDetails = false, storeId = ''} = route.params || {};
  const {data: storeDetails, isPending} = useGetStoreDetails(storeId);
  const {data: categoryList} = useGetCategoriesList();
  const {user, isGuest} = useAppSelector(state => state.user);

  const isStoreOwner = useMemo(() => {
    if (!storeDetails) return false;
    const currentUserId = user?.user?.id;
    const currentUserEmail = user?.user?.email?.trim().toLowerCase();
    const storeEmail = storeDetails.email?.trim().toLowerCase();
    const storeUserId = storeDetails.userId;

    if (currentUserId && storeUserId && currentUserId === storeUserId) return true;
    if (currentUserEmail && storeEmail && currentUserEmail === storeEmail) return true;
    return false;
  }, [user, storeDetails]);

  const isStoreInactive = useMemo(() => {
    if (!storeDetails) return false;
    const status = storeDetails.vendorStatus?.toLowerCase();
    return status === 'inactive' || status === 'rejected' || status === 'pending';
  }, [storeDetails]);

  const getInactiveMessage = () => {
    const status = storeDetails?.vendorStatus?.toLowerCase();
    if (status === 'pending') {
      return {
        title: 'Store Pending Approval',
        subtitle: 'This store is pending approval and cannot be viewed yet.',
      };
    }
    if (status === 'rejected') {
      return {
        title: 'Store Rejected',
        subtitle: 'This store has been rejected and cannot be viewed.',
      };
    }
    return {
      title: 'Store Inactive',
      subtitle: 'This store is currently inactive and cannot be viewed.',
    };
  };

  const handleLoginPress = () => {
    updateGuestStatus(false);
  };

  const handleAddStore = () => {
    navigation.navigate(navigationStrings.REGISTER_USER_STACK, {
      screen: navigationStrings.STORE_DETAILS,
      params: {isEdit: false},
    });
  };

  const storeShareUrl = useMemo(() => {
    if (!storeDetails?.id) return '';
    if (storeDetails.storeUrl) return storeDetails.storeUrl;
    if (storeDetails.slug) return `https://dealzhub.co.in/shop/${storeDetails.slug}`;
    if (storeDetails.storeName) {
      const fallbackSlug = storeDetails.storeName
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      if (fallbackSlug) {
        return `https://dealzhub.co.in/shop/${fallbackSlug}`;
      }
    }
    return `https://dealzhub.co.in/store-redirect?id=${storeDetails.id}`;
  }, [storeDetails]);

  const storeLogoUri =
    (storeDetails as any)?.logoUrl ||
    (storeDetails as any)?.logo ||
    (storeDetails as any)?.storeLogo ||
    (storeDetails as any)?.imageUrl ||
    (storeDetails as any)?.image;
  const storeInitial = storeDetails?.storeName ? storeDetails.storeName.charAt(0) : '';

  const handleQRPress = () => {
    if (storeDetails?.id) {
      navigation.navigate(navigationStrings.QR_CODE_SHARE, {
        qrValue: storeShareUrl,
        storeName: storeDetails.storeName || 'Store',
        storeLogo: storeLogoUri || undefined,
      });
    }
  };

  const renderHelpButton = () => {
    if (isPending || isFromProductDetails || (isGuest && !isFromProductDetails)) {
      return null;
    }
    // If viewing another vendor's store, do not render vendor status or Add Store
    if (storeId && !isStoreOwner) {
      return null;
    }
    if (storeDetails && !isFromProductDetails) {
      if (storeDetails.vendorStatus?.toUpperCase() === 'APPROVED') {
        return <></>;
      }
      return (
        <Text style={[style.statusText, {color: VendorService.getStoreStatusColors(storeDetails)}]}>
          {storeDetails.vendorStatus?.toUpperCase()}
        </Text>
      );
    }
    return <TKButton title={strings('labels.addStore')} type="tertiary" onPress={handleAddStore} />;
  };

  const headerList = useMemo(() => {
    const allProductsTab = {
      id: CategoryListHeaderTabs.ALL_PRODUCTS,
      title: strings('labels.allProducts'),
      key: 'all',
      image: null,
    };
    if (!categoryList) return [allProductsTab];
    const categoriesTabs =
      storeDetails?.categories
        ?.map(item => {
          const category = categoryList.find(cat => cat.id === item);
          return {
            id: category?.id,
            title: category?.name,
            key: category?.id,
            image: category?.image || null,
          };
        })
        ?.filter(item => !!item) ?? [];
    return [allProductsTab, ...categoriesTabs];
  }, [categoryList, storeDetails]);

  return (
    <View style={style.container}>
      <TKHeader
        header={storeDetails?.storeName ?? strings('labels.storeDetails')}
        containerStyle={style.headerContainer}
        rightComponent={renderHelpButton()}
        showBackButton={Boolean((isFromProductDetails || !!storeId) && navigation.canGoBack())}
        onBackPress={() => {
          if (navigation.canGoBack()) {
            navigation.goBack();
          } else {
            navigation.navigate(navigationStrings.BOTTOM_TAB_STACK as never);
          }
        }}
        qrValue={storeShareUrl || undefined}
        onQRPress={handleQRPress}
        logoUri={storeLogoUri || undefined}
        storeInitial={storeInitial || undefined}
      />
      <TKRenderIf isRender={isPending && !storeDetails}>
        <VendorHeaderSkeleton />
      </TKRenderIf>
      <TKRenderIf isRender={!isGuest || isFromProductDetails}>
        <TKRenderIf
          isRender={!!storeDetails && !!headerList?.length && (!isStoreInactive || isStoreOwner)}>
          <CategoryHeaderTabBar
            headerTabItems={headerList}
            storeDetails={storeDetails}
            isFromProductDetails={isFromProductDetails}
            renderStoreDetailsCard={() => (
              <StoreDetailsCard
                storeDetails={storeDetails!}
                navigation={navigation}
                isFromProductDetails={isFromProductDetails}
                isStoreOwner={isStoreOwner}
              />
            )}
          />
        </TKRenderIf>
      </TKRenderIf>

      <TKRenderIf isRender={!!storeDetails && isStoreInactive && !isStoreOwner}>
        <View style={style.inactiveContainer}>
          <Image
            source={require('../../assets/images/appLogo.png')}
            style={style.inactiveLogo}
            resizeMode="contain"
          />
          <Text style={style.guestTitle}>{getInactiveMessage().title}</Text>
          <Text style={style.guestSubtitle}>{getInactiveMessage().subtitle}</Text>
          <TKButton
            title="Go to Home Page"
            onPress={() => navigation.navigate(navigationStrings.BOTTOM_TAB_STACK as never)}
            type="primary"
            style={style.loginButton}
          />
        </View>
      </TKRenderIf>
      <TKRenderIf isRender={isGuest && !isFromProductDetails}>
        <View style={style.guestContainer}>
          <Text style={style.guestTitle}>Manage Your Store</Text>
          <Text style={style.guestSubtitle}>
            Login or register to become a vendor and manage your products.
          </Text>
          <TKButton
            title="Login / Register"
            onPress={handleLoginPress}
            type="primary"
            style={style.loginButton}
          />
        </View>
      </TKRenderIf>
      <TKRenderIf isRender={!isGuest && !storeDetails && !isPending && !isFromProductDetails}>
        <View style={style.guestContainer}>
          <Text style={style.guestTitle}>Create Your Store</Text>
          <Text style={style.guestSubtitle}>
            {"You don't have a store yet. Create one now to start selling your products."}
          </Text>
          <TKButton
            title={strings('labels.addStore')}
            onPress={handleAddStore}
            type="primary"
            style={style.loginButton}
          />
        </View>
      </TKRenderIf>
    </View>
  );
};

export default Vendor;

const style = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryBackgroundColor,
  },
  headerContainer: {
    paddingHorizontal: moderateScale(20),
  },
  buttonContainer: {
    marginVertical: moderateScale(16),
    marginHorizontal: moderateScale(16),
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: moderateScale(12),
    fontFamily: fontFamily.medium,
  },
  guestContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: moderateScale(30),
  },
  guestTitle: {
    fontSize: moderateScale(20),
    fontFamily: fontFamily.bold,
    color: colors.primaryTextColor,
    marginBottom: moderateScale(10),
  },
  guestSubtitle: {
    fontSize: moderateScale(14),
    fontFamily: fontFamily.regular,
    color: colors.secondaryTextColor,
    textAlign: 'center',
    marginBottom: moderateScale(30),
  },
  loginButton: {
    width: '100%',
  },
  inactiveContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: moderateScale(30),
    backgroundColor: colors.primaryBackgroundColor,
  },
  inactiveLogo: {
    width: moderateScale(100),
    height: moderateScale(100),
    marginBottom: moderateScale(20),
  },
});
