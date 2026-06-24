# Relatório Técnico — Etapa 2 (SBOM, VDD e Script de Build)

**Participantes:** Danilo Sucupira Galvão, ENZO DE OLIVEIRA MACHADO, LUIZ AUGUSTO GODINHO DE PINA VAZ MONTEIRO
**Projeto:** SACMed – Sistema de Agendamento de Consultas Médicas
**Disciplina:** Gerência de Configuração de Software – UFG 2026/1
**Norma de referência:** IEEE 828-2012
**Baseline avaliada:** `BL-PROD-v0.2.0` (tag `v0.2.0-baseline`, commit `b282237`)

---

## 1. Objetivo

Consolidar as três entregas da Etapa 2 — **SBOM**, **VDD** e **Script de Build** — e
justificar tecnicamente três propriedades do build do SACMed: **determinismo**,
**versionamento SemVer** e **reprodutibilidade**.

---

## 2. Resumo dos artefatos

### 2.1 SBOM (Software Bill of Materials)

- **Arquivo:** `docs/gcs/pratica-sbom-vdd/sbom-v0.2.0.cdx.json` (CycloneDX 1.7), gerado com
  **Trivy 0.71.1**. Versão normalizada também é embarcada no pacote de build
  (`sbom-0.2.0.cdx.json`).
- **Achado principal:** composição **100% first-party** — 3 pacotes primários
  (`sacmed-mvp`, `sacmed-backend`, `sacmed-frontend`), **zero dependências de terceiros**,
  sem lockfile e sem `node_modules`. A única dependência externa é o runtime **Node.js ≥ 18**.
- **Consequência para a Etapa 2:** a ausência de cadeia de suprimento de terceiros é o que
  mais favorece o determinismo — não há resolução de versões nem download de pacotes no build.

### 2.2 VDD (Version Description Document)

- **Arquivo:** `docs/gcs/pratica-sbom-vdd/VDD-v0.2.0.md`.
- **Conteúdo:** identificação da baseline `BL-PROD-v0.2.0`, matriz de rastreabilidade
  commits ↔ Solicitações de Mudança (SM-001, SM-002), inventário de funcionalidades/correções,
  composição (SBOM) e limitações conhecidas. Hashes SHA-256 dos 24 ICs no Apêndice A.

### 2.3 Script de Build

- **Arquivos:** `scripts/build.sh` (orquestrador) e `scripts/normalize-sbom.js` (normalizador
  do SBOM). Ponto de entrada: **`npm run build`**.
- **Natureza do build:** o projeto **não compila** (Node puro + frontend estático). Portanto
  "build" aqui é **montagem + empacotamento reprodutível** do release, não transpilação.
- **Saídas (em `dist/`, fora do versionamento):**
  - `dist/sacmed-0.2.0.tar.gz` — pacote do release;
  - `app/sbom-0.2.0.cdx.json` — SBOM normalizado (embarcado);
  - `app/build-info.json` — proveniência (versão, commit, data, toolchain);
  - `MANIFEST.sha256` — hash de cada arquivo do pacote;
  - `SHA256SUMS` — hash do pacote final.

---

## 3. O build é determinístico? **Sim — verificado empiricamente.**

**Definição adotada:** um build é determinístico quando, a partir do mesmo código-fonte,
produz **o mesmo artefato bit-a-bit**, independentemente do momento ou do número de execuções.

### 3.1 Evidência

Duas execuções consecutivas de `npm run build` no mesmo commit produziram artefato com
**SHA-256 idêntico**:

```
RUN 1: 4990d45fb7db9708292363efa0ded19dbd0a8a9a33e9a26f6b0394b3a3989413  sacmed-0.2.0.tar.gz
RUN 2: 4990d45fb7db9708292363efa0ded19dbd0a8a9a33e9a26f6b0394b3a3989413  sacmed-0.2.0.tar.gz
RESULTADO: IDÊNTICOS (build determinístico)
```

> Observação de rastreabilidade: o hash acima foi produzido durante o desenvolvimento (árvore
> com o próprio script ainda não commitado), servindo de **prova do mecanismo**. O hash
> **canônico** do release é o gerado por `npm run build` no commit final, em árvore limpa, e
> fica registrado em `dist/SHA256SUMS` e `build-info.json`. O script emite um aviso quando a
> árvore está suja, justamente para evitar confundir um hash de desenvolvimento com o da baseline.

### 3.2 O que torna o build determinístico

| Fonte de não-determinismo | Mitigação aplicada no script |
|---|---|
| Dependências de terceiros / rede | **Não há** — composição 100% first-party (ver SBOM) |
| Locale e fuso horário | `export TZ=UTC LC_ALL=C` |
| Timestamps de modificação | `SOURCE_DATE_EPOCH` = data do commit (`git log -1 --format=%ct`) |
| `tar`: ordem, dono, grupo, formato | `--sort=name --owner=0 --group=0 --numeric-owner --format=ustar --mtime=@$SOURCE_DATE_EPOCH` |
| `gzip`: timestamp e nome embutidos | `gzip -n` |
| Permissões (variam com `umask`) | `chmod` normaliza 755 (dirs) / 644 (arquivos) antes de empacotar |
| SBOM: `metadata.timestamp` e `serialNumber` aleatórios | `normalize-sbom.js` fixa timestamp (do commit) e `serialNumber` (UUID derivado do hash do commit) |

