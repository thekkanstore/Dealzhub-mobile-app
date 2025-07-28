import React from 'react';
import {StyleSheet, View} from 'react-native';
import TKHeader from '../../components/TKHeader/TKHeader';
import {strings} from '../../utils/language/langauageUtils';
import NotificationPermissionCard from './components/NotificationPermissionCard/NotificationPermissionCard';
import {moderateScale} from '../../config/styles/responsiveSize';

const Settings = () => {
  return (
    <View>
      <TKHeader header={strings('labels.settings')} containerStyle={style.headerContainerStyle} />
      <NotificationPermissionCard />
    </View>
  );
};

export default Settings;

const style = StyleSheet.create({
  headerContainerStyle: {
    paddingHorizontal: moderateScale(16),
  },
});
