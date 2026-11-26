# 🪟 Versión 2: Ejecutable para Windows PC (.exe)

Compilación automatizada en la nube mediante **GitHub Actions** para no sobrecalentar ni consumir recursos en tu Mac.

---

## 📥 Descarga con 1 Clic (Releases de GitHub)

Los instaladores e interactivos portables de Windows se compilan automáticamente en cada versión y se publican en:

👉 **[Descargar Colorio POP Studio para Windows (.exe)](https://github.com/burerex/pop-mockup-studio/releases)**

Tipos de ejecutables disponibles en cada Release:
1. **`Colorio POP Studio Setup 1.0.0.exe` (Instalador NSIS)**: Instalador guiado con accesos directos en el menú Inicio y Escritorio.
2. **`Colorio POP Studio 1.0.0 Portable.exe` (Portable)**: Ejecutable listo para usar desde una memoria USB o disco local sin requerir permisos de administrador.

---

## ⚙️ Cómo Funciona la Compilación Automática (CI/CD)

El archivo `.github/workflows/build-releases.yml` detecta cualquier `git push` a `main` o publicación de etiqueta de versión (`v1.0.0`):
1. Levanta un runner virtual en los servidores de GitHub con entorno `windows-latest`.
2. Instala dependencias (`npm ci`).
3. Compila el bundle web de producción optimizado.
4. Empaqueta el ejecutable `.exe` con Electron Builder.
5. Adjunta el archivo `.exe` directamente a los Releases de GitHub para descarga pública instantánea.

---

## 💻 Compilación Local Manual (Opcional en PC Windows)

Si tienes una máquina con Windows:
```bash
git clone https://github.com/burerex/pop-mockup-studio.git
cd pop-mockup-studio
npm install
npm run app:build:win
```
El archivo se generará en la carpeta `release/`.
