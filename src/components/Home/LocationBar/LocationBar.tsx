import React, {useState} from 'react';
import {FlatList, Pressable, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Modal from 'react-native-modal';

import {
  fontScale,
  getApproximateBottomSafeArea,
  moderateScale,
} from '../../../config/styles/responsiveSize';
import {TKFrameIcon} from '../../Common/Icons/TKFrameIcon';
import {strings} from '../../../utils/language/langauageUtils';
// import {useLocationPermission} from '../../../hooks/useLocationPermission';
// import locationService from '../../../services/location/locationService';
import {colors} from '../../../config/styles/colors';
import {fontFamily} from '../../../config/styles/fontFamily';
import {TKUserIcon} from '../../Common/Icons/TKUserIcon';
import {navigationStrings} from '../../../navigation/navigationStrings';
import {HomeScreenNavigationProp} from '../../../navigation/rootparamstypes';
import {DistrictList} from '../../../config/common/constants';

interface LocationBarProps {
  onPress: (item: string) => void;
  location: string;
}
const LocationBar = ({onPress, location}: LocationBarProps) => {
  // const {getCurrentLocation, requestLocationPermission} = useLocationPermission();
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [isDropdownVisible, setDropdownVisible] = useState<boolean>(false);

  // const getUserLocationInformation = async () => {
  //   // const isLocationEnabled = await requestLocationPermission();
  //   // if (isLocationEnabled) {
  //   //   try {
  //   //     // const location = await getCurrentLocation();
  //   //     // const response = await locationService.getCurrentLocationDetails(
  //   //     //   location?.latitude as number,
  //   //     //   location?.longitude as number,
  //   //     // );
  //   //     // setLocation(response?.display_name ?? '');
  //   //   } catch (error) {
  //   //     //
  //   //   }
  //   // }
  // };

  // useEffect(() => {
  //   setTimeout(() => {
  //     getUserLocationInformation();
  //   }, 300);
  // }, []);

  return (
    <View style={style.container}>
      <Pressable style={style.addressContainer} onPress={() => setDropdownVisible(true)}>
        <TKFrameIcon />
        <View>
          <Text style={style.locationText}>{strings('labels.location')}</Text>
          <Text style={style.locationDetails} ellipsizeMode="tail" numberOfLines={1}>
            {location}
          </Text>
        </View>
      </Pressable>
      <TouchableOpacity
        style={style.profileIconContainer}
        onPress={() => navigation.navigate(navigationStrings.PROFILE)}>
        <TKUserIcon />
      </TouchableOpacity>
      <Modal
        isVisible={isDropdownVisible}
        onBackdropPress={() => setDropdownVisible(false)}
        style={style.modalMainContainer}
        onSwipeComplete={() => setDropdownVisible(false)}
        swipeDirection={['down']}
        propagateSwipe={true}
        useNativeDriverForBackdrop={true}>
        <View style={style.modalContainer}>
          <View style={style.titleContainer}>
            <Text style={style.titleText}>{strings('labels.selectDistrict')}</Text>
          </View>
          <FlatList
            data={DistrictList}
            renderItem={({item, index}) => (
              <TouchableOpacity
                onPress={() => {
                  onPress(item.name);
                  setDropdownVisible(false);
                }}
                style={[
                  style.itemContainer,
                  DistrictList.length - 1 === index && style.itemBorder,
                ]}>
                <Text style={style.itemText}>{item.name}</Text>
              </TouchableOpacity>
            )}
            keyExtractor={(item, index) => index.toString()}
            showsVerticalScrollIndicator={false}
            bounces={false}
          />
        </View>
      </Modal>
    </View>
  );
};

export default LocationBar;

const style = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: moderateScale(16),
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
  modalMainContainer: {margin: 0, justifyContent: 'flex-end'},
  modalContainer: {
    backgroundColor: colors.primaryBackgroundColor,
    maxHeight: '44%',
    borderTopLeftRadius: moderateScale(15),
    borderTopRightRadius: moderateScale(15),
    paddingBottom: getApproximateBottomSafeArea,
  },
  titleContainer: {
    paddingHorizontal: moderateScale(16),
    paddingVertical: moderateScale(20),
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: moderateScale(1),
    borderColor: colors.inputBorder,
  },
  titleText: {
    fontSize: moderateScale(16),
    color: colors.darkTextColor,
    textAlign: 'left',
    lineHeight: moderateScale(24),
    fontFamily: fontFamily.regular,
    fontWeight: '500',
  },
  itemBorder: {
    borderBottomWidth: moderateScale(0),
  },
  closeIcon: {
    marginLeft: 'auto',
  },
  itemContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    borderBottomWidth: moderateScale(1),
    borderColor: colors.disabledTextColor,
    marginVertical: moderateScale(10),
    height: moderateScale(40),
    paddingHorizontal: moderateScale(20),
  },
  itemText: {
    fontFamily: fontFamily.regular,
    fontSize: fontScale(14),
    fontWeight: '500',
    lineHeight: fontScale(22),
  },
});
