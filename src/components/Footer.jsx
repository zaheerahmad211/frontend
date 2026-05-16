import React from "react";
import { Link } from "react-router-dom";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-8 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8 mb-8">
          <div className="col-span-2 md:col-span-1">
            <h3 className="text-xl font-bold mb-4 text-blue-600">ShopMate</h3>
            <p className="text-gray-400">
              Your one-stop destination for the best products at unbeatable prices. Shop with confidence.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-gray-400 hover:text-white">Home</Link></li>
              <li><Link to="/about" className="text-gray-400 hover:text-white">About</Link></li>
              <li><Link to="/products" className="text-gray-400 hover:text-white">Products</Link></li>
              <li><Link to="/contact" className="text-gray-400 hover:text-white">Contact</Link></li>
              <li><Link to="/cart" className="text-gray-400 hover:text-white">Cart</Link></li>
            </ul>
          </div>

          <div className="flex flex-col items-center">
            <h3 className="text-xl font-bold mb-4">Follow Us</h3>
            <div className="flex flex-col space-y-4 items-center">
              <a href="#" className="text-gray-400 hover:text-blue-500"><FaFacebook size={24} /></a>
              <a href="#" className="text-gray-400 hover:text-blue-400"><FaTwitter size={24} /></a>
              <a href="#" className="text-gray-400 hover:text-pink-500"><FaInstagram size={24} /></a>
              <a href="#" className="text-gray-400 hover:text-blue-600"><FaLinkedin size={24} /></a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} ShopMate. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
