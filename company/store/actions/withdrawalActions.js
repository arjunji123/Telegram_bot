import axios from 'axios';
import { BACKEND_URL } from '../../src/config';
import { toast } from "react-toastify";


export const UPLOAD_TRANSACTION_REQUEST = 'UPLOAD_TRANSACTION_REQUEST';
export const UPLOAD_TRANSACTION_SUCCESS = 'UPLOAD_TRANSACTION_SUCCESS';
export const UPLOAD_TRANSACTION_FAILURE = 'UPLOAD_TRANSACTION_FAILURE';



  export const uploadTransactionDoc = (transactionId, payImage) => async (dispatch) => {
    try {
      dispatch({ type: UPLOAD_TRANSACTION_REQUEST });
      // Get token from localStorage
      const tokenData = localStorage.getItem('user');
      if (!tokenData) {
        throw new Error('No token data found in localStorage');
      }
  
      const parsedTokenData = JSON.parse(tokenData);
      const token = parsedTokenData.token;
  
      if (!token) {
        throw new Error('Token not found');
      }
      // FormData to handle the file upload
      const formData = new FormData();
      formData.append('transaction_id', transactionId);
      formData.append('pay_image', payImage);
  
      const response = await axios.post(`${BACKEND_URL}/api/v1/upload-transaction-doc`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`, // Include token in the Authorization header
        },
      });
  
      dispatch({ type: UPLOAD_TRANSACTION_SUCCESS, payload: response.data });
      toast.success("Payment receipt upload successfully!");
    } catch (error) {
      dispatch({
        type: UPLOAD_TRANSACTION_FAILURE,
        payload: error.response ? error.response.data : error.message,
      });
      toast.error("Failed payment receipt upload !");
    }
  };