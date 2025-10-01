import React, {useState, useRef} from 'react';
import {ImageBackground, Text, View, FlatList, Dimensions, Animated} from 'react-native';
import {styles} from './GettingStartedStyle';
import {imagePath} from '../../assets/imagePath';
import TKStatusBar from '../../components/Common/TKStatusBar/TKStatusBar';
import {strings} from '../../utils/language/langauageUtils';
import TKButton from '../../components/Common/TKButton/TKButton';
import {useSafeAreaBottom} from '../../providers/SafeAreaProvider';
import LinearGradient from 'react-native-linear-gradient';
import {colors} from '../../config/styles/colors';
import {updateGettingStarted} from '../../redux/systemSlice';

const {width} = Dimensions.get('window');

const steps = [
  {
    image: imagePath.gettingStartedFirstImage,
    title: strings('gettingStarted.step1Title'),
    description: strings('gettingStarted.step1Description'),
  },
  {
    image: imagePath.gettingStartedSecondImage,
    title: strings('gettingStarted.step2Title'),
    description: strings('gettingStarted.step2Description'),
  },
  {
    image: imagePath.gettingStartedThirdImage,
    title: strings('gettingStarted.step3Title'),
    description: strings('gettingStarted.step3Description'),
  },
];
const GettingStarted = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const bottomPadding = useSafeAreaBottom(15);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const handleGetStarted = () => {
    if (currentStep < steps.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      flatListRef.current?.scrollToIndex({
        index: nextStep,
        animated: true,
      });
      return;
    }
    updateGettingStarted(true);
  };

  const onScroll = Animated.event([{nativeEvent: {contentOffset: {x: scrollX}}}], {
    useNativeDriver: false,
  });

  const onViewableItemsChanged = ({viewableItems}: any) => {
    if (viewableItems.length > 0) {
      setCurrentStep(viewableItems[0].index || 0);
    }
  };

  const renderItem = ({item}: {item: (typeof steps)[0]}) => (
    <ImageBackground source={item.image} style={[styles.image, {width}]}>
      <LinearGradient
        colors={['rgba(0, 0, 0, 0)', '#000000']}
        locations={[0.0788, 0.9994]}
        style={{flex: 1, justifyContent: 'flex-end'}}
        start={{x: 0.5, y: 0}}
        end={{x: 0.5, y: 1}}>
        <View style={styles.contentWrapper}>
          <Text style={styles.titleText}>{item.title}</Text>
          <Text style={styles.descriptionText}>{item.description}</Text>
        </View>
      </LinearGradient>
    </ImageBackground>
  );

  return (
    <View style={styles.container}>
      <TKStatusBar barStyle="light-content" backgroundColor="transparent" />
      <FlatList
        ref={flatListRef}
        data={steps}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{
          itemVisiblePercentThreshold: 50,
        }}
        keyExtractor={(_, index) => index.toString()}
      />

      <View style={styles.bottomContent}>
        <View style={styles.dotsContainer}>
          {steps.map((_, index) => {
            const inputRange = [(index - 1) * width, index * width, (index + 1) * width];

            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [8, 30, 8],
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

        <TKButton
          title={
            currentStep === steps.length - 1
              ? strings('button.gettingStarted')
              : strings('button.next')
          }
          onPress={handleGetStarted}
          style={{marginBottom: bottomPadding, marginHorizontal: 30}}
        />
      </View>
    </View>
  );
};

export default GettingStarted;
