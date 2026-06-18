# SM-002 - Acompanhamento de Consultas e Relatorios

## Identificacao

| Campo | Valor |
|---|---|
| ID | SM-002 |
| Titulo | Acompanhamento de consultas, prontuario basico e relatorio administrativo |
| Solicitante | Equipe do projeto |
| Prioridade | Media |
| Status | Aprovada para implementacao |
| Branch | `feature/acompanhamento-consultas` |

## Justificativa

Evoluir o MVP para cobrir parte do fluxo previsto no PGCS em que medicos acompanham agendas e prontuarios basicos, enquanto a administracao consulta indicadores simples da clinica.

## Escopo da mudanca

- Adicionar filtros de consulta por status e profissional.
- Permitir conclusao de consulta com registro de resumo e conduta.
- Bloquear conclusao de consultas canceladas ou ja finalizadas.
- Criar relatorio resumido com totais por status e por especialidade.
- Atualizar interface web para exibir filtros, resumo e formulario de prontuario.
- Ampliar testes automatizados de integracao.

## Impacto nos Itens de Configuracao

| IC | Impacto |
|---|---|
| IC-01 Documentacao | Atualiza requisitos, arquitetura, plano de testes e registros de GCS. |
| IC-02 Codigo-fonte | Altera API e frontend web. |
| IC-03 Testes | Adiciona testes de integracao para conclusao, filtros e relatorios. |
| IC-04 Build e infraestrutura | Mantem pipeline existente; sem mudanca estrutural. |

## Criterios de aceitacao

- O sistema deve listar consultas filtradas por status e profissional.
- O sistema deve concluir consulta agendada com resumo e conduta.
- O sistema deve rejeitar conclusao de consulta cancelada.
- O relatorio deve retornar totais por status e por especialidade.
- Os testes automatizados devem passar com `npm test`.

## Decisao do CCB

Mudanca aprovada para nova iteracao funcional, mantendo compatibilidade com a baseline do MVP.
