# 🍏 Versión 1: App Nativa de Escritorio para macOS

Aplicación nativa autónoma compilada con Electron para macOS (Apple Silicon ARM64 y compatible Intel).

---

## 🚀 Cómo Ejecutarla (Sin Servidores ni Terminales)

1. **Doble Clic Directo**:
   - Abre la carpeta en Finder y haz doble clic sobre **`Colorio POP Studio.app`** (o en **`Iniciar-App-Mac.command`**).
2. **Instalador Oficial DMG**:
   - Si prefieres instalarla en tu carpeta de Aplicaciones del sistema, abre **`Colorio-POP-Studio-1.0.0.dmg`** y arrastra el ícono a *Aplicaciones*.
3. **Cero Servidores en Segundo Plano**:
   - La aplicación funciona **100% offline** cargando los archivos locales desde el disco. No requiere tener `node`, `vite` ni ninguna terminal abierta en segundo plano consumiendo memoria RAM.
4. **Aceleración por Hardware**:
   - Incluye flags de rasterizado por GPU (`--enable-gpu-rasterization`, `--enable-accelerated-2d-canvas`) para renderizado fluido a 60/120 FPS en pantallas Retina / ProMotion.

---

## 🛠️ Cómo Regenerar esta Versión

Si realizas cambios en el código fuente:
```bash
cd ~/Projects/pop-mockup-studio
npm run app:build:mac
```
El instalador `.dmg` y el paquete `.app` se actualizarán automáticamente en la carpeta `release/`.
