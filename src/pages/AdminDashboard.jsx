import React, { useState, useEffect } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL;
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("products");
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [monthlyStats, setMonthlyStats] = useState({ count: 0, revenue: 0 });
  const [formVisible, setFormVisible] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
    image: "",
    category: "",
    stock: "",
  });

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/");
    } else {
      fetchProducts();
      fetchOrders();
      fetchUsers();
      fetchMessages();
    }
  }, [user, navigate]);

  useEffect(() => {
    calculateMonthlyStats();
  }, [orders]);

  const fetchProducts = async () => {
    try {
      const { data } = await axios.get(`${API}/api/products`);
      setProducts(data);
    } catch (error) {
      console.error("Fetch products error:", error.response?.data || error.message);
    }
  };

  const fetchOrders = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(`${API}/api/orders`, config);
      setOrders(data);
    } catch (error) {
      console.error("Fetch orders error:", error.response?.data || error.message);
    }
  };

  const fetchUsers = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(`${API}/api/users`, config);
      setUsers(data);
    } catch (error) {
      console.error("Fetch users error:", error.response?.data || error.message);
    }
  };

  const fetchMessages = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(`${API}/api/messages`, config);
      setMessages(data);
    } catch (error) {
      console.error("Fetch messages error:", error.response?.data || error.message);
    }
  };

  const calculateMonthlyStats = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const stats = orders.reduce(
      (acc, order) => {
        const orderDate = new Date(order.createdAt);
        if (orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear) {
          acc.count += 1;
          acc.revenue += order.totalAmount;
        }
        return acc;
      },
      { count: 0, revenue: 0 }
    );

    setMonthlyStats(stats);
  };

  const handleDeleteProduct = async (id) => {
    if (!id) return alert("Invalid product ID.");
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const response = await axios.delete(`${API}/api/products/${id}`, config);
        console.log("Delete product response:", response.data);
        alert("Product Deleted!");
        fetchProducts();
      } catch (error) {
        console.error("Delete product error:", error.response?.data || error.message);
        alert("Error deleting product. Check backend route and ID.");
      }
    }
  };

  const handleDeleteOrder = async (id) => {
    if (!id) return alert("Invalid order ID.");
    if (window.confirm("Are you sure you want to delete this order?")) {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const response = await axios.delete(`${API}/api/orders/${id}`, config);
        console.log("Delete order response:", response.data);
        alert("Order Deleted!");
        fetchOrders();
      } catch (error) {
        console.error("Delete order error:", error.response?.data || error.message);
        alert("Error deleting order. Check backend route and ID.");
      }
    }
  };

  const handleDeleteUser = async (id) => {
    if (!id) return;
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        await axios.delete(`${API}/api/users/${id}`, config);
        alert("User Deleted!");
        fetchUsers(); // Refresh the list
      } catch (error) {
        console.error("Delete user error:", error.response?.data || error.message);
        alert("Failed to delete user.");
      }
    }
  };

  const handleDeleteMessage = async (id) => {
    if (window.confirm("Are you sure you want to delete this message?")) {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        // Assuming there's a delete route, if not we'll just skip this for now or add it later
        // For now let's just assume we can fetch them.
        await axios.delete(`${API}/api/messages/${id}`, config);
        alert("Message Deleted!");
        fetchMessages();
      } catch (error) {
        console.error("Delete message error:", error.response?.data || error.message);
      }
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    if (!id) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(`${API}/api/orders/${id}`, { status: newStatus }, config);
      fetchOrders();
    } catch (error) {
      console.error("Update order status error:", error.response?.data || error.message);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmitProduct = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.post(`${API}/api/products`, formData, config);
      setFormVisible(false);
      setFormData({ name: "", price: "", description: "", image: "", category: "", stock: "" });
      fetchProducts();
    } catch (error) {
      console.error("Add product error:", error.response?.data || error.message);
      alert("Error adding product. Check backend route and data.");
    }
  };

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="flex flex-col md:flex-row justify-between items-center mb-10">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
          Admin Dashboard
        </h1>
        <div className="mt-4 md:mt-0 px-4 py-1 bg-blue-50 dark:bg-gray-700/50 rounded-full text-sm font-medium text-blue-600 dark:text-blue-300 border border-blue-100 dark:border-gray-600">
          {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* Monthly Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg shadow-blue-500/30 relative overflow-hidden group">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-10 rounded-full group-hover:scale-110 transition-transform duration-500"></div>
          <div className="relative z-10">
            <p className="text-blue-100 text-sm font-semibold uppercase tracking-wider mb-1">Total Orders</p>
            <h3 className="text-4xl font-bold">{monthlyStats.count}</h3>
            <div className="mt-4 text-sm text-blue-100 flex items-center">
              <span className="bg-white/20 px-2 py-1 rounded text-xs mr-2">This Month</span>
              <span>{new Date().toLocaleString("default", { month: "long" })}</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg shadow-emerald-500/30 relative overflow-hidden group">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-10 rounded-full group-hover:scale-110 transition-transform duration-500"></div>
          <div className="relative z-10">
            <p className="text-emerald-100 text-sm font-semibold uppercase tracking-wider mb-1">Total Revenue</p>
            <h3 className="text-4xl font-bold">${monthlyStats.revenue.toFixed(2)}</h3>
            <div className="mt-4 text-sm text-emerald-100 flex items-center">
              <span className="bg-white/20 px-2 py-1 rounded text-xs mr-2">Accumulated</span>
              <span>Across {monthlyStats.count} Orders</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      {/* Tabs */}
      <div className="flex justify-center mb-10">
        <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-xl inline-flex shadow-inner">
          <button
            className={`px-6 py-2 rounded-lg transition-all duration-200 ${activeTab === "products" ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-300 font-bold shadow-md transform scale-105" : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"}`}
            onClick={() => setActiveTab("products")}
          >
            Products
          </button>
          <button
            className={`px-6 py-2 rounded-lg transition-all duration-200 ${activeTab === "orders" ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-300 font-bold shadow-md transform scale-105" : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"}`}
            onClick={() => setActiveTab("orders")}
          >
            Orders
          </button>
          <button
            className={`px-6 py-2 rounded-lg transition-all duration-200 ${activeTab === "users" ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-300 font-bold shadow-md transform scale-105" : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"}`}
            onClick={() => setActiveTab("users")}
          >
            Users
          </button>
          <button
            className={`px-6 py-2 rounded-lg transition-all duration-200 ${activeTab === "messages" ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-300 font-bold shadow-md transform scale-105" : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"}`}
            onClick={() => setActiveTab("messages")}
          >
            Feedback
          </button>
        </div>
      </div>

      {/* Products Tab */}
      {activeTab === "products" && (
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Product List</h2>
            <button onClick={() => setFormVisible(!formVisible)} className="bg-green-600 text-white px-4 py-2 rounded">
              {formVisible ? "Cancel" : "Add Product"}
            </button>
          </div>

          {formVisible && (
            <form onSubmit={handleSubmitProduct} className="bg-white dark:bg-gray-800 p-6 rounded shadow mb-8">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <input type="text" name="name" placeholder="Name" value={formData.name} onChange={handleInputChange} className="border p-2 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
                <input type="number" name="price" placeholder="Price" value={formData.price} onChange={handleInputChange} className="border p-2 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
              </div>
              <div className="mb-4">
                <input type="text" name="image" placeholder="Image URL" value={formData.image} onChange={handleInputChange} className="border p-2 rounded w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
              </div>
              <div className="mb-4">
                <textarea name="description" placeholder="Description" value={formData.description} onChange={handleInputChange} className="border p-2 rounded w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white" required></textarea>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <input type="text" name="category" placeholder="Category" value={formData.category} onChange={handleInputChange} className="border p-2 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
                <input type="number" name="stock" placeholder="Stock" value={formData.stock} onChange={handleInputChange} className="border p-2 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
              </div>
              <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded cursor-pointer">Submit</button>
            </form>
          )}

          {/* Products Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white dark:bg-gray-800 rounded shadow text-sm text-gray-900 dark:text-gray-100">
              <thead>
                <tr className="bg-gray-200 dark:bg-gray-700">
                  <th className="py-2 px-4 text-left">Image</th>
                  <th className="py-2 px-4 text-left">Name</th>
                  <th className="py-2 px-4 text-left">Price</th>
                  <th className="py-2 px-4 text-left">Details</th>
                  <th className="py-2 px-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product._id} className="border-t dark:border-gray-700">
                    <td className="py-2 px-4">
                      <img src={product.image} alt={product.name} className="w-12 h-12 object-cover rounded" />
                    </td>
                    <td className="py-2 px-4">{product.name}</td>
                    <td className="py-2 px-4">${product.price}</td>
                    <td className="py-2 px-4">Stock: {product.stock}</td>
                    <td className="py-2 px-4">
                      <button onClick={() => handleDeleteProduct(product._id)} className="text-red-600 hover:text-red-800 cursor-pointer">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === "orders" && (
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Order List</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white dark:bg-gray-800 rounded shadow text-sm text-gray-900 dark:text-gray-100">
              <thead>
                <tr className="bg-gray-200 dark:bg-gray-700">
                  <th className="py-2 px-4 text-left">Images</th>
                  <th className="py-2 px-4 text-left">User</th>
                  <th className="py-2 px-4 text-left">Date & Time</th>
                  <th className="py-2 px-4 text-left">Total</th>
                  <th className="py-2 px-4 text-left">Payment</th>
                  <th className="py-2 px-4 text-left">Status</th>
                  <th className="py-2 px-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id} className="border-t dark:border-gray-700">
                    <td className="py-2 px-4 flex -space-x-2 overflow-hidden">
                      {order.items.slice(0, 3).map((item, idx) => (
                        <img key={idx} src={item.image} alt={item.name} className="inline-block h-10 w-10 rounded-full ring-2 ring-white object-cover" title={item.name} />
                      ))}
                      {order.items.length > 3 && (
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-xs ring-2 ring-white">
                          +{order.items.length - 3}
                        </div>
                      )}
                    </td>
                    <td className="py-2 px-4">
                      <div className="flex items-center space-x-3">
                        {order.user && order.user.profilePicture ? (
                          <img src={order.user.profilePicture} alt={order.user.name} className="h-8 w-8 rounded-full object-cover shadow-sm border border-gray-200" />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500">
                            {order.user ? order.user.name.charAt(0).toUpperCase() : "?"}
                          </div>
                        )}
                        <div>
                          <div className="flex items-center space-x-2">
                            <p className="font-medium text-gray-900 dark:text-white">{order.user ? order.user.name : "Unknown"}</p>
                            {order.user && (
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                                order.user.role === 'seller' ? 'bg-orange-100 text-orange-600 border border-orange-200' : 'bg-blue-100 text-blue-600 border border-blue-200'
                              }`}>
                                {order.user.role || 'user'}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500">{order.user ? order.user.email : ""}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-2 px-4">
                      {new Date(order.createdAt).toLocaleDateString()} <br />
                      <span className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleTimeString()}</span>
                    </td>
                    <td className="py-2 px-4 font-bold">${order.totalAmount}</td>
                    <td className="py-2 px-4">
                      {order.paymentMethod ? (
                        <div>
                          <span className="font-semibold text-blue-600 dark:text-blue-400">{order.paymentMethod}</span>
                          <br />
                          {order.paymentResult && order.paymentResult.id && (
                            <span className="text-xs text-gray-500">TID: {order.paymentResult.id}</span>
                          )}
                        </div>
                      ) : (
                        "N/A"
                      )}
                    </td>
                    <td className="py-2 px-4">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        className={`border p-1 rounded cursor-pointer ${(order.status === "Delivered" || order.status === "Approved") ? "text-green-600 bg-green-50" :
                          order.status === "Cancelled" ? "text-red-600 bg-red-50" : "text-yellow-600 bg-yellow-50"
                          }`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Approved">Approved</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="py-2 px-4">
                      <button onClick={() => handleDeleteOrder(order._id)} className="text-red-600 hover:text-red-800 font-bold cursor-pointer">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {/* Users Tab */}
      {activeTab === "users" && (
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">User Management</h2>
            <div className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-4 py-2 rounded-full font-medium shadow-sm">
              Total Users: {users.length}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-gray-700 dark:text-gray-200">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 uppercase tracking-wider text-xs font-semibold">
                    <th className="py-4 px-6 text-left">User Profile</th>
                    <th className="py-4 px-6 text-left">Contact Info</th>
                    <th className="py-4 px-6 text-left">Role</th>
                    <th className="py-4 px-6 text-left">Joined Date</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {users.map((u) => (
                    <tr key={u._id} className="hover:bg-blue-50/50 dark:hover:bg-gray-700/50 transition-colors duration-200">
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-4">
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white font-bold shadow-md ${u.role === 'admin' ? 'bg-gradient-to-tr from-purple-500 to-indigo-500' : 'bg-gradient-to-tr from-blue-400 to-cyan-400'
                            }`}>
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-gray-900 dark:text-white">{u.name}</div>
                            <div className="text-xs text-gray-400 font-mono">ID: {u._id.substring(0, 8)}...</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center text-gray-600 dark:text-gray-300">
                          <svg className="w-4 h-4 mr-2 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                          {u.email}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${u.role === 'admin'
                          ? 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800'
                          : 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800'
                          }`}>
                          {u.role === 'admin' && <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.699-3.181a1 1 0 011.827 1.035l-1.74 3.258 5.604 2.241a1 1 0 01-1.248 1.874l-11.85-4.74A1 1 0 017 3V3a1 1 0 011-1h1zM3.486 4.98l.689 1.432-1.267.506a1 1 0 01-1.26-1.55l1.04-.492a1 1 0 01.798.104zM16 19h-2a1 1 0 01-1-1v-4H7v4a1 1 0 01-1 1H4a1 1 0 01-1-1V9h14v9a1 1 0 01-1 1z" /></svg>}
                          {u.role}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-gray-500 dark:text-gray-400">
                        {new Date(u.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                      <td className="py-4 px-6 text-right">
                        {u._id !== user._id && (
                          <button
                            onClick={() => handleDeleteUser(u._id)}
                            className="bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 hover:text-red-700 p-2 rounded-full transition duration-200 shadow-sm border border-red-100 dark:border-red-800/50"
                            title="Delete User"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {users.length === 0 && (
              <div className="p-12 text-center text-gray-500 dark:text-gray-400">
                <p className="text-lg">No users found.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Messages Tab */}
      {activeTab === "messages" && (
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Customer Feedback</h2>
            <div className="bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 px-4 py-2 rounded-full font-medium shadow-sm">
              Total Messages: {messages.length}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {messages.map((msg) => (
              <div key={msg._id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-shadow relative group">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-3">
                    {msg.user && msg.user.profilePicture ? (
                      <img src={msg.user.profilePicture} alt={msg.name} className="h-10 w-10 rounded-full object-cover shadow-md border border-indigo-100" />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-md">
                        {msg.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-bold text-gray-900 dark:text-white">{msg.name}</h4>
                        {msg.user && (
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                            msg.user.role === 'seller' ? 'bg-orange-100 text-orange-600 border border-orange-200' : 'bg-blue-100 text-blue-600 border border-blue-200'
                          }`}>
                            {msg.user.role || 'user'}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{msg.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-xs text-gray-400 font-medium">{new Date(msg.createdAt).toLocaleDateString()}</p>
                      <p className="text-[10px] text-gray-400">{new Date(msg.createdAt).toLocaleTimeString()}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteMessage(msg._id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700 p-2 rounded-full bg-red-50 dark:bg-red-900/20"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl text-gray-700 dark:text-gray-300 text-sm leading-relaxed border border-gray-100 dark:border-gray-600">
                  {msg.message}
                </div>
              </div>
            ))}
            {messages.length === 0 && (
              <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                <svg className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
                <p className="text-gray-500 dark:text-gray-400 font-medium">No feedback messages yet.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
