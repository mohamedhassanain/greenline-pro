import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Eye, Edit, Trash2, X } from 'lucide-react';
import { Dialog, Transition } from '@headlessui/react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthContext } from '../components/AuthProvider';
import { orderService } from '../services/orderService';

export default function Orders() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [orders, setOrders] = useState<any[]>([]); // Utiliser le type Order si importé
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Tous');
  const [isNewOrderOpen, setIsNewOrderOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [formData, setFormData] = useState({
    client: '',
    product: '',
    quantity: '',
    unitPrice: '',
    deadline: '',
    priority: 'Medium',
    status: '', // Ajouté
  });
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [createOrderError, setCreateOrderError] = useState<string | null>(null);

  // État pour le chargement et les erreurs
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger les commandes depuis Supabase au montage
  useEffect(() => {
    console.log('Loading orders on component mount...');
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching orders from database...');
      const data = await orderService.getOrders();
      console.log('Orders fetched:', data);
      setOrders(data || []);
      if (!data || data.length === 0) {
        setError('Aucune commande trouvée dans la base Supabase.');
      }
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      setError('Erreur lors du chargement des commandes : ' + (error.message || JSON.stringify(error)));
    } finally {
      setLoading(false);
    }
  };

  // Handle URL parameters
  React.useEffect(() => {
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    
    if (status) {
      setStatusFilter(status === 'in_progress' ? 'En cours' : 
                     status === 'completed' ? 'Terminé' : 
                     status === 'pending' ? 'En attente' : 'Tous');
    }
  }, [searchParams]);

  // Ajout du mapping statut anglais <-> français
  const statusMap: Record<string, string> = {
    'pending': 'En attente',
    'in_progress': 'En cours',
    'completed': 'Terminé',
    'En attente': 'En attente',
    'En cours': 'En cours',
    'Terminé': 'Terminé',
  };

  const filteredOrders: any[] = orders.filter(order => {
    const matchesSearch = (order.client_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (order.id?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    // Utiliser le mapping pour comparer le statut affiché
    const orderStatus = statusMap[order.status] || order.status;
    const matchesStatus = statusFilter === 'Tous' || orderStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setIsViewModalOpen(true);
  };

  const handleEditOrder = (order) => {
    setSelectedOrder(order);
    setFormData({
      client: order.client_name,
      product: order.product_name,
      quantity: order.quantity.toString(),
      deadline: order.deadline,
      priority: order.priority,
      status: order.status || '', // Ajouté
    });
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (order) => {
    setOrderToDelete(order);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteOrder = async () => {
    if (orderToDelete) {
      try {
        await orderService.deleteOrder(orderToDelete.id);
        // Rafraîchir la liste depuis la base
        const refreshedOrders = await orderService.getOrders();
        setOrders(refreshedOrders || []);
        setOrderToDelete(null);
        setIsDeleteModalOpen(false);
      } catch (error: any) {
        alert('Erreur lors de la suppression : ' + (error.message || JSON.stringify(error)));
      }
    }
  };

  const cancelDelete = () => {
    setOrderToDelete(null);
    setIsDeleteModalOpen(false);
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingOrder(true);
    setCreateOrderError(null);
    
    // Correction : forcer le statut à "En attente" si non renseigné ou incohérent
    let status = formData.status;
    if (!status || !["En attente", "En cours", "Terminé"].includes(status)) {
      status = "En attente";
    }
    
    try {
      const newOrder = await orderService.createOrder({
        client_name: formData.client,
        product_name: formData.product,
        quantity: parseInt(formData.quantity),
        unit_price: parseFloat(formData.unitPrice) || 0,
        status: status, // Correction ici
        deadline: formData.deadline,
        priority: formData.priority,
      });
      console.log('Order created:', newOrder);
      // Rafraîchir complètement la liste depuis la base
      await fetchOrders();
      // Réinitialiser le formulaire et fermer le modal
      setFormData({ client: '', product: '', quantity: '', unitPrice: '', deadline: '', priority: 'Medium', status: '' });
      setIsNewOrderOpen(false);
      
    } catch (err: any) {
      console.error('Error creating order:', err);
      setCreateOrderError('Erreur lors de la création de la commande : ' + (err.message || JSON.stringify(err)));
    } finally {
      setCreatingOrder(false);
    }
  };

  const handleUpdateOrder = (e) => {
    e.preventDefault();
    const updatedOrders = orders.map(order => 
      order.id === selectedOrder.id 
        ? {
            ...order,
            client_name: formData.client,
            product_name: formData.product,
            quantity: parseInt(formData.quantity),
            deadline: formData.deadline,
            priority: formData.priority,
          }
        : order
    );
    
    setOrders(updatedOrders);
    setIsEditModalOpen(false);
    console.log('Commande mise à jour:', selectedOrder.id);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetForm = () => {
    setFormData({ client: '', product: '', quantity: '', unitPrice: '', deadline: '', priority: 'Medium', status: '' });
  };

  function getStatusColor(status: string) {
    switch (status) {
      case 'En attente':
        return 'bg-yellow-100 text-yellow-800';
      case 'Terminé':
        return 'bg-green-100 text-green-800';
      case 'En cours':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  function getPriorityColor(priority: string) {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'Low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  return (
    <div className="p-6 space-y-6">
      <button
        onClick={() => window.print()}
        style={{
          marginBottom: 16,
          padding: '8px 16px',
          background: '#2563eb',
          color: '#fff',
          border: 'none',
          borderRadius: 4,
          cursor: 'pointer',
          fontWeight: 'bold'
        }}
        className="print-btn"
      >
        🖨️ Imprimer la page
      </button>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Commandes</h1>
          <p className="text-gray-600">Gérer et suivre toutes les commandes clients</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setIsNewOrderOpen(true);
          }}
          className="bg-emerald-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-emerald-600 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nouvelle Commande
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher des commandes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              <option value="Tous">Tous les statuts</option>
              <option value="En attente">En attente</option>
              <option value="En cours">En cours</option>
              <option value="Terminé">Terminé</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-gray-500">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto mb-4"></div>
              <p className="text-lg mb-2">Chargement des commandes...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center text-red-500">
              <p className="text-lg mb-2">Erreur de chargement</p>
              <p className="text-sm mb-4">{error}</p>
              <button 
                onClick={fetchOrders}
                className="bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600"
              >
                Réessayer
              </button>
            </div>
          ) : orders.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p className="text-lg mb-2">Aucune commande trouvée</p>
              <p className="text-sm">Cliquez sur "Nouvelle Commande" pour créer votre première commande</p>
            </div>
          ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID Commande
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Produit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantité
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Progrès
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Échéance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priorité
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {(filteredOrders as any[]).map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {order.order_number}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.client_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.product_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(statusMap[order.status] || order.status)}`}>{statusMap[order.status] || order.status}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                        <div
                          className="bg-emerald-500 h-2 rounded-full"
                          style={{ width: `${order.progress}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600">{order.progress}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.deadline}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(order.priority)}`}>{order.priority}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewOrder(order);
                        }}
                        className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50 transition-colors"
                        title="Voir la commande"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditOrder(order);
                        }}
                        className="text-emerald-600 hover:text-emerald-800 p-1 rounded hover:bg-emerald-50 transition-colors"
                        title="Modifier la commande"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(order);
                        }}
                        className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 transition-colors"
                        title="Supprimer la commande"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          )}
        </div>
      </div>

      {/* New Order Modal */}
      <Transition appear show={isNewOrderOpen} as={React.Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          onClose={() => setIsNewOrderOpen(false)}
        >
          <Transition.Child
            as={React.Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={React.Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900 mb-4"
                  >
                    Créer une Nouvelle Commande
                  </Dialog.Title>
                  
                  <form onSubmit={handleCreateOrder} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Nom du Client
                      </label>
                      <input
                        type="text"
                        name="client"
                        value={formData.client}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                        placeholder="Entrez le nom du client"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Produit
                      </label>
                      <input
                        type="text"
                        name="product"
                        value={formData.product}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                        placeholder="Entrez le nom du produit"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Quantité
                      </label>
                      <input
                        type="number"
                        name="quantity"
                        value={formData.quantity}
                        onChange={handleInputChange}
                        required
                        min="1"
                        step="1"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                        placeholder="Entrez la quantité"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Prix Unitaire (€)
                      </label>
                      <input
                        type="number"
                        name="unitPrice"
                        value={formData.unitPrice || ''}
                        onChange={handleInputChange}
                        required
                        min="0"
                        step="0.01"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                        placeholder="Entrez le prix unitaire"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Échéance
                      </label>
                      <input
                        type="date"
                        name="deadline"
                        value={formData.deadline}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Priorité
                      </label>
                      <select 
                        name="priority"
                        value={formData.priority}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      >
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Low">Low</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Statut</label>
                      <select
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        value={formData.status}
                        onChange={e => setFormData({ ...formData, status: e.target.value })}
                      >
                        <option value="">Sélectionner un statut</option>
                        <option value="En attente">En attente</option>
                        <option value="En cours">En cours</option>
                        <option value="Terminé">Terminé</option>
                      </select>
                    </div>

                    <div className="mt-6 flex gap-3">
                      <button
                        type="submit"
                        className="flex-1 bg-emerald-500 text-white py-2 px-4 rounded-md hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
                        disabled={creatingOrder}
                      >
                        {creatingOrder ? 'Création...' : 'Créer la Commande'}
                      </button>
                      <button
                        type="button"
                        className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
                        onClick={() => setIsNewOrderOpen(false)}
                        disabled={creatingOrder}
                      >
                        Annuler
                      </button>
                    </div>
                    {createOrderError && <div className="text-red-500 text-sm mt-2">{createOrderError}</div>}
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Delete Confirmation Modal */}
      <Transition appear show={isDeleteModalOpen} as={React.Fragment}>
        <Dialog as="div" className="relative z-10" onClose={cancelDelete}>
          <Transition.Child
            as={React.Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={React.Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                      <Trash2 className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                        Supprimer la Commande
                      </Dialog.Title>
                      <p className="text-sm text-gray-500">
                        Cette action est irréversible
                      </p>
                    </div>
                  </div>
                  
                  {orderToDelete && (
                    <div className="mb-6">
                      <p className="text-sm text-gray-700">
                        Êtes-vous sûr de vouloir supprimer la commande <strong>{orderToDelete.id}</strong> de <strong>{orderToDelete.client_name}</strong> ?
                      </p>
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">
                          <strong>Produit:</strong> {orderToDelete.product_name}
                        </p>
                        <p className="text-sm text-gray-600">
                          <strong>Quantité:</strong> {orderToDelete.quantity}
                        </p>
                        <p className="text-sm text-gray-600">
                          <strong>Statut:</strong> {orderToDelete.status}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      type="button"
                      className="flex-1 bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
                      onClick={confirmDeleteOrder}
                    >
                      Oui, Supprimer
                    </button>
                    <button
                      type="button"
                      className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
                      onClick={cancelDelete}
                    >
                      Annuler
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
      {/* View Order Modal */}
      <Transition appear show={isViewModalOpen} as={React.Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => setIsViewModalOpen(false)}>
          <Transition.Child
            as={React.Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={React.Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                      Détails de la Commande - {selectedOrder?.id}
                    </Dialog.Title>
                    <button
                      onClick={() => setIsViewModalOpen(false)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  {selectedOrder && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Client</label>
                          <p className="text-sm text-gray-900 mt-1">{selectedOrder.client_name}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Statut</label>
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full mt-1 ${
                            selectedOrder.status === 'Terminé' ? 'bg-green-100 text-green-800' :
                            selectedOrder.status === 'En cours' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {selectedOrder.status}
                          </span>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Produit</label>
                          <p className="text-sm text-gray-900 mt-1">{selectedOrder.product_name}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Quantité</label>
                          <p className="text-sm text-gray-900 mt-1">{selectedOrder.quantity}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Échéance</label>
                          <p className="text-sm text-gray-900 mt-1">{selectedOrder.deadline}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Priorité</label>
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full mt-1 ${
                            selectedOrder.priority === 'High' ? 'bg-red-100 text-red-800' :
                            selectedOrder.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {selectedOrder.priority}
                          </span>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Progrès</label>
                        <div className="flex items-center">
                          <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                            <div
                              className="bg-emerald-500 h-2 rounded-full"
                              style={{ width: `${selectedOrder.progress}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-600">{selectedOrder.progress}%</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mt-6">
                    <button
                      type="button"
                      className="w-full bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
                      onClick={() => setIsViewModalOpen(false)}
                    >
                      Fermer
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Edit Order Modal */}
      <Transition appear show={isEditModalOpen} as={React.Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => setIsEditModalOpen(false)}>
          <Transition.Child
            as={React.Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={React.Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900 mb-4"
                  >
                    Modifier la Commande - {selectedOrder?.id}
                  </Dialog.Title>
                  
                  <form onSubmit={handleUpdateOrder} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Nom du Client
                      </label>
                      <input
                        type="text"
                        name="client"
                        value={formData.client}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Produit
                      </label>
                      <input
                        type="text"
                        name="product"
                        value={formData.product}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Quantité
                      </label>
                      <input
                        type="number"
                        name="quantity"
                        value={formData.quantity}
                        onChange={handleInputChange}
                        required
                        min="1"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Échéance
                      </label>
                      <input
                        type="date"
                        name="deadline"
                        value={formData.deadline}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Priorité
                      </label>
                      <select 
                        name="priority"
                        value={formData.priority}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      >
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Low">Low</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Statut</label>
                      <select
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        value={formData.status}
                        onChange={e => setFormData({ ...formData, status: e.target.value })}
                      >
                        <option value="">Sélectionner un statut</option>
                        <option value="En attente">En attente</option>
                        <option value="En cours">En cours</option>
                        <option value="Terminé">Terminé</option>
                      </select>
                    </div>

                    <div className="mt-6 flex gap-3">
                      <button
                        type="submit"
                        className="flex-1 bg-emerald-500 text-white py-2 px-4 rounded-md hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
                      >
                        Sauvegarder
                      </button>
                      <button
                        type="button"
                        className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
                        onClick={() => setIsEditModalOpen(false)}
                      >
                        Annuler
                      </button>
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
      {error && (
  <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-lg">
    <strong>Erreur :</strong> {error}
  </div>
)}
    </div>
  );
}