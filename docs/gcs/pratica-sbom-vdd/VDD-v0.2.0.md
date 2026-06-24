# VDD — Version Description Document — SACMed v0.2.0

**Participantes:** Danilo Sucupira Galvão,  ENZO DE OLIVEIRA MACHADO, LUIZ AUGUSTO GODINHO DE PINA VAZ MONTEIRO
**Projeto:** SACMed – Sistema de Agendamento de Consultas Médicas
**Disciplina:** Gerência de Configuração de Software – UFG 2026/1
**Atividade:** Version Description Document — Prática 12/06
**Documento de referência:** IEEE 828-2012 / MIL-STD-VDD

---

## 1. Identificação da Baseline

| Campo | Valor |
|---|---|
| Identificador único da baseline | **BL-PROD-v0.2.0** |
| Tag semântica de referência | `v0.2.0-baseline` (lógica; não publicada no remoto) |
| Branch de origem | `develop` |
| Commit de referência (HEAD) | `b282237` |
| Data de fechamento | 18/06/2026 |
| Versão do produto | 0.2.0 (SemVer) |
| Inventário oficial (SBOM) | `sbom-v0.2.0.cdx.json` (CycloneDX 1.7) |
| Solicitações de Mudança atendidas | SM-001, SM-002 |
| Relatórios de Status associados | RSC-001, RSC-002 |
| Auditoria de configuração | RAC-001 (PCA aprovada) |

---

## 2. Inventário de Modificações

### 2.1 Matriz de Rastreabilidade (Commits ↔ Solicitações de Mudança)

| SM | Descrição | Commits | Tipo |
|---|---|---|---|
| — | Plano de Gerência de Configuração (Parte 1) | `28c0906` | docs/plano |
| **SM-001** | Implementação do MVP básico do SACMed | `20058eb`, `3aff6d0` (merge → main) | feat |
| **SM-001** | Ajustes de CI/build do MVP | `505ae0e`, `bbadcf4` + série `da42faa…e14f9b2` (10 commits "Potential fix") | fix/ci |
| **SM-002** | Acompanhamento de consultas e relatórios | `1ff099c`, `da2c281`, `b282237` (merge → develop) | feat/docs |

> Rastreabilidade completa requisito → código → teste: ver `docs/requisitos/MVP.md` (RF-01…RF-06),
> `docs/testes/Plano_Testes_MVP.md` (CT-01…CT-06) e `backend/tests/integration/api.test.js`.

### 2.2 Novas Funcionalidades nesta Versão

Derivadas das mensagens de commit e das SM-001/SM-002:

- **Agendamento de consultas** com validação de campos obrigatórios e de CPF (SM-001 / RF-01).
- **Bloqueio de conflito de horário** para o mesmo profissional (SM-001 / RF-02).
- **Cancelamento de consulta** agendada (SM-001 / RF-03).
- **Cadastro administrativo** de especialidades e profissionais via API (SM-001 / RF-04, RF-05).
- **Listagem de consultas** com status e relações (SM-001 / RF-06).
- **Filtros de agenda** por status e por profissional (SM-002).
- **Conclusão de consulta com prontuário básico** (resumo e conduta), com bloqueio de conclusão
  de consultas canceladas/finalizadas (SM-002).
- **Relatório administrativo** com totais por status e por especialidade (SM-002).

### 2.3 Correções de Defeitos (Bug Fixes)

- Compatibilidade do script de testes com **Node 20 no CI** (`bbadcf4`).
- Correção do script de teste e da sintaxe do `package.json` (`505ae0e`).
- Série de ajustes iterativos de pipeline/PR (`da42faa`…`e14f9b2`) — **observação de GCS:** estes
  10 commits usam a mensagem genérica *"Potential fix for pull request finding"*, em desacordo
  com o padrão **Conventional Commits** definido no PGCS (seção 3.3). Recomenda-se *squash*
  desses commits em releases futuras.

---

## 3. Composição do Software (SBOM)

Inventário gerado com **Trivy v0.71.1** em formato **CycloneDX 1.7**
(`sbom-v0.2.0.cdx.json`).

| Aspecto | Resultado |
|---|---|
| Componentes de terceiros (libraries) | **0** |
| Componentes primários (first-party) | 3 pacotes: `sacmed-mvp`, `sacmed-backend`, `sacmed-frontend` |
| Dependências transitivas | **0** |
| Dependência de plataforma (externa) | Node.js **≥ 18** (`engines.node`) |
| Gerenciador de pacotes | npm (sem lockfile; sem `node_modules`) |
| Metadados da ferramenta | `metadata.tools.components` → trivy 0.71.1 (Aqua Security) |
| Sujeito do inventário | `metadata.component` → aplicação `.` |

**Interpretação:** o produto não possui *bill of materials* de terceiros. Toda a composição é
código próprio versionado no repositório, eliminando a cadeia de suprimento de software como
vetor de risco nesta versão.

---

## 4. Problemas Conhecidos e Limitações

### 4.1 Vulnerabilidades conhecidas

`trivy fs --scanners vuln,secret` retornou **0 vulnerabilidades** e **0 segredos**.

**Por que não há vulnerabilidades nesta versão?** Porque o produto **não consome bibliotecas de
terceiros**: não há pacotes npm externos no inventário, logo não há CVEs herdados a remediar. A
base de vulnerabilidades do Trivy foi atualizada antes do scan (descarta-se falso negativo por
DB desatualizada).

### 4.2 Limitações arquiteturais (não são CVEs)

