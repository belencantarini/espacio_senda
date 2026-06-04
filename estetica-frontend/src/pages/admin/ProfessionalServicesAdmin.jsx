import { useState, useEffect } from "react";
import { Table, Tr, Td } from "../../components/ui/Table";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { useAuth } from "../../hooks/useAuth";
import axios from "axios";

const BASE = `${import.meta.env.VITE_API_URL || "http://localhost:3000/api"}`;

const obtenerProfesionales = async (token) => {
  const res = await axios.get(`${BASE}/professionals`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

const obtenerServiciosDeProfesional = async (professionalId, token) => {
  const res = await axios.get(
    `${BASE}/services/professional-services/by-professional/${professionalId}`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  return res.data;
};

const actualizarProfessionalService = async (id, data, token) => {
  const res = await axios.patch(
    `${BASE}/services/professional-services/${id}`,
    data,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  return res.data;
};

const ProfessionalServicesAdmin = () => {
  const [profesionales, setProfesionales] = useState([]);
  const [profesionalSeleccionadoId, setProfesionalSeleccionadoId] = useState("");
  const [servicios, setServicios] = useState([]);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(true);
  const [cargandoServicios, setCargandoServicios] = useState(false);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [servicioEditando, setServicioEditando] = useState(null);
  const [formData, setFormData] = useState({
    price: "",
    durationMinutes: "",
  });
  const [errorForm, setErrorForm] = useState("");
  const [cargandoForm, setCargandoForm] = useState(false);

  const { token } = useAuth();

  const cargarProfesionales = async () => {
    try {
      const data = await obtenerProfesionales(token);
      setProfesionales(data);
      if (data.length > 0) {
        setProfesionalSeleccionadoId(data[0].id);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  const cargarServicios = async (professionalId) => {
    setCargandoServicios(true);
    setError("");
    try {
      const data = await obtenerServiciosDeProfesional(professionalId, token);
      setServicios(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargandoServicios(false);
    }
  };

  useEffect(() => {
    if (token) {
      cargarProfesionales();
    }
  }, [token]);

  useEffect(() => {
    if (profesionalSeleccionadoId) {
      cargarServicios(profesionalSeleccionadoId);
    }
  }, [profesionalSeleccionadoId]);

  const abrirModalEditar = (ps) => {
    setServicioEditando(ps);
    setFormData({
      price: ps.price,
      durationMinutes: ps.durationMinutes,
    });
    setErrorForm("");
    setModalAbierto(true);
  };

  const guardarCambios = async (e) => {
    e.preventDefault();
    setErrorForm("");
    setCargandoForm(true);
    try {
      await actualizarProfessionalService(
        servicioEditando.id,
        {
          price: Number(formData.price),
          durationMinutes: Number(formData.durationMinutes),
        },
        token,
      );
      setModalAbierto(false);
      cargarServicios(profesionalSeleccionadoId);
    } catch (err) {
      setErrorForm(err.response?.data?.mensaje || err.message);
    } finally {
      setCargandoForm(false);
    }
  };

  if (cargando) {
    return (
      <p style={{ textAlign: "center", marginTop: "50px" }}>
        Cargando profesionales...
      </p>
    );
  }

  return (
    <div style={{ padding: "20px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h2 style={{ color: "#6b21a8" }}>Precios por Profesional</h2>

        <Select
          value={profesionalSeleccionadoId}
          onChange={(e) => setProfesionalSeleccionadoId(e.target.value)}
          options={profesionales.map((p) => ({
            value: p.id,
            label: p.person?.name || p.name,
          }))}
        />
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {cargandoServicios ? (
        <p style={{ textAlign: "center", marginTop: "30px" }}>
          Cargando servicios...
        </p>
      ) : (
        <Table
          headers={[
            "Servicio",
            "Categoría",
            "Duración",
            "Precio",
            "Última actualización",
            "Acciones",
          ]}
        >
          {servicios.map((ps) => (
            <Tr key={ps.id}>
              <Td>
                <strong>{ps.service?.name}</strong>
              </Td>

              <Td>{ps.service?.category?.name}</Td>

              <Td>{ps.durationMinutes} min</Td>

              <Td>
                {Number(ps.price).toLocaleString("es-AR", {
                  style: "currency",
                  currency: "ARS",
                  maximumFractionDigits: 0,
                })}
              </Td>

              <Td>
                {ps.updatedAt
                  ? new Date(ps.updatedAt).toLocaleDateString("es-AR")
                  : "—"}
              </Td>

              <Td>
                <div
                  style={{
                    display: "flex",
                    gap: "8px",
                    justifyContent: "center",
                  }}
                >
                  <Button
                    style={{
                      padding: "6px 12px",
                      fontSize: "12px",
                      backgroundColor: "#64748b",
                    }}
                    onClick={() => abrirModalEditar(ps)}
                  >
                    Editar
                  </Button>
                </div>
              </Td>
            </Tr>
          ))}
        </Table>
      )}

      <Modal
        isOpen={modalAbierto}
        onClose={() => setModalAbierto(false)}
        title={`Editar — ${servicioEditando?.service?.name}`}
      >
        {errorForm && (
          <p
            style={{
              color: "red",
              fontSize: "14px",
              textAlign: "center",
            }}
          >
            {errorForm}
          </p>
        )}

        <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "10px" }}>
          El precio nuevo aplica solo a reservas futuras. Los turnos ya creados
          mantienen el precio original.
        </p>

        <form
          onSubmit={guardarCambios}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "15px",
            marginTop: "10px",
          }}
        >
          <Input
            type="number"
            placeholder="Precio (ARS)"
            value={formData.price}
            onChange={(e) =>
              setFormData({ ...formData, price: e.target.value })
            }
            required
            min={1}
          />

          <Input
            type="number"
            placeholder="Duración (minutos)"
            value={formData.durationMinutes}
            onChange={(e) =>
              setFormData({ ...formData, durationMinutes: e.target.value })
            }
            required
            min={1}
          />

          <div
            style={{
              display: "flex",
              gap: "10px",
              marginTop: "10px",
              justifyContent: "flex-end",
            }}
          >
            <Button
              type="button"
              style={{
                backgroundColor: "#e2e8f0",
                color: "#475569",
              }}
              onClick={() => setModalAbierto(false)}
            >
              Cancelar
            </Button>

            <Button type="submit" disabled={cargandoForm}>
              {cargandoForm ? "Guardando..." : "Guardar cambios"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProfessionalServicesAdmin;