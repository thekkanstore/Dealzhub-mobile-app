import {Linking, StyleSheet, Alert} from 'react-native';
import React, {useMemo} from 'react';
import TKButton from '../../Common/TKButton/TKButton';
import {strings} from '../../../utils/language/langauageUtils';
import {IProduct} from '../../../config/models/product';
import {useGetUserDetails, useUpdateCartItemsList} from '../../../react-queries/user/userQueries';
import {useAppSelector} from '../../../redux/hooks';
import {updateGuestStatus} from '../../../redux/userSlice';
import TKConfirmModal from '../../Common/TKConfirmModal/TKConfirmModal';
import {useState} from 'react';

interface Props {
  productDetails: IProduct;
}
const CustomerAction: React.FC<Props> = ({productDetails}) => {
  const {mutate: addToCart, isPending: isAddToCartLoader} = useUpdateCartItemsList();
  const {data: userDetails} = useGetUserDetails();
  const isAlreadyAddedToCart = useMemo(
    () => userDetails?.cartItems?.includes(productDetails?.id),
    [userDetails?.cartItems, productDetails?.id],
  );

  const isGuest = useAppSelector(state => state.user.isGuest);
  const [isLoginModalVisible, setIsLoginModalVisible] = useState(false);

  const handleAddToCart = () => {
    if (isGuest) {
      setIsLoginModalVisible(true);
      return;
    }
    addToCart({
      id: productDetails.id,
      updateStatus: 'add',
    });
  };
  const handleBuyNow = () => {
    if (isGuest) {
      setIsLoginModalVisible(true);
      return;
    }
    const message = `Hi! I'm interested in ${productDetails.name}, priced at ${productDetails.discountPrice}. Can you tell me more?`;
    const rawPhone = productDetails.store.phoneNumber || '';
    const cleanPhone = rawPhone.replace(/\D/g, ''); // Remove non-digit characters
    const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

    const url =
      'whatsapp://send?text=' +
      encodeURIComponent(message) +
      '&phone=' +
      formattedPhone;
    Linking.openURL(url)
      .then(() => {})
      .catch(() => Alert.alert('Error', 'Make sure WhatsApp installed on your device'));
  };

  return (
    <>
      <TKButton
        title={strings('button.addToCart')}
        type={'secondary'}
        style={styles.button}
        onPress={handleAddToCart}
        isDisabled={
          isAlreadyAddedToCart || productDetails?.isSoldOut || productDetails?.isOutOfStock
        }
        isLoading={isAddToCartLoader}
      />
      <TKButton
        title={strings('button.buyNow')}
        type={'primary'}
        style={styles.button}
        onPress={handleBuyNow}
        isDisabled={productDetails?.isSoldOut || productDetails?.isOutOfStock}
      />
      <TKConfirmModal
        isVisible={isLoginModalVisible}
        title="Login Required"
        bodyText="Please login or register to add items to your cart and make purchases."
        confirmButtonText="Login / Register"
        confirmButtonAction={() => {
          setIsLoginModalVisible(false);
          updateGuestStatus(false);
        }}
        cancelButtonText="Cancel"
        cancelButtonAction={() => setIsLoginModalVisible(false)}
      />
    </>
  );
};

export default CustomerAction;

const styles = StyleSheet.create({
  button: {
    width: '45%',
  },
});
