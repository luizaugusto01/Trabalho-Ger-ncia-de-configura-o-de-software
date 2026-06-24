#!/usr/bin/env node
/*
 * normalize-sbom.js - torna um SBOM CycloneDX deterministico.
 *
 * O Trivy grava dois campos volateis que quebram a reprodutibilidade bit-a-bit:
 *   - metadata.timestamp : momento da geracao (relogio)
 *   - serialNumber       : UUID aleatorio por execucao
 *
 * Este script fixa ambos em funcao do commit/build:
 *   - timestamp  -> data do build (derivada de SOURCE_DATE_EPOCH)
 *   - serialNumber -> UUID v5-like deterministico, derivado do hash do commit
 *
 * Uso: node normalize-sbom.js <entrada> <saida> <buildDateISO> <commit>
 */
"use strict";

const fs = require("fs");
const crypto = require("crypto");

const [, , inPath, outPath, buildDate, commit] = process.argv;
if (!inPath || !outPath || !buildDate || !commit) {
  console.error("uso: normalize-sbom.js <entrada> <saida> <buildDateISO> <commit>");
  process.exit(1);
}

const sbom = JSON.parse(fs.readFileSync(inPath, "utf8"));

if (sbom.metadata) {
  sbom.metadata.timestamp = buildDate;
}

// UUID deterministico a partir do commit (formato v5: SHA-1 truncado).
const h = crypto.createHash("sha1").update(`sacmed:${commit}`).digest("hex");
const y = ((parseInt(h[16], 16) & 0x3) | 0x8).toString(16); // variante RFC 4122
const uuid =
  `${h.slice(0, 8)}-${h.slice(8, 12)}-5${h.slice(13, 16)}-` +
  `${y}${h.slice(17, 20)}-${h.slice(20, 32)}`;
sbom.serialNumber = `urn:uuid:${uuid}`;

fs.writeFileSync(outPath, JSON.stringify(sbom, null, 2) + "\n");
