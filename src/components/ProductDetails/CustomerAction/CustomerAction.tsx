import {StyleSheet} from 'react-native';
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
      <TKButton title={strings('button.buyNow')} type={'primary'} style={styles.button} />
    </>
  );
};

export default CustomerAction;

const styles = StyleSheet.create({
  button: {
    width: '45%',
  },
});
