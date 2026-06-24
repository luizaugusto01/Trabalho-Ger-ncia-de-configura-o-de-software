# RAC-001 — Relatório de Auditoria de Configuração

**Participantes:** Danilo Sucupira Galvão,  ENZO DE OLIVEIRA MACHADO, LUIZ AUGUSTO GODINHO DE PINA VAZ MONTEIRO
**Projeto:** SACMed – Sistema de Agendamento de Consultas Médicas
**Disciplina:** Gerência de Configuração de Software – UFG 2026/1
**Atividade:** Construção e Identificação Automatizada (SBOM) — Prática 12/06
**Norma de referência:** IEEE 828-2012 (Auditoria Física de Configuração — PCA)

---

## 1. Identificação da Baseline Auditada

| Campo | Valor |
|---|---|
| Identificador da baseline | **BL-PROD-v0.2.0** (candidato à release) |
| Branch | `develop` |
| Commit (HEAD) | `b282237` |
| Mensagem do commit | `feat(consultas): adiciona acompanhamento e relatorios` |
| Data da baseline | 18/06/2026 |
| Versão (package.json) | `0.2.0` |
| Solicitações de Mudança consolidadas | SM-001, SM-002 |
| Ferramenta de inventário | Trivy v0.71.1 (Aqua Security) |
| Formato do inventário | CycloneDX 1.7 (JSON) |

---

## 2. Objetivo e Escopo

Esta auditoria tem por objetivo verificar a **proveniência** e a **integridade** do produto
de software na baseline candidata à release, por meio da geração automatizada de um inventário
de configuração (SBOM — *Software Bill of Materials*) e da conferência física dos Itens de
Configuração (ICs) versionados no repositório.

O escopo cobre todos os artefatos sob controle de configuração presentes na branch `develop`
(ICs das categorias IC-01 a IC-04 do PGCS), excluindo o próprio plano (`Plano_GCS.md`) e os
artefatos gerados nesta prática.

---

## 3. Procedimento Executado

### 3.1 (a) Recuperação da versão candidata à release

```bash
git checkout develop
git log -1 --oneline   # b282237 feat(consultas): adiciona acompanhamento e relatorios
```

### 3.2 (b) Inspeção do arquivo de configuração de dependências

Foram inspecionados os três `package.json` da baseline. Os **ICs abstratos** mapeados são:

| Pacote (IC abstrato) | Tipo | Versão | Dependências declaradas |
|---|---|---|---|
| `sacmed-mvp` (raiz) | aplicação / orquestrador | 0.2.0 | nenhuma |
| `sacmed-backend` | aplicação (API HTTP) | 0.2.0 | nenhuma |
| `sacmed-frontend` | aplicação (frontend estático) | 0.2.0 | nenhuma |

**Constatação:** nenhum dos manifestos declara `dependencies` ou `devDependencies`. A única
dependência **externa** de plataforma é o runtime **Node.js ≥ 18** (campo `engines.node`).
Não há *lockfile* (`package-lock.json`) nem `node_modules`. Em termos de GCS, o produto é
composto integralmente por **código primário (first-party)**, sem dependências de terceiros.

### 3.3 (c) Geração automatizada do inventário (SBOM)

```bash
trivy fs --format cyclonedx --output sbom-v0.2.0.cdx.json .
```

Saída relevante da ferramenta: `Number of language-specific files num=0` — confirmando a
ausência de pacotes de terceiros. O inventário oficial da baseline foi salvo em
`sbom-v0.2.0.cdx.json`.

### 3.4 (d) Análise da estrutura do inventário moderno

O SBOM segue o padrão **CycloneDX 1.7**. Estrutura observada:

| Elemento | Conteúdo na baseline | Significado em GCS |
|---|---|---|
| `bomFormat` / `specVersion` | `CycloneDX` / `1.7` | Padrão e versão do inventário |
| `serialNumber` | `urn:uuid:99c9b308-...` | Identificador único e imutável deste BOM |
| **`metadata.tools.components`** | **trivy 0.71.1, Aqua Security** | **Metadados da ferramenta** (proveniência do inventário) |
| `metadata.timestamp` | `2026-06-19T00:39:28Z` | Momento da geração (rastreabilidade) |
| `metadata.component` | `.` (type `application`) | Sujeito do inventário (o produto auditado) |
| `components` | `[]` (vazio) | Componentes/dependências catalogados |
| `dependencies` | grafo com nó-raiz `dependsOn: []` | Relações entre componentes |
| `vulnerabilities` | `[]` | Vulnerabilidades conhecidas |

