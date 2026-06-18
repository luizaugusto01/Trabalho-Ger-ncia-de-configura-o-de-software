# Requisitos do MVP SACMed

## Requisitos funcionais

| ID | Requisito | Status |
|---|---|---|
| RF-01 | O paciente deve agendar consulta informando nome, CPF, especialidade, profissional, data e hora. | Implementado |
| RF-02 | O sistema deve impedir duas consultas agendadas para o mesmo profissional no mesmo horario. | Implementado |
| RF-03 | O paciente ou a clinica deve cancelar uma consulta agendada. | Implementado |
| RF-04 | A administracao deve cadastrar especialidades. | Implementado |
| RF-05 | A administracao deve cadastrar profissionais vinculados a especialidades. | Implementado |
| RF-06 | A clinica deve consultar a lista de consultas com status. | Implementado |
| RF-07 | A clinica deve filtrar consultas por status e profissional. | Implementado |
| RF-08 | O medico deve concluir uma consulta registrando resumo e conduta. | Implementado |
| RF-09 | A administracao deve visualizar resumo de consultas por status e especialidade. | Implementado |

## Requisitos nao funcionais

| ID | Requisito | Atendimento no MVP |
|---|---|---|
| RNF-01 | Executar em ambiente local de desenvolvimento. | `npm start` |
| RNF-02 | Disponibilizar API REST simples. | Rotas em `/api` |
| RNF-03 | Manter rastreabilidade basica com documentacao e testes. | `docs/` e `backend/tests/` |
