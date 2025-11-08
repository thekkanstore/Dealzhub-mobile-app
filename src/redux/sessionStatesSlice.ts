import {createSlice} from '@reduxjs/toolkit';
import {store} from './store';
import {IAdmin} from '../config/models/admin';

interface ISessionStatesState {
  selectedLocation: string;
  appConfig: IAdmin | null;
}

const initialState: ISessionStatesState = {
  selectedLocation: '',
  appConfig: null,
};

const sessionStatesSlice = createSlice({
  name: 'sessionStates',
  initialState,
  reducers: {
    setSelectedLocation(state, action) {
      state.selectedLocation = action.payload;
    },
    setAppConfig(state, action) {
      state.appConfig = action.payload;
    },
  },
});

export const {setSelectedLocation, setAppConfig} = sessionStatesSlice.actions;
export default sessionStatesSlice.reducer;

export const updateSelectedLocation = (data: string) => {
  store.dispatch(setSelectedLocation(data));
};
export const updateAppConfig = (data: IAdmin | null) => {
  store.dispatch(setAppConfig(data));
};
