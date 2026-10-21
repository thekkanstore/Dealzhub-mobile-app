import React, {useState, useMemo, useEffect} from 'react';
import {StyleSheet, View, ScrollView} from 'react-native';
import {RouteProp} from '@react-navigation/native';
import {VendorScreenNavigationProp, VendorStackParamList} from '../../navigation/rootparamstypes';
import ImageHeaderCard from '../../components/ProductDetails/ImageHeaderCard/ImageHeaderCard';
import TKRenderIf from '../../components/Common/TKRenderIf/TKRenderIf';
import ProductDetailsCard from '../../components/ProductDetails/ProductDetailsCard/ProductDetailsCard';
import ProductButtonAction from '../../components/ProductDetails/ProductButtonAction/ProductButtonAction';
import {colors} from '../../config/styles/colors';
import {useGetProductById} from '../../react-queries/product/productQueries';
import {ProductDetailsSkeleton} from '../../components/Common/Skeleton';
import {
  calculateScaledPrice,
  getProductWeightOptions,
  WeightOption,
} from '../../utils/measurement/measurementUtils';

interface Props {
  route: RouteProp<VendorStackParamList, 'ProductDetails'>;
  navigation: VendorScreenNavigationProp;
}
const ProductDetails: React.FC<Props> = ({route, navigation}) => {
  const {product, isStackChange, isVendor = false} = route.params || {};
  const {data: productDetails, isPending} = useGetProductById(product?.id);
  const finalProductDetails = productDetails ?? product;

  const isWeightOrVolume = useMemo(() => {
    return (
      ['kg', 'g', 'ltr', 'ml'].includes((finalProductDetails?.unit || '').toLowerCase()) ||
      Boolean(finalProductDetails?.weightOptions && finalProductDetails.weightOptions.length > 0)
    );
  }, [finalProductDetails]);

  const weightOptions = useMemo(() => {
    if (!finalProductDetails || !isWeightOrVolume) return [];
    return getProductWeightOptions(finalProductDetails);
  }, [finalProductDetails, isWeightOrVolume]);

  const [selectedSize, setSelectedSize] = useState<string>(() => {
    return finalProductDetails?.sizes?.[0] || '';
  });

  const [selectedWeight, setSelectedWeight] = useState<WeightOption | null>(() => {
    return weightOptions[0] || null;
  });

  const [quantity, setQuantity] = useState<number>(1);

  useEffect(() => {
    if (finalProductDetails?.sizes?.length && !selectedSize) {
      setSelectedSize(finalProductDetails.sizes[0]);
    }
    if (weightOptions.length && !selectedWeight) {
      setSelectedWeight(weightOptions[0]);
    }
  }, [finalProductDetails, weightOptions, selectedSize, selectedWeight]);

  const unitPrice = useMemo(() => {
    if (!finalProductDetails) return 0;
    if (isWeightOrVolume && selectedWeight) {
      const firstOpt = weightOptions[0];
      const effectiveBaseValue = firstOpt
        ? firstOpt.value
        : typeof finalProductDetails.unitValue === 'number'
        ? finalProductDetails.unitValue
        : parseFloat(String(finalProductDetails.unitValue || '1')) || 1;
      const effectiveBaseUnit = firstOpt ? firstOpt.unit : finalProductDetails.unit || 'pcs';

      return calculateScaledPrice(
        finalProductDetails.discountPrice ?? finalProductDetails.actualPrice ?? 0,
        effectiveBaseUnit,
        effectiveBaseValue,
        selectedWeight.value,
        selectedWeight.unit,
      );
    }
    return parseFloat(finalProductDetails.discountPrice ?? finalProductDetails.actualPrice ?? 0) || 0;
  }, [finalProductDetails, isWeightOrVolume, selectedWeight, weightOptions]);

  const scaledDiscountPrice = useMemo(() => {
    return unitPrice * quantity;
  }, [unitPrice, quantity]);

  const scaledActualPrice = useMemo(() => {
    if (!finalProductDetails) return 0;
    if (isWeightOrVolume && selectedWeight) {
      const firstOpt = weightOptions[0];
      const effectiveBaseValue = firstOpt
        ? firstOpt.value
        : typeof finalProductDetails.unitValue === 'number'
        ? finalProductDetails.unitValue
        : parseFloat(String(finalProductDetails.unitValue || '1')) || 1;
      const effectiveBaseUnit = firstOpt ? firstOpt.unit : finalProductDetails.unit || 'pcs';

      return (
        calculateScaledPrice(
          finalProductDetails.actualPrice ?? 0,
          effectiveBaseUnit,
          effectiveBaseValue,
          selectedWeight.value,
          selectedWeight.unit,
        ) * quantity
      );
    }
    return (parseFloat(finalProductDetails.actualPrice ?? 0) || 0) * quantity;
  }, [finalProductDetails, isWeightOrVolume, selectedWeight, quantity, weightOptions]);

  if (isPending && !finalProductDetails?.name && !finalProductDetails?.image) {
    return <ProductDetailsSkeleton />;
  }

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
            selectedSize={selectedSize}
            onSelectSize={setSelectedSize}
            selectedWeight={selectedWeight}
            onSelectWeight={setSelectedWeight}
            quantity={quantity}
            onQuantityChange={setQuantity}
            scaledDiscountPrice={scaledDiscountPrice}
            scaledActualPrice={scaledActualPrice}
            weightOptions={weightOptions}
            isWeightOrVolume={isWeightOrVolume}
          />
        </TKRenderIf>
      </ScrollView>
      <View>
        <ProductButtonAction
          productDetails={finalProductDetails}
          navigation={navigation}
          isVendor={isVendor}
          quantity={quantity}
          selectedSize={selectedSize}
          selectedWeight={selectedWeight?.label}
          unitPrice={unitPrice}
          scaledDiscountPrice={scaledDiscountPrice}
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
