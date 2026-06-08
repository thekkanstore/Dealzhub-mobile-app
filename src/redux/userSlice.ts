import {createSlice} from '@reduxjs/toolkit';
import {store} from './store';
import {User} from '@react-native-google-signin/google-signin';

export type IFeatures = string | null;
interface IFeatureInitialState {
  user: User | null;
  isNewUser: boolean;
}

const initialState: IFeatureInitialState = {
  user: null,
  isNewUser: false,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUserInfo(state, action) {
      state.user = action.payload;
    },
    setNewUser(state, action) {
      state.isNewUser = action.payload;
    },
  },
});

export const {setUserInfo, setNewUser} = userSlice.actions;
export default userSlice.reducer;

export const updateUserInfo = (data: User | null) => {
  store.dispatch(setUserInfo(data));
};
export const updateNewUserStatus = (data: boolean) => {
  store.dispatch(setNewUser(data));
};
