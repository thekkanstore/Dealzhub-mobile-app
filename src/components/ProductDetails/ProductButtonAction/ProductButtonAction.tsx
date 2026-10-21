import {StyleSheet, View} from 'react-native';
import React from 'react';
import {IProduct} from '../../../config/models/product';
import {VendorScreenNavigationProp} from '../../../navigation/rootparamstypes';
import TKRenderIf from '../../Common/TKRenderIf/TKRenderIf';
import CustomerAction from '../CustomerAction/CustomerAction';
import VendorAction from '../VendorAction/VendorAction';
import {colors} from '../../../config/styles/colors';
import {moderateScale, verticalScale} from '../../../config/styles/responsiveSize';

interface Props {
  productDetails: IProduct;
  navigation: VendorScreenNavigationProp;
  isVendor?: boolean;
  quantity?: number;
  selectedSize?: string;
  selectedWeight?: string;
  unitPrice?: number;
  scaledDiscountPrice?: number;
}
const ProductButtonAction: React.FC<Props> = ({
  productDetails,
  navigation,
  isVendor = false,
  quantity = 1,
  selectedSize,
  selectedWeight,
  unitPrice,
  scaledDiscountPrice,
}) => {
  return (
    <View style={styles.container}>
      <TKRenderIf isRender={!isVendor}>
        <CustomerAction
          productDetails={productDetails}
          quantity={quantity}
          selectedSize={selectedSize}
          selectedWeight={selectedWeight}
          unitPrice={unitPrice}
          scaledDiscountPrice={scaledDiscountPrice}
        />
      </TKRenderIf>
      <TKRenderIf isRender={isVendor}>
        <View style={styles.vendorRow}>
          <VendorAction productDetails={productDetails} navigation={navigation} />
        </View>
      </TKRenderIf>
    </View>
  );
};

export default ProductButtonAction;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: moderateScale(16),
    paddingTop: verticalScale(10),
    paddingBottom: verticalScale(16),
    backgroundColor: colors.primaryBackgroundColor,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  vendorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
});
