import React from 'react';
import {StyleProp, ViewStyle, Alert} from 'react-native';
import {TKHeartIcon} from '../../Common/Icons/TKHeartIcon';
import {useUpdateFavoritesList} from '../../../react-queries/user/userQueries';
import {colors} from '../../../config/styles/colors';
import {Pressable} from 'react-native-gesture-handler';
import {useAppSelector} from '../../../redux/hooks';
import {updateGuestStatus} from '../../../redux/userSlice';
import TKConfirmModal from '../../Common/TKConfirmModal/TKConfirmModal';
import {useState} from 'react';

interface Props {
  containerStyle?: StyleProp<ViewStyle>;
  productId: string;
  iconColor?: string;
  isFavorite: boolean;
}
const Favorite: React.FC<Props> = ({containerStyle, productId, isFavorite}) => {
  const {mutate: updateFavoriteStatus, isPending} = useUpdateFavoritesList();
  const isGuest = useAppSelector(state => state.user.isGuest);
  const [isLoginModalVisible, setIsLoginModalVisible] = useState(false);

  const handleOnPress = () => {
    if (isGuest) {
      setIsLoginModalVisible(true);
      return;
    }
    updateFavoriteStatus({id: productId, updateStatus: !isFavorite ? 'add' : 'remove'});
  };
  return (
    <>
      <Pressable
      style={[containerStyle]}
      onPress={handleOnPress}
      disabled={isPending}
      hitSlop={{top: 20, bottom: 20, left: 20, right: 20}}>
      <TKHeartIcon
        color={isFavorite ? colors.favoritesSelectedColor : colors.favoriteUnselectedColor}
      />
    </Pressable>
      <TKConfirmModal
        isVisible={isLoginModalVisible}
        title="Login Required"
        bodyText="Please login or register to add items to your wishlist."
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

export default Favorite;
