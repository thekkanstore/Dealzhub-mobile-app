import React, {useRef, useEffect} from 'react';
import {View, FlatList, Dimensions, Animated, StyleSheet} from 'react-native';
import {moderateScale} from '../../../config/styles/responsiveSize';
import {colors} from '../../../config/styles/colors';
import FastImage from 'react-native-fast-image';
import {useAppSelector} from '../../../redux/hooks';

const {width} = Dimensions.get('window');

const ProductListingCarousel = () => {
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const currentIndexRef = useRef(0);

  const steps = useAppSelector(state => state.sessionStates.appConfig?.banners) ?? [];
  useEffect(() => {
    if (steps.length <= 1) {
      return;
    }
    const interval = setInterval(() => {
      if (steps.length > 0) {
        currentIndexRef.current = (currentIndexRef.current + 1) % steps.length;
        flatListRef.current?.scrollToIndex({
          index: currentIndexRef.current,
          animated: true,
        });
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [steps.length]);

  const onScroll = Animated.event([{nativeEvent: {contentOffset: {x: scrollX}}}], {
    useNativeDriver: false,
  });

  const onViewableItemsChanged = useRef(({viewableItems}: any) => {
    if (viewableItems.length > 0) {
      currentIndexRef.current = viewableItems[0].index || 0;
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const renderItem = ({item}: {item: (typeof steps)[0]}) => (
    <FastImage source={{uri: item}} style={styles.image} resizeMode="cover" />
  );

  // Don't render anything if there are no banners
  if (steps.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={steps}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        keyExtractor={(_, index) => index.toString()}
        decelerationRate="fast"
        snapToInterval={width} // Full screen width for proper paging
        snapToAlignment="center"
        onScrollToIndexFailed={info => {
          const wait = new Promise(resolve => setTimeout(resolve, 500));
          wait.then(() => {
            if (info.index < steps.length && info.index >= 0) {
              flatListRef.current?.scrollToIndex({
                index: info.index,
                animated: true,
              });
            } else {
              // Reset to first item if index is out of bounds
              currentIndexRef.current = 0;
              flatListRef.current?.scrollToIndex({
                index: 0,
                animated: true,
              });
            }
          });
        }}
      />

      <View style={styles.bottomContent}>
        <View style={styles.dotsContainer}>
          {steps.map((_, index) => {
            const inputRange = [(index - 1) * width, index * width, (index + 1) * width];

            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [moderateScale(8), moderateScale(30), moderateScale(8)],
              extrapolate: 'clamp',
            });

            const backgroundColor = scrollX.interpolate({
              inputRange,
              outputRange: [
                colors.neutralButtonBackgroundColor,
                colors.primaryButtonBackgroundColor,
                colors.neutralButtonBackgroundColor,
              ],
              extrapolate: 'clamp',
            });

            return (
              <Animated.View
                key={index}
                style={[
                  styles.dot,
                  {
                    width: dotWidth,
                    backgroundColor,
                  },
                ]}
              />
            );
          })}
        </View>
      </View>
    </View>
  );
};

export default ProductListingCarousel;

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primaryBackgroundColor,
  },
  image: {
    width: width - moderateScale(40), // Full width minus margins
    height: moderateScale(100), // Reduced height to fit container
    borderRadius: moderateScale(10),
    marginHorizontal: moderateScale(10),
  },
  bottomContent: {
    position: 'absolute',
    bottom: moderateScale(6),
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: moderateScale(20),
    gap: moderateScale(12),
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: moderateScale(8),
  },
  dot: {
    height: moderateScale(8),
    borderRadius: moderateScale(4),
    backgroundColor: colors.primaryButtonBackgroundColor,
  },
});
