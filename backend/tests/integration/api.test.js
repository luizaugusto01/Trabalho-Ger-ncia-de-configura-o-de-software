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
    const created = await fetch(`${app.baseUrl}/api/consultas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        paciente: "Joao Silva",
        cpf: "11122233344",
        especialidadeId: "esp-cardio",
        medicoId: "med-ana",
        dataHora: "2026-06-23T10:00"
      })
    });
    const consulta = await created.json();

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
