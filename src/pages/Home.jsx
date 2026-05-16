import { useState, useEffect } from 'react';
import { fetchAllProducts } from '../services/api';
import { Link } from 'react-router-dom';

const Home = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const loadProducts = async () => {
      const data = await fetchAllProducts();
      setProducts(data.slice(0, 8)); // Show top 8 products
    };
    loadProducts();
  }, []);

  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen">
      <div className="bg-blue-600 text-white py-20 text-center">
        <h1 className="text-5xl font-bold mb-4">Welcome to ShopMate</h1>
        <p className="text-xl mb-8">Best products at unbeatable prices.</p>
        <Link to="/products" className="bg-white text-blue-600 px-6 py-3 rounded-full font-bold hover:bg-gray-200 transition cursor-pointer">
          Shop Now
        </Link>
      </div>

      <div className="container mx-auto py-12 px-4">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-8 text-center">Featured Products</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div key={product.id} className="bg-gradient-to-br from-blue-900/5 to-transparent dark:from-gray-800 dark:to-gray-900 rounded-3xl p-5 shadow-[0_10px_30px_rgba(0,0,0,0.15)] hover:shadow-[0_30px_40px_-5px_rgba(0,0,0,0.3)] hover:shadow-blue-500/20 transition-all duration-300 transform hover:-translate-y-2 flex flex-col group relative overflow-hidden border border-blue-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-gray-600">
              {/* Image Container */}
              <div className="relative overflow-hidden mb-5 rounded-2xl bg-gradient-to-tr from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 h-64 flex items-center justify-center p-6 group-hover:bg-blue-50/30 transition-colors duration-300">
                <img
                  src={product.image}
                  alt={product.title}
                  onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/600x400?text=No+Image"; }}
                  className="max-h-full max-w-full object-contain group-hover:scale-110 transition duration-500 ease-in-out mix-blend-multiply dark:mix-blend-normal drop-shadow-sm"
                />

                {/* Overlay Action Button (Hidden by default, shows on hover) */}
                <div className="absolute inset-0 bg-black/10 dark:bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <Link to={`/products/${product.id}`} className="bg-white text-gray-900 font-bold py-2 px-6 rounded-full shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 hover:bg-blue-600 hover:text-white">
                    View Details
                  </Link>
                </div>

                {/* Quick Badge */}
                <div className="absolute top-3 left-3 bg-red-500 text-white text-[10px] uppercase font-bold px-3 py-1 rounded-full shadow-md tracking-wider">
                  Hot
                </div>
              </div>

              {/* Content */}
              <div className="grow flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">{product.category}</p>
                  <div className="flex items-center">
                    <span className="text-yellow-400 text-sm">★</span>
                    <span className="text-gray-400 text-xs ml-1 font-medium">4.5</span>
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
    </div>
  );
};

export default Home;
