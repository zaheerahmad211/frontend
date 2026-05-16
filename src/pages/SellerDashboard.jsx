import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL;
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const SellerDashboard = () => {
    const { user, setUser } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("products");
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [messages, setMessages] = useState([]);
    const [formVisible, setFormVisible] = useState(false);
    const [editingProductId, setEditingProductId] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(false);
    const hiddenFileInput = useRef(null);

    const [editProfileMode, setEditProfileMode] = useState(false);
    const [profileData, setProfileData] = useState({
        name: user?.name || "",
        email: user?.email || "",
    });

    const [formData, setFormData] = useState({
        name: "",
        price: "",
        description: "",
        image: "",
        category: "",
        stock: "",
    });

    useEffect(() => {
        if (!user || user.role !== "seller") {
            navigate("/");
        } else {
            fetchProducts();
            fetchOrders();
            fetchMessages();
            setProfileData({
                name: user.name || "",
                email: user.email || ""
            });
        }
    }, [user, navigate]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(`${API}/api/products?seller=${user._id}`);
            setProducts(data);
        } catch (error) {
            console.error("Fetch products error:", error.response?.data || error.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchOrders = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.get(`${API}/api/orders/seller`, config);
            setOrders(data);
        } catch (error) {
            console.error("Fetch orders error:", error.response?.data || error.message);
        }
    };

    const fetchMessages = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.get(`${API}/api/messages/seller`, config);
            setMessages(data);
        } catch (error) {
            console.error("Fetch messages error:", error.response?.data || error.message);
        }
    };

    const getImageUrl = (url) => {
        if (!url) return '';
        if (url.startsWith('/uploads/')) return `${API}${url}`;
        return url;
    };

    const uploadProductImage = async (e) => {
        const file = e.target.files[0];
        const formDataUpload = new FormData();
        formDataUpload.append('image', file);
        setUploading(true);

        try {
            const config = { headers: { 'Content-Type': 'multipart/form-data' } };
            const { data } = await axios.post(`${API}/api/upload`, formDataUpload, config);
            setFormData({ ...formData, image: data });
            setUploading(false);
        } catch (error) {
            console.error(error);
            setUploading(false);
            alert("Image upload failed!");
        }
    };

    const uploadProfilePic = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formDataUpload = new FormData();
        formDataUpload.append('image', file);

        try {
            const configUpload = { headers: { 'Content-Type': 'multipart/form-data' } };
            const uploadRes = await axios.post(`${API}/api/upload`, formDataUpload, configUpload);

            const configProf = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.put(`${API}/api/users/profile`, { profilePicture: uploadRes.data }, configProf);

            const updatedUser = { ...user, profilePicture: data.profilePicture };
            setUser(updatedUser);
            localStorage.setItem("user", JSON.stringify(updatedUser));

            alert("Profile picture updated!");
        } catch (error) {
            console.error(error);
            alert("Profile picture update failed!");
        }
    };

    const handleProfilePicClick = () => {
        hiddenFileInput.current.click();
    };

    const handleProfileInputChange = (e) => {
        setProfileData({ ...profileData, [e.target.name]: e.target.value });
    };

    const handleSaveProfile = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.put(`${API}/api/users/profile`, profileData, config);

            const updatedUser = { ...user, ...data, token: user.token };
            setUser(updatedUser);
            localStorage.setItem("user", JSON.stringify(updatedUser));

            setEditProfileMode(false);
            alert("Profile updated successfully!");
        } catch (error) {
            console.error(error);
            alert("Profile update failed!");
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const toggleForm = () => {
        if (formVisible) {
            setFormVisible(false);
            setEditingProductId(null);
            setFormData({ name: "", price: "", description: "", image: "", category: "", stock: "" });
        } else {
            setFormVisible(true);
            setEditingProductId(null);
            setFormData({ name: "", price: "", description: "", image: "", category: "", stock: "" });
        }
    };

    const handleEditClick = (product) => {
        setFormData({
            name: product.name,
            price: product.price,
            description: product.description,
            image: product.image,
            category: product.category,
            stock: product.stock,
        });
        setEditingProductId(product._id);
        setFormVisible(true);
    };

    const handleSubmitProduct = async (e) => {
        e.preventDefault();
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            if (editingProductId) {
                await axios.put(`${API}/api/products/${editingProductId}`, formData, config);
                alert("Product Updated!");
            } else {
                await axios.post(`${API}/api/products`, formData, config);
                alert("Product Added!");
            }
            setFormVisible(false);
            setEditingProductId(null);
            setFormData({ name: "", price: "", description: "", image: "", category: "", stock: "" });
            fetchProducts();
        } catch (error) {
            console.error("Save product error:", error.response?.data || error.message);
            alert("Error saving product. Check backend route and data.");
        }
    };

    const handleDeleteProduct = async (id) => {
        if (!id) return alert("Invalid product ID.");
        if (window.confirm("Are you sure you want to delete this product?")) {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                await axios.delete(`${API}/api/products/${id}`, config);
                alert("Product Deleted!");
                fetchProducts();
            } catch (error) {
                console.error("Delete product error:", error.response?.data || error.message);
                alert("Error deleting product.");
            }
        }
    };

    const handleUpdateStock = async (id, newStock) => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.put(`${API}/api/products/${id}`, { stock: newStock }, config);
            fetchProducts();
        } catch (error) {
            console.error("Update stock error:", error.response?.data || error.message);
        }
    };

    const handleUpdateOrderStatus = async (orderId, newStatus) => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.put(`${API}/api/orders/${orderId}`, { status: newStatus }, config);
            alert(`Order status updated to ${newStatus}`);
            fetchOrders();
        } catch (error) {
            console.error("Update order status error:", error.response?.data || error.message);
            alert("Failed to update status.");
        }
    };

    return (
        <div className="container mx-auto py-12 px-4 min-h-screen">
            <div className="flex flex-col md:flex-row justify-between items-center mb-10">
                <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-500">
                    Seller Dashboard
                </h1>
                <div className="mt-4 md:mt-0 px-4 py-1 bg-cyan-50 dark:bg-gray-700/50 rounded-full text-sm font-medium text-cyan-600 dark:text-cyan-300 border border-cyan-100 dark:border-gray-600">
                    {user?.name}'s Store
                </div>
            </div>

            {/* Tabs */}
            <div className="flex justify-center mb-10">
                <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-xl inline-flex shadow-inner">
                    <button
                        className={`px-6 py-2 rounded-lg transition-all duration-200 ${activeTab === "products" ? "bg-white dark:bg-gray-700 text-cyan-600 dark:text-cyan-300 font-bold shadow-md transform scale-105" : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"}`}
                        onClick={() => setActiveTab("products")}
                    >
                        My Products
                    </button>
                    <button
                        className={`px-6 py-2 rounded-lg transition-all duration-200 ${activeTab === "inventory" ? "bg-white dark:bg-gray-700 text-cyan-600 dark:text-cyan-300 font-bold shadow-md transform scale-105" : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"}`}
                        onClick={() => setActiveTab("inventory")}
                    >
                        Inventory
                    </button>
                    <button
                        className={`px-6 py-2 rounded-lg transition-all duration-200 ${activeTab === "orders" ? "bg-white dark:bg-gray-700 text-cyan-600 dark:text-cyan-300 font-bold shadow-md transform scale-105" : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"}`}
                        onClick={() => setActiveTab("orders")}
                    >
                        Order History
                    </button>
                    <button
                        className={`px-6 py-2 rounded-lg transition-all duration-200 ${activeTab === "feedback" ? "bg-white dark:bg-gray-700 text-cyan-600 dark:text-cyan-300 font-bold shadow-md transform scale-105" : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"}`}
                        onClick={() => setActiveTab("feedback")}
                    >
                        Feedback
                    </button>
                    <button
                        className={`px-6 py-2 rounded-lg transition-all duration-200 ${activeTab === "profile" ? "bg-white dark:bg-gray-700 text-cyan-600 dark:text-cyan-300 font-bold shadow-md transform scale-105" : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"}`}
                        onClick={() => setActiveTab("profile")}
                    >
                        Store Profile
                    </button>
                </div>
            </div>

            {/* Products Tab */}
            {activeTab === "products" && (
                <div className="max-w-6xl mx-auto">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold dark:text-white">Product Management</h2>
                        <button onClick={toggleForm} className="bg-cyan-600 text-white px-4 py-2 rounded font-semibold hover:bg-cyan-700 transition">
                            {formVisible ? "Cancel" : "+ Add Product"}
                        </button>
                    </div>

                    {formVisible && (
                        <form onSubmit={handleSubmitProduct} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 mb-8 transition-all">
                            <h3 className="text-xl font-bold mb-4 dark:text-white">{editingProductId ? "Edit Product Details" : "New Product Details"}</h3>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <input type="text" name="name" placeholder="Product Name" value={formData.name} onChange={handleInputChange} className="border p-3 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white w-full focus:ring-2 focus:ring-cyan-500 outline-none" required />
                                <input type="number" name="price" placeholder="Price ($)" value={formData.price} onChange={handleInputChange} className="border p-3 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white w-full focus:ring-2 focus:ring-cyan-500 outline-none" required />
                            </div>
                            <div className="mb-4">
                                <p className="text-sm font-semibold mb-1 dark:text-gray-300">Product Image</p>
                                <div className="flex items-center space-x-4">
                                    <input type="text" name="image" placeholder="Image URL or upload below" value={formData.image} onChange={handleInputChange} className="border p-3 rounded-lg w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-cyan-500 outline-none" required />
                                    <input type="file" onChange={uploadProductImage} className="text-sm dark:text-gray-300 w-48" />
                                </div>
                                {uploading && <p className="text-sm text-cyan-600 mt-1">Uploading image...</p>}
                            </div>
                            <div className="mb-4">
                                <textarea name="description" placeholder="Product Description" value={formData.description} onChange={handleInputChange} className="border p-3 rounded-lg w-full h-24 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-cyan-500 outline-none" required></textarea>
                            </div>
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <input type="text" name="category" placeholder="Category" value={formData.category} onChange={handleInputChange} className="border p-3 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white w-full focus:ring-2 focus:ring-cyan-500 outline-none" required />
                                <input type="number" name="stock" placeholder="Stock Quantity" value={formData.stock} onChange={handleInputChange} className="border p-3 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white w-full focus:ring-2 focus:ring-cyan-500 outline-none" required />
                            </div>
                            <button type="submit" className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-8 py-3 rounded-lg font-bold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition w-full">
                                {editingProductId ? "Update Product" : "Save Product"}
                            </button>
                        </form>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {products.map((product) => (
                            <div key={product._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-100 dark:border-gray-700 hover:shadow-lg transition">
                                <img src={getImageUrl(product.image)} alt={product.name} className="w-full h-48 object-cover" />
                                <div className="p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-bold text-lg dark:text-white truncate" title={product.name}>{product.name}</h3>
                                        <span className="bg-cyan-100 text-cyan-800 text-xs font-bold px-2 py-1 rounded dark:bg-cyan-900/30 dark:text-cyan-300">
                                            ${product.price}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">{product.description}</p>
                                    <div className="flex justify-between items-center text-sm mb-4">
                                        <span className="text-gray-600 dark:text-gray-300"><span className="font-semibold text-gray-900 dark:text-white">{product.stock}</span> in stock</span>
                                        <span className="text-gray-500 dark:text-gray-400 text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">{product.category}</span>
                                    </div>
                                    <div className="flex justify-between mt-4">
                                        <button onClick={() => handleEditClick(product)} className="text-blue-600 hover:text-blue-800 text-sm font-semibold transition dark:text-blue-400 dark:hover:text-blue-300">Edit</button>
                                        <button onClick={() => handleDeleteProduct(product._id)} className="text-red-500 hover:text-red-700 text-sm font-semibold transition">Delete</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {products.length === 0 && (
                            <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-12 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                                <p className="text-lg">You haven't added any products yet.</p>
                                <button onClick={() => setFormVisible(true)} className="mt-4 text-cyan-600 hover:underline">Add your first product</button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Inventory Tab */}
            {activeTab === "inventory" && (
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-2xl font-bold dark:text-white mb-6">Inventory Management</h2>
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 text-sm uppercase font-bold">
                                <tr>
                                    <th className="px-6 py-4">Product</th>
                                    <th className="px-6 py-4">Current Stock</th>
                                    <th className="px-6 py-4">Price</th>
                                    <th className="px-6 py-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {products.map((product) => (
                                    <tr key={product._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <img src={getImageUrl(product.image)} alt={product.name} className="w-10 h-10 rounded object-cover mr-3" />
                                                <div>
                                                    <div className="font-bold dark:text-white">{product.name}</div>
                                                    <div className="text-xs text-gray-500">{product.category}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-3">
                                                <button 
                                                    onClick={() => handleUpdateStock(product._id, Math.max(0, product.stock - 1))}
                                                    className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center hover:bg-red-200 transition"
                                                >-</button>
                                                <span className={`font-bold ${product.stock < 10 ? 'text-red-500' : 'dark:text-white'}`}>{product.stock}</span>
                                                <button 
                                                    onClick={() => handleUpdateStock(product._id, product.stock + 1)}
                                                    className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center hover:bg-green-200 transition"
                                                >+</button>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 dark:text-white font-semibold">${product.price}</td>
                                        <td className="px-6 py-4">
                                            <button onClick={() => handleEditClick(product)} className="text-cyan-600 hover:underline text-sm font-bold">Manage</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {products.length === 0 && (
                            <div className="text-center py-12 text-gray-500">No products found.</div>
                        )}
                    </div>
                </div>
            )}

            {/* Order History Tab */}
            {activeTab === "orders" && (
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-2xl font-bold dark:text-white mb-6">Order History</h2>
                    <div className="space-y-4">
                        {orders.length > 0 ? orders.map((order) => (
                            <div key={order._id} className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-100 dark:border-gray-700 overflow-hidden">
                                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 flex flex-wrap justify-between items-center border-b border-gray-100 dark:border-gray-700">
                                    <div className="flex space-x-4 text-sm">
                                        <div>
                                            <p className="text-gray-500 dark:text-gray-400 uppercase text-xs font-bold">Order Placed</p>
                                            <p className="dark:text-white">{new Date(order.createdAt).toLocaleDateString()}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500 dark:text-gray-400 uppercase text-xs font-bold">Order ID</p>
                                            <p className="dark:text-white">#{order._id.slice(-8).toUpperCase()}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500 dark:text-gray-400 uppercase text-xs font-bold">Buyer</p>
                                            <p className="dark:text-white font-semibold">{order.user?.name}</p>
                                        </div>
                                    </div>
                                    <div className="mt-2 sm:mt-0 flex items-center space-x-2">
                                        <select 
                                            value={order.status} 
                                            onChange={(e) => handleUpdateOrderStatus(order._id, e.target.value)}
                                            className="text-xs font-bold uppercase p-1 rounded border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        >
                                            <option value="Pending">Pending</option>
                                            <option value="Approved">Approved</option>
                                            <option value="Processing">Processing</option>
                                            <option value="Shipped">Shipped</option>
                                            <option value="Delivered">Delivered</option>
                                            <option value="Cancelled">Cancelled</option>
                                        </select>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                                            order.status === 'Delivered' ? 'bg-green-100 text-green-700' : 
                                            order.status === 'Cancelled' ? 'bg-red-100 text-red-700' : 
                                            'bg-blue-100 text-blue-700'
                                        }`}>
                                            {order.status}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-4">
                                    {order.items.map((item, idx) => (
                                        <div key={idx} className="flex items-center py-2">
                                            <img src={getImageUrl(item.image)} alt={item.name} className="w-16 h-16 object-cover rounded border mr-4" />
                                            <div className="flex-1">
                                                <h4 className="font-bold dark:text-white">{item.name}</h4>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">Qty: {item.qty} × ${item.price}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold dark:text-white">${(item.qty * item.price).toFixed(2)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )) : (
                            <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                                <div className="text-5xl mb-4">📦</div>
                                <p className="text-gray-500 dark:text-gray-400 text-lg">No orders found for your products yet.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Feedback Tab */}
            {activeTab === "feedback" && (
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-2xl font-bold dark:text-white mb-6">Customer Feedback</h2>
                    <div className="grid grid-cols-1 gap-6">
                        {messages.length > 0 ? messages.map((msg) => (
                            <div key={msg._id} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 transition-all hover:shadow-lg">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-cyan-100 dark:bg-cyan-900/30 rounded-full flex items-center justify-center text-cyan-600 dark:text-cyan-300 font-bold">
                                            {msg.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h4 className="font-bold dark:text-white">{msg.name}</h4>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(msg.createdAt).toLocaleString()}</p>
                                        </div>
                                    </div>
                                    <span className="text-[10px] uppercase font-bold px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full">
                                        Received
                                    </span>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-xl italic text-gray-700 dark:text-gray-200 border-l-4 border-cyan-500">
                                    "{msg.message}"
                                </div>
                                <div className="mt-4 flex justify-end">
                                    <a href={`mailto:${msg.email}`} className="text-sm font-bold text-cyan-600 hover:underline">Reply to Buyer</a>
                                </div>
                            </div>
                        )) : (
                            <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                                <div className="text-5xl mb-4">💬</div>
                                <p className="text-gray-500 dark:text-gray-400 text-lg">No feedback messages yet.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Profile Tab */}
            {activeTab === "profile" && (
                <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div className="bg-gradient-to-r from-cyan-500 to-blue-600 h-32 relative"></div>
                    <div className="px-8 pb-8">
                        <div className="flex flex-col items-center -mt-16 mb-6">
                            <div
                                className="w-32 h-32 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center p-2 shadow-xl cursor-pointer hover:scale-105 transition-transform relative group"
                                onClick={handleProfilePicClick}
                            >
                                {user?.profilePicture ? (
                                    <img src={getImageUrl(user.profilePicture)} alt="Profile" className="w-full h-full object-cover rounded-full border-4 border-white dark:border-gray-800" />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-cyan-100 to-blue-100 dark:from-cyan-900 dark:to-blue-900 rounded-full flex items-center justify-center text-5xl font-bold text-cyan-600 dark:text-cyan-300 border-4 border-white dark:border-gray-800">
                                        {user?.name?.charAt(0).toUpperCase() || 'S'}
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-white text-xs font-bold bg-black/50 px-2 py-1 rounded">Change</span>
                                </div>
                            </div>
                            <input
                                type="file"
                                ref={hiddenFileInput}
                                onChange={uploadProfilePic}
                                className="hidden"
                                accept="image/*"
                            />
                        </div>

                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">{user?.name}</h2>
                            <p className="text-gray-500 dark:text-gray-400 mt-1">{user?.email}</p>
                            <div className="mt-3 inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800">
                                verified seller
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        className={`w-full p-3 ${editProfileMode ? 'bg-white dark:bg-gray-800 border-cyan-500 ring-2 ring-cyan-200' : 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600'} border rounded-lg dark:text-white transition-all`}
                                        value={editProfileMode ? profileData.name : user?.name}
                                        onChange={handleProfileInputChange}
                                        readOnly={!editProfileMode}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Contact Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        className={`w-full p-3 ${editProfileMode ? 'bg-white dark:bg-gray-800 border-cyan-500 ring-2 ring-cyan-200' : 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600'} border rounded-lg dark:text-white transition-all`}
                                        value={editProfileMode ? profileData.email : user?.email}
                                        onChange={handleProfileInputChange}
                                        readOnly={!editProfileMode}
                                    />
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-end space-x-4">
                                {editProfileMode ? (
                                    <>
                                        <button onClick={() => setEditProfileMode(false)} className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white px-6 py-2 rounded-lg font-bold shadow hover:shadow-md transition">
                                            Cancel
                                        </button>
                                        <button onClick={handleSaveProfile} className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-2 rounded-lg font-bold shadow hover:shadow-md transition">
                                            Save Changes
                                        </button>
                                    </>
                                ) : (
                                    <button onClick={() => setEditProfileMode(true)} className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-6 py-2 rounded-lg font-bold shadow hover:shadow-md transition">
                                        Edit Profile
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SellerDashboard;
