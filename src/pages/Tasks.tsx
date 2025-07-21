import React, { useState } from 'react';
import { Plus, CheckCircle, User, Trash2, Eye, RotateCcw } from 'lucide-react';
import { useAuthContext } from '../components/AuthProvider';
import { taskService } from '../services/taskService';

// Exemple de tâches initiales
const initialTasks = [
  {
    id: 1,
    title: 'Préparer le rapport mensuel',
    description: 'Compiler les données de production pour le mois en cours.',
    assignedTo: 'user',
    status: 'En cours',
    completedBy: undefined,
  },
  {
    id: 2,
    title: 'Vérifier le stock de coton',
    description: 'S’assurer que le stock de coton est suffisant pour la prochaine commande.',
    assignedTo: 'user',
    status: 'En attente',
    completedBy: undefined,
  },
];

type TaskType = {
  id: number;
  title: string;
  description: string;
  assignedTo: string;
  status: string;
  completedBy?: string;
};

export default function Task() {
  const { user } = useAuthContext();
  const userRole = user?.user_metadata?.role || user?.role || 'user';
  const [tasks, setTasks] = useState<TaskType[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTask, setNewTask] = useState({ title: '', description: '', assignedTo: 'user' });
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  // Utilise l'email ou le nom de l'utilisateur connecté comme identifiant unique
  const currentUser = user?.email || user?.user_metadata?.full_name || user?.id || 'user';
  const [viewTask, setViewTask] = useState<TaskType | null>(null);

  // Charger les tâches depuis Supabase
  const fetchTasks = async () => {
    setLoading(true);
    try {
      const data = await taskService.getTasks();
      setTasks(data.map(t => ({
        id: t.id,
        title: t.title,
        description: t.description,
        assignedTo: t.assigned_to,
        status: t.status,
        completedBy: t.completed_by || undefined,
      })));
    } catch (e) {
      alert('Erreur lors du chargement des tâches');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchTasks();
  }, []);

  // Ajout d'une tâche (admin)
  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await taskService.addTask({
        title: newTask.title,
        description: newTask.description,
        assigned_to: newTask.assignedTo,
        status: 'En attente',
      });
      setNewTask({ title: '', description: '', assignedTo: 'user' });
      setIsAddTaskOpen(false);
      fetchTasks();
    } catch (e) {
      alert('Erreur lors de l\'ajout de la tâche');
    }
  };

  // Marquer une tâche comme terminée (user ou admin)
  const handleCompleteTask = async (taskId: number) => {
    const task = tasks.find(t => t.id === taskId);
    if (task && !task.title.trim()) {
      alert('Le titre de la tâche ne peut pas être vide pour la terminer.');
      return;
    }
    // Utiliser le nom complet, email ou id du validateur
    const validator = user?.user_metadata?.full_name || user?.email || user?.id || 'Utilisateur';
    try {
      await taskService.updateTask(taskId, { status: 'Terminée', completed_by: validator });
      fetchTasks();
    } catch (e) {
      alert('Erreur lors de la validation de la tâche');
    }
  };

  // Suppression d'une tâche (admin)
  const handleDeleteTask = async (taskId: number) => {
    try {
      await taskService.deleteTask(taskId);
      fetchTasks();
    } catch (e) {
      alert('Erreur lors de la suppression de la tâche');
    }
  };

  // Relancer une tâche (admin)
  const handleRestartTask = async (taskId: number) => {
    try {
      await taskService.updateTask(taskId, { status: 'En attente', completed_by: null });
      fetchTasks();
    } catch (e) {
      alert('Erreur lors de la relance de la tâche');
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Tâches</h1>
          <p className="text-gray-600">L'administrateur assigne des tâches, les utilisateurs les complètent</p>
        </div>
        {userRole === 'admin' || userRole === 'owner' ? (
          <button
            className="bg-emerald-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-emerald-600 transition-colors"
            onClick={() => setIsAddTaskOpen(true)}
          >
            <Plus className="w-5 h-5" />
            Nouvelle Tâche
          </button>
        ) : null}
      </div>

      {/* Liste des tâches */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        {loading ? (
          <div className="text-center text-gray-500">Chargement des tâches...</div>
        ) : tasks.length === 0 ? (
          <div className="text-center text-gray-500">Aucune tâche assignée</div>
        ) : (
          <ul className="space-y-4">
            {tasks.map(task => (
              <li key={task.id} className="flex items-center justify-between border-b pb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
                  <p className="text-sm text-gray-600">{task.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-xs text-gray-500">Assignée à : {task.assignedTo}</span>
                    <span className={`ml-4 px-2 py-1 text-xs rounded-full ${task.status === 'Terminée' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{task.status}</span>
                    {task.status === 'Terminée' && task.completedBy && (
                      <span className="ml-2 text-xs text-green-700">Validée par : {task.completedBy}</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  {/* Voir : visible pour tous */}
                  <button
                    onClick={() => setViewTask(task)}
                    className="p-2 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200"
                    title="Voir"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                  {/* Terminer : visible pour l'assigné OU admin/owner ET si non terminée */}
                  {(user && task.status !== 'Terminée') && (
                    <button
                      onClick={() => handleCompleteTask(task.id)}
                      className="p-2 bg-green-100 text-green-600 rounded-full hover:bg-green-200"
                      title="Terminer"
                    >
                      <CheckCircle className="w-5 h-5" />
                    </button>
                  )}
                  {/* Relancer : visible pour admin/owner ET si terminée */}
                  {(userRole === 'admin' || userRole === 'owner') && task.status === 'Terminée' && (
                    <button
                      onClick={() => handleRestartTask(task.id)}
                      className="p-2 bg-yellow-100 text-yellow-600 rounded-full hover:bg-yellow-200"
                      title="Relancer"
                    >
                      <RotateCcw className="w-5 h-5" />
                    </button>
                  )}
                  {/* Supprimer : visible pour admin/owner */}
                  {(userRole === 'admin' || userRole === 'owner') && (
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200"
                      title="Supprimer"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Modal d'ajout de tâche */}
      {isAddTaskOpen && (userRole === 'admin' || userRole === 'owner') && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
            <h2 className="text-lg font-bold mb-4">Nouvelle Tâche</h2>
            <form onSubmit={handleAddTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Titre</label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={newTask.description}
                  onChange={e => setNewTask({ ...newTask, description: e.target.value })}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Assigner à</label>
                <input
                  type="text"
                  value={newTask.assignedTo}
                  onChange={e => setNewTask({ ...newTask, assignedTo: e.target.value })}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                />
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-emerald-500 text-white py-2 px-4 rounded-md hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
                >
                  Ajouter
                </button>
                <button
                  type="button"
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
                  onClick={() => setIsAddTaskOpen(false)}
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de détail de tâche */}
      {viewTask && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700"
              onClick={() => setViewTask(null)}
            >
              <span className="text-xl">&times;</span>
            </button>
            <h2 className="text-lg font-bold mb-4">Détail de la Tâche</h2>
            <div className="space-y-2">
              <div><span className="font-semibold">Titre :</span> {viewTask.title}</div>
              <div><span className="font-semibold">Description :</span> {viewTask.description}</div>
              <div><span className="font-semibold">Assignée à :</span> {viewTask.assignedTo}</div>
              <div><span className="font-semibold">Statut :</span> {viewTask.status}</div>
              {viewTask.completedBy && (
                <div><span className="font-semibold">Validée par :</span> {viewTask.completedBy}</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}