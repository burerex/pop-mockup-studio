# 🎨 .colorío — POP Mockup Studio & Presupuesto en Línea
### Suite Profesional de Simulación de Material POP, Cotización por Volumen y Aprobación de Diseños

[![Vercel Deployment](https://img.shields.io/badge/Vercel-Producci%C3%B3n-black?style=for-the-badge&logo=vercel)](https://pop-mockup-studio.vercel.app)
[![macOS Standalone](https://img.shields.io/badge/macOS-Apple%20Silicon-blue?style=for-the-badge&logo=apple)](https://github.com/burerex/pop-mockup-studio/releases)
[![Windows PC](https://img.shields.io/badge/Windows-NSIS%20%2F%20Portable-0078D6?style=for-the-badge&logo=windows)](https://github.com/burerex/pop-mockup-studio/releases)
[![React 19](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://react.dev)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind-v4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com)

---

Desarrollado con estética de diseño de alta fidelidad estilo **Figma Studio 2026** por **People Creativa, C.A.** para **Colorio Merchandising** (`@holacolorio`). 

Permite a clientes, diseñadores y ejecutivos de ventas previsualizar marcas sobre artículos POP reales (abanicos circulares flexibles, bolsas ecológicas de tela quirúrgica con o sin fuelle, botellas deportivas, etc.), calcular presupuestos escalonados por volumen, generar fichas de aprobación en PNG y procesar pedidos directamente a WhatsApp con comisiones integradas.

---

## ⚡ Enlaces Rápidos

* 🌐 **Producción en la Nube**: [pop-mockup-studio.vercel.app](https://pop-mockup-studio.vercel.app)
* 📋 **Catálogo POP Directo**: [pop-mockup-studio.vercel.app/catalogo](https://pop-mockup-studio.vercel.app/catalogo)
* 🎨 **Estudio / Simulador**: [pop-mockup-studio.vercel.app/?view=studio](https://pop-mockup-studio.vercel.app/?view=studio)
* 🔐 **Panel Superadministrador**: [pop-mockup-studio.vercel.app/?admin=1](https://pop-mockup-studio.vercel.app/?admin=1)
  * *Correo*: `peoplecreativaca@gmail.com`
  * *Clave inicial*: `1234`
* 🐙 **Repositorio GitHub**: [github.com/burerex/pop-mockup-studio](https://github.com/burerex/pop-mockup-studio)
* ☁️ **Consola Vercel**: [vercel.com/burerexs-projects/pop-mockup-studio](https://vercel.com/burerexs-projects/pop-mockup-studio)
* 🚀 **Portal Visual de Enlaces**: Abre [`accesos-rapidos/PORTAL_ACCESOS_COLORIO.html`](./accesos-rapidos/PORTAL_ACCESOS_COLORIO.html)

---

## 🖥️ Accesos Directos en el Escritorio (`~/Desktop`)

Para máxima comodidad, se crearon los siguientes accesos directos en tu **Escritorio de macOS**:

1. **Carpeta Directa**: `~/Desktop/Colorio POP Studio` -> Acceso directo en 1 clic a la carpeta completa del proyecto.
2. **Lanzador Multi-Navegador**: `~/Desktop/ABRIR_COLORIO_WEBAPPS.command` -> Script interactivo para elegir en qué navegador abrir cualquiera de las aplicaciones:
   * Google Chrome
   * Safari
   * Brave Browser
   * Firefox
   * Microsoft Edge
   * Navegador predeterminado
3. **Directorio de Accesos Rápidos**: [`accesos-rapidos/`](./accesos-rapidos/) dentro del proyecto, con accesos directos `.webloc` a cada sitio y el portal interactivo [`PORTAL_ACCESOS_COLORIO.html`](./accesos-rapidos/PORTAL_ACCESOS_COLORIO.html).

---

## 🗂️ Estructura de las 5 Versiones Disponibles (`versiones/`)

Este proyecto está estandarizado bajo el estándar **Prompt Maestro Universal** para no requerir servidores Node corriendo en segundo plano:

| Carpeta | Versión | Modo de Uso | Consumo de RAM |
| :--- | :--- | :--- | :--- |
| **[`1-version-mac/`](./versiones/1-version-mac/)** | App Nativa macOS | Doble clic en `Colorio POP Studio.app` o `.dmg` con aceleración GPU | **0 MB** (Offline) |
| **[`2-version-pc-windows/`](./versiones/2-version-pc-windows/)** | Ejecutable PC Windows | Descarga de instalador `.exe` o portable compilado en la nube | **0 MB** (Offline) |
| **[`3-version-web-produccion/`](./versiones/3-version-web-produccion/)** | Web Cloud (Vercel) | Despliegue global Edge HTTPS, responsive móvil a 1 dedo | **0 MB** (Cloud) |
| **[`4-version-web-local-simple/`](./versiones/4-version-web-local-simple/)** | Web Local 1-Clic | Doble clic en `abrir-en-navegador.html` sin terminales | **0 MB** (Offline) |
| **[`5-version-principal-repo/`](./versiones/5-version-principal-repo/)** | Código Fuente Maestro | Código fuente React 19 + TypeScript + Vite + Electron | Entorno Dev |

---

## 🚀 Guía de Operación en Cada Sistema

### 🍏 En macOS (Mac con procesador Apple Silicon M1/M2/M3/M4 o Intel)
1. Ve a la carpeta `~/Projects/pop-mockup-studio/versiones/1-version-mac/`.
2. Haz doble clic sobre **`Colorio POP Studio.app`** (o en **`Iniciar-App-Mac.command`**).
3. Si deseas instalarla en tu sistema de forma fija, abre **`Colorio-POP-Studio-1.0.0.dmg`** y arrastra el ícono a *Aplicaciones*.
4. **Nota de Gatekeeper**: Al ser una app local compilada sin certificado de pago de Apple Developer, si macOS muestra *"No se puede abrir porque proviene de un desarrollador no identificado"*, simplemente haz clic derecho sobre la app y selecciona **Abrir** (o ejecuta en terminal: `xattr -cr "/Applications/Colorio POP Studio.app"`).

### 🪟 En Windows PC
1. Ingresa a la sección de [Releases en GitHub](https://github.com/burerex/pop-mockup-studio/releases).
2. Descarga **`Colorio POP Studio Setup 1.0.0.exe`** (instalador guiado) o la versión **`Portable.exe`** (para usar directamente desde una memoria USB sin permisos de administrador).
3. Haz doble clic para iniciar la aplicación. No requiere Node.js ni Python.

### 📱 En Smartphones y Tablets (iOS / Android)
1. Abre [https://pop-mockup-studio.vercel.app](https://pop-mockup-studio.vercel.app) en Safari o Google Chrome.
2. Navegación táctil nativa: desplazamiento vertical fluido con 1 solo dedo (sin bloqueos ni necesidad de 2 dedos).
3. Puedes añadir la app a tu pantalla de inicio mediante la opción *Compartir* -> *Añadir a pantalla de inicio* para usarla a pantalla completa como una Progressive Web App.

---

## 🛠️ Cómo Agregar y Actualizar Productos

### Método 1: Desde la Interfaz Gráfica (Recomendado para el Administrador)
1. Accede al panel Superadmin con `peoplecreativaca@gmail.com` y clave `1234`.
2. Dirígete a la pestaña **Productos** y haz clic en **`+ Nuevo Producto`**.
3. Completa los campos:
   * **Nombre comercial**, **SKU** y **Dimensiones / Capacidad** (ej. *25 cm abierto*, *520 ml*).
   * **Foto Vitrina (`realImageUrl`)**: Fotografía real del producto para el catálogo.
   * **Foto Mockup Limpia (`cleanMockupUrl`)**: Imagen base sin logotipo para que al presionar *Personalizar* se monte el arte del cliente sin interferencias.
   * **Colores y Stock**: Asigna el color visual (HEX), nombre y unidades disponibles.
   * **Escalas de Precios por Volumen**: Define tarifas unitarias escalonadas (ej. 50 uds: \$1.20, 100 uds: \$1.05, 500 uds: \$0.88).
   * **Variantes Secundarias**: Para productos con varias medidas o capacidades (ej. con fuelle, sin fuelle).
4. Guarda los cambios. El producto se sincroniza de inmediato tanto localmente como en la base de datos Neon.

### Método 2: Desde el Código Fuente
1. Edita el archivo [`src/data/products.ts`](./src/data/products.ts).
2. Añade un nuevo objeto respetando la interfaz `Product` de [`src/types.ts`](./src/types.ts).
3. Coloca las imágenes en la carpeta `public/catalog/`.
4. Ejecuta `npm run build` para actualizar el bundle compilado.

---

## 🔄 Cómo Actualizar y Desplegar Cambios

### 1. Actualizar el Despliegue en Producción (Vercel)
```bash
cd ~/Projects/pop-mockup-studio
npx vercel --prod --yes
```
Tu web estará actualizada en internet en menos de 30 segundos.

### 2. Actualizar el Repositorio GitHub
```bash
cd ~/Projects/pop-mockup-studio
git add .
git commit -m "feat: descripción de tus cambios"
git push origin main
```

### 3. Regenerar la App de Escritorio para Mac
```bash
cd ~/Projects/pop-mockup-studio
npm run app:build:mac
```
El nuevo `.app` y `.dmg` quedarán listos en la carpeta `release/` y en `versiones/1-version-mac/`.

---

## 🎨 Especificaciones de Identidad y Diseño

* **Logomarca Oficial**: `.colorío` con tilde magenta (`#F72585`) calibrada exactamente sobre el trazo vertical de la letra `ı`.
* **Paleta Cromática**:
  * 🟣 **Violeta Colorío (Principal)**: `#4C1EDB`
  * 🟢 **Lima Neón (Acento)**: `#C0EE00`
  * 🌸 **Magenta Fucsia (Destacados)**: `#F72585`
  * ⚫ **Negro Grafito (Texto & Fondos oscuros)**: `#0D0E12`
  * ⚪ **Gris Nube (Lienzo & Superficies)**: `#F6F7F9`
* **Tipografía**: `Plus Jakarta Sans` (títulos y acentos geométricos) + `Inter` (cuerpo de texto y números tabulares).

---

## 📖 Bitácora Técnica Completa
Para consultar el registro histórico de decisiones, puertos, tablas de base de datos y fórmulas de cotización, consulta la [**BITACORA.md**](./BITACORA.md).
