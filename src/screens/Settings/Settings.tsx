import React from 'react';
import {StyleSheet, View} from 'react-native';
import TKHeader from '../../components/Common/TKHeader/TKHeader';
import {strings} from '../../utils/language/langauageUtils';
import NotificationPermissionCard from '../../components/Settings/NotificationPermissionCard/NotificationPermissionCard';
import {moderateScale} from '../../config/styles/responsiveSize';
import {colors} from '../../config/styles/colors';

const Settings = () => {
  return (
    <View style={style.container}>
      <TKHeader header={strings('labels.settings')} containerStyle={style.headerContainerStyle} />
      <NotificationPermissionCard />
    </View>
  );
};

export default Settings;

const style = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryBackgroundColor,
  },
  headerContainerStyle: {
    paddingHorizontal: moderateScale(16),
  },
});
