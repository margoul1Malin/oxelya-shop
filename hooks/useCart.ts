'use client';

import { useContext, useCallback } from 'react';
import { CartContext } from '../components/cart/CartProvider';

interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

export function useCart() {
  const context = useContext(CartContext);
  
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }

  const addItem = useCallback((item: CartItem) => {
    context.dispatch({ type: 'ADD_ITEM', payload: item });
  }, [context]);

  const removeItem = useCallback((id: string) => {
    context.dispatch({ type: 'REMOVE_ITEM', payload: id });
  }, [context]);

  const clearCart = useCallback(() => {
    context.dispatch({ type: 'CLEAR_CART' });
  }, [context]);

  return {
    state: context.state,
    dispatch: context.dispatch,
    addItem,
    removeItem,
    clearCart
  };
} 