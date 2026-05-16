import { useCart } from '../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthModal from '../components/AuthModal';
import { useState } from 'react';

const Cart = () => {
    const { cartItems, removeFromCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [showAuthModal, setShowAuthModal] = useState(false);

    const total = cartItems.reduce((acc, item) => acc + item.quantity * item.price, 0).toFixed(2);

    const checkoutHandler = () => {
        if (user) {
            navigate('/checkout');
        } else {
            setShowAuthModal(true);
        }
    };

    return (
        <div className="container mx-auto py-12 px-4">
            <h2 className="text-3xl font-bold mb-8 dark:text-white">Shopping Cart</h2>
            {cartItems.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 p-6 rounded shadow text-center">
                    <p className="text-xl mb-4 dark:text-gray-300">Your cart is empty.</p>
                    <Link to="/products" className="text-blue-600 hover:underline">Go Shop</Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 space-y-4">
                        {cartItems.map((item) => (
                            <div key={item.product} className="flex items-center justify-between bg-white dark:bg-gray-800 p-4 rounded shadow">
                                <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded" />
                                <div className="flex-1 ml-4">
                                    <Link to={`/products/${item.product}`} className="text-lg font-bold text-gray-800 dark:text-white hover:text-blue-600">{item.name}</Link>
                                    <p className="text-gray-600 dark:text-gray-300">${item.price}</p>
                                </div>
                                <div className="flex items-center">
                                    <span className="mr-4 dark:text-gray-300">Qty: {item.quantity}</span>
                                    <button onClick={() => removeFromCart(item.product)} className="text-red-500 hover:text-red-700">
                                        Remove
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-6 rounded shadow h-fit text-gray-900 dark:text-gray-100">
                        <h3 className="text-xl font-bold mb-4">Summary</h3>
                        <div className="flex justify-between mb-2">
                            <span>Items:</span>
                            <span>{cartItems.reduce((acc, item) => acc + item.quantity, 0)}</span>
                        </div>
                        <div className="flex justify-between mb-6 text-xl font-bold">
                            <span>Total:</span>
                            <span>${total}</span>
                        </div>
                        <button
                            onClick={checkoutHandler}
                            className="w-full bg-blue-600 text-white py-3 rounded font-bold hover:bg-blue-700"
                        >
                            Proceed to Checkout
                        </button>
                    </div>
                </div>
            )}
            {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
        </div>
    );
};

export default Cart;
