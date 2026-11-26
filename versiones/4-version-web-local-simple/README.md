# 💻 Versión 4: Web Local Simple (Offline con 1 Clic)

Esta versión te permite abrir la aplicación en tu navegador favorito (**Safari**, **Chrome**, **Brave** o **Edge**) directamente desde los archivos locales **sin necesidad de levantar ningún servidor de desarrollo Vite o Node.js**.

---

## 🚀 Cómo Usarla

1. **Doble Clic Directo**:
   - En Finder, haz doble clic sobre el archivo **`abrir-en-navegador.html`** (o en **`abrir-en-navegador.command`**).
2. **Cero Consumo de RAM**:
   - Tu memoria queda 100% libre ya que ningún proceso queda escuchando en los puertos `5173`, `3000` ni en segundo plano.
3. **Persistencia Local**:
   - Todos los cambios de cotización, logos cargados y pedidos se almacenan localmente en tu navegador vía `localStorage` y en la nube Neon si hay conexión a internet.

---

## 🛠️ Cómo Actualizar el Bundle Local

Si modificas el código de la aplicación y deseas refrescar esta versión:
```bash
cd ~/Projects/pop-mockup-studio
npm run build
```
Esto regenerará los archivos minificados en la carpeta `dist/` al instante.
