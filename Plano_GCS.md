# Plano de Gerência de Configuração de Software
## Projeto: SACMed – Sistema de Agendamento de Consultas Médicas

**Universidade Federal de Goiás – Instituto de Informática**
**Disciplina:** Gerência de Configuração de Software – 2026/1
**Professora:** Sofia Costa Paiva
**Norma de referência:** IEEE 828-2012

---

## 1. Introdução

### 1.1 Objetivos

Este documento tem como objetivo estabelecer o Plano de Gerência de Configuração de Software (PGCS) para o projeto **SACMed**, definindo os processos, responsabilidades, itens de configuração, atividades e recursos necessários para garantir a integridade, rastreabilidade e controle de mudanças ao longo do ciclo de vida do sistema.

Os objetivos específicos são:

- Identificar e controlar todos os artefatos relevantes do projeto (Itens de Configuração – ICs);
- Estabelecer e manter linhas de base (*baselines*) do produto ao longo do desenvolvimento;
- Controlar sistematicamente as mudanças aplicadas aos ICs;
- Garantir rastreabilidade entre requisitos, código-fonte, testes e entregas;
- Fornecer meios para auditoria da configuração, assegurando conformidade com os requisitos definidos.

### 1.2 Escopo

O SACMed é um sistema web voltado ao agendamento de consultas médicas entre pacientes e profissionais de saúde de clínicas de pequeno e médio porte. O sistema permite que pacientes agendem, cancelem e acompanhem consultas, enquanto médicos gerenciam suas agendas e prontuários básicos. Uma interface administrativa permite o cadastro de especialidades, profissionais e relatórios.

O domínio de aplicação é **saúde digital / gestão de clínicas**, com front-end web (React), back-end em API REST (Node.js + Express), banco de dados relacional (PostgreSQL) e infraestrutura em nuvem (AWS).

Este PGCS cobre:

- Todo o ciclo de desenvolvimento do SACMed, da concepção ao primeiro release em produção;
- Os artefatos de software produzidos pelo time de desenvolvimento (código-fonte, scripts, documentação, casos de teste, configurações de ambiente);
- Os processos de controle de mudança, versionamento e auditoria associados.

Estão **fora** do escopo deste plano:

- Infraestrutura de hardware físico;
- Processos clínicos e regulatórios de saúde (ANVISA, CFM);
- Sistemas de terceiros integrados via API (ex.: sistemas de pagamento).

### 1.3 Termos-Chave

| Termo | Definição |
|---|---|
| **Gerência de Configuração de Software (GCS)** | Disciplina que aplica direção técnica e administrativa para identificar, controlar, auditar e relatar o status de itens de configuração ao longo do ciclo de vida do software (IEEE 828-2012). |
| **Item de Configuração (IC)** | Qualquer artefato ou agregação de artefatos tratados como uma unidade gerenciável e controlada dentro do processo de GCS. |
| **Linha de Base (*Baseline*)** | Conjunto de ICs formalmente aprovados em um determinado ponto do tempo, que serve como referência para o desenvolvimento subsequente e só pode ser alterado por processo formal de controle de mudança. |
| **Controle de Mudança** | Processo formal de avaliação, aprovação, implementação e verificação de uma solicitação de alteração em um IC sob controle de configuração. |
| **Rastreabilidade** | Capacidade de relacionar artefatos do projeto entre si (ex.: requisito → código → caso de teste → release). |
| **Repositório de Configuração** | Ambiente centralizado (ex.: repositório Git) onde os ICs são armazenados, versionados e acessados de forma controlada. |
| **Comitê de Controle de Configuração (CCB)** | Órgão responsável por avaliar e aprovar (ou rejeitar) solicitações de mudança sobre itens de configuração sob linha de base. |
| **Solicitação de Mudança (SM)** | Documento formal utilizado para propor uma alteração em um IC sob controle de configuração. |
| **Auditoria de Configuração** | Verificação independente que confirma que os ICs estão em conformidade com os requisitos e com a documentação de configuração. Pode ser funcional (FCA) ou física (PCA). |
| **Versionamento Semântico** | Esquema de numeração de versões no formato MAJOR.MINOR.PATCH (ex.: 1.2.0), conforme SemVer 2.0.0. |
| **Tag Git** | Marcação imutável em um commit específico do repositório, usada para identificar releases e baselines. |
| **Sprint** | Iteração de desenvolvimento de duração fixa (2 semanas) utilizada no processo ágil Scrum adotado pelo projeto. |

