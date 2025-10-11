import {BackHandler, Pressable, StyleSheet, View} from 'react-native';
import React, {useEffect} from 'react';
import {IProductTable} from '../../../config/models/product';
import FastImage from 'react-native-fast-image';
import {moderateScale} from '../../../config/styles/responsiveSize';
import {TKArrowIcon} from '../../Common/Icons/TKArrowIcon';
import {colors} from '../../../config/styles/colors';
import {VendorScreenNavigationProp} from '../../../navigation/rootparamstypes';
import Favorite from '../Favorite/Favourite';
import {useGetUserDetails} from '../../../react-queries/user/userQueries';
import TKRenderIf from '../../Common/TKRenderIf/TKRenderIf';

interface Props {
  productDetails: IProductTable;
  navigation: VendorScreenNavigationProp;
  isStackChange?: boolean;
  isVendor?: boolean;
}
const ImageHeaderCard: React.FC<Props> = ({
  productDetails,
  navigation,
  isStackChange,
  isVendor,
}) => {
  const handleBackPress = () => {
    if (isStackChange) {
      navigation.popToTop();
    }
    navigation.goBack();
  };
  const {data: userDetails} = useGetUserDetails(true);
  const isFavorites = !!userDetails?.favorites?.includes(productDetails.id);

  useEffect(() => {
    const backAction = () => {
      handleBackPress();
      return true; // Prevent default behavior
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove(); // Clean up on unmount
  }, []);

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
        <TKRenderIf isRender={!isVendor}>
          <Favorite
            containerStyle={styles.backButton}
            productId={productDetails.id}
            isFavorite={isFavorites}
          />
        </TKRenderIf>
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
    backgroundColor: colors.tertiaryButtonBackgroundColor,
    borderRadius: moderateScale(20),
  },
  buttonContainer: {
    position: 'absolute',
    top: moderateScale(20),
    paddingHorizontal: moderateScale(16),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
});
