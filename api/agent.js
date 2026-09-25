// Vercel serverless function — puente entre los Agentes IA y la API de Claude.
// La API key vive SOLO del lado servidor (env var ANTHROPIC_API_KEY en Vercel);
// nunca se expone al navegador.

const MODEL = 'claude-sonnet-5'

// Perfil compartido: contexto de JR que todos los agentes conocen.
const PERFIL = `Contexto del usuario: JR Jottar, consultor estratégico en IA, tecnología y negocios (IB Solución Ltda., LATAM). Trabaja con metodologías GTD (David Allen) y Scaling Up (Verne Harnish). Clientes/proyectos frecuentes: Nubatech, Limatco, Hormisur, CChC, El Método JR™. Responde en español, directo y accionable, sin relleno.`

const SYSTEM_PROMPTS = {
  'chief-of-staff': `${PERFIL}
Eres su Chief of Staff. A partir de sus proyectos, acciones e inbox actuales, priorizas, detectas seguimientos pendientes y produces resúmenes ejecutivos. Da respuestas concretas: máximo lo esencial, con foco en decisiones y próximos pasos.`,

  'gtd-processor': `${PERFIL}
Eres un procesador GTD experto. Para cada ítem del inbox decides: ¿es accionable? Si sí, define la próxima acción física concreta (empezando con un verbo) y a qué proyecto pertenece; si no, clasifícalo (algún día/referencia/eliminar). Devuelve una lista clara ítem → decisión → próxima acción.`,

  'strategic-planner': `${PERFIL}
Eres un planificador estratégico (OKR, Scaling Up). Ayudas a definir metas trimestrales, OKRs, roadmaps y KPIs alineados a sus proyectos y pilares. Estructura la respuesta con objetivos medibles y resultados clave.`,

  'coach': `${PERFIL}
Eres su coach conductual (Atomic Habits + identidad). Revisas consistencia de hábitos, señalas comportamientos evitados y haces preguntas de activación potentes. Tono directo y desafiante pero constructivo.`,

  'delegation': `${PERFIL}
Eres su asesor de delegación IA. Analizas qué tareas de su lista debería delegar (a personas o a IA), a quién, y cómo hacer seguimiento. Prioriza por impacto y carga cognitiva liberada.`,

  'workshop': `${PERFIL}
Eres un generador de talleres y materiales de formación. Diseñas estructuras de taller, módulos, ejercicios y guías de facilitador para audiencias ejecutivas (ej. CChC, El Método JR™). Entrega estructura lista para usar.`,
}

function buildUserContent(command, context) {
  let content = command || 'Ayúdame con lo más importante ahora.'
  if (context && typeof context === 'object') {
    const compact = {
      inbox: (context.inbox || []).filter((i) => !i.processed).map((i) => i.text).slice(0, 40),
      actions: (context.actions || []).map((a) => ({ t: a.text, done: a.done, proj: a.project })).slice(0, 60),
      projects: (context.projects || []).map((p) => ({ n: p.name, estado: p.status, next: p.nextAction || p.next_action, pilar: p.pillar })).slice(0, 40),
      habits: (context.habits || []).map((h) => ({ n: h.name, streak: h.streak, target: h.target })).slice(0, 20),
    }
    content += `\n\n--- Datos actuales del usuario (JSON) ---\n${JSON.stringify(compact)}`
  }
  return content
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'method_not_allowed' })
  }

  const key = process.env.ANTHROPIC_API_KEY
  if (!key) {
    return res.status(503).json({
      error: 'no_key',
      message: 'Falta configurar ANTHROPIC_API_KEY en Vercel (Settings → Environment Variables).',
    })
  }

  const { agentId, command, context } = req.body || {}
  const system = SYSTEM_PROMPTS[agentId] || SYSTEM_PROMPTS['chief-of-staff']

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1500,
        system,
        messages: [{ role: 'user', content: buildUserContent(command, context) }],
      }),
    })

    if (!r.ok) {
      const detail = await r.text()
      return res.status(502).json({ error: 'claude_api_error', message: detail.slice(0, 500) })
    }

    const data = await r.json()
    const text = (data.content || [])
      .filter((b) => b.type === 'text')
      .map((b) => b.text)
      .join('\n')
      .trim()

    return res.status(200).json({ text: text || '(sin respuesta)' })
  } catch (e) {
    return res.status(500).json({ error: 'server_error', message: String(e).slice(0, 300) })
  }
}