### 1.4 Referências

- IEEE Std 828-2012 – *IEEE Standard for Configuration Management in Systems and Software Engineering*. IEEE, 2012.
- PRESSMAN, R. S.; MAXIM, B. R. *Engenharia de Software: uma abordagem profissional*. 8ª ed. McGraw-Hill, 2016.
- SOMMERVILLE, I. *Engenharia de Software*. 10ª ed. Pearson, 2019.
- Conventional Commits Specification v1.0.0 – https://www.conventionalcommits.org
- Semantic Versioning 2.0.0 – https://semver.org
- Git Flow Workflow – Atlassian: https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow
- GitHub Actions Documentation – https://docs.github.com/actions

---

## 2. Responsabilidades e Papéis

### 2.1 Estrutura Organizacional

A equipe do SACMed é composta por três integrantes, com papéis distribuídos conforme abaixo. Em razão do tamanho reduzido da equipe, alguns papéis são acumulados por um mesmo membro, prática prevista pela IEEE 828-2012 para projetos de menor porte.

### 2.2 Papéis e Responsabilidades

#### Gerente de Configuração (GC)
**Responsável:** Membro A

Atribuições:

- Elaborar, manter e distribuir o Plano de Gerência de Configuração;
- Configurar e administrar o repositório Git (GitHub), incluindo políticas de branches, proteções e permissões de acesso;
- Definir e aplicar a nomenclatura padronizada para branches, tags e commits;
- Registrar e rastrear o status de todas as Solicitações de Mudança (SMs);
- Conduzir as auditorias de configuração (FCA e PCA);
- Gerar relatórios de status de configuração (RSC) ao final de cada sprint;
- Garantir que as baselines sejam estabelecidas conforme o cronograma.

#### Membro do Comitê de Controle de Configuração (CCB)
**Responsável:** Todos os membros (Membro A, B e C)

O CCB é o órgão colegiado responsável pelas decisões de controle de mudança. Para o SACMed, o CCB é composto pelos três integrantes do grupo.

Atribuições:

- Avaliar o impacto técnico, de prazo e de custo de cada Solicitação de Mudança recebida;
- Aprovar ou rejeitar SMs por maioria simples (2 de 3 votos);
- Documentar as decisões no sistema de issues do GitHub;
- Comunicar decisões ao solicitante em até 48 horas após o recebimento da SM.

#### Desenvolvedor / Responsável por Integração
**Responsável:** Membro B

Atribuições:

- Implementar mudanças aprovadas pelo CCB dentro do fluxo de branches definido;
- Abrir Pull Requests (PRs) com descrição clara das alterações e referência à SM associada;
- Garantir que o código entregue passa nos testes automatizados antes do merge;
- Configurar e manter os pipelines de CI/CD no GitHub Actions;
- Reportar impedimentos ou impactos técnicos ao Gerente de Configuração.

#### Responsável por Qualidade e Testes
**Responsável:** Membro C

Atribuições:

- Criar e manter os casos de teste alinhados aos requisitos;
- Executar testes de regressão antes de cada baseline;
- Verificar que os itens entregues em cada PR satisfazem os critérios de aceitação definidos;
- Reportar defeitos como issues no GitHub, associando-os ao IC e à versão afetada;
- Participar das auditorias de configuração como revisor independente.

### 2.3 Matriz de Responsabilidades (RACI)

| Atividade | Membro A (GC) | Membro B (Dev) | Membro C (QA) |
|---|---|---|---|
| Manter o PGCS | R | I | I |
| Administrar repositório | R | C | I |
| Criar/fechar SM | A | R | R |
| Avaliar SM no CCB | A | C | C |
| Implementar mudança aprovada | I | R | C |
| Estabelecer baseline | R | C | C |
| Executar testes de regressão | I | C | R |
| Conduzir auditoria de configuração | R | C | C |
| Emitir relatório de status | R | I | I |

