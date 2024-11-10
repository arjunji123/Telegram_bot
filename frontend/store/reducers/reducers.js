import { combineReducers } from 'redux';
import homeReducer from './homeReducer';
import withdrawalReducers from './withdrawalReducers';
import coinReducer from './coinReducer';

const rootReducer = combineReducers({
  apiData: homeReducer,
  moneyData: withdrawalReducers,
  coinData: coinReducer
});

export default rootReducer;