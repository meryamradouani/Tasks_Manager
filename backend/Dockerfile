FROM node:20-slim

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm ci --only=production

# Copier le reste des fichiers
COPY . .

# Créer le dossier uploads
RUN mkdir -p uploads

# Exposer le port 5000
EXPOSE 5000


# Démarrer l'application
CMD ["npm", "start"]