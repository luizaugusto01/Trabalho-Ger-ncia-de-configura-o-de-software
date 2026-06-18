# SACMed MVP

MVP basico do **SACMed**, um sistema web para agendamento de consultas medicas em clinicas de pequeno e medio porte.

## Funcionalidades

- Listagem de especialidades e profissionais de saude.
- Agendamento de consulta por paciente.
- Validacao de campos obrigatorios e conflito de horario por medico.
- Cancelamento de consultas agendadas.
- Cadastro administrativo simples de especialidades e profissionais via API.
- Interface web estatica servida pela propria API.

## Como executar

```bash
npm start
```

Acesse: http://localhost:3000

## Testes

```bash
npm test
```

## API principal

| Metodo | Rota | Descricao |
|---|---|---|
| GET | `/api/health` | Status da API |
| GET | `/api/especialidades` | Lista especialidades |
| POST | `/api/especialidades` | Cadastra especialidade |
| GET | `/api/profissionais` | Lista profissionais |
| POST | `/api/profissionais` | Cadastra profissional |
| GET | `/api/consultas` | Lista consultas |
| POST | `/api/consultas` | Agenda consulta |
| PATCH | `/api/consultas/:id/cancelar` | Cancela consulta |

## Decisoes de MVP

Para manter o projeto executavel sem dependencias externas, este MVP usa Node.js puro, arquivos JSON para persistencia local e frontend estatico em HTML/CSS/JS. A estrutura de pastas segue o PGCS e permite evoluir posteriormente para React, Express e PostgreSQL.
