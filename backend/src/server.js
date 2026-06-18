const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const { randomUUID } = require("node:crypto");
const { createStore } = require("./store");

const publicDir = path.resolve(__dirname, "../../frontend/public");
const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8"
};

function sendJson(res, statusCode, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,PATCH,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  });
  res.end(body);
}

function sendError(res, statusCode, message, details) {
  sendJson(res, statusCode, { erro: message, detalhes: details || [] });
}

function normalizeText(value) {
  return String(value || "").trim();
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > 1_000_000) {
        req.destroy();
        reject(new Error("Payload muito grande"));
      }
    });
    req.on("end", () => {
      if (!raw) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(raw));
      } catch (error) {
        reject(new Error("JSON invalido"));
      }
    });
  });
}

function withRelations(data, consulta) {
  const especialidade = data.especialidades.find((item) => item.id === consulta.especialidadeId);
  const medico = data.profissionais.find((item) => item.id === consulta.medicoId);

  return {
    ...consulta,
    especialidade: especialidade ? especialidade.nome : "Especialidade removida",
    medico: medico ? medico.nome : "Profissional removido"
  };
}

function validateConsulta(data, payload) {
  const errors = [];
  const paciente = normalizeText(payload.paciente);
  const cpf = normalizeText(payload.cpf).replace(/\D/g, "");
  const especialidadeId = normalizeText(payload.especialidadeId);
  const medicoId = normalizeText(payload.medicoId);
  const dataHora = normalizeText(payload.dataHora);
  const observacoes = normalizeText(payload.observacoes);

  if (!paciente) errors.push("Informe o nome do paciente.");
  if (cpf.length !== 11) errors.push("Informe um CPF com 11 digitos.");
  if (!especialidadeId) errors.push("Selecione uma especialidade.");
  if (!medicoId) errors.push("Selecione um profissional.");
  if (!dataHora || Number.isNaN(Date.parse(dataHora))) errors.push("Informe uma data e hora validas.");

  const especialidade = data.especialidades.find((item) => item.id === especialidadeId);
  if (especialidadeId && !especialidade) errors.push("Especialidade nao encontrada.");

  const medico = data.profissionais.find((item) => item.id === medicoId);
  if (medicoId && !medico) errors.push("Profissional nao encontrado.");
  if (medico && especialidade && medico.especialidadeId !== especialidade.id) {
    errors.push("O profissional selecionado nao atende a especialidade escolhida.");
  }

  const conflito = data.consultas.find((consulta) => (
    consulta.medicoId === medicoId
    && consulta.dataHora === dataHora
    && consulta.status === "agendada"
  ));
  if (conflito) errors.push("Ja existe consulta agendada para este profissional no mesmo horario.");

  return {
    errors,
    consulta: { paciente, cpf, especialidadeId, medicoId, dataHora, observacoes }
  };
}

