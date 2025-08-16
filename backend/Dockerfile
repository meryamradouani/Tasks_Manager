# Étape de construction
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5000

# Commande de démarrage :
# -> d'abord lancer init-admin.js pour créer admin
# -> ensuite démarrer le serveur
CMD ["sh", "-c", "node init-admin.js && node server.js"]
