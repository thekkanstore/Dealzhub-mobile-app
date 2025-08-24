import React, {useState} from 'react';
import TKItemCard from '../../Common/TKItemCard/TKItemCard';
import {StyleSheet, Text} from 'react-native';
import {colors} from '../../../config/styles/colors';
import {moderateScale} from '../../../config/styles/responsiveSize';
import {fontFamily} from '../../../config/styles/fontFamily';
import {strings} from '../../../utils/language/langauageUtils';
import TKSwitch from '../../Common/TKSwitch/TKSwitch';

const NotificationPermissionCard = () => {
  const [enable, setEnable] = useState(false);
  return (
    <TKItemCard style={style.itemContainer}>
      <Text style={style.itemText}>{strings('labels.notifications')}</Text>
      <TKSwitch value={enable} onValueChange={() => setEnable(!enable)} disabled={false} />
    </TKItemCard>
  );
};

export default NotificationPermissionCard;
const style = StyleSheet.create({
  container: {
    backgroundColor: colors.primaryBackgroundColor,
    paddingHorizontal: moderateScale(16),
    paddingVertical: moderateScale(16),
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: moderateScale(8),
    marginHorizontal: moderateScale(16),
    paddingVertical: moderateScale(16),
    paddingHorizontal: moderateScale(16),
    marginTop: moderateScale(16),
  },
  itemText: {
    color: colors.primaryTextColor,
    fontSize: moderateScale(14),
    fontFamily: fontFamily.regular,
  },
});
