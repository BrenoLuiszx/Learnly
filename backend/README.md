# Learnly API - Spring Boot

Backend da plataforma Learnly desenvolvido com Spring Boot, refatorado do projeto original LearnlyServer.

## Tecnologias

- Java 17
- Spring Boot 3.5.0
- Spring Data JPA
- SQL Server
- Maven

## Estrutura do Projeto

```
src/main/java/com/learnly/api/
├── config/          # Configurações (CORS, etc)
├── controller/      # Controllers REST
├── dto/            # Data Transfer Objects
├── model/          # Entidades JPA
├── repository/     # Repositórios Spring Data
└── service/        # Lógica de negócio
```

## Endpoints

### Usuários
- `GET /api/usuarios` - Listar usuários
- `POST /api/usuarios/registrar` - Registrar usuário
- `POST /api/usuarios/login` - Login

### Cursos
- `GET /api/cursos` - Listar cursos
- `POST /api/cursos` - Criar curso
- `PUT /api/cursos/{id}` - Atualizar curso
- `DELETE /api/cursos/{id}` - Deletar curso
- `GET /api/cursos/categoria/{categoria}` - Buscar por categoria
- `GET /api/cursos/buscar?titulo={termo}` - Buscar por termo

## Como Executar

1. Configure o SQL Server com o banco LearnlyDB
2. Execute o script `learnly_sqlserver.sql`
3. Ajuste as credenciais em `application.properties`
4. Execute: `mvn spring-boot:run`

## Banco de Dados

O projeto utiliza o banco LearnlyDB criado pelo script SQL fornecido, mantendo compatibilidade total com o sistema original.