**Tipos de dependência:** em um SBOM CycloneDX, as dependências distinguem-se normalmente entre
**diretas × transitivas** e por *escopo* (`required`, `optional`). Nesta baseline existe apenas
o **componente-raiz (direto, first-party)** e **zero dependências transitivas**, motivo pelo
qual a lista `components` está vazia.

---

## 4. Resultado da Auditoria Física (PCA)

A auditoria física conferiu que o repositório contém **exatamente** os artefatos declarados como
ICs, calculando o hash **SHA-256** de cada item para garantir integridade. Total: **24 ICs**
versionados.

| IC | Arquivo | SHA-256 (resumo) |
|---|---|---|
| IC-04 | `.env.example` | `0146f795…d3e4` |
| IC-04 | `.github/PULL_REQUEST_TEMPLATE.md` | `03a7af70…0c94` |
| IC-04 | `.github/workflows/ci.yml` | `0d77e848…847cb` |
| IC-04 | `.gitignore` | `9ab61389…d0d0` |
| IC-01 | `README.md` | `b64e143f…9d83` |
| IC-02 | `backend/package.json` | `7b0276d8…7913` |
| IC-02 | `backend/src/data.json` | `776b89c1…357d` |
| IC-02 | `backend/src/server.js` | `74c9648e…6c74` |
| IC-02 | `backend/src/store.js` | `e8053d80…ec492` |
| IC-03 | `backend/tests/integration/api.test.js` | `59a67b5a…a4c7` |
| IC-02 | `database/seeds/sacmed.seed.json` | `2be0d013…5663` |
| IC-01 | `docs/arquitetura/MVP.md` | `3061d20f…f48b` |
| IC-01 | `docs/gcs/pull-requests/PR-002-acompanhamento-consultas.md` | `bc01219a…d78f` |
| IC-01 | `docs/gcs/relatorios-status/RSC-001-mvp-sacmed.md` | `48fe51d1…dd17c` |
| IC-01 | `docs/gcs/relatorios-status/RSC-002-acompanhamento-consultas.md` | `aa540f03…14bc` |
| IC-01 | `docs/gcs/solicitacoes-mudanca/SM-001-mvp-sacmed.md` | `26617ecd…6327` |
| IC-01 | `docs/gcs/solicitacoes-mudanca/SM-002-acompanhamento-consultas.md` | `5f3ebe2f…3c92` |
| IC-01 | `docs/requisitos/MVP.md` | `041fdc19…170c` |
| IC-01 | `docs/testes/Plano_Testes_MVP.md` | `4a01cbc2…6833` |
| IC-02 | `frontend/package.json` | `16fc02c7…f9e0` |
| IC-02 | `frontend/public/app.js` | `43d53767…ce8b` |
| IC-02 | `frontend/public/index.html` | `c212df15…32c0` |
| IC-02 | `frontend/public/styles.css` | `7574dff4…34fa5` |
| IC-02 | `package.json` | `09b67297…acaf` |

> A lista completa de hashes (valor integral) está no VDD v0.2.0, Apêndice A, e pode ser
> reproduzida com `git ls-files | xargs sha256sum`.

### 4.1 Resultado do escaneamento de segurança

```bash
trivy fs --scanners vuln,secret --format table .
```

| Alvo | Vulnerabilidades | Segredos |
|---|---|---|
| Repositório SACMed @ v0.2.0 | **0** | **0** |

- **Vulnerabilidades:** nenhuma — não há dependências de terceiros a avaliar (a base de
  vulnerabilidades do Trivy foi atualizada com sucesso antes do scan).
- **Segredos:** nenhum credencial *hardcoded* detectado (o `.env.example` contém apenas
  valores de exemplo, sem segredos reais).

---

## 5. Parecer da Auditoria

| Critério | Resultado |
|---|---|
| Artefatos do repositório == ICs declarados | ✔ Conforme |
| Integridade dos ICs (hash SHA-256 registrado) | ✔ Conforme |
| Proveniência das dependências (SBOM gerado) | ✔ Conforme — 100% código primário |
| Vulnerabilidades conhecidas | ✔ Nenhuma |
| Segredos expostos | ✔ Nenhum |

**Conclusão:** a baseline **BL-PROD-v0.2.0** (`develop` @ `b282237`) **passou na Auditoria
Física de Configuração (PCA)**. A composição do produto é integralmente *first-party*, o que
proporciona a melhor postura possível de proveniência e integridade: não há superfície de
dependências de terceiros nem vulnerabilidades herdadas. As limitações remanescentes são de
natureza arquitetural (persistência em JSON, ausência de autenticação) e estão registradas no
VDD v0.2.0, seção 4.

---

*Auditoria realizada em 18/06/2026. Ferramentas: Trivy v0.71.1, Git 2.44, sha256sum (coreutils).*
