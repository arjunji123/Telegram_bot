import { combineReducers } from 'redux';
import homeReducer from './homeReducer';
import withdrawalReducers from './withdrawalReducers';
import coinReducer from './coinReducer';
import userReducer from './userReducer';

const rootReducer = combineReducers({
  apiData: homeReducer,
  moneyData: withdrawalReducers,
  coinData: coinReducer,
  user: userReducer,
});

export default rootReducer;