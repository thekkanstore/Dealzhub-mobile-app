import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import Config from 'react-native-config';
import TKHeader from '../../components/Common/TKHeader/TKHeader';
import {strings} from '../../utils/language/langauageUtils';
import {moderateScale} from '../../config/styles/responsiveSize';
import UserDetailsCard from '../../components/Profile/UserDetailsCard/UserDetailsCard';
// import TKButton from '../../components/Common/TKButton/TKButton';
import ProfileOptions from '../../components/Profile/ProfileOptions/ProfileOptions';
import {colors} from '../../config/styles/colors';
import LogoutButton from '../../components/Profile/LogoutButton/LogoutButton';
import {fontFamily} from '../../config/styles/fontFamily';
import {useAppSelector} from '../../redux/hooks';
import TKButton from '../../components/Common/TKButton/TKButton';
import {updateGuestStatus} from '../../redux/userSlice';

const Profile = () => {
  // const renderHelpButton = () => {
  //   return <TKButton title={strings('labels.help')} type="tertiary" />;
  // };

  const isGuest = useAppSelector(state => state.user.isGuest);

  const handleLoginPress = () => {
    updateGuestStatus(false);
  };

  return (
    <View style={style.container}>
      <TKHeader
        header={strings('labels.profile')}
        containerStyle={style.headerContainer}
      />
      {isGuest ? (
        <View style={style.guestContainer}>
          <Text style={style.guestTitle}>Welcome to DealzHub</Text>
          <Text style={style.guestSubtitle}>Login or create an account to view and manage your profile.</Text>
          <TKButton title="Login / Register" onPress={handleLoginPress} type="primary" style={style.loginButton} />
        </View>
      ) : (
        <>
          <UserDetailsCard />
          <ProfileOptions />
          <Text style={style.versionText}>Version {Config.VERSION_NAME}</Text>
          <LogoutButton buttonStyle={style.buttonContainer} />
        </>
      )}
    </View>
  );
};

export default Profile;

const style = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryBackgroundColor,
  },
  headerContainer: {
    paddingHorizontal: moderateScale(20),
  },
  buttonContainer: {
    marginVertical: moderateScale(16),
    marginHorizontal: moderateScale(16),
    alignSelf: 'flex-start',
  },
  versionText: {
    textAlign: 'center',
    fontSize: moderateScale(12),
    fontFamily: fontFamily.medium,
    color: colors.placeHolderTextColor,
    marginBottom: moderateScale(10),
  },
  guestContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: moderateScale(30),
  },
  guestTitle: {
    fontSize: moderateScale(20),
    fontFamily: fontFamily.bold,
    color: colors.primaryTextColor,
    marginBottom: moderateScale(10),
  },
  guestSubtitle: {
    fontSize: moderateScale(14),
    fontFamily: fontFamily.regular,
    color: colors.secondaryTextColor,
    textAlign: 'center',
    marginBottom: moderateScale(30),
  },
  loginButton: {
    width: '100%',
  },
});
