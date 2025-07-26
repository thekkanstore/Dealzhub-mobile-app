import {createSlice} from '@reduxjs/toolkit';
import {store} from './store';
import {User} from '@react-native-google-signin/google-signin';

export type IFeatures = string | null;
interface IFeatureInitialState {
  user: User | null;
}

const initialState: IFeatureInitialState = {
  user: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUserInfo(state, action) {
      state.user = action.payload;
    },
  },
});

export const {setUserInfo} = userSlice.actions;
export default userSlice.reducer;

export const updateUserInfo = (data: User | null) => {
  store.dispatch(setUserInfo(data));
};
