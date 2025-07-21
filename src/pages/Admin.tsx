import React from 'react';
import { useAuthContext } from '../components/AuthProvider';
import { useNavigate } from 'react-router-dom';

export default function Admin() {
  const { user } = useAuthContext();
  const userRole = user?.user_metadata?.role || user?.role || 'user';
  const navigate = useNavigate();

  React.useEffect(() => {
    if (userRole !== 'admin' && userRole !== 'owner') {
      navigate('/');
    }
  }, [userRole, navigate]);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Espace Administrateur</h1>
      <p className="text-gray-600">Bienvenue dans le tableau de bord d'administration. Ici, vous pouvez gérer les utilisateurs, les tâches et accéder à des fonctionnalités avancées réservées à l'admin.</p>
      <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
        <h2 className="text-lg font-semibold mb-4">Gestion des Utilisateurs</h2>
        <p className="text-gray-500 mb-2">(Fonctionnalité à venir) Liste des utilisateurs, gestion des rôles, etc.</p>
        <ul className="list-disc pl-6 text-gray-700">
          <li>Voir tous les utilisateurs</li>
          <li>Changer le rôle d'un utilisateur</li>
          <li>Supprimer un utilisateur</li>
        </ul>
      </div>
      <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
        <h2 className="text-lg font-semibold mb-4">Gestion avancée</h2>
        <ul className="list-disc pl-6 text-gray-700">
          <li>Accès à la gestion complète des tâches</li>
          <li>Accès à la gestion des fournisseurs, commandes, inventaire</li>
          <li>Statistiques et rapports avancés</li>
        </ul>
      </div>
    </div>
  );
} 