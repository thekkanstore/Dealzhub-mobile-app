import {StyleSheet, View} from 'react-native';
import React from 'react';
import {RouteProp} from '@react-navigation/native';
import {VendorScreenNavigationProp, VendorStackParamList} from '../../navigation/rootparamstypes';
import ImageHeaderCard from '../../components/ProductDetails/ImageHeaderCard/ImageHeaderCard';
import TKRenderIf from '../../components/Common/TKRenderIf/TKRenderIf';
import ProductDetailsCard from '../../components/ProductDetails/ProductDetailsCard/ProductDetailsCard';
import ProductButtonAction from '../../components/ProductDetails/ProductButtonAction/ProductButtonAction';
import {colors} from '../../config/styles/colors';

interface Props {
  route: RouteProp<VendorStackParamList, 'ProductDetails'>;
  navigation: VendorScreenNavigationProp;
}
const ProductDetails: React.FC<Props> = ({route, navigation}) => {
  const {product, isStackChange, isVendor = false} = route.params;
  return (
    <View style={styles.container}>
      <View>
        <TKRenderIf isRender={!!product?.image}>
          <ImageHeaderCard
            productDetails={product}
            navigation={navigation}
            isStackChange={isStackChange}
            isVendor={isVendor}
          />
        </TKRenderIf>
        <TKRenderIf isRender={!!product?.image}>
          <ProductDetailsCard
            productDetails={product}
            navigation={navigation}
            isVendor={isVendor}
          />
        </TKRenderIf>
      </View>
      <View>
        <ProductButtonAction productDetails={product} navigation={navigation} isVendor={isVendor} />
      </View>
    </View>
  );
};

export default ProductDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    backgroundColor: colors.primaryBackgroundColor,
  },
});
