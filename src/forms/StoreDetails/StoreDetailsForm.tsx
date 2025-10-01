import React, {useMemo} from 'react';
import {StyleSheet, View} from 'react-native';
import {Formik} from 'formik';
import {useNavigation, useRoute} from '@react-navigation/native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-controller';
import {onlyNumbers} from '../../utils/common/numberUtils';
import {strings} from '../../utils/language/langauageUtils';
import TKSecondaryTextInput from '../../components/Common/TKSecondaryTextInput/TKSecondaryTextInput';
import TKButton from '../../components/Common/TKButton/TKButton';
import {shouldShowError} from '../../utils/common/errorUtils';
import {moderateScale} from '../../config/styles/responsiveSize';
import TKHeader from '../../components/Common/TKHeader/TKHeader';
import {storeDetailsInitialValues} from '../../utils/initialValues/storeDetailsInitialValues';
import {IStoreRequestBody} from '../../config/models/store';
import {storeDetailsValidationsSchema} from '../../utils/validations/storeDetailsValidation';
import TKDropdown from '../../components/Common/TKDropdown/TKDropdown';
import {DistrictList} from '../../config/common/constants';
import {
  useCreateNewUserStore,
  useGetStoreDetails,
  useUpdateUserStore,
} from '../../react-queries/store/storeQueries';
import {updateNewUserStatus} from '../../redux/userSlice';
import {colors} from '../../config/styles/colors';

const StoreDetailsForm = () => {
  const {mutate: createStore, isPending: createStoreLoader} = useCreateNewUserStore();
  const {mutate: updateStore, isPending: updateStoreLoader} = useUpdateUserStore();
  const {data: storeDetails} = useGetStoreDetails();
  // eslint-disable-next-line no-unsafe-optional-chaining
  const {isEdit = false} = useRoute()?.params || {};
  const navigation = useNavigation();
  const initialValues: IStoreRequestBody = useMemo(() => {
    return storeDetailsInitialValues(storeDetails ?? undefined);
  }, [storeDetails]);

  const handleSubmit = (values: IStoreRequestBody) => {
    if (isEdit) {
      updateStore(
        {...values, city: values.city.value ?? ''},
        {
          onSuccess: () => {
            navigation.goBack();
          },
        },
      );
      return;
    }
    createStore(
      {...values, city: values.city.value ?? ''},
      {
        onSuccess: () => {
          updateNewUserStatus(false);
        },
      },
    );
  };
  return (
    <>
      <TKHeader header={strings('labels.storeDetails')} />
      <Formik<IStoreRequestBody>
        initialValues={initialValues}
        validationSchema={storeDetailsValidationsSchema}
        onSubmit={handleSubmit}>
        {({
          handleChange,
          handleBlur,
          handleSubmit,
          values,
          errors,
          touched,
          isValid,
          dirty,
          setFieldValue,
        }) => (
          <View style={styles.container}>
            <KeyboardAwareScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps={'handled'}
              bounces={false}>
              <TKSecondaryTextInput
                label={strings('labels.storeName')}
                isRequired
                value={values.storeName}
                onChangeText={data => handleChange('storeName')(data)}
                onBlur={handleBlur('storeName')}
                error={
                  shouldShowError<IStoreRequestBody>(initialValues, 'storeName', touched, errors)
                    ? errors.storeName
                    : undefined
                }
                placeholder={strings('placeholder.storeName')}
              />
              <TKSecondaryTextInput
                label={strings('labels.storeEmailAddress')}
                isRequired
                value={values.email}
                onChangeText={data => handleChange('email')(data)}
                onBlur={handleBlur('email')}
                error={
                  shouldShowError<IStoreRequestBody>(initialValues, 'email', touched, errors)
                    ? errors.email
                    : undefined
                }
                placeholder={strings('placeholder.storeEmailAddress')}
              />
              <TKSecondaryTextInput
                label={strings('labels.storePhoneNumber')}
                isRequired
                value={values.phoneNumber?.toString()}
                onChangeText={data => handleChange('phoneNumber')(onlyNumbers(data))}
                onBlur={handleBlur('phoneNumber')}
                error={
                  shouldShowError<IStoreRequestBody>(initialValues, 'phoneNumber', touched, errors)
                    ? errors.phoneNumber
                    : undefined
                }
                placeholder={strings('placeholder.storePhoneNumber')}
              />
              <TKSecondaryTextInput
                label={strings('labels.storeAddress')}
                isRequired
                value={values.address}
                onChangeText={data => handleChange('address')(data)}
                onBlur={handleBlur('address')}
                error={
                  shouldShowError<IStoreRequestBody>(initialValues, 'address', touched, errors)
                    ? errors.address
                    : undefined
                }
                placeholder={strings('placeholder.storeAddress')}
                containerStyle={styles.addressInputStyle}
              />
              <TKDropdown
                label={strings('labels.storeCity')}
                isRequired
                data={DistrictList}
                labelKey={'name'}
                isVisible={false}
                onPress={data => setFieldValue('city', data)}
                selectedItem={values.city as any}
                error={touched.city && errors.city ? errors.city : undefined}
                placeholder={strings('placeholder.storeCity')}
              />
              <TKSecondaryTextInput
                label={strings('labels.storeState')}
                isRequired
                value={values.state}
                onChangeText={data => handleChange('state')(data)}
                onBlur={handleBlur('state')}
                error={
                  shouldShowError<IStoreRequestBody>(initialValues, 'state', touched, errors)
                    ? errors.state
                    : undefined
                }
                placeholder={strings('placeholder.storeState')}
              />
            </KeyboardAwareScrollView>

            <TKButton
              title={strings('button.continue')}
              onPress={() => handleSubmit()}
              isLoading={createStoreLoader || updateStoreLoader}
              isDisabled={!isValid || !dirty}
            />
          </View>
        )}
      </Formik>
    </>
  );
};

export default StoreDetailsForm;

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
});
