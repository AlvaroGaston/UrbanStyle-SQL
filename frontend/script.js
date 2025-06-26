// Función para mostrar un toast de notificación
function mostrarToast(mensaje) {
  let toast = document.getElementById("toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast";
    toast.className = "toast";
    document.body.appendChild(toast);
  }
  toast.textContent = mensaje;
  toast.className = "toast show";
  setTimeout(() => { toast.className = "toast"; }, 3000);
}

// Modal abrir/cerrar Usuario
function openModal() {
  document.getElementById("registerModal").style.display = "flex";
}
function closeModal() {
  document.getElementById("registerModal").style.display = "none";
}
window.onclick = function (event) {
  const modal = document.getElementById("registerModal");
  if (event.target == modal) closeModal();
};

// Validación y envío de registro/login
async function validarRegistro(event) {
  event.preventDefault();

  const esNuevo = document.getElementById("nuevo").checked;
  const nombre = document.getElementById("name").value.trim();
  const apellido = document.getElementById("apellido").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const direccion = document.getElementById("direccion") ? document.getElementById("direccion").value.trim() : '';
  const telefono = document.getElementById("telefono") ? document.getElementById("telefono").value.trim() : '';
  const dni = document.getElementById("dni") ? document.getElementById("dni").value.trim() : '';

  // --- REGISTRO ---
  if (esNuevo) {
    if (!direccion || !dni || !telefono) {
      mostrarToast("Complete dirección, teléfono y DNI.");
      return;
    }
    if (!/^\d{7,8}$/.test(dni)) {
      mostrarToast("DNI inválido.");
      return;
    }

    // 1. Comprobar si email, teléfono o contraseña están repetidos
    try {
      const check = await fetch(`http://localhost:3000/api/clientes/validar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Email: email, Telefono: telefono, Contrasena: password }),
      });
      if (check.ok) {
        const existe = await check.json();
        if (existe.email) {
          mostrarToast("Email ya registrado.");
          return;
        }
        if (existe.telefono) {
          mostrarToast("Teléfono ya registrado.");
          return;
        }
        if (existe.contrasena) {
          mostrarToast("Contraseña ya registrada.");
          return;
        }
      } else {
        mostrarToast("Error al validar datos.");
        return;
      }
    } catch (err) {
      mostrarToast("Error de conexión al validar.");
      return;
    }

    // 2. Registrar si todo está OK
    try {
      const response = await fetch('http://localhost:3000/api/clientes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Nombre: nombre, Apellido: apellido, Email: email, Telefono: telefono, Direccion: direccion, DNI: dni, Contrasena: password }),
      });
      if (response.ok) {
        mostrarToast("Registrado con éxito.");
        closeModal();
      } else {
        const errText = await response.text();
        mostrarToast(errText || "Error al registrar.");
      }
    } catch (error) {
      mostrarToast("Error de conexión.");
    }
    return;
  }

  // --- LOGIN ---
  try {
    const response = await fetch('http://localhost:3000/api/clientes/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ Email: email, Contrasena: password }),
    });
    if (response.ok) {
      const data = await response.json();
      if (data.encontrado) {
        mostrarToast("Bienvenido.");
        closeModal();
        // Aquí podrías guardar sesión/localStorage
      } else {
        mostrarToast("Usuario no encontrado. Regístrese.");
      }
    } else {
      mostrarToast("Usuario no encontrado. Regístrese.");
    }
  } catch (error) {
    mostrarToast("Error de conexión.");
  }
}

// Esperar a que cargue el DOM
document.addEventListener("DOMContentLoaded", () => {
  const registerForm = document.querySelector(".register-form");
  if (registerForm) registerForm.addEventListener("submit", validarRegistro);
});

  // -------------------
  // Carrusel
  // -------------------
  const carrusel = document.querySelector(".carrusel-contenido");
  const btnIzq = document.querySelector(".btn-carrusel.izq");
  const btnDer = document.querySelector(".btn-carrusel.der");
  const scrollAmount = 300;

  if (btnIzq && btnDer && carrusel) {
    btnIzq.addEventListener("click", () => {
      carrusel.scrollBy({ left: -scrollAmount, behavior: "smooth" });
    });

    btnDer.addEventListener("click", () => {
      carrusel.scrollBy({ left: scrollAmount, behavior: "smooth" });
    });

    setInterval(() => {
      if (
        carrusel.scrollLeft + carrusel.offsetWidth >=
        carrusel.scrollWidth - 10
      ) {
        carrusel.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        carrusel.scrollBy({ left: scrollAmount, behavior: "smooth" });
      }
    }, 3500);
  }

  // -------------------
  // Agregar al carrito
  // -------------------
  const botonesComprar = document.querySelectorAll(".buy-btn");

  botonesComprar.forEach((boton) => {
    boton.addEventListener("click", () => {
      const producto = boton.parentElement;
      const nombre = producto.querySelector("h1").textContent;
      const precioTexto = producto.querySelector("h2").textContent;
      const imagen = producto.querySelector("img").getAttribute("src");

      const precio = parseInt(precioTexto.replace(/[^0-9]/g, ""));
      const nuevoItem = { nombre, precio, imagen };

      let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
      carrito.push(nuevoItem);
      localStorage.setItem("carrito", JSON.stringify(carrito));

      mostrarToast(`${nombre} se agregó al carrito.`);
    });
  });

  // -------------------
  // Mostrar carrito
  // -------------------
  const contenedorCarrito = document.getElementById("cart-container");

  if (contenedorCarrito) {
    contenedorCarrito.innerHTML = ""; // Limpiar antes de renderizar
    const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    let total = 0;

    if (carrito.length === 0) {
      contenedorCarrito.innerHTML = '<p class="empty-cart-message">Tu carrito está vacío.</p>';
    } else {
      carrito.forEach((item, index) => {
        total += item.precio;
        const div = document.createElement("div");
        div.classList.add("item-carrito");
        div.innerHTML = `
          <img src="${item.imagen}" alt="${item.nombre}" class="carrito-img" />
          <div>
            <h2>${item.nombre}</h2>
            <p>$${item.precio.toLocaleString()}</p>
            <button class="eliminar-producto" data-index="${index}">Eliminar</button>
          </div>
        `;
        contenedorCarrito.appendChild(div);
      });

      const totalDiv = document.createElement("div");
      totalDiv.classList.add("total-carrito");
      totalDiv.innerHTML = `<h3>Total a pagar: $${total.toLocaleString()}</h3>`;
      contenedorCarrito.appendChild(totalDiv);

      // -------------------
      // Eliminar producto específico
      // -------------------
      document.querySelectorAll(".eliminar-producto").forEach((btn) => {
        btn.addEventListener("click", function () {
          const index = this.getAttribute("data-index");
          let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
          carrito.splice(index, 1); // Elimina ese producto
          localStorage.setItem("carrito", JSON.stringify(carrito));
          location.reload(); // Recarga la página para actualizar el carrito
        });
      });
    }
  }

  // -------------------
  // Vaciar carrito
  // -------------------
  const btnVaciar = document.getElementById("clear-cart");
  if (btnVaciar) {
    btnVaciar.addEventListener("click", () => {
      localStorage.removeItem("carrito");
      location.reload();
    });
  }

  // -------------------
  // Finalizar compra
  // -------------------
  const btnCheckout = document.getElementById("checkout");
  if (btnCheckout) {
    btnCheckout.addEventListener("click", () => {
      const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
      if (carrito.length === 0) {
        mostrarToast("El carrito está vacío.");
        return;
      }

      const total = carrito.reduce((acc, item) => acc + item.precio, 0);
      mostrarToast(`Gracias por tu compra.\nTotal pagado: $${total.toLocaleString()}`);
      localStorage.removeItem("carrito");
      // Aquí podrías enviar los detalles de la compra al backend (tabla Ventas)
      location.reload();
    });
  }

  // -------------------
  // Selector tipo de registro
  // -------------------
  const tipoRegistroRadios = document.getElementsByName("tipoRegistro");
  const extraFields = document.getElementById("extraFields");

  if (tipoRegistroRadios && extraFields) {
    tipoRegistroRadios.forEach((radio) => {
      radio.addEventListener("change", () => {
        if (document.getElementById("nuevo").checked) {
          extraFields.style.display = "block";
        } else {
          extraFields.style.display = "none";
        }
      });
    });
  }

  // ====================================================================================================
  // FUNCIONES PARA CARGAR TABLAS ABM
  // ====================================================================================================

  // Función genérica para cargar datos en una tabla
  async function cargarTabla(endpoint, tableBodyId, headers) {
    const tableBody = document.querySelector(`#${tableBodyId} tbody`);
    if (!tableBody) return; // Salir si el cuerpo de la tabla no existe

    tableBody.innerHTML = ''; // Limpiar tabla antes de cargar

    try {
      const response = await fetch(`http://localhost:3000/api/${endpoint}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      if (data.length === 0) {
        const row = tableBody.insertRow();
        const cell = row.insertCell();
        cell.colSpan = headers.length + 1; // +1 para la columna de acciones
        cell.textContent = `No hay datos disponibles para ${endpoint}.`;
        cell.style.textAlign = 'center';
        return;
      }

      data.forEach(item => {
        const row = tableBody.insertRow();
        headers.forEach(header => {
          const cell = row.insertCell();
          cell.textContent = item[header] !== undefined ? item[header] : ''; // Manejar valores undefined
        });

        // Columna de acciones (Editar/Eliminar)
        const actionsCell = row.insertCell();
        actionsCell.innerHTML = `
          <button class="abm-btn editar" title="Editar" data-id="${item.ID || item.id}">
            <i class="fas fa-pen"></i>
          </button>
          <button class="abm-btn eliminar" title="Eliminar" data-id="${item.ID || item.id}">
            <i class="fas fa-trash"></i>
          </button>
        `;
      });
    } catch (error) {
      console.error(`Error al cargar datos de ${endpoint}:`, error);
      const tableBody = document.querySelector(`#${tableBodyId} tbody`);
      if (tableBody) {
        tableBody.innerHTML = `<tr><td colspan="${headers.length + 1}" style="text-align:center; color:red;">Error al cargar los datos.</td></tr>`;
      }
    }
  }

  // Cargar clientes al visitar Clientes.html
  if (window.location.pathname.endsWith('/Clientes.html')) {
    cargarTabla('clientes', 'clientesTable', ['ID', 'Nombre', 'Apellido', 'Email', 'Telefono']); // Asegúrate de que 'clientesTable' sea el ID de tu tabla
  }

  // Cargar productos al visitar Stock.html
  if (window.location.pathname.endsWith('/Stock.html')) {
    cargarTabla('productos', 'stockTable', ['ID', 'NombreProducto', 'Descripcion', 'Stock', 'Precio']); // Asegúrate de que 'stockTable' sea el ID de tu tabla
  }

  // Cargar ventas al visitar Compras.html
  if (window.location.pathname.endsWith('/Compras.html')) {
    cargarTabla('ventas', 'comprasTable', ['ID', 'Fecha', 'Cliente', 'Producto', 'Cantidad', 'Total']); // Asegúrate de que 'comprasTable' sea el ID de tu tabla
  }

  // Cargar ranking al visitar Ranking.html
  if (window.location.pathname.endsWith('/Ranking.html')) {
    cargarTabla('ranking', 'rankingTable', ['Producto', 'VentasTotales', 'IngresosTotales']); // Asegúrate de que 'rankingTable' sea el ID de tu tabla
  }

  // ====================================================================================================
  // MANEJO DE BOTONES AGREGAR/EDITAR/ELIMINAR (Ejemplo para Clientes)
  // Esto requeriría modales o formularios dinámicos para la entrada de datos
  // ====================================================================================================

  // Ejemplo de manejo de clics en botones de acción (delegación de eventos)
  document.body.addEventListener('click', async (event) => {
    if (event.target.closest('.abm-btn.eliminar')) {
      const button = event.target.closest('.abm-btn.eliminar');
      const id = button.dataset.id;
      if (confirm(`¿Estás seguro de que quieres eliminar el registro con ID ${id}?`)) {
        // Determinar el endpoint basado en la URL actual
        let endpoint = '';
        if (window.location.pathname.endsWith('/Clientes.html')) endpoint = 'clientes';
        else if (window.location.pathname.endsWith('/Stock.html')) endpoint = 'productos';
        // Añadir más condiciones para Compras y Ranking si se implementa eliminación para ellos

        if (endpoint) {
          try {
            const response = await fetch(`http://localhost:3000/api/${endpoint}/${id}`, {
              method: 'DELETE',
            });
            if (response.ok) {
              mostrarToast('Registro eliminado exitosamente.');
              // Recargar la tabla
              if (endpoint === 'clientes') cargarTabla('clientes', 'clientesTable', ['ID', 'Nombre', 'Apellido', 'Email', 'Telefono']);
              else if (endpoint === 'productos') cargarTabla('productos', 'stockTable', ['ID', 'NombreProducto', 'Descripcion', 'Stock', 'Precio']);
            } else {
              const errorText = await response.text();
              mostrarToast(`Error al eliminar: ${errorText}`);
            }
          } catch (error) {
            console.error('Error de red al eliminar:', error);
            mostrarToast('Error de conexión al eliminar el registro.');
          }
        }
      }
    }
    // Lógica similar para botones 'agregar' y 'editar'
  });




