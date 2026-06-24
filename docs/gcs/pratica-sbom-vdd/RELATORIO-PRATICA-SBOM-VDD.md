# Relatório da Prática — SBOM e Version Description Document

**Projeto:** SACMed – Sistema de Agendamento de Consultas Médicas
**Disciplina:** Gerência de Configuração de Software – UFG 2026/1
**Professora:** Sofia Costa Paiva
**Prática:** 12/06 — *Construção e Identificação Automatizada (SBOM)* + *Version Description Document*
**Data de execução:** 18/06/2026
**Repositório:** Trabalho-Ger-ncia-de-configuracao-de-software (projeto do Trabalho 1)

---

## Visão Geral

Esta prática teve dois objetivos integrados, ambos aplicados sobre a baseline candidata à release
do SACMed (**`develop` @ `b282237`, versão 0.2.0**):

1. **Atividade A:** gerar um inventário de Gerência de Configuração moderno (SBOM) de forma
   automatizada e realizar a auditoria física da baseline.
2. **Atividade B:** consolidar um **Version Description Document (VDD)** descrevendo a versão,
   sua rastreabilidade, composição e limitações.

### Ferramentas utilizadas

| Ferramenta | Versão | Uso |
|---|---|---|
| Git | 2.44.0 | Recuperação da baseline e rastreabilidade de commits |
| **Trivy** | 0.71.1 | Geração do SBOM (CycloneDX) e scan de vulnerabilidades/segredos |
| sha256sum (coreutils) | — | Hashes de integridade dos artefatos |
| Node.js | 22.14.0 | Execução/validação do produto |

> A atividade citava Trivy **ou** Syft; optou-se por **Trivy** por reunir, numa única
> ferramenta, a geração de SBOM e o escaneamento de vulnerabilidades exigido pelo VDD.

### Artefatos produzidos (nesta pasta)

| Arquivo | Conteúdo | Atividade |
|---|---|---|
| `sbom-v0.2.0.cdx.json` | Inventário CycloneDX 1.7 da baseline | A (c) |
| `trivy-scan-v0.2.0.json` | Resultado do scan de vulnerabilidades/segredos | A (e) |
| `RAC-001-auditoria-configuracao-v0.2.0.md` | Relatório de Auditoria de Configuração | A (e) |
| `VDD-v0.2.0.md` | Version Description Document | B |
| `RELATORIO-PRATICA-SBOM-VDD.md` | Este relatório consolidado | A + B |

---

## Atividade A — Construção e Identificação Automatizada (SBOM)

### a) Recuperação da versão candidata à release

A partir do repositório do Trabalho 1, posicionou-se a árvore de trabalho na versão candidata
à release (a branch de integração `develop`, que consolida o MVP + a iteração de acompanhamento):

```bash
git checkout develop
git log -1 --oneline      # b282237 feat(consultas): adiciona acompanhamento e relatorios
```

### b) Inspeção do arquivo de dependências (ICs abstratos)

Inspecionaram-se os manifestos `package.json` (raiz, `backend/`, `frontend/`). Conclusão: o
projeto declara **três pacotes primários** (`sacmed-mvp`, `sacmed-backend`, `sacmed-frontend`,
todos `private`, versão `0.2.0`) e **nenhuma dependência de terceiros**. A única dependência
externa é o runtime **Node.js ≥ 18** (`engines.node`). Não há `package-lock.json` nem
`node_modules`.

### c) Geração do inventário oficial (SBOM)

```bash
trivy fs --format cyclonedx --output sbom-v0.2.0.cdx.json .
```

A ferramenta confirmou `Number of language-specific files num=0`, coerente com a inexistência de
dependências. O inventário foi salvo como a **lista oficial da baseline**.

### d) Análise da estrutura do inventário moderno

O SBOM CycloneDX 1.7 expõe:

- **Metadados da ferramenta** (`metadata.tools.components`): `trivy 0.71.1`, fabricante
  *Aqua Security Software Ltd.* — é a **proveniência do próprio inventário**.
- **Sujeito do inventário** (`metadata.component`): a aplicação auditada (`.`).
- **Identificador único** (`serialNumber`, URN/UUID) e `timestamp` de geração.
- **`components`**: vazio — não há componentes de terceiros.
- **Tipos de dependência:** o padrão distingue dependências **diretas × transitivas** e por
  *escopo*; nesta baseline há apenas o **componente-raiz direto (first-party)** e **zero
  transitivas**.

### e) Auditoria de Configuração

Resultado documentado em **`RAC-001-auditoria-configuracao-v0.2.0.md`**. Resumo:

- **Auditoria Física (PCA):** 24 ICs versionados conferidos e com hash SHA-256 registrado;
  repositório == ICs declarados. **Aprovada.**
- **Scan de segurança:** `trivy fs --scanners vuln,secret` → **0 vulnerabilidades, 0 segredos**.

---

## Atividade B — Version Description Document (VDD)

Documento completo em **`VDD-v0.2.0.md`**, com as **quatro seções exigidas**:

1. **Identificação da baseline** — `BL-PROD-v0.2.0`, branch `develop`, commit `b282237`.
2. **Inventário de modificações** — matriz de rastreabilidade commits ↔ SM (SM-001 e SM-002),
   lista de novas funcionalidades e correções extraídas das mensagens de commit.
3. **Composição do software / SBOM** — 0 dependências de terceiros; 3 pacotes primários; runtime
   Node ≥ 18.
4. **Problemas conhecidos e limitações** — 0 vulnerabilidades (justificado: ausência de deps de
   terceiros), limitações arquiteturais do MVP e desvios de conformidade com o PGCS.

Itens transversais atendidos:

- **a) Identificador único da baseline:** `BL-PROD-v0.2.0` (commit `b282237`).
- **b) Matriz de rastreabilidade:** seção 2.1 do VDD (commits ↔ SMs).
- **c) Hashes SHA-256:** Apêndice A do VDD (artefatos gerados + 24 ICs da baseline).
- **Funcionalidades e correções** lidas das mensagens de commit: seções 2.2 e 2.3 do VDD.
- **Vulnerabilidades e por que permanecem:** seção 4.1 do VDD — não há, pois não há dependências
  de terceiros a remediar.

---

## Conclusão

A prática demonstrou, na prática, dois pilares da Gerência de Configuração moderna: o **controle
de proveniência e integridade** (via SBOM e hashes SHA-256) e a **descrição formal de versão**
(via VDD com rastreabilidade commit ↔ solicitação de mudança).

O principal achado é que o SACMed v0.2.0 tem composição **100% first-party**, sem dependências de
terceiros e, portanto, **sem vulnerabilidades herdadas** — a melhor postura possível de cadeia de
suprimento. As limitações relevantes são arquiteturais e conscientes (persistência em JSON,
ausência de autenticação) e estão registradas no VDD. Como melhoria de processo, recomenda-se
padronizar as mensagens de commit (Conventional Commits) e formalizar a tag de baseline.

---

## Apêndice — Comandos reproduzíveis

```bash
# 1. Posicionar na baseline
git checkout develop

# 2. Gerar SBOM (CycloneDX)
trivy fs --format cyclonedx --output sbom-v0.2.0.cdx.json .

# 3. Scan de vulnerabilidades e segredos
trivy fs --scanners vuln,secret --format json --output trivy-scan-v0.2.0.json .

# 4. Rastreabilidade de commits da baseline
git log --reverse --pretty=format:"%h | %ad | %an | %s" --date=short develop

# 5. Hashes de integridade (PCA)
git ls-files | grep -v '^Plano_GCS' | xargs sha256sum
```
