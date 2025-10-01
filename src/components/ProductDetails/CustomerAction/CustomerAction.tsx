import {Linking, StyleSheet, Alert} from 'react-native';
import React, {useMemo} from 'react';
import TKButton from '../../Common/TKButton/TKButton';
import {strings} from '../../../utils/language/langauageUtils';
import {IProduct} from '../../../config/models/product';
import {useGetUserDetails, useUpdateCartItemsList} from '../../../react-queries/user/userQueries';

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

  const handleAddToCart = () => {
    addToCart({
      id: productDetails.id,
      updateStatus: 'add',
    });
  };
  const handleBuyNow = () => {
    const message = `Hi! I'm interested in ${productDetails.name}, priced at ${productDetails.actualPrice}. Can you tell me more?`;
    const url =
      'whatsapp://send?text=' +
      encodeURIComponent(message) +
      '&phone=' +
      productDetails.store.phoneNumber;
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
        isDisabled={isAlreadyAddedToCart}
        isLoading={isAddToCartLoader}
      />
      <TKButton
        title={strings('button.buyNow')}
        type={'primary'}
        style={styles.button}
        onPress={handleBuyNow}
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
