# Plano de Testes do MVP

## Casos automatizados

| ID | Cenario | Arquivo |
|---|---|---|
| CT-01 | Agenda uma consulta valida. | `backend/tests/integration/api.test.js` |
| CT-02 | Bloqueia conflito de horario para o mesmo medico. | `backend/tests/integration/api.test.js` |
| CT-03 | Cancela uma consulta existente. | `backend/tests/integration/api.test.js` |
| CT-04 | Conclui consulta com prontuario basico. | `backend/tests/integration/api.test.js` |
| CT-05 | Impede concluir consulta cancelada. | `backend/tests/integration/api.test.js` |
| CT-06 | Filtra consultas e gera relatorio resumido. | `backend/tests/integration/api.test.js` |

## Execucao

```bash
npm test
```
