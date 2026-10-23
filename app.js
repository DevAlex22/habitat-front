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
  
  const API_SOLICITUDES_URL = 'http://127.0.0.1:8000/api/solicitud';
  const API_CLIENTES_URL = 'http://127.0.0.1:8000/api/cliente';
  const API_TIPOS_FINANCIAMIENTO_URL = 'http://127.0.0.1:8000/api/tipo-financiamiento';

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
      const response = await fetch(API_CLIENTES_URL, {
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
      let url = API_CLIENTES_URL;
      let method = 'POST';

      // Si hay ID, es una actualización (PUT)
      if (id !== '') {
        url = `${API_CLIENTES_URL}/${id}`;
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
      const response = await fetch(`${API_CLIENTES_URL}/${id}`, {
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

  const formSolicitud = document.getElementById('form-solicitud');
  const btnLimpiarSolicitud = document.getElementById('btn-limpiar-solicitud');
  const tablaSolicitudesBody = document.getElementById('tabla-solicitudes-body');
  const formSolicitudTitle = document.getElementById('form-solicitud-title');
  const inputFecha = document.getElementById('fecha_solicitud');

  // Fecha actual automática
  function setFechaActual() {
    inputFecha.value = new Date().toISOString().split('T')[0];
  }
  setFechaActual();

  async function cargarCombosClientes() {
    try {
      const res = await fetch(API_CLIENTES_URL, { headers: { 'Accept': 'application/json' } });
      const clientes = await res.json();
      const selectCliente = document.getElementById('select-cliente');
      selectCliente.innerHTML = '<option value="">Seleccione un cliente...</option>';
      clientes.forEach(c => {
        selectCliente.innerHTML += `<option value="${c.idcliente}">${c.nombre_cliente} (${c.edad_cliente})</option>`;
      });
    } catch (error) {
      console.error('Error al cargar combo clientes:', error);
    }
  }

  async function cargarCombosTipos() {
    try {
      const res = await fetch(API_TIPOS_FINANCIAMIENTO_URL, { headers: { 'Accept': 'application/json' } });
      const tipos = await res.json();
      const selectTipo = document.getElementById('select-tipo-financiamiento');
      selectTipo.innerHTML = '<option value="">Seleccione un tipo...</option>';
      tipos.forEach(t => {
        selectTipo.innerHTML += `<option value="${t.idtipo_financiamiento}">${t.tipo_financiamiento || t.descripcion}</option>`;
      });
    } catch (error) {
      console.error('Error al cargar tipos de financiamiento:', error);
    }
  }

  function limpiarFormularioSolicitud() {
    formSolicitud.reset();
    document.getElementById('solicitud-id').value = '';
    formSolicitudTitle.textContent = 'Guardar / Editar Solicitud';
    setFechaActual();
  }

  btnLimpiarSolicitud.addEventListener('click', limpiarFormularioSolicitud);

  async function cargarSolicitudes() {
    try {
      const response = await fetch(API_SOLICITUDES_URL, { headers: { 'Accept': 'application/json' } });
      if (!response.ok) throw new Error('Error al cargar solicitudes');
      
      const resultado = await response.json();
      
      // Validamos si la API devolvió success: true y extraemos el array de "data"
      if (resultado.success && Array.isArray(resultado.data)) {
        renderSolicitudes(resultado.data);
      } else {
        renderSolicitudes([]);
      }
    } catch (error) {
      console.error(error);
      tablaSolicitudesBody.innerHTML = `<tr><td colspan="5" class="empty-state" style="color: red;">Error al conectar con API de Solicitudes.</td></tr>`;
    }
  }

  formSolicitud.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('solicitud-id').value;
    const dataSolicitud = {
      id_cliente: document.getElementById('select-cliente').value,
      idtipo_financiamiento: document.getElementById('select-tipo-financiamiento').value,
      monto: document.getElementById('monto').value,
      fecha_solicitud: inputFecha.value
    };

    try {
      const url = id !== '' ? `${API_SOLICITUDES_URL}/${id}` : API_SOLICITUDES_URL;
      const method = id !== '' ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(dataSolicitud)
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert('Error: ' + (errorData.message || JSON.stringify(errorData.errors)));
        return;
      }

      limpiarFormularioSolicitud();
      cargarSolicitudes();
    } catch (error) {
      console.error('Error:', error);
    }
  });

  function renderSolicitudes(solicitudes) {
    tablaSolicitudesBody.innerHTML = '';
    if (!solicitudes || solicitudes.length === 0) {
      tablaSolicitudesBody.innerHTML = `<tr><td colspan="5" class="empty-state">No hay solicitudes registradas.</td></tr>`;
      return;
    }

    solicitudes.forEach(s => {
      // Extraemos los datos de las relaciones que vienen anidadas en el JSON
      const nombreCliente = s.cliente ? s.cliente.nombre_cliente : s.id_cliente;
      const nombreTipo = s.tipofinanciamiento ? s.tipofinanciamiento.tipo_financiamiento : s.idtipo_financiamiento;
      
      // Limpiamos la fecha si viene con hora (ej: "2026-10-23 12:40:10" -> "2026-10-23")
      const fechaLimpia = s.fecha_solicitud ? s.fecha_solicitud.split(' ')[0] : '';

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${nombreCliente}</td>
        <td>${nombreTipo}</td>
        <td>$${Number(s.monto).toLocaleString()}</td>
        <td>${fechaLimpia}</td>
        <td>
          <button class="btn-action delete" onclick="eliminarSolicitud('${s.idsolicitud}')">Eliminar</button>
        </td>
      `;
      tablaSolicitudesBody.appendChild(tr);
    });
  }

  window.editarSolicitud = function(id, id_cliente, idtipo_financiamiento, monto, fecha_solicitud) {
    document.getElementById('solicitud-id').value = id;
    document.getElementById('select-cliente').value = id_cliente;
    document.getElementById('select-tipo-financiamiento').value = idtipo_financiamiento;
    document.getElementById('monto').value = monto;
    document.getElementById('fecha_solicitud').value = fecha_solicitud;
    formSolicitudTitle.textContent = 'Modificando Solicitud...';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  window.eliminarSolicitud = async function(id) {
    if (!confirm('¿Deseas eliminar esta solicitud?')) return;
    try {
      await fetch(`${API_SOLICITUDES_URL}/${id}`, { method: 'DELETE', headers: { 'Accept': 'application/json' } });
      cargarSolicitudes();
      limpiarFormularioSolicitud();
    } catch (error) {
      console.error(error);
    }
  };

  // --- CARGA INICIAL DE AMBOS MÓDULOS ---
  cargarClientes();
  cargarCombosClientes();
  cargarCombosTipos();
  cargarSolicitudes();
});