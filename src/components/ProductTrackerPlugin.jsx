import React, { useState } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL;
import { FaBox, FaTruck, FaCheckCircle, FaClipboardList, FaSearch, FaTimes, FaMapMarkerAlt, FaPaperPlane } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";

const ProductTrackerPlugin = () => {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
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
        <div className="fixed bottom-6 right-6 z-50">
            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`${
                    isOpen ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-600 hover:bg-blue-700'
                } text-white p-4 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-110 flex items-center justify-center`}
            >
                {isOpen ? <FaTimes size={24} /> : <FaMapMarkerAlt size={24} />}
                {!isOpen && <span className="ml-2 font-bold hidden md:inline">Track Order</span>}
            </button>

            {/* Plugin Panel */}
            {isOpen && (
                <div className="absolute bottom-20 right-0 w-80 md:w-96 bg-white dark:bg-gray-800 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-gray-100 dark:border-gray-700 overflow-hidden animate-fade-in-up">
                    <div className="bg-blue-600 p-4 text-white">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="font-bold text-lg">Quick Order Tracker</h3>
                                <p className="text-xs opacity-80">Track your delivery in real-time</p>
                            </div>
                            {order && order.status === "Delivered" && (
                                <div className="bg-white/20 p-2 rounded-lg animate-pulse">
                                    <FaCheckCircle size={20} />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="p-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
                        <form onSubmit={handleTrack} className="flex gap-2 mb-4">
                            <div className="relative flex-grow">
                                <input
                                    type="text"
                                    className="w-full pl-3 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                                    placeholder="Order ID..."
                                    value={orderId}
                                    onChange={(e) => setOrderId(e.target.value)}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors disabled:opacity-50"
                            >
                                <FaSearch size={16} />
                            </button>
                        </form>

                        {error && (
                            <p className="text-red-500 text-xs mb-4 text-center p-2 bg-red-50 dark:bg-red-900/20 rounded">{error}</p>
                        )}

                        {loading && (
                            <div className="flex justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
                            </div>
                        )}

                        {order && (
                            <div className="animate-fade-in">
                                <div className="flex justify-between items-center mb-4 pb-2 border-b dark:border-gray-700">
                                    <span className="text-xs font-mono text-gray-500 dark:text-gray-400">ID: {order._id.substring(0, 10)}...</span>
                                    <span className={`text-xs font-bold px-2 py-1 rounded ${
                                        order.status === 'Cancelled' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                                    }`}>
                                        {order.status}
                                    </span>
                                </div>

                                {order.status !== 'Cancelled' ? (
                                    <div className="space-y-4">
                                        <div className="relative flex justify-between px-2">
                                            {steps.map((step, index) => {
                                                const StepIcon = step.icon;
                                                const isActive = index + 1 <= currentStep;
                                                return (
                                                    <div key={index} className="flex flex-col items-center z-10">
                                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 ${
                                                            isActive ? 'bg-blue-600 text-white scale-110' : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                                                        }`}>
                                                            <StepIcon size={10} />
                                                        </div>
                                                        <span className={`text-[8px] mt-1 font-medium ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}`}>
                                                            {step.label}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                            {/* Progress line */}
                                            <div className="absolute top-3 left-6 right-6 h-0.5 bg-gray-200 dark:bg-gray-700 -z-0">
                                                <div 
                                                    className="h-full bg-blue-500 transition-all duration-1000"
                                                    style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                                                ></div>
                                            </div>
                                        </div>

                                        <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                                            <div className="flex justify-between text-xs mb-1">
                                                <span className="text-gray-500 dark:text-gray-400">Items:</span>
                                                <span className="font-bold text-gray-800 dark:text-white">{order.items.length}</span>
                                            </div>
                                            <div className="flex justify-between text-xs">
                                                <span className="text-gray-500 dark:text-gray-400">Total:</span>
                                                <span className="font-bold text-blue-600 dark:text-blue-400">${order.totalAmount}</span>
                                            </div>
                                        </div>

                                        {/* Feedback Section for Delivered Orders */}
                                        {order.status === "Delivered" && (
                                            <div className="mt-6 pt-4 border-t dark:border-gray-700 animate-fade-in-up">
                                                {feedbackSuccess ? (
                                                    <div className="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 p-4 rounded-xl text-center">
                                                        <FaCheckCircle className="mx-auto mb-2" size={24} />
                                                        <p className="text-sm font-bold">Feedback Sent!</p>
                                                        <p className="text-xs mt-1">Thank you for sharing your experience.</p>
                                                    </div>
                                                ) : (
                                                    <form onSubmit={handleFeedbackSubmit}>
                                                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">
                                                            Share your experience
                                                        </label>
                                                        <textarea
                                                            className="w-full p-3 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                                            rows="3"
                                                            placeholder="Write a message or feedback..."
                                                            value={feedback}
                                                            onChange={(e) => setFeedback(e.target.value)}
                                                            required
                                                        ></textarea>
                                                        <button
                                                            type="submit"
                                                            disabled={feedbackLoading || !feedback}
                                                            className="w-full mt-3 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                                                        >
                                                            {feedbackLoading ? (
                                                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                                            ) : (
                                                                <>
                                                                    <FaPaperPlane size={14} />
                                                                    <span>Send Feedback</span>
                                                                </>
                                                            )}
                                                        </button>
                                                    </form>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-center text-red-500 text-sm font-medium py-4">This order was cancelled.</p>
                                )}
                            </div>
                        )}
                        
                        {!order && !loading && !error && (
                            <div className="text-center py-8 opacity-40">
                                <FaBox size={40} className="mx-auto mb-2 text-gray-400" />
                                <p className="text-sm">Enter ID to track</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductTrackerPlugin;

