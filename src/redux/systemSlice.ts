import {createSlice} from '@reduxjs/toolkit';
import {store} from './store';

interface ISplashState {
  isHideSplashScreen: boolean;
  isServerDown: boolean;
  isShownGettingStarted: boolean;
}

const initialState: ISplashState = {
  isHideSplashScreen: false,
  isServerDown: false,
  isShownGettingStarted: false,
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
    setGettingStarted(state, action) {
      state.isShownGettingStarted = action.payload;
    },
  },
});

export const {setSplashScreen, setServerDown, setGettingStarted} = systemSlice.actions;
export default systemSlice.reducer;

export const updateSplashScreenStatus = (data: boolean) => {
  store.dispatch(setSplashScreen(data));
};

export const updateServerStatus = (data: boolean) => {
  store.dispatch(setServerDown(data));
};

export const updateGettingStarted = (data: boolean) => {
  store.dispatch(setGettingStarted(data));
};
