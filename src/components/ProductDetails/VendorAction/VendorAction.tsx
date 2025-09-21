import {StyleSheet} from 'react-native';
import React from 'react';
import TKButton from '../../Common/TKButton/TKButton';
import {strings} from '../../../utils/language/langauageUtils';
import {IProduct} from '../../../config/models/product';
import {VendorScreenNavigationProp} from '../../../navigation/rootparamstypes';
import {navigationStrings} from '../../../navigation/navigationStrings';

interface Props {
  productDetails: IProduct;
  navigation: VendorScreenNavigationProp;
}
const VendorAction: React.FC<Props> = ({productDetails, navigation}) => {
  const handleOnPressEdit = () => {
    navigation.navigate(navigationStrings.PRODUCT_UPDATE, {
      productDetails,
      isUpdate: true,
    });
  };
  return (
    <>
      <TKButton
        title={strings('button.edit')}
        type={'primary'}
        style={styles.button}
        onPress={handleOnPressEdit}
      />
      <TKButton title={strings('button.disable')} type={'secondary'} style={styles.button} />
    </>
  );
};

export default VendorAction;

const styles = StyleSheet.create({
  button: {
    width: '45%',
  },
});
