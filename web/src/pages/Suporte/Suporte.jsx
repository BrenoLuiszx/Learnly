import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../Header/Header';
import '../../styles/suporte.css';

const FAQS = [
  {
    id: 1,
    question: 'Como a plataforma Learnly funciona?',
    answer:
      'O Learnly é uma plataforma de ensino de tecnologia gratuita. Você pode explorar cursos, se matricular, assistir às aulas em vídeo e acompanhar seu progresso. Crie uma conta, escolha um curso ou uma Jornada e comece a aprender no seu próprio ritmo.',
  },
  {
    id: 2,
    question: 'O que são as Jornadas e como acessá-las?',
    answer:
      'Jornadas são trilhas de aprendizado estruturadas que agrupam cursos em uma sequência lógica — do básico ao avançado. Para acessá-las, clique em "Cursos" no menu superior e role até a seção de Jornadas, ou pesquise "Jornada" na barra de busca.',
  },
  {
    id: 3,
    question: 'Preciso seguir os cursos de uma Jornada em ordem?',
    answer:
      'Sim. As Jornadas são projetadas para um aprendizado progressivo: cada etapa constrói sobre a anterior. Por isso, os cursos devem ser concluídos na ordem apresentada — a próxima etapa só é liberada após a conclusão da atual.',
  },
  {
    id: 4,
    question: 'Como obter, emitir ou baixar um certificado?',
    answer:
      'Ao concluir todas as aulas de um curso, o certificado é gerado automaticamente. Acesse "Meu Perfil" → seção "Certificados" para visualizar e baixar seus certificados em PDF. Certifique-se de que todas as aulas estejam marcadas como concluídas.',
  },
  {
    id: 5,
    question: 'Como acompanhar meu progresso nos cursos?',
    answer:
      'Acesse "Progresso" no menu superior (disponível após login). Lá você encontra estatísticas de aprendizado, cursos em andamento, aulas concluídas e seu histórico de atividades na plataforma.',
  },
  {
    id: 6,
    question: 'Como usar o Plano de Estudo personalizado?',
    answer:
      'O Plano de Estudo gera um caminho de aprendizado baseado nos seus objetivos. Acesse "Plano de Estudo" no menu, responda algumas perguntas sobre sua área de interesse e nível atual, e receba uma trilha personalizada com cursos da plataforma.',
  },
  {
    id: 7,
    question: 'Como me tornar instrutor na plataforma?',
    answer:
      'Acesse "Configurações" → seção "Conta" e clique em "Solicitar acesso de Instrutor". Após aprovação pelo administrador, você terá acesso à Área do Instrutor para criar e gerenciar seus próprios cursos.',
  },
  {
    id: 8,
    question: 'Não consigo acessar uma aula. O que fazer?',
    answer:
      'Verifique se você está logado na sua conta. Algumas aulas exigem matrícula no curso — acesse a página do curso e clique em "Matricular-se". Se o problema persistir, tente limpar o cache do navegador ou acesse de outro dispositivo.',
  },
];

const FaqItem = ({ item }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className={`faq-item${open ? ' faq-item--open' : ''}`}>
      <button className="faq-question" onClick={() => setOpen(o => !o)} aria-expanded={open}>
        <span>{item.question}</span>
        <svg className="faq-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {open && <div className="faq-answer">{item.answer}</div>}
    </div>
  );
};

const Suporte = () => {
  const navigate = useNavigate();

  return (
    <div className="suporte-page">
      <Header />

      <main className="suporte-main">
        {/* Hero */}
        <section className="suporte-hero">
          <div className="suporte-hero-inner">
            <span className="suporte-badge">Central de Ajuda</span>
            <h1 className="suporte-title">Como podemos <span className="gradient-text">ajudar?</span></h1>
            <p className="suporte-subtitle">
              Encontre respostas para as dúvidas mais comuns sobre a plataforma.
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="suporte-faq-section">
          <div className="suporte-faq-container">
            <h2 className="suporte-faq-title">Dúvidas Frequentes</h2>
            <div className="faq-list">
              {FAQS.map(item => (
                <FaqItem key={item.id} item={item} />
              ))}
            </div>
          </div>
        </section>
      </main>

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

export default Suporte;
