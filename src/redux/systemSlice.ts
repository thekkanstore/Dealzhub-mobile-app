import {createSlice} from '@reduxjs/toolkit';
import {store} from './store';

interface ISplashState {
  isShownGettingStarted: boolean;
  isShowNotificationPermission: boolean;
}

const initialState: ISplashState = {
  isShownGettingStarted: false,
  isShowNotificationPermission: false,
};

const systemSlice = createSlice({
  name: 'system',
  initialState,
  reducers: {
    setGettingStarted(state, action) {
      state.isShownGettingStarted = action.payload;
    },
    setNotificationPermissionModalVisibility(state, action) {
      state.isShowNotificationPermission = action.payload;
    },
  },
});

export const {setGettingStarted, setNotificationPermissionModalVisibility} = systemSlice.actions;
export default systemSlice.reducer;

export const updateGettingStarted = (data: boolean) => {
  store.dispatch(setGettingStarted(data));
};

export const updateNotificationPermissionModalVisibility = (data: boolean) => {
  store.dispatch(setNotificationPermissionModalVisibility(data));
};
