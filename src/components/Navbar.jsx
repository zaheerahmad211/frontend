import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useTheme } from "../context/ThemeContext";
import { FaShoppingCart, FaUser, FaSignOutAlt, FaBars, FaTimes, FaSun, FaMoon } from "react-icons/fa";

const API = import.meta.env.VITE_API_URL;

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cartItems } = useCart();
  const { theme, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-gray-900 text-white p-4 shadow-lg transition-colors duration-200">
      <div className="container mx-auto flex justify-between items-center relative">
        <Link to="/" className="text-2xl font-bold text-blue-400">
          ShopMate
        </Link>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-white focus:outline-none"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
        </button>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-8">
          <NavLink to="/" className={({ isActive }) => `text-lg font-medium transition ${isActive ? "text-blue-400" : "hover:text-blue-400"}`}>Home</NavLink>
          <NavLink to="/about" className={({ isActive }) => `text-lg font-medium transition ${isActive ? "text-blue-400" : "hover:text-blue-400"}`}>About</NavLink>
          <NavLink to="/products" className={({ isActive }) => `text-lg font-medium transition ${isActive ? "text-blue-400" : "hover:text-blue-400"}`}>Products</NavLink>
          <NavLink to="/contact" className={({ isActive }) => `text-lg font-medium transition ${isActive ? "text-blue-400" : "hover:text-blue-400"}`}>Contact</NavLink>

          {user && user.role === "admin" && (
            <NavLink to="/admin" className={({ isActive }) => `text-lg font-medium transition ${isActive ? "text-blue-400" : "hover:text-yellow-400 text-yellow-500"}`}>Admin</NavLink>
          )}

          {user && user.role === "seller" && (
            <NavLink to="/seller" className={({ isActive }) => `text-lg font-medium transition ${isActive ? "text-blue-400" : "hover:text-cyan-400 text-cyan-500"}`}>Seller</NavLink>
          )}

          {user ? (
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                {user.profilePicture ? (
                  <img
                    src={user.profilePicture.startsWith('/uploads/') ? `${API}${user.profilePicture}` : user.profilePicture}
                    alt="Profile"
                    className="w-8 h-8 rounded-full border-2 border-blue-400 object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="text-lg font-medium text-blue-200">Hi, {user.name}</span>
              </div>
              <button onClick={logout} className="flex items-center space-x-1 text-lg font-medium hover:text-red-400 transition">
                <FaSignOutAlt /> <span>Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Link to="/login" className="hover:text-blue-400">Login</Link>
              <Link to="/register" className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700">Register</Link>
            </div>
          )}

          <Link to="/cart" className="relative hover:text-green-400">
            <FaShoppingCart size={20} />
            {cartItems.length > 0 && (
              <span className="absolute -top-3 -right-3 bg-red-600 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white dark:border-gray-900">
                {cartItems.reduce((acc, item) => acc + item.quantity, 0)}
              </span>
            )}
          </Link>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
            aria-label="Toggle Theme"
          >
            {theme === "light" ? <FaSun size={20} className="text-yellow-400" /> : <FaMoon size={20} />}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMenuOpen && (
          <div className="absolute top-16 left-0 w-full bg-gray-900 shadow-md flex flex-col items-center space-y-4 py-4 md:hidden z-50 text-white">
            <NavLink to="/" className={({ isActive }) => `hover:text-gray-300 ${isActive ? "text-blue-400" : ""}`} onClick={() => setIsMenuOpen(false)}>Home</NavLink>
            <NavLink to="/about" className={({ isActive }) => `hover:text-gray-300 ${isActive ? "text-blue-400" : ""}`} onClick={() => setIsMenuOpen(false)}>About</NavLink>
            <NavLink to="/products" className={({ isActive }) => `hover:text-gray-300 ${isActive ? "text-blue-400" : ""}`} onClick={() => setIsMenuOpen(false)}>Products</NavLink>
            <NavLink to="/contact" className={({ isActive }) => `hover:text-gray-300 ${isActive ? "text-blue-400" : ""}`} onClick={() => setIsMenuOpen(false)}>Contact</NavLink>
            <Link to="/cart" className="hover:text-green-400" onClick={() => setIsMenuOpen(false)}>Cart</Link>

            {user && user.role === "admin" && (
              <NavLink to="/admin" className={({ isActive }) => `hover:text-gray-300 ${isActive ? "text-blue-400" : "text-yellow-400"}`} onClick={() => setIsMenuOpen(false)}>Admin</NavLink>
            )}

            {user && user.role === "seller" && (
              <NavLink to="/seller" className={({ isActive }) => `hover:text-gray-300 ${isActive ? "text-blue-400" : "text-cyan-400"}`} onClick={() => setIsMenuOpen(false)}>Seller</NavLink>
            )}

            {user ? (
              <div className="flex flex-col items-center space-y-2">
                <div className="flex flex-col items-center space-y-1">
                  {user.profilePicture ? (
                    <img
                      src={user.profilePicture.startsWith('/uploads/') ? `${API}${user.profilePicture}` : user.profilePicture}
                      alt="Profile"
                      className="w-10 h-10 rounded-full border-2 border-blue-400 object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-lg">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="text-sm">Hi, {user.name}</span>
                </div>
                <button onClick={() => { logout(); setIsMenuOpen(false); }} className="flex items-center space-x-1 hover:text-red-400">
                  <FaSignOutAlt /> <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-2">
                <Link to="/login" className="hover:text-blue-400" onClick={() => setIsMenuOpen(false)}>Login</Link>
                <Link to="/register" className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700" onClick={() => setIsMenuOpen(false)}>Register</Link>
              </div>
            )}

            {/* Mobile Theme Toggle */}
            <button
              onClick={() => {
                toggleTheme();
                setIsMenuOpen(false);
              }}
              className="flex items-center space-x-2 hover:text-blue-400"
            >
              {theme === "light" ? <FaMoon /> : <FaSun className="text-yellow-400" />}
              <span>{theme === "light" ? "Dark Mode" : "Light Mode"}</span>
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
