import {combineReducers} from '@reduxjs/toolkit';
import systemReducer from './systemSlice';
import userReducer from './userSlice';
import productReducer from './productSlice';

const rootReducer = combineReducers({
  product: productReducer,
  system: systemReducer,
  user: userReducer,
});

export default rootReducer;
