# 📦 Versión 5: Código Fuente Maestro y Repositorio GitHub

Esta versión corresponde al código fuente maestro completo del proyecto `.colorío POP Mockup Studio`, estructurado para desarrollo ágil, pruebas, compilación continua y sincronización con GitHub y Vercel.

---

## 🗂️ Estructura del Proyecto

```text
pop-mockup-studio/
├── .github/
│   └── workflows/
│       └── build-releases.yml        # CI/CD: Compilación en la nube de Mac (.dmg) y Windows (.exe)
├── api/
│   ├── orders.ts                     # API Serverless Vercel: Sincronización de pedidos en Neon DB
│   └── store.ts                      # API Serverless Vercel: Sincronización de catálogo, cupones y ajustes
├── dist/                             # Bundle web de producción minificado (base relativa ./)
├── electron/
│   ├── main.cjs                      # Proceso principal Electron con aceleración GPU por hardware
│   └── preload.cjs                   # Puente seguro de contexto para Electron
├── public/                           # Recursos estáticos públicos, fotos reales y mockups limpios
├── release/                          # Paquetes compilados (.app, .dmg, .zip para macOS y Windows)
├── src/
│   ├── components/
│   │   ├── AdminDashboardModal.tsx   # Panel Superadmin (CRUD productos, cupones, vendedores, comisiones)
│   │   ├── CartDrawer.tsx            # Carrito multiproducto, cupones, cálculo de IVA y checkout WhatsApp
│   │   ├── ColorioLanding.tsx        # Landing page dinámica con backdrop animado y catálogo interactivo
│   │   ├── ColorioLogo.tsx           # Logomarca vectorial oficial .colorío con tilde sobre la 'i'
│   │   ├── LeftCatalogPanel.tsx      # Selector de catálogo lateral con soporte para agotados
│   │   ├── MockupCanvas.tsx          # Escenario de simulación vectorial (abanicos, bolsas, botellas)
│   │   ├── RightInspectorPanel.tsx   # Asistente de personalización paso a paso (color, técnica, logo, precio)
│   │   └── ShareModal.tsx            # Modal de enlaces rastreables y exportación de fichas PNG
│   ├── data/
│   │   ├── products.ts               # Catálogo base inicial con fotos reales extraídas del PDF
│   │   └── storeDefaults.ts          # Datos por defecto de la tienda y claves de persistencia
│   ├── utils/
│   │   ├── cloudSync.ts              # Sincronización en la nube con Neon Postgres / Vercel Storage
│   │   ├── exportApprovalCard.ts     # Generador de ficha técnica de aprobación en alta resolución PNG
│   │   └── linkTracker.ts            # Generador y rastreador de enlaces compartidos
│   ├── App.tsx                       # Componente raíz integrador y manejador de vistas
│   └── main.tsx                      # Punto de entrada de React 19
├── versiones/                        # Estructura de 5 versiones estandarizadas del proyecto
├── BITACORA.md                       # Historial técnico, puertos y registro de decisiones
├── package.json                      # Scripts, dependencias y configuración de Electron Builder
├── tsconfig.json                     # Configuración de TypeScript
├── vercel.json                       # Configuración de despliegue y rewrites en Vercel
└── vite.config.ts                    # Configuración de empaquetado Vite con base relativa
```

---

## 🛠️ Comandos Principales para Desarrolladores

* **Instalar dependencias**:
  ```bash
  npm install
  ```
* **Compilar para producción (Web/Vercel)**:
  ```bash
  npm run build
  ```
* **Probar en modo escritorio Electron**:
  ```bash
  npm run app:start
  ```
* **Compilar App nativa para macOS**:
  ```bash
  npm run app:build:mac
  ```
* **Compilar Ejecutable para Windows**:
  ```bash
  npm run app:build:win
  ```
* **Desplegar a producción en Vercel**:
  ```bash
  npx vercel --prod --yes
  ```

---

## 🐙 Repositorio GitHub

* **URL del repositorio**: [https://github.com/burerex/pop-mockup-studio](https://github.com/burerex/pop-mockup-studio)
* **Rama principal**: `main`
