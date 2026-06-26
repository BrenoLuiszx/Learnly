# Learnly Mobile

Aplicativo mobile em React Native/Expo para a plataforma Learnly.

## Configuração

### 1. Instalar dependências
```bash
npm install
```

### 2. Configurar backend

Copie o arquivo de configuração:
```bash
# Windows
copy src\config\environment.example.js src\config\environment.js

# Mac/Linux
cp src/config/environment.example.js src/config/environment.js
```

Edite `src/config/environment.js` com o IP do backend:
```javascript
export const API_URL = 'http://SEU_IP:8080/Learnly/api';
```

> Para testar no celular físico, use o IP da rede local (não `localhost`).

### 3. Rodar
```bash
npm start
```

## Tecnologias

- React Native + Expo
- React Navigation
- Axios
- AsyncStorage
- react-native-youtube-iframe
