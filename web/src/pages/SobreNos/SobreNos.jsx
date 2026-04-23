import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../Header/Header';
import '../../styles/home.css';

const SobreNos = () => {
  const navigate = useNavigate();

  return (
    <div className="home-container home-page sobre-nos-page">
      <Header />

      <section className="hero-section animate-in" style={{ minHeight: '60vh' }}>
        <div className="hero-background">
          <div className="hero-gradient"></div>
          <div className="floating-elements">
            <div className="float-element element-1"></div>
            <div className="float-element element-2"></div>
          </div>
        </div>
        <div className="hero-content" style={{ gridTemplateColumns: '1fr', textAlign: 'center', maxWidth: '760px' }}>
          <div className="hero-text" style={{ opacity: 1, animation: 'none' }}>
            <span style={{
              fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em',
              textTransform: 'uppercase', color: 'var(--accent-color)',
              background: 'rgba(255,215,0,0.08)', border: '1px solid rgba(255,215,0,0.2)',
              padding: '5px 14px', borderRadius: '20px', display: 'inline-block', marginBottom: '24px',
            }}>
              Sobre o Projeto
            </span>
            <h1 className="hero-title">
              Conheça o <span className="gradient-text">Learnly</span>
            </h1>
            <p className="hero-subtitle" style={{ margin: '0 auto 40px' }}>
              Um projeto acadêmico com propósito real — democratizar o acesso ao ensino de tecnologia.
            </p>
            <div className="hero-actions" style={{ justifyContent: 'center' }}>
              <button className="btn-primary" onClick={() => navigate('/cursos')}>
                Explorar cursos
              </button>
              <button className="btn-secondary" onClick={() => navigate('/')}>
                Voltar ao início
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="features-section animate-in">
        <div className="features-container">
          <div className="section-header">
            <h2>O que é o Learnly?</h2>
            <p>Desenvolvido como Trabalho de Conclusão de Curso, o Learnly é uma plataforma de ensino de tecnologia gratuita, prática e acessível.</p>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" fill="none"/></svg>
              </div>
              <h3>Origem Acadêmica</h3>
              <p>Nasceu como TCC com o objetivo de aplicar conhecimentos reais em um produto funcional e com impacto social.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" fill="none"/><circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" fill="none"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2" fill="none"/></svg>
              </div>
              <h3>Para Todos</h3>
              <p>Conteúdo gratuito e acessível para qualquer pessoa que queira iniciar ou evoluir na área de tecnologia.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="currentColor"/></svg>
              </div>
              <h3>Aprendizado Estruturado</h3>
              <p>Jornadas, planos de estudo e quadros de planejamento para guiar cada aluno do zero ao avançado.</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-container">
          <div className="footer-bottom">
            <p>&copy; 2026 Learnly. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SobreNos;
