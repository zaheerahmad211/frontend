import React from "react";
import { Link } from "react-router-dom";
import { FaShippingFast, FaShieldAlt, FaHeadset, FaUsers, FaHistory } from "react-icons/fa";

const About = () => {
    return (
        <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white py-24 text-center px-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-black opacity-20"></div>
                <div className="relative z-10 max-w-4xl mx-auto">
                    <h1 className="text-5xl md:text-6xl font-extrabold mb-6 tracking-tight drop-shadow-md">
                        We Are ShopMate
                    </h1>
                    <p className="text-xl md:text-2xl font-light text-blue-100 max-w-2xl mx-auto leading-relaxed">
                        Redefining your online shopping experience with quality, speed, and trust.
                    </p>
                </div>
            </div>

            {/* Story & Mission Section */}
            <div className="container mx-auto py-16 px-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

                    {/* Visual Side */}
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
                        <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden h-96 flex flex-col items-center justify-center p-8 text-center border border-gray-100 dark:border-gray-700">
                            <FaUsers className="text-6xl text-blue-600 mb-6" />
                            <h3 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Our Community</h3>
                            <p className="text-gray-500 text-lg">Serving 10,000+ Happy Customers</p>
                            <div className="mt-8 flex space-x-2 justify-center">
                                <span className="h-2 w-2 bg-blue-400 rounded-full animate-bounce"></span>
                                <span className="h-2 w-2 bg-blue-400 rounded-full animate-bounce delay-100"></span>
                                <span className="h-2 w-2 bg-blue-400 rounded-full animate-bounce delay-200"></span>
                            </div>
                        </div>
                    </div>

                    {/* Text Side */}
                    <div className="space-y-8">
                        <div>
                            <div className="flex items-center space-x-3 mb-4">
                                <FaHistory className="text-2xl text-blue-600" />
                                <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Who We Are</h2>
                            </div>
                            <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed border-l-4 border-blue-500 pl-4">
                                ShopMate began in 2025 with a singular vision: to create an ecommerce platform that feels personal. We aren't just selling products; we are curating a lifestyle. From our humble beginnings to a growing community, our focus has remained on <b>you</b>.
                            </p>
                        </div>

                        <div>
                            <div className="flex items-center space-x-3 mb-4">
                                <FaShieldAlt className="text-2xl text-blue-600" />
                                <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Our Mission</h2>
                            </div>
                            <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed border-l-4 border-purple-500 pl-4">
                                To deliver excellence at your doorstep. We believe in transparency, sustainable practices, and creating a marketplace where quality meets affordability.
                            </p>
                        </div>

                        <Link to="/products" className="inline-block bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-bold py-4 px-10 rounded-full shadow-lg hover:shadow-2xl hover:-translate-y-1 transition transform duration-300">
                            Start Shopping
                        </Link>
                    </div>
                </div>

                {/* Values Section */}
                <div className="mt-24 mb-12">
                    <h2 className="text-4xl font-bold text-center text-gray-800 dark:text-white mb-12">Why Choose Us?</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { icon: FaShippingFast, title: "Super Fast Delivery", desc: "Get your orders quicker than ever with our optimized logistics network.", color: "text-blue-500" },
                            { icon: FaShieldAlt, title: "Secure Payments", desc: "Your data is protected with state-of-the-art 256-bit encryption.", color: "text-green-500" },
                            { icon: FaHeadset, title: "24/7 Support", desc: "Our dedicated support team is here to assist you anytime, day or night.", color: "text-purple-500" }
                        ].map((item, index) => (
                            <div key={index} className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition duration-300 transform hover:-translate-y-2 border border-gray-100 dark:border-gray-700 relative overflow-hidden group">
                                <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition duration-300 ${item.color}`}>
                                    <item.icon size={100} />
                                </div>
                                <div className={`${item.color} text-5xl mb-6`}>
                                    <item.icon />
                                </div>
                                <h3 className="text-2xl font-bold mb-3 text-gray-800 dark:text-white">{item.title}</h3>
                                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
export default About;