async function checkSession() {
  try {
    const response = await fetch("/api/sessions/current", {
      credentials: "include",
    });

    if (response.status === 401) {
      const data = await response.json();

      if (
        confirm(
          `Sesión expirada: ${data.message}\n\n¿Desea ir a la página de login?`,
        )
      ) {
        window.location.href = "/";
      }
      return false;
    }
    return true;
  } catch (error) {
    console.error("Error verificando sesión:", error);
    return false;
  }
}

// Checkeo por tiempo
let sessionCheckInterval;

function startSessionChecker() {
  if (sessionCheckInterval) clearInterval(sessionCheckInterval);

  sessionCheckInterval = setInterval(async () => {
    const isValid = await checkSession();
    if (!isValid) {
      clearInterval(sessionCheckInterval);
    }
  }, 2900); // 29 segundos
  //, 2 * 60 * 1000 - 2000);
}

async function addToCart(pid) {
  // Verificacion sesion
  const sessionValid = await checkSession();
  if (!sessionValid) return;

  let cartId = localStorage.getItem("cartId");

  if (!cartId) {
    const createCartResponse = await fetch("/api/carts", {
      method: "POST",
      credentials: "include",
    });

    const createCart = await createCartResponse.json();

    if (createCart.status === "error") {
      return alert(createCart.message);
    }

    console.log(createCart);

    cartId = createCart.payload._id;
    localStorage.setItem("cartId", cartId);
  }

  const addProductResponse = await fetch(
    `/api/carts/${cartId}/product/${pid}`,
    {
      method: "POST",
      credentials: "include",
    },
  );

  const addProduct = await addProductResponse.json();

  if (addProduct.status === "error") {
    return alert(addProduct.message);
  }

  showButtonCart();
  alert("Producto añadido satisfactoriamente!");
}

function showButtonCart() {
  const cartId = localStorage.getItem("cartId");

  if (cartId) {
    // Verificar carrito
    fetch(`/api/carts/${cartId}`, {
      credentials: "include",
    })
      .then((response) => {
        if (response.ok) {
          const cartButton = document.querySelector("#button-cart");
          const cartView = document.querySelector(".view-cart");

          if (cartButton) {
            cartButton.setAttribute("href", `/cart/${cartId}`);
          }
          if (cartView) {
            cartView.style.display = "block";
          }
        } else {
          localStorage.removeItem("cartId");
          console.log("Carrito no encontrado, limpiando localStorage");
        }
      })
      .catch((error) => {
        console.error("Error verificando carrito:", error);
        localStorage.removeItem("cartId");
      });
  }
}

async function logout() {
  try {
    const response = await fetch("/api/sessions/logout", {
      method: "POST",
      credentials: "include",
    });

    if (response.ok) {
      if (sessionCheckInterval) clearInterval(sessionCheckInterval);

      // Notificar a otras pestañas
      if (typeof BroadcastChannel !== "undefined") {
        const channel = new BroadcastChannel("auth_channel");
        channel.postMessage({ type: "logout" });
        channel.close();
      }

      window.location.href = "/";
    }
  } catch (error) {
    console.error("Error en logout:", error);
  }
}

// Sincronizar pestañas
if (typeof BroadcastChannel !== "undefined") {
  const authChannel = new BroadcastChannel("auth_channel");
  authChannel.onmessage = (event) => {
    if (event.data.type === "logout") {
      if (sessionCheckInterval) clearInterval(sessionCheckInterval);
      window.location.href = "/";
    }
  };
}
  

document.addEventListener("DOMContentLoaded", () => {
  setTimeout(startSessionChecker, 2000);

  document.addEventListener("click", async (e) => {
    if (
      e.target.id === "button-cart" ||
      (e.target.onclick && e.target.onclick.toString().includes("addToCart"))
    ) {
      await checkSession();
    }
  });
});

showButtonCart();
