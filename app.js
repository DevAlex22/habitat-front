document.addEventListener('DOMContentLoaded', () => {
  // NAVEGACIÓN DE TABS (Se mantiene igual)
  const navButtons = document.querySelectorAll('.nav-btn');
  const sections = document.querySelectorAll('.content-section');

  navButtons.forEach(button => {
    button.addEventListener('click', () => {
      const targetId = button.getAttribute('data-target');
      navButtons.forEach(btn => btn.classList.remove('active'));
      sections.forEach(section => section.classList.remove('active'));
      button.classList.add('active');
      document.getElementById(targetId).classList.add('active');
    });
  });

  // --- CRUD CLIENTES CON API LARAVEL ---
  
  const API_URL = 'http://127.0.0.1:8000/api/cliente';

  const formCliente = document.getElementById('form-cliente');
  const btnLimpiar = document.getElementById('btn-limpiar');
  const tablaBody = document.getElementById('tabla-clientes-body');
  const formTitle = document.getElementById('form-title');

  // Limpiar formulario
  function limpiarFormulario() {
    formCliente.reset();
    document.getElementById('cliente-id').value = '';
    formTitle.textContent = 'Guardar / Editar Cliente';
  }

  btnLimpiar.addEventListener('click', limpiarFormulario);

  // 1. OBTENER (GET) - Listar clientes desde Laravel
  async function cargarClientes() {
    try {
      const response = await fetch(API_URL, {
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) throw new Error('Error al cargar los clientes');
      
      const clientes = await response.json();
      renderClientes(clientes);
    } catch (error) {
      console.error(error);
      tablaBody.innerHTML = `<tr><td colspan="5" class="empty-state" style="color: red;">Error de conexión con la API de Laravel.</td></tr>`;
    }
  }

  // 2. CREAR Y ACTUALIZAR (POST / PUT)
  formCliente.addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = document.getElementById('cliente-id').value;
    const dataCliente = {
        nombre_cliente: document.getElementById('nombre').value,
        dpi_cliente: document.getElementById('identificacion').value,
        edad_cliente: document.getElementById('edad').value,
        direccion_cliente: document.getElementById('direccion').value
    };

    try {
      let url = API_URL;
      let method = 'POST';

      // Si hay ID, es una actualización (PUT)
      if (id !== '') {
        url = `${API_URL}/${id}`;
        method = 'PUT';
      }

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(dataCliente)
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert('Error al guardar: ' + (errorData.message || JSON.stringify(errorData.errors)));
        return;
      }

      limpiarFormulario();
      cargarClientes(); // Recargar la tabla
    } catch (error) {
      console.error('Error en la petición:', error);
    }
  });

  // Renderizar la tabla en el DOM
  function renderClientes(clientes) {
    tablaBody.innerHTML = '';

    if (!clientes || clientes.length === 0) {
      tablaBody.innerHTML = `<tr><td colspan="5" class="empty-state">No hay clientes registrados.</td></tr>`;
      return;
    }

    clientes.forEach(c => {
      const tr = document.createElement('tr');
      // Nota: Asumimos que tu base de datos en Laravel usa 'id' como llave primaria numérica/UUID
      tr.innerHTML = `
        <td>${c.dpi_cliente}</td>
        <td>${c.nombre_cliente}</td>
        <td>${c.edad_cliente}</td>
        <td>${c.direccion_cliente}</td>
        <td>
          <button class="btn-action edit" onclick="prepararEdicion('${c.idcliente}', '${c.dpi_cliente}', '${c.nombre_cliente}', '${c.edad_cliente}', '${c.direccion_cliente}')">Editar</button>
          <button class="btn-action delete" onclick="eliminarCliente('${c.idcliente}')">Eliminar</button>
        </td>
      `;
      tablaBody.appendChild(tr);
    });
  }

  // 3. ELIMINAR (DELETE)
  window.eliminarCliente = async function(id) {
    if (!confirm('¿Deseas eliminar este cliente?')) return;

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) throw new Error('No se pudo eliminar el registro');

      cargarClientes();
      limpiarFormulario();
    } catch (error) {
      console.error(error);
      alert('Ocurrió un error al intentar eliminar.');
    }
  };

  // Preparar formulario para edición (cargando los datos directamente)
  window.prepararEdicion = function(id, identificacion, nombre, edad, direccion) {
    document.getElementById('cliente-id').value = id;
    document.getElementById('identificacion').value = identificacion;
    document.getElementById('nombre').value = nombre;
    document.getElementById('edad').value = edad;
    document.getElementById('direccion').value = direccion;
    formTitle.textContent = 'Modificando Cliente...';
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Sube la pantalla al formulario
  };

  // Carga inicial al abrir la página
  cargarClientes();
});