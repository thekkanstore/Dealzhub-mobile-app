import {StyleSheet} from 'react-native';
import React, {useState} from 'react';
import TKButton from '../../Common/TKButton/TKButton';
import {strings} from '../../../utils/language/langauageUtils';
import {IProduct} from '../../../config/models/product';
import {VendorScreenNavigationProp} from '../../../navigation/rootparamstypes';
import {navigationStrings} from '../../../navigation/navigationStrings';
import TKConfirmModal from '../../Common/TKConfirmModal/TKConfirmModal';
import {useUpdateProductStatus} from '../../../react-queries/product/productQueries';

interface Props {
  productDetails: IProduct;
  navigation: VendorScreenNavigationProp;
}
const VendorAction: React.FC<Props> = ({productDetails, navigation}) => {
  const [isVisible, setIsVisible] = useState(false);
  const {mutate: updateStatus, isPending} = useUpdateProductStatus();
  const handleOnPressEdit = () => {
    navigation.navigate(navigationStrings.PRODUCT_UPDATE, {
      productDetails,
      isUpdate: true,
    });
  };
  const handleConfirm = () => {
    updateStatus(
      {
        id: productDetails.id,
        isActive: !productDetails.isActive,
      },
      {
        onSuccess: () => {
          setIsVisible(false);
        },
      },
    );
  };
  const handleCancel = () => {
    setIsVisible(false);
  };
  return (
    <>
      <TKButton
        title={strings('button.edit')}
        type={'primary'}
        style={styles.button}
        onPress={handleOnPressEdit}
      />
      <TKButton
        title={productDetails?.isActive ? strings('button.disable') : strings('button.enable')}
        type={'secondary'}
        style={styles.button}
        onPress={() => setIsVisible(true)}
      />
      <TKConfirmModal
        isVisible={isVisible}
        title={strings('labels.areYouSure')}
        bodyText={
          productDetails?.isActive
            ? strings('labels.disableProduct')
            : strings('labels.enableProduct')
        }
        confirmButtonText={strings('button.confirm')}
        cancelButtonText={strings('button.cancel')}
        confirmButtonAction={handleConfirm}
        cancelButtonAction={handleCancel}
        isConfirmLoader={isPending}
      />
    </>
  );
};

export default VendorAction;

const styles = StyleSheet.create({
  button: {
    width: '45%',
  },
});