*R = Responsável, A = Aprovador, C = Consultado, I = Informado*

---

## 3. Identificação dos Itens de Configuração

### 3.1 Critérios para Entrada de Itens de Configuração

Um artefato é elegível para ser tratado como IC quando atende a **pelo menos um** dos seguintes critérios:

1. **Relevância funcional:** O artefato define, implementa ou valida requisitos do sistema;
2. **Impacto em baseline:** Alterações no artefato podem afetar uma linha de base estabelecida;
3. **Compartilhamento entre membros:** O artefato é produzido ou consumido por mais de um membro da equipe;
4. **Entregável externo:** O artefato faz parte de uma entrega para a professora ou para o cliente;
5. **Dependência de rastreabilidade:** O artefato precisa ser relacionado a outros ICs para fins de auditoria ou controle de mudança.

Artefatos puramente temporários ou rascunhos locais de trabalho **não** são tratados como ICs até que sejam formalmente aceitos por um PR aprovado.

### 3.2 Categorias de Itens de Configuração

#### IC-01 – Documentação

| ID | Nome | Descrição | Extensão |
|---|---|---|---|
| IC-01.1 | Plano de Gerência de Configuração | Este documento | .pdf / .md |
| IC-01.2 | Documento de Requisitos (SRS) | Especificação de requisitos funcionais e não funcionais | .pdf / .md |
| IC-01.3 | Documento de Arquitetura (SAD) | Visão geral da arquitetura do sistema | .pdf / .md |
| IC-01.4 | Manual do Usuário | Guia de uso do sistema para pacientes e médicos | .pdf |
| IC-01.5 | Atas de Sprint e CCB | Registros de reuniões e decisões | .md |

#### IC-02 – Código-Fonte

| ID | Nome | Descrição | Localização |
|---|---|---|---|
| IC-02.1 | Front-end (React) | Componentes, páginas e estilos da aplicação web | `/frontend/src/` |
| IC-02.2 | Back-end (API REST) | Rotas, controllers, services e modelos | `/backend/src/` |
| IC-02.3 | Scripts de banco de dados | Migrations, seeds e stored procedures | `/database/` |
| IC-02.4 | Arquivos de configuração de ambiente | `.env.example`, `docker-compose.yml` | `/` (raiz) |

#### IC-03 – Testes

| ID | Nome | Descrição | Localização |
|---|---|---|---|
| IC-03.1 | Testes unitários (back-end) | Testes de unidade com Jest | `/backend/tests/unit/` |
| IC-03.2 | Testes de integração | Testes de integração da API | `/backend/tests/integration/` |
| IC-03.3 | Testes end-to-end | Testes E2E com Cypress | `/e2e/` |
| IC-03.4 | Plano de Testes | Documento com estratégia e casos de teste | `/docs/testes/` |

#### IC-04 – Build e Infraestrutura

| ID | Nome | Descrição | Localização |
|---|---|---|---|
| IC-04.1 | Pipeline de CI/CD | Workflows do GitHub Actions | `/.github/workflows/` |
| IC-04.2 | Dockerfile | Configuração de contêiner da aplicação | `/Dockerfile` |
| IC-04.3 | Configuração de deploy (AWS) | Scripts de infraestrutura como código | `/infra/` |

### 3.3 Esquema de Nomenclatura e Versionamento

#### Versões de Release (Versionamento Semântico)
```
MAJOR.MINOR.PATCH
  │     │     └── Correção de bug sem quebra de compatibilidade
  │     └──────── Nova funcionalidade compatível com versão anterior
  └────────────── Mudança incompatível com versão anterior (breaking change)

Exemplos: 0.1.0 (primeira versão funcional), 1.0.0 (release inicial), 1.2.3
```

