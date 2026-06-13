import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { certificadosAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../Header/Header';
import '../../styles/certificado.css';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const IconArrowLeft = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/>
  </svg>
);

const IconDownload = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/>
    <line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);

const IconPrinter = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 6 2 18 2 18 9"/>
    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
    <rect x="6" y="14" width="12" height="8"/>
  </svg>
);

const IconAward = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="6"/>
    <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
  </svg>
);

const IconAlertCircle = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/>
    <line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);

/* Decorative corner SVG */
const CornerOrnament = () => (
  <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M4 44 L4 4 L44 4"/>
    <path d="M12 44 L12 12 L44 12"/>
    <circle cx="4" cy="4" r="2.5" fill="currentColor" stroke="none"/>
  </svg>
);

const fmt = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
};

const certCode = (id) => `LRLY-${String(id).padStart(6, '0')}`;

const CertificadoPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { usuario } = useAuth();

  const [cert, setCert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!usuario) { navigate('/login'); return; }
    setLoading(true);
    certificadosAPI.detalhes(id)
      .then(r => setCert(r.data))
      .catch(e => {
        const msg = e?.response?.data?.erro;
        setError(msg === 'Sem permissão'
          ? 'Você não tem permissão para acessar este certificado.'
          : msg === 'Certificado não encontrado'
          ? 'Certificado não encontrado.'
          : 'Não foi possível carregar o certificado.');
      })
      .finally(() => setLoading(false));
  }, [id, usuario]);

  const handleDownloadPDF = async () => {
    const el = document.getElementById('cert-document');
    if (!el) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: '#fff' });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [canvas.width / 2, canvas.height / 2] });
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2);
      pdf.save(`certificado-${cert.id}.pdf`);
    } catch {
      // fallback to print
      window.print();
    }
    setDownloading(false);
  };

  if (loading) return (
    <div className="cert-page">
      <Header />
      <div className="cert-center-wrap">
        <div className="loading-spinner" />
        <p style={{ color: '#888' }}>Carregando certificado...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="cert-page">
      <Header />
      <div className="cert-center-wrap">
        <div className="cert-error-icon"><IconAlertCircle /></div>
        <h2 className="cert-error-title">Certificado indisponível</h2>
        <p className="cert-error-desc">{error}</p>
        <button className="cert-back-btn" style={{ marginTop: 8 }} onClick={() => navigate('/perfil')}>
          <IconArrowLeft /> Voltar ao Perfil
        </button>
      </div>
    </div>
  );

  const completionDate = cert.dataConclusao || cert.dataEmissao;

  return (
    <div className="cert-page">
      <Header />

      <div className="cert-layout">

        {/* Toolbar */}
        <div className="cert-toolbar">
          <button className="cert-back-btn" onClick={() => navigate('/perfil')}>
            <IconArrowLeft /> Voltar ao Perfil
          </button>
          <div className="cert-action-group">
            <button className="cert-btn cert-btn-secondary" onClick={() => window.print()}>
              <IconPrinter /> Imprimir
            </button>
            <button className="cert-btn cert-btn-primary" onClick={handleDownloadPDF} disabled={downloading}>
              <IconDownload /> {downloading ? 'Gerando PDF...' : 'Baixar PDF'}
            </button>
          </div>
        </div>

        {/* Certificate document */}
        <div id="cert-document">
          <div className="cert-outer-border">
            <div className="cert-inner">

              {/* Corner ornaments */}
              <span className="cert-corner cert-corner-tl"><CornerOrnament /></span>
              <span className="cert-corner cert-corner-tr"><CornerOrnament /></span>
              <span className="cert-corner cert-corner-bl"><CornerOrnament /></span>
              <span className="cert-corner cert-corner-br"><CornerOrnament /></span>

              {/* Watermark */}
              <div className="cert-watermark"><IconAward /></div>

              {/* Header */}
              <div className="cert-header">
                <p className="cert-platform-name">Learnly</p>
                <h1 className="cert-title-main">Certificado</h1>
                <p className="cert-title-sub">de Conclusão</p>
              </div>

              <div className="cert-divider">
                <div className="cert-divider-line" />
                <span className="cert-divider-star">✦</span>
                <div className="cert-divider-line" />
              </div>

              {/* Body */}
              <div className="cert-body">
                <p className="cert-presented-to">Este certificado é concedido a</p>
                <h2 className="cert-recipient-name">{cert.nomeUsuario}</h2>

                <p className="cert-completed-label">pela conclusão do curso</p>
                <h3 className="cert-course-name">{cert.tituloCurso}</h3>

                {cert.categoriaCurso && (
                  <span className="cert-category">{cert.categoriaCurso}</span>
                )}
              </div>

              <div className="cert-divider" style={{ margin: '40px 0 0' }}>
                <div className="cert-divider-line" />
                <span className="cert-divider-star">✦</span>
                <div className="cert-divider-line" />
              </div>

              {/* Footer */}
              <div className="cert-footer">

                <div className="cert-footer-block">
                  <div className="cert-signature-line" />
                  <span className="cert-footer-label">Data de Conclusão</span>
                  <span className="cert-footer-value">{fmt(completionDate)}</span>
                </div>

                <div className="cert-footer-block center">
                  <div className="cert-seal"><IconAward /></div>
                  <span className="cert-footer-label" style={{ marginTop: 8 }}>Learnly Platform</span>
                  <span className="cert-cert-id">{certCode(cert.id)}</span>
                </div>

                <div className="cert-footer-block" style={{ alignItems: 'flex-end' }}>
                  <div className="cert-signature-line" />
                  {cert.nomeInstrutor ? (
                    <>
                      <span className="cert-footer-label">Instrutor</span>
                      <span className="cert-footer-value">{cert.nomeInstrutor}</span>
                    </>
                  ) : (
                    <>
                      <span className="cert-footer-label">Data de Emissão</span>
                      <span className="cert-footer-value">{fmt(cert.dataEmissao)}</span>
                    </>
                  )}
                </div>

              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CertificadoPage;