O artefato passa a ser **função pura do commit**: mesmo commit ⇒ mesmo `SOURCE_DATE_EPOCH` ⇒
mesmo pacote.

---

## 4. Versionamento SemVer

- O produto adota **SemVer** (`MAJOR.MINOR.PATCH`): versão atual **`0.2.0`** nos três
  `package.json` e no `build-info.json` do pacote.
- O `MAJOR = 0` indica **fase inicial de desenvolvimento** (SemVer §4): a API pública ainda
  pode mudar; por isso o salto de funcionalidades MVP → acompanhamento de consultas foi um
  incremento de **MINOR** (`0.1.0 → 0.2.0`), não de MAJOR.
- O nome do artefato carrega a versão (`sacmed-0.2.0.tar.gz`), e há **tags Git semânticas** de
  baseline: `v0.1.0-baseline` (commit `3aff6d0`) e `v0.2.0-baseline` (commit `b282237`).
- A adição do Script de Build é **tooling** (`chore`/`ci`), não altera a API do produto;
  portanto não exige bump de versão e mantém-se `0.2.0`, alinhada ao SBOM/VDD/baseline.

---

## 5. Análise de reprodutibilidade

É preciso distinguir dois níveis:

| Propriedade | Definição | SACMed |
|---|---|---|
| **Build determinístico** | Mesma máquina, repetível ⇒ saída idêntica | ✔ Verificado (seção 3.1) |
| **Build reprodutível** | Máquina/momento **independentes**, mesmas fontes + toolchain ⇒ artefato bit-a-bit idêntico | ✔ Atingível sob as condições abaixo |

### 5.1 Condições necessárias para reprodução independente

1. **Mesmo estado-fonte:** `git checkout v0.2.0-baseline` (ou o commit do release) em árvore limpa.
2. **Mesmo toolchain registrado em `build-info.json`:**
   - Node.js `v22.14.0` (ou compatível — ver §5.2);
   - GNU `tar` ≥ 1.28 (suporte a `--sort`), `gzip`, `coreutils` (`sha256sum`);
   - Opcional: Trivy na versão registrada (se ausente, o script usa o SBOM commitado, mantendo
     o determinismo).
3. **Execução:** `npm run build` e comparação de `dist/SHA256SUMS`.

### 5.2 Ameaças residuais à reprodução bit-a-bit (e tratamento)

- **Versão das ferramentas:** implementações diferentes de `tar`/`gzip` (ex.: BSD tar) ou
  versões distintas de Node podem alterar bytes. **Tratamento:** o `build-info.json` registra
  o toolchain exato usado, tornando a divergência detectável e explicável; o uso de
  `--format=ustar` reduz a superfície de variação entre versões de `tar`.
- **`build-info.json` é parte do pacote:** como ele grava `node_version` e `sbom_tool`, uma
  reprodução em toolchain diferente muda esse arquivo e, logo, o hash. Isso é **intencional**:
  o pacote é autodescritivo e a reprodução só é considerada equivalente sob o mesmo toolchain.
- **Trivy indisponível:** o build degrada com elegância para o SBOM já commitado (também
  normalizado), preservando o determinismo; apenas a etapa de *regeneração* do inventário deixa
  de ocorrer.

### 5.3 Conclusão da análise

O build do SACMed é **determinístico** (comprovado) e **reprodutível de forma controlada**:
fixado o commit e o toolchain registrado em `build-info.json`, qualquer pessoa obtém o mesmo
artefato. As ameaças remanescentes são de **variação de toolchain**, não de lógica do build,
e são **observáveis** pela proveniência embarcada.

---

## 6. Como reproduzir

```bash
# 1. Posicionar na baseline
git checkout v0.2.0-baseline      # arvore limpa

# 2. Gerar o build
npm run build

# 3. Conferir o hash do artefato
cat dist/SHA256SUMS

# 4. (Determinismo) rodar de novo e comparar — deve ser identico
npm run build && cat dist/SHA256SUMS
```

---

## 7. Conclusão

As três entregas da Etapa 2 estão completas e integradas: o **SBOM** comprova composição
100% first-party; o **VDD** descreve formalmente a versão e sua rastreabilidade; e o
**Script de Build** produz um release **determinístico** e **reprodutível sob toolchain
registrado**, versionado em **SemVer** (`0.2.0`) e amarrado às tags de baseline. A combinação
de ausência de dependências de terceiros com as técnicas de empacotamento reprodutível
(`SOURCE_DATE_EPOCH`, `tar` ordenado/ustar, `gzip -n`, normalização do SBOM) coloca o projeto
na melhor postura possível de proveniência e integridade.

---

*Relatório consolidado para a baseline BL-PROD-v0.2.0 do SACMed — Etapa 2.*
