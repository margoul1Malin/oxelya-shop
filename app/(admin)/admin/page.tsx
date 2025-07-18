'use client';

import { useEffect, useState, useCallback } from 'react';
import { 
  Users, 
  Package, 
  Settings, 
  PlusCircle,
  Mail,
  ShoppingBag,
  Scale,
  FileText
} from 'lucide-react';
import ProductForm from '../../../components/admin/ProductForm';
import UserForm from '../../../components/admin/UserForm';
import ProductsTable from '../../../components/admin/ProductsTable';
import UsersTable from '../../../components/admin/UsersTable';
import MessagesTable from '../../../components/admin/MessagesTable';
import OrdersTable from '../../../components/admin/OrdersTable';
import LegalAcceptancesTable from '../../../components/admin/LegalAcceptancesTable';
import InvoicesTable from '../../../components/admin/InvoicesTable';
import { toast } from 'react-hot-toast';
import { Product, User, Message, Order, BaseMessage } from '../../../types';
import { User as PrismaUser } from '@prisma/client';

const validateMessage = (message: any): message is Message => {
  return message && 
    message.user && 
    typeof message.user.name === 'string' && 
    typeof message.user.email === 'string';
};

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('products');
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<PrismaUser[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [showProductForm, setShowProductForm] = useState(false);
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingUser, setEditingUser] = useState<PrismaUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      let response;
      let data;

      switch (activeTab) {
        case 'products':
          response = await fetch('/api/admin/products');
          if (!response.ok) throw new Error('Erreur chargement produits');
          data = await response.json();
          setProducts(Array.isArray(data) ? data : []);
          break;

        case 'users':
          response = await fetch('/api/admin/users');
          if (!response.ok) throw new Error('Erreur chargement utilisateurs');
          data = await response.json();
          setUsers(data);
          break;

        case 'messages':
          response = await fetch('/api/admin/messages');
          if (!response.ok) throw new Error('Erreur chargement messages');
          data = await response.json();
          const validMessages = (data || []).filter(validateMessage);
          setMessages(validMessages);
          break;

        case 'orders':
          response = await fetch('/api/admin/orders');
          if (!response.ok) throw new Error('Erreur chargement commandes');
          data = await response.json();
          setOrders(Array.isArray(data) ? data : []);
          break;
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDeleteUser = async (userId: string) => {
    // Cette fonction peut être simplifiée car UsersTable gère maintenant la suppression
    console.log('Suppression utilisateur:', userId);
  };

  const handleEditUser = async (userId: string, userData: Partial<PrismaUser>) => {
    // Cette fonction peut être simplifiée car UsersTable gère maintenant l'édition
    console.log('Édition utilisateur:', userId, userData);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setActiveTab('products')}
          className={`flex items-center px-4 py-2 rounded-lg ${
            activeTab === 'products'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
          }`}
        >
          <Package className="w-5 h-5 mr-2" />
          Produits
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center px-4 py-2 rounded-lg ${
            activeTab === 'users'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
          }`}
        >
          <Users className="w-5 h-5 mr-2" />
          Utilisateurs
        </button>
        <button
          onClick={() => setActiveTab('messages')}
          className={`flex items-center px-4 py-2 rounded-lg ${
            activeTab === 'messages'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
          }`}
        >
          <Mail className="w-5 h-5 mr-2" />
          Messages
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center px-4 py-2 rounded-lg ${
            activeTab === 'orders'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
          }`}
        >
          <ShoppingBag className="w-5 h-5 mr-2" />
          Commandes
        </button>
        <button
          onClick={() => setActiveTab('legal')}
          className={`flex items-center px-4 py-2 rounded-lg ${
            activeTab === 'legal'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
          }`}
        >
          <Scale className="w-5 h-5 mr-2" />
          Acceptations Légales
        </button>
        <button
          onClick={() => setActiveTab('invoices')}
          className={`flex items-center px-4 py-2 rounded-lg ${
            activeTab === 'invoices'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
          }`}
        >
          <FileText className="w-5 h-5 mr-2" />
          Factures
        </button>
      </div>

      <div className="mt-6">
        {activeTab === 'products' && (
          <>
            <div className="flex justify-between items-center mb-4">
              <button
                onClick={() => setShowProductForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <PlusCircle className="w-5 h-5" />
                Nouveau Produit
              </button>
            </div>
            <ProductsTable
              products={products}
              onProductUpdate={fetchData}
            />
          </>
        )}

        {activeTab === 'users' && (
          <>
            <div className="flex justify-between items-center mb-4">
              <button
                onClick={() => setShowUserForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <PlusCircle className="w-5 h-5" />
                Nouvel Utilisateur
              </button>
            </div>
            <UsersTable 
              users={users}
              isLoading={loading}
              onUserUpdate={fetchData}
            />
          </>
        )}

        {activeTab === 'messages' && (
          <MessagesTable
            messages={messages}
            onMessageUpdate={fetchData}
            isLoading={isLoading}
          />
        )}

        {activeTab === 'orders' && (
          <OrdersTable 
            orders={orders} 
            onOrderUpdate={fetchData}
          />
        )}

        {activeTab === 'legal' && (
          <LegalAcceptancesTable />
        )}

        {activeTab === 'invoices' && (
          <InvoicesTable />
        )}

        {showProductForm && (
          <ProductForm
            onClose={() => setShowProductForm(false)}
            onSuccess={fetchData}
          />
        )}

        {showUserForm && (
          <UserForm
            onClose={() => setShowUserForm(false)}
            onSuccess={fetchData}
          />
        )}
      </div>
    </div>
  );
} 