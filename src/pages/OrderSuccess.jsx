import React, { useEffect, useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaCopy, FaArrowRight } from 'react-icons/fa';

const OrderSuccess = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { order } = location.state || {};
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!order) {
            navigate('/');
        }
    }, [order, navigate]);

    if (!order) return null;

    const handleCopy = () => {
        navigator.clipboard.writeText(order._id);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4 transition-colors duration-200">
            <div className="max-w-lg w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 text-center border border-gray-100 dark:border-gray-700 animate-fade-in-up">
                <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-green-100 dark:bg-green-900/30 mb-6">
                    <FaCheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
                </div>

                <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">Order Placed!</h2>
                <p className="text-gray-500 dark:text-gray-400 mb-8">
                    Thank you for your purchase. Your order has been securely processed.
                </p>

                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 mb-8 border border-blue-100 dark:border-blue-800/30">
                    <p className="text-sm text-blue-600 dark:text-blue-300 font-semibold uppercase tracking-wider mb-2">Order ID</p>
                    <div className="flex items-center justify-center space-x-3">
                        <span className="text-2xl font-mono font-bold text-gray-800 dark:text-white tracking-widest selection:bg-blue-200 dark:selection:bg-blue-700">
                            {order._id}
                        </span>
                        <button
                            onClick={handleCopy}
                            className="p-2 rounded-full hover:bg-blue-100 dark:hover:bg-blue-800 transition text-blue-600 dark:text-blue-300"
                            title="Copy to clipboard"
                        >
                            {copied ? <FaCheckCircle size={18} /> : <FaCopy size={18} />}
                        </button>
                    </div>
                    {copied && <p className="text-xs text-green-600 dark:text-green-400 mt-2 font-medium">Copied to clipboard!</p>}
                </div>

                <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
                    Please save this Order ID to track your shipment status.
                </p>

                <div className="space-y-4">
                    <Link
                        to="/track-order"
                        className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                        Track Order Now
                    </Link>
                    <Link
                        to="/"
                        className="block w-full bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-white font-semibold py-3 px-4 rounded-xl border border-gray-200 dark:border-gray-600 transition-colors"
                    >
                        Continue Shopping
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default OrderSuccess;
