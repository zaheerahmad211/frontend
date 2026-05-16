import React, { createContext, useState, useEffect, useContext } from "react";
import { useAuth } from "./AuthContext";
import axios from "axios";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState(() => {
    const storedCart = localStorage.getItem("cartItems");
    return storedCart ? JSON.parse(storedCart) : [];
  });

  // Sync to Local Storage
  useEffect(() => {
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
  }, [cartItems]);

  // Sync from DB on Login
  useEffect(() => {
    if (user && user.cart) {
      // Optional: Merge strategy could go here. For now, server cart takes precedence if it has items.
      if (user.cart.length > 0) {
        setCartItems(user.cart);
      } else if (cartItems.length > 0) {
        // If server cart is empty but local has items, sync local to server
        updateServerCart(cartItems);
      }
    }
  }, [user]);

  // Sync to DB on Change
  const updateServerCart = async (newCart) => {
    if (user && user.token) {
      try {
        const config = {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user.token}`,
          },
        };
        await axios.put('/api/auth/cart', { cart: newCart }, config);
      } catch (error) {
        console.error("Failed to sync cart to server:", error);
      }
    }
  };

  const addToCart = (product, quantity = 1) => {
    // FakeStoreAPI uses 'id', MongoDB uses '_id'
    const productId = product.id || product._id;

    const existItem = cartItems.find(
      (item) => item.product === productId
    );

    let newCartItems;

    if (existItem) {
      newCartItems = cartItems.map((item) =>
        item.product === existItem.product
          ? { ...item, quantity: item.quantity + quantity }
          : item
      );
    } else {
      newCartItems = [
        ...cartItems,
        {
          product: productId,
          name: product.name || product.title, // Handle both name/title
          image: product.image,
          price: product.price,
          countInStock: product.stock || 10,
          quantity,
          seller: product.seller || null, // Include seller ID
        },
      ];
    }

    setCartItems(newCartItems);
    updateServerCart(newCartItems);
  };

  const removeFromCart = (id) => {
    const newCartItems = cartItems.filter((item) => item.product !== id);
    setCartItems(newCartItems);
    updateServerCart(newCartItems);
  };

  const clearCart = () => {
    setCartItems([]);
    updateServerCart([]);
  };

  return (
    <CartContext.Provider
      value={{ cartItems, addToCart, removeFromCart, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
