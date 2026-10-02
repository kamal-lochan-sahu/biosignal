#!/usr/bin/env bash
# Downloads the open-access MIMIC-IV Clinical Database Demo v2.2 from PhysioNet
# (100 patients, Open Data Commons Open Database License v1.0).
# The full MIMIC-IV requires credentialed access and is NOT used here.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DEST="$ROOT/backend/data/mimic-iv-clinical-database-demo-2.2"
URL="https://physionet.org/files/mimic-iv-demo/2.2/"

command -v wget >/dev/null 2>&1 || { echo "ERROR: wget is required"; exit 1; }

mkdir -p "$DEST"
wget -r -N -c -np -nH --cut-dirs=3 -R "index.html*" -P "$DEST" "$URL"

echo "Done: $DEST ($(du -sh "$DEST" | cut -f1))"
echo "License: ODbL v1.0 (see LICENSE.txt in that folder). Please cite PhysioNet and MIMIC-IV when you use this data."
