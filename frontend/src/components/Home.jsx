import React, { useState, useEffect } from "react";
import "../Styles/Tasks.css";
// import { dollarCoin, mainCharacter } from '../images'; // Ensure correct image paths
import { BsPersonCircle } from "react-icons/bs";
import Logo from "../utils/Logo";
import Footer from "./Footer";
import { useDispatch, useSelector } from 'react-redux';
import { fetchAPIData } from '../../store/actions/homeActions';

function Home() {
  const [firstName, setFirstName] = useState("");
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const dispatch = useDispatch();
  const apiMe = useSelector((state) => state.apiData.data.apime);
  console.log('apiMe', apiMe)
  useEffect(() => {
    dispatch(fetchAPIData('apiMe'));
  }, [dispatch]);

  useEffect(() => {
    // Initialize Telegram WebApp if available
    const tg = window.Telegram?.WebApp;
    if (tg) {
      const firstName = tg.initDataUnsafe?.user?.first_name;
      setFirstName(firstName);
    }
  }, []);

  // Function to get the token from localStorage and check expiration
  const getToken = () => {
    const storedData = localStorage.getItem('user'); // Retrieve the stored string
    if (storedData) {
      const parsedData = JSON.parse(storedData); // Parse the string into an object
      const token = parsedData.token; // Access the token field

      // Decode the token and check if it's expired
      const tokenPayload = JSON.parse(atob(token.split('.')[1])); // Decode the payload
      const currentTime = Math.floor(Date.now() / 1000); // Get current time in seconds

      if (tokenPayload.exp && tokenPayload.exp > currentTime) {
        return token; // Token is valid
      } else {
        console.error('Token has expired.');
        return null; // Token is expired
      }
    }
    return null; // Return null if no token found
  };

  // Function to fetch data from the API using fetch
  const fetchData = async () => {
    const token = getToken();

    if (!token) {
      setError('No valid token found or token has expired.');
      return;
    }

    try {
      const response = await fetch('http://localhost:4000/api/v1/api-me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`, // Add the token in headers
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`); // Throw an error if response is not ok
      }

      const result = await response.json();
      setData(result); // Set the response data to state
    } catch (err) {
      setError(err.message); // Catch and set error message
    }
  };

  // Fetch the data when the component mounts
  useEffect(() => {
    fetchData();
  }, []); // Empty dependency array to ensure it runs once on mount

  

  return (
    <div className="bg-white flex justify-center">
      <div className="w-full bg-black text-white min-h-screen flex flex-col max-w-lg">
        <div className="flex-grow relative z-0">
          <div className="px-4 py-6 space-y-6">

            {/* Logo */}
            <Logo />

            {/* User Information */}
            <div className="flex justify-center space-x-1">
              <BsPersonCircle size={24} className="mt-1" />
              <p className="text-2xl font-extrabold">Neeraj Singh</p>
            </div>

            {/* User Balance */}
            <div className="flex justify-center space-x-1 text-4xl font-extrabold font-sans">
              <p>U</p>
              <p>700,0000</p>
            </div>

            {/* Profile Picture */}
            <div className="px-4 my-6 cursor-pointer flex justify-center">
              <img
                src="https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcSPzFN--8Y1W-1Yg9anA4ZXy-W18bIfJ-4RNZ8QWi6wPeGJUUoE"
                alt="Main Character"
                className="rounded-full w-56 h-56 object-cover"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <Footer />
      </div>
    </div>

  );
}

export default Home;
