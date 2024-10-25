// reducer.js
import { REQUEST, SUCCESS, FAILURE } from '../actions/withdrawalActions';

const initialState = {
    loading: false,
    data: null,
    error: null,
};

const withdrawalReducers = (state = initialState, action) => {
    switch (action.type) {
        case REQUEST:
            return { ...state, loading: true, error: null };
        case SUCCESS:
            return { ...state, loading: false, data: action.payload };
        case FAILURE:
            return { ...state, loading: false, error: action.payload };
        default:
            return state;
    }
};

export default withdrawalReducers;
