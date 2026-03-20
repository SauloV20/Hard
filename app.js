/**
 * HARD E-COMMERCE — app.js v2
 */
document.addEventListener("DOMContentLoaded", () => {

  // NAV SCROLL
  const navbar = document.getElementById("navbar");
  window.addEventListener("scroll", () => {
    navbar.classList.toggle("scrolled", window.scrollY > 40);
  });

  // HAMBURGER
  const hamburger = document.getElementById("hamburger");
  const navLinks  = document.getElementById("navLinks");
  hamburger?.addEventListener("click", () => {
    navLinks.classList.toggle("open");
  });

  // SMOOTH SCROLL
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener("click", e => {
      const target = document.querySelector(link.getAttribute("href"));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth" });
        navLinks.classList.remove("open");
      }
    });
  });

  // SCROLL REVEAL
  const reveal = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        entry.target.style.transition = `opacity .6s ${i * 0.07}s ease, transform .6s ${i * 0.07}s ease`;
        entry.target.style.opacity = "1";
        entry.target.style.transform = "translateY(0)";
        reveal.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll(
    ".sv-item, .res-card, .step-card, .dep-card, .snum, .m-card"
  ).forEach(el => {
    el.style.opacity = "0";
    el.style.transform = "translateY(20px)";
    reveal.observe(el);
  });

  // ADMIN PANEL
  const toggleBtn  = document.getElementById("toggleAdmin");
  const adminPanel = document.getElementById("adminPanel");
  const cancelBtn  = document.getElementById("cancelarDep");

  toggleBtn?.addEventListener("click", () => {
    adminPanel.classList.toggle("open");
    toggleBtn.textContent = adminPanel.classList.contains("open")
      ? "x Fechar" : "+ Adicionar depoimento";
  });
  cancelBtn?.addEventListener("click", () => {
    adminPanel.classList.remove("open");
    toggleBtn.textContent = "+ Adicionar depoimento";
    limparForm();
  });

  // DEPOIMENTOS
  const depGrid    = document.getElementById("depGrid");
  const depLoading = document.getElementById("depLoading");

  async function carregarDepoimentos() {
    depLoading.style.display = "block";
    depGrid.innerHTML = "";
    try {
      const deps = await window.HardAPI.listar();
      depLoading.style.display = "none";
      if (!deps.length) {
        depGrid.innerHTML = '<p style="color:var(--gray);text-align:center;grid-column:1/-1;padding:40px">Nenhum depoimento ainda.</p>';
        return;
      }
      deps.forEach((dep, i) => depGrid.appendChild(criarCard(dep, i)));
    } catch (err) {
      depLoading.textContent = "Erro ao carregar depoimentos.";
    }
  }

  function criarCard(dep, index) {
    const card = document.createElement("div");
    card.className = "dep-card";
    card.style.animationDelay = index * 0.08 + "s";
    const estrelas = "★".repeat(dep.nota) + "☆".repeat(5 - dep.nota);
    const data = new Date(dep.created_at).toLocaleDateString("pt-BR", { month: "short", year: "numeric" });
    card.innerHTML =
      '<div class="dep-stars">' + estrelas + '</div>' +
      '<p class="dep-texto">"' + esc(dep.texto) + '"</p>' +
      '<div class="dep-footer">' +
        '<div class="dep-nome">' + esc(dep.nome) + '</div>' +
        '<div class="dep-empresa">' + esc(dep.empresa || "") + ' · ' + data + '</div>' +
        (dep.resultado ? '<span class="dep-resultado">' + esc(dep.resultado) + '</span>' : '') +
      '</div>';
    return card;
  }

  // SALVAR
  const salvarBtn = document.getElementById("salvarDep");
  const formMsg   = document.getElementById("formMsg");

  salvarBtn?.addEventListener("click", async () => {
    const payload = {
      nome:      document.getElementById("depNome").value,
      empresa:   document.getElementById("depEmpresa").value,
      texto:     document.getElementById("depTexto").value,
      resultado: document.getElementById("depResultado").value,
      nota:      parseInt(document.getElementById("depNota").value) || 5,
    };
    formMsg.className = "form-msg";
    formMsg.textContent = "";
    try {
      salvarBtn.disabled = true;
      salvarBtn.textContent = "Salvando...";
      await window.HardAPI.criar(payload);
      formMsg.className = "form-msg success";
      formMsg.textContent = "Depoimento salvo!";
      limparForm();
      await carregarDepoimentos();
      setTimeout(() => {
        adminPanel.classList.remove("open");
        toggleBtn.textContent = "+ Adicionar depoimento";
        formMsg.textContent = "";
      }, 2000);
    } catch (err) {
      formMsg.className = "form-msg error";
      formMsg.textContent = err.message;
    } finally {
      salvarBtn.disabled = false;
      salvarBtn.textContent = "Salvar depoimento";
    }
  });

  function limparForm() {
    ["depNome","depEmpresa","depTexto","depResultado"].forEach(function(id) {
      var el = document.getElementById(id);
      if (el) el.value = "";
    });
    var nota = document.getElementById("depNota");
    if (nota) nota.value = "5";
  }

  function esc(str) {
    return String(str)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  carregarDepoimentos();
});
