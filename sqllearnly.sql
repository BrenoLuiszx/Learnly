-- =============================================
-- LEARNLY — SCHEMA DEFINITIVO
-- SQL Server / LearnlyDBteste
--
-- Criação em ordem correta para que todas as FKs
-- sejam definidas inline, sem ALTER TABLE posterior.
--
-- Ordem de criação:
--   1. Categorias
--   2. Usuarios
--   3. Instrutores        (FK → Usuarios)
--   4. Cursos             (FK → Categorias, Instrutores)
--   5. Aulas              (FK → Cursos)
--   6. Matriculas         (FK → Usuarios, Cursos)
--   7. progresso_aula     (FK → Usuarios, Aulas, Cursos)
--   8. Avaliacoes         (FK → Usuarios, Cursos)
--   9. Certificados       (FK → Usuarios, Cursos)
--
-- Tabelas removidas vs versões anteriores:
--   - Progresso           → dados vivem em Matriculas
--   - cursos_favoritos    → vivem em Usuarios.favoritos (JSON)
--   - cursos_assistir_depois → vivem em Usuarios.assistir_depois (JSON)
-- =============================================

USE master;
GO

IF EXISTS (SELECT name FROM sys.databases WHERE name = 'LearnlyDBteste')
BEGIN
    ALTER DATABASE LearnlyDBteste SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE LearnlyDBteste;
END
GO

CREATE DATABASE LearnlyDBteste;
GO

USE LearnlyDBteste;
GO

-- =============================================
-- 1. Categorias
-- =============================================
CREATE TABLE Categorias (
    id        INT           IDENTITY(1,1) NOT NULL,
    nome      NVARCHAR(50)  NOT NULL,
    descricao NVARCHAR(200) NULL,
    ativo     BIT           NOT NULL DEFAULT 1,

    CONSTRAINT PK_Categorias      PRIMARY KEY (id),
    CONSTRAINT UQ_Categorias_Nome UNIQUE      (nome)
);
GO

-- =============================================
-- 2. Usuarios
-- role              : admin | colaborador | user
-- status_solicitacao: nenhuma | pendente | aprovada | recusada
-- favoritos         : JSON array de course IDs
-- assistir_depois   : JSON array de course IDs
-- planejamento_*    : JSON do quadro kanban
-- =============================================
CREATE TABLE Usuarios (
    id                        INT            IDENTITY(1,1) NOT NULL,
    nome                      NVARCHAR(100)  NOT NULL,
    email                     NVARCHAR(150)  NOT NULL,
    senha                     NVARCHAR(255)  NOT NULL,
    foto                      NVARCHAR(500)  NULL,
    role                      NVARCHAR(20)   NOT NULL DEFAULT 'user',
    status_solicitacao        NVARCHAR(20)   NOT NULL DEFAULT 'nenhuma',
    justificativa_colaborador NVARCHAR(MAX)  NULL,
    data_criacao              DATETIME2      NOT NULL DEFAULT GETDATE(),
    ativo                     BIT            NOT NULL DEFAULT 1,
    planejamento_cards        NVARCHAR(MAX)  NULL,
    planejamento_cols         NVARCHAR(MAX)  NULL,
    favoritos                 NVARCHAR(MAX)  NOT NULL DEFAULT '[]',
    assistir_depois           NVARCHAR(MAX)  NOT NULL DEFAULT '[]',
    curriculo NVARCHAR(MAX) NULL,


    CONSTRAINT PK_Usuarios                   PRIMARY KEY (id),
    CONSTRAINT UQ_Usuarios_Email             UNIQUE      (email),
    CONSTRAINT CK_Usuarios_Role              CHECK (role IN ('admin', 'colaborador', 'user')),
    CONSTRAINT CK_Usuarios_StatusSolicitacao CHECK (status_solicitacao IN ('nenhuma', 'pendente', 'aprovada', 'recusada'))
);
GO

