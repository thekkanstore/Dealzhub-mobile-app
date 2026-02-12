import {StyleSheet, View, ScrollView} from 'react-native';
import React from 'react';
import {RouteProp} from '@react-navigation/native';
import {VendorScreenNavigationProp, VendorStackParamList} from '../../navigation/rootparamstypes';
import ImageHeaderCard from '../../components/ProductDetails/ImageHeaderCard/ImageHeaderCard';
import TKRenderIf from '../../components/Common/TKRenderIf/TKRenderIf';
import ProductDetailsCard from '../../components/ProductDetails/ProductDetailsCard/ProductDetailsCard';
import ProductButtonAction from '../../components/ProductDetails/ProductButtonAction/ProductButtonAction';
import {colors} from '../../config/styles/colors';
import {useGetProductById} from '../../react-queries/product/productQueries';

interface Props {
  route: RouteProp<VendorStackParamList, 'ProductDetails'>;
  navigation: VendorScreenNavigationProp;
}
const ProductDetails: React.FC<Props> = ({route, navigation}) => {
  const {product, isStackChange, isVendor = false} = route.params;
  const {data: productDetails} = useGetProductById(product?.id);
  const finalProductDetails = productDetails ?? product;
  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <TKRenderIf isRender={!!finalProductDetails?.image || !!finalProductDetails?.images?.[0]}>
          <ImageHeaderCard
            productDetails={finalProductDetails}
            navigation={navigation}
            isStackChange={isStackChange}
            isVendor={isVendor}
          />
        </TKRenderIf>
        <TKRenderIf
          isRender={!!finalProductDetails?.image || !!finalProductDetails?.images?.length}>
          <ProductDetailsCard
            productDetails={finalProductDetails}
            navigation={navigation}
            isVendor={isVendor}
          />
        </TKRenderIf>
      </ScrollView>
      <View>
        <ProductButtonAction
          productDetails={finalProductDetails}
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
    backgroundColor: colors.primaryBackgroundColor,
  },
  scrollView: {
    flex: 1,
  },
});
