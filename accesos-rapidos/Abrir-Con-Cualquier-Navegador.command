#!/bin/bash
# ==============================================================================
# .colorío POP MOCKUP STUDIO — LANZADOR DE WEB APPS Y SERVICIOS
# People Creativa, C.A. para Colorio Merchandising (@holacolorio)
# ==============================================================================

clear
echo "=============================================================================="
echo "          .colorío POP MOCKUP STUDIO — LANZADOR MULTI-NAVEGADOR              "
echo "=============================================================================="
echo ""
echo "Selecciona el navegador con el que deseas abrir:"
echo "  1) Google Chrome"
echo "  2) Safari"
echo "  3) Brave Browser"
echo "  4) Firefox"
echo "  5) Microsoft Edge"
echo "  6) Navegador Predeterminado del Sistema"
echo "  7) Salir"
echo ""
read -p "Ingresa tu opción (1-7): " nav_opcion

case $nav_opcion in
  1) BROWSER="Google Chrome" ;;
  2) BROWSER="Safari" ;;
  3) BROWSER="Brave Browser" ;;
  4) BROWSER="Firefox" ;;
  5) BROWSER="Microsoft Edge" ;;
  6) BROWSER="DEFAULT" ;;
  *) echo "Operación cancelada."; exit 0 ;;
esac

echo ""
echo "------------------------------------------------------------------------------"
echo "Navegador seleccionado: $BROWSER"
echo "------------------------------------------------------------------------------"
echo "¿Qué aplicación o sección deseas abrir?"
echo "  1) 🚀 ABRIR TODO (Landing + Catálogo POP + Panel Superadmin)"
echo "  2) 🌟 Landing Dinámica Principal (.colorío Oficial)"
echo "  3) 📋 Catálogo POP Directo (Productos Reales y Filtros)"
echo "  4) 🎨 Simulador / Estudio POP (Personalizador Interactivo)"
echo "  5) 🔐 Panel de Gestión / Superadmin (peoplecreativaca@gmail.com)"
echo "  6) 🐙 Repositorio GitHub en la Web (burerex/pop-mockup-studio)"
echo "  7) ☁️ Panel de Vercel Dashboard (Gestión Cloud de Producción)"
echo "  8) 💻 Versión Web Local Offline (Sin servidores / 0 MB RAM)"
echo "  9) 🍏 App Nativa de Escritorio para Mac (.app con Aceleración GPU)"
echo " 10) 📂 Abrir Carpeta del Proyecto en Finder"
echo " 11) Salir"
echo ""
read -p "Ingresa tu opción (1-11): " app_opcion

# Helper function to open URL with chosen browser
abrir_url() {
  local target_url="$1"
  if [ "$BROWSER" = "DEFAULT" ]; then
    open "$target_url"
  else
    open -a "$BROWSER" "$target_url"
  fi
}

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
PROJ_ROOT="/Users/gustavoandueza/.gemini/antigravity/scratch/pop-mockup-studio"

echo ""
case $app_opcion in
  1)
    echo "Abriendo suite completa en $BROWSER..."
    abrir_url "https://pop-mockup-studio.vercel.app"
    sleep 0.5
    abrir_url "https://pop-mockup-studio.vercel.app/catalogo"
    sleep 0.5
    abrir_url "https://pop-mockup-studio.vercel.app/?admin=1"
    echo "¡Listo! Pestañas abiertas correctamente."
    ;;
  2)
    echo "Abriendo Landing Principal..."
    abrir_url "https://pop-mockup-studio.vercel.app"
    ;;
  3)
    echo "Abriendo Catálogo POP..."
    abrir_url "https://pop-mockup-studio.vercel.app/catalogo"
    ;;
  4)
    echo "Abriendo Simulador / Estudio POP..."
    abrir_url "https://pop-mockup-studio.vercel.app/?view=studio"
    ;;
  5)
    echo "Abriendo Panel de Gestión Superadmin..."
    abrir_url "https://pop-mockup-studio.vercel.app/?admin=1"
    ;;
  6)
    echo "Abriendo Repositorio GitHub en la Web..."
    abrir_url "https://github.com/burerex/pop-mockup-studio"
    ;;
  7)
    echo "Abriendo Panel Vercel..."
    abrir_url "https://vercel.com/burerexs-projects/pop-mockup-studio"
    ;;
  8)
    echo "Abriendo Versión Web Local Offline..."
    abrir_url "$PROJ_ROOT/versiones/4-version-web-local-simple/abrir-en-navegador.html"
    ;;
  9)
    echo "Iniciando App Nativa macOS (.app)..."
    open "$PROJ_ROOT/release/mac-arm64/Colorio POP Studio.app"
    ;;
  10)
    echo "Abriendo carpeta del proyecto en Finder..."
    open "$PROJ_ROOT"
    ;;
  *)
    echo "Operación cancelada."
    exit 0
    ;;
esac

echo ""
echo "=============================================================================="
echo "✔ Proceso completado exitosamente."
echo "=============================================================================="
sleep 1.5
