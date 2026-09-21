import React from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';
import ShimmerBox from './ShimmerBox';
import {moderateScale, verticalScale, width} from '../../../config/styles/responsiveSize';
import {colors} from '../../../config/styles/colors';

export const ProductDetailsSkeleton: React.FC = () => {
  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Main Hero Image Skeleton */}
        <ShimmerBox
          width={width}
          height={moderateScale(320)}
          borderRadius={0}
        />

        {/* Product Details Section */}
        <View style={styles.detailsCard}>
          <View style={styles.headerRow}>
            <View style={styles.titleWrapper}>
              <ShimmerBox
                width="80%"
                height={moderateScale(20)}
                borderRadius={4}
              />
              <ShimmerBox
                width="50%"
                height={moderateScale(14)}
                borderRadius={4}
              />
            </View>
            <View style={styles.priceWrapper}>
              <ShimmerBox
                width={moderateScale(60)}
                height={moderateScale(14)}
                borderRadius={4}
              />
              <ShimmerBox
                width={moderateScale(70)}
                height={moderateScale(20)}
                borderRadius={4}
              />
            </View>
          </View>

          {/* Description Paragraph */}
          <View style={styles.descriptionBlock}>
            <ShimmerBox width="95%" height={moderateScale(12)} borderRadius={4} />
            <ShimmerBox width="90%" height={moderateScale(12)} borderRadius={4} />
            <ShimmerBox width="60%" height={moderateScale(12)} borderRadius={4} />
          </View>

          {/* Category Chip Block */}
          <View style={styles.categoryBlock}>
            <ShimmerBox
              width={moderateScale(110)}
              height={moderateScale(14)}
              borderRadius={4}
            />
            <View style={styles.chipsRow}>
              <ShimmerBox
                width={moderateScale(90)}
                height={moderateScale(28)}
                borderRadius={moderateScale(14)}
              />
              <ShimmerBox
                width={moderateScale(80)}
                height={moderateScale(28)}
                borderRadius={moderateScale(14)}
              />
            </View>
          </View>

          {/* Store Info Card */}
          <View style={styles.storeCard}>
            <View style={styles.storeRow}>
              <ShimmerBox
                width={moderateScale(48)}
                height={moderateScale(48)}
                borderRadius={moderateScale(24)}
              />
              <View style={styles.storeTextCol}>
                <ShimmerBox
                  width={moderateScale(140)}
                  height={moderateScale(16)}
                  borderRadius={4}
                />
                <ShimmerBox
                  width={moderateScale(100)}
                  height={moderateScale(12)}
                  borderRadius={4}
                />
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Floating Bottom Button Bar */}
      <View style={styles.bottomBar}>
        <ShimmerBox
          width="100%"
          height={moderateScale(48)}
          borderRadius={moderateScale(24)}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryBackgroundColor,
    justifyContent: 'space-between',
  },
  scrollView: {
    flex: 1,
  },
  detailsCard: {
    padding: moderateScale(16),
    gap: verticalScale(16),
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleWrapper: {
    flex: 1,
    gap: verticalScale(6),
  },
  priceWrapper: {
    alignItems: 'flex-end',
    gap: verticalScale(4),
  },
  descriptionBlock: {
    gap: verticalScale(6),
    paddingVertical: verticalScale(6),
  },
  categoryBlock: {
    gap: verticalScale(8),
  },
  chipsRow: {
    flexDirection: 'row',
    gap: moderateScale(8),
  },
  storeCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    padding: moderateScale(14),
    borderRadius: moderateScale(12),
    marginTop: verticalScale(8),
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  storeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(12),
  },
  storeTextCol: {
    gap: verticalScale(6),
  },
  bottomBar: {
    paddingHorizontal: moderateScale(16),
    paddingVertical: verticalScale(12),
    borderTopWidth: 1,
    borderTopColor: colors.secondaryBackgroundColor,
    backgroundColor: colors.primaryBackgroundColor,
  },
});

export default ProductDetailsSkeleton;