-- =============================================
-- 3. Instrutores
-- usuario_id: vincula ao Usuario colaborador dono dos cursos.
--   NULL  = instrutor externo sem conta na plataforma (ex: Rocketseat).
--   NOT NULL = colaborador aprovado; um usuário → um registro de instrutor.
-- Ownership chain: Cursos.instrutor_id → Instrutores.usuario_id → Usuarios.id
-- =============================================
CREATE TABLE Instrutores (
    id         INT           IDENTITY(1,1) NOT NULL,
    nome       NVARCHAR(100) NOT NULL,
    bio        NVARCHAR(500) NULL,
    foto       NVARCHAR(500) NULL,
    usuario_id INT           NULL,
    ativo      BIT           NOT NULL DEFAULT 1,

    CONSTRAINT PK_Instrutores           PRIMARY KEY (id),
    CONSTRAINT FK_Instrutores_Usuario   FOREIGN KEY (usuario_id)
        REFERENCES Usuarios(id) ON DELETE SET NULL
);
GO

-- Filtered unique index: um usuário só pode ter um registro de instrutor.
-- NULL é permitido múltiplas vezes (instrutores externos).
CREATE UNIQUE INDEX UQ_Instrutores_UsuarioId
    ON Instrutores (usuario_id)
    WHERE usuario_id IS NOT NULL;
GO

-- =============================================
-- 4. Cursos
-- instrutor_id → Instrutores(id): identifica o dono/criador do curso.
-- status: pendente | aprovado | rejeitado
-- links_externos / anexos: JSON arrays
-- =============================================
CREATE TABLE Cursos (
    id                  INT            IDENTITY(1,1) NOT NULL,
    titulo              NVARCHAR(200)  NOT NULL,
    descricao           NVARCHAR(1000) NOT NULL,
    url                 NVARCHAR(500)  NOT NULL,
    categoria_id        INT            NOT NULL,
    instrutor_id        INT            NOT NULL,
    duracao             INT            NOT NULL,
    status              NVARCHAR(20)   NOT NULL DEFAULT 'aprovado',
    imagem              NVARCHAR(500)  NULL,
    descricao_detalhada NVARCHAR(MAX)  NULL,
    links_externos      NVARCHAR(MAX)  NULL,
    anexos              NVARCHAR(MAX)  NULL,
    data_criacao        DATETIME2      NOT NULL DEFAULT GETDATE(),
    ativo               BIT            NOT NULL DEFAULT 1,

    CONSTRAINT PK_Cursos           PRIMARY KEY (id),
    CONSTRAINT FK_Cursos_Categoria FOREIGN KEY (categoria_id) REFERENCES Categorias(id),
    CONSTRAINT FK_Cursos_Instrutor FOREIGN KEY (instrutor_id) REFERENCES Instrutores(id),
    CONSTRAINT CK_Cursos_Status    CHECK (status IN ('pendente', 'aprovado', 'rejeitado')),
    CONSTRAINT CK_Cursos_Duracao   CHECK (duracao > 0)
);
GO

-- =============================================
-- 5. Aulas
-- =============================================
CREATE TABLE Aulas (
    id        INT            IDENTITY(1,1) NOT NULL,
    curso_id  INT            NOT NULL,
    ordem     INT            NOT NULL,
    titulo    NVARCHAR(200)  NOT NULL,
    url       NVARCHAR(500)  NOT NULL,
    descricao NVARCHAR(1000) NULL,

    CONSTRAINT PK_Aulas       PRIMARY KEY (id),
    CONSTRAINT FK_Aulas_Curso FOREIGN KEY (curso_id) REFERENCES Cursos(id) ON DELETE CASCADE,
    CONSTRAINT UQ_Aulas_Ordem UNIQUE (curso_id, ordem)
);
GO

