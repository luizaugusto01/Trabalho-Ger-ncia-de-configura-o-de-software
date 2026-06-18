const state = {
  especialidades: [],
  profissionais: [],
  consultas: [],
  relatorio: null
};

const elements = {
  status: document.querySelector("#api-status"),
  feedback: document.querySelector("#feedback"),
  consultaForm: document.querySelector("#consulta-form"),
  especialidadeForm: document.querySelector("#especialidade-form"),
  profissionalForm: document.querySelector("#profissional-form"),
  especialidadeSelect: document.querySelector("#especialidade-select"),
  medicoSelect: document.querySelector("#medico-select"),
  statusFilter: document.querySelector("#status-filter"),
  medicoFilter: document.querySelector("#medico-filter"),
  adminEspecialidadeSelect: document.querySelector("#admin-especialidade-select"),
  consultasList: document.querySelector("#consultas-list"),
  resumoCards: document.querySelector("#resumo-cards"),
  especialidadeSummary: document.querySelector("#especialidade-summary"),
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

function renderMedicoFilter() {
  const selected = elements.medicoFilter.value;
  renderOptions(elements.medicoFilter, state.profissionais, "Todos");
  elements.medicoFilter.value = selected;
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

    if (consulta.prontuario) {
      const record = document.createElement("div");
      record.className = "appointment-meta";
      const title = document.createElement("strong");
      title.textContent = "Prontuario";
      const resumo = document.createElement("span");
      resumo.textContent = consulta.prontuario.resumo;
      const conduta = document.createElement("span");
      conduta.textContent = consulta.prontuario.conduta;
      record.append(title, resumo, conduta);
      card.appendChild(record);
    }

    if (consulta.status === "agendada") {
      const recordForm = document.createElement("form");
      recordForm.className = "record-form";
      recordForm.innerHTML = `
        <label>
          Resumo do atendimento
          <textarea name="resumo" rows="2" required></textarea>
        </label>
        <label>
          Conduta
          <textarea name="conduta" rows="2" required></textarea>
        </label>
      `;

      const actions = document.createElement("div");
      actions.className = "actions";

      const concludeButton = document.createElement("button");
      concludeButton.type = "submit";
      concludeButton.textContent = "Concluir";

      const cancelButton = document.createElement("button");
      cancelButton.type = "button";
      cancelButton.className = "secondary";
      cancelButton.textContent = "Cancelar";
      cancelButton.addEventListener("click", () => cancelarConsulta(consulta.id));

      actions.append(concludeButton, cancelButton);
      recordForm.appendChild(actions);
      recordForm.addEventListener("submit", (event) => concluirConsulta(event, consulta.id));
      card.appendChild(recordForm);
    }

    elements.consultasList.appendChild(card);
  });
}

function renderResumo() {
  const relatorio = state.relatorio;
  elements.resumoCards.innerHTML = "";

  if (!relatorio) return;

  [
    ["Agendadas", relatorio.totalPorStatus.agendada],
    ["Realizadas", relatorio.totalPorStatus.realizada],
    ["Canceladas", relatorio.totalPorStatus.cancelada]
  ].forEach(([label, value]) => {
    const card = document.createElement("div");
    card.className = "summary-card";
    const number = document.createElement("strong");
    number.textContent = value;
    const text = document.createElement("span");
    text.textContent = label;
    card.append(number, text);
    elements.resumoCards.appendChild(card);
  });
}

function renderEspecialidadeSummary() {
  elements.especialidadeSummary.innerHTML = "";

  if (!state.relatorio || state.relatorio.porEspecialidade.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = "Nenhuma consulta por especialidade.";
    elements.especialidadeSummary.appendChild(empty);
    return;
  }

  state.relatorio.porEspecialidade.forEach((item) => {
    const row = document.createElement("div");
    row.className = "specialty-row";
    const nome = document.createElement("strong");
    nome.textContent = item.nome;
    const total = document.createElement("span");
    total.textContent = `${item.total} consulta(s)`;
    row.append(nome, total);
    elements.especialidadeSummary.appendChild(row);
  });
}

function getConsultaQuery() {
  const params = new URLSearchParams();
  if (elements.statusFilter.value) params.set("status", elements.statusFilter.value);
  if (elements.medicoFilter.value) params.set("medicoId", elements.medicoFilter.value);
  const query = params.toString();
  return query ? `?${query}` : "";
}

async function loadConsultas() {
  state.consultas = await api(`/api/consultas${getConsultaQuery()}`);
  renderConsultas();
}

async function loadData() {
  try {
    const [health, especialidades, profissionais, relatorio] = await Promise.all([
      api("/api/health"),
      api("/api/especialidades"),
      api("/api/profissionais"),
      api("/api/relatorios/resumo")
    ]);

    state.especialidades = especialidades;
    state.profissionais = profissionais;
    state.relatorio = relatorio;

    elements.status.textContent = health.status === "ok" ? "Online" : "Instavel";
    elements.status.className = "status online";
    renderOptions(elements.especialidadeSelect, especialidades, "Selecione");
    renderOptions(elements.adminEspecialidadeSelect, especialidades, "Selecione");
    renderMedicoFilter();
    renderProfissionais();
    renderResumo();
    renderEspecialidadeSummary();
    await loadConsultas();
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

async function concluirConsulta(event, id) {
  event.preventDefault();

  try {
    await api(`/api/consultas/${id}/concluir`, {
      method: "PATCH",
      body: JSON.stringify(formToObject(event.currentTarget))
    });
    setFeedback("Consulta concluida e prontuario registrado.", "success");
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
elements.statusFilter.addEventListener("change", loadConsultas);
elements.medicoFilter.addEventListener("change", loadConsultas);
elements.refreshButton.addEventListener("click", loadData);

loadData();
