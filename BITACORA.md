# 📖 BITÁCORA TÉCNICA MAESTRA Y MANUAL DE OPERACIÓN
## .colorío — POP Mockup Studio & Presupuesto en Línea

> **Desarrollado por:** People Creativa, C.A.  
> **Para:** Colorio Merchandising (`@holacolorio`)  
> **Fecha de Estandarización:** 26 de Noviembre de 2026  
> **Estado del Sistema:** Producción Activa (Vercel + GitHub + Desktop Standalone)

---

## 1. 📋 Ficha Técnica y Especificaciones Generales

* **Nombre Oficial del Software**: `.colorío POP Mockup Studio`
* **Directorio Raíz del Proyecto**: `/Users/gustavoandueza/.gemini/antigravity/scratch/pop-mockup-studio`
* **Acceso Directo en Finder**: `~/Projects/pop-mockup-studio` (Enlace simbólico bidireccional)
* **Propósito**: Herramienta comercial y de diseño de alta precisión estilo *Figma Studio* para simular la aplicación de logotipos en artículos POP reales (abanicos circulares flexibles, bolsas ecológicas de tela quirúrgica con o sin fuelle, botellas deportivas, etc.), calcular precios por escala de volumen con desglose de IVA (16%) y comisiones, generar fichas técnicas de aprobación en PNG y tramitar pedidos a WhatsApp con enlaces rastreables.
* **Stack Tecnológico**:
  * **Frontend**: React 19, TypeScript 5.7, Tailwind CSS v4, Lucide Icons, Vite 6.
  * **Escritorio / Nativo**: Electron 45, Electron Builder 26 (Empaquetado ARM64 y x64).
  * **Nube & Serverless**: Vercel Edge Network, Vercel Serverless Functions (`api/store.ts`, `api/orders.ts`, `api/track.ts`).
  * **Base de Datos**: Neon Postgres Serverless con persistencia dual offline (`localStorage` v6).
  * **Exportación Gráfica**: HTML5 Canvas + SVG Rasterizer en alta resolución (2x DPI).

---

## 2. 🐙 Repositorio GitHub y CI/CD Automatizado

