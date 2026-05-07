# GTD Executive OS™ — por JR Jottar

Sistema Operativo Ejecutivo de IA. Web app React lista para desplegar en Vercel.

---

## ⚡ Inicio rápido (5 minutos)

### Prerrequisitos
- Node.js 18+ → https://nodejs.org
- Git → https://git-scm.com
- Cuenta GitHub → https://github.com (gratis)
- Cuenta Vercel → https://vercel.com (gratis)

### 1. Instalar dependencias y correr local

```bash
# En la carpeta del proyecto:
npm install
npm run dev
# → Abre http://localhost:5173 automáticamente
```

### 2. Subir a GitHub

```bash
git init
git add .
git commit -m "GTD Executive OS v1.0"

# Crea un repo en github.com y luego:
git remote add origin https://github.com/TU_USUARIO/gtd-executive-os.git
git push -u origin main
```

### 3. Desplegar en Vercel (gratis, 2 minutos)

1. Ve a https://vercel.com → "Add New Project"
2. Conecta tu repo de GitHub
3. Vercel detecta Vite automáticamente
4. Click "Deploy" → listo en 60 segundos
5. Tu URL: `https://gtd-executive-os.vercel.app`

### 4. Dominio personalizado (opcional)

En Vercel → Settings → Domains → agrega `os.jrjottar.com`
Configura el DNS en tu proveedor → CNAME → cname.vercel-dns.com

---

## 🏗 Estructura del proyecto

```
src/
  components/
    Sidebar.jsx     ← Navegación lateral
    ui.jsx          ← Componentes compartidos (Badge, Card, etc.)
  pages/
    Dashboard.jsx   ← Vista principal con métricas
    Capture.jsx     ← Inbox + captura GTD
    Projects.jsx    ← Gestión de proyectos
    Actions.jsx     ← Próximas acciones
    Review.jsx      ← Revisión semanal
    Coaching.jsx    ← Coaching + hábitos + Ikigai
    Agents.jsx      ← Agentes IA
  store/
    useStore.js     ← Estado global (Zustand + localStorage)
  App.jsx           ← Layout principal
  main.jsx          ← Entry point
  index.css         ← Tailwind + estilos globales
```

---

## 🔌 Siguiente paso: Supabase (Fase 1, Paso 2)

Para persistir datos por usuario y agregar autenticación:

```bash
npm install @supabase/supabase-js
```

1. Crea cuenta en https://supabase.com
2. Nuevo proyecto → copia URL y anon key
3. Crea archivo `.env.local`:
   ```
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGci...
   ```
4. Reemplaza el store Zustand con Supabase queries

---

## 💳 Siguiente paso: Stripe (Fase 1, Paso 5)

```bash
npm install @stripe/stripe-js
```

Planes sugeridos:
- Professional: $97/mes
- Executive OS: $297/mes
- Corporate: $890/equipo/mes

---

## 🖥 Siguiente paso: App Desktop Electron (Fase 2)

```bash
npm install --save-dev electron electron-vite
```

Agrega script al package.json:
```json
"electron:dev": "electron-vite dev",
"electron:build": "electron-vite build && electron-builder"
```

---

## 📞 Soporte

JR Jottar — https://jrjottar.com
"Te acompaño al siguiente nivel. Un paso a la vez."
