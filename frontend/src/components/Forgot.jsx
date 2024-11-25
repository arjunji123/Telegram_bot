import React, { useState } from 'react';
import { BACKEND_URL } from '../config';
import { AiOutlineMail } from 'react-icons/ai'; // Email icon
import { Link } from 'react-router-dom'; // Import Link for navigation
 import { fetcherPost } from '../../store/fetcher'; // Adjust path based on your file structure

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetcherPost(`${BACKEND_URL}/api/forgotPassword`, { email });
            setMessage(response.message || 'Reset link sent successfully.');
        } catch (error) {
            setMessage(error.message || 'Error sending reset link. Please try again.');
        }
    };

    return (
        <div className="bg-black flex justify-center items-center min-h-screen p-4">
            <div className="w-full max-w-md bg-black text-white rounded-lg shadow-lg overflow-hidden border border-white p-6">
                <h2 className="text-2xl font-bold text-center mb-4">Forgot Password</h2>
                <p className="text-gray-400 text-center mb-6 text-sm">
                    Enter your email address to receive a password reset link.
                </p>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative">
                        <AiOutlineMail className="absolute left-3 top-3 text-gray-400" />
                        <input
                            type="email"
                            name="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-10 py-3 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-white placeholder-gray-500 transition duration-300 ease-in-out"
                            placeholder="Email Address"
                        />
                    </div>
                    <div className="flex justify-center">
                        <button
                            type="submit"
                            className="w-full py-3 text-lg font-bold text-black bg-white rounded-lg shadow-md transform transition duration-300 ease-in-out hover:scale-105 hover:bg-gray-200"
                        >
                            Send Reset Link
                        </button>
                    </div>
                </form>
                {message && <p className="mt-4 text-center text-red-500 text-sm">{message}</p>}
                <div className="mt-6 text-center">
                    <Link to="/login" className="text-white hover:underline text-sm">
                        Return to Login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;