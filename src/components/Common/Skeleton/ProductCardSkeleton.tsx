import React from 'react';
import {StyleSheet, View} from 'react-native';
import ShimmerBox from './ShimmerBox';
import {moderateScale, verticalScale} from '../../../config/styles/responsiveSize';
import {colors} from '../../../config/styles/colors';

export const ProductCardSkeleton: React.FC = () => {
  return (
    <View style={styles.productCard}>
      {/* Product Image placeholder */}
      <View style={styles.imageWrapper}>
        <ShimmerBox
          width={moderateScale(138)}
          height={moderateScale(138)}
          borderRadius={moderateScale(14)}
        />
      </View>

      {/* Product Details placeholder */}
      <View style={styles.productInfo}>
        <ShimmerBox
          width="85%"
          height={moderateScale(14)}
          borderRadius={4}
          style={styles.lineMargin}
        />
        <ShimmerBox
          width="60%"
          height={moderateScale(11)}
          borderRadius={4}
          style={styles.lineMargin}
        />

        {/* Price row placeholder */}
        <View style={styles.priceContainer}>
          <ShimmerBox
            width={moderateScale(46)}
            height={moderateScale(14)}
            borderRadius={4}
          />
          <ShimmerBox
            width={moderateScale(46)}
            height={moderateScale(14)}
            borderRadius={4}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  productCard: {
    width: moderateScale(170),
    borderRadius: moderateScale(12),
    padding: moderateScale(14),
    marginVertical: verticalScale(6),
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  imageWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  productInfo: {
    marginTop: verticalScale(8),
    gap: verticalScale(4),
  },
  lineMargin: {
    marginBottom: verticalScale(2),
  },
  priceContainer: {
    flexDirection: 'row',
    gap: moderateScale(8),
    marginTop: verticalScale(4),
  },
});

export default ProductCardSkeleton;
