import React from 'react';
import Header from '../Header/Header';
import '../../styles/home.css';

const Usuario = () => {
  return (
    <div className="home-container">
      <Header />
      
      <main>
        <section className="topo-do-site">
          <div className="começo">
            <div className="flex">
              <div className="txt">
                <h1>
                  Cadastre-se e comece a <span>aprender</span> hoje mesmo
                </h1>
                <p>
                  Crie sua conta gratuita e tenha acesso a todos os nossos cursos online.
                </p>
                
                <div className="btn">
                  <button>Criar conta</button>
                </div>
              </div>

              <div className="img-topo-site">
                <img
                  className="outra-img"
                  src="/img/industrias_wd2219_2-1024x680.jpg"
                  alt="Cadastro de usuário"
                />
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Usuario;