import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from './ui/Button';

export const Layout = ({ children, title }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const nombreUsuario = user?.person?.name || 'Usuario';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f4f4f9' }}>
      
      <aside style={{
        width: '250px',
        backgroundColor: '#6a1b9a',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        padding: '20px 0'
      }}>
        <div style={{ padding: '0 20px', marginBottom: '30px' }}>
          <h2 style={{ color: 'white', margin: 0, textAlign: 'left' }}>Senda Estética</h2>
          <p style={{ fontSize: '12px', color: '#d1c4e9', marginTop: '5px', marginBottom: '5px' }}>
            Hola, {nombreUsuario}
          </p>
          {/* --- LINK NUEVO --- */}
          <Link to="/admin/mi-perfil" style={{ fontSize: '11px', color: '#ffb74d', textDecoration: 'none', display: 'inline-block', marginTop: '5px' }}>
            🔑 Cambiar Contraseña
          </Link>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '10px', flexGrow: 1, padding: '0 20px' }}>
          <Link to="/admin" style={linkStyle}>Inicio</Link>
          
          {user?.role === 'ADMIN' && (
            <>
              <Link to="/admin/usuarios" style={linkStyle}>Usuarios</Link>
              <Link to="/admin/reportes" style={linkStyle}>Reportes</Link>
            </>
          )}
          
          {['ADMIN', 'RECEPTIONIST'].includes(user?.role) && (
            <>
              <Link to="/admin/turnos" style={linkStyle}>Agenda de Turnos</Link>
              <Link to="/admin/pacientes" style={linkStyle}>Pacientes</Link>
            </>
          )}
        </nav>

        <div style={{ padding: '20px' }}>
          <Button variant="danger" onClick={handleLogout} style={{ width: '100%' }}>
            Cerrar Sesión
          </Button>
        </div>
      </aside>

      <main style={{ flexGrow: 1, padding: '30px', overflowY: 'auto' }}>
        {title && (
          <h1 style={{ color: '#333', borderBottom: '2px solid #e0e0e0', paddingBottom: '10px', marginBottom: '20px' }}>
            {title}
          </h1>
        )}
        
        {children}
        
      </main>
    </div>
  );
};

const linkStyle = {
  color: 'white',
  textDecoration: 'none',
  padding: '10px',
  borderRadius: '5px',
  transition: 'background 0.2s'
};