import {createSlice} from '@reduxjs/toolkit';
import {store} from './store';

interface ISplashState {
  isHideSplashScreen: boolean;
  isServerDown: boolean;
}

const initialState: ISplashState = {
  isHideSplashScreen: false,
  isServerDown: false,
};

const systemSlice = createSlice({
  name: 'system',
  initialState,
  reducers: {
    setSplashScreen(state, action) {
      state.isHideSplashScreen = action.payload;
    },
    setServerDown(state, action) {
      state.isServerDown = action.payload;
    },
  },
});

export const {setSplashScreen, setServerDown} = systemSlice.actions;
export default systemSlice.reducer;

export const updateSplashScreenStatus = (data: boolean) => {
  store.dispatch(setSplashScreen(data));
};

export const updateServerStatus = (data: boolean) => {
  store.dispatch(setServerDown(data));
};
