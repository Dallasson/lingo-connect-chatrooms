
import { useState, useEffect } from 'react';

interface LanguageTranslations {
  [key: string]: {
    [key: string]: string;
  };
}

const translations: LanguageTranslations = {
  en: {
    'welcome': 'Welcome to LingoConnect',
    'rooms': 'Rooms',
    'profile': 'Profile',
    'settings': 'Settings',
    'messages': 'Messages',
    'contact': 'Contact',
    'sign_in': 'Sign In',
    'get_started': 'Get Started',
    'create_room': 'Create Room',
    'join_room': 'Join Room',
    'find_users': 'Find Users',
    'language_partners': 'Language Partners',
    'native_language': 'Native Language',
    'learning_language': 'Learning Language',
    'dark_mode': 'Dark Mode',
    'light_mode': 'Light Mode',
    'save_changes': 'Save Changes',
    'delete_account': 'Delete Account',
    'logout': 'Log Out'
  },
  es: {
    'welcome': 'Bienvenido a LingoConnect',
    'rooms': 'Salas',
    'profile': 'Perfil',
    'settings': 'Configuración',
    'messages': 'Mensajes',
    'contact': 'Contacto',
    'sign_in': 'Iniciar Sesión',
    'get_started': 'Comenzar',
    'create_room': 'Crear Sala',
    'join_room': 'Unirse a Sala',
    'find_users': 'Encontrar Usuarios',
    'language_partners': 'Compañeros de Idioma',
    'native_language': 'Idioma Nativo',
    'learning_language': 'Idioma que Aprendes',
    'dark_mode': 'Modo Oscuro',
    'light_mode': 'Modo Claro',
    'save_changes': 'Guardar Cambios',
    'delete_account': 'Eliminar Cuenta',
    'logout': 'Cerrar Sesión'
  },
  fr: {
    'welcome': 'Bienvenue sur LingoConnect',
    'rooms': 'Salles',
    'profile': 'Profil',
    'settings': 'Paramètres',
    'messages': 'Messages',
    'contact': 'Contact',
    'sign_in': 'Se Connecter',
    'get_started': 'Commencer',
    'create_room': 'Créer une Salle',
    'join_room': 'Rejoindre une Salle',
    'find_users': 'Trouver des Utilisateurs',
    'language_partners': 'Partenaires Linguistiques',
    'native_language': 'Langue Maternelle',
    'learning_language': 'Langue Apprise',
    'dark_mode': 'Mode Sombre',
    'light_mode': 'Mode Clair',
    'save_changes': 'Sauvegarder',
    'delete_account': 'Supprimer le Compte',
    'logout': 'Se Déconnecter'
  }
};

export const useLanguage = () => {
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    return localStorage.getItem('language') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('language', currentLanguage);
  }, [currentLanguage]);

  const t = (key: string): string => {
    return translations[currentLanguage]?.[key] || translations['en'][key] || key;
  };

  const changeLanguage = (language: string) => {
    setCurrentLanguage(language);
  };

  return {
    currentLanguage,
    changeLanguage,
    t
  };
};