#### Nomenclatura de Branches (Git Flow adaptado)
```
main              → código em produção (protegida, merge apenas via PR aprovado)
develop           → integração contínua, reflete o estado atual de desenvolvimento
feature/<nome>    → desenvolvimento de nova funcionalidade  (ex: feature/agendamento-consulta)
fix/<nome>        → correção de bug                         (ex: fix/validacao-cpf)
release/<versao>  → preparação de release                   (ex: release/1.0.0)
hotfix/<nome>     → correção emergencial em produção        (ex: hotfix/erro-login)
```

#### Nomenclatura de Tags (Baselines e Releases)
```
v<MAJOR>.<MINOR>.<PATCH>[-<qualificador>]

Exemplos:
  v0.1.0-baseline    → Baseline de requisitos aprovada
  v0.2.0-baseline    → Baseline de arquitetura aprovada
  v1.0.0             → Release de produção
```

#### Padrão de Mensagens de Commit (Conventional Commits)
```
<tipo>(<escopo>): <descrição curta>

Tipos válidos: feat, fix, docs, test, refactor, chore, ci
Escopo: módulo afetado (ex: auth, agendamento, api)

Exemplos:
  feat(agendamento): adiciona validação de conflito de horário
  fix(auth): corrige expiração de token JWT
  docs(pgcs): atualiza seção de itens de configuração
```

### 3.4 Estrutura Padronizada do Repositório

```
sacmed/
├── .github/
│   ├── workflows/
│   │   ├── ci.yml                  # Pipeline de CI (testes e lint)
│   │   └── deploy.yml              # Pipeline de deploy (produção)
│   └── PULL_REQUEST_TEMPLATE.md    # Template de PR com checklist de GCS
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── services/
│   ├── public/
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── services/
│   │   └── models/
│   ├── tests/
│   │   ├── unit/
│   │   └── integration/
│   └── package.json
│
├── database/
│   ├── migrations/
│   └── seeds/
│
├── e2e/
│   └── cypress/
│
├── infra/
│   └── aws/
│
├── docs/
│   ├── requisitos/
│   ├── arquitetura/
│   ├── testes/
│   └── gcs/
│       ├── PGCS.pdf
│       ├── solicitacoes-mudanca/
│       └── relatorios-status/
│
├── .env.example
├── docker-compose.yml
├── Dockerfile
└── README.md
```

---

## 4. Atividades, Cronograma e Recursos

### 4.1 Atividades de GCS

#### 4.1.1 Planejamento de Configuração
- Elaboração e aprovação do PGCS;
- Configuração do repositório GitHub (proteções de branch, templates de PR e issue);
- Definição e comunicação do fluxo de trabalho Git para a equipe.

#### 4.1.2 Identificação de Configuração
- Levantamento e catalogação inicial dos ICs;
- Atribuição de identificadores únicos a cada IC;
- Criação da estrutura de diretórios no repositório.

#### 4.1.3 Controle de Mudanças
- Abertura de SM via *issue* no GitHub com template padronizado (título, justificativa, impacto estimado, prioridade);
- Análise e votação pelo CCB em até 48 horas;
- Implementação em branch dedicada, seguida de PR com referência à SM;
- Review de código por pelo menos um membro diferente do autor;
- Merge aprovado e fechamento da SM com registro de decisão.

#### 4.1.4 Controle de Status e Relatórios
- Geração de Relatório de Status de Configuração (RSC) ao fim de cada sprint, contendo:
  - ICs criados, modificados ou removidos no período;
  - SMs abertas, aprovadas, rejeitadas e pendentes;
  - Estado atual das branches e tags;
  - Resultado dos pipelines de CI/CD.

#### 4.1.5 Auditorias de Configuração
- **Auditoria Funcional de Configuração (FCA):** verifica se os ICs entregues satisfazem os requisitos funcionais definidos. Realizada antes de cada baseline de entrega.
- **Auditoria Física de Configuração (PCA):** verifica se o repositório contém exatamente os artefatos declarados nos ICs, com as versões corretas. Realizada antes do release final.

#### 4.1.6 Estabelecimento de Baselines
Três baselines formais são previstas:

