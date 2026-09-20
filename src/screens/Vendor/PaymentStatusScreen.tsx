import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {colors} from '../../config/styles/colors';
import {fontScale, moderateScale} from '../../config/styles/responsiveSize';
import {fontFamily} from '../../config/styles/fontFamily';
import {VendorStackParamList} from '../../navigation/rootparamstypes';
import {navigationStrings} from '../../navigation/navigationStrings';
import {
  verifyCashfreePaymentLink,
  verifyCashfreeMobileOrder,
} from '../../services/vendor/cashfreeService';
import {activateStoreSubscriptionAfterPayment, getStoreBasedOnUserIdData} from '../../services/firestore/storeFirestoreService';
import {queryClient} from '../../../App';
import Toast from 'react-native-toast-message';

type PaymentStatusRouteProp = RouteProp<VendorStackParamList, 'PaymentStatus'>;

const PaymentStatusScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<PaymentStatusRouteProp>();
  const {linkId, orderId} = route.params || {};

  const [status, setStatus] = useState<'verifying' | 'success' | 'failed'>('verifying');
  const [message, setMessage] = useState('Verifying your payment status with Cashfree...');
  const [storeId, setStoreId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const checkPayment = async () => {
      try {
        let activeOrderId = orderId || linkId;

        // If neither was passed via deep link, check current user's store
        if (!activeOrderId) {
          const userStore = await getStoreBasedOnUserIdData('');
          if (userStore?.paymentOrderId) {
            activeOrderId = userStore.paymentOrderId;
          }
        }

        if (!activeOrderId) {
          if (isMounted) {
            setStatus('failed');
            setMessage('Payment reference could not be found.');
          }
          return;
        }

        let isPaid = false;

        // 1. Try verifying via Cashfree Links API
        try {
          const linkDetails = await verifyCashfreePaymentLink(activeOrderId);
          if (
            linkDetails?.link_status === 'PAID' ||
            (linkDetails?.link_amount_paid && linkDetails.link_amount_paid > 0)
          ) {
            isPaid = true;
          }
        } catch (linkErr) {
          // 2. Fallback to verifying via Cashfree Orders API
          try {
            const orderDetails = await verifyCashfreeMobileOrder(activeOrderId);
            if (orderDetails?.order_status === 'PAID') {
              isPaid = true;
            }
          } catch (orderErr) {
            console.log('Cashfree order verify fallback error:', orderErr);
          }
        }

        if (isPaid) {
          const activationResult = await activateStoreSubscriptionAfterPayment(activeOrderId);
          if (activationResult.store?.id) {
            setStoreId(activationResult.store.id);
          }

          // Refresh cached queries
          queryClient.invalidateQueries({queryKey: ['storeDetails']});
          queryClient.invalidateQueries({queryKey: ['userDetails']});

          if (isMounted) {
            setStatus('success');
            setMessage('Your payment was successful and your vendor store is now active!');
            Toast.show({
              type: 'success',
              text1: 'Payment Successful',
              text2: 'Your store subscription has been activated.',
            });
          }
        } else {
          if (isMounted) {
            setStatus('failed');
            setMessage('Payment was not completed or was cancelled. Please try again.');
          }
        }
      } catch (error: any) {
        console.error('Payment verification error in mobile app:', error);
        if (isMounted) {
          setStatus('failed');
          setMessage(error?.message || 'Unable to verify payment status. Please contact support.');
        }
      }
    };

    checkPayment();

    return () => {
      isMounted = false;
    };
  }, [linkId, orderId]);

  const handleNavigateToStore = () => {
    navigation.reset({
      index: 0,
      routes: [
        {
          name: navigationStrings.BOTTOM_TAB_STACK,
          state: {
            routes: [
              {
                name: navigationStrings.VENDOR_TAB,
                state: {
                  routes: [
                    {
                      name: navigationStrings.VENDOR,
                      params: storeId ? {storeId} : undefined,
                    },
                  ],
                },
              },
            ],
          },
        },
      ],
    });
  };

  const handleReturnHome = () => {
    navigation.reset({
      index: 0,
      routes: [
        {
          name: navigationStrings.BOTTOM_TAB_STACK,
          state: {
            routes: [{name: navigationStrings.HOME_TAB}],
          },
        },
      ],
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/images/appLogo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {status === 'verifying' && (
          <View style={styles.statusSection}>
            <ActivityIndicator size="large" color={colors.primaryTextColor} style={styles.spinner} />
            <Text style={styles.title}>Verifying Payment</Text>
            <Text style={styles.subText}>{message}</Text>
          </View>
        )}

        {status === 'success' && (
          <View style={styles.statusSection}>
            <View style={styles.iconCircleSuccess}>
              <Text style={styles.successIconText}>✓</Text>
            </View>
            <Text style={styles.title}>Payment Successful!</Text>
            <Text style={styles.subText}>{message}</Text>

            <TouchableOpacity style={styles.primaryButton} onPress={handleNavigateToStore}>
              <Text style={styles.primaryButtonText}>Go to My Store</Text>
            </TouchableOpacity>
          </View>
        )}

        {status === 'failed' && (
          <View style={styles.statusSection}>
            <View style={styles.iconCircleFailed}>
              <Text style={styles.failedIconText}>✕</Text>
            </View>
            <Text style={styles.title}>Payment Unsuccessful</Text>
            <Text style={styles.subText}>{message}</Text>

            <TouchableOpacity style={styles.primaryButton} onPress={handleNavigateToStore}>
              <Text style={styles.primaryButtonText}>Return to Store Registration</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryButton} onPress={handleReturnHome}>
              <Text style={styles.secondaryButtonText}>Return Home</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

export default PaymentStatusScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: moderateScale(20),
  },
  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(24),
    padding: moderateScale(24),
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  logoContainer: {
    width: moderateScale(72),
    height: moderateScale(72),
    borderRadius: moderateScale(20),
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    padding: moderateScale(10),
    marginBottom: moderateScale(20),
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  statusSection: {
    width: '100%',
    alignItems: 'center',
  },
  spinner: {
    marginBottom: moderateScale(16),
  },
  iconCircleSuccess: {
    width: moderateScale(64),
    height: moderateScale(64),
    borderRadius: moderateScale(32),
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: moderateScale(16),
  },
  successIconText: {
    fontSize: fontScale(30),
    color: '#16A34A',
    fontWeight: 'bold',
  },
  iconCircleFailed: {
    width: moderateScale(64),
    height: moderateScale(64),
    borderRadius: moderateScale(32),
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: moderateScale(16),
  },
  failedIconText: {
    fontSize: fontScale(26),
    color: '#DC2626',
    fontWeight: 'bold',
  },
  title: {
    fontSize: fontScale(20),
    fontFamily: fontFamily.bold,
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: moderateScale(8),
  },
  subText: {
    fontSize: fontScale(13),
    fontFamily: fontFamily.regular,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: fontScale(19),
    marginBottom: moderateScale(24),
  },
  primaryButton: {
    width: '100%',
    backgroundColor: colors.primaryTextColor || '#00A859',
    paddingVertical: moderateScale(14),
    borderRadius: moderateScale(30),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: moderateScale(10),
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: fontScale(15),
    fontFamily: fontFamily.semiBold,
  },
  secondaryButton: {
    width: '100%',
    backgroundColor: '#0F172A',
    paddingVertical: moderateScale(14),
    borderRadius: moderateScale(30),
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: '#FFFFFF',
    fontSize: fontScale(15),
    fontFamily: fontFamily.semiBold,
  },
});
