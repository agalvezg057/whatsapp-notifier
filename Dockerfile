# Dockerfile
FROM node:22-alpine

# Instalar Chromium y dependencias
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    dumb-init

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install --production

COPY . .

# Definir el ejecutable de Chromium
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Comando por defecto
CMD ["dumb-init", "node", "index.js"]
