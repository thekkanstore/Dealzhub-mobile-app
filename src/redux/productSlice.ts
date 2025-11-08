import {createSlice} from '@reduxjs/toolkit';
import {store} from './store';

interface IProductSlice {
  isFromProductDetails: boolean;
}

const initialState: IProductSlice = {
  isFromProductDetails: false,
};

const leaseListingSlice = createSlice({
  name: 'product',
  initialState,
  reducers: {
    setIsFromProductDetails(state, action) {
      state.isFromProductDetails = action.payload;
    },
  },
});

export const {setIsFromProductDetails} = leaseListingSlice.actions;
export default leaseListingSlice.reducer;

export const updateIsFromProductDetails = (data: boolean) => {
  store.dispatch(setIsFromProductDetails(data));
};
