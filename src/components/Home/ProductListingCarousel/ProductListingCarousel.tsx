import React, {useRef, useEffect} from 'react';
import {View, FlatList, Dimensions, Animated, StyleSheet, Image} from 'react-native';
import {imagePath} from '../../../assets/imagePath';
import {moderateScale} from '../../../config/styles/responsiveSize';
import {colors} from '../../../config/styles/colors';

const {width} = Dimensions.get('window');

const steps = [
  {
    image: imagePath.carousel1,
  },
  {
    image: imagePath.carousel2,
  },
  {
    image: imagePath.carousel3,
  },
];

const ProductListingCarousel = () => {
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const currentIndexRef = useRef(0);

  // Auto-scroll effect
  useEffect(() => {
    const interval = setInterval(() => {
      currentIndexRef.current = (currentIndexRef.current + 1) % steps.length;
      flatListRef.current?.scrollToIndex({
        index: currentIndexRef.current,
        animated: true,
      });
    }, 3000); // Auto-scroll every 3 seconds

    return () => clearInterval(interval);
  }, []);

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
    <Image source={item.image} style={styles.image} resizeMode="cover" />
  );

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
            flatListRef.current?.scrollToIndex({
              index: info.index,
              animated: true,
            });
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
