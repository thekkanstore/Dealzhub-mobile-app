import {StyleSheet, View} from 'react-native';
import React from 'react';
import {RouteProp} from '@react-navigation/native';
import {VendorScreenNavigationProp, VendorStackParamList} from '../../navigation/rootparamstypes';
import {useGetProductById} from '../../react-queries/product/productQueries';
import ImageHeaderCard from '../../components/ProductDetails/ImageHeaderCard/ImageHeaderCard';
import TKRenderIf from '../../components/Common/TKRenderIf/TKRenderIf';
import ProductDetailsCard from '../../components/ProductDetails/ProductDetailsCard/ProductDetailsCard';
import ProductButtonAction from '../../components/ProductDetails/ProductButtonAction/ProductButtonAction';

interface Props {
  route: RouteProp<VendorStackParamList, 'ProductDetails'>;
  navigation: VendorScreenNavigationProp;
}
const ProductDetails: React.FC<Props> = ({route, navigation}) => {
  const {productId = '', isStackChange, isVendor = false} = route.params;
  const {data: ProductDetails} = useGetProductById(productId);
  return (
    <View style={styles.container}>
      <View>
        <TKRenderIf isRender={!!ProductDetails?.image}>
          <ImageHeaderCard
            productDetails={ProductDetails!}
            navigation={navigation}
            isStackChange={isStackChange}
            isVendor={isVendor}
          />
        </TKRenderIf>
        <TKRenderIf isRender={!!ProductDetails?.image}>
          <ProductDetailsCard
            productDetails={ProductDetails!}
            navigation={navigation}
            isVendor={isVendor}
          />
        </TKRenderIf>
      </View>
      <View>
        <ProductButtonAction
          productDetails={ProductDetails!}
          navigation={navigation}
          isVendor={isVendor}
        />
      </View>
    </View>
  );
};

export default ProductDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
});
