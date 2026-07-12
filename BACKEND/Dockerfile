# Usar imagen oficial de Node.js
FROM node:18-alpine

# Establecer directorio de trabajo
WORKDIR /app

# Copiar package.json y package-lock.json (si existe)
COPY package*.json ./

# Instalar todas las dependencias (incluyendo devDependencies)
RUN npm install

# Copiar nodemon.json para configuración de hot-reload
COPY nodemon.json ./

# Exponer puerto
EXPOSE 3000

# Comando para iniciar con nodemon en desarrollo
CMD ["npm", "run", "dev"]
