# SM-004 - Script de Build Reprodutivel

## Identificacao

| Campo | Valor |
|---|---|
| ID | SM-004 |
| Titulo | Script de build reprodutivel e relatorio tecnico da Etapa 2 |
| Solicitante | Equipe do projeto |
| Prioridade | Media |
| Status | Aprovada para implementacao |
| Branch | `feature/script-build` |
| Base de integracao | `develop` |

## Justificativa

Atender a Etapa 2 do plano de Gerencia de Configuracao, que exige a entrega de um
Script de Build alem do SBOM e do VDD (ja produzidos), acompanhados de relatorio
tecnico que justifique determinismo do build, versionamento SemVer e reprodutibilidade.

## Escopo da mudanca

- Adicionar `scripts/build.sh`: monta e empacota o release de forma reprodutivel.
- Adicionar `scripts/normalize-sbom.js`: normaliza campos volateis do SBOM (timestamp e
  serialNumber) para garantir determinismo.
- Adicionar o script `build` ao `package.json` da raiz (`npm run build`).
- Ignorar a saida de build (`dist/`) no `.gitignore`.
- Adicionar o relatorio tecnico da Etapa 2 em `docs/gcs/etapa2/`.

## Impacto nos Itens de Configuracao

| IC | Impacto |
|---|---|
| IC-01 Documentacao | Adiciona o relatorio tecnico da Etapa 2. |
| IC-02 Codigo-fonte | Sem alteracao funcional do produto (apenas script `build` no manifesto). |
| IC-03 Testes | Sem alteracao (o build reaproveita os testes de integracao existentes). |
| IC-04 Build e infraestrutura | Adiciona `scripts/build.sh` e `scripts/normalize-sbom.js`. |

## Criterios de aceitacao

- `npm run build` deve gerar `dist/sacmed-<versao>.tar.gz`, SBOM normalizado, `build-info.json`,
  `MANIFEST.sha256` e `SHA256SUMS`.
- Duas execucoes consecutivas no mesmo commit devem produzir artefato com SHA-256 identico.
- O relatorio tecnico deve justificar determinismo, SemVer e reprodutibilidade.
- O versionamento do produto permanece em SemVer (`0.2.0`).

## Decisao do CCB

Aprovada como entrega da Etapa 2, sem alteracao funcional do produto e mantendo a baseline
`BL-PROD-v0.2.0` como referencia.
