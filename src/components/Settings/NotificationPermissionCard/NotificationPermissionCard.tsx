import React, {useState} from 'react';
import TKItemCard from '../../Common/TKItemCard/TKItemCard';
import {StyleSheet, Text} from 'react-native';
import {colors} from '../../../config/styles/colors';
import {moderateScale} from '../../../config/styles/responsiveSize';
import {fontFamily} from '../../../config/styles/fontFamily';
import {strings} from '../../../utils/language/langauageUtils';
import TKSwitch from '../../Common/TKSwitch/TKSwitch';
import TKConfirmModal from '../../Common/TKConfirmModal/TKConfirmModal';
import {
  useGetUserDetails,
  useUpdateNotificationStatus,
} from '../../../react-queries/user/userQueries';

const NotificationPermissionCard = () => {
  const [enable, setEnable] = useState(false);
  const {data: userDetails} = useGetUserDetails();
  const {mutate: updateNotificationStatus, isPending} = useUpdateNotificationStatus();
  const handleNotification = () => {
    updateNotificationStatus(!userDetails?.notification, {
      onSettled: () => {
        setEnable(false);
      },
    });
  };
  return (
    <TKItemCard style={style.itemContainer}>
      <Text style={style.itemText}>{strings('labels.notifications')}</Text>
      <TKSwitch
        value={!!userDetails?.notification}
        onValueChange={() => setEnable(!enable)}
        disabled={false}
      />
      <TKConfirmModal
        isVisible={enable}
        cancelButtonAction={() => setEnable(false)}
        title={strings('labels.confirmation')}
        bodyText={
          !userDetails?.notification
            ? strings('labels.enableNotification')
            : strings('labels.disableNotification')
        }
        confirmButtonText={
          !userDetails?.notification ? strings('button.enable') : strings('button.disable')
        }
        confirmButtonAction={handleNotification}
        isConfirmLoader={isPending}
      />
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
