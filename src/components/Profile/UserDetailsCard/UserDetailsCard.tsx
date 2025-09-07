import React from 'react';
import {Image, StyleSheet, Text, View} from 'react-native';
import {colors} from '../../../config/styles/colors';
import {moderateScale} from '../../../config/styles/responsiveSize';
import {fontFamily} from '../../../config/styles/fontFamily';
import TKButton from '../../Common/TKButton/TKButton';
import {strings} from '../../../utils/language/langauageUtils';
import {useNavigation} from '@react-navigation/native';
import {navigationStrings} from '../../../navigation/navigationStrings';
import {HomeScreenNavigationProp} from '../../../navigation/rootparamstypes';
import {useGetUserDetails} from '../../../react-queries/user/userQueries';

const UserDetailsCard = () => {
  const {data: userDetails} = useGetUserDetails(true);
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const handleEditProfile = () => {
    navigation.navigate(navigationStrings.REGISTER_USER_STACK, {
      screen: navigationStrings.USER_DETAILS,
      params: {isEdit: true},
    });
  };
  return (
    <View style={style.container}>
      <View style={style.subContainer}>
        <Image style={style.image} source={{uri: userDetails?.photo ?? ''}} resizeMode="cover" />
        <View>
          <Text style={style.nameText}>{userDetails?.name}</Text>
          <Text
            style={
              style.emailText
            }>{`${userDetails?.email ?? ''}, ${userDetails?.phoneNumber ?? ''}`}</Text>
        </View>
      </View>
      <TKButton
        title={strings('labels.editProfile')}
        style={style.buttonContainer}
        onPress={handleEditProfile}
      />
    </View>
  );
};

export default UserDetailsCard;

const style = StyleSheet.create({
  container: {
    backgroundColor: colors.tertiaryButtonBackgroundColor,
    padding: moderateScale(16),
    gap: moderateScale(16),
  },
  subContainer: {
    flexDirection: 'row',
    gap: moderateScale(10),
  },
  image: {
    width: moderateScale(46),
    height: moderateScale(46),
    borderRadius: moderateScale(25),
  },
  nameText: {
    fontSize: moderateScale(16),
    fontFamily: fontFamily.medium,
    color: colors.primaryTextColor,
  },
  emailText: {
    fontSize: moderateScale(16),
    fontFamily: fontFamily.regular,
    color: colors.primaryTextColor,
  },
  buttonContainer: {alignSelf: 'flex-start'},
});
