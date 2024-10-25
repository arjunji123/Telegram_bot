
import axios from 'axios';

// Action Types
export const REQUEST = 'REQUEST';
export const SUCCESS = 'SUCCESS';
export const FAILURE = 'FAILURE';

// Generic action creator for POST requests
const apiPost = (url, data) => {
    return async (dispatch) => {
        dispatch({ type: REQUEST });

        try {
            const response = await axios.post(url, data);
            dispatch({ type: SUCCESS, payload: response.data });
        } catch (error) {
            dispatch({ type: FAILURE, payload: error.message });
        }
    };
};

// Action creator for receiving money
export const receiveMoney = (id, toAddress, fromAddress, amount) => {
    return apiPost('/api/receive-money', { id, toAddress, fromAddress, amount });
};

// Another example API call
export const sendMoney = (id, toAddress, fromAddress, amount) => {
    return apiPost('/api/send-money', { id, toAddress, fromAddress, amount });
};

export const sellMoney = (user_id, company_id, sellData) => {
    return apiPost('/api/send-money', {    user_id,
        company_id,
        ...sellData, });
};
