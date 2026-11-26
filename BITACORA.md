# 📖 BITÁCORA TÉCNICA DEL PROYECTO
## .colorío — POP Mockup Studio & Presupuesto en Línea

---

### 1. 📋 Ficha Técnica del Proyecto

* **Nombre del Proyecto**: `.colorío POP Mockup Studio`
* **Directorio Raíz**: `/Users/gustavoandueza/.gemini/antigravity/scratch/pop-mockup-studio`
* **Acceso Rápido Finder**: `~/Projects/pop-mockup-studio` (Enlace simbólico unificado)
* **Propósito**: Suite integral de simulación y personalización de material POP comercial para *.colorío* (abanicos circulares flexibles, bolsas ecológicas de tela quirúrgica con o sin fuelle, botellas deportivas, etc.), con visualización realista de logos, cálculo de precios por volumen, generación de fichas técnicas de aprobación en PNG, carrito multiproducto y checkout directo a WhatsApp con comisiones y códigos de referencia.
* **Cliente / Identidad**: Desarrollado por **People Creativa, C.A.** para **Colorio Merchandising** (`@holacolorio`).
* **Tecnologías**: React 19, TypeScript, Tailwind CSS v4, Vite, Electron 45, Electron Builder, Vercel Serverless Functions, Neon Postgres Database (Serverless), Lucide Icons, Canvas / SVG Export.
* **Fecha de Estandarización**: 26 de Noviembre de 2026.

---

### 2. 🐙 Repositorio GitHub y CI/CD

* **Repositorio Remoto**: [https://github.com/burerex/pop-mockup-studio](https://github.com/burerex/pop-mockup-studio)
* **Rama Principal**: `main`
* **Automatización CI/CD**: `.github/workflows/build-releases.yml`
  * Compila artefactos para **macOS** (`.dmg` y `.zip`) en runner `macos-latest`.
  * Compila ejecutables para **Windows** (`.exe` NSIS y portable) en runner `windows-latest`.
  * Genera releases automáticos en GitHub con cada versión etiquetada.

---

### 3. ☁️ Despliegue en Producción (Vercel)

* **URL de Producción Activa**: [https://pop-mockup-studio.vercel.app](https://pop-mockup-studio.vercel.app)
* **Ruta de Catálogo POP Directo**: [https://pop-mockup-studio.vercel.app/catalogo](https://pop-mockup-studio.vercel.app/catalogo)
* **Ruta de Landing Dinámica**: [https://pop-mockup-studio.vercel.app/landing](https://pop-mockup-studio.vercel.app/landing)
* **Ruta del Simulador / Estudio**: [https://pop-mockup-studio.vercel.app/?view=studio](https://pop-mockup-studio.vercel.app/?view=studio)
* **Vercel Scope / Proyecto**: `burerexs-projects / pop-mockup-studio`
* **Base de Datos**: Neon Postgres Serverless conectada en `/api/store` y `/api/orders` con soporte offline a `localStorage`.

---

### 4. 🔌 Auditoría de Puertos y Estrategia Cero-Servidor-Local

* **Puertos de Desarrollo Tradicional**: `5173` (Vite) / `3000` (Node).
* **Estado de Puertos en Máquina**: Auditoría realizada con `lsof -i -P -n | grep LISTEN`.
  * Ningún proceso de `pop-mockup-studio` se encuentra escuchando ni consumiendo RAM en segundo plano.
  * Consumo de memoria por servidores locales del proyecto: **0 MB**.
* **Estrategia Offline**:
  1. **Mac Nativo**: Binario `Colorio POP Studio.app` empaquetado con Electron y cargando los archivos locales desde el disco (`file://`), con aceleración de hardware activa (`--enable-gpu-rasterization`).
  2. **Web Offline 1-Clic**: `abrir-en-navegador.html` ubicado en `versiones/4-version-web-local-simple/` para abrir directamente en cualquier navegador sin terminales.
  3. **Cloud**: Si se requiere acceso global o móvil, se utiliza la infraestructura de Vercel.

---

### 5. 🗂️ Matriz de las 5 Versiones Estandarizadas

```text
versiones/
├── 1-version-mac/               # App nativa macOS (.app, .dmg, Iniciar-App-Mac.command)
├── 2-version-pc-windows/        # Instrucciones y enlace directo a releases .exe en GitHub
├── 3-version-web-produccion/    # Web app alojada en Vercel + QR para móviles
├── 4-version-web-local-simple/  # Lanzador offline abrir-en-navegador.html sin servidor Node
└── 5-version-principal-repo/   # Mapa completo del código fuente y guías de desarrollo
```

---

### 6. 🕒 Registro Cronológico de Hitos Alcanzados

| Hito | Descripción |
| :--- | :--- |
| **M1** | Extracción de productos reales del catálogo PDF de Diciembre (abanicos, bolsas, coolers) y carga de fotos reales y mockups limpios. |
| **M2** | Construcción del simulador interactivo de abanicos circulares plegables y bolsas ecológicas con rotación, zoom y cambio de colores de tela al tono. |
| **M3** | Incorporación de cotizador dinámico por escalas de volumen con desglose de IVA (16%), cálculo de envíos y comisión opcional de procesamiento (1%). |
| **M4** | Panel de Superadministrador (`peoplecreativaca@gmail.com` / `1234`): CRUD completo de productos, cupones de descuento, liquidación de vendedores, referidos y links rastreables. |
| **M5** | Implementación de landing page dinámica con abanico interactivo de fondo que responde al mouse/touch y selector de modos de visualización. |
| **M6** | Soporte para pedidos multiproducto con opción de mantener o cambiar el arte, switch para ocultar/mostrar productos agotados y eliminación de restricciones de cantidad mínima. |
| **M7** | Despliegue en la nube con Vercel y conexión a base de datos serverless Neon. |
| **M8** | Corrección visual de la logomarca `.colorío` con tilde magenta posicionada directamente sobre la letra `ı`. |
| **M9** | Estandarización de 5 versiones según el Prompt Maestro: cierre de servidores huérfanos, empaquetado Electron (`.app`, `.dmg`), CI/CD GitHub Actions para Windows (`.exe`) y symlink en `~/Projects/pop-mockup-studio`. |
