import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home/Home'
import Cursos from './pages/Cursos/Cursos'
import CursoDetalhes from './pages/CursoDetalhes/CursoDetalhes'
import AulaPlayer from './pages/AulaPlayer/AulaPlayer'
import Jornada from './pages/Jornada/Jornada'
import Usuario from './pages/Usuario/Usuario'
import Admin from './pages/Admin/Admin'
import Colaborador from './pages/Colaborador/Colaborador'
import Configuracoes from './pages/Configuracoes/Configuracoes'
import Registro from './pages/Registro/Registro'
import Login from './pages/Login/Login'
import Perfil from './pages/Perfil/Perfil'
import MeusCursos from './pages/MeusCursos/MeusCursos'
import Planning from './pages/Planning/Planning'
import UserDashboard from './pages/UserDashboard/UserDashboard'
import PlanoEstudo from './pages/PlanoEstudo/PlanoEstudo'
import CursoIntro from './pages/CursoIntro/CursoIntro'
import SobreNos from './pages/SobreNos/SobreNos'
import Suporte from './pages/Suporte/Suporte'

const Rotas = () => {
  return (
    <Routes>
      {/* Rotas públicas */}
      <Route path="/" element={<Home />} />
      <Route path="/cursos" element={<Cursos />} />
      <Route path="/sobre" element={<SobreNos />} />
      <Route path="/suporte" element={<Suporte />} />
      <Route path="/curso/:id/intro" element={<CursoIntro />} />
      <Route path="/curso/:id" element={<CursoDetalhes />} />
      <Route path="/curso/:cursoId/aula/:aulaId" element={
        <ProtectedRoute>
          <AulaPlayer />
        </ProtectedRoute>
      } />
      <Route path="/jornada/:slug" element={<Jornada />} />
      <Route path="/registro" element={<Registro />} />
      <Route path="/login" element={<Login />} />

      {/* Rotas autenticadas */}
      <Route path="/usuario" element={<Usuario />} />
      <Route path="/perfil" element={
        <ProtectedRoute>
          <Perfil />
        </ProtectedRoute>
      } />
      <Route path="/meus-cursos" element={
        <ProtectedRoute>
          <MeusCursos />
        </ProtectedRoute>
      } />
      <Route path="/planning" element={
        <ProtectedRoute>
          <Planning />
        </ProtectedRoute>
      } />
      <Route path="/plano-estudo" element={<PlanoEstudo />} />
      <Route path="/progresso" element={
        <ProtectedRoute>
          <UserDashboard />
        </ProtectedRoute>
      } />
      {/* Redirect legacy /user-dashboard to /progresso */}
      <Route path="/user-dashboard" element={<Navigate to="/progresso" replace />} />

      <Route path="/configuracoes" element={
        <ProtectedRoute>
          <Configuracoes />
        </ProtectedRoute>
      } />

      {/* Rota colaborador (instrutor) */}
      <Route path="/colaborador" element={
        <ProtectedRoute requireInstrutor={true}>
          <Colaborador />
        </ProtectedRoute>
      } />
      {/* Redirect legacy /instrutor to /colaborador */}
      <Route path="/instrutor" element={<Navigate to="/colaborador" replace />} />

      {/* Rotas admin */}
      <Route path="/admin" element={
        <ProtectedRoute requireAdmin={true}>
          <Admin />
        </ProtectedRoute>
      } />
      {/* Redirect legacy /cadastro to /admin — course creation is now inside the Admin panel */}
      <Route path="/cadastro" element={<Navigate to="/admin" replace />} />
    </Routes>
  )
}

export default Rotas
