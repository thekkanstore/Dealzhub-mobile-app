import {StyleSheet, View} from 'react-native';
import React from 'react';
import {IProduct} from '../../../config/models/product';
import {VendorScreenNavigationProp} from '../../../navigation/rootparamstypes';
import TKRenderIf from '../../Common/TKRenderIf/TKRenderIf';
import CustomerAction from '../CustomerAction/CustomerAction';
import VendorAction from '../VendorAction/VendorAction';
import {colors} from '../../../config/styles/colors';
import {moderateScale} from '../../../config/styles/responsiveSize';

interface Props {
  productDetails: IProduct;
  navigation: VendorScreenNavigationProp;
  isCustomer?: boolean;
}
const ProductButtonAction: React.FC<Props> = ({productDetails, navigation, isCustomer = false}) => {
  return (
    <View style={styles.container}>
      <TKRenderIf isRender={isCustomer}>
        <CustomerAction />
      </TKRenderIf>
      <TKRenderIf isRender={!isCustomer}>
        <VendorAction productDetails={productDetails} navigation={navigation} />
      </TKRenderIf>
    </View>
  );
};

export default ProductButtonAction;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: moderateScale(16),
    paddingVertical: moderateScale(16),
    backgroundColor: colors.primaryBackgroundColor,
  },
});
