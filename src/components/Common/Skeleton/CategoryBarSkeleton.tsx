import React from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';
import ShimmerBox from './ShimmerBox';
import {moderateScale} from '../../../config/styles/responsiveSize';

interface CategoryBarSkeletonProps {
  count?: number;
}

export const CategoryBarSkeleton: React.FC<CategoryBarSkeletonProps> = ({
  count = 6,
}) => {
  const items = Array.from({length: count});

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.contentContainer}
      bounces={false}>
      {items.map((_, index) => (
        <View key={`category-skeleton-${index}`} style={styles.itemContainer}>
          <ShimmerBox
            width={moderateScale(60)}
            height={moderateScale(60)}
            borderRadius={moderateScale(40)}
          />
          <ShimmerBox
            width={moderateScale(56)}
            height={moderateScale(12)}
            borderRadius={4}
          />
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    paddingHorizontal: moderateScale(20),
    paddingVertical: moderateScale(4),
  },
  itemContainer: {
    width: moderateScale(80),
    gap: moderateScale(6),
    marginRight: moderateScale(8),
    alignItems: 'center',
  },
});

export default CategoryBarSkeleton;
