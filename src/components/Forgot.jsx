import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AiOutlineMail } from 'react-icons/ai'; // Email icon
import { Link , useNavigate} from 'react-router-dom'; // Import Link for navigation
 import { resetPassword} from '../../store/actions/authActions';
 import { useDispatch, useSelector } from 'react-redux';

const Forgot = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const dispatch = useDispatch();
    const { loading, message, error } = useSelector((state) => state.auth);


    const handleSubmit = (e) => {
        e.preventDefault();
        dispatch(resetPassword(email)); // Dispatch the action
    };

        // useEffect to monitor changes in message or error
        useEffect(() => {
            if (error) {
                toast.error(error); // Show error toast
            }
            if (message) {
                toast.success(message); // Show success toast
                setTimeout(() => {
                    navigate('/login'); // Navigate to login page after toast
                }, 2000); // Delay navigation to let user see the toast
            }
        }, [error, message, navigate]);

    return (
        <div className="bg-black flex justify-center items-center min-h-screen p-4">
             <ToastContainer
        position="top-right"
        autoClose={500}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
        theme="dark"
      />
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

                {error  && <p className="mt-4 text-center text-red-500 text-sm">{error }</p>}
                <div className="mt-6 text-center">
                    <Link to="/login" className="text-white hover:underline text-sm">
                        Return to Login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Forgot;