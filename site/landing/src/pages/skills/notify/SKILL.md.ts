import type { APIRoute } from 'astro'
import source from '../../../../../../skills/notify/SKILL.md?raw'
export const GET: APIRoute = () =>
  new Response(source, { headers: { 'Content-Type': 'text/markdown; charset=utf-8' } })
