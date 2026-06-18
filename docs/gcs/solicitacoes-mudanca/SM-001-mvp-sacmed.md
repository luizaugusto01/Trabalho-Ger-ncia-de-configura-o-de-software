# SM-001 - Implementacao do MVP SACMed

## Identificacao

| Campo | Valor |
|---|---|
| ID | SM-001 |
| Titulo | Implementacao do MVP basico do SACMed |
| Solicitante | Equipe do projeto |
| Prioridade | Alta |
| Status | Aprovada para implementacao |
| Branch | `feature/mvp-sacmed` |

## Justificativa

Implementar uma primeira versao funcional do SACMed para demonstrar o fluxo principal de agendamento de consultas medicas previsto no PGCS.

## Escopo da mudanca

- Criar API HTTP para especialidades, profissionais e consultas.
- Criar interface web para agendamento, listagem, cancelamento e cadastros rapidos.
- Criar persistencia local em JSON para viabilizar execucao sem dependencias externas.
- Adicionar testes automatizados de integracao.
- Documentar requisitos, arquitetura e plano de testes do MVP.
- Configurar pipeline de CI para execucao dos testes.

## Impacto nos Itens de Configuracao

| IC | Impacto |
|---|---|
| IC-01 Documentacao | Cria documentacao de requisitos, arquitetura, testes e GCS do MVP. |
| IC-02 Codigo-fonte | Cria backend Node.js e frontend estatico. |
| IC-03 Testes | Cria testes de integracao da API. |
| IC-04 Build e infraestrutura | Cria workflow de CI e arquivos de configuracao do projeto. |

## Criterios de aceitacao

- O sistema deve iniciar com `npm start`.
- A interface deve estar disponivel em `http://127.0.0.1:3000`.
- Deve ser possivel cadastrar especialidade e profissional.
- Deve ser possivel agendar e cancelar consulta.
- O sistema deve bloquear conflito de horario para o mesmo profissional.
- Os testes automatizados devem passar com `npm test`.

## Decisao do CCB

Mudanca aprovada por maioria simples para composicao da baseline inicial de produto do MVP.
