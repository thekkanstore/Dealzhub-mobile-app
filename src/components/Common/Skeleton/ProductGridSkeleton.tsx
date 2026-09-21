import React from 'react';
import {StyleSheet, View, StyleProp, ViewStyle} from 'react-native';
import ProductCardSkeleton from './ProductCardSkeleton';
import {moderateScale} from '../../../config/styles/responsiveSize';

interface ProductGridSkeletonProps {
  count?: number;
  style?: StyleProp<ViewStyle>;
}

export const ProductGridSkeleton: React.FC<ProductGridSkeletonProps> = ({
  count = 6,
  style,
}) => {
  const items = Array.from({length: count});

  return (
    <View style={[styles.container, style]}>
      <View style={styles.grid}>
        {items.map((_, index) => (
          <ProductCardSkeleton key={`skeleton-card-${index}`} />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: moderateScale(8),
    flex: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
});

export default ProductGridSkeleton;
