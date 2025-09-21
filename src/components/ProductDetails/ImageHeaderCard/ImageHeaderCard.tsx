import {Pressable, StyleSheet, View} from 'react-native';
import React from 'react';
import {IProduct} from '../../../config/models/product';
import FastImage from 'react-native-fast-image';
import {moderateScale} from '../../../config/styles/responsiveSize';
import {TKArrowIcon} from '../../Common/Icons/TKArrowIcon';
import {colors} from '../../../config/styles/colors';
import {VendorScreenNavigationProp} from '../../../navigation/rootparamstypes';

interface Props {
  productDetails: IProduct;
  navigation: VendorScreenNavigationProp;
}
const ImageHeaderCard: React.FC<Props> = ({productDetails, navigation}) => {
  const handleBackPress = () => {
    navigation.goBack();
  };
  return (
    <View>
      <FastImage
        style={styles.productImage}
        source={{uri: productDetails.image ?? '', priority: FastImage.priority.normal}}
        resizeMode={FastImage.resizeMode.cover}
      />
      <View style={styles.buttonContainer}>
        <Pressable onPress={handleBackPress} style={styles.backButton}>
          <TKArrowIcon width={16} height={16} color={colors.primaryTextColor} direction="left" />
        </Pressable>
      </View>
    </View>
  );
};

export default ImageHeaderCard;

const styles = StyleSheet.create({
  productImage: {
    width: '100%',
    height: moderateScale(275),
  },
  backButton: {
    padding: moderateScale(10),
    marginRight: 8,
    backgroundColor: colors.tertiaryButtonBackgroundColor,
    borderRadius: moderateScale(20),
  },
  buttonContainer: {
    position: 'absolute',
    top: moderateScale(20),
    left: moderateScale(20),
    flexDirection: 'row',
    alignItems: 'center',
  },
});