* **URL del Repositorio**: [https://github.com/burerex/pop-mockup-studio](https://github.com/burerex/pop-mockup-studio)
* **Rama Principal**: `main`
* **Estado de Sincronización**: Conectado y sincronizado (`origin main`).
* **Flujo CI/CD (`.github/workflows/build-releases.yml`)**:
  * **Job `build-macos`**: Corre en `macos-latest` para generar el instalador `.dmg` y el paquete `.zip` para Mac.
  * **Job `build-windows`**: Corre en `windows-latest` para compilar el ejecutable instalador NSIS y la versión portable `.exe` de Windows sin sobrecargar la máquina local.
  * **Job `release`**: Al crear etiquetas de versión (`v1.0.0`), publica automáticamente los binarios en los Releases de GitHub.

---

## 3. ☁️ Despliegue en la Nube (Vercel Producción)

* **URL Principal (Landing Dinámica)**: [https://pop-mockup-studio.vercel.app](https://pop-mockup-studio.vercel.app)
* **Acceso Directo al Catálogo POP**: [https://pop-mockup-studio.vercel.app/catalogo](https://pop-mockup-studio.vercel.app/catalogo)
* **Simulador Interactivo de Mockups**: [https://pop-mockup-studio.vercel.app/?view=studio](https://pop-mockup-studio.vercel.app/?view=studio)
* **Panel de Superadministrador**: [https://pop-mockup-studio.vercel.app/?admin=1](https://pop-mockup-studio.vercel.app/?admin=1)
  * *Correo de acceso*: `peoplecreativaca@gmail.com`
  * *Clave inicial*: `1234` (editable desde la pestaña Configuración)
* **Vercel Scope**: `burerexs-projects / pop-mockup-studio`

---

## 4. 🔌 Estrategia Cero Servidores Zombies y Auditoría de Puertos

### Auditoría de Puertos Locales
* **Herramienta de verificación**: `lsof -i -P -n | grep LISTEN`
* **Consumo de Memoria RAM**: **0 MB**.
* **Cero Procesos en Segundo Plano**: No hay servidores de desarrollo (`vite` o `node`) corriendo en segundo plano ni ocupando puertos como `5173` o `3000`.

### Modos de Ejecución Autónomos
1. **App de Escritorio Mac**: Carga los archivos minificados directamente desde el disco mediante `file://` en Electron con sandbox aislado.
2. **Navegador Web Offline**: `versiones/4-version-web-local-simple/abrir-en-navegador.html` carga el bundle directamente en el navegador sin intermediarios.
3. **Producción Web**: Aloja los archivos estáticos en los servidores perimetrales (Edge CDN) de Vercel con tiempos de respuesta inferiores a 40 ms.

---

## 5. 🗂️ Matriz de las 5 Versiones del Proyecto

```text
pop-mockup-studio/versiones/
├── 1-version-mac/               # 🍏 App nativa macOS (.app, .dmg, Iniciar-App-Mac.command)
├── 2-version-pc-windows/        # 🪟 Enlace e instrucciones a ejecutables .exe para PC Windows
├── 3-version-web-produccion/    # 🌐 Despliegue en la nube en Vercel + QR para móviles
├── 4-version-web-local-simple/  # 💻 Lanzador web offline 1-clic sin servidor en segundo plano
└── 5-version-principal-repo/   # 📦 Repositorio maestro, arquitectura y dependencias
```

### Guía de Operación por Sistema Operativo

#### 🍏 En macOS (Apple Silicon M1/M2/M3/M4 e Intel)
1. Navega en Finder a `~/Projects/pop-mockup-studio/versiones/1-version-mac/`.
2. Para ejecutarla de inmediato: Haz doble clic sobre **`Colorio POP Studio.app`** o ejecuta **`Iniciar-App-Mac.command`**.
3. Para instalarla: Abre **`Colorio-POP-Studio-1.0.0.dmg`** y arrastra el ícono a tu carpeta *Aplicaciones*.
4. **Permiso de Gatekeeper (si aplica)**:
   * Si macOS muestra la advertencia de seguridad de desarrollador no identificado:
     * Opción A: Clic derecho sobre la aplicación -> **Abrir** -> Confirmar **Abrir**.
     * Opción B: Ejecutar en terminal: `xattr -cr "/Applications/Colorio POP Studio.app"`.

#### 🪟 En Windows PC
1. Descarga el ejecutable desde [Releases en GitHub](https://github.com/burerex/pop-mockup-studio/releases).
2. Opciones disponibles:
   * **`Colorio POP Studio Setup 1.0.0.exe`**: Instalador clásico con accesos directos en el menú Inicio.
   * **`Colorio POP Studio 1.0.0 Portable.exe`**: Versión autónoma para ejecutar sin instalación previa ni permisos administrativos.

#### 📱 En Smartphones (iOS / Android)
1. Entra a [https://pop-mockup-studio.vercel.app](https://pop-mockup-studio.vercel.app).
2. El diseño cuenta con soporte táctil completo: scroll vertical suave con 1 solo dedo, zoom y manipulación de arte interactiva.
3. Se puede instalar como PWA mediante el menú del navegador (*Añadir a pantalla de inicio*).

---

## 6. 🛠️ Manual de Administración: Productos, Precios y Catálogo

El panel Superadministrador permite gestionar el inventario comercial sin tocar código.

### A. Cómo Agregar un Nuevo Producto
1. Inicia sesión en el panel con `peoplecreativaca@gmail.com` / `1234`.
2. Pestaña **Productos** -> Botón **`+ Nuevo Producto`**.
3. Configuración obligatoria:
   * **Nombre**: Nombre comercial claro (ej. *Abanico Circular Flexible*).
   * **SKU**: Código único de referencia (ej. *POP-FLEX-25*).
   * **Forma Base / Plantilla (`shape`)**:
     * `circular-flex`: Para abanicos plegables redondos con aro de memoria y funda.
     * `tote-bag`: Para bolsas ecológicas planas o con fuelle.
     * `cylinder-bottle`: Para coolers y botellas cilíndricas.
   * **Dimensiones y Capacidad**: Medidas físicas del artículo (ej. *Ø 25 cm abierto*, *520 ml*).
   * **Foto Vitrina (`realImageUrl`)**: Imagen real de producto terminado para el catálogo.
   * **Foto Mockup Limpia (`cleanMockupUrl`)**: Imagen base sin marca ni logotipo para montar el arte personalizado del cliente.
   * **Colores y Stock**:
     * Código hexadecimal (HEX) del color de tela/cuerpo.
     * Nombre descriptivo (ej. *Azul Rey*, *Verde Neón*).
     * Stock en almacén (unidades).
     * Estado: Disponible / Agotado.
   * **Escalas de Precios por Volumen**:
     * Mínimo de unidades (ej. 50, 100, 250, 500, 1000).
     * Precio unitario en USD para ese tramo.
     * Etiqueta promocional opcional (ej. *-15% Promo*).
   * **Variantes Secundarias (Medidas o Opciones)**:
     * Para productos con variantes (ej. Bolsa 17×20 cm vs 30×40 cm, con fuelle vs plana).
     * Nombre, sobrecosto unitario y stock independiente.
4. Presiona **Guardar Producto**. Los cambios se reflejarán instantáneamente en la tienda.

### B. Control de Productos Agotados
* En la pestaña **Ajustes**:
  * **Ocultar Agotados (Activo)**: Ningún color o producto con stock 0 se muestra al cliente.
  * **Mostrar con Badge Agotado (Inactivo)**: Muestra todas las opciones en la tienda, pero aquellas sin inventario aparecen deshabilitadas con el distintivo **`Agotado`**.

### C. Copias de Seguridad (Backup & Restore)
* **Exportar Catálogo**: Botón *Exportar JSON* para descargar una copia completa (`catalogo-colorio.json`) de todos los productos, precios y configuraciones.
* **Importar Catálogo**: Permite restaurar el catálogo completo en cualquier equipo o tras un reinicio de base de datos.

---

## 7. 💰 Motor Financiero y Fórmulas de Cotización

El sistema realiza el cálculo matemático de cotización en tiempo real respetando la siguiente estructura:

$$\text{Precio Base} = \text{Tarifa por Escala de Cantidad}(Q)$$

$$\text{Subtotal Ítem} = Q \times \left( \text{Precio Base} + \text{Sobrecosto Medida Secundaria} + \text{Sobrecosto Funda con Logo} + \text{Sobrecosto Tintas Extra} \right)$$

$$\text{Subtotal Carrito} = \sum \text{Subtotal Ítem}_i$$

$$\text{Base Imponible} = \max(0, \text{Subtotal Carrito} - \text{Descuento Cupón}) + \text{Costo Envío}$$

$$\text{IVA (16\%)} = \text{Base Imponible} \times 0.16 \quad \text{(Configurable)}$$

$$\text{Procesamiento (1\%)} = \text{Base Imponible} \times 0.01 \quad \text{(Opcional)}$$

$$\text{Total USD} = \text{Base Imponible} + \text{IVA} + \text{Procesamiento}$$

$$\text{Total VES} = \text{Total USD} \times \text{Tasa BCV}$$

### Comisiones Integradas
* **Comisión de Ventas del Sistema**: 1% sobre el monto neto facturado.
* **Comisión de Vendedor**: Porcentaje asignado al asesor comercial vinculado al pedido (ej. 3% al 8%).
* **Comisión de Referidos**: Porcentaje o bono asignado al código promocional del embajador (ej. 2% al 5%).

---

## 8. 🎨 Sistema de Diseño Visual (Figma Creative Studio 2026)

El frontend sigue los estándares de diseño de producto digital de vanguardia:

* **Logomarca Oficial**: `.colorío` con tilde magenta (`#F72585`) centrada exactamente en coordenadas `x: 122.5` sobre el trazo vertical de la letra `ı`.
* **Paleta Cromática de Marca**:
  * 🟣 **Violeta Colorío (Brand Master)**: `#4C1EDB`
  * 🟢 **Lima Neón (High Energy CTA)**: `#C0EE00`
  * 🌸 **Magenta Eléctrico (Badges y Tilde)**: `#F72585`
  * ⚫ **Negro Profundo (Fondos & Tipografía)**: `#0D0E12`
  * ⚪ **Gris Nube (Lienzo & Superficies)**: `#F6F7F9`
* **Estilo de Componentes**:
  * Esquinas redondeadas amplias (`rounded-2xl`, `rounded-3xl`).
  * Sombras multicapa suaves con tono azul marino profundo (`rgba(15, 23, 42, 0.16)`).
  * Encabezados y modales translúcidos con desenfoque de fondo (`backdrop-blur-md`).
  * Sin gráficos genéricos de prueba: fotografías reales de material POP de alta gama.

---

## 9. 🔄 Procedimientos de Actualización y Mantenimiento

### Para subir cambios a Producción (Vercel):
```bash
cd ~/Projects/pop-mockup-studio
npm run build
npx vercel --prod --yes
```

### Para subir cambios a GitHub:
```bash
cd ~/Projects/pop-mockup-studio
git add .
git commit -m "feat: actualización de catálogo y mejoras de interfaz"
git push origin main
```

### Para regenerar la aplicación nativa de Mac:
```bash
cd ~/Projects/pop-mockup-studio
npm run app:build:mac
```

---

## 10. 🕒 Cronología de Hitos del Proyecto

| Hito | Fecha | Logros Principales |
| :--- | :--- | :--- |
| **M1** | 17/11/2026 | Extracción y vectorización de productos desde el PDF oficial de Diciembre (abanicos, bolsas, botellas). |
| **M2** | 18/11/2026 | Simulador interactivo SVG/Canvas con rotación 360°, selector de tintas, zoom y colores de tela al tono. |
| **M3** | 18/11/2026 | Cotizador dinámico por volumen, cálculo de IVA (16%), envíos nacionales/locales y comisiones. |
| **M4** | 18/11/2026 | Panel de Superadministrador con CRUD de productos, liquidación de vendedores y generación de links rastreables. |
| **M5** | 18/11/2026 | Landing page dinámica con abanico interactivo de fondo que responde al mouse y selector de marcas. |
| **M6** | 18/11/2026 | Carrito multiproducto con soporte para múltiples logos, switch de agotados y cantidades flexibles. |
| **M7** | 18/11/2026 | Despliegue en la nube en Vercel Edge con base de datos Serverless Neon. |
| **M8** | 25/11/2026 | Calibración óptica de la logomarca `.colorío` con tilde sobre la letra `ı`. |
| **M9** | 26/11/2026 | Estandarización de 5 versiones (Prompt Maestro): cierre de servidores huérfanos (0 MB RAM), empaquetado nativo macOS Electron (`.app`, `.dmg`), CI/CD GitHub Actions para Windows (`.exe`) y symlink unificado en `~/Projects/pop-mockup-studio`. |
| **M10** | 26/11/2026 | Creación del repositorio oficial en GitHub (`burerex/pop-mockup-studio`) y sincronización exitosa a rama `main`. |
| **M11** | 26/11/2026 | Creación de enlaces directos en el Escritorio (`~/Desktop/Colorio POP Studio`, `~/Desktop/ABRIR_COLORIO_WEBAPPS.command`), lanzador multi-navegador (Chrome, Safari, Brave, Firefox, Edge), accesos directos `.webloc` en `accesos-rapidos/` y portal visual interactivo `PORTAL_ACCESOS_COLORIO.html`. |
