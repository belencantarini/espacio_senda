import { useState, useEffect } from "react";
import { Table, Tr, Td } from "../../components/ui/Table";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { Input } from "../../components/ui/Input";
import { useAuth } from "../../hooks/useAuth";
import {
  obtenerCategorias,
  crearCategoria,
  actualizarCategoria,
} from "../../api/services.api";

const CategoriaServiciosAdmin = () => {
  const [categorias, setCategorias] = useState([]);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(true);

  const [modalFormAbierto, setModalFormAbierto] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [categoriaEditandoId, setCategoriaEditandoId] = useState(null);

  const [formData, setFormData] = useState({ name: "" });
  const [errorForm, setErrorForm] = useState("");
  const [cargandoForm, setCargandoForm] = useState(false);

  const [draggingIndex, setDraggingIndex] = useState(null);

  const { token } = useAuth();

  const cargarCategorias = async () => {
    try {
      const data = await obtenerCategorias(token);
      setCategorias(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (token) {
      cargarCategorias();
    }
  }, [token]);

  // DRAG AND DROP

  const handleDragStart = (index) => {
    setDraggingIndex(index);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (index) => {
    if (draggingIndex === null || draggingIndex === index) return;

    const nuevaLista = [...categorias];
    const [movida] = nuevaLista.splice(draggingIndex, 1);
    nuevaLista.splice(index, 0, movida);

    const listaActualizada = nuevaLista.map((cat, i) => ({
      ...cat,
      displayOrder: i + 1,
    }));

    setCategorias(listaActualizada);
    setDraggingIndex(null);

    try {
      await Promise.all(
        listaActualizada.map((cat) =>
          actualizarCategoria(cat.id, { displayOrder: cat.displayOrder }, token),
        ),
      );
    } catch (err) {
      setError(err.message);
      cargarCategorias();
    }
  };

  // MODAL CREAR

  const abrirModalCrear = () => {
    setModoEdicion(false);
    setCategoriaEditandoId(null);
    setFormData({ name: "" });
    setErrorForm("");
    setModalFormAbierto(true);
  };

  // MODAL EDITAR

  const abrirModalEditar = (categoria) => {
    setModoEdicion(true);
    setCategoriaEditandoId(categoria.id);
    setFormData({ name: categoria.name });
    setErrorForm("");
    setModalFormAbierto(true);
  };

  // GUARDAR

  const guardarCategoria = async (e) => {
    e.preventDefault();
    setErrorForm("");
    setCargandoForm(true);
    try {
      if (modoEdicion) {
        await actualizarCategoria(categoriaEditandoId, formData, token);
      } else {
        await crearCategoria(
          { name: formData.name, displayOrder: categorias.length + 1 },
          token,
        );
      }
      setModalFormAbierto(false);
      cargarCategorias();
    } catch (err) {
      setErrorForm(err.response?.data?.mensaje || err.message);
    } finally {
      setCargandoForm(false);
    }
  };

  if (cargando) {
    return (
      <p style={{ textAlign: "center", marginTop: "50px" }}>
        Cargando categorías...
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
        <h2 style={{ color: "#6b21a8" }}>Categorías de Servicios</h2>

        <Button onClick={abrirModalCrear}>+ Nueva Categoría</Button>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "12px" }}>
        Arrastrá las filas para cambiar el orden de las categorías.
      </p>

      <Table headers={["Orden", "Nombre", "Acciones"]}>
        {categorias.map((cat, index) => (
          <Tr
            key={cat.id}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(index)}
            style={{
              cursor: "grab",
              opacity: draggingIndex === index ? 0.4 : 1,
            }}
          >
            <Td>{cat.displayOrder}</Td>

            <Td>
              <strong>{cat.name}</strong>
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
                  onClick={() => abrirModalEditar(cat)}
                >
                  Editar
                </Button>
              </div>
            </Td>
          </Tr>
        ))}
      </Table>

      <Modal
        isOpen={modalFormAbierto}
        onClose={() => setModalFormAbierto(false)}
        title={modoEdicion ? "Editar Categoría" : "Nueva Categoría"}
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

        <form
          onSubmit={guardarCategoria}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "15px",
            marginTop: "10px",
          }}
        >
          <Input
            type="text"
            placeholder="Nombre de la categoría"
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
            required
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
              onClick={() => setModalFormAbierto(false)}
            >
              Cancelar
            </Button>

            <Button type="submit" disabled={cargandoForm}>
              {cargandoForm ? "Guardando..." : "Guardar Categoría"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CategoriaServiciosAdmin;