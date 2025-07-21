import React, { useState } from 'react';
import { User, Mail, Building, Shield, Key, Save, Eye, EyeOff } from 'lucide-react';
import { useAuthContext } from '../components/AuthProvider';

export default function Profile() {
  const { user } = useAuthContext();
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [profileData, setProfileData] = useState({
    fullName: user?.user_metadata?.full_name || '',
    companyName: user?.user_metadata?.company_name || '',
    email: user?.email || '',
    phone: user?.user_metadata?.phone || '',
    address: user?.user_metadata?.address || '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveProfile = async () => {
    try {
      // Here you would typically call your API to update the profile
      console.log('Saving profile:', profileData);
      setIsEditing(false);
      // Show success message
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Les nouveaux mots de passe ne correspondent pas');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      alert('Le nouveau mot de passe doit contenir au moins 6 caractères');
      return;
    }

    try {
      // Here you would typically call your API to change the password
      console.log('Changing password');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordForm(false);
      alert('Mot de passe modifié avec succès');
    } catch (error) {
      console.error('Error changing password:', error);
      alert('Erreur lors du changement de mot de passe');
    }
  };

  const getRoleBadge = () => {
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
        <User className="w-4 h-4" />
        Utilisateur
      </span>
    );
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profil Utilisateur</h1>
          <p className="text-gray-600">Gérer vos informations personnelles et paramètres</p>
        </div>
        {getRoleBadge()}
      </div>

      {/* Profile Information */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Informations Personnelles</h3>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition-colors"
              >
                Modifier
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleSaveProfile}
                  className="bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition-colors flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Sauvegarder
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Annuler
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom Complet
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="fullName"
                  value={profileData.fullName}
                  onChange={handleProfileChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900 py-2">{profileData.fullName || 'Non renseigné'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-400" />
                <p className="text-gray-900 py-2">{profileData.email}</p>
              </div>
              <p className="text-xs text-gray-500">L'email ne peut pas être modifié</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Entreprise
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="companyName"
                  value={profileData.companyName}
                  onChange={handleProfileChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              ) : (
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-gray-400" />
                  <p className="text-gray-900 py-2">{profileData.companyName || 'Non renseigné'}</p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Téléphone
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  name="phone"
                  value={profileData.phone}
                  onChange={handleProfileChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="+33 1 23 45 67 89"
                />
              ) : (
                <p className="text-gray-900 py-2">{profileData.phone || 'Non renseigné'}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adresse
              </label>
              {isEditing ? (
                <textarea
                  name="address"
                  value={profileData.address}
                  onChange={handleProfileChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Adresse complète"
                />
              ) : (
                <p className="text-gray-900 py-2">{profileData.address || 'Non renseigné'}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Security Settings */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Sécurité</h3>
              <p className="text-sm text-gray-600">Gérer votre mot de passe et paramètres de sécurité</p>
            </div>
            {!showPasswordForm && (
              <button
                onClick={() => setShowPasswordForm(true)}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
              >
                <Key className="w-4 h-4" />
                Changer le Mot de Passe
              </button>
            )}
          </div>
        </div>

        {showPasswordForm && (
          <div className="p-6">
            <div className="max-w-md space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mot de Passe Actuel
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Entrez votre mot de passe actuel"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nouveau Mot de Passe
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Entrez votre nouveau mot de passe"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmer le Nouveau Mot de Passe
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Confirmez votre nouveau mot de passe"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleChangePassword}
                  className="bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition-colors"
                >
                  Changer le Mot de Passe
                </button>
                <button
                  onClick={() => {
                    setShowPasswordForm(false);
                    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                  }}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Role Information */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations de Rôle</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Rôle actuel:</span>
              {getRoleBadge()}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Permissions:</span>
              <div className="text-sm text-gray-900">
                Accès en lecture seule
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Dernière connexion:</span>
              <span className="text-sm text-gray-900">
                {new Date().toLocaleDateString('fr-FR')} à {new Date().toLocaleTimeString('fr-FR')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}