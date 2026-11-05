import {createSlice} from '@reduxjs/toolkit';
import {store} from './store';
import {User} from '@react-native-google-signin/google-signin';

export type IFeatures = string | null;
export type RegistrationRoute = 'UserDetails' | 'ChooseUserType';

interface IFeatureInitialState {
  user: User | null;
  isNewUser: boolean;
  isGuest: boolean;
  initialRegistrationRoute: RegistrationRoute;
}

const initialState: IFeatureInitialState = {
  user: null,
  isNewUser: false,
  isGuest: false,
  initialRegistrationRoute: 'UserDetails',
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
    setGuestStatus(state, action) {
      state.isGuest = action.payload;
    },
    setInitialRegistrationRoute(state, action) {
      state.initialRegistrationRoute = action.payload;
    },
  },
});

export const {setUserInfo, setNewUser, setGuestStatus, setInitialRegistrationRoute} = userSlice.actions;
export default userSlice.reducer;

export const updateUserInfo = (data: User | null) => {
  store.dispatch(setUserInfo(data));
};
export const updateNewUserStatus = (data: boolean) => {
  store.dispatch(setNewUser(data));
};
export const updateGuestStatus = (data: boolean) => {
  store.dispatch(setGuestStatus(data));
};
export const updateInitialRegistrationRoute = (data: RegistrationRoute) => {
  store.dispatch(setInitialRegistrationRoute(data));
};
