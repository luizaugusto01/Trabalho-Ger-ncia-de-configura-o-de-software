const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const { createServer } = require("../../src/server");

const seed = {
  especialidades: [{ id: "esp-cardio", nome: "Cardiologia" }],
  profissionais: [{ id: "med-ana", nome: "Dra. Ana", crm: "CRM-GO 1", especialidadeId: "esp-cardio" }],
  consultas: []
};

function createTestApp() {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "sacmed-test-"));
  const dataFile = path.join(tempDir, "data.json");
  fs.writeFileSync(dataFile, JSON.stringify(seed, null, 2));

  const server = createServer({ dataFile });
  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => {
      const { port } = server.address();
      resolve({
        baseUrl: `http://127.0.0.1:${port}`,
        close: () => new Promise((done) => server.close(done))
      });
    });
  });
}

async function createConsulta(app, overrides = {}) {
  const response = await fetch(`${app.baseUrl}/api/consultas`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      paciente: "Joao Silva",
      cpf: "11122233344",
      especialidadeId: "esp-cardio",
      medicoId: "med-ana",
      dataHora: "2026-06-23T10:00",
      observacoes: "Retorno",
      ...overrides
    })
  });

  return response.json();
}

test("agenda uma consulta valida", async () => {
  const app = await createTestApp();

  try {
    const response = await fetch(`${app.baseUrl}/api/consultas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        paciente: "Joao Silva",
        cpf: "11122233344",
        especialidadeId: "esp-cardio",
        medicoId: "med-ana",
        dataHora: "2026-06-23T10:00",
        observacoes: "Retorno"
      })
    });
    const body = await response.json();

    assert.equal(response.status, 201);
    assert.equal(body.paciente, "Joao Silva");
    assert.equal(body.status, "agendada");
    assert.equal(body.medico, "Dra. Ana");
  } finally {
    await app.close();
  }
});

test("bloqueia conflito de horario para o mesmo medico", async () => {
  const app = await createTestApp();
  const payload = {
    paciente: "Joao Silva",
    cpf: "11122233344",
    especialidadeId: "esp-cardio",
    medicoId: "med-ana",
    dataHora: "2026-06-23T10:00"
  };

  try {
    await fetch(`${app.baseUrl}/api/consultas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const response = await fetch(`${app.baseUrl}/api/consultas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, paciente: "Maria Silva", cpf: "99988877766" })
    });

    const body = await response.json();
    assert.equal(response.status, 400);
    assert.match(body.detalhes.join(" "), /mesmo horario/);
  } finally {
    await app.close();
  }
});

test("cancela uma consulta existente", async () => {
  const app = await createTestApp();

  try {
    const consulta = await createConsulta(app);

    const response = await fetch(`${app.baseUrl}/api/consultas/${consulta.id}/cancelar`, {
      method: "PATCH"
    });
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.status, "cancelada");
  } finally {
    await app.close();
  }
});

test("conclui consulta com prontuario basico", async () => {
  const app = await createTestApp();

  try {
    const consulta = await createConsulta(app);
    const response = await fetch(`${app.baseUrl}/api/consultas/${consulta.id}/concluir`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        resumo: "Paciente relata dor no peito aos esforcos.",
        conduta: "Solicitar ECG e retorno em 7 dias."
      })
    });
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.status, "realizada");
    assert.equal(body.prontuario.resumo, "Paciente relata dor no peito aos esforcos.");
    assert.ok(body.prontuario.registradoEm);
  } finally {
    await app.close();
  }
});

test("impede concluir consulta cancelada", async () => {
  const app = await createTestApp();

  try {
    const consulta = await createConsulta(app);
    await fetch(`${app.baseUrl}/api/consultas/${consulta.id}/cancelar`, { method: "PATCH" });

    const response = await fetch(`${app.baseUrl}/api/consultas/${consulta.id}/concluir`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resumo: "Atendimento", conduta: "Alta" })
    });
    const body = await response.json();

    assert.equal(response.status, 400);
    assert.match(body.erro, /Apenas consultas agendadas/);
  } finally {
    await app.close();
  }
});

test("filtra consultas e gera relatorio resumido", async () => {
  const app = await createTestApp();

  try {
    const primeira = await createConsulta(app, { dataHora: "2026-06-23T10:00" });
    const segunda = await createConsulta(app, {
      paciente: "Maria Silva",
      cpf: "99988877766",
      dataHora: "2026-06-23T11:00"
    });

    await fetch(`${app.baseUrl}/api/consultas/${primeira.id}/concluir`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resumo: "Atendimento concluido.", conduta: "Acompanhar evolucao." })
    });

    const realizadasResponse = await fetch(`${app.baseUrl}/api/consultas?status=realizada`);
    const realizadas = await realizadasResponse.json();
    assert.equal(realizadasResponse.status, 200);
    assert.equal(realizadas.length, 1);
    assert.equal(realizadas[0].id, primeira.id);

    const resumoResponse = await fetch(`${app.baseUrl}/api/relatorios/resumo`);
    const resumo = await resumoResponse.json();
    assert.equal(resumoResponse.status, 200);
    assert.equal(resumo.totalConsultas, 2);
    assert.equal(resumo.totalPorStatus.realizada, 1);
    assert.equal(resumo.totalPorStatus.agendada, 1);
    assert.equal(resumo.proximasConsultas[0].id, segunda.id);
  } finally {
    await app.close();
  }
});
