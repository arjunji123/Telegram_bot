import { fetcher } from '../fetcher';
import { BACKEND_URL } from '../../src/config';
import Cookies from 'js-cookie';

// Action types
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
export const LOGIN_FAILURE = 'LOGIN_FAILURE';
export const SIGNUP_SUCCESS = 'SIGNUP_SUCCESS';
export const SIGNUP_FAILURE = 'SIGNUP_FAILURE';
export const LOGOUT = 'LOGOUT';
export const LOAD_USER = 'LOAD_USER';

export const PASSWORD_RESET_REQUEST = 'PASSWORD_RESET_REQUEST';
export const PASSWORD_RESET_SUCCESS = 'PASSWORD_RESET_SUCCESS';
export const PASSWORD_RESET_FAILURE = 'PASSWORD_RESET_FAILURE';

// Set token in cookies (expires in 7 days)
const setToken = (token) => {
  Cookies.set('token', JSON.stringify(token), { expires: 7 });
};


// Get token from cookies
const getToken = () => {
  return Cookies.get('token');
};


// Remove token from cookies
const removeToken = () => {
  Cookies.remove('token');
};



// Centralized function to store user data in localStorage
export const storeUserData = (user) => {
  localStorage.setItem('user', JSON.stringify(user));
};

// Centralized function to retrieve user data from localStorage
const getUserDataFromLocalStorage = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

// Login action
export const login = (credentials) => async (dispatch) => {
  try {
    // Make the API request to the backend
    const response = await fetcher.post(`${BACKEND_URL}/api/v1/api-login`, credentials);

    // If successful and token received, proceed as usual
    if (response?.token) {
      setToken(response.token); // Store the token in cookies or localStorage
      const userData = { token: response.token, ...response };
      storeUserData(userData); // Save user data in localStorage
      dispatch({
        type: LOGIN_SUCCESS,
        payload: userData,
      });
    } else {
      // Handle case where token is not returned, throw an error with the message
      throw new Error(response?.error || "Token not received from the server.");
    }
  } catch (error) {
    // Check if the error message is an object or a string
    let errorMessage = "An unknown error occurred."; // Default error message

    // If the error is an object (from backend response), access the error message
    if (error?.message && error.message.includes("Invalid mobile number or password")) {
      // Error message is in the string, so we extract it
      errorMessage = JSON.parse(error.message)?.error || error.message;
    } 
    else if (error?.message && error.message.includes("Your account is deactivated. Please contact support.")) {
       // Error message is in the string, so we extract it
       errorMessage = JSON.parse(error.message)?.error || error.message;
    }
    else if (error?.message) {
      errorMessage = error.message; // Use the error message from the catch block
    }

    // Log the error for debugging
    console.error("Login failed:", errorMessage);

    // Dispatch the error message to Redux store
    dispatch({
      type: LOGIN_FAILURE,
      payload: errorMessage, // Send only the error message to the store
    });

    // Throw only the error message for handling in the component
    throw new Error(errorMessage); // Pass only the error message to the component
  }
};


// Signup action
export const signUp = (credentials) => async (dispatch) => {
  try {
    const response = await fetcher.post(`${BACKEND_URL}/api/v1/api-register`, credentials);

    console.log('API response:', response); // Log API response

    if (response?.token) {
      setToken(response.token); // Store the token in cookies
      const userData = { token: response.token, ...response };
      storeUserData(userData); // Save user data in localStorage

      dispatch({
        type: SIGNUP_SUCCESS,
        payload: userData,
      });
    } else {
      throw new Error('Token not received from the server.');
    }
  } catch (error) {
    console.error('Signup failed:', error.message); // Log error
    dispatch({
      type: SIGNUP_FAILURE,
      payload: error.message,
    });
    throw error; // Rethrow error for component handling
  }
};




export const resetPassword = (email) => async (dispatch) => {
    dispatch({ type: PASSWORD_RESET_REQUEST });

    try {
        const response = await fetch(`${BACKEND_URL}/api/v1/api-password/forgot`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email }),
        });

        const data = await response.json();

        if (response.ok) {
            dispatch({
                type: PASSWORD_RESET_SUCCESS,
                payload: data.message || 'Reset link sent successfully.',
            });
        } else {
            dispatch({
                type: PASSWORD_RESET_FAILURE,
                payload: data.message || 'Error sending reset link. Please try again.',
            });
        }
    } catch (error) {
        dispatch({
            type: PASSWORD_RESET_FAILURE,
            payload: error.message || 'Error sending reset link. Please try again.',
        });
    }
};

// Logout action
export const logout = () => (dispatch) => {
  localStorage.removeItem('user'); // Remove user data from localStorage
  removeToken(); // Remove the token from cookies
  dispatch({
    type: LOGOUT,
  });
};



// Load user from localStorage into the app state
export const loadUserFromLocalStorage = () => (dispatch) => {
  const user = getUserDataFromLocalStorage();

  if (user) {
    dispatch({
      type: LOAD_USER,
      payload: user,
    });
  } else {
    console.log('No user found in localStorage.');
  }
};
console.log('Token from cookies:', getToken());