import {StyleSheet, TouchableOpacity, View} from 'react-native';
import React, {useState} from 'react';
import TKButton from '../../Common/TKButton/TKButton';
import {strings} from '../../../utils/language/langauageUtils';
import {IProduct} from '../../../config/models/product';
import {VendorScreenNavigationProp} from '../../../navigation/rootparamstypes';
import {navigationStrings} from '../../../navigation/navigationStrings';
import TKConfirmModal from '../../Common/TKConfirmModal/TKConfirmModal';
import {
  useUpdateProductStatus,
  useDeleteProduct,
} from '../../../react-queries/product/productQueries';
import {TKTrashIcon} from '../../Common/Icons/TKTrashIcon';
import {colors} from '../../../config/styles/colors';
import {moderateScale} from '../../../config/styles/responsiveSize';

interface Props {
  productDetails: IProduct;
  navigation: VendorScreenNavigationProp;
}
const VendorAction: React.FC<Props> = ({productDetails, navigation}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isDeleteVisible, setIsDeleteVisible] = useState(false);
  const {mutate: updateStatus, isPending} = useUpdateProductStatus();
  const {mutate: deleteProduct, isPending: isDeletePending} = useDeleteProduct();
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
  const handleDeleteConfirm = () => {
    deleteProduct(
      {id: productDetails.id},
      {
        onSuccess: () => {
          setIsDeleteVisible(false);
          navigation.goBack();
        },
      },
    );
  };
  const handleDeleteCancel = () => {
    setIsDeleteVisible(false);
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
      <TouchableOpacity
        style={styles.deleteButtonContainer}
        onPress={() => setIsDeleteVisible(true)}>
        <TKTrashIcon
          width={moderateScale(20)}
          height={moderateScale(20)}
          color={colors.errorTextColor}
        />
      </TouchableOpacity>
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
      <TKConfirmModal
        isVisible={isDeleteVisible}
        title={strings('labels.areYouSure')}
        bodyText={strings('labels.deleteProduct')}
        confirmButtonText={strings('button.delete')}
        cancelButtonText={strings('button.cancel')}
        confirmButtonAction={handleDeleteConfirm}
        cancelButtonAction={handleDeleteCancel}
        isConfirmLoader={isDeletePending}
      />
    </>
  );
};

export default VendorAction;

const styles = StyleSheet.create({
  button: {
    width: '38%',
  },
  deleteButtonContainer: {
    width: '18%',
    height: moderateScale(39),
    backgroundColor: 'rgba(189, 52, 59, 0.1)', // Light red background for dustbin
    borderRadius: moderateScale(24),
    justifyContent: 'center',
    alignItems: 'center',
  },
});
