#!/usr/bin/env bash
#
# build.sh - Script de Build reprodutivel do SACMed (Etapa 2 - GCS)
#
# Produz um pacote de release deterministico a partir do codigo-fonte versionado.
# O projeto nao compila (Node puro + frontend estatico): "build" aqui significa
# MONTAGEM + EMPACOTAMENTO reprodutivel do release, com geracao do SBOM e hashes.
#
# Determinismo: o artefato e funcao pura do commit. Para garantir bit-a-bit:
#   - TZ=UTC, LC_ALL=C (remove variacao de locale/fuso)
#   - SOURCE_DATE_EPOCH = data do commit (timestamps fixos no tar/SBOM)
#   - modos de arquivo normalizados (independe de umask)
#   - tar --sort=name, owner/group 0, --format=ustar (sem headers variaveis)
#   - gzip -n (nao grava timestamp/nome no .gz)
#   - SBOM com timestamp e serialNumber normalizados
#
# Uso:   npm run build     (ou)   bash scripts/build.sh
# Flags: SKIP_TESTS=1 para pular os testes; SOURCE_DATE_EPOCH=<ts> para fixar a data.
#
set -euo pipefail
export TZ=UTC LC_ALL=C

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

# ---------------------------------------------------------------------------
# 1. Metadados da build (deterministicos para um dado commit)
# ---------------------------------------------------------------------------
VERSION="$(node -p "require('./package.json').version")"
COMMIT="$(git rev-parse HEAD 2>/dev/null || echo 'unknown')"
COMMIT_SHORT="$(git rev-parse --short HEAD 2>/dev/null || echo 'unknown')"
: "${SOURCE_DATE_EPOCH:=$(git log -1 --format=%ct 2>/dev/null || echo 0)}"
export SOURCE_DATE_EPOCH
BUILD_DATE="$(date -u -d "@${SOURCE_DATE_EPOCH}" +%Y-%m-%dT%H:%M:%SZ)"
NODE_VERSION="$(node --version)"
if command -v trivy >/dev/null 2>&1; then
  SBOM_TOOL="$(trivy --version | head -1)"
else
  SBOM_TOOL="trivy ausente (fallback: SBOM commitado)"
fi

OUT="dist"
STAGE="${OUT}/app"
PKG="${OUT}/sacmed-${VERSION}.tar.gz"

echo "==> SACMed build ${VERSION} (commit ${COMMIT_SHORT})"
echo "    SOURCE_DATE_EPOCH=${SOURCE_DATE_EPOCH} (${BUILD_DATE})"
if [ -n "$(git status --porcelain 2>/dev/null)" ]; then
  echo "    AVISO: arvore de trabalho com mudancas nao commitadas - o hash do"
  echo "           artefato so corresponde a uma baseline apos commit em arvore limpa."
fi

# ---------------------------------------------------------------------------
# 2. Testes (nao alteram o artefato, mas barram build de codigo quebrado)
# ---------------------------------------------------------------------------
if [ "${SKIP_TESTS:-0}" != "1" ]; then
  echo "==> testes"
  node --test backend/tests/integration/*.test.js
fi

# ---------------------------------------------------------------------------
# 3. Staging limpo + copia dos Itens de Configuracao de runtime
# ---------------------------------------------------------------------------
echo "==> montando ${STAGE}"
rm -rf "$OUT"
mkdir -p "${STAGE}/backend" "${STAGE}/frontend"
cp -r backend/src        "${STAGE}/backend/src"
cp    backend/package.json "${STAGE}/backend/package.json"
cp -r frontend/public    "${STAGE}/frontend/public"
cp    frontend/package.json "${STAGE}/frontend/package.json"
cp -r database           "${STAGE}/database"
cp    package.json README.md "${STAGE}/"
echo "${VERSION}" > "${STAGE}/VERSION"

# ---------------------------------------------------------------------------
# 4. SBOM: gera (Trivy) ou reusa o commitado; depois NORMALIZA (deterministico)
# ---------------------------------------------------------------------------
echo "==> SBOM"
RAW_SBOM="${OUT}/sbom-raw.json"
if command -v trivy >/dev/null 2>&1; then
  trivy fs --quiet --format cyclonedx --output "$RAW_SBOM" .
else
  cp docs/gcs/pratica-sbom-vdd/sbom-v0.2.0.cdx.json "$RAW_SBOM"
fi
node scripts/normalize-sbom.js "$RAW_SBOM" "${STAGE}/sbom-${VERSION}.cdx.json" "$BUILD_DATE" "$COMMIT"
rm -f "$RAW_SBOM"

# ---------------------------------------------------------------------------
# 5. build-info.json (toolchain + proveniencia) - tudo deterministico
# ---------------------------------------------------------------------------
echo "==> build-info.json"
VERSION="$VERSION" COMMIT="$COMMIT" BUILD_DATE="$BUILD_DATE" \
SDE="$SOURCE_DATE_EPOCH" NODE_V="$NODE_VERSION" SBOM_TOOL="$SBOM_TOOL" \
node -e '
  const fs = require("fs");
  const o = {
    product: "SACMed",
    version: process.env.VERSION,
    commit: process.env.COMMIT,
    build_date: process.env.BUILD_DATE,
    source_date_epoch: Number(process.env.SDE),
    node_version: process.env.NODE_V,
    sbom_tool: process.env.SBOM_TOOL,
    reproducible: true,
  };
  fs.writeFileSync(process.argv[1], JSON.stringify(o, null, 2) + "\n");
' "${STAGE}/build-info.json"

# ---------------------------------------------------------------------------
# 6. Normaliza modos (independe de umask) -> determinismo dos bits do tar
# ---------------------------------------------------------------------------
find "$STAGE" -type d -exec chmod 755 {} +
find "$STAGE" -type f -exec chmod 644 {} +

# ---------------------------------------------------------------------------
# 7. Empacotamento reprodutivel (tar ustar ordenado + gzip -n)
# ---------------------------------------------------------------------------
echo "==> empacotando ${PKG}"
tar --sort=name --owner=0 --group=0 --numeric-owner \
    --mtime="@${SOURCE_DATE_EPOCH}" --format=ustar \
    -C "$OUT" -cf "${OUT}/app.tar" app
gzip -n -9 -c "${OUT}/app.tar" > "$PKG"
rm -f "${OUT}/app.tar"

# ---------------------------------------------------------------------------
# 8. Hashes de integridade
# ---------------------------------------------------------------------------
( cd "$STAGE" && find . -type f | LC_ALL=C sort | xargs sha256sum ) > "${OUT}/MANIFEST.sha256"
( cd "$OUT" && sha256sum "sacmed-${VERSION}.tar.gz" > SHA256SUMS )
PKG_SHA="$(sha256sum "$PKG" | cut -d' ' -f1)"

echo ""
echo "==> OK"
echo "    artefato : ${PKG}"
echo "    sha256   : ${PKG_SHA}"
echo "    manifest : ${OUT}/MANIFEST.sha256"
