#!/usr/bin/env bash
# Lanzador de un solo clic para macOS
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
APP_PATH="$DIR/Colorio POP Studio.app"

if [ -d "$APP_PATH" ]; then
  open "$APP_PATH"
else
  # Fallback a release si no está enlazado
  FALLBACK="$DIR/../../release/mac-arm64/Colorio POP Studio.app"
  if [ -d "$FALLBACK" ]; then
    open "$FALLBACK"
  else
    echo "Abriendo versión web local autónoma..."
    open "$DIR/../4-version-web-local-simple/abrir-en-navegador.html"
  fi
fi
