// Configuration des URLs du serveur
export const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:8000';

// URL de l'image par défaut
export const DEFAULT_PROFILE_IMAGE = `${SERVER_URL}/uploads/utilisateur.png`;

// Configuration des API
export const API_BASE_URL = `${SERVER_URL}/api`; 