| Baseline | Descrição | Artefatos |
|---|---|---|
| **BL-01 – Requisitos** | Requisitos levantados e aprovados | SRS v1.0, Casos de Uso, Glossário |
| **BL-02 – Arquitetura** | Arquitetura definida e validada | SAD v1.0, Diagrama de componentes, ERD |
| **BL-03 – Produto** | Sistema pronto para release em produção | Todos os ICs das categorias IC-01 a IC-04 |

### 4.2 Cronograma

| Data | Marco / Atividade | Baseline |
|---|---|---|
| 28/03/2026 | Início do projeto, configuração do repositório | — |
| 11/04/2026 | Entrega do PGCS (Parte 1) | — |
| 25/04/2026 | Levantamento de requisitos concluído | **BL-01 – Requisitos** |
| 09/05/2026 | Arquitetura definida e documentada | **BL-02 – Arquitetura** |
| 16/05/2026 | Sprint 1 entregue (módulo de autenticação) | — |
| 30/05/2026 | Sprint 2 entregue (módulo de agendamento) | — |
| 13/06/2026 | Sprint 3 entregue (módulo administrativo) | — |
| 20/06/2026 | Testes de aceitação e auditoria PCA | — |
| 27/06/2026 | Release final – sistema em produção | **BL-03 – Produto** |
| 04/07/2026 | Entrega final da documentação do projeto | — |

> Cada sprint tem duração de 2 semanas. Ao final de cada sprint é gerado um RSC e realizada uma revisão informal da configuração.

### 4.3 Recursos

#### 4.3.1 Ferramentas

| Ferramenta | Finalidade | Licença |
|---|---|---|
| **GitHub** | Repositório Git, controle de versão, gestão de issues e PRs, wiki | Gratuita (plano academic) |
| **GitHub Actions** | Pipeline de CI/CD automatizado | Gratuita (minutos inclusos) |
| **Git** | Versionamento local | Gratuita (open source) |
| **Docker / Docker Compose** | Padronização de ambientes de desenvolvimento e produção | Gratuita |
| **Jest** | Testes unitários e de integração (back-end Node.js) | Gratuita (open source) |
| **Cypress** | Testes end-to-end | Gratuita (open source) |
| **ESLint + Prettier** | Padronização e qualidade de código | Gratuita (open source) |
| **SonarCloud** | Análise estática de código e cobertura de testes | Gratuita (projetos públicos) |
| **Notion / Google Docs** | Elaboração colaborativa de documentação | Gratuita |
| **AWS Free Tier** | Hospedagem da aplicação em ambiente de produção | Gratuita (tier) |

#### 4.3.2 Pessoas

| Papel | Dedicação Estimada | Responsável |
|---|---|---|
| Gerente de Configuração | ~4h/semana | Membro A |
| Desenvolvedor / CI-CD | ~10h/semana | Membro B |
| QA / Testes | ~6h/semana | Membro C |

#### 4.3.3 Treinamentos Necessários

| Treinamento | Justificativa | Membros | Formato |
|---|---|---|---|
| Git Flow e fluxo de branches | Garantir que todos sigam o fluxo definido no PGCS | B, C | Documentação interna + vídeo (1h) |
| Conventional Commits | Padronização das mensagens de commit | A, B, C | Leitura da especificação (30min) |
| GitHub Actions (CI/CD) | Configuração e manutenção dos pipelines | B | Tutorial oficial (2h) |
| Jest – testes unitários e de integração | Capacitar membro C na escrita de testes automatizados | C | Curso online gratuito (3h) |
| Cypress – testes E2E | Automação de testes de ponta a ponta | C | Tutorial oficial (2h) |
| SonarCloud | Interpretação de relatórios de qualidade | A, C | Documentação (1h) |

---

## Controle de Versão do Documento

| Versão | Data | Descrição | Autor |
|---|---|---|---|
| 0.1 | 01/04/2026 | Versão inicial para revisão interna | Grupo |
| 1.0 | 11/04/2026 | Versão aprovada para entrega | Grupo |
