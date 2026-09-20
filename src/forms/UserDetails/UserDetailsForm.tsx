import React, {useMemo} from 'react';
import {Linking, StyleSheet, Text, View} from 'react-native';
import {Formik} from 'formik';
import {KeyboardAwareScrollView} from 'react-native-keyboard-controller';
import {onlyNumbers} from '../../utils/common/numberUtils';
import {strings} from '../../utils/language/langauageUtils';
import TKSecondaryTextInput from '../../components/Common/TKSecondaryTextInput/TKSecondaryTextInput';
import TKButton from '../../components/Common/TKButton/TKButton';
import {userDetailsInitialValues} from '../../utils/initialValues/userDetailsInitialValues';
import {shouldShowError} from '../../utils/common/errorUtils';
import {userDetailsValidationsSchema} from '../../utils/validations/userDetailsValidation';
import {IUserTable} from '../../config/models/users';
import {fontScale, moderateScale} from '../../config/styles/responsiveSize';
import TKHeader from '../../components/Common/TKHeader/TKHeader';
import TKRadioButton from '../../components/Common/TKRadioButton/TKRadioButton';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {
  RegisterUserStackParamList,
  UserRegisterScreenNavigationProp,
} from '../../navigation/rootparamstypes';
import {useCreateUser, useGetUserDetails} from '../../react-queries/user/userQueries';
import {useAppSelector} from '../../redux/hooks';
import TKDropdown from '../../components/Common/TKDropdown/TKDropdown';
import {DistrictList} from '../../config/common/constants';
import TKRenderIf from '../../components/Common/TKRenderIf/TKRenderIf';
import {colors} from '../../config/styles/colors';
import {fontFamily} from '../../config/styles/fontFamily';
import authService from '../../services/auth/authService';
import {updateNewUserStatus} from '../../redux/userSlice';

