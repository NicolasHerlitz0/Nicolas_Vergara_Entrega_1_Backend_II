function saveToken(token) {
  localStorage.setItem("jwt_token", token);
}

function getToken() {
  return localStorage.getItem("jwt_token");
}

function removeToken() {
  localStorage.removeItem("jwt_token");
}

// funciones globales
window.saveToken = saveToken;
window.getToken = getToken;
window.removeToken = removeToken;

// Manejo del formulario de login
document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;

      try {
        const res = await fetch("/api/sessions/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        const data = await res.json();
        if (res.ok && data.token) {
          saveToken(data.token);
          window.location.href = "/products";
        } else {
          alert(data.message || "Error al loguearse");
        }
      } catch (err) {
        alert("Error de red");
      }
    });
  }

  const registerForm = document.getElementById("register-form");
  if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const first_name = document.getElementById("first_name").value;
      const last_name = document.getElementById("last_name").value;
      const email = document.getElementById("email").value;
      const age = document.getElementById("age").value;
      const password = document.getElementById("password").value;

      try {
        const res = await fetch("/api/sessions/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ first_name, last_name, email, age, password }),
        });

        const data = await res.json();
        if (res.ok && data.token) {
          saveToken(data.token);
          window.location.href = "/products";
        } else {
          alert(data.message || "Error en registro");
        }
      } catch (err) {
        alert("Error de red");
      }
    });
  }
});