Limitações conscientes do MVP, documentadas em `docs/arquitetura/MVP.md`:

- **Persistência em arquivo JSON** (`backend/src/data.json`) em vez de PostgreSQL — sem
  transações nem concorrência segura; adequado apenas para demonstração local.
- **Ausência de autenticação/autorização** — qualquer cliente acessa todos os endpoints
  (módulo de auth previsto no PGCS ainda não implementado).
- **Sem testes unitários nem E2E** — cobertura apenas por testes de integração (`node:test`).
- **Script `npm test` não portável para Windows** — usa `find` (Unix); funciona no CI Ubuntu.

### 4.3 Desvios de conformidade com o PGCS

- Stack simplificada (Node puro/JSON/HTML estático) em relação à planejada (React/Express/
  PostgreSQL/Docker/AWS) — desvio documentado e consciente do MVP.
- Estrutura de diretórios incompleta (sem `infra/`, `e2e/`, `Dockerfile`, `frontend/src/`,
  `database/migrations/`, `deploy.yml`).
- 10 commits fora do padrão Conventional Commits (ver seção 2.3).

---

## Apêndice A — Hashes Criptográficos (SHA-256)

### A.1 Artefatos gerados nesta prática

| Arquivo | SHA-256 |
|---|---|
| `sbom-v0.2.0.cdx.json` | `be8e9a543d34f9fb1b25688f6481d2f30db4134ab7a798de818bf9867dd57bbb` |
| `trivy-scan-v0.2.0.json` | `9a4e96cece04d384685817980ebeb6eedf3f24ed8245e470d32f30d776dac933` |

### A.2 Itens de Configuração da baseline (integridade física)

```
0146f7951377664845d71631bc2c7f3a973b8c9b4a8cc6587002330de1dad3e4  .env.example
03a7af70f34ab031bcca4a9dc4b111c7619320cf83e116240e8d4b4bfb2f0c94  .github/PULL_REQUEST_TEMPLATE.md
0d77e8482a000a099b08aba98e3b77f970a2f944b264864735d1c95aefe847cb  .github/workflows/ci.yml
9ab6138952581dfbc55ae185d434ede2c8075f8a0b614106d27bdc4644c8d0d0  .gitignore
b64e143f985f118db05b6398de976db4d3e4186999e4304dadf26ec926739d83  README.md
7b0276d8ae73fce485124a97d9a357bd07218b9d68bf2b99e29493b7e5281913  backend/package.json
776b89c12b5cfcb8d14e03462d18e558fe992414d36f9205a9a44a427a70357d  backend/src/data.json
74c9648ea608dd1262b9aa17814321bad8076bcaf052540ca74457a6e8d76c74  backend/src/server.js
e8053d80415c48903d611fac0bbc81a0f03abe33b86099ce73c4dc49d15ec492  backend/src/store.js
59a67b5a744236723cb6570775642b9d931c89166b5f1c3fb5fe1d88b549a4c7  backend/tests/integration/api.test.js
2be0d013799e5a71a3ce2a9890c4cb6099573c43be1886489da91532d8cf5663  database/seeds/sacmed.seed.json
3061d20f39f996f88922e5632a5710da5f4b74fa09d1d7e54842cdca2225f48b  docs/arquitetura/MVP.md
bc01219ab7a9de30ab93ff87c9f2672e90a38db5e6cf724c44ba8f6ce76bd78f  docs/gcs/pull-requests/PR-002-acompanhamento-consultas.md
48fe51d15d6dd0a1c69e4d6f184ec18c2cb8068221ca6855132a7a06d37dd17c  docs/gcs/relatorios-status/RSC-001-mvp-sacmed.md
aa540f03399b4d944a35b83919c654f57cea7e1c4be5aca9f33c8b92302e14bc  docs/gcs/relatorios-status/RSC-002-acompanhamento-consultas.md
26617ecd6adc2ffe1069452270398f5981629d0855cf03c2202a020c4112e327  docs/gcs/solicitacoes-mudanca/SM-001-mvp-sacmed.md
5f3ebe2fc0404cb35ec121f101fd10d8cd4ad9b822be8ddadf24e5e5d2303c92  docs/gcs/solicitacoes-mudanca/SM-002-acompanhamento-consultas.md
041fdc192967dc69147adabc033448d19bc27b47d3dfbedb6b05fb88ff57170c  docs/requisitos/MVP.md
4a01cbc2aa09e07963acbb07971c40115042ee3bcc6ca9540d85223bd8e86833  docs/testes/Plano_Testes_MVP.md
16fc02c729c4693b6ad3c0576ef8025c826d32140b3e69cc05261e15c629f9e0  frontend/package.json
43d53767ae2fc2966ef5fd07dab9bad5fee5a98eca85b486d179adbc22e5ce8b  frontend/public/app.js
c212df150ceb9495596c6c3be00bd37cb0c11fcec3b75fb8c98d8492249e32c0  frontend/public/index.html
7574dff4022988b1b759b74d24e2043d43ee41da1f2a01b179f0aa4fb7834fa5  frontend/public/styles.css
09b67297756ec91a9f6bf3bcf2f2b9e5e5e8bedf29952fafcd37e4a3b0d5acaf  package.json
```

> Reprodução: `git checkout develop && git ls-files | grep -v '^Plano_GCS' | xargs sha256sum`

---

*VDD consolidado em 18/06/2026 para a baseline BL-PROD-v0.2.0 do SACMed.*
