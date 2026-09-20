import React, { useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  SafeAreaView,
  Image,
} from 'react-native';
import { colors } from '../../../config/styles/colors';
import { fontFamily } from '../../../config/styles/fontFamily';
import { fontScale, moderateScale } from '../../../config/styles/responsiveSize';

export interface PlanItem {
  id: '3_months' | '12_months';
  title: string;
  price: number;
  period: string;
  tagline: string;
  features: string[];
}

const PLAN_3_MONTHS: PlanItem = {
  id: '3_months',
  title: '3 MONTHS',
  price: 899,
  period: '3 Months',
  tagline: 'Perfect for getting started and growing your business online.',
  features: [
    'Online Store',
    'Store Link',
    'QR Code',
    'Hosting & Server',
    'Dealzhub Marketing Support',
    '2 Online Shop QR Code Stickers',
    'Product Listing Support',
    'Product/Stock Updates',
    'Customer Enquiry/Order Support',
    'Social Media Sharing',
    'Basic Technical Support',
  ],
};

const PLAN_12_MONTHS: PlanItem = {
  id: '12_months',
  title: '12 MONTHS',
  price: 2999,
  period: '12 Months',
  tagline: 'More features. More support. More visibility. More growth.',
  features: [
    'Online Store',
    'Store Link',
    'QR Code',
    'Hosting & Server',
    'Dealzhub Marketing Support',
    '5 Online Shop QR Code Stickers',
    'Product Listing Support',
    'Product/Stock Updates',
    'Store Performance Insights',
    'Promotional Offers Support',
    'Customer Enquiry/Order Support',
    'Social Media Sharing',
    'Basic Technical Support',
    'Featured Store Opportunity',
  ],
};

interface Props {
  isVisible: boolean;
  onClose?: () => void;
  onSelectPlan: (plan: PlanItem) => void;
  initialPlanId?: '3_months' | '12_months';
}