const UserDetailsForm = () => {
  const navigation = useNavigation<UserRegisterScreenNavigationProp>();
  const route = useRoute<RouteProp<RegisterUserStackParamList, 'UserDetails'>>();
  const {isEdit = false} = route.params || {};
  const {mutate: createUser, isPending: isLoading} = useCreateUser(isEdit);
  const user = useAppSelector(state => state.user.user);
  const {data: userDetails} = useGetUserDetails(true);

  React.useEffect(() => {
    const details = userDetails as IUserTable | undefined;
    if (
      !isEdit &&
      details &&
      (details.phoneNumber ||
        (details.role && details.role.length > 0) ||
        (details as any).address)
    ) {
      updateNewUserStatus(false);
    }
  }, [isEdit, userDetails]);

  const initialValues: IUserTable = useMemo(() => {
    return userDetailsInitialValues({...user?.user, ...(userDetails || {})});
  }, [userDetails, user?.user]);

  const appConfig = useAppSelector(state => state.sessionStates.appConfig);
  const handleSubmit = (values: IUserTable) => {
    const cityValue = (typeof values.city === 'object' && values.city !== null ? (values.city as any).value : values.city) ?? '';
    createUser(
      {...values, city: cityValue},
      {
        onSuccess: () => {
          if (isEdit) {
            navigation.goBack();
            return;
          }
          navigation.navigate('ChooseUserType');
        },
      },
    );
  };

  const renderTermsAndConditions = () => {
    return (
      <Text style={styles.buttonText}>
        {strings('labels.termsAndConditions')}
        <Text style={styles.termsAndConditionsText} onPress={handleRedirectToTermsAndConditions}>
          {strings('button.termsAndConditions')}
        </Text>
      </Text>
    );
  };

  const handleRedirectToTermsAndConditions = () => {
    Linking.openURL(appConfig?.termsAndConditions || '');
  };

  const handleGoBack = async () => {
    if (isEdit) {
      navigation.goBack();
      return;
    }
    await authService.logout();
  };
  return (
    <>
      <TKHeader
        header={strings('labels.userDetails')}
        onBackPress={handleGoBack}
        containerStyle={styles.headerContainer}
      />
      <Formik<IUserTable>
        initialValues={initialValues}
        validationSchema={() => userDetailsValidationsSchema(isEdit)}
        onSubmit={handleSubmit}
        enableReinitialize
        validateOnMount={false}>
        {({handleChange, handleBlur, handleSubmit, values, errors, touched, setFieldValue}) => (
          <View style={styles.container}>
            <KeyboardAwareScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps={'handled'}
              bounces={false}>
              <TKSecondaryTextInput
                label={strings('labels.fullName')}
                isRequired
                value={values.name}
                onChangeText={data => handleChange('name')(data)}
                onBlur={handleBlur('name')}
                error={
                  shouldShowError<IUserTable>(initialValues, 'name', touched, errors)
                    ? errors.name
                    : undefined
                }
                placeholder={strings('placeholder.fullName')}
                editable={false}
                isDisabled
              />
              <TKSecondaryTextInput
                label={strings('labels.emailAddress')}
                isRequired
                value={values.email}
                onChangeText={data => handleChange('email')(data)}
                onBlur={handleBlur('email')}
                error={
                  shouldShowError<IUserTable>(initialValues, 'email', touched, errors)
                    ? errors.email
                    : undefined
                }
                placeholder={strings('placeholder.emailAddress')}
                editable={false}
                isDisabled
              />
              <TKSecondaryTextInput
                label={strings('labels.phoneNumber')}
                isRequired
                value={values.phoneNumber?.toString()}
                onChangeText={data => handleChange('phoneNumber')(onlyNumbers(data))}
                onBlur={handleBlur('phoneNumber')}
                error={
                  shouldShowError<IUserTable>(initialValues, 'phoneNumber', touched, errors)
                    ? errors.phoneNumber
                    : undefined
                }
                placeholder={strings('placeholder.phoneNumber')}
              />
              <TKSecondaryTextInput
                label={strings('labels.address')}
                isRequired
                value={values.address}
                onChangeText={data => handleChange('address')(data)}
                onBlur={handleBlur('address')}
                error={
                  shouldShowError<IUserTable>(initialValues, 'address', touched, errors)
                    ? errors.address
                    : undefined
                }
                placeholder={strings('placeholder.address')}
                containerStyle={styles.addressInputStyle}
              />
              <TKDropdown
                label={strings('labels.city')}
                isRequired
                data={DistrictList}
                labelKey={'name'}
                isVisible={false}
                onPress={data => setFieldValue('city', data)}
                selectedItem={values.city as any}
                error={touched.city && errors.city ? (typeof errors.city === 'string' ? errors.city : (errors.city as any)?.name || 'City is required') : undefined}
                placeholder={strings('placeholder.city')}
              />
              <TKSecondaryTextInput
                label={strings('labels.state')}
                isRequired
                value={values.state}
                onChangeText={data => handleChange('state')(data)}
                onBlur={handleBlur('state')}
                error={
                  shouldShowError<IUserTable>(initialValues, 'state', touched, errors)
                    ? errors.state
                    : undefined
                }
                placeholder={strings('placeholder.state')}
                isDisabled
                editable={false}
              />
              <TKRenderIf isRender={!isEdit}>
                <TKRadioButton
                  value={values.isAgreeTermsAndCondition}
                  buttonName={renderTermsAndConditions()}
                  onSelect={() =>
                    setFieldValue('isAgreeTermsAndCondition', !values.isAgreeTermsAndCondition)
                  }
                  isSelected={!!values.isAgreeTermsAndCondition}
                />
              </TKRenderIf>
            </KeyboardAwareScrollView>

            <TKButton
              title={strings('button.continue')}
              onPress={() => handleSubmit()}
              isLoading={isLoading}
            />
          </View>
        )}
      </Formik>
    </>
  );
};

export default UserDetailsForm;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: moderateScale(16),
    paddingVertical: moderateScale(10),
    backgroundColor: colors.primaryBackgroundColor,
  },
  addressInputStyle: {
    height: 100,
    alignItems: 'flex-start',
  },
  buttonText: {
    fontSize: fontScale(14),
    color: colors.placeHolderTextColor,
    fontFamily: fontFamily.regular,
    marginLeft: moderateScale(6),
    fontWeight: '400',
    lineHeight: fontScale(18),
    alignSelf: 'center',
    flexWrap: 'wrap',
  },
  termsAndConditionsText: {
    fontSize: fontScale(14),
    color: colors.neutralButtonTextColor,
    fontFamily: fontFamily.medium,
    marginLeft: moderateScale(6),
    fontWeight: '400',
    lineHeight: fontScale(18),
    textDecorationLine: 'underline',
  },
  termsAndConditions: {
    flexWrap: 'wrap',
  },
  headerContainer: {
    paddingHorizontal: moderateScale(16),
  },
});
