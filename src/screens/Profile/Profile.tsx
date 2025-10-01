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

const Profile = () => {
  // const renderHelpButton = () => {
  //   return <TKButton title={strings('labels.help')} type="tertiary" />;
  // };

  return (
    <View style={style.container}>
      <TKHeader
        header={strings('labels.profile')}
        containerStyle={style.headerContainer}
        // rightComponent={renderHelpButton()}
      />
      <UserDetailsCard />
      <ProfileOptions />
      <Text style={style.versionText}>Version {Config.VERSION_NAME}</Text>
      <LogoutButton buttonStyle={style.buttonContainer} />
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
});
