import React, { useState, useEffect } from 'react';
import { Package, AlertTriangle, Plus, Search, Filter, Edit, Trash2, Eye, X } from 'lucide-react';
import { Dialog, Transition } from '@headlessui/react';
import { useAuthContext } from '../components/AuthProvider';
import { inventoryService, type Inventory } from '../services/inventoryService';

const initialInventory = [
  {
    id: 'INV-001',
    name: 'Cotton Fabric',
    category: 'Raw Materials',
    quantity: 500,
    unit: 'meters',
    minStock: 100,
    supplier: 'Textile Mills Inc.',
    lastRestocked: '2024-01-15',
    status: 'In Stock',
    unitCost: 12.50,
    location: 'Warehouse A',
  },
  {
    id: 'INV-002',
    name: 'Polyester Thread',
    category: 'Accessories',
    quantity: 25,
    unit: 'rolls',
    minStock: 50,
    supplier: 'Thread World',
    lastRestocked: '2024-01-10',
    status: 'Low Stock',
    unitCost: 8.75,
    location: 'Warehouse B',
  },
  {
    id: 'INV-003',
    name: 'Buttons (Metal)',
    category: 'Accessories',
    quantity: 2000,
    unit: 'pieces',
    minStock: 500,
    supplier: 'Button Factory',
    lastRestocked: '2024-01-20',
    status: 'In Stock',
    unitCost: 0.25,
    location: 'Warehouse A',
  },
  {
    id: 'INV-004',
    name: 'Silk Fabric',
    category: 'Raw Materials',
    quantity: 200,
    unit: 'meters',
    minStock: 100,
    supplier: 'Premium Silk Co.',
    lastRestocked: '2024-01-18',
    status: 'In Stock',
    unitCost: 45.00,
    location: 'Warehouse C',
  },
  {
    id: 'INV-005',
    name: 'Zippers',
    category: 'Accessories',
    quantity: 15,
    unit: 'pieces',
    minStock: 100,
    supplier: 'Zipper World',
    lastRestocked: '2024-01-08',
    status: 'Critical',
    unitCost: 2.50,
    location: 'Warehouse B',
  },
];

