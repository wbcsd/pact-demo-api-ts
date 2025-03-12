FROM node:20-alpine
WORKDIR /src
COPY package*.json ./
RUN npm install
COPY . ./
RUN npm run build
CMD ["node", "dist/app.js"]
EXPOSE 3000