-- =============================================
-- 6. Matriculas
-- Fonte única de verdade para progresso e conclusão por curso.
-- progresso: recalculado por AulaService a cada aula concluída.
-- =============================================
CREATE TABLE Matriculas (
    id             INT          IDENTITY(1,1) NOT NULL,
    usuario_id     INT          NOT NULL,
    curso_id       INT          NOT NULL,
    data_inscricao DATETIME2    NOT NULL DEFAULT GETDATE(),
    progresso      DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    concluido      BIT          NOT NULL DEFAULT 0,
    data_conclusao DATETIME2    NULL,

    CONSTRAINT PK_Matriculas              PRIMARY KEY (id),
    CONSTRAINT UQ_Matriculas_UsuarioCurso UNIQUE      (usuario_id, curso_id),
    CONSTRAINT FK_Matriculas_Usuario      FOREIGN KEY (usuario_id) REFERENCES Usuarios(id) ON DELETE CASCADE,
    CONSTRAINT FK_Matriculas_Curso        FOREIGN KEY (curso_id)   REFERENCES Cursos(id)   ON DELETE CASCADE,
    CONSTRAINT CK_Matriculas_Progresso    CHECK (progresso BETWEEN 0 AND 100)
);
GO

-- =============================================
-- 7. progresso_aula
-- Rastreia conclusão individual de cada aula por usuário.
-- curso_id é redundante (pode ser derivado via aula_id → Aulas.curso_id)
-- mas mantido por performance — evita JOIN em queries frequentes.
-- =============================================
CREATE TABLE progresso_aula (
    id             INT       IDENTITY(1,1) NOT NULL,
    usuario_id     INT       NOT NULL,
    aula_id        INT       NOT NULL,
    curso_id       INT       NOT NULL,
    concluido      BIT       NOT NULL DEFAULT 0,
    data_conclusao DATETIME2 NULL,

    CONSTRAINT PK_ProgressoAula             PRIMARY KEY (id),
    CONSTRAINT UQ_ProgressoAula_UsuarioAula UNIQUE      (usuario_id, aula_id),
    CONSTRAINT FK_ProgressoAula_Usuario     FOREIGN KEY (usuario_id) REFERENCES Usuarios(id) ON DELETE CASCADE,
    CONSTRAINT FK_ProgressoAula_Aula        FOREIGN KEY (aula_id)    REFERENCES Aulas(id)    ON DELETE CASCADE,
    CONSTRAINT FK_ProgressoAula_Curso       FOREIGN KEY (curso_id)   REFERENCES Cursos(id)
);
GO

-- =============================================
-- 8. Avaliacoes
-- nome_usuario removido: resolvido via JOIN no AvaliacaoDTO.
-- =============================================
CREATE TABLE Avaliacoes (
    id           INT           IDENTITY(1,1) NOT NULL,
    usuario_id   INT           NOT NULL,
    curso_id     INT           NOT NULL,
    nota         INT           NOT NULL,
    comentario   NVARCHAR(500) NULL,
    data_criacao DATETIME2     NOT NULL DEFAULT GETDATE(),

    CONSTRAINT PK_Avaliacoes              PRIMARY KEY (id),
    CONSTRAINT UQ_Avaliacoes_UsuarioCurso UNIQUE      (usuario_id, curso_id),
    CONSTRAINT FK_Avaliacoes_Usuario      FOREIGN KEY (usuario_id) REFERENCES Usuarios(id) ON DELETE CASCADE,
    CONSTRAINT FK_Avaliacoes_Curso        FOREIGN KEY (curso_id)   REFERENCES Cursos(id)   ON DELETE CASCADE,
    CONSTRAINT CK_Avaliacoes_Nota         CHECK (nota BETWEEN 1 AND 5)
);
GO