export default function Inventory() {
  const { user } = useAuthContext();
  const [inventory, setInventory] = useState<Inventory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [isEditItemOpen, setIsEditItemOpen] = useState(false);
  const [isViewItemOpen, setIsViewItemOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Raw Materials',
    quantity: '',
    unit: '',
    minStock: '',
    unitCost: '',
    supplier: '',
    location: '',
    status: '', // Ajouté
    priority: 'Moyenne', // Ajouté
  });

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const data = await inventoryService.getInventory();
      setInventory(data || []);
    } catch (error: any) {
      alert('Erreur lors du chargement de l\'inventaire : ' + (error.message || error));
    } finally {
      setLoading(false);
    }
  };

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  function getStatusColor(status: string) {
    switch (status) {
      case 'Disponible': return 'bg-green-100 text-green-800';
      case 'En cours': return 'bg-blue-100 text-blue-800';
      case 'Rupture': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
  function getPriorityColor(priority: string) {
    switch (priority) {
      case 'Haute': return 'bg-red-100 text-red-800';
      case 'Moyenne': return 'bg-yellow-100 text-yellow-800';
      case 'Faible': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  const calculateStatus = (quantity, minStock) => {
    if (quantity === 0) return 'Critical';
    if (quantity <= minStock * 0.5) return 'Critical';
    if (quantity <= minStock) return 'Low Stock';
    return 'In Stock';
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'Raw Materials',
      quantity: '',
      unit: '',
      minStock: '',
      unitCost: '',
      supplier: '',
      location: '',
      status: '', // Reset status
      priority: 'Moyenne', // Reset priority
    });
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Generate next sequential item_code
      const allItems = await inventoryService.getInventory();
      const codes = (allItems || []).map(item => item.item_code).filter(Boolean);
      let maxNum = 0;
      codes.forEach(code => {
        const match = code && code.match(/INV-(\d+)/);
        if (match) {
          const num = parseInt(match[1], 10);
          if (num > maxNum) maxNum = num;
        }
      });
      const nextCode = `INV-${String(maxNum + 1).padStart(3, '0')}`;
      await inventoryService.createInventoryItem({
        item_code: nextCode,
        name: formData.name,
        category: formData.category,
        quantity: parseInt(formData.quantity),
        unit: formData.unit,
        min_stock: parseInt(formData.minStock),
        unit_cost: parseFloat(formData.unitCost),
        location: formData.location,
        status: formData.status, // Ajouté
        priority: formData.priority, // Ajouté
      });
      await fetchInventory();
      resetForm();
      setIsAddItemOpen(false);
    } catch (error: any) {
      alert('Erreur lors de l\'ajout de l\'article : ' + (error.message || JSON.stringify(error)));
    }
  };

  const handleEditItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;
    try {
      await inventoryService.updateInventoryItem(selectedItem.id, {
        name: formData.name,
        category: formData.category,
        quantity: parseInt(formData.quantity),
        unit: formData.unit,
        min_stock: parseInt(formData.minStock),
        unit_cost: parseFloat(formData.unitCost),
        location: formData.location,
        status: formData.status, // Ajouté
        priority: formData.priority, // Ajouté
      });
      await fetchInventory();
      setIsEditItemOpen(false);
    } catch (error: any) {
      alert('Erreur lors de la modification de l\'article : ' + (error.message || JSON.stringify(error)));
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) {
      try {
        await inventoryService.deleteInventoryItem(itemId);
        await fetchInventory();
      } catch (error) {
        alert('Erreur lors de la suppression de l\'article');
      }
    }
  };

  const handleViewItem = (item) => {
    setSelectedItem(item);
    setIsViewItemOpen(true);
  };

  const handleEditClick = (item) => {
    setSelectedItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      quantity: item.quantity.toString(),
      unit: item.unit,
      minStock: (item.minStock ?? item.min_stock ?? '').toString(),
      unitCost: (item.unitCost ?? item.unit_cost ?? '').toString(),
      location: item.location ?? '',
      status: item.status ?? '', // Set status for editing
      priority: item.priority ?? '', // Set priority for editing
    });
    setIsEditItemOpen(true);
  };

  const lowStockItems = inventory.filter(item => item.quantity <= item.minStock);

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
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Stocks</h1>
          <p className="text-gray-600">Suivre et gérer vos niveaux de stock</p>
          <p className="text-sm text-gray-600 font-medium">
            Utilisateur - Droits complets
          </p>
        </div>
        <button 
          onClick={() => {
            resetForm();
            setIsAddItemOpen(true);
          }}
          className="bg-emerald-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-emerald-600 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Ajouter un Article
        </button>
      </div>

      {/* Alert for low stock items */}
      {lowStockItems.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
            <h3 className="text-sm font-medium text-yellow-800">
              Alerte Stock Faible: {lowStockItems.length} articles nécessitent un réapprovisionnement
            </h3>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Articles</p>
              <p className="text-2xl font-semibold text-gray-900">{inventory.length}</p>
            </div>
            <Package className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Articles en Stock Faible</p>
              <p className="text-2xl font-semibold text-yellow-600">{lowStockItems.length}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Valeur Totale</p>
              <p className="text-2xl font-semibold text-gray-900">
                €{inventory.reduce((sum, item) => sum + (item.quantity * (item.unitCost ?? item.unit_cost ?? 0)), 0).toLocaleString()}
              </p>
            </div>
            <Filter className="w-8 h-8 text-green-500" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher dans l'inventaire..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              <option value="All">Toutes les Catégories</option>
              <option value="Raw Materials">Matières Premières</option>
              <option value="Accessories">Accessoires</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID Article
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nom
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Catégorie
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantité
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock Min
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {/* Fournisseur */}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
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
              {filteredInventory.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {item.item_code}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.quantity} {item.unit}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.minStock} {item.unit}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {/* {item.supplier} */}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(item.status)}`}>{item.status}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(item.priority)}`}>{item.priority}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewItem(item);
                        }}
                        className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50 transition-colors"
                        title="Voir l'article"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditClick(item);
                        }}
                        className="text-emerald-600 hover:text-emerald-800 p-1 rounded hover:bg-emerald-50 transition-colors"
                        title="Modifier l'article"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteItem(item.id);
                        }}
                        className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 transition-colors"
                        title="Supprimer l'article"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Item Modal */}
      <Transition appear show={isAddItemOpen} as={React.Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => setIsAddItemOpen(false)}>
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
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 mb-4">
                    Ajouter un Nouvel Article
                  </Dialog.Title>
                  
                  <form onSubmit={handleAddItem} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Nom de l'Article</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                        placeholder="Entrez le nom de l'article"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Catégorie</label>
                      <select 
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                      >
                        <option value="Raw Materials">Matières Premières</option>
                        <option value="Accessories">Accessoires</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Quantité</label>
                        <input
                          type="number"
                          name="quantity"
                          value={formData.quantity}
                          onChange={handleInputChange}
                          required
                          min="0"
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Unité</label>
                        <input
                          type="text"
                          name="unit"
                          value={formData.unit}
                          onChange={handleInputChange}
                          required
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                          placeholder="ex: mètres, pièces"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Stock Minimum</label>
                        <input
                          type="number"
                          name="minStock"
                          value={formData.minStock}
                          onChange={handleInputChange}
                          required
                          min="0"
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Coût Unitaire (€)</label>
                        <input
                          type="number"
                          name="unitCost"
                          value={formData.unitCost}
                          onChange={handleInputChange}
                          required
                          min="0"
                          step="0.01"
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                        />
                      </div>
                    </div>
                    <div>
                      {/* Fournisseur (champ désactivé car non présent en base)
                      <label className="block text-sm font-medium text-gray-700">Fournisseur</label>
                      <input
                        type="text"
                        name="supplier"
                        value={formData.supplier}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                        placeholder="Nom du fournisseur"
                        disabled
                      />
                      */}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Emplacement</label>
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                        placeholder="ex: Entrepôt A"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Statut</label>
                      <select
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        value={formData.status}
                        onChange={e => setFormData({ ...formData, status: e.target.value })}
                      >
                        <option value="Disponible">Disponible</option>
                        <option value="En cours">En cours</option>
                        <option value="Rupture">Rupture</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Priorité</label>
                      <select
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        value={formData.priority}
                        onChange={e => setFormData({ ...formData, priority: e.target.value })}
                      >
                        <option value="Moyenne">Moyenne</option>
                        <option value="Haute">Haute</option>
                        <option value="Faible">Faible</option>
                      </select>
                    </div>

                    <div className="mt-6 flex gap-3">
                      <button
                        type="submit"
                        className="flex-1 bg-emerald-500 text-white py-2 px-4 rounded-md hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
                      >
                        Ajouter l'Article
                      </button>
                      <button
                        type="button"
                        className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
                        onClick={() => setIsAddItemOpen(false)}
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

      {/* View Item Modal */}
      <Transition appear show={isViewItemOpen} as={React.Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => setIsViewItemOpen(false)}>
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
                      Détails de l'Article - {selectedItem?.id}
                    </Dialog.Title>
                    <button
                      onClick={() => setIsViewItemOpen(false)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  {selectedItem && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Nom</label>
                          <p className="text-sm text-gray-900 mt-1">{selectedItem.name}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Catégorie</label>
                          <p className="text-sm text-gray-900 mt-1">{selectedItem.category}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Quantité</label>
                          <p className="text-sm text-gray-900 mt-1">{selectedItem.quantity} {selectedItem.unit}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Stock Minimum</label>
                          <p className="text-sm text-gray-900 mt-1">{selectedItem.minStock} {selectedItem.unit}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Coût Unitaire</label>
                          <p className="text-sm text-gray-900 mt-1">€{selectedItem.unitCost}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Valeur Totale</label>
                          <p className="text-sm text-gray-900 mt-1">€{(selectedItem.quantity * selectedItem.unitCost).toFixed(2)}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Emplacement</label>
                          <p className="text-sm text-gray-900 mt-1">{selectedItem.location}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Dernier Réapprovisionnement</label>
                          <p className="text-sm text-gray-900 mt-1">{selectedItem.lastRestocked}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Statut</label>
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full mt-1 ${getStatusColor(selectedItem.status)}`}>
                            {selectedItem.status}
                          </span>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Priorité</label>
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full mt-1 ${getPriorityColor(selectedItem.priority)}`}>
                            {selectedItem.priority}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mt-6">
                    <button
                      type="button"
                      className="w-full bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
                      onClick={() => setIsViewItemOpen(false)}
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

      {/* Edit Item Modal */}
      <Transition appear show={isEditItemOpen} as={React.Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => setIsEditItemOpen(false)}>
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
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 mb-4">
                    Modifier l'Article - {selectedItem?.id}
                  </Dialog.Title>
                  
                  <form onSubmit={handleEditItem} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Nom de l'Article</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Catégorie</label>
                      <select 
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                      >
                        <option value="Raw Materials">Matières Premières</option>
                        <option value="Accessories">Accessoires</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Quantité</label>
                        <input
                          type="number"
                          name="quantity"
                          value={formData.quantity}
                          onChange={handleInputChange}
                          required
                          min="0"
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Unité</label>
                        <input
                          type="text"
                          name="unit"
                          value={formData.unit}
                          onChange={handleInputChange}
                          required
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Stock Minimum</label>
                        <input
                          type="number"
                          name="minStock"
                          value={formData.minStock}
                          onChange={handleInputChange}
                          required
                          min="0"
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Coût Unitaire (€)</label>
                        <input
                          type="number"
                          name="unitCost"
                          value={formData.unitCost}
                          onChange={handleInputChange}
                          required
                          min="0"
                          step="0.01"
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Emplacement</label>
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Statut</label>
                      <select
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        value={formData.status}
                        onChange={e => setFormData({ ...formData, status: e.target.value })}
                      >
                        <option value="Disponible">Disponible</option>
                        <option value="En cours">En cours</option>
                        <option value="Rupture">Rupture</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Priorité</label>
                      <select
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        value={formData.priority}
                        onChange={e => setFormData({ ...formData, priority: e.target.value })}
                      >
                        <option value="Moyenne">Moyenne</option>
                        <option value="Haute">Haute</option>
                        <option value="Faible">Faible</option>
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
                        onClick={() => setIsEditItemOpen(false)}
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
    </div>
  );
}