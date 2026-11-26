# 🗂️ Directorio Maestro de 5 Versiones: .colorío POP Mockup Studio

Este directorio unifica los 5 formatos de distribución del proyecto según el estándar del **Prompt Maestro Universal**:

| Carpeta | Versión | Tipo de Acceso | Servidor Local |
| :--- | :--- | :--- | :--- |
| **`1-version-mac/`** | App Nativa para macOS | `.app` / `.dmg` instalable con aceleración GPU | ❌ Ninguno (0 MB RAM) |
| **`2-version-pc-windows/`** | Ejecutable para Windows PC | `.exe` compilado vía GitHub Actions | ❌ Ninguno (0 MB RAM) |
| **`3-version-web-produccion/`** | Web App Cloud en Vercel | [pop-mockup-studio.vercel.app](https://pop-mockup-studio.vercel.app) + QR Móvil | ❌ Ninguno (Cloud Edge) |
| **`4-version-web-local-simple/`** | Web Local Offline 1-Clic | `abrir-en-navegador.html` para Safari/Chrome | ❌ Ninguno (0 MB RAM) |
| **`5-version-principal-repo/`** | Código Fuente Maestro & GitHub | Repositorio Git completo y CI/CD | Solo si se desarrolla (`npm run dev`) |

---

### 💡 Ventajas Clave
1. **Cero Consumo de Memoria**: No necesitas mantener terminales con `npm run dev` abiertas consumiendo procesador y batería.
2. **Multiplataforma**: Tu equipo de ventas o diseño puede usar la app en Mac, en Windows, en tablets o en teléfonos celulares indistintamente.
3. **Disponibilidad 24/7**: La versión web en Vercel está activa y conectada a la base de datos para almacenar pedidos y cotizaciones.
