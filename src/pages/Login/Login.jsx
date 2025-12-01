import React, { useState } from 'react';
import { LogIn, UserPlus, Lock, User } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const LoginPage = ({ onLogin }) => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Effacer l'erreur du champ modifié
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Le nom d\'utilisateur est requis';
    }

    if (!isLoginMode && !formData.email.trim()) {
      newErrors.email = 'L\'email est requis';
    }

    if (!formData.password) {
      newErrors.password = 'Le mot de passe est requis';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    }

    if (!isLoginMode && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    
    try {
      await onLogin({
        username: formData.username,
        email: formData.email,
        password: formData.password
      });
    } catch (error) {
      setErrors({ submit: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    setFormData({
      username: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
    setErrors({});
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg p-8 w-full max-w-md shadow-2xl border border-gray-700">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mb-4 flex justify-center">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Lock className="text-white" size={32} />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">PSY2BIB</h1>
          <p className="text-gray-400">Chat Vidéo Sécurisé avec Chiffrement de Bout en Bout</p>
        </div>

        {/* Toggle Mode */}
        <div className="flex gap-2 mb-6 bg-gray-700 rounded-lg p-1">
          <button
            onClick={() => setIsLoginMode(true)}
            className={`flex-1 py-2 px-4 rounded-md transition-all duration-200 ${
              isLoginMode 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-300 hover:text-white'
            }`}
          >
            <LogIn className="inline mr-2" size={18} />
            Connexion
          </button>
          <button
            onClick={() => setIsLoginMode(false)}
            className={`flex-1 py-2 px-4 rounded-md transition-all duration-200 ${
              !isLoginMode 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-300 hover:text-white'
            }`}
          >
            <UserPlus className="inline mr-2" size={18} />
            Inscription
          </button>
        </div>

        {/* Form */}
        <div className="space-y-4">
          <Input
            name="username"
            placeholder="Nom d'utilisateur"
            value={formData.username}
            onChange={handleChange}
            onKeyPress={handleKeyPress}
            error={errors.username}
            icon={<User size={18} />}
            disabled={isLoading}
          />

          {!isLoginMode && (
            <Input
              name="email"
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              onKeyPress={handleKeyPress}
              error={errors.email}
              disabled={isLoading}
            />
          )}

          <Input
            name="password"
            type="password"
            placeholder="Mot de passe"
            value={formData.password}
            onChange={handleChange}
            onKeyPress={handleKeyPress}
            error={errors.password}
            icon={<Lock size={18} />}
            disabled={isLoading}
          />

          {!isLoginMode && (
            <Input
              name="confirmPassword"
              type="password"
              placeholder="Confirmer le mot de passe"
              value={formData.confirmPassword}
              onChange={handleChange}
              onKeyPress={handleKeyPress}
              error={errors.confirmPassword}
              icon={<Lock size={18} />}
              disabled={isLoading}
            />
          )}

          {errors.submit && (
            <div className="bg-red-500 bg-opacity-10 border border-red-500 text-red-500 px-4 py-2 rounded-lg text-sm">
              {errors.submit}
            </div>
          )}

          <Button 
            onClick={handleSubmit} 
            fullWidth
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Chargement...
              </span>
            ) : (
              <>
                {isLoginMode ? <LogIn className="inline mr-2" size={18} /> : <UserPlus className="inline mr-2" size={18} />}
                {isLoginMode ? 'Se connecter' : 'S\'inscrire'}
              </>
            )}
          </Button>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-400">
            {isLoginMode ? 'Pas encore de compte ?' : 'Déjà inscrit ?'}
            <button
              onClick={toggleMode}
              className="ml-2 text-blue-400 hover:text-blue-300 font-medium"
            >
              {isLoginMode ? 'S\'inscrire' : 'Se connecter'}
            </button>
          </p>
        </div>

        {/* Security Info */}
        <div className="mt-6 bg-gray-700 bg-opacity-50 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <Lock size={16} className="text-green-500 mt-1 flex-shrink-0" />
            <p className="text-xs text-gray-400">
              Vos données sont protégées par un chiffrement de bout en bout. 
              Vos conversations restent privées et sécurisées.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;