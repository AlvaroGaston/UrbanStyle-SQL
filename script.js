document.addEventListener("DOMContentLoaded", () => {
  // Carrusel
  const carrusel = document.querySelector('.carrusel-contenido');
  const btnIzq = document.querySelector('.btn-carrusel.izq');
  const btnDer = document.querySelector('.btn-carrusel.der');
  const scrollAmount = 300;

  if (btnIzq && btnDer && carrusel) {
    btnIzq.addEventListener('click', () => {
      carrusel.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    });

    btnDer.addEventListener('click', () => {
      carrusel.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    });

    setInterval(() => {
      if (carrusel.scrollLeft + carrusel.offsetWidth >= carrusel.scrollWidth - 10) {
        carrusel.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        carrusel.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }, 3500);
  }

  // Agregar al carrito
  const botonesComprar = document.querySelectorAll(".buy-btn");

  botonesComprar.forEach(boton => {
    boton.addEventListener("click", () => {
      const producto = boton.parentElement;
      const nombre = producto.querySelector("h1").textContent;
      const precioTexto = producto.querySelector("h2").textContent;
      const imagen = producto.querySelector("img").getAttribute("src");

      const precio = parseInt(precioTexto.replace(/[^0-9]/g, ''));

      const nuevoItem = { nombre, precio, imagen };

      let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
      carrito.push(nuevoItem);
      localStorage.setItem("carrito", JSON.stringify(carrito));

      alert(`${nombre} se agregó al carrito.`);
    });
  });

  // Mostrar carrito
  const contenedorCarrito = document.getElementById("cart-container");

  if (contenedorCarrito) {
    const carrito = JSON.parse(localStorage.getItem("carrito")) || [];

    let total = 0;

    carrito.forEach(item => {
      total += item.precio;

      const div = document.createElement("div");
      div.classList.add("item-carrito");
      div.innerHTML = `
        <img src="${item.imagen}" alt="${item.nombre}" class="carrito-img" />
        <div>
          <h2>${item.nombre}</h2>
          <p>$${item.precio.toLocaleString()}</p>
        </div>
      `;
      contenedorCarrito.appendChild(div);
    });

    const totalDiv = document.createElement("div");
    totalDiv.classList.add("total-carrito");
    totalDiv.innerHTML = `<h3>Total a pagar: $${total.toLocaleString()}</h3>`;
    contenedorCarrito.appendChild(totalDiv);
  }

  // Vaciar carrito
  const btnVaciar = document.getElementById("clear-cart");

  if (btnVaciar) {
    btnVaciar.addEventListener("click", () => {
      localStorage.removeItem("carrito");
      location.reload();
    });
  }

  // Finalizar compra
  const btnCheckout = document.getElementById("checkout");

  if (btnCheckout) {
    btnCheckout.addEventListener("click", () => {
      const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
      if (carrito.length === 0) {
        alert("El carrito está vacío.");
        return;
      }

      const total = carrito.reduce((acc, item) => acc + item.precio, 0);
      alert(`Gracias por tu compra.\nTotal pagado: $${total.toLocaleString()}`);
      localStorage.removeItem("carrito");
      location.reload();
    });
  }

  // Selector tipo de registro
  const tipoRegistroRadios = document.getElementsByName("tipoRegistro");
  const extraFields = document.getElementById("extraFields");

  tipoRegistroRadios.forEach(radio => {
    radio.addEventListener("change", () => {
      if (document.getElementById("nuevo").checked) {
        extraFields.style.display = "block";
      } else {
        extraFields.style.display = "none";
      }
    });
  });
});

// Modal abrir/cerrar
function openModal() {
  document.getElementById("registerModal").style.display = "flex";
}

function closeModal() {
  document.getElementById("registerModal").style.display = "none";
}

// Cerrar al hacer clic fuera del modal
window.onclick = function(event) {
  const modal = document.getElementById("registerModal");
  if (event.target == modal) {
    closeModal();
  }
};

// Validación de registro
function validarRegistro() {
  const esNuevo = document.getElementById("nuevo").checked;
  if (esNuevo) {
    const direccion = document.getElementById("direccion").value.trim();
    const dni = document.getElementById("dni").value.trim();

    if (!direccion || !dni) {
      alert("Por favor completá dirección y DNI.");
      return false;
    }

    if (!/^\d{7,8}$/.test(dni)) {
      alert("El DNI debe tener entre 7 y 8 números.");
      return false;
    }
  }

  alert("Formulario enviado correctamente.");
  return true;
}

