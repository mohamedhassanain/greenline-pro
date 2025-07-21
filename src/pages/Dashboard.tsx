import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Package, Clock, AlertTriangle, CheckCircle, Users } from 'lucide-react';
import TouchOptimizedCard from '../components/TouchOptimizedCard';
import NotificationBell from '../components/NotificationBell';
import { usePWA } from '../hooks/usePWA';
import { useNavigate } from 'react-router-dom';
import { orderService } from '../services/orderService';
import { useNotifications } from '../contexts/NotificationContext';
import { inventoryService } from '../services/inventoryService'; // à adapter selon ton projet

export default function Dashboard() {
  const { showNotification } = usePWA();
  const navigate = useNavigate();
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [productionData, setProductionData] = useState<any[]>([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [activeOrders, setActiveOrders] = useState(0);
  const [completedToday, setCompletedToday] = useState(0);
  const [urgentOrders, setUrgentOrders] = useState(0);
  const [statusData, setStatusData] = useState([
    { name: 'Completed', value: 0, color: '#10B981' },
    { name: 'In Progress', value: 0, color: '#3B82F6' },
    { name: 'Pending', value: 0, color: '#F59E0B' },
  ]);
  const { addNotification } = useNotifications();

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoadingOrders(true);
      setOrdersError(null);
      try {
        const orders = await orderService.getOrders();
        
        // Calculer les statistiques des cartes
        setTotalOrders(orders?.length || 0);
        setActiveOrders(orders?.filter(o => o.status === 'En cours').length || 0);
        
        // Commandes terminées aujourd'hui
        const today = new Date().toISOString().split('T')[0];
        setCompletedToday(
          orders?.filter(o => 
            o.status === 'Terminé' && 
            o.updated_at?.split('T')[0] === today
          ).length || 0
        );
        
        // Commandes urgentes (priorité haute)
        setUrgentOrders(orders?.filter(o => o.priority === 'High').length || 0);
        
        // Map backend fields to expected fields for display, take 4 most recent
        setRecentOrders(
          (orders || []).slice(0, 4).map((order: any) => ({
            id: order.order_number || order.id,
            client: order.client_name,
            status: order.status,
            progress: order.progress,
          }))
        );
        
        // Compute status counts for the pie chart
        const statusCounts = { Completed: 0, 'In Progress': 0, Pending: 0 };
        (orders || []).forEach((order: any) => {
          if (order.status === 'Terminé') statusCounts.Completed++;
          else if (order.status === 'En cours') statusCounts['In Progress']++;
          else if (order.status === 'En attente') statusCounts.Pending++;
        });
        setStatusData([
          { name: 'Terminé', value: statusCounts.Completed, color: '#10B981' },
          { name: 'En cours', value: statusCounts['In Progress'], color: '#3B82F6' },
          { name: 'En attente', value: statusCounts.Pending, color: '#F59E0B' },
        ]);
        
        // Générer les données de production par mois basées sur les vraies commandes
        const monthlyData = generateMonthlyProductionData(orders || []);
        setProductionData(monthlyData);

        // Récupération de l’inventaire
        const inventory = await inventoryService.getInventory();

        // Exemple : notification si stock bas
        inventory.forEach(item => {
          if (item.quantity < item.min_stock) {
            addNotification({
              type: 'warning',
              title: 'Stock bas',
              message: `Le stock de ${item.name} est inférieur au minimum (${item.quantity} restant)`,
            });
          }
        });

        // Exemple : notification si commande urgente
        orders.forEach(order => {
          if (order.priority === 'High' && order.status !== 'Terminé') {
            addNotification({
              type: 'urgent',
              title: 'Commande urgente',
              message: `Commande ${order.order_number} (${order.client_name}) à traiter en priorité !`,
            });
          }
        });
        
      } catch (err: any) {
        setOrdersError('Erreur lors du chargement des commandes');
      } finally {
        setLoadingOrders(false);
      }
    };
    fetchDashboardData();
  }, []);

  // Fonction pour générer les données de production mensuelles
  const generateMonthlyProductionData = (orders: any[]) => {
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
    const currentYear = new Date().getFullYear();
    const monthlyStats = [];
    
    // Obtenir les 6 derniers mois
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const month = date.getMonth();
      const year = date.getFullYear();
      
      const monthOrders = orders.filter(order => {
        const orderDate = new Date(order.created_at);
        return orderDate.getMonth() === month && orderDate.getFullYear() === year;
      });
      
      const completedOrders = monthOrders.filter(order => order.status === 'Terminé');
      
      monthlyStats.push({
        name: months[month],
        orders: monthOrders.length,
        completed: completedOrders.length
      });
    }
    
    return monthlyStats;
  };
  const handleCardClick = (cardType: string) => {
    switch (cardType) {
      case 'Total Orders':
        navigate('/orders');
        break;
      case 'Active Orders':
        navigate('/orders?status=in_progress');
        break;
      case 'Completed Today':
        navigate('/orders?status=completed');
        break;
      case 'Urgent Orders':
        navigate('/orders?priority=high');
        break;
      default:
        showNotification(`${cardType} Details`, {
          body: `View detailed information about ${cardType.toLowerCase()}`,
          tag: cardType.toLowerCase()
        });
    }
  };

  const handleOrderClick = (orderId: string) => {
    navigate(`/orders/${orderId}`);
  };
  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
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
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Production Dashboard</h1>
          <p className="text-sm md:text-base text-gray-600">Welcome back! Here's your production overview</p>
        </div>
        <div className="hidden md:block">
          <NotificationBell />
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        <TouchOptimizedCard
          title="Total Orders"
          value={totalOrders.toString()}
          change={totalOrders > 0 ? `+${Math.round((totalOrders / 100) * 12)}%` : "0%"}
          icon={Package}
          color="emerald"
          onClick={() => handleCardClick('Total Orders')}
        />
        <TouchOptimizedCard
          title="Active Orders"
          value={activeOrders.toString()}
          change={activeOrders > 0 ? `+${Math.round((activeOrders / 100) * 5)}%` : "0%"}
          icon={Clock}
          color="blue"
          onClick={() => handleCardClick('Active Orders')}
        />
        <TouchOptimizedCard
          title="Completed Today"
          value={completedToday.toString()}
          change={completedToday > 0 ? `+${Math.round((completedToday / 100) * 18)}%` : "0%"}
          icon={CheckCircle}
          color="green"
          onClick={() => handleCardClick('Completed Today')}
        />
        <TouchOptimizedCard
          title="Urgent Orders"
          value={urgentOrders.toString()}
          change={urgentOrders > 0 ? `-${Math.round((urgentOrders / 100) * 2)}%` : "0%"}
          icon={AlertTriangle}
          color="red"
          onClick={() => handleCardClick('Urgent Orders')}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-4">
            Aperçu de Production ({productionData.length > 0 ? 'Données Réelles' : 'Chargement...'})
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={productionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="orders" fill="#3B82F6" name="Commandes" />
              <Bar dataKey="completed" fill="#10B981" name="Terminées" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-4">Statut des Commandes</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, percent }) => percent !== undefined ? `${name} ${(percent * 100).toFixed(0)}%` : name}
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-base md:text-lg font-semibold text-gray-900">
            {loadingOrders ? 'Chargement...' : recentOrders.length > 0 ? `Orders (${recentOrders.length})` : 'No Recent Orders'}
          </h3>
        </div>
        <div className="overflow-x-auto touch-pan-x">
          {ordersError && <div className="p-6 text-center text-red-500">{ordersError}</div>}
          {!ordersError && (loadingOrders ? (
            <div className="p-6 text-center text-gray-500">Chargement des commandes...</div>
          ) : recentOrders.length > 0 ? (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Progress
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-4 md:px-6 py-3 md:py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <button 
                        onClick={() => handleOrderClick(order.id)}
                        className="text-emerald-600 hover:text-emerald-800 font-medium"
                      >
                        {order.id}
                      </button>
                    </td>
                    <td className="px-4 md:px-6 py-3 md:py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.client}
                    </td>
                    <td className="px-4 md:px-6 py-3 md:py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        order.status === 'Terminé' ? 'bg-green-100 text-green-800' :
                        order.status === 'En cours' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 md:px-6 py-3 md:py-4 whitespace-nowrap">
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
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-6 text-center text-gray-500">No recent orders to display.</div>
          ))}
        </div>
      </div>
    </div>
  );
}