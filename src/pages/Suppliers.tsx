import React, { useState } from 'react';
import { Users, Phone, Mail, MapPin, Star, Plus, Search, Edit, Trash2, Eye, X } from 'lucide-react';
import { Dialog, Transition } from '@headlessui/react';
import { useAuthContext } from '../components/AuthProvider';
import { supplierService } from '../services/supplierService';

const initialSuppliers = [
  {
    id: 'SUP-001',
    name: 'Textile Mills Inc.',
    contact: 'John Smith',
    email: 'john@textilemills.com',
    phone: '+1 (555) 123-4567',
    address: '123 Industrial Ave, Manchester, UK',
    rating: 4.8,
    category: 'Raw Materials',
    lastOrder: '2024-01-15',
    reliability: 'Excellent',
    totalOrders: 45,
  },
  {
    id: 'SUP-002',
    name: 'Thread World',
    contact: 'Sarah Johnson',
    email: 'sarah@threadworld.com',
    phone: '+1 (555) 234-5678',
    address: '456 Craft Street, Birmingham, UK',
    rating: 4.2,
    category: 'Accessories',
    lastOrder: '2024-01-10',
    reliability: 'Good',
    totalOrders: 32,
  },
  {
    id: 'SUP-003',
    name: 'Button Factory',
    contact: 'Mike Wilson',
    email: 'mike@buttonfactory.com',
    phone: '+1 (555) 345-6789',
    address: '789 Production Rd, Leeds, UK',
    rating: 4.5,
    category: 'Accessories',
    lastOrder: '2024-01-20',
    reliability: 'Excellent',
    totalOrders: 28,
  },
  {
    id: 'SUP-004',
    name: 'Premium Silk Co.',
    contact: 'Emma Davis',
    email: 'emma@premiumsilk.com',
    phone: '+1 (555) 456-7890',
    address: '321 Luxury Lane, London, UK',
    rating: 4.9,
    category: 'Raw Materials',
    lastOrder: '2024-01-18',
    reliability: 'Excellent',
    totalOrders: 18,
  },
];

