import React, {useEffect, useState} from 'react';
import {Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import {colors} from '../../config/styles/colors';
import {moderateScale} from '../../config/styles/responsiveSize';
import HomeProductListing from '../../components/Home/HomeProductListing/HomeProductListing';
import {strings} from '../../utils/language/langauageUtils';
import {fontFamily} from '../../config/styles/fontFamily';
import {TKSearchIcon} from '../../components/Common/Icons/TKSearchIcon';
import {HomeScreenNavigationProp} from '../../navigation/rootparamstypes';
import {navigationStrings} from '../../navigation/navigationStrings';
import {useGetUserDetails} from '../../react-queries/user/userQueries';
import ProductListingCarousel from '../../components/Home/ProductListingCarousel/ProductListingCarousel';
import LocationBar from '../../components/Home/LocationBar/LocationBar';
import {useAppSelector} from '../../redux/hooks';
import {updateSelectedLocation} from '../../redux/sessionStatesSlice';

interface Props {
  navigation: HomeScreenNavigationProp;
}
const Home: React.FC<Props> = ({navigation}) => {
  const handleOnPress = () => {
    navigation.navigate(navigationStrings.SEARCH);
  };
  const {data: userDetails} = useGetUserDetails();
  const {selectedLocation} = useAppSelector(state => state.sessionStates);
  // const [location, setLocation] = useState<string>(selectedLocation);

  useEffect(() => {
    if (!selectedLocation) {
      updateSelectedLocation(userDetails?.city ?? '');
    }
  }, [userDetails?.city, selectedLocation]);
  return (
    <View style={styles.container}>
      <LocationBar onPress={updateSelectedLocation} location={selectedLocation} />
      <Pressable onPress={handleOnPress} style={styles.buttonContainer}>
        <TKSearchIcon height={20} width={20} />
        <Text style={styles.buttonText}>{strings('labels.searchForProduct')}</Text>
      </Pressable>
      <ScrollView style={{flex: 1}} showsVerticalScrollIndicator={false} bounces={false}>
        <ProductListingCarousel />
        <View style={styles.productListingContainer}>
          <HomeProductListing location={selectedLocation} />
        </View>
      </ScrollView>
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
  productListingContainer: {
    flex: 1,
    paddingTop: moderateScale(16),
  },
});
