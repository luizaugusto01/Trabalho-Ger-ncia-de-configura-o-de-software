# Arquitetura do MVP SACMed

O MVP usa uma arquitetura simples em tres partes:

1. **Frontend estatico:** arquivos em `frontend/public`, servidos pelo backend.
2. **API HTTP Node.js:** servidor em `backend/src/server.js`, sem dependencias externas.
3. **Persistencia JSON:** arquivo `backend/src/data.json`, substituivel futuramente por PostgreSQL.

Esta decisao reduz a barreira de execucao para a entrega inicial e preserva a estrutura planejada no PGCS para evolucao posterior com React, Express e banco relacional.
