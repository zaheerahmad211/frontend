import React, { useState } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL;
import { FaBox, FaTruck, FaCheckCircle, FaClipboardList, FaSearch, FaPaperPlane } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";

const TrackOrder = () => {
    const { user } = useAuth();
    const [orderId, setOrderId] = useState("");
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [feedback, setFeedback] = useState("");
    const [feedbackLoading, setFeedbackLoading] = useState(false);
    const [feedbackSuccess, setFeedbackSuccess] = useState(false);

    const handleTrack = async (e) => {
        e.preventDefault();
        if (!orderId) return;

        setLoading(true);
        setError("");
        setOrder(null);
        setFeedbackSuccess(false);

        if (!user) {
            setError("Please login to track your order.");
            setLoading(false);
            return;
        }

        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.get(`${API}/api/orders/${orderId.trim()}`, config);
            setOrder(data);
        } catch (err) {
            if (err.response?.status === 401) {
                setError("Please login to track your order.");
            } else if (err.response?.status === 403) {
                setError("You did not place this order. Only the owner can track it.");
            } else {
                setError("Order not found. Please check your Order ID.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleFeedbackSubmit = async (e) => {
        e.preventDefault();
        if (!feedback) return;

        setFeedbackLoading(true);
        try {
            // 1. Always send feedback to Admin (recipient: null)
            const adminMessage = {
                name: user ? user.name : "Buyer",
                email: user ? user.email : "anonymous@example.com",
                message: `Order Feedback (${orderId}): ${feedback}`,
                user: user ? user._id : null,
                recipient: null
            };
            await axios.post(`${API}/api/messages`, adminMessage);

            // 2. Find unique sellers in the order and also send to them
            const sellerIds = [...new Set(order.items.map(item => item.seller).filter(id => id))];
            
            if (sellerIds.length > 0) {
                await Promise.all(sellerIds.map(sellerId => 
                    axios.post(`${API}/api/messages`, {
                        ...adminMessage,
                        recipient: sellerId
                    })
                ));
            }
            
            setFeedbackSuccess(true);
            setFeedback("");
        } catch (err) {
            console.error("Failed to send feedback", err);
            alert("Failed to send feedback. Please try again.");
        } finally {
            setFeedbackLoading(false);
        }
    };

    const getStatusStep = (status) => {
        switch (status) {
            case "Pending": return 1;
            case "Approved": return 2;
            case "Processing": return 3;
            case "Shipped": return 4;
            case "Delivered": return 5;
            case "Cancelled": return 0;
            default: return 1;
        }
    };

    const steps = [
        { label: "Pending", icon: FaClipboardList },
        { label: "Approved", icon: FaCheckCircle },
        { label: "Processing", icon: FaBox },
        { label: "Shipped", icon: FaTruck },
        { label: "Delivered", icon: FaCheckCircle },
    ];

    const currentStep = order ? getStatusStep(order.status) : 0;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-extrabold text-blue-600 dark:text-blue-400 mb-2">Track Your Order</h1>
                    <p className="text-gray-600 dark:text-gray-400">Enter your order ID to get real-time status updates.</p>
                </div>

                {/* Search Box */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8 transform transition-all hover:shadow-xl">
                    <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-grow">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FaSearch className="text-gray-400" />
                            </div>
                            <input
                                type="text"
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 transition-colors"
                                placeholder="Enter Order ID (e.g., 64a...)"
                                value={orderId}
                                onChange={(e) => setOrderId(e.target.value)}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg shadow-md transition-transform transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Tracking..." : "Track"}
                        </button>
                    </form>
                    {error && <p className="mt-4 text-red-500 text-center font-medium bg-red-100 dark:bg-red-900/30 py-2 rounded">{error}</p>}
                </div>

                {/* Order Details */}
                {order && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700 animate-fade-in-up">
                        {/* Header */}
                        <div className="bg-blue-600 dark:bg-blue-800 p-6 flex justify-between items-center text-white">
                            <div>
                                <p className="text-sm opacity-80">Order ID</p>
                                <p className="font-mono font-bold text-lg">{order._id}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm opacity-80">Total Amount</p>
                                <p className="font-bold text-2xl">${order.totalAmount}</p>
                            </div>
                        </div>

                        <div className="p-8">
                            {/* Progress Bar */}
                            {order.status !== 'Cancelled' ? (
                                <div className="mb-12 relative">
                                    <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200 dark:bg-gray-700">
                                        <div
                                            style={{ width: `${(currentStep / steps.length) * 100}%` }}
                                            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500 transition-all duration-1000 ease-out"
                                        ></div>
                                    </div>
                                    <div className="flex justify-between relative">
                                        {steps.map((step, index) => {
                                            const StepIcon = step.icon;
                                            const isActive = index + 1 <= currentStep;
                                            return (
                                                <div key={index} className="flex flex-col items-center w-10">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 transition-colors duration-300 ${isActive ? 'bg-blue-600 text-white shadow-lg scale-110' : 'bg-gray-200 dark:bg-gray-700 text-gray-400'}`}>
                                                        <StepIcon size={14} />
                                                    </div>
                                                    <div className={`text-xs mt-2 font-medium ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}`}>{step.label}</div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            ) : (
                                <div className="mb-8 p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg text-center font-bold">
                                    This order has been cancelled.
                                </div>
                            )}

                            {/* Items List */}
                            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 border-b dark:border-gray-700 pb-2">Order Items</h3>
                            <div className="space-y-4">
                                {order.items.map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                                        <div className="flex items-center space-x-4">
                                            <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-md shadow-sm" />
                                            <div>
                                                <p className="font-semibold text-gray-800 dark:text-white text-lg">{item.name}</p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">Qty: {item.qty} × ${item.price}</p>
                                            </div>
                                        </div>
                                        <p className="font-bold text-gray-800 dark:text-white">${(item.qty * item.price).toFixed(2)}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-8 pt-6 border-t dark:border-gray-700 grid grid-cols-1 md:grid-cols-2 gap-8 text-sm text-gray-600 dark:text-gray-400">
                                <div>
                                    <h4 className="font-bold text-gray-900 dark:text-white mb-2">Shipping Address</h4>
                                    <p>{order.shippingAddress.address}</p>
                                    <p>{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
                                    <p>{order.shippingAddress.country}</p>
                                </div>
                                <div className="md:text-right">
                                    <h4 className="font-bold text-gray-900 dark:text-white mb-2">Order Info</h4>
                                    <p>Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                                    <p>Status: <span className={`font-semibold ${order.status === 'Cancelled' ? 'text-red-500' : 'text-green-500'}`}>{order.status}</span></p>
                                </div>
                            </div>

                            {/* Feedback Section for Delivered Orders */}
                            {order.status === "Delivered" && (
                                <div className="mt-12 pt-8 border-t-2 border-dashed dark:border-gray-700">
                                    <div className="bg-blue-50 dark:bg-gray-700/30 rounded-2xl p-6 md:p-8">
                                        {feedbackSuccess ? (
                                            <div className="text-center animate-fade-in">
                                                <FaCheckCircle className="text-green-500 mx-auto mb-4" size={48} />
                                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Thank You!</h3>
                                                <p className="text-gray-600 dark:text-gray-400">Your feedback has been successfully submitted.</p>
                                            </div>
                                        ) : (
                                            <div>
                                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">How was your experience?</h3>
                                                <p className="text-gray-600 dark:text-gray-400 mb-6">Since your order has been delivered, we'd love to hear your thoughts or any message you have for us.</p>
                                                <form onSubmit={handleFeedbackSubmit}>
                                                    <textarea
                                                        className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-inner"
                                                        rows="4"
                                                        placeholder="Write your feedback or message here..."
                                                        value={feedback}
                                                        onChange={(e) => setFeedback(e.target.value)}
                                                        required
                                                    ></textarea>
                                                    <div className="mt-4 flex justify-end">
                                                        <button
                                                            type="submit"
                                                            disabled={feedbackLoading || !feedback}
                                                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl flex items-center gap-2 shadow-lg transition-all transform active:scale-95 disabled:opacity-50"
                                                        >
                                                            {feedbackLoading ? (
                                                                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                                                            ) : (
                                                                <>
                                                                    <FaPaperPlane />
                                                                    <span>Submit Feedback</span>
                                                                </>
                                                            )}
                                                        </button>
                                                    </div>
                                                </form>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TrackOrder;