-- =============================================
-- 9. Certificados
-- nome_usuario / titulo_curso: desnormalizados para geração de PDF
-- sem necessidade de JOIN em runtime.
-- =============================================
CREATE TABLE Certificados (
    id              INT           IDENTITY(1,1) NOT NULL,
    usuario_id      INT           NOT NULL,
    curso_id        INT           NOT NULL,
    nome_usuario    NVARCHAR(100) NULL,
    titulo_curso    NVARCHAR(200) NULL,
    url_certificado NVARCHAR(500) NULL,
    data_emissao    DATETIME2     NOT NULL DEFAULT GETDATE(),
    publico         BIT           NOT NULL DEFAULT 1,

    CONSTRAINT PK_Certificados              PRIMARY KEY (id),
    CONSTRAINT UQ_Certificados_UsuarioCurso UNIQUE      (usuario_id, curso_id),
    CONSTRAINT FK_Certificados_Usuario      FOREIGN KEY (usuario_id) REFERENCES Usuarios(id) ON DELETE CASCADE,
    CONSTRAINT FK_Certificados_Curso        FOREIGN KEY (curso_id)   REFERENCES Cursos(id)   ON DELETE CASCADE
);
GO

-- =============================================
-- INDEXES
-- Cada index justificado por uma query real do backend.
-- =============================================

-- Usuarios
CREATE INDEX IX_Usuarios_Email ON Usuarios (email);         -- login, JWT lookup
CREATE INDEX IX_Usuarios_Role  ON Usuarios (role);          -- listar colaboradores/admins
GO

-- Cursos
CREATE INDEX IX_Cursos_Status    ON Cursos (status, ativo); -- findByAtivoTrueAndStatus (listagem pública)
CREATE INDEX IX_Cursos_Categoria ON Cursos (categoria_id);  -- findByCategoriaNome
CREATE INDEX IX_Cursos_Instrutor ON Cursos (instrutor_id);  -- buscarPorTermo + ownership lookup
GO

-- Aulas
CREATE INDEX IX_Aulas_Curso ON Aulas (curso_id, ordem);     -- findByCursoIdOrderByOrdem, countByCursoId
GO

-- Matriculas
CREATE INDEX IX_Matriculas_Usuario   ON Matriculas (usuario_id);           -- findByUsuarioId
CREATE INDEX IX_Matriculas_Curso     ON Matriculas (curso_id);             -- findByCursoId
CREATE INDEX IX_Matriculas_Concluido ON Matriculas (usuario_id, concluido);-- findByUsuarioIdAndConcluidoTrue
GO

-- progresso_aula
CREATE INDEX IX_ProgressoAula_UsuarioCurso ON progresso_aula (usuario_id, curso_id); -- findByUsuarioIdAndCursoId
CREATE INDEX IX_ProgressoAula_Aula         ON progresso_aula (aula_id);              -- CASCADE lookup
CREATE INDEX IX_ProgressoAula_Curso        ON progresso_aula (curso_id);             -- findByCursoIdAndConcluidoTrue
GO

-- Avaliacoes
CREATE INDEX IX_Avaliacoes_Curso   ON Avaliacoes (curso_id);   -- findByCursoIdWithUsuario, mediaNotaPorCurso
CREATE INDEX IX_Avaliacoes_Usuario ON Avaliacoes (usuario_id); -- findByUsuarioIdAndCursoId
GO

-- Certificados
CREATE INDEX IX_Certificados_Usuario ON Certificados (usuario_id);          -- findByUsuarioId
CREATE INDEX IX_Certificados_Publico ON Certificados (usuario_id, publico); -- findByUsuarioIdAndPublicoTrue
GO

-- =============================================
-- SEED DATA
-- =============================================

-- Categorias (16)
INSERT INTO Categorias (nome, descricao) VALUES
('Frontend',    'Desenvolvimento de interfaces de usuário'),
('Backend',     'Desenvolvimento de servidores e APIs'),
('Data Science','Ciência de dados e análise'),
('Database',    'Banco de dados e SQL'),
('DevOps',      'Operações e infraestrutura'),
('Mobile',      'Desenvolvimento de aplicativos móveis'),
('Design',      'Design gráfico, UI/UX e criação visual'),
('Marketing',   'Marketing digital, SEO e redes sociais'),
('Negócios',    'Empreendedorismo, gestão e finanças'),
('Idiomas',     'Aprendizado de línguas estrangeiras'),
('Música',      'Teoria musical, instrumentos e canto'),
('Violão',      'Técnicas e repertório para violão'),
('Canto',       'Técnica vocal e performance'),
('Fotografia',  'Fotografia, edição e composição visual'),
('Saúde',       'Bem-estar, nutrição e atividade física'),
('Diversos',    'Conteúdos variados sem categoria específica');
GO

