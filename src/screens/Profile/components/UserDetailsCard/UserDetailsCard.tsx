import React from 'react';
import {Image, StyleSheet, Text, View} from 'react-native';
import {colors} from '../../../../config/styles/colors';
import {useAppSelector} from '../../../../redux/hooks';
import {moderateScale} from '../../../../config/styles/responsiveSize';
import {fontFamily} from '../../../../config/styles/fontFamily';
import TKButton from '../../../../components/TKButton/TKButton';
import {strings} from '../../../../utils/language/langauageUtils';

const UserDetailsCard = () => {
  const userDetails = useAppSelector(state => state.user.user);
  return (
    <View style={style.container}>
      <View style={style.subContainer}>
        <Image
          style={style.image}
          source={{uri: userDetails?.user?.photo ?? ''}}
          resizeMode="cover"
        />
        <View>
          <Text style={style.nameText}>{userDetails?.user?.name}</Text>
          <Text
            style={
              style.emailText
            }>{`${userDetails?.user?.email}, ${userDetails?.user?.phone ?? ''}`}</Text>
        </View>
      </View>
      <TKButton title={strings('labels.editProfile')} style={style.buttonContainer} />
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
