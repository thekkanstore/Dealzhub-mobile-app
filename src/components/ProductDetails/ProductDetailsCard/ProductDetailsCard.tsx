import {Pressable, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React from 'react';
import {IProduct} from '../../../config/models/product';
import {fontScale, moderateScale} from '../../../config/styles/responsiveSize';
import {colors} from '../../../config/styles/colors';
import {fontFamily} from '../../../config/styles/fontFamily';
import {strings} from '../../../utils/language/langauageUtils';
import {TKArrowIcon} from '../../Common/Icons/TKArrowIcon';
import {stylesUtils} from '../../../utils/styles/styles';
import {VendorService} from '../../../services/vendor/vendorService';
import {VendorScreenNavigationProp} from '../../../navigation/rootparamstypes';
import TKRenderIf from '../../Common/TKRenderIf/TKRenderIf';
import {navigationStrings} from '../../../navigation/navigationStrings';

interface Props {
  productDetails: IProduct;
  navigation: VendorScreenNavigationProp;
  isVendor?: boolean;
}
const ProductDetailsCard: React.FC<Props> = ({productDetails, navigation, isVendor}) => {
  const handleOnClickVendor = () => {
    navigation.navigate(navigationStrings.VENDOR);
  };
  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>{productDetails.name}</Text>
        <Text style={styles.headerText}>₹ {productDetails.actualPrice}</Text>
      </View>
      <Text style={styles.descriptionText}>{productDetails.description}</Text>

      <>
        <Text style={styles.subHeaderText}>{strings('labels.categoryDetails')}</Text>
        <View style={styles.subContainer}>
          <Text style={styles.descriptionText}>{strings('labels.name')} :</Text>
          <Text style={styles.descriptionText}>{productDetails?.category?.name ?? ''}</Text>
        </View>
      </>

      <TKRenderIf isRender={!isVendor}>
        <TouchableOpacity onPress={handleOnClickVendor} style={styles.vendorContainer}>
          <View style={styles.vendorHeaderContainer}>
            <Text style={styles.vendorHeaderText}>{productDetails.store.storeName}</Text>
            <Pressable onPress={() => {}} style={styles.backButton}>
              <TKArrowIcon width={14} height={14} color={colors.primaryTextColor} />
            </Pressable>
          </View>
          <Text style={styles.vendorDescriptionText}>
            {VendorService.getStoreAddressInfo(productDetails.store)}
          </Text>
        </TouchableOpacity>
      </TKRenderIf>
    </View>
  );
};

export default ProductDetailsCard;

const styles = StyleSheet.create({
  container: {
    paddingVertical: moderateScale(10),
    paddingHorizontal: moderateScale(16),
    gap: moderateScale(5),
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerText: {
    fontSize: fontScale(16),
    color: colors.primaryTextColor,
    fontFamily: fontFamily.bold,
  },
  descriptionText: {
    fontSize: fontScale(14),
    color: colors.primaryTextColor,
    fontFamily: fontFamily.regular,
  },
  subHeaderText: {
    marginTop: moderateScale(10),
    fontSize: fontScale(14),
    color: colors.primaryTextColor,
    fontFamily: fontFamily.bold,
  },
  subContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: moderateScale(10),
    gap: moderateScale(10),
  },
  vendorContainer: {
    backgroundColor: colors.primaryBackgroundColor,
    borderRadius: moderateScale(16),
    paddingHorizontal: moderateScale(16),
    paddingBottom: moderateScale(10),
    borderColor: colors.neutralButtonBackgroundColor,
    ...stylesUtils.darkShadow({
      elevation: 0.73,
    }),
  },
  vendorHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: moderateScale(10),
    gap: moderateScale(10),
  },
  vendorHeaderText: {
    fontSize: fontScale(14),
    color: colors.primaryTextColor,
    fontFamily: fontFamily.bold,
  },
  backButton: {
    padding: moderateScale(10),
    backgroundColor: colors.tertiaryButtonBackgroundColor,
    borderRadius: moderateScale(20),
  },
  vendorDescriptionText: {
    fontSize: fontScale(14),
    color: colors.primaryTextColor,
    fontFamily: fontFamily.regular,
  },
});
