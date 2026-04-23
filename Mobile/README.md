# 📱 LearnlyExpo - Plataforma de Cursos Mobile

Aplicativo mobile desenvolvido em React Native/Expo para a plataforma de cursos Learnly.

## 🎨 Funcionalidades

- ✅ Sistema de autenticação (Login/Registro)
- ✅ Catálogo de cursos com busca e filtros
- ✅ Player de vídeo integrado (YouTube)
- ✅ Acompanhamento de progresso por aulas
- ✅ Sistema de avaliações e comentários
- ✅ Emissão de certificados
- ✅ Perfil do usuário com estatísticas
- ✅ **Tema claro/escuro** (Roxo/Branco e Amarelo/Preto)
- ✅ Notificações
- ✅ Dados em tempo real do backend

## 🚀 Configuração Inicial

### 1️⃣ Pré-requisitos

- Node.js 14 ou superior
- npm ou yarn
- Expo CLI (será instalado automaticamente)
- Backend Learnly rodando na porta 8080

### 2️⃣ Instalação

```bash
# Clone o repositório
git clone <url-do-repositorio>
cd LearnlyExpo

# Instale as dependências
npm install
# ou
yarn install
```

### 3️⃣ Configuração do Backend (IMPORTANTE) ⚠️

**Você DEVE configurar o IP do backend antes de rodar o app!**

1. Copie o arquivo de exemplo:
   ```bash
   # No Windows
   copy src\config\environment.example.js src\config\environment.js
   
   # No Mac/Linux
   cp src/config/environment.example.js src/config/environment.js
   ```

2. Descubra o IP da máquina onde o backend está rodando:
   
   **Windows:**
   ```bash
   ipconfig
   ```
   Procure por "Endereço IPv4" (exemplo: 192.168.0.2)
   
   **Mac/Linux:**
   ```bash
   ifconfig
   # ou
   ip addr
   ```
   Procure por "inet" (exemplo: 192.168.1.100)

3. Edite o arquivo `src/config/environment.js` e ajuste o IP:
   ```javascript
   export const API_URL = 'http://SEU_IP_AQUI:8080/api';
   ```
   
   **Exemplos:**
   ```javascript
   // Backend no mesmo PC
   export const API_URL = 'http://localhost:8080/api';
   
   // Backend em outro PC na mesma rede
   export const API_URL = 'http://192.168.0.2:8080/api';
   
   // Backend em servidor remoto
   export const API_URL = 'http://seu-servidor.com:8080/api';
   ```

### 4️⃣ Executar o App

```bash
# Inicie o Expo
npm start
# ou
expo start
```

Isso abrirá o Expo DevTools no navegador. Você pode:
- Pressionar `a` para abrir no emulador Android
- Pressionar `i` para abrir no simulador iOS
- Escanear o QR Code com o app Expo Go no celular

## 📱 Testando no Celular Físico

1. Instale o app **Expo Go** no seu celular:
   - [Android - Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent)
   - [iOS - App Store](https://apps.apple.com/app/expo-go/id982107779)

2. **IMPORTANTE:** Celular e PC devem estar na **MESMA rede WiFi**

3. Escaneie o QR Code que aparece no terminal ou navegador

4. **NÃO use** `localhost` no IP - use o IP da rede local (192.168.x.x)

## 🎨 Sistema de Temas

O app possui dois temas elegantes:

### Tema Escuro (Padrão)
- Cor primária: Amarelo/Dourado (#FACC15)
- Background: Preto (#000000)
- Ideal para uso noturno

### Tema Claro
- Cor primária: Roxo vibrante (#7C3AED)
- Background: Branco (#FFFFFF)
- Ideal para uso diurno

**Como alternar:** Clique no botão ☀️/🌙 no canto superior direito da Home ou Perfil

## 📂 Estrutura do Projeto

```
LearnlyExpo/
├── src/
│   ├── components/
│   │   └── BottomNav.js          # Navegação inferior
│   ├── contexts/
│   │   ├── AuthContext.js        # Contexto de autenticação
│   │   └── ThemeContext.js       # Contexto de temas
│   ├── screens/
│   │   ├── LoginScreen.js        # Tela de login
│   │   ├── RegisterScreen.js     # Tela de registro
│   │   ├── HomeScreen.js         # Tela inicial
│   │   ├── CoursesScreen.js      # Catálogo de cursos
│   │   ├── CourseDetailsScreen.js # Detalhes do curso
│   │   ├── NotificationsScreen.js # Notificações
│   │   └── ProfileScreen.js      # Perfil do usuário
│   ├── services/
│   │   └── api.js                # Configuração da API
│   └── config/
│       ├── environment.js        # Configuração local (NÃO commitado)
│       └── environment.example.js # Exemplo de configuração
├── App.js                        # Arquivo principal
├── package.json                  # Dependências
└── README.md                     # Este arquivo
```

## 🔧 Tecnologias Utilizadas

- **React Native** - Framework mobile
- **Expo** - Plataforma de desenvolvimento
- **React Navigation** - Navegação entre telas
- **Axios** - Requisições HTTP
- **AsyncStorage** - Armazenamento local
- **react-native-youtube-iframe** - Player de vídeo
- **Ionicons** - Ícones

## 🐛 Problemas Comuns

### Erro de conexão com o backend

**Problema:** App não consegue se conectar ao backend

**Solução:**
1. Verifique se o backend está rodando na porta 8080
2. Confirme que o IP em `src/config/environment.js` está correto
3. Se estiver testando no celular, certifique-se que está na mesma rede WiFi
4. NÃO use `localhost` quando testar no celular físico

### Erro "Unable to resolve module"

**Problema:** Erro ao importar módulos

**Solução:**
```bash
# Limpe o cache e reinstale
rm -rf node_modules
npm install
expo start -c
```

### App não atualiza após mudanças

**Problema:** Mudanças no código não aparecem no app

**Solução:**
- Pressione `r` no terminal do Expo para recarregar
- Ou sacuda o celular e selecione "Reload"

## 📝 Notas para Desenvolvedores

### Arquivo `environment.js`

- ⚠️ **NÃO commite** este arquivo no git
- Cada desenvolvedor deve ter sua própria configuração
- O arquivo está no `.gitignore` para evitar commits acidentais
- Use `environment.example.js` como referência

### Dados Reais do Backend

Todas as estatísticas e dados são calculados em tempo real:
- Cursos concluídos: contagem real do backend
- Horas estudadas: soma da duração dos cursos concluídos
- Certificados: número real de certificados emitidos
- Progresso: calculado por aulas concluídas vs total de aulas

### Atualização em Tempo Real

O app usa `useFocusEffect` para recarregar dados quando você:
- Volta para uma tela
- Navega entre abas
- Retorna de detalhes do curso

## 👥 Equipe

Desenvolvido para a plataforma Learnly

## 📄 Licença

Este projeto é proprietário e confidencial.

---

**Dúvidas?** Entre em contato com a equipe de desenvolvimento.
