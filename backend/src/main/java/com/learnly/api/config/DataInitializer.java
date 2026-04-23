package com.learnly.api.config;

import com.learnly.api.model.entity.*;
import com.learnly.api.model.repository.*;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

// @Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UsuarioRepository usuarioRepository;
    
    @Autowired
    private CategoriaRepository categoriaRepository;
    
    @Autowired
    private InstrutorRepository instrutorRepository;
    
    @Autowired
    private CursoRepository cursoRepository;

    @Override
    public void run(String... args) throws Exception {
        // Criar categorias
        Categoria frontend = categoriaRepository.save(new Categoria("Frontend", "Desenvolvimento de interfaces"));
        Categoria backend = categoriaRepository.save(new Categoria("Backend", "Desenvolvimento de servidores"));
        Categoria dataScience = categoriaRepository.save(new Categoria("Data Science", "Ciência de dados"));
        Categoria database = categoriaRepository.save(new Categoria("Database", "Banco de dados"));
        Categoria devops = categoriaRepository.save(new Categoria("DevOps", "Operações e infraestrutura"));

        // Criar instrutores
        Instrutor matheus = instrutorRepository.save(new Instrutor("Matheus Battisti", "Desenvolvedor Full Stack"));
        Instrutor rocketseat = instrutorRepository.save(new Instrutor("Rocketseat", "Plataforma de educação"));
        Instrutor cursoVideo = instrutorRepository.save(new Instrutor("Curso em Video", "Canal educacional"));
        Instrutor cod3r = instrutorRepository.save(new Instrutor("Cod3r", "Escola de programação"));
        Instrutor devdojo = instrutorRepository.save(new Instrutor("DevDojo", "Canal Java e Spring"));
        Instrutor origamid = instrutorRepository.save(new Instrutor("Origamid", "Escola de design"));
        Instrutor fabricio = instrutorRepository.save(new Instrutor("Fabricio Veronez", "Especialista DevOps"));

        // Criar usuários iniciais
        usuarioRepository.save(new Usuario("Breno", "admin@teste.com", "123456", 
            "https://i.pinimg.com/736x/72/21/bf/7221bf32061ed0edec3c4e737532b0c8.jpg", "admin"));
        usuarioRepository.save(new Usuario("User", "user@teste.com", "123456", 
            "https://api.dicebear.com/7.x/avataaars/svg?seed=User", "user"));
        usuarioRepository.save(new Usuario("João Silva", "joao@email.com", "123456", 
            "https://api.dicebear.com/7.x/avataaars/svg?seed=Joao", "user"));
        usuarioRepository.save(new Usuario("Maria Santos", "maria@email.com", "123456", 
            "https://api.dicebear.com/7.x/avataaars/svg?seed=Maria", "user"));

        // Criar cursos
        cursoRepository.save(new Curso("React Completo", "Curso completo de React do básico ao avançado", 
            "https://www.youtube.com/watch?v=FXqX7oof0I0", frontend, matheus, 480));
        cursoRepository.save(new Curso("Node.js para Iniciantes", "Aprenda Node.js criando uma API REST", 
            "https://www.youtube.com/watch?v=LLqq6FemMNQ", backend, rocketseat, 360));
        cursoRepository.save(new Curso("Python Fundamentos", "Curso de Python para Data Science", 
            "https://www.youtube.com/watch?v=S9uPNppGsGo", dataScience, cursoVideo, 720));
        cursoRepository.save(new Curso("JavaScript ES6+", "Recursos modernos do JavaScript", 
            "https://www.youtube.com/watch?v=HN1UjzRSdBk", frontend, cod3r, 300));
        cursoRepository.save(new Curso("Spring Boot API", "Criando APIs REST com Spring Boot", 
            "https://www.youtube.com/watch?v=OHn1jLHGptw", backend, devdojo, 540));
        cursoRepository.save(new Curso("MySQL Basico", "Fundamentos de banco de dados MySQL", 
            "https://www.youtube.com/watch?v=Ofktsne-utM", database, cursoVideo, 240));
        cursoRepository.save(new Curso("Git e GitHub", "Controle de versao com Git", 
            "https://www.youtube.com/watch?v=xEKo29OWILE", devops, cursoVideo, 180));
        cursoRepository.save(new Curso("CSS Grid e Flexbox", "Layout moderno com CSS", 
            "https://www.youtube.com/watch?v=x-4z_u8LcGc", frontend, origamid, 420));
        cursoRepository.save(new Curso("Vue.js 3", "Framework progressivo para interfaces", 
            "https://www.youtube.com/watch?v=wsAQQioPIJs", frontend, cod3r, 380));
        cursoRepository.save(new Curso("Docker Essentials", "Containerizacao de aplicacoes", 
            "https://www.youtube.com/watch?v=0xxHiOSJVe8", devops, fabricio, 320));
        
        System.out.println(" Dados iniciais carregados!");
    }
}