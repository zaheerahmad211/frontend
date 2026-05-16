import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { fetchProductById } from '../services/api';
import ProductTrackerPlugin from '../components/ProductTrackerPlugin';

const ProductDetails = () => {
    const { id } = useParams();
    const [product, setProduct] = useState({});
    const [qty, setQty] = useState(1);
    const { addToCart } = useCart();
    const navigate = useNavigate();

    useEffect(() => {
        const loadProduct = async () => {
            const data = await fetchProductById(id);
            if (data) {
                setProduct(data);
            }
        };
        loadProduct();
    }, [id]);

    const handleAddToCart = () => {
        addToCart(product, Number(qty));
        navigate('/cart');
    };

    if (!product.title) return <div className="text-center py-20">Loading...</div>;

    return (
        <div className="container mx-auto py-12 px-4">
            <button onClick={() => navigate(-1)} className="mb-4 text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white cursor-pointer">
                &larr; Go Back
            </button>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
                    <img src={product.image} alt={product.title} className="w-full h-96 object-contain" />
                </div>
                <div>
                    <h2 className="text-3xl font-bold mb-4 dark:text-white">{product.title}</h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">{product.description}</p>
                    <div className="text-2xl font-bold text-blue-600 mb-6">${product.price}</div>

                    <div className="mb-6">
                        <span className="mr-2 dark:text-gray-300">Status:</span>
                        <span className="text-green-600 font-bold">In Stock</span>
                    </div>

                    <div className="mb-6 flex items-center">
                        <span className="mr-4 dark:text-gray-300">Quantity:</span>
                        <select
                            value={qty}
                            onChange={(e) => setQty(e.target.value)}
                            className="border p-2 rounded cursor-pointer dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        >
                            {[...Array(product.stock).keys()].slice(0, 10).map((x) => (
                                <option key={x + 1} value={x + 1}>
                                    {x + 1}
                                </option>
                            ))}
                        </select>
                    </div>

                    <button
                        onClick={handleAddToCart}
                        className="w-full bg-blue-600 text-white py-3 rounded font-bold hover:bg-blue-700 transition cursor-pointer"
                    >
                        Add to Cart
                    </button>
                </div>
            </div>
            <ProductTrackerPlugin />
        </div>
    );
};

export default ProductDetails;
