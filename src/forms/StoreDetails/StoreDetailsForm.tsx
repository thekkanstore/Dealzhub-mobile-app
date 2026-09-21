import React, {useMemo, useState} from 'react';
import {Alert, Linking, StyleSheet, Text, View} from 'react-native';
import {Formik} from 'formik';
import {useNavigation, useRoute} from '@react-navigation/native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-controller';
import {onlyNumbers} from '../../utils/common/numberUtils';
import {strings} from '../../utils/language/langauageUtils';
import TKSecondaryTextInput from '../../components/Common/TKSecondaryTextInput/TKSecondaryTextInput';
import TKButton from '../../components/Common/TKButton/TKButton';
import {shouldShowError} from '../../utils/common/errorUtils';
import {fontScale, moderateScale} from '../../config/styles/responsiveSize';
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
import {useAppSelector} from '../../redux/hooks';

import {fontFamily} from '../../config/styles/fontFamily';

import SubscriptionPlanModal, { PlanItem } from '../../components/Vendor/SubscriptionPlanModal/SubscriptionPlanModal';
import { initiateCashfreeWebPayment } from '../../services/vendor/cashfreeService';
import { TouchableOpacity } from 'react-native';

const StoreDetailsForm = () => {
  const {mutate: createStore, isPending: createStoreLoader} = useCreateNewUserStore();
  const {mutate: updateStore, isPending: updateStoreLoader} = useUpdateUserStore();
  const {data: storeDetails} = useGetStoreDetails();
  // eslint-disable-next-line no-unsafe-optional-chaining
  const {isEdit = false} = (useRoute()?.params as any) || {};
  const navigation = useNavigation();
  const initialValues: IStoreRequestBody = useMemo(() => {
    return storeDetailsInitialValues(storeDetails ?? undefined);
  }, [storeDetails]);

  const isPendingStatus = storeDetails?.vendorStatus?.toLowerCase() === 'pending';
  const isPaymentPending = storeDetails?.paymentStatus === 'pending' || storeDetails?.paymentStatus === 'FAILED' || (isPendingStatus && storeDetails?.paymentStatus !== 'PAID');

  const subscriptionEndDate = storeDetails?.subscriptionEndDate?.toDate
    ? storeDetails.subscriptionEndDate.toDate()
    : storeDetails?.subscriptionEndDate
    ? new Date(storeDetails.subscriptionEndDate)
    : null;

  const isExpired = subscriptionEndDate ? subscriptionEndDate < new Date() : false;
  const isSubscriptionActive = isEdit && !isPaymentPending && !isExpired && storeDetails?.paymentStatus === 'PAID';

  const [selectedPlan, setSelectedPlan] = useState<PlanItem>({
    id: '12_months',
    title: '12 MONTHS',
    price: 2999,
    period: '12 Months',
    tagline: 'More features. More support. More visibility. More growth.',
    features: [],
  });
  const [isPlanModalVisible, setIsPlanModalVisible] = useState(false);
  const [isCashfreeLoading, setIsCashfreeLoading] = useState(false);

  const handleSubmit = (values: IStoreRequestBody) => {
    const normalizedEmail = values.email ? values.email.trim().toLowerCase() : '';
    const cityValue = (typeof values.city === 'object' && values.city !== null ? (values.city as any).value : values.city) ?? '';

    if (isEdit) {
      updateStore(
        {...values, email: normalizedEmail, city: cityValue},
        {
          onSuccess: () => {
            navigation.goBack();
          },
        },
      );
      return;
    }

    const orderId = `order_${Date.now()}_${values.storeName.replace(/[^a-zA-Z0-9]/g, '').slice(0, 5)}`;

    setIsCashfreeLoading(true);
    createStore(
      {
        ...values,
        email: normalizedEmail,
        city: cityValue,
        // @ts-ignore
        subscriptionPlan: selectedPlan.id,
        subscriptionAmount: selectedPlan.price,
        paymentStatus: 'pending',
        paymentOrderId: orderId,
        vendorStatus: 'pending',
      },
      {
        onSuccess: async () => {
          updateNewUserStatus(false);
          try {
            const checkoutUrl = await initiateCashfreeWebPayment({
              orderId,
              orderAmount: selectedPlan.price,
              customerName: values.storeName,
              customerEmail: values.email,
              customerPhone: values.phoneNumber?.toString() || '9999999999',
            });

            if (checkoutUrl) {
              await Linking.openURL(checkoutUrl);
            }
          } catch (err: any) {
            console.error('Cashfree payment error:', err);
            Alert.alert(
              'Payment Notice',
              'Your store was registered, but the payment page could not be opened automatically. Please tap "Edit Store" to complete payment.',
            );
          } finally {
            setIsCashfreeLoading(false);
            navigation.goBack();
          }
        },
        onError: () => {
          setIsCashfreeLoading(false);
        },
      },
    );
  };
  return (
    <>
      <TKHeader header={strings('labels.storeDetails')} containerStyle={styles.headerContainer} />
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
                label="Store Bio / Tagline"
                value={values.bio}
                onChangeText={data => handleChange('bio')(data)}
                onBlur={handleBlur('bio')}
                placeholder="Brief description or tagline for your store"
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
                error={touched.city && errors.city ? (typeof errors.city === 'string' ? errors.city : (errors.city as any)?.name || 'City is required') : undefined}
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
                editable={false}
              />

              {isEdit && isPaymentPending && (
                <View style={styles.pendingPayBox}>
                  <Text style={styles.warningTitle}>Payment Required</Text>
                  <Text style={styles.warningSubText}>Your shop registration payment is pending.</Text>
                  <TKButton
                    title={`Complete Payment (₹${storeDetails?.subscriptionAmount || 2999})`}
                    type="primary"
                    style={{marginTop: moderateScale(10)}}
                    isLoading={isCashfreeLoading}
                    onPress={async () => {
                      if (!storeDetails?.id) return;
                      const orderId = `order_${Date.now()}_${storeDetails.id.slice(0, 5)}`;
                      setIsCashfreeLoading(true);
                      try {
                        const checkoutUrl = await initiateCashfreeWebPayment({
                          orderId,
                          orderAmount: storeDetails.subscriptionAmount || 2999,
                          customerName: storeDetails.storeName || 'Store',
                          customerEmail: storeDetails.email || 'vendor@dealzhub.co.in',
                          customerPhone: storeDetails.phoneNumber?.toString() || '9999999999',
                        });
                        if (checkoutUrl) {
                          await Linking.openURL(checkoutUrl);
                        }
                      } catch (e: any) {
                        console.error('Payment launch error:', e);
                        Alert.alert('Payment Error', e?.message || 'Failed to open payment link');
                      } finally {
                        setIsCashfreeLoading(false);
                      }
                    }}
                  />
                </View>
              )}

              {isEdit && isExpired && (
                <View style={styles.expiredBox}>
                  <Text style={styles.warningTitle}>Subscription Expired</Text>
                  <Text style={styles.warningSubText}>
                    Your plan expired on {subscriptionEndDate?.toLocaleDateString('en-IN') || ''}.
                  </Text>
                  <TKButton
                    title="Renew / Upgrade Subscription"
                    type="primary"
                    style={{marginTop: moderateScale(10)}}
                    onPress={() => setIsPlanModalVisible(true)}
                  />
                </View>
              )}

              {isSubscriptionActive && (
                <View style={styles.activePlanBox}>
                  <Text style={styles.activePlanTitle}>ACTIVE SUBSCRIPTION</Text>
                  <Text style={styles.activePlanText}>
                    {storeDetails?.subscriptionPlan === '3_months' ? '3 Months (₹899)' : '12 Months (₹2,999)'}
                  </Text>
                  <Text style={styles.activePlanSub}>
                    Valid until: {subscriptionEndDate?.toLocaleDateString('en-IN') || 'N/A'}
                  </Text>
                </View>
              )}

              {!isEdit && (
                <View style={styles.planCard}>
                  <View>
                    <Text style={styles.planCardSubTitle}>SUBSCRIPTION PLAN</Text>
                    <Text style={styles.planCardTitle}>
                      {selectedPlan.id === '3_months' ? '3 Months (₹899)' : '12 Months (₹2,999)'}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.changePlanBtn}
                    onPress={() => setIsPlanModalVisible(true)}>
                    <Text style={styles.changePlanText}>Change Plan</Text>
                  </TouchableOpacity>
                </View>
              )}
            </KeyboardAwareScrollView>

            <TKButton
              title={isEdit ? 'Update Store' : `Proceed to Pay (₹${selectedPlan.price})`}
              onPress={() => handleSubmit()}
              isLoading={createStoreLoader || updateStoreLoader || isCashfreeLoading}
              isDisabled={!isValid || !dirty}
            />

            <SubscriptionPlanModal
              isVisible={isPlanModalVisible}
              onClose={() => setIsPlanModalVisible(false)}
              onSelectPlan={plan => {
                setSelectedPlan(plan);
                setIsPlanModalVisible(false);
              }}
              initialPlanId={selectedPlan.id}
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
  headerContainer: {
    paddingHorizontal: moderateScale(16),
  },
  planCard: {
    backgroundColor: '#064E3B',
    padding: moderateScale(14),
    borderRadius: moderateScale(12),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: moderateScale(10),
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  planCardSubTitle: {
    fontSize: fontScale(11),
    fontFamily: fontFamily.bold,
    color: '#A7F3D0',
  },
  planCardTitle: {
    fontSize: fontScale(14),
    fontFamily: fontFamily.bold,
    color: '#F59E0B',
    marginTop: moderateScale(2),
  },
  changePlanBtn: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: moderateScale(12),
    paddingVertical: moderateScale(6),
    borderRadius: moderateScale(12),
  },
  changePlanText: {
    fontSize: fontScale(12),
    fontFamily: fontFamily.medium,
    color: '#FFFFFF',
  },
  pendingPayBox: {
    backgroundColor: '#FEF3C7',
    padding: moderateScale(14),
    borderRadius: moderateScale(12),
    borderWidth: 1,
    borderColor: '#FDE68A',
    marginVertical: moderateScale(10),
  },
  expiredBox: {
    backgroundColor: '#FEE2E2',
    padding: moderateScale(14),
    borderRadius: moderateScale(12),
    borderWidth: 1,
    borderColor: '#FCA5A5',
    marginVertical: moderateScale(10),
  },
  activePlanBox: {
    backgroundColor: '#064E3B',
    padding: moderateScale(14),
    borderRadius: moderateScale(12),
    borderWidth: 1,
    borderColor: '#F59E0B',
    marginVertical: moderateScale(10),
  },
  warningTitle: {
    fontSize: fontScale(14),
    fontFamily: fontFamily.bold,
    color: '#92400E',
  },
  warningSubText: {
    fontSize: fontScale(12),
    fontFamily: fontFamily.regular,
    color: '#B45309',
    marginTop: moderateScale(2),
  },
  activePlanTitle: {
    fontSize: fontScale(11),
    fontFamily: fontFamily.bold,
    color: '#A7F3D0',
    letterSpacing: 0.5,
  },
  activePlanText: {
    fontSize: fontScale(14),
    fontFamily: fontFamily.bold,
    color: '#F59E0B',
    marginTop: moderateScale(2),
  },
  activePlanSub: {
    fontSize: fontScale(12),
    fontFamily: fontFamily.medium,
    color: '#ECFDF5',
    marginTop: moderateScale(2),
  },
});
