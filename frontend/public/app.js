const state = {
  especialidades: [],
  profissionais: [],
  consultas: []
};

const elements = {
  status: document.querySelector("#api-status"),
  feedback: document.querySelector("#feedback"),
  consultaForm: document.querySelector("#consulta-form"),
  especialidadeForm: document.querySelector("#especialidade-form"),
  profissionalForm: document.querySelector("#profissional-form"),
  especialidadeSelect: document.querySelector("#especialidade-select"),
  medicoSelect: document.querySelector("#medico-select"),
  adminEspecialidadeSelect: document.querySelector("#admin-especialidade-select"),
  consultasList: document.querySelector("#consultas-list"),
  refreshButton: document.querySelector("#refresh-button")
};

async function api(path, options = {}) {
  const response = await fetch(path, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options
  });

  const data = await response.json();
  if (!response.ok) {
    const details = Array.isArray(data.detalhes) ? data.detalhes.join(" ") : "";
    throw new Error([data.erro, details].filter(Boolean).join(" "));
  }

  return data;
}

function setFeedback(message, type = "") {
  elements.feedback.textContent = message;
  elements.feedback.className = `feedback ${type}`.trim();
}

function renderOptions(select, options, placeholder) {
  select.innerHTML = "";
  const empty = document.createElement("option");
  empty.value = "";
  empty.textContent = placeholder;
  select.appendChild(empty);

  options.forEach((option) => {
    const item = document.createElement("option");
    item.value = option.id;
    item.textContent = option.nome;
    select.appendChild(item);
  });
}

function renderProfissionais() {
  const especialidadeId = elements.especialidadeSelect.value;
  const profissionais = state.profissionais.filter((item) => item.especialidadeId === especialidadeId);
  renderOptions(elements.medicoSelect, profissionais, "Selecione");
}

function formatDate(value) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(new Date(value));
}

function renderConsultas() {
  elements.consultasList.innerHTML = "";

  if (state.consultas.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = "Nenhuma consulta cadastrada.";
    elements.consultasList.appendChild(empty);
    return;
  }

  state.consultas.forEach((consulta) => {
    const card = document.createElement("article");
    card.className = `appointment ${consulta.status}`;

    const header = document.createElement("div");
    header.className = "appointment-header";

    const titleWrap = document.createElement("div");
    const title = document.createElement("p");
    title.className = "appointment-title";
    title.textContent = consulta.paciente;
    const meta = document.createElement("div");
    meta.className = "appointment-meta";

    const dateSpan = document.createElement("span");
    dateSpan.textContent = formatDate(consulta.dataHora);

    const profSpan = document.createElement("span");
    profSpan.textContent = `${consulta.especialidade} com ${consulta.medico}`;

    const cpfSpan = document.createElement("span");
    cpfSpan.textContent = `CPF ${consulta.cpf}`;

    meta.append(dateSpan, profSpan, cpfSpan);
    titleWrap.append(title, meta);

    const badge = document.createElement("span");
    badge.className = `badge ${consulta.status}`;
    badge.textContent = consulta.status;
    header.append(titleWrap, badge);
    card.appendChild(header);

    if (consulta.observacoes) {
      const notes = document.createElement("p");
      notes.className = "appointment-meta";
      notes.textContent = consulta.observacoes;
      card.appendChild(notes);
    }

    if (consulta.status === "agendada") {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "secondary";
      button.textContent = "Cancelar";
      button.addEventListener("click", () => cancelarConsulta(consulta.id));
      card.appendChild(button);
    }

    elements.consultasList.appendChild(card);
  });
}

async function loadData() {
  try {
    const [health, especialidades, profissionais, consultas] = await Promise.all([
      api("/api/health"),
      api("/api/especialidades"),
      api("/api/profissionais"),
      api("/api/consultas")
    ]);

    state.especialidades = especialidades;
    state.profissionais = profissionais;
    state.consultas = consultas;

    elements.status.textContent = health.status === "ok" ? "Online" : "Instavel";
    elements.status.className = "status online";
    renderOptions(elements.especialidadeSelect, especialidades, "Selecione");
    renderOptions(elements.adminEspecialidadeSelect, especialidades, "Selecione");
    renderProfissionais();
    renderConsultas();
  } catch (error) {
    elements.status.textContent = "Offline";
    elements.status.className = "status offline";
    setFeedback(error.message, "error");
  }
}

function formToObject(form) {
  return Object.fromEntries(new FormData(form).entries());
}

async function submitConsulta(event) {
  event.preventDefault();

  try {
    await api("/api/consultas", {
      method: "POST",
      body: JSON.stringify(formToObject(elements.consultaForm))
    });
    elements.consultaForm.reset();
    renderProfissionais();
    setFeedback("Consulta agendada com sucesso.", "success");
    await loadData();
  } catch (error) {
    setFeedback(error.message, "error");
  }
}

async function cancelarConsulta(id) {
  try {
    await api(`/api/consultas/${id}/cancelar`, { method: "PATCH" });
    setFeedback("Consulta cancelada.", "success");
    await loadData();
  } catch (error) {
    setFeedback(error.message, "error");
  }
}

async function submitEspecialidade(event) {
  event.preventDefault();

  try {
    await api("/api/especialidades", {
      method: "POST",
      body: JSON.stringify(formToObject(elements.especialidadeForm))
    });
    elements.especialidadeForm.reset();
    setFeedback("Especialidade cadastrada.", "success");
    await loadData();
  } catch (error) {
    setFeedback(error.message, "error");
  }
}

async function submitProfissional(event) {
  event.preventDefault();

  try {
    await api("/api/profissionais", {
      method: "POST",
      body: JSON.stringify(formToObject(elements.profissionalForm))
    });
    elements.profissionalForm.reset();
    setFeedback("Profissional cadastrado.", "success");
    await loadData();
  } catch (error) {
    setFeedback(error.message, "error");
  }
}

elements.consultaForm.addEventListener("submit", submitConsulta);
elements.especialidadeForm.addEventListener("submit", submitEspecialidade);
elements.profissionalForm.addEventListener("submit", submitProfissional);
elements.especialidadeSelect.addEventListener("change", renderProfissionais);
elements.refreshButton.addEventListener("click", loadData);

loadData();
