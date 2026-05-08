import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { useAuth } from '../../hooks/useAuth';

const Dashboard = () => {
  // AQUÍ ESTABA EL ERROR: Agregamos 'user' a la desestructuración
  const { user, token } = useAuth();
  
  const [stats, setStats] = useState({
    usuarios: 0,
    profesionales: 0,
    servicios: 0,
    turnos: 0
  });
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

  useEffect(() => {
    const cargarEstadisticas = async () => {
      try {
        const [resU, resP, resS, resT] = await Promise.all([
          fetch(`${apiUrl}/users`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${apiUrl}/professionals`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${apiUrl}/services`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${apiUrl}/appointments`, { headers: { Authorization: `Bearer ${token}` } })
        ]);

        const [u, p, s, t] = await Promise.all([resU.json(), resP.json(), resS.json(), resT.json()]);

        setStats({
          usuarios: Array.isArray(u) ? u.length : 0,
          profesionales: Array.isArray(p) ? p.length : 0,
          servicios: Array.isArray(s) ? s.length : 0,
          turnos: Array.isArray(t) ? t.length : 0
        });
      } catch (err) {
        console.error("Error cargando dashboard:", err);
      }
    };

    if (token) {
      cargarEstadisticas();
    }
  }, [token, apiUrl]);

  return (
    <div>
      <div style={{ marginBottom: '40px' }}>
        <h2 style={{ color: '#6b21a8', fontSize: '2rem', marginBottom: '8px' }}>
          ¡Hola, {user?.nombre || user?.name || 'Admin'}! 👋
        </h2>
        <p style={{ color: '#64748b', fontSize: '1.1rem' }}>
          Este es el resumen actual de <strong>Espacio Senda</strong>.
        </p>
      </div>

      <div style={styles.grid}>
        <Card style={styles.cardCustom}>
          <div style={styles.cardHeader}><span>Usuarios</span> 👤</div>
          <p style={styles.cardNumber}>{stats.usuarios}</p>
        </Card>

        <Card style={styles.cardCustom}>
          <div style={styles.cardHeader}><span>Profesionales</span> 🩺</div>
          <p style={styles.cardNumber}>{stats.profesionales}</p>
        </Card>

        <Card style={styles.cardCustom}>
          <div style={styles.cardHeader}><span>Servicios</span> ✨</div>
          <p style={styles.cardNumber}>{stats.servicios}</p>
        </Card>

        <Card style={styles.cardCustom}>
          <div style={styles.cardHeader}><span>Turnos Totales</span> 📅</div>
          <p style={{ ...styles.cardNumber, color: '#16a34a' }}>{stats.turnos}</p>
        </Card>
      </div>
    </div>
  );
};

const styles = {
  grid: { 
    display: 'grid', 
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
    gap: '25px' 
  },
  cardCustom: {
    padding: '30px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center'
  },
  cardHeader: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    color: '#64748b', 
    fontWeight: 'bold',
    fontSize: '1.1rem'
  },
  cardNumber: { 
    color: '#6b21a8', 
    fontSize: '3rem', 
    fontWeight: '800', 
    margin: '15px 0 0 0' 
  }
};

export default Dashboard;