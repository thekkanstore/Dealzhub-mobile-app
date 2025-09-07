import React, {useRef, useState} from 'react';
import {Animated, Dimensions, FlatList, Image, StyleSheet, Text, View} from 'react-native';
import {colors} from '../../config/styles/colors';
import {useSafeAreaBottom} from '../../providers/SafeAreaProvider';
import TKButton from '../../components/Common/TKButton/TKButton';
import {imagePath} from '../../assets/imagePath';
import {strings} from '../../utils/language/langauageUtils';
import {fontScale, moderateScale, verticalScale} from '../../config/styles/responsiveSize';
import TKHeader from '../../components/Common/TKHeader/TKHeader';
import {fontFamily} from '../../config/styles/fontFamily';
import {updateNewUserStatus} from '../../redux/userSlice';
import {UserRegisterScreenNavigationProp} from '../../navigation/rootparamstypes';
import {useUpdateUserRoles} from '../../react-queries/user/userQueries';
import {Roles} from '../../config/common/constants';

const steps = [
  {
    image: imagePath.chooseUserTypeBg1,
    title: strings('ChooseUserType.backgroundText1'),
  },
  {
    image: imagePath.chooseUserTypeBg2,
    title: strings('ChooseUserType.backgroundText2'),
  },
];
const {width} = Dimensions.get('window');

interface Props {
  navigation: UserRegisterScreenNavigationProp;
}
const ChooseUserType: React.FC<Props> = ({navigation}) => {
  const bottomPadding = useSafeAreaBottom(10);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const {mutate: updateUserRole} = useUpdateUserRoles();

  const onScroll = Animated.event([{nativeEvent: {contentOffset: {x: scrollX}}}], {
    useNativeDriver: false,
  });

  const handleOnPressIamUser = () => {
    updateUserRole([Roles.USER], {
      onSuccess: () => {
        updateNewUserStatus(false);
      },
    });
  };

  const handleOnPressVendor = () => {
    updateUserRole([Roles.USER, Roles.VENDOR], {
      onSuccess: () => {
        navigation.navigate('StoreDetails');
      },
    });
  };

  const renderItem = ({item}: {item: (typeof steps)[0]}) => (
    <View style={styles.slider}>
      <Text style={styles.title}>{item.title}</Text>
      <Image source={item.image} resizeMode={'contain'} style={styles.imageSize} />
    </View>
  );

  return (
    <View style={styles.container}>
      <TKHeader header={undefined} />
      <Image source={steps[0].image} style={[styles.image]} />
      <FlatList
        ref={flatListRef}
        data={steps}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
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
                colors.primaryTextColor,
                colors.primaryButtonBackgroundColor,
                colors.primaryTextColor,
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
          title={strings('ChooseUserType.vendorButtonText')}
          style={{marginHorizontal: 30}}
          onPress={handleOnPressVendor}
        />
        <TKButton
          title={strings('ChooseUserType.userButtonText')}
          style={{marginBottom: bottomPadding, marginHorizontal: 30}}
          type={'secondary'}
          onPress={handleOnPressIamUser}
        />
      </View>
    </View>
  );
};

export default ChooseUserType;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryBackgroundColor,
  },
  title: {
    fontSize: fontScale(16),
    fontFamily: fontFamily.bold,
    lineHeight: verticalScale(20),
    textAlign: 'center',
  },
  image: {
    width: moderateScale(100),
    height: moderateScale(100),
    alignSelf: 'center',
    marginTop: moderateScale(10),
  },
  slider: {width, alignItems: 'center', padding: 20},
  imageSize: {
    width: moderateScale(250),
    height: moderateScale(250),
    marginVertical: moderateScale(20),
  },
  bottomContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    gap: moderateScale(15),
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: moderateScale(20),
    gap: moderateScale(8),
  },
  dot: {
    height: moderateScale(8),
    borderRadius: moderateScale(4),
    backgroundColor: colors.primaryButtonBackgroundColor,
  },
});
