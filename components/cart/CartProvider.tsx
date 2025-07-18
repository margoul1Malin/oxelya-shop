'use client';

import React, { createContext, useContext, useReducer, useEffect, useCallback, useRef } from 'react';

interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

interface CartState {
  items: CartItem[];
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'HYDRATE'; payload: CartState };

export const CartContext = createContext<{
  state: CartState;
  dispatch: React.Dispatch<CartAction>;
} | undefined>(undefined);

const initialState: CartState = {
  items: []
};

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM':
      const existingItem = state.items.find(item => item.id === action.payload.id);
      if (existingItem) {
        return {
          ...state,
          items: state.items.map(item =>
            item.id === action.payload.id
              ? { ...item, quantity: item.quantity + (action.payload.quantity || 1) }
              : item
          )
        };
      }
      return {
        ...state,
        items: [...state.items, { ...action.payload, quantity: action.payload.quantity || 1 }]
      };

    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload)
      };

    case 'UPDATE_QUANTITY':
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        )
      };

    case 'CLEAR_CART':
      return {
        ...state,
        items: []
      };

    case 'HYDRATE':
      return action.payload;

    default:
      return state;
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const isInitialized = useRef(false);

  // Charger le panier au montage du composant
  useEffect(() => {
    if (typeof window !== 'undefined' && !isInitialized.current) {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        try {
          const parsedCart = JSON.parse(savedCart);
          // Vérifier que les données sont valides
          if (parsedCart && parsedCart.items && Array.isArray(parsedCart.items)) {
            dispatch({ type: 'HYDRATE', payload: parsedCart });
          }
        } catch (error) {
          console.error('Erreur lors de la lecture du panier:', error);
          localStorage.removeItem('cart');
        }
      }
      isInitialized.current = true;
    }
  }, []);

  // Sauvegarder le panier dans localStorage quand il change
  useEffect(() => {
    if (typeof window !== 'undefined' && isInitialized.current) {
      try {
        localStorage.setItem('cart', JSON.stringify(state));
      } catch (error) {
        console.error('Erreur lors de la sauvegarde du panier:', error);
      }
    }
  }, [state]);

  return (
    <CartContext.Provider value={{ state, dispatch }}>
      {children}
    </CartContext.Provider>
  );
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

  return {
    ...context,
    addItem,
    removeItem
  };
} 