function createServer(options = {}) {
  const store = options.store || createStore(options.dataFile);

  return http.createServer(async (req, res) => {
    let url;
    let pathname;
    try {
      url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
      pathname = decodeURIComponent(url.pathname);
    } catch (error) {
      sendError(res, 400, "URL invalida.");
      return;
    }
    if (req.method === "OPTIONS") {
      res.writeHead(204, {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,POST,PATCH,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
      });
      res.end();
      return;
    }

    try {
      if (pathname === "/api/health" && req.method === "GET") {
        sendJson(res, 200, { status: "ok", servico: "SACMed API", versao: "0.1.0" });
        return;
      }

      if (pathname === "/api/especialidades" && req.method === "GET") {
        const data = store.read();
        sendJson(res, 200, data.especialidades);
        return;
      }

      if (pathname === "/api/especialidades" && req.method === "POST") {
        const data = store.read();
        const body = await readBody(req);
        const nome = normalizeText(body.nome);

        if (!nome) {
          sendError(res, 400, "Nao foi possivel cadastrar a especialidade.", ["Informe o nome."]);
          return;
        }

        const especialidade = { id: `esp-${randomUUID()}`, nome };
        data.especialidades.push(especialidade);
        store.write(data);
        sendJson(res, 201, especialidade);
        return;
      }

      if (pathname === "/api/profissionais" && req.method === "GET") {
        const data = store.read();
        const especialidadeId = url.searchParams.get("especialidadeId");
        const profissionais = especialidadeId
          ? data.profissionais.filter((profissional) => profissional.especialidadeId === especialidadeId)
          : data.profissionais;
        sendJson(res, 200, profissionais);
        return;
      }

      if (pathname === "/api/profissionais" && req.method === "POST") {
        const data = store.read();
        const body = await readBody(req);
        const nome = normalizeText(body.nome);
        const crm = normalizeText(body.crm);
        const especialidadeId = normalizeText(body.especialidadeId);
        const errors = [];

        if (!nome) errors.push("Informe o nome.");
        if (!crm) errors.push("Informe o CRM.");
        if (!data.especialidades.some((item) => item.id === especialidadeId)) {
          errors.push("Informe uma especialidade cadastrada.");
        }

        if (errors.length > 0) {
          sendError(res, 400, "Nao foi possivel cadastrar o profissional.", errors);
          return;
        }

        const profissional = { id: `med-${randomUUID()}`, nome, crm, especialidadeId };
        data.profissionais.push(profissional);
        store.write(data);
        sendJson(res, 201, profissional);
        return;
      }

      if (pathname === "/api/consultas" && req.method === "GET") {
        const data = store.read();
        const consultas = data.consultas
          .map((consulta) => withRelations(data, consulta))
          .sort((a, b) => a.dataHora.localeCompare(b.dataHora));
        sendJson(res, 200, consultas);
        return;
      }

      if (pathname === "/api/consultas" && req.method === "POST") {
        const data = store.read();
        const body = await readBody(req);
        const { errors, consulta } = validateConsulta(data, body);

        if (errors.length > 0) {
          sendError(res, 400, "Nao foi possivel agendar a consulta.", errors);
          return;
        }

        const novaConsulta = {
          id: `con-${randomUUID()}`,
          ...consulta,
          status: "agendada",
          criadaEm: new Date().toISOString()
        };

        data.consultas.push(novaConsulta);
        store.write(data);
        sendJson(res, 201, withRelations(data, novaConsulta));
        return;
      }

      const cancelarMatch = pathname.match(/^\/api\/consultas\/([^/]+)\/cancelar$/);
      if (cancelarMatch && req.method === "PATCH") {
        const data = store.read();
        const consulta = data.consultas.find((item) => item.id === cancelarMatch[1]);

        if (!consulta) {
          sendError(res, 404, "Consulta nao encontrada.");
          return;
        }

        consulta.status = "cancelada";
        consulta.canceladaEm = new Date().toISOString();
        store.write(data);
        sendJson(res, 200, withRelations(data, consulta));
        return;
      }

      serveStatic(pathname, res);
    } catch (error) {
      const message = error.message === "JSON invalido" ? error.message : "Erro interno no servidor";
      sendError(res, error.message === "JSON invalido" ? 400 : 500, message);
    }
  });
}

function serveStatic(pathname, res) {
  const safePath = pathname === "/" ? "/index.html" : pathname;
  const filePath = path.resolve(publicDir, `.${safePath}`);

  if (!filePath.startsWith(publicDir)) {
    sendError(res, 403, "Acesso negado.");
    return;
  }

  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    sendError(res, 404, "Recurso nao encontrado.");
    return;
  }

  const extension = path.extname(filePath);
  res.writeHead(200, {
    "Content-Type": contentTypes[extension] || "application/octet-stream"
  });
  fs.createReadStream(filePath).pipe(res);
}

if (require.main === module) {
  const port = Number(process.env.PORT || 3000);
  const host = process.env.HOST || "127.0.0.1";
  const server = createServer();

  server.on("error", (error) => {
    console.error(`Nao foi possivel iniciar o SACMed: ${error.message}`);
    process.exit(1);
  });

  server.listen(port, host, () => {
    console.log(`SACMed MVP rodando em http://${host}:${port}`);
  });
}

module.exports = { createServer, validateConsulta };
