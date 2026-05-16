import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchAllProducts, fetchCategories } from '../services/api';
import ProductTrackerPlugin from '../components/ProductTrackerPlugin';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [allProducts, allCategories] = await Promise.all([
                    fetchAllProducts(),
                    fetchCategories()
                ]);

                setProducts(allProducts);
                setFilteredProducts(allProducts);
                setCategories(allCategories);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (selectedCategory === 'all') {
            setFilteredProducts(products);
        } else {
            setFilteredProducts(products.filter(product => product.category === selectedCategory));
        }
    }, [selectedCategory, products]);

    if (loading) return (
        <div className="flex justify-center items-center h-screen">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
            <div className="container mx-auto px-4">
                <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-8 text-center">Our Collection</h2>

                {/* Categories Menu */}
                <div className="flex flex-wrap justify-center gap-4 mb-12">
                    <button
                        onClick={() => setSelectedCategory('all')}
                        className={`px-6 py-2 rounded-full font-medium transition duration-300 capitalize ${selectedCategory === 'all'
                            ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                            : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                            }`}
                    >
                        All
                    </button>
                    {categories.map((category) => (
                        <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={`px-6 py-2 rounded-full font-medium transition duration-300 capitalize ${selectedCategory === category
                                ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                                }`}
                        >
                            {category}
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {filteredProducts.map((product) => (
                        <div key={product.id} className="bg-gradient-to-br from-blue-900/5 to-transparent dark:from-gray-800 dark:to-gray-900 rounded-3xl p-5 shadow-[0_10px_30px_rgba(0,0,0,0.15)] hover:shadow-[0_30px_40px_-5px_rgba(0,0,0,0.3)] hover:shadow-blue-500/20 transition-all duration-300 transform hover:-translate-y-2 flex flex-col group relative overflow-hidden border border-blue-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-gray-600">
                            {/* Image Container */}
                            <div className="relative overflow-hidden mb-5 rounded-2xl bg-gradient-to-tr from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 h-64 flex items-center justify-center p-6 group-hover:bg-blue-50/30 transition-colors duration-300">
                                <img
                                    src={product.images ? product.images[0] : product.image}
                                    alt={product.title}
                                    onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/600x400?text=No+Image"; }}
                                    className="max-h-full max-w-full object-contain group-hover:scale-110 transition duration-500 ease-in-out mix-blend-multiply dark:mix-blend-normal drop-shadow-sm"
                                />
                                {/* Overlay Action Button */}
                                <div className="absolute inset-0 bg-black/10 dark:bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                    <Link to={`/products/${product.id}`} className="bg-white text-gray-900 font-bold py-2 px-6 rounded-full shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 hover:bg-blue-600 hover:text-white">
                                        View Details
                                    </Link>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="grow flex flex-col">
                                <div className="flex justify-between items-start mb-2">
                                    <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">{product.category}</p>
                                    <div className="flex items-center">
                                        <span className="text-yellow-400 text-sm">★</span>
                                        <span className="text-gray-400 text-xs ml-1 font-medium">{product.rating?.rate || product.rating || 4.5}</span>
                                    </div>
                                </div>

                                <Link to={`/products/${product.id}`}>
                                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-50 mb-3 leading-snug group-hover:text-blue-600 transition-colors line-clamp-2">
                                        {product.title}
                                    </h3>
                                </Link>

                                <div className="mt-auto flex items-end justify-between border-t border-gray-100 dark:border-gray-700 pt-4">
                                    <div className="flex flex-col">
                                        <span className="text-gray-400 text-xs line-through font-medium opacity-70">${(product.price * 1.2).toFixed(2)}</span>
                                        <span className="text-2xl font-extrabold text-gray-900 dark:text-white">${product.price}</span>
                                    </div>
                                    <button className="bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300 p-3 rounded-xl hover:bg-blue-600 hover:text-white transition-all duration-300 shadow-sm hover:shadow-blue-300 dark:hover:shadow-none">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <ProductTrackerPlugin />
        </div>
    );
};

export default Products;