-- Usuarios (4) — senhas: BCrypt de '123456'
INSERT INTO Usuarios (nome, email, senha, foto, role) VALUES
('Breno',        'admin@teste.com',  '$2a$10$Ba1rMXrknmeN15NeaLkVn.HcVQ5s0lU9O1.o5acO6I.WYzxtjQhMu', 'https://i.pinimg.com/736x/72/21/bf/7221bf32061ed0edec3c4e737532b0c8.jpg', 'admin'),
('User',         'user@teste.com',   '$2a$10$Ba1rMXrknmeN15NeaLkVn.HcVQ5s0lU9O1.o5acO6I.WYzxtjQhMu', 'https://api.dicebear.com/7.x/avataaars/svg?seed=User',                    'user'),
('João Silva',   'joao@email.com',   '$2a$10$Ba1rMXrknmeN15NeaLkVn.HcVQ5s0lU9O1.o5acO6I.WYzxtjQhMu', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Joao',                    'user'),
('Maria Santos', 'maria@email.com',  '$2a$10$Ba1rMXrknmeN15NeaLkVn.HcVQ5s0lU9O1.o5acO6I.WYzxtjQhMu', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria',                   'user');
GO

-- Instrutores (7)
-- usuario_id = NULL: instrutores externos sem conta na plataforma.
-- Colaboradores aprovados recebem um registro aqui automaticamente
-- via UsuarioService.aprovarColaborador().
INSERT INTO Instrutores (nome, bio, usuario_id) VALUES
('Matheus Battisti', 'Desenvolvedor Full Stack especialista em React',   NULL),
('Rocketseat',       'Plataforma de educação em tecnologia',             NULL),
('Curso em Video',   'Canal educacional do Professor Gustavo Guanabara', NULL),
('Cod3r',            'Escola de programação online',                     NULL),
('DevDojo',          'Canal focado em Java e Spring',                    NULL),
('Origamid',         'Escola de design e front-end',                     NULL),
('Fabricio Veronez', 'Especialista em DevOps e containers',              NULL);
GO

-- Cursos (10)
-- categoria_id: 1=Frontend 2=Backend 3=DataScience 4=Database 5=DevOps
-- instrutor_id: 1=Matheus 2=Rocketseat 3=CursoVideo 4=Cod3r 5=DevDojo 6=Origamid 7=Fabricio
INSERT INTO Cursos (titulo, descricao, url, categoria_id, instrutor_id, duracao) VALUES
('React Completo',          'Curso completo de React do básico ao avançado', 'https://www.youtube.com/watch?v=FXqX7oof0I0', 1, 1, 480),
('Node.js para Iniciantes', 'Aprenda Node.js criando uma API REST',           'https://www.youtube.com/watch?v=LLqq6FemMNQ', 2, 2, 360),
('Python Fundamentos',      'Curso de Python para Data Science',              'https://www.youtube.com/watch?v=S9uPNppGsGo', 3, 3, 720),
('JavaScript ES6+',         'Recursos modernos do JavaScript',                'https://www.youtube.com/watch?v=HN1UjzRSdBk', 1, 4, 300),
('Spring Boot API',         'Criando APIs REST com Spring Boot',              'https://www.youtube.com/watch?v=OHn1jLHGptw', 2, 5, 540),
('MySQL Basico',            'Fundamentos de banco de dados MySQL',            'https://www.youtube.com/watch?v=Ofktsne-utM', 4, 3, 240),
('Git e GitHub',            'Controle de versão com Git',                     'https://www.youtube.com/watch?v=xEKo29OWILE', 5, 3, 180),
('CSS Grid e Flexbox',      'Layout moderno com CSS',                         'https://www.youtube.com/watch?v=x-4z_u8LcGc', 1, 6, 420),
('Vue.js 3',                'Framework progressivo para interfaces',          'https://www.youtube.com/watch?v=wsAQQioPIJs', 1, 4, 380),
('Docker Essentials',       'Containerização de aplicações',                  'https://www.youtube.com/watch?v=0xxHiOSJVe8', 5, 7, 320);
GO

-- Aulas — uma aula inicial por curso
INSERT INTO Aulas (curso_id, ordem, titulo, url, descricao)
SELECT id, 1, 'Aula 1 - ' + titulo, url, 'Aula principal do curso'
FROM Cursos;
GO

-- =============================================
-- VIEWS
-- Consultas de leitura para dashboards e relatórios.
-- O backend Java não chama procedures — toda a lógica
-- de escrita vive nos Services. As views servem para
-- consultas diretas no SSMS e relatórios.
-- =============================================

-- Cursos aprovados e ativos com categoria e instrutor
CREATE VIEW vw_CursosCompletos AS
SELECT
    c.id,
    c.titulo,
    c.descricao,
    c.url,
    c.imagem,
    c.duracao,
    c.status,
    c.data_criacao,
    cat.nome         AS categoria,
    i.nome           AS instrutor,
    i.foto           AS instrutor_foto,
    i.bio            AS instrutor_bio,
    i.usuario_id     AS instrutor_usuario_id
FROM Cursos c
INNER JOIN Categorias  cat ON c.categoria_id = cat.id
INNER JOIN Instrutores i   ON c.instrutor_id  = i.id
WHERE c.ativo = 1 AND c.status = 'aprovado';
GO

-- Alunos matriculados por curso com progresso individual
CREATE VIEW vw_AlunosDoCurso AS
SELECT
    m.curso_id,
    c.titulo                                                        AS titulo_curso,
    i.usuario_id                                                    AS instrutor_usuario_id,
    m.usuario_id,
    u.nome                                                          AS nome_aluno,
    u.email                                                         AS email_aluno,
    m.progresso,
    m.concluido,
    m.data_inscricao,
    m.data_conclusao,
    (SELECT COUNT(*) FROM Aulas a
     WHERE a.curso_id = m.curso_id)                                 AS total_aulas,
    (SELECT COUNT(*) FROM progresso_aula pa
     WHERE pa.usuario_id = m.usuario_id
       AND pa.curso_id   = m.curso_id
       AND pa.concluido  = 1)                                       AS aulas_concluidas
FROM Matriculas m
INNER JOIN Usuarios    u ON m.usuario_id   = u.id
INNER JOIN Cursos      c ON m.curso_id     = c.id
INNER JOIN Instrutores i ON c.instrutor_id = i.id;
GO

-- Estatísticas agregadas por curso
CREATE VIEW vw_EstatisticasCurso AS
SELECT
    c.id                                                            AS curso_id,
    c.titulo,
    i.usuario_id                                                    AS instrutor_usuario_id,
    c.status,
    c.ativo,
    COUNT(DISTINCT m.id)                                            AS total_matriculas,
    COUNT(DISTINCT CASE WHEN m.concluido = 1 THEN m.id END)        AS total_concluidos,
    ISNULL(AVG(m.progresso), 0)                                     AS progresso_medio,
    COUNT(DISTINCT a.id)                                            AS total_aulas,
    COUNT(DISTINCT av.id)                                           AS total_avaliacoes,
    ISNULL(AVG(CAST(av.nota AS DECIMAL(3,2))), 0)                  AS media_avaliacao
FROM Cursos c
LEFT  JOIN Matriculas  m  ON c.id = m.curso_id
LEFT  JOIN Aulas       a  ON c.id = a.curso_id
LEFT  JOIN Avaliacoes  av ON c.id = av.curso_id
INNER JOIN Instrutores i  ON c.instrutor_id = i.id
GROUP BY c.id, c.titulo, i.usuario_id, c.status, c.ativo;
GO

-- Avaliações com nome/foto do aluno resolvidos via JOIN
CREATE VIEW vw_AvaliacoesCurso AS
SELECT
    av.id,
    av.curso_id,
    c.titulo         AS titulo_curso,
    i.usuario_id     AS instrutor_usuario_id,
    av.usuario_id,
    u.nome           AS nome_aluno,
    u.foto           AS foto_aluno,
    av.nota,
    av.comentario,
    av.data_criacao
FROM Avaliacoes av
INNER JOIN Usuarios    u ON av.usuario_id  = u.id
INNER JOIN Cursos      c ON av.curso_id    = c.id
INNER JOIN Instrutores i ON c.instrutor_id = i.id;
GO

-- Contadores globais para o painel admin
CREATE VIEW vw_DashboardAdmin AS
SELECT
    (SELECT COUNT(*) FROM Cursos   WHERE ativo = 1 AND status = 'aprovado') AS cursos_ativos,
    (SELECT COUNT(*) FROM Cursos   WHERE status = 'pendente')                AS cursos_pendentes,
    (SELECT COUNT(*) FROM Usuarios WHERE ativo = 1)                          AS total_usuarios,
    (SELECT COUNT(*) FROM Usuarios WHERE status_solicitacao = 'pendente')    AS solicitacoes_pendentes,
    (SELECT COUNT(*) FROM Matriculas)                                         AS total_matriculas,
    (SELECT COUNT(*) FROM Matriculas WHERE concluido = 1)                    AS total_conclusoes,
    (SELECT COUNT(*) FROM Certificados)                                       AS total_certificados;
GO

-- =============================================
-- STORED PROCEDURES (utilitários operacionais)
-- Não são chamadas pelo backend Java.
-- Servem para auditoria e inspeção direta no SSMS.
-- =============================================

CREATE PROCEDURE sp_AuditarTabelas
AS
BEGIN
    SET NOCOUNT ON;
    SELECT
        t.name                                                         AS tabela,
        p.rows                                                         AS total_linhas,
        CAST(SUM(a.total_pages) * 8 / 1024.0 AS DECIMAL(10,2))       AS tamanho_mb
    FROM sys.tables t
    INNER JOIN sys.indexes         i ON t.object_id = i.object_id AND i.index_id <= 1
    INNER JOIN sys.partitions      p ON i.object_id = p.object_id AND i.index_id  = p.index_id
    INNER JOIN sys.allocation_units a ON p.partition_id = a.container_id
    GROUP BY t.name, p.rows
    ORDER BY p.rows DESC;
END;
GO

CREATE PROCEDURE sp_ListarRelacionamentos
AS
BEGIN
    SET NOCOUNT ON;
    SELECT
        fk.name                           AS constraint_name,
        tp.name                           AS tabela_origem,
        cp.name                           AS coluna_origem,
        tr.name                           AS tabela_referenciada,
        cr.name                           AS coluna_referenciada,
        fk.delete_referential_action_desc AS on_delete
    FROM sys.foreign_keys fk
    INNER JOIN sys.foreign_key_columns fkc ON fk.object_id           = fkc.constraint_object_id
    INNER JOIN sys.tables  tp ON fkc.parent_object_id                 = tp.object_id
    INNER JOIN sys.columns cp ON fkc.parent_object_id                 = cp.object_id AND fkc.parent_column_id     = cp.column_id
    INNER JOIN sys.tables  tr ON fkc.referenced_object_id             = tr.object_id
    INNER JOIN sys.columns cr ON fkc.referenced_object_id             = cr.object_id AND fkc.referenced_column_id = cr.column_id
    ORDER BY tp.name, fk.name;
END;
GO

PRINT 'LearnlyDBteste criado com sucesso.';
GO


SELECT * FROM Usuarios