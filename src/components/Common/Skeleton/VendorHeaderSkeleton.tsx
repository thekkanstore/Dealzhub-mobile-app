import React from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';
import ShimmerBox from './ShimmerBox';
import ProductGridSkeleton from './ProductGridSkeleton';
import {moderateScale, verticalScale} from '../../../config/styles/responsiveSize';
import {colors} from '../../../config/styles/colors';

export const VendorHeaderSkeleton: React.FC = () => {
  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.contentContainer}>
      {/* Store Metadata Card Skeleton */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <ShimmerBox
            width={moderateScale(160)}
            height={moderateScale(18)}
            borderRadius={4}
          />
          <ShimmerBox
            width={moderateScale(70)}
            height={moderateScale(24)}
            borderRadius={moderateScale(12)}
          />
        </View>

        <View style={styles.addressSection}>
          <ShimmerBox
            width="90%"
            height={moderateScale(12)}
            borderRadius={4}
            style={styles.line}
          />
          <ShimmerBox
            width="60%"
            height={moderateScale(12)}
            borderRadius={4}
          />
        </View>

        <View style={styles.actionsRow}>
          <ShimmerBox
            width={moderateScale(100)}
            height={moderateScale(32)}
            borderRadius={moderateScale(8)}
          />
          <ShimmerBox
            width={moderateScale(100)}
            height={moderateScale(32)}
            borderRadius={moderateScale(8)}
          />
        </View>
      </View>

      {/* Horizontal Category Tabs Skeleton */}
      <View style={styles.categoryBar}>
        {[1, 2, 3, 4].map(idx => (
          <ShimmerBox
            key={`tab-skeleton-${idx}`}
            width={moderateScale(80)}
            height={moderateScale(36)}
            borderRadius={moderateScale(18)}
            style={styles.categoryTab}
          />
        ))}
      </View>

      {/* Product Grid Skeleton */}
      <ProductGridSkeleton count={4} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryBackgroundColor,
  },
  contentContainer: {
    paddingBottom: verticalScale(30),
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    borderRadius: moderateScale(16),
    marginHorizontal: moderateScale(16),
    marginVertical: verticalScale(12),
    padding: moderateScale(16),
    gap: verticalScale(12),
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addressSection: {
    gap: verticalScale(6),
  },
  line: {
    marginBottom: verticalScale(2),
  },
  actionsRow: {
    flexDirection: 'row',
    gap: moderateScale(12),
    marginTop: verticalScale(4),
  },
  categoryBar: {
    flexDirection: 'row',
    paddingHorizontal: moderateScale(16),
    marginVertical: verticalScale(12),
    gap: moderateScale(8),
  },
  categoryTab: {
    marginRight: moderateScale(4),
  },
});

export default VendorHeaderSkeleton;
