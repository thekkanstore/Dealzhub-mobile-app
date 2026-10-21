import React, {useState, useMemo, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import {NavigationProp, ParamListBase, useNavigation} from '@react-navigation/native';
import {colors} from '../../../config/styles/colors';
import {fontScale, moderateScale, verticalScale} from '../../../config/styles/responsiveSize';
import {fontFamily} from '../../../config/styles/fontFamily';
import {
  useGetUserDetails,
  useUpdateCartQuantity,
  useClearStoreCart,
  useGetCartItemsProductList,
  useUpdateCartItemsList,
} from '../../../react-queries/user/userQueries';
import {navigationStrings} from '../../../navigation/navigationStrings';
import CartIemCard from '../CartIemCard/CartIemCard';
import TKNoProductFound from '../../Common/TKNoProductFound/TKNoProductFound';
import {TKWhatsappIcon} from '../../Common/Icons/TKWhatsappIcon';
import {useAppSelector} from '../../../redux/hooks';
import {updateGuestStatus} from '../../../redux/userSlice';

const CartItemsComponent = () => {
  const isGuest = useAppSelector(state => state.user.isGuest);
  const {data: userDetails, isPending: isUserPending} = useGetUserDetails(true);
  const navigation = useNavigation<NavigationProp<ParamListBase>>();

  const {mutate: updateCartQty, isPending: isUpdatingQty} = useUpdateCartQuantity();
  const {mutate: clearStore, isPending: isClearingStore} = useClearStoreCart();
  const {mutate: updateLegacyCart} = useUpdateCartItemsList();
  const {data: legacyProducts, isPending: isLegacyPending} = useGetCartItemsProductList();

  // Active stores from storeCarts
  const activeStores = useMemo(() => {
    const storeCarts = (userDetails as any)?.storeCarts || {};
    return Object.entries(storeCarts)
      .filter(([_, items]) => Array.isArray(items) && items.length > 0)
      .map(([sId, items]) => {
        const itemsList = items as any[];
        const firstItem = itemsList[0] || {};
        const storeInfo = firstItem.store || {};
        return {
          id: sId,
          storeName: storeInfo.storeName || firstItem.storeName || 'Local Store',
          storeLogo: storeInfo.logoUrl || storeInfo.logo || storeInfo.imageUrl || '',
          phoneNumber: String(storeInfo.phoneNumber || storeInfo.phone || ''),
          slug: storeInfo.slug || '',
          items: itemsList,
        };
      });
  }, [userDetails]);

  const [selectedStoreId, setSelectedStoreId] = useState<string>('');

  useEffect(() => {
    if (activeStores.length > 0) {
      if (!selectedStoreId || !activeStores.some(s => s.id === selectedStoreId)) {
        setSelectedStoreId(activeStores[0].id);
      }
    } else {
      setSelectedStoreId('');
    }
  }, [activeStores, selectedStoreId]);

  const currentStore = useMemo(() => {
    return activeStores.find(s => s.id === selectedStoreId) || activeStores[0] || null;
  }, [activeStores, selectedStoreId]);

  // Totals for current selected store
  const {totalCount, totalPrice, totalDiscount} = useMemo(() => {
    if (!currentStore || !currentStore.items) {
      return {totalCount: 0, totalPrice: 0, totalDiscount: 0};
    }
    let count = 0;
    let price = 0;
    let discount = 0;

    currentStore.items.forEach((item: any) => {
      const q = item.quantity || item.cartQuantity || 1;
      const uPrice =
        item.unitPrice !== undefined
          ? item.unitPrice
          : parseFloat(item.discountPrice || item.actualPrice || '0') || 0;
      const itemTotal = item.itemTotalPrice || Math.round(uPrice * q * 100) / 100;
      count += q;
      price += itemTotal;

      const actualP = parseFloat(item.actualPrice || '0') || 0;
      if (actualP > uPrice) {
        discount += Math.round((actualP - uPrice) * q * 100) / 100;
      }
    });

    return {
      totalCount: count,
      totalPrice: Math.round(price * 100) / 100,
      totalDiscount: Math.round(discount * 100) / 100,
    };
  }, [currentStore]);

  // Navigate to Product Details
  const handleOnPressItem = useCallback(
    (item: any) => {
      navigation.navigate(navigationStrings.VENDOR_TAB as any, {
        screen: navigationStrings.PRODUCT_DETAILS,
        params: {
          isStackChange: true,
          product: {id: item.productId || item.id, ...item},
        },
      });
    },
    [navigation],
  );

  // Stepper quantity change
  const handleQuantityChange = useCallback(
    (item: any, newQuantity: number) => {
      if (!currentStore) return;
      if (newQuantity <= 0) {
        Alert.alert(
          'Remove Item',
          `Are you sure you want to remove ${item.name} from your cart?`,
          [
            {text: 'Cancel', style: 'cancel'},
            {
              text: 'Remove',
              style: 'destructive',
              onPress: () => {
                updateCartQty({
                  storeId: currentStore.id,
                  itemMatch: {
                    id: item.id || item.productId,
                    selectedSize: item.selectedSize,
                    selectedWeight: item.selectedWeight,
                  },
                  newQuantity: 0,
                });
              },
            },
          ],
        );
        return;
      }

      updateCartQty({
        storeId: currentStore.id,
        itemMatch: {
          id: item.id || item.productId,
          selectedSize: item.selectedSize,
          selectedWeight: item.selectedWeight,
        },
        newQuantity,
      });
    },
    [currentStore, updateCartQty],
  );

  // Remove single item variant
  const handleRemoveItem = useCallback(
    (item: any) => {
      if (!currentStore) return;
      Alert.alert('Remove Item', `Remove ${item.name} from your cart?`, [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            updateCartQty({
              storeId: currentStore.id,
              itemMatch: {
                id: item.id || item.productId,
                selectedSize: item.selectedSize,
                selectedWeight: item.selectedWeight,
              },
              newQuantity: 0,
            });
          },
        },
      ]);
    },
    [currentStore, updateCartQty],
  );

  // Clear entire store cart
  const handleClearStore = useCallback(() => {
    if (!currentStore) return;
    Alert.alert(
      'Clear Cart',
      `Clear all items from ${currentStore.storeName} cart?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: () => {
            clearStore({storeId: currentStore.id});
          },
        },
      ],
    );
  }, [currentStore, clearStore]);

  // WhatsApp Checkout
  const handleWhatsAppCheckout = useCallback(() => {
    if (!currentStore || !currentStore.items || currentStore.items.length === 0) {
      Alert.alert('Empty Cart', 'Cart is empty.');
      return;
    }

    const rawPhone = String(currentStore.phoneNumber || '').replace(/\D/g, '');
    if (!rawPhone) {
      Alert.alert('Notice', "The store's phone number is not available for WhatsApp order.");
      return;
    }
    const cleanedPhoneNumber = rawPhone.length === 10 ? `91${rawPhone}` : rawPhone;

    const itemsManifest = currentStore.items
      .map((item: any, index: number) => {
        const sizeStr = item.selectedSize ? ` [Size: ${item.selectedSize}]` : '';
        const weightStr = item.selectedWeight ? ` (${item.selectedWeight})` : '';
        const qty = item.quantity || item.cartQuantity || 1;
        const qtyStr = `x${qty}`;
        const uPrice =
          item.unitPrice !== undefined
            ? item.unitPrice
            : parseFloat(item.discountPrice || item.actualPrice || '0') || 0;
        const itemPrice = item.itemTotalPrice || Math.round(uPrice * qty * 100) / 100;
        return `${index + 1}. ${item.name}${sizeStr}${weightStr} ${qtyStr} = ₹${itemPrice}`;
      })
      .join('\n');

    const storeLink = currentStore.slug
      ? `https://dealzhub.co.in/shop/${currentStore.slug}`
      : `https://dealzhub.co.in/vendor/${currentStore.id}`;

    const manifest = `🛒 *New Order from DealzHub*\n🏪 *Store:* ${currentStore.storeName}\n\n*Selected Items:*\n${itemsManifest}\n\n--------------------------------\n🔢 *Total Items:* ${totalCount}\n💵 *Total Amount:* ₹${totalPrice}\n--------------------------------\n\n🔗 *Store Link:* ${storeLink}\n\nPlease confirm availability and payment details. Thank you!`;

    const url = `whatsapp://send?text=${encodeURIComponent(manifest)}&phone=${cleanedPhoneNumber}`;
    Linking.openURL(url).catch(() => {
      Linking.openURL(
        `https://wa.me/${cleanedPhoneNumber}?text=${encodeURIComponent(manifest)}`,
      ).catch(() => {
        Alert.alert('Error', 'Make sure WhatsApp is installed on your device');
      });
    });
  }, [currentStore, totalCount, totalPrice]);

  if (isUserPending) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primaryButtonBackgroundColor} />
        <Text style={styles.loadingText}>Loading your cart...</Text>
      </View>
    );
  }

  // If no storeCarts items
  if (activeStores.length === 0) {
    // Check legacy fallback
    const legacyCount = userDetails?.cartItems?.length || 0;
    if (legacyCount > 0 && legacyProducts && legacyProducts.length > 0) {
      return (
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.legacyHeader}>
            <Text style={styles.legacyHeaderText}>Saved Cart Items</Text>
          </View>
          {legacyProducts.map((p, idx) => {
            if (!p) return null;
            return (
              <CartIemCard
                key={`${p.id}-${idx}`}
                product={p}
                onPress={() => handleOnPressItem(p)}
                onRemove={() => updateLegacyCart({id: p.id, updateStatus: 'remove'})}
              />
            );
          })}
        </ScrollView>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <TKNoProductFound title="Your cart is empty" />
        <Text style={styles.emptySubText}>
          Visit local shops on DealzHub and add items to your store cart.
        </Text>
        {isGuest && (
          <TouchableOpacity
            style={styles.guestLoginButton}
            onPress={() => updateGuestStatus(false)}
            activeOpacity={0.8}>
            <Text style={styles.guestLoginButtonText}>Login to sync saved carts</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContainer}
      showsVerticalScrollIndicator={false}>
      {isGuest && (
        <View style={styles.guestNotice}>
          <Text style={styles.guestNoticeText}>
            💡 Shopping as guest. Items saved on this device.
          </Text>
          <TouchableOpacity onPress={() => updateGuestStatus(false)} activeOpacity={0.7}>
            <Text style={styles.guestNoticeLink}>Login to sync</Text>
          </TouchableOpacity>
        </View>
      )}
      {/* Store Tabs (if multiple stores have cart items) */}
      {activeStores.length > 1 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.storeTabsContainer}>
          {activeStores.map(store => {
            const isSelected = store.id === selectedStoreId;
            const itemCount = store.items.reduce(
              (acc, it) => acc + (it.quantity || it.cartQuantity || 1),
              0,
            );
            return (
              <TouchableOpacity
                key={store.id}
                onPress={() => setSelectedStoreId(store.id)}
                activeOpacity={0.8}
                style={[
                  styles.storeTab,
                  isSelected ? styles.activeStoreTab : styles.inactiveStoreTab,
                ]}>
                <Text
                  style={[
                    styles.storeTabText,
                    isSelected ? styles.activeStoreTabText : styles.inactiveStoreTabText,
                  ]}>
                  {store.storeName}
                </Text>
                <View
                  style={[
                    styles.tabBadge,
                    isSelected ? styles.activeTabBadge : styles.inactiveTabBadge,
                  ]}>
                  <Text
                    style={[
                      styles.tabBadgeText,
                      isSelected ? styles.activeTabBadgeText : styles.inactiveTabBadgeText,
                    ]}>
                    {itemCount}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      {/* Selected Store Card */}
      {currentStore && (
        <View style={styles.storeSection}>
          {/* Store Info Banner */}
          <View style={styles.storeBanner}>
            <View style={styles.storeBannerLeft}>
              {currentStore.storeLogo ? (
                <FastImage
                  source={{uri: currentStore.storeLogo}}
                  style={styles.storeLogo}
                  resizeMode={FastImage.resizeMode.cover}
                />
              ) : (
                <View style={styles.storeLogoPlaceholder}>
                  <Text style={styles.storeLogoInitial}>
                    {currentStore.storeName.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
              <View style={styles.storeNameContainer}>
                <Text numberOfLines={1} style={styles.storeNameText}>
                  {currentStore.storeName}
                </Text>
                <Text style={styles.storeItemsCountText}>
                  {currentStore.items.length}{' '}
                  {currentStore.items.length === 1 ? 'item' : 'items'} in this store cart
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={handleClearStore}
              disabled={isClearingStore}
              style={styles.clearStoreButton}
              activeOpacity={0.7}>
              <Text style={styles.clearStoreButtonText}>Clear</Text>
            </TouchableOpacity>
          </View>

          {/* Cart Items List */}
          <View style={styles.itemsListContainer}>
            {currentStore.items.map((item, index) => (
              <CartIemCard
                key={`${item.id}-${item.selectedSize || ''}-${item.selectedWeight || ''}-${index}`}
                item={item}
                storeId={currentStore.id}
                onPress={() => handleOnPressItem(item)}
                onQuantityChange={newQty => handleQuantityChange(item, newQty)}
                onRemove={() => handleRemoveItem(item)}
                isUpdatingQuantity={isUpdatingQty}
              />
            ))}
          </View>

          {/* Order Summary & WhatsApp Checkout */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <Text style={styles.summaryTitle}>Order Summary</Text>
              <Text numberOfLines={1} style={styles.summarySubtitle}>
                for {currentStore.storeName}
              </Text>
            </View>

            <View style={styles.summaryDivider} />

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Items ({totalCount})</Text>
              <Text style={styles.summaryValue}>
                ₹{(totalPrice + totalDiscount).toLocaleString()}
              </Text>
            </View>

            {totalDiscount > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.savingsLabel}>Discount Savings</Text>
                <Text style={styles.savingsValue}>-₹{totalDiscount.toLocaleString()}</Text>
              </View>
            )}

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Estimated Delivery</Text>
              <Text style={styles.deliveryNote}>Confirmed by store</Text>
            </View>

            <View style={styles.summaryDivider} />

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Amount</Text>
              <Text style={styles.totalValue}>₹{totalPrice.toLocaleString()}</Text>
            </View>

            {totalDiscount > 0 && (
              <View style={styles.savingsBanner}>
                <Text style={styles.savingsBannerText}>
                  🎉 You are saving ₹{totalDiscount.toLocaleString()} on this store order!
                </Text>
              </View>
            )}

            {/* Buy via WhatsApp Button */}
            <TouchableOpacity
              onPress={handleWhatsAppCheckout}
              activeOpacity={0.85}
              style={styles.whatsAppButton}>
              <TKWhatsappIcon width={22} height={22} color="#FFFFFF" />
              <Text style={styles.whatsAppButtonText}>Buy Entire Cart via WhatsApp</Text>
            </TouchableOpacity>

            <Text style={styles.verificationNote}>
              Direct WhatsApp checkout with verified store
            </Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

export default CartItemsComponent;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContainer: {
    paddingBottom: verticalScale(30),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: verticalScale(60),
  },
  loadingText: {
    marginTop: verticalScale(12),
    fontSize: fontScale(14),
    color: colors.primaryTextColor,
    fontFamily: fontFamily.medium,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: moderateScale(24),
    paddingVertical: verticalScale(40),
  },
  emptySubText: {
    fontSize: fontScale(13),
    fontFamily: fontFamily.regular,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: verticalScale(8),
  },
  legacyHeader: {
    paddingHorizontal: moderateScale(16),
    paddingVertical: verticalScale(12),
  },
  legacyHeaderText: {
    fontSize: fontScale(16),
    fontFamily: fontFamily.bold,
    color: colors.primaryTextColor,
  },
  storeTabsContainer: {
    paddingHorizontal: moderateScale(14),
    paddingVertical: verticalScale(10),
    gap: moderateScale(8),
  },
  storeTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: moderateScale(14),
    paddingVertical: verticalScale(8),
    borderRadius: moderateScale(20),
    gap: moderateScale(8),
  },
  activeStoreTab: {
    backgroundColor: colors.primaryButtonBackgroundColor || '#1E3A2F',
  },
  inactiveStoreTab: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  storeTabText: {
    fontSize: fontScale(13),
    fontFamily: fontFamily.semiBold,
  },
  activeStoreTabText: {
    color: '#FFFFFF',
  },
  inactiveStoreTabText: {
    color: '#374151',
  },
  tabBadge: {
    paddingHorizontal: moderateScale(6),
    paddingVertical: verticalScale(1),
    borderRadius: moderateScale(10),
  },
  activeTabBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  inactiveTabBadge: {
    backgroundColor: '#F3F4F6',
  },
  tabBadgeText: {
    fontSize: fontScale(11),
    fontFamily: fontFamily.bold,
  },
  activeTabBadgeText: {
    color: '#FFFFFF',
  },
  inactiveTabBadgeText: {
    color: '#4B5563',
  },
  storeSection: {
    paddingHorizontal: moderateScale(12),
    marginTop: verticalScale(4),
  },
  storeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(16),
    padding: moderateScale(12),
    borderWidth: 1,
    borderColor: '#F3F4F6',
    marginBottom: verticalScale(8),
  },
  storeBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: moderateScale(10),
  },
  storeLogo: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(10),
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  storeLogoPlaceholder: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(10),
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  storeLogoInitial: {
    fontSize: fontScale(16),
    fontFamily: fontFamily.bold,
    color: '#065F46',
  },
  storeNameContainer: {
    flex: 1,
  },
  storeNameText: {
    fontSize: fontScale(15),
    fontFamily: fontFamily.bold,
    color: colors.primaryTextColor,
  },
  storeItemsCountText: {
    fontSize: fontScale(11),
    fontFamily: fontFamily.regular,
    color: '#6B7280',
    marginTop: verticalScale(1),
  },
  clearStoreButton: {
    paddingHorizontal: moderateScale(10),
    paddingVertical: verticalScale(5),
  },
  clearStoreButtonText: {
    fontSize: fontScale(12),
    fontFamily: fontFamily.medium,
    color: '#EF4444',
  },
  itemsListContainer: {
    gap: verticalScale(2),
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(20),
    padding: moderateScale(16),
    marginTop: verticalScale(14),
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryHeader: {
    marginBottom: verticalScale(8),
  },
  summaryTitle: {
    fontSize: fontScale(16),
    fontFamily: fontFamily.bold,
    color: colors.primaryTextColor,
  },
  summarySubtitle: {
    fontSize: fontScale(12),
    fontFamily: fontFamily.regular,
    color: '#6B7280',
    marginTop: verticalScale(2),
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: verticalScale(8),
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: verticalScale(4),
  },
  summaryLabel: {
    fontSize: fontScale(13),
    fontFamily: fontFamily.regular,
    color: '#4B5563',
  },
  summaryValue: {
    fontSize: fontScale(13),
    fontFamily: fontFamily.semiBold,
    color: '#111827',
  },
  savingsLabel: {
    fontSize: fontScale(13),
    fontFamily: fontFamily.medium,
    color: '#059669',
  },
  savingsValue: {
    fontSize: fontScale(13),
    fontFamily: fontFamily.bold,
    color: '#059669',
  },
  deliveryNote: {
    fontSize: fontScale(12),
    fontFamily: fontFamily.regular,
    fontStyle: 'italic',
    color: '#9CA3AF',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: verticalScale(4),
  },
  totalLabel: {
    fontSize: fontScale(15),
    fontFamily: fontFamily.bold,
    color: colors.primaryTextColor,
  },
  totalValue: {
    fontSize: fontScale(20),
    fontFamily: fontFamily.bold,
    color: colors.primaryTextColor,
  },
  savingsBanner: {
    backgroundColor: '#ECFDF5',
    borderRadius: moderateScale(10),
    paddingVertical: verticalScale(8),
    paddingHorizontal: moderateScale(10),
    marginTop: verticalScale(10),
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  savingsBannerText: {
    fontSize: fontScale(11),
    fontFamily: fontFamily.semiBold,
    color: '#065F46',
    textAlign: 'center',
  },
  whatsAppButton: {
    backgroundColor: '#10B981',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: verticalScale(13),
    borderRadius: moderateScale(14),
    marginTop: verticalScale(14),
    gap: moderateScale(8),
    shadowColor: '#10B981',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  whatsAppButtonText: {
    fontSize: fontScale(14),
    fontFamily: fontFamily.bold,
    color: '#FFFFFF',
  },
  verificationNote: {
    fontSize: fontScale(11),
    fontFamily: fontFamily.regular,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: verticalScale(10),
  },
  guestNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: moderateScale(14),
    paddingVertical: verticalScale(8),
    marginHorizontal: moderateScale(12),
    marginTop: verticalScale(8),
    borderRadius: moderateScale(10),
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  guestNoticeText: {
    fontSize: fontScale(12),
    fontFamily: fontFamily.regular,
    color: '#92400E',
    flex: 1,
  },
  guestNoticeLink: {
    fontSize: fontScale(12),
    fontFamily: fontFamily.bold,
    color: '#B45309',
    marginLeft: moderateScale(8),
    textDecorationLine: 'underline',
  },
  guestLoginButton: {
    marginTop: verticalScale(20),
    backgroundColor: colors.primaryButtonBackgroundColor || '#1E3A2F',
    paddingHorizontal: moderateScale(20),
    paddingVertical: verticalScale(10),
    borderRadius: moderateScale(12),
  },
  guestLoginButtonText: {
    fontSize: fontScale(13),
    fontFamily: fontFamily.semiBold,
    color: '#FFFFFF',
  },
});
