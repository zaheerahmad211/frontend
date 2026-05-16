import React from 'react';
import { Link } from 'react-router-dom';
import { FaTimes, FaLock } from 'react-icons/fa';

const AuthModal = ({ onClose }) => {
    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-8 relative transform transition-all scale-100 border border-gray-200 dark:border-gray-700">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors cursor-pointer"
                >
                    <FaTimes size={20} />
                </button>

                {/* Content */}
                <div className="text-center">
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-6">
                        <FaLock className="text-3xl text-blue-600 dark:text-blue-300" />
                    </div>

                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Login Required</h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-8">
                        Please login or register to proceed with your checkout.
                    </p>

                    <div className="space-y-4">
                        <Link
                            to="/login?redirect=checkout"
                            className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition duration-300 shadow-md hover:shadow-lg"
                        >
                            Login
                        </Link>
                        <Link
                            to="/register?redirect=checkout"
                            className="block w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-white font-bold py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 transition duration-300"
                        >
                            Create Account
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthModal;
