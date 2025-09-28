import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import LocationBar from '../../components/Home/LocationBar/LocationBar';
import {colors} from '../../config/styles/colors';
import {moderateScale} from '../../config/styles/responsiveSize';
import HomeProductListing from '../../components/Home/HomeProductListing/HomeProductListing';
import {strings} from '../../utils/language/langauageUtils';
import {fontFamily} from '../../config/styles/fontFamily';
import {TKSearchIcon} from '../../components/Common/Icons/TKSearchIcon';
import {HomeScreenNavigationProp} from '../../navigation/rootparamstypes';
import {navigationStrings} from '../../navigation/navigationStrings';

interface Props {
  navigation: HomeScreenNavigationProp;
}
const Home: React.FC<Props> = ({navigation}) => {
  const handleOnPress = () => {
    navigation.navigate(navigationStrings.SEARCH);
  };
  return (
    <View style={styles.container}>
      <LocationBar />
      <Pressable onPress={handleOnPress} style={styles.buttonContainer}>
        <TKSearchIcon height={20} width={20} />
        <Text style={styles.buttonText}>{strings('labels.searchForProduct')}</Text>
      </Pressable>
      <HomeProductListing />
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryBackgroundColor,
    paddingTop: moderateScale(16),
    gap: moderateScale(16),
  },
  buttonContainer: {
    flexDirection: 'row',
    marginHorizontal: moderateScale(16),
    borderWidth: 1,
    width: '90%',
    paddingVertical: moderateScale(10),
    borderRadius: moderateScale(20),
    paddingHorizontal: moderateScale(10),
    alignItems: 'center',
    gap: moderateScale(6),
  },
  buttonText: {
    fontSize: moderateScale(14),
    color: colors.placeHolderTextColor,
    fontFamily: fontFamily.regular,
  },
});
