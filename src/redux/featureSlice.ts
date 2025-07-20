import {createSlice} from '@reduxjs/toolkit';
import {store} from './store';

export type IFeatures = string | null;
interface IFeatureInitialState {
  featureFlag: IFeatures | null;
}

const initialState: IFeatureInitialState = {
  featureFlag: null,
};

const leaseListingSlice = createSlice({
  name: 'feature',
  initialState,
  reducers: {
    setFeature(state, action) {
      state.featureFlag = action.payload;
    },
  },
});

export const {setFeature} = leaseListingSlice.actions;
export default leaseListingSlice.reducer;

export const updateFeature = (data: IFeatures) => {
  store.dispatch(setFeature(data));
};
