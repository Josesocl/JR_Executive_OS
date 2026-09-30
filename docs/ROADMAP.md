# JR Executive OS — Hoja de ruta

> Fuente de verdad única del plan. Si otro documento la contradice, manda este.
> Decidido el 2026-09-30.

## Decisión

Un solo producto, **JR Executive OS**, sobre **Next.js** (`ikigai-planner/`).
La app GTD en React/Vite (raíz del repo) se porta como secciones de esa app y
luego se retira.

- **La app** es el lugar único donde vive todo: inbox, acciones, proyectos,
  hábitos, metas, Ikigai y planificador diario/semanal/mensual.
- **Las rutinas de Claude (Cowork)** recolectan y generan: Daily Timebox,
  Radar de Seguimiento y la futura Captura GTD. Escriben en la app en vez de
  producir archivos sueltos.

## Estado actual (2026-09-30)

| | GTD (Vite, raíz) | ikigai-planner (Next.js) |
|---|---|---|
| URL | gtd-executive-os.vercel.app | proyecto Vercel `ikigai-planner` |
| Datos reales | inbox 7, acciones 5, proyectos 8, hábitos 4 | daily_plans 7; metas, Ikigai y perfiles vacíos |
| IA | Agentes (Claude) + sugerencias de inbox (TypeSafe) | — |
| Calendario | — | Código Google Calendar listo, nunca conectado |

Lo que se usa a diario hoy: los `Timebox_YYYY-MM-DD.html` que genera la rutina
Daily Timebox en OneDrive (`PRODUCTIVIDAD PERSONAL/PLANNER CALENDAR`).

Base de datos compartida: Supabase `IBS Executive OS` (`peubserssoxpeemkxtjm`).

## Fases

### Fase 0 — Orden y seguridad
- [x] Cada proyecto Vercel despliega solo si cambia su carpeta (`ignoreCommand`).
- [x] Esta hoja de ruta como documento único.
- [x] Eliminar el proyecto Vercel `jr-executive-os` (duplicado, sin variables).
- [x] Credencial OAuth de Google fuera de OneDrive, en gestor de contraseñas.
- [x] Limpieza OneDrive: 37 archivos de 0 KB en `PLANNER CALENDAR`
      (originales en `PROGRAMA IKIGAI JRJ`) y `gtd-executive-os.tar.gz`
      (= commit `de86eb3` en git).

### Fase 1 — Modelo de datos unificado (2026-10-01)
- [x] Seguridad: quitada `allow_authenticated_all` de las 4 tablas GTD
      (dejaba a cualquier cuenta con sesión leer/modificar datos ajenos).
- [x] Respaldo: esquema `backup_20261001` en Supabase + JSON en OneDrive
      (`PRODUCTIVIDAD PERSONAL/_RESPALDOS_DB/2026-10-01_antes_fase1.json`).
- [x] `actions` es la tabla única de tareas: `project_id`, `plan_id`,
      `weekly_goal_id`, `position`, `completed_at`. 4 de 5 acciones enlazadas
      a su proyecto; "Actualizar Documento Fundacional v4" (texto "Marca JR")
      queda sin enlazar — decidir a mano.
- [x] `projects`: enlace opcional a `life_goals` / `quarterly_goals`; estados
      válidos `active | someday | waiting | done | archived`.
- [x] `inbox`: `source`, `external_ref`, `url` + índice único anti-duplicados.
- [x] Hábitos: los 4 del GTD migrados a `planner_habits` sin rachas;
      frecuencia `monthly` agregada.
- [x] Funciones de IA exigen perfil aprobado (`is_beta_approved`).
- [x] Historial completo de migraciones en `supabase/migrations/`.
- Pendiente para Fase 2 (al cambiar el código): eliminar `actions.project`
  (texto), `tasks` y `habits`; agregar `monthly` al tipo TS de hábitos.
- Pendiente (manual, panel Supabase): activar "Leaked password protection".

### Fase 2 — GTD dentro de Next.js
- Portar inbox, acciones, proyectos, revisión semanal, agentes y sugerencias
  TypeSafe (`api/agent.js`, `api/suggest.js`, auth por sesión Supabase).
- Retirar la app Vite con redirección a la nueva URL.

### Fase 3 — Reemplazar el Timebox HTML
- Conectar Google Calendar (jrjottar@gmail.com) y Outlook M365
  (jrjottar@ibsolucion.com).
- La rutina Daily Timebox escribe el plan del día en la app.
- Importar los HTML existentes como histórico.

### Fase 4 — Captura automática
- Rutina "Captura GTD": Outlook, Gmail y carpeta GTD de Apple Notes →
  filtro TypeSafe → inbox de la app (sin duplicados, con link al original).
- Radar de Seguimiento escribe en "En espera de".

### Después
Notion (si se retoma), piloto cerrado, empaquetado escritorio/móvil
(ver `ESTRATEGIA-MULTIPLATAFORMA.md` en OneDrive), Stripe.

## Documentos de referencia (OneDrive, `PRODUCTIVIDAD PERSONAL/`)

- `PLANNER CALENDAR/IKIGAI-PLANNER-SPEC.md` — spec técnico (schema, prompts).
- `PLANNER CALENDAR/ESTRATEGIA-MULTIPLATAFORMA.md` — distribución y seguridad.
- `PLANNER CALENDAR/PLAN-DE-ACCION.md` — histórico; reemplazado por este.
- `INSTRUCCIONES.md` y el README de la raíz — históricos (planifican Vite +
  Electron, descartado).