const SubscriptionPlanModal: React.FC<Props> = ({
  isVisible,
  onClose,
  onSelectPlan,
  initialPlanId = '12_months',
}) => {
  const [selectedPlanId, setSelectedPlanId] = useState<'3_months' | '12_months'>(initialPlanId);

  const handleConfirm = () => {
    const plan = selectedPlanId === '3_months' ? PLAN_3_MONTHS : PLAN_12_MONTHS;
    onSelectPlan(plan);
  };

  return (
    <Modal visible={isVisible} animationType="slide" transparent={false}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image
              source={require('../../../assets/images/appLogo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.title}>SUBSCRIPTION PLANS</Text>
          <Text style={styles.subtitle}>
            Take Your Local Store Online with <Text style={styles.goldText}>Dealzhub</Text>
          </Text>
          {onClose && (
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* 3 Months Plan Card */}
          <TouchableOpacity
            activeOpacity={0.9}
            style={[
              styles.card,
              selectedPlanId === '3_months' ? styles.cardSelected : styles.cardUnselected,
            ]}
            onPress={() => setSelectedPlanId('3_months')}>
            {selectedPlanId === '3_months' && (
              <View style={styles.selectedBadge}>
                <Text style={styles.badgeText}>✓ Selected</Text>
              </View>
            )}

            <View style={styles.cardHeader}>
              <View style={styles.planTitleChip}>
                <Text style={styles.planTitleText}>3 MONTHS</Text>
              </View>
              <Text style={[styles.priceText, selectedPlanId === '3_months' && styles.darkText]}>
                ₹899
              </Text>
            </View>

            <View style={styles.featureList}>
              {PLAN_3_MONTHS.features.map((item, idx) => (
                <View key={idx} style={styles.featureRow}>
                  <Text
                    style={[
                      styles.checkIcon,
                      selectedPlanId === '3_months' ? styles.checkIconDark : styles.checkIconLight,
                    ]}>
                    ✓
                  </Text>
                  <Text
                    style={[
                      styles.featureText,
                      selectedPlanId === '3_months' ? styles.darkText : styles.lightText,
                    ]}>
                    {item}
                  </Text>
                </View>
              ))}
            </View>

            <View style={styles.taglineBox}>
              <Text style={styles.taglineText}>{PLAN_3_MONTHS.tagline}</Text>
            </View>
          </TouchableOpacity>

          {/* 12 Months Plan Card */}
          <TouchableOpacity
            activeOpacity={0.9}
            style={[
              styles.card,
              selectedPlanId === '12_months' ? styles.cardSelected : styles.cardUnselected,
            ]}
            onPress={() => setSelectedPlanId('12_months')}>
            <View style={styles.popularBadge}>
              <Text style={styles.badgeText}>★ Most Popular</Text>
            </View>

            {selectedPlanId === '12_months' && (
              <View style={styles.selectedBadge}>
                <Text style={styles.badgeText}>✓ Selected</Text>
              </View>
            )}

            <View style={styles.cardHeader}>
              <View style={styles.planTitleChip}>
                <Text style={styles.planTitleText}>12 MONTHS</Text>
              </View>
              <Text style={[styles.priceText, selectedPlanId === '12_months' && styles.darkText]}>
                ₹2,999
              </Text>
            </View>

            <View style={styles.featureList}>
              {PLAN_12_MONTHS.features.map((item, idx) => (
                <View key={idx} style={styles.featureRow}>
                  <Text
                    style={[
                      styles.checkIcon,
                      selectedPlanId === '12_months' ? styles.checkIconDark : styles.checkIconLight,
                    ]}>
                    ✓
                  </Text>
                  <Text
                    style={[
                      styles.featureText,
                      selectedPlanId === '12_months' ? styles.darkText : styles.lightText,
                    ]}>
                    {item}
                  </Text>
                </View>
              ))}
            </View>

            <View style={styles.taglineBox}>
              <Text style={styles.taglineText}>{PLAN_12_MONTHS.tagline}</Text>
            </View>
          </TouchableOpacity>

          {/* Trust Banner */}
          <View style={styles.trustBanner}>
            <Text style={styles.trustTitle}>BUILT TO EMPOWER LOCAL BUSINESSES</Text>
            <Text style={styles.trustSubtitle}>
              Trusted by Local Stores • Reach More Customers • Grow Your Business
            </Text>
          </View>
        </ScrollView>

        <View style={styles.footerAction}>
          <TouchableOpacity style={styles.actionButton} onPress={handleConfirm}>
            <Text style={styles.actionButtonText}>
              PROCEED TO PAY ({selectedPlanId === '3_months' ? '₹899' : '₹2,999'})
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export default SubscriptionPlanModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#064E3B',
  },
  header: {
    paddingVertical: moderateScale(16),
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  logoContainer: {
    width: moderateScale(50),
    height: moderateScale(50),
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(12),
    padding: moderateScale(4),
    marginBottom: moderateScale(8),
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: fontScale(20),
    fontFamily: fontFamily.bold,
    color: '#F59E0B',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: fontScale(13),
    fontFamily: fontFamily.medium,
    color: '#ECFDF5',
    marginTop: moderateScale(2),
  },
  goldText: {
    color: '#F59E0B',
    fontFamily: fontFamily.bold,
  },
  closeButton: {
    position: 'absolute',
    right: moderateScale(16),
    top: moderateScale(16),
    width: moderateScale(32),
    height: moderateScale(32),
    borderRadius: moderateScale(16),
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    color: '#FFFFFF',
    fontSize: fontScale(16),
    fontFamily: fontFamily.bold,
  },
  scrollContent: {
    padding: moderateScale(16),
    gap: moderateScale(16),
  },
  card: {
    borderRadius: moderateScale(16),
    padding: moderateScale(16),
    borderWidth: 2,
    position: 'relative',
  },
  cardSelected: {
    backgroundColor: '#FFFBEB',
    borderColor: '#F59E0B',
  },
  cardUnselected: {
    backgroundColor: 'rgba(6, 78, 59, 0.7)',
    borderColor: 'rgba(52, 211, 153, 0.3)',
  },
  selectedBadge: {
    position: 'absolute',
    top: -moderateScale(12),
    right: moderateScale(16),
    backgroundColor: '#F59E0B',
    paddingHorizontal: moderateScale(10),
    paddingVertical: moderateScale(4),
    borderRadius: moderateScale(12),
  },
  popularBadge: {
    position: 'absolute',
    top: -moderateScale(12),
    left: moderateScale(16),
    backgroundColor: '#F59E0B',
    paddingHorizontal: moderateScale(10),
    paddingVertical: moderateScale(4),
    borderRadius: moderateScale(12),
  },
  badgeText: {
    fontSize: fontScale(11),
    fontFamily: fontFamily.bold,
    color: '#064E3B',
  },
  cardHeader: {
    alignItems: 'center',
    paddingBottom: moderateScale(12),
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  planTitleChip: {
    backgroundColor: '#064E3B',
    paddingHorizontal: moderateScale(12),
    paddingVertical: moderateScale(4),
    borderRadius: moderateScale(12),
    marginBottom: moderateScale(6),
  },
  planTitleText: {
    fontSize: fontScale(12),
    fontFamily: fontFamily.bold,
    color: '#F59E0B',
  },
  priceText: {
    fontSize: fontScale(28),
    fontFamily: fontFamily.bold,
    color: '#ECFDF5',
  },
  featureList: {
    marginTop: moderateScale(12),
    gap: moderateScale(8),
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(8),
  },
  checkIcon: {
    fontSize: fontScale(14),
    fontFamily: fontFamily.bold,
  },
  checkIconDark: {
    color: '#047857',
  },
  checkIconLight: {
    color: '#6EE7B7',
  },
  featureText: {
    fontSize: fontScale(13),
    fontFamily: fontFamily.medium,
  },
  darkText: {
    color: '#064E3B',
  },
  lightText: {
    color: '#ECFDF5',
  },
  taglineBox: {
    marginTop: moderateScale(14),
    backgroundColor: '#064E3B',
    padding: moderateScale(10),
    borderRadius: moderateScale(10),
  },
  taglineText: {
    fontSize: fontScale(12),
    fontFamily: fontFamily.medium,
    color: '#ECFDF5',
    textAlign: 'center',
  },
  trustBanner: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: moderateScale(12),
    borderRadius: moderateScale(12),
    alignItems: 'center',
  },
  trustTitle: {
    fontSize: fontScale(11),
    fontFamily: fontFamily.bold,
    color: '#F59E0B',
    letterSpacing: 0.5,
  },
  trustSubtitle: {
    fontSize: fontScale(11),
    fontFamily: fontFamily.regular,
    color: '#A7F3D0',
    marginTop: moderateScale(4),
    textAlign: 'center',
  },
  footerAction: {
    padding: moderateScale(16),
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  actionButton: {
    backgroundColor: '#F59E0B',
    paddingVertical: moderateScale(14),
    borderRadius: moderateScale(25),
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: fontScale(15),
    fontFamily: fontFamily.bold,
    color: '#064E3B',
    letterSpacing: 0.5,
  },
});
