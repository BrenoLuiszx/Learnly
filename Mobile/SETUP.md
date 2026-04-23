# Setup Rápido - LearnlyExpo

## Para quem vai clonar o projeto pela primeira vez

### 1. Instalar dependências
```bash
npm install
```

### 2. Configurar IP do Backend (OBRIGATÓRIO)

**Copie o arquivo de configuração:**
```bash
# Windows
copy src\config\environment.example.js src\config\environment.js

# Mac/Linux
cp src/config/environment.example.js src/config/environment.js
```

**Descubra seu IP:**
```bash
# Windows
ipconfig

# Mac/Linux
ifconfig
```

**Edite o arquivo `src/config/environment.js`:**
```javascript
export const API_URL = 'http://SEU_IP_AQUI:8080/api';
```

Substitua `SEU_IP_AQUI` pelo IP que você descobriu.

**Exemplos:**
- Backend no mesmo PC: `http://localhost:8080/api`
- Backend em outro PC: `http://192.168.0.2:8080/api`

### 3. Rodar o app
```bash
npm start
```

## ⚠️ IMPORTANTE

- O arquivo `src/config/environment.js` **NÃO** é commitado no git
- Cada pessoa deve criar seu próprio arquivo com seu IP
- Backend deve estar rodando na porta 8080
- Para testar no celular, PC e celular devem estar na mesma WiFi

## 🎨 Funcionalidades

- ✅ Login/Registro
- ✅ Catálogo de cursos
- ✅ Player de vídeo (YouTube)
- ✅ Progresso por aulas
- ✅ Certificados
- ✅ Perfil com estatísticas reais
- ✅ **Tema claro/escuro** (botão ☀️/🌙 no canto superior direito)
- ✅ Notificações

## 🐛 Problemas?

**Erro de conexão:**
- Verifique se o backend está rodando
- Confirme o IP em `src/config/environment.js`
- Se testar no celular, use IP da rede (não localhost)

**App não atualiza:**
- Pressione `r` no terminal do Expo
- Ou sacuda o celular e selecione "Reload"
