# SM-003 - Artefatos da Pratica SBOM e VDD

## Identificacao

| Campo | Valor |
|---|---|
| ID | SM-003 |
| Titulo | Inclusao dos artefatos da pratica de SBOM e Version Description Document |
| Solicitante | Equipe do projeto |
| Prioridade | Baixa |
| Status | Aprovada para implementacao |
| Branch | `feature/pratica-sbom-vdd` |
| Base de integracao | `develop` |

## Justificativa

Registrar no repositorio os artefatos produzidos na pratica de 12/06 (Construcao e
Identificacao Automatizada - SBOM - e Version Description Document), aplicada sobre a
baseline candidata a release `BL-PROD-v0.2.0` (`develop` @ `b282237`). Os documentos
comprovam proveniencia, integridade e descricao formal da versao, conforme IEEE 828-2012.

## Escopo da mudanca

- Adicionar o inventario CycloneDX da baseline (`sbom-v0.2.0.cdx.json`).
- Adicionar o resultado do scan de vulnerabilidades e segredos (`trivy-scan-v0.2.0.json`).
- Adicionar o Relatorio de Auditoria de Configuracao (`RAC-001-auditoria-configuracao-v0.2.0.md`).
- Adicionar o Version Description Document (`VDD-v0.2.0.md`).
- Adicionar o relatorio consolidado da pratica (`RELATORIO-PRATICA-SBOM-VDD.md`).

## Impacto nos Itens de Configuracao

| IC | Impacto |
|---|---|
| IC-01 Documentacao | Adiciona artefatos de auditoria, inventario e descricao de versao em `docs/gcs/pratica-sbom-vdd/`. |
| IC-02 Codigo-fonte | Sem alteracao. |
| IC-03 Testes | Sem alteracao. |
| IC-04 Build e infraestrutura | Sem alteracao. |

## Criterios de aceitacao

- Os cinco artefatos da pratica devem estar versionados sob `docs/gcs/pratica-sbom-vdd/`.
- O RAC e o VDD devem referenciar a baseline `BL-PROD-v0.2.0` no commit `b282237`.
- Nenhum IC de codigo, teste ou build da baseline auditada deve ser alterado por esta SM.

## Decisao do CCB

Mudanca aprovada como registro documental da pratica, sem impacto funcional na baseline
auditada e sem alteracao de versao do produto.