export default function Suppliers() {
  const { user, userRole } = useAuthContext();
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [isAddSupplierOpen, setIsAddSupplierOpen] = useState(false);
  const [isEditSupplierOpen, setIsEditSupplierOpen] = useState(false);
  const [isViewSupplierOpen, setIsViewSupplierOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [supplierToDelete, setSupplierToDelete] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    email: '',
    phone: '',
    address: '',
    category: 'Raw Materials',
    rating: '4.0',
    reliability: 'Good'
  });

  // Charger les fournisseurs depuis Supabase au montage
  React.useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await supplierService.getSuppliers();
      setSuppliers(data || []);
    } catch (err: any) {
      setError('Erreur lors du chargement des fournisseurs : ' + (err.message || err));
    } finally {
      setLoading(false);
    }
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
      contact: '',
      email: '',
      phone: '',
      address: '',
      category: 'Raw Materials',
      rating: '4.0',
      reliability: 'Good'
    });
  };

  const handleAddSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await supplierService.createSupplier({
        name: formData.name,
        contact_person: formData.contact,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        category: formData.category,
        rating: parseFloat(formData.rating),
        reliability: formData.reliability,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      await fetchSuppliers();
      resetForm();
      setIsAddSupplierOpen(false);
    } catch (err: any) {
      setError('Erreur lors de l\'ajout du fournisseur : ' + (err.message || err));
    }
  };

  const handleEditSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplier) return;
    try {
      await supplierService.updateSupplier(selectedSupplier.id, {
        name: formData.name,
        contact_person: formData.contact,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        category: formData.category,
        rating: parseFloat(formData.rating),
        reliability: formData.reliability,
        updated_at: new Date().toISOString(),
      });
      await fetchSuppliers();
      setIsEditSupplierOpen(false);
    } catch (err: any) {
      setError('Erreur lors de la modification du fournisseur : ' + (err.message || err));
    }
  };

  const handleDeleteClick = (supplier) => {
    setSupplierToDelete(supplier);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteSupplier = async () => {
    if (supplierToDelete) {
      try {
        await supplierService.deleteSupplier(supplierToDelete.id);
        await fetchSuppliers();
        setSupplierToDelete(null);
        setIsDeleteModalOpen(false);
      } catch (err: any) {
        setError('Erreur lors de la suppression du fournisseur : ' + (err.message || err));
      }
    }
  };

  const cancelDelete = () => {
    setSupplierToDelete(null);
    setIsDeleteModalOpen(false);
  };

  const handleViewSupplier = (supplier) => {
    setSelectedSupplier(supplier);
    setIsViewSupplierOpen(true);
  };

  const handleEditClick = (supplier) => {
    setSelectedSupplier(supplier);
    setFormData({
      name: supplier.name,
      contact: supplier.contact,
      email: supplier.email,
      phone: supplier.phone,
      address: supplier.address,
      category: supplier.category,
      rating: supplier.rating.toString(),
      reliability: supplier.reliability
    });
    setIsEditSupplierOpen(true);
  };

  const filteredSuppliers = suppliers.filter(supplier => {
    const matchesSearch = supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplier.contact.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || supplier.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getReliabilityColor = (reliability: string) => {
    switch (reliability) {
      case 'Excellent':
        return 'bg-green-100 text-green-800';
      case 'Good':
        return 'bg-blue-100 text-blue-800';
      case 'Average':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

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
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Fournisseurs</h1>
          <p className="text-gray-600">Gérer vos fournisseurs et sous-traitants</p>
          {userRole && (
            <p className="text-sm text-emerald-600 font-medium">
              Utilisateur - Droits complets
            </p>
          )}
        </div>
        <button 
          onClick={() => {
            resetForm();
            setIsAddSupplierOpen(true);
          }}
          className="bg-emerald-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-emerald-600 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Ajouter Fournisseur
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Suppliers</p>
              <p className="text-2xl font-semibold text-gray-900">{suppliers.length}</p>
            </div>
            <Users className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Rating</p>
              <p className="text-2xl font-semibold text-gray-900">
                {(suppliers.reduce((sum, s) => sum + s.rating, 0) / suppliers.length).toFixed(1)}
              </p>
            </div>
            <Star className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Raw Materials</p>
              <p className="text-2xl font-semibold text-gray-900">
                {suppliers.filter(s => s.category === 'Raw Materials').length}
              </p>
            </div>
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Accessories</p>
              <p className="text-2xl font-semibold text-gray-900">
                {suppliers.filter(s => s.category === 'Accessories').length}
              </p>
            </div>
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
            </div>
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
                placeholder="Search suppliers..."
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
              <option value="All">All Categories</option>
              <option value="Raw Materials">Raw Materials</option>
              <option value="Accessories">Accessories</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
          {filteredSuppliers.map((supplier) => (
            <div
              key={supplier.id}
              className="bg-gray-50 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{supplier.name}</h3>
                  <p className="text-sm text-gray-600">{supplier.contact}</p>
                </div>
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getReliabilityColor(supplier.reliability)}`}>
                  {supplier.reliability}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{supplier.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{supplier.phone}</span>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                  <span className="text-sm text-gray-600">{supplier.address}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="text-sm font-medium text-gray-900">{supplier.rating}</span>
                  </div>
                  <span className="text-sm text-gray-600">{supplier.totalOrders} orders</span>
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  Dernière commande: {supplier.lastOrder}
                </div>
                
                {/* Action buttons */}
                <div className="mt-4 pt-4 border-t border-gray-200 flex justify-end gap-2">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewSupplier(supplier);
                    }}
                    className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50 transition-colors"
                    title="Voir le fournisseur"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditClick(supplier);
                    }}
                    className="text-emerald-600 hover:text-emerald-800 p-1 rounded hover:bg-emerald-50 transition-colors"
                    title="Modifier le fournisseur"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick(supplier);
                    }}
                    className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 transition-colors"
                    title="Supprimer le fournisseur"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Supplier Modal */}
      <Transition appear show={isAddSupplierOpen} as={React.Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => setIsAddSupplierOpen(false)}>
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
                    Ajouter un Nouveau Fournisseur
                  </Dialog.Title>
                  
                  <form onSubmit={handleAddSupplier} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Nom de l'Entreprise</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                        placeholder="Nom de l'entreprise"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Personne de Contact</label>
                      <input
                        type="text"
                        name="contact"
                        value={formData.contact}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                        placeholder="Nom du contact"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                          placeholder="email@exemple.com"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Téléphone</label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                          placeholder="+33 1 23 45 67 89"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Adresse</label>
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        rows={2}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                        placeholder="Adresse complète"
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
                        <label className="block text-sm font-medium text-gray-700">Note (1-5)</label>
                        <input
                          type="number"
                          name="rating"
                          value={formData.rating}
                          onChange={handleInputChange}
                          min="1"
                          max="5"
                          step="0.1"
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Fiabilité</label>
                        <select 
                          name="reliability"
                          value={formData.reliability}
                          onChange={handleInputChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                        >
                          <option value="Poor">Faible</option>
                          <option value="Fair">Correcte</option>
                          <option value="Good">Bonne</option>
                          <option value="Excellent">Excellente</option>
                        </select>
                      </div>
                    </div>

                    <div className="mt-6 flex gap-3">
                      <button
                        type="submit"
                        className="flex-1 bg-emerald-500 text-white py-2 px-4 rounded-md hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
                      >
                        Ajouter le Fournisseur
                      </button>
                      <button
                        type="button"
                        className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
                        onClick={() => setIsAddSupplierOpen(false)}
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
                        Supprimer le Fournisseur
                      </Dialog.Title>
                      <p className="text-sm text-gray-500">
                        Cette action est irréversible
                      </p>
                    </div>
                  </div>
                  
                  {supplierToDelete && (
                    <div className="mb-6">
                      <p className="text-sm text-gray-700">
                        Êtes-vous sûr de vouloir supprimer le fournisseur <strong>{supplierToDelete.name}</strong> ?
                      </p>
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">
                          <strong>Contact:</strong> {supplierToDelete.contact}
                        </p>
                        <p className="text-sm text-gray-600">
                          <strong>Email:</strong> {supplierToDelete.email}
                        </p>
                        <p className="text-sm text-gray-600">
                          <strong>Catégorie:</strong> {supplierToDelete.category}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      type="button"
                      className="flex-1 bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
                      onClick={confirmDeleteSupplier}
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

      {/* View Supplier Modal */}
      <Transition appear show={isViewSupplierOpen} as={React.Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => setIsViewSupplierOpen(false)}>
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
                      Détails du Fournisseur - {selectedSupplier?.id}
                    </Dialog.Title>
                    <button
                      onClick={() => setIsViewSupplierOpen(false)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  {selectedSupplier && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Entreprise</label>
                          <p className="text-sm text-gray-900 mt-1">{selectedSupplier.name}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Contact</label>
                          <p className="text-sm text-gray-900 mt-1">{selectedSupplier.contact}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Email</label>
                          <p className="text-sm text-gray-900 mt-1">{selectedSupplier.email}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Téléphone</label>
                          <p className="text-sm text-gray-900 mt-1">{selectedSupplier.phone}</p>
                        </div>
                        <div className="col-span-2">
                          <label className="block text-sm font-medium text-gray-700">Adresse</label>
                          <p className="text-sm text-gray-900 mt-1">{selectedSupplier.address}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Catégorie</label>
                          <p className="text-sm text-gray-900 mt-1">{selectedSupplier.category}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Note</label>
                          <div className="flex items-center mt-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-current mr-1" />
                            <span className="text-sm text-gray-900">{selectedSupplier.rating}</span>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Fiabilité</label>
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full mt-1 ${getReliabilityColor(selectedSupplier.reliability)}`}>
                            {selectedSupplier.reliability}
                          </span>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Total Commandes</label>
                          <p className="text-sm text-gray-900 mt-1">{selectedSupplier.totalOrders}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mt-6">
                    <button
                      type="button"
                      className="w-full bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
                      onClick={() => setIsViewSupplierOpen(false)}
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

      {/* Edit Supplier Modal */}
      <Transition appear show={isEditSupplierOpen} as={React.Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => setIsEditSupplierOpen(false)}>
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
                    Modifier le Fournisseur - {selectedSupplier?.id}
                  </Dialog.Title>
                  
                  <form onSubmit={handleEditSupplier} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Nom de l'Entreprise</label>
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
                      <label className="block text-sm font-medium text-gray-700">Personne de Contact</label>
                      <input
                        type="text"
                        name="contact"
                        value={formData.contact}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Téléphone</label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Adresse</label>
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        rows={2}
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
                        <label className="block text-sm font-medium text-gray-700">Note (1-5)</label>
                        <input
                          type="number"
                          name="rating"
                          value={formData.rating}
                          onChange={handleInputChange}
                          min="1"
                          max="5"
                          step="0.1"
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Fiabilité</label>
                        <select 
                          name="reliability"
                          value={formData.reliability}
                          onChange={handleInputChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                        >
                          <option value="Poor">Faible</option>
                          <option value="Fair">Correcte</option>
                          <option value="Good">Bonne</option>
                          <option value="Excellent">Excellente</option>
                        </select>
                      </div>
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
                        onClick={() => setIsEditSupplierOpen(false)}
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