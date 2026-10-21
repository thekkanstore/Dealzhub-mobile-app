import React, {useState} from 'react';
import {Image, StyleSheet, Text, View} from 'react-native';
import {getAuth} from '@react-native-firebase/auth';
import {colors} from '../../../config/styles/colors';
import {moderateScale} from '../../../config/styles/responsiveSize';
import {fontFamily} from '../../../config/styles/fontFamily';
import TKButton from '../../Common/TKButton/TKButton';
import {strings} from '../../../utils/language/langauageUtils';
import {useNavigation} from '@react-navigation/native';
import {navigationStrings} from '../../../navigation/navigationStrings';
import {HomeScreenNavigationProp} from '../../../navigation/rootparamstypes';
import {useGetUserDetails} from '../../../react-queries/user/userQueries';
import {useAppSelector} from '../../../redux/hooks';
import {TKUserIcon} from '../../Common/Icons/TKUserIcon';

const UserDetailsCard = () => {
  const {data: userDetails} = useGetUserDetails(true);
  const reduxUser = useAppSelector(state => state.user.user);
  const authUser = getAuth().currentUser;
  const [hasImageError, setHasImageError] = useState(false);

  const navigation = useNavigation<HomeScreenNavigationProp>();
  const handleEditProfile = () => {
    navigation.navigate(navigationStrings.REGISTER_USER_STACK, {
      screen: navigationStrings.USER_DETAILS,
      params: {isEdit: true},
    });
  };

  const photoUri =
    userDetails?.photo ||
    (userDetails as any)?.photoURL ||
    (userDetails as any)?.avatar ||
    (userDetails as any)?.image ||
    reduxUser?.user?.photo ||
    (reduxUser?.user as any)?.photoURL ||
    authUser?.photoURL ||
    authUser?.providerData?.[0]?.photoURL ||
    '';

  const displayName =
    userDetails?.name ||
    reduxUser?.user?.name ||
    authUser?.displayName ||
    'User';

  const displayEmail =
    userDetails?.email ||
    reduxUser?.user?.email ||
    authUser?.email ||
    '';

  const displayPhone = userDetails?.phoneNumber ? String(userDetails.phoneNumber) : '';
  const contactText = [displayEmail, displayPhone].filter(Boolean).join(', ');

  const showImage = Boolean(photoUri) && !hasImageError;

  return (
    <View style={style.container}>
      <View style={style.subContainer}>
        {showImage ? (
          <Image
            style={style.image}
            source={{uri: photoUri}}
            resizeMode="cover"
            onError={() => setHasImageError(true)}
          />
        ) : (
          <View style={[style.image, style.avatarFallback]}>
            <TKUserIcon width={moderateScale(26)} height={moderateScale(26)} color={colors.secondaryTextColor} />
          </View>
        )}
        <View style={style.textDetailsContainer}>
          <Text style={style.nameText} numberOfLines={1}>
            {displayName}
          </Text>
          <Text style={style.emailText} numberOfLines={2}>
            {contactText}
          </Text>
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
    alignItems: 'center',
    gap: moderateScale(12),
  },
  image: {
    width: moderateScale(52),
    height: moderateScale(52),
    borderRadius: moderateScale(26),
    overflow: 'hidden',
  },
  avatarFallback: {
    backgroundColor: colors.primaryButtonBackgroundColor,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textDetailsContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  nameText: {
    fontSize: moderateScale(16),
    fontFamily: fontFamily.medium,
    color: colors.primaryTextColor,
  },
  emailText: {
    fontSize: moderateScale(14),
    fontFamily: fontFamily.regular,
    color: colors.primaryTextColor,
    marginTop: moderateScale(2),
  },
  buttonContainer: {alignSelf: 'flex-start'},
});
