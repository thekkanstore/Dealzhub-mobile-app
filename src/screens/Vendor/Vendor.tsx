import React, {useMemo} from 'react';
import {StyleSheet, Text, View} from 'react-native';

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
  const isGuest = useAppSelector(state => state.user.isGuest);

  const handleLoginPress = () => {
    updateGuestStatus(false);
  };

  const handleAddStore = () => {
    navigation.navigate(navigationStrings.REGISTER_USER_STACK, {
      screen: navigationStrings.STORE_DETAILS,
      params: {isEdit: false},
    });
  };

  const handleQRPress = () => {
    if (storeDetails?.id) {
      navigation.navigate(navigationStrings.QR_CODE_SHARE, {
        qrValue: `https://dealzhub.co.in/store-redirect?id=${storeDetails.id}`,
        storeName: storeDetails.storeName || 'Store',
      });
    }
  };

  const renderHelpButton = () => {
    if (isPending || isFromProductDetails || (isGuest && !isFromProductDetails)) {
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
    if (!categoryList) return [];
    const headerList =
      storeDetails?.categories
        ?.map(item => {
          const category = categoryList.find(cat => cat.id === item);
          return {
            id: category?.id,
            title: category?.name,
            key: category?.id,
          };
        })
        ?.filter(item => !!item) ?? [];
    return [
      {
        id: CategoryListHeaderTabs.ALL_PRODUCTS,
        title: strings('labels.allProducts'),
        key: 'all',
      },
      ...headerList,
    ];
  }, [categoryList, storeDetails]);

  return (
    <View style={style.container}>
      <TKHeader
        header={storeDetails?.storeName ?? strings('labels.storeDetails')}
        containerStyle={style.headerContainer}
        rightComponent={renderHelpButton()}
        showBackButton={isFromProductDetails}
        qrValue={storeDetails?.id ? `https://dealzhub.co.in/store-redirect?id=${storeDetails.id}` : undefined}
        onQRPress={handleQRPress}
      />
      <TKRenderIf isRender={!isGuest || isFromProductDetails}>
        <TKRenderIf isRender={!!storeDetails && !!headerList?.length}>
          <StoreDetailsCard
            // @ts-expect-error TS2322
            storeDetails={storeDetails}
            navigation={navigation}
            isFromProductDetails={isFromProductDetails}
          />
          <CategoryHeaderTabBar
            headerTabItems={headerList}
            storeDetails={storeDetails}
            isFromProductDetails={isFromProductDetails}
          />
        </TKRenderIf>
      </TKRenderIf>
      <TKRenderIf isRender={isGuest && !isFromProductDetails}>
        <View style={style.guestContainer}>
          <Text style={style.guestTitle}>Manage Your Store</Text>
          <Text style={style.guestSubtitle}>Login or register to become a vendor and manage your products.</Text>
          <TKButton title="Login / Register" onPress={handleLoginPress} type="primary" style={style.loginButton} />
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
});
