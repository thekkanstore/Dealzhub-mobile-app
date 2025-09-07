import React, {useMemo} from 'react';
import {StyleSheet, View} from 'react-native';
import {Formik} from 'formik';
import {KeyboardAwareScrollView} from 'react-native-keyboard-controller';
import {onlyNumbers} from '../../utils/common/numberUtils';
import {strings} from '../../utils/language/langauageUtils';
import TKSecondaryTextInput from '../../components/Common/TKSecondaryTextInput/TKSecondaryTextInput';
import TKButton from '../../components/Common/TKButton/TKButton';
import {userDetailsInitialValues} from '../../utils/initialValues/userDetailsInitialValues';
import {shouldShowError} from '../../utils/common/errorUtils';
import {useDetailsValidationsSchema} from '../../utils/validations/userDetailsValidation';
import {IUserTable} from '../../config/models/users';
import {moderateScale} from '../../config/styles/responsiveSize';
import TKHeader from '../../components/Common/TKHeader/TKHeader';
import TKRadioButton from '../../components/Common/TKRadioButton/TKRadioButton';
import {useNavigation} from '@react-navigation/native';
import {UserRegisterScreenNavigationProp} from '../../navigation/rootparamstypes';
import {useCreateUser, useGetUserDetails} from '../../react-queries/user/userQueries';
import {useAppSelector} from '../../redux/hooks';
import TKDropdown from '../../components/Common/TKDropdown/TKDropdown';
import {DistrictList} from '../../config/common/constants';

const UserDetailsForm = () => {
  const navigation = useNavigation<UserRegisterScreenNavigationProp>();
  const {mutate: createUser, isPending: isLoading} = useCreateUser();
  const user = useAppSelector(state => state.user.user);
  const {data: userDetails = {}} = useGetUserDetails(true);
  const initialValues: IUserTable = useMemo(() => {
    return userDetailsInitialValues({...user?.user, ...userDetails});
  }, [userDetails, user?.user]);

  const handleSubmit = (values: IUserTable) => {
    createUser(
      {...values, city: values.city.value ?? ''},
      {
        onSuccess: () => {
          navigation.navigate('ChooseUserType');
        },
      },
    );
  };
  return (
    <>
      <TKHeader header={strings('labels.userDetails')} showBackButton={false} />
      <Formik<IUserTable>
        initialValues={initialValues}
        validationSchema={useDetailsValidationsSchema}
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
                error={touched.city && errors.city ? errors.city : undefined}
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

              <TKRadioButton
                value={values.isAgreeTermsAndCondition}
                buttonName={strings('labels.termsAndConditions')}
                onSelect={() =>
                  setFieldValue('isAgreeTermsAndCondition', !values.isAgreeTermsAndCondition)
                }
                isSelected={!!values.isAgreeTermsAndCondition}
              />
            </KeyboardAwareScrollView>

            <TKButton
              title={strings('button.continue')}
              onPress={() => handleSubmit()}
              // onPress={()=> authService.logout()}
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
  },
  addressInputStyle: {
    height: 100,
    alignItems: 'flex-start',
  },
});
