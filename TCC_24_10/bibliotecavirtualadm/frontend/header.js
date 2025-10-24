async function carregarHeader() {
    try {
      const response = await fetch("/frontend/header.html");
      const headerHTML = await response.text();
      document.body.insertAdjacentHTML("afterbegin", headerHTML);
      await inicializarHeader();
    } catch (err) {
      console.error("Erro ao carregar header:", err);
    }
  }
  
  const API_URL = window.APP_CONFIG?.API_URL || "http://10.111.9.47:3009";
  
  async function inicializarHeader() {
    await carregarDadosUsuario();
    marcarPaginaAtiva();
  }
  
  async function carregarDadosUsuario() {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) return;
  
      const res = await fetch(`${API_URL}/administrador/${userId}`);
      if (!res.ok) throw new Error("Erro ao buscar dados");
  
      const user = await res.json();
      atualizarHeaderUsuario(user);
    } catch (err) {
      console.error("Erro ao carregar usuário:", err);
    }
  }
  
  function atualizarHeaderUsuario(user) {
    const avatar = document.getElementById("user-avatar");
    const nome = document.getElementById("user-name");
  
    if (!avatar || !nome) return;
  
    nome.textContent = user.nome || "Usuário";
    if (user.foto && user.foto !== "/uploads/usericon.png") {
      avatar.innerHTML = `<img src="${API_URL}${user.foto}" alt="Foto do Usuário" onerror="this.src='Imagem/usericon.png'">`;
    } else {
      avatar.innerHTML = "👤";
    }
  }
  
  function handleLogout() {
    if (confirm("Deseja realmente sair?")) {
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = "/frontend/login.html";
    }
  }
  
  function marcarPaginaAtiva() {
    const current = window.location.pathname.split("/").pop() || "home.html";
    const links = document.querySelectorAll(".nav-link");
    const userSection = document.querySelector(".user-section");
  
    links.forEach((l) => l.classList.remove("active"));
  
    if (current === "perfil.html") {
      if (userSection) userSection.style.display = "none";
      const nav = document.querySelector("nav .nav-links");
      if (nav)
        nav.innerHTML = `
          <li class="nav-item">
            <a href="perfil.html" class="nav-link active">Perfil</a>
          </li>`;
      return;
    }
  
    if (userSection) userSection.style.display = "flex";
  
    links.forEach((link) => {
      if (link.getAttribute("href").endsWith(current)) {
        link.classList.add("active");
      }
    });
  }
  
  window.addEventListener("DOMContentLoaded", carregarHeader);
  