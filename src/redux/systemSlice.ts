import {createSlice} from '@reduxjs/toolkit';
import {store} from './store';

interface ISplashState {
  isShownGettingStarted: boolean;
}

const initialState: ISplashState = {
  isShownGettingStarted: false,
};

const systemSlice = createSlice({
  name: 'system',
  initialState,
  reducers: {
    setGettingStarted(state, action) {
      state.isShownGettingStarted = action.payload;
    },
  },
});

export const {setGettingStarted} = systemSlice.actions;
export default systemSlice.reducer;

export const updateGettingStarted = (data: boolean) => {
  store.dispatch(setGettingStarted(data));
};
