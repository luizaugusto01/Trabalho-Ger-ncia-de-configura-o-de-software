## Resumo

-

## Fluxo Git Flow Adaptado

- Branch de origem: `feature/<nome>`, `fix/<nome>` ou `hotfix/<nome>`
- Branch de destino deste PR: `develop`
- Merge para `main`: apenas via `release/<versao>` ou `hotfix/<nome>` aprovado
- Tipo de mudanca: `feat`, `fix`, `docs`, `test`, `refactor`, `chore` ou `ci`

## Rastreabilidade GCS

- Solicitação de Mudança: SM-
- Relatório de Status de Configuração: RSC-
- Branch: `feature/`
- Commits principais:
  - `tipo(escopo): descricao`
- Itens de Configuração afetados:
  - [ ] IC-01 Documentação
  - [ ] IC-02 Código-fonte
  - [ ] IC-03 Testes
  - [ ] IC-04 Build e infraestrutura

## Checklist

- [ ] A branch segue a nomenclatura definida no PGCS.
- [ ] O PR tem base `develop`, exceto hotfix/release aprovado pelo CCB.
- [ ] O commit segue Conventional Commits.
- [ ] A SM correspondente foi aprovada pelo CCB.
- [ ] A documentação afetada foi atualizada.
- [ ] Os testes automatizados foram executados.
- [ ] O PR referencia a SM e o RSC correspondentes.
- [ ] Não foram incluídos arquivos temporários, credenciais ou dados sensíveis.

## Testes

```bash
npm test
```
