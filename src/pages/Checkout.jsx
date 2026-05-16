import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL;

const Checkout = () => {
    const { cartItems, clearCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const [country, setCountry] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('Credit Card');
    const [transactionId, setTransactionId] = useState('');
    const [tidError, setTidError] = useState('');

    const paymentDetails = {
        'Easypaisa': {
            accountTitle: 'ShopMate Store',
            accountNumber: '0300-1234567',
            color: 'bg-green-50 border-green-200 text-green-800',
            validate: (tid) => /^\d{11}$/.test(tid) ? '' : 'Easypaisa TID must be exactly 11 digits.'
        },
        'JazzCash': {
            accountTitle: 'ShopMate Store',
            accountNumber: '0301-7654321',
            color: 'bg-red-50 border-red-200 text-red-800',
            validate: (tid) => /^\d{12}$/.test(tid) ? '' : 'JazzCash TID must be exactly 12 digits.'
        },
        'Nayapay': {
            accountTitle: 'ShopMate Store',
            accountNumber: '0321-9876543',
            color: 'bg-orange-50 border-orange-200 text-orange-800',
            validate: (tid) => /^\d{10,20}$/.test(tid) ? '' : 'Nayapay TID must be 10-20 digits.'
        },
        'PayPal': {
            accountTitle: 'ShopMate Store',
            accountNumber: 'payments@shopmate.com',
            color: 'bg-indigo-50 border-indigo-200 text-indigo-800',
            validate: (tid) => /^[a-zA-Z0-9]{10,20}$/.test(tid) ? '' : 'PayPal TID must be 10-20 alphanumeric characters.'
        }
    };

    const itemsPrice = cartItems.reduce((acc, item) => acc + item.quantity * item.price, 0);
    const shippingPrice = itemsPrice > 100 ? 0 : 10;
    const taxPrice = Number((0.15 * itemsPrice).toFixed(2));
    const totalPrice = (itemsPrice + shippingPrice + taxPrice).toFixed(2);

    const placeOrderHandler = async (e) => {
        e.preventDefault();

        // Validation Logic
        if (paymentMethod !== 'Credit Card' && paymentDetails[paymentMethod]) {
            const error = paymentDetails[paymentMethod].validate(transactionId);
            if (error) {
                setTidError(error);
                return;
            }
        }
        setTidError('');

        try {
            console.log('Cart Items in Checkout:', cartItems); // Debug log
            const orderData = {
                orderItems: cartItems,
                shippingAddress: { address, city, postalCode, country },
                paymentMethod,
                paymentResult: {
                    id: transactionId,
                    status: 'pending',
                    update_time: String(new Date())
                },
                itemsPrice,
                shippingPrice,
                taxPrice,
                totalPrice,
            };

            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.token}`,
                },
            };

            const { data } = await axios.post(`${API}/api/orders`, orderData, config);
            clearCart();
            // Navigate to Success Page with Order Data
            navigate('/order-success', { state: { order: data } });
        } catch (error) {
            console.error(error);
            alert('Error placing order');
        }
    };

    return (
        <div className="container mx-auto py-12 px-4">
            <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 p-8 rounded shadow text-gray-900 dark:text-gray-100">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-3xl font-bold text-center">Checkout</h2>
                    <Link to="/track-order" className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 hover:underline">
                        Track an existing order?
                    </Link>
                </div>
                <form onSubmit={placeOrderHandler}>
                    <h3 className="text-xl font-bold mb-4">Shipping Address</h3>
                    <div className="mb-4">
                        <label className="block text-gray-700 dark:text-gray-300 mb-2">Address</label>
                        <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className="w-full border p-2 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-gray-700 dark:text-gray-300 mb-2">City</label>
                            <input type="text" value={city} onChange={(e) => setCity(e.target.value)} className="w-full border p-2 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
                        </div>
                        <div>
                            <label className="block text-gray-700 dark:text-gray-300 mb-2">Postal Code</label>
                            <input type="text" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} className="w-full border p-2 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
                        </div>
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 dark:text-gray-300 mb-2">Country</label>
                        <input type="text" value={country} onChange={(e) => setCountry(e.target.value)} className="w-full border p-2 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
                    </div>

                    <h3 className="text-xl font-bold mb-4">Payment Method</h3>
                    <div className="mb-6 space-y-3">
                        <label className="flex items-center p-4 border rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition dark:border-gray-600">
                            <input type="radio" className="form-radio text-blue-600 h-5 w-5" name="paymentMethod" value="Credit Card" checked={paymentMethod === 'Credit Card'} onChange={(e) => setPaymentMethod(e.target.value)} />
                            <span className="ml-3 font-medium dark:text-white">Credit Card / Debit Card</span>
                        </label>
                        <label className="flex items-center p-4 border rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition dark:border-gray-600">
                            <input type="radio" className="form-radio text-green-600 h-5 w-5" name="paymentMethod" value="Easypaisa" checked={paymentMethod === 'Easypaisa'} onChange={(e) => setPaymentMethod(e.target.value)} />
                            <span className="ml-3 font-medium dark:text-white">Easypaisa</span>
                        </label>
                        <label className="flex items-center p-4 border rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition dark:border-gray-600">
                            <input type="radio" className="form-radio text-red-600 h-5 w-5" name="paymentMethod" value="JazzCash" checked={paymentMethod === 'JazzCash'} onChange={(e) => setPaymentMethod(e.target.value)} />
                            <span className="ml-3 font-medium dark:text-white">JazzCash</span>
                        </label>
                        <label className="flex items-center p-4 border rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition dark:border-gray-600">
                            <input type="radio" className="form-radio text-orange-600 h-5 w-5" name="paymentMethod" value="Nayapay" checked={paymentMethod === 'Nayapay'} onChange={(e) => setPaymentMethod(e.target.value)} />
                            <span className="ml-3 font-medium dark:text-white">Nayapay</span>
                        </label>
                        <label className="flex items-center p-4 border rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition dark:border-gray-600">
                            <input type="radio" className="form-radio text-indigo-600 h-5 w-5" name="paymentMethod" value="PayPal" checked={paymentMethod === 'PayPal'} onChange={(e) => setPaymentMethod(e.target.value)} />
                            <span className="ml-3 font-medium dark:text-white">PayPal</span>
                        </label>
                    </div>

                    {/* Dynamic Payment Instructions */}
                    {paymentMethod !== 'Credit Card' && paymentDetails[paymentMethod] && (
                        <div className={`p-6 rounded-xl border mb-6 ${paymentDetails[paymentMethod].color} dark:border-gray-600 dark:bg-gray-700`}>
                            <h4 className="font-bold text-lg mb-2 dark:text-white">Payment Instructions</h4>
                            <p className="mb-4 dark:text-gray-300">
                                Please send <span className="font-bold text-xl">${totalPrice}</span> to the following account:
                            </p>
                            <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-lg space-y-2 mb-6">
                                <div className="flex justify-between">
                                    <span className="text-sm opacity-75 dark:text-gray-400">Account Title:</span>
                                    <span className="font-bold dark:text-white">{paymentDetails[paymentMethod].accountTitle}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm opacity-75 dark:text-gray-400">Account Number:</span>
                                    <span className="font-mono font-bold text-lg dark:text-white">{paymentDetails[paymentMethod].accountNumber}</span>
                                </div>
                            </div>

                            <div>
                                <label className="block font-bold mb-2 dark:text-white">Transaction ID (TID)</label>
                                <input
                                    type="text"
                                    inputMode={paymentMethod === 'PayPal' ? "text" : "numeric"}
                                    value={transactionId}
                                    onChange={(e) => {
                                        // Allow alphanumeric for PayPal, digits only for others
                                        const val = paymentMethod === 'PayPal' 
                                            ? e.target.value.replace(/[^a-zA-Z0-9]/g, '') 
                                            : e.target.value.replace(/\D/g, '');
                                        setTransactionId(val);
                                        setTidError('');
                                    }}
                                    placeholder="Enter the TID from your SMS/App receipt"
                                    className={`w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white ${tidError ? 'border-red-500 focus:ring-red-500' : 'dark:border-gray-600'}`}
                                    required
                                />
                                {tidError && <p className="text-red-500 text-sm mt-1">{tidError}</p>}
                                <p className="text-xs mt-2 opacity-75 dark:text-gray-400">
                                    * Your order will be verified using this ID.
                                </p>
                            </div>
                        </div>
                    )}

                    {paymentMethod === 'Credit Card' && (
                        <div className="p-6 rounded-xl border bg-gray-50 border-gray-200 mb-6 dark:bg-gray-700 dark:border-gray-600">
                            <div className="mb-4">
                                <label className="block text-gray-700 dark:text-gray-300 mb-2">Card Number</label>
                                <input type="text" placeholder="0000 0000 0000 0000" className="w-full border p-2 rounded dark:bg-gray-800 dark:border-gray-600 dark:text-white" disabled />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-gray-700 dark:text-gray-300 mb-2">Expiry</label>
                                    <input type="text" placeholder="MM/YY" className="w-full border p-2 rounded dark:bg-gray-800 dark:border-gray-600 dark:text-white" disabled />
                                </div>
                                <div>
                                    <label className="block text-gray-700 dark:text-gray-300 mb-2">CVC</label>
                                    <input type="text" placeholder="123" className="w-full border p-2 rounded dark:bg-gray-800 dark:border-gray-600 dark:text-white" disabled />
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 mt-4 dark:text-gray-400">
                                * Credit Card payments are currently simulated.
                            </p>
                        </div>
                    )}

                    <div className="border-t pt-4 mb-6 dark:border-gray-700">
                        <div className="flex justify-between mb-2"><span>Items:</span><span>${itemsPrice.toFixed(2)}</span></div>
                        <div className="flex justify-between mb-2"><span>Shipping:</span><span>${shippingPrice.toFixed(2)}</span></div>
                        <div className="flex justify-between mb-2"><span>Tax:</span><span>${taxPrice.toFixed(2)}</span></div>
                        <div className="flex justify-between text-xl font-bold"><span>Total:</span><span>${totalPrice}</span></div>
                    </div>

                    <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded font-bold hover:bg-blue-700">
                        Place Order
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Checkout;
