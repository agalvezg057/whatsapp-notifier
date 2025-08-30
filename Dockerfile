# Usa una imagen base de Node.js con Alpine para un tamaño ligero
FROM node:22-alpine

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /usr/src/app

# Copia el archivo de manifiesto y de bloqueo para una instalación eficiente
COPY package*.json ./

# Instala las dependencias, incluyendo Chromium para Puppeteer
RUN apk add --no-cache chromium

# Instala las dependencias de Node.js
RUN npm install

# Copia el resto de los archivos del proyecto
COPY . .

# Expone el puerto que tu servidor Express usa
EXPOSE 3000

# Comando para iniciar la aplicación
CMD ["node", "index.js"]