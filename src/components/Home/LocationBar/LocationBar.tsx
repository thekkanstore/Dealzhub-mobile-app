import React, {useEffect, useState} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import {fontScale, moderateScale} from '../../../config/styles/responsiveSize';
import {TKFrameIcon} from '../../Common/Icons/TKFrameIcon';
import {strings} from '../../../utils/language/langauageUtils';
import {useLocationPermission} from '../../../hooks/useLocationPermission';
import locationService from '../../../services/location/locationService';
import {colors} from '../../../config/styles/colors';
import {fontFamily} from '../../../config/styles/fontFamily';
import {TKUserIcon} from '../../Common/Icons/TKUserIcon';
import {navigationStrings} from '../../../navigation/navigationStrings';
import {HomeScreenNavigationProp} from '../../../navigation/rootparamstypes';

const LocationBar = () => {
  const {getCurrentLocation, requestLocationPermission} = useLocationPermission();
  const [location, setLocation] = useState<string>('');
  const navigation = useNavigation<HomeScreenNavigationProp>();

  const getUserLocationInformation = async () => {
    const isLocationEnabled = await requestLocationPermission();
    if (isLocationEnabled) {
      try {
        const location = await getCurrentLocation();
        const response = await locationService.getCurrentLocationDetails(
          location?.latitude as number,
          location?.longitude as number,
        );
        setLocation(response?.display_name ?? '');
      } catch (error) {
        //
      }
    }
  };

  useEffect(() => {
    setTimeout(() => {
      getUserLocationInformation();
    }, 300);
  }, []);

  return (
    <View style={style.container}>
      <View style={style.addressContainer}>
        <TKFrameIcon />
        <View>
          <Text style={style.locationText}>{strings('labels.location')}</Text>
          <Text style={style.locationDetails} ellipsizeMode="tail" numberOfLines={1}>
            {location}
          </Text>
        </View>
      </View>
      <TouchableOpacity
        style={style.profileIconContainer}
        onPress={() => navigation.navigate(navigationStrings.PROFILE)}>
        <TKUserIcon />
      </TouchableOpacity>
    </View>
  );
};

export default LocationBar;

const style = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  addressContainer: {
    flex: 0.75,
    flexDirection: 'row',
    gap: moderateScale(10),
  },
  locationText: {
    color: colors.primaryTextColor,
    fontSize: fontScale(14),
    fontFamily: fontFamily.bold,
    lineHeight: fontScale(20),
  },
  locationDetails: {
    color: colors.quaternaryTextColor,
    fontSize: moderateScale(14),
    fontFamily: fontFamily.regular,
  },
  profileIconContainer: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(20),
    backgroundColor: colors.primaryButtonBackgroundColor,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
