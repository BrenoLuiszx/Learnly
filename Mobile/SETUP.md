# Setup - Learnly Mobile

```bash
npm install
```

Copie e configure o ambiente:
```bash
# Windows
copy src\config\environment.example.js src\config\environment.js

# Mac/Linux
cp src/config/environment.example.js src/config/environment.js
```

Edite `src/config/environment.js` com o IP do backend e rode:
```bash
npm start
```

> O arquivo `environment.js` não é versionado. Backend deve estar na porta 8080.
