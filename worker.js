export default {
  async fetch(request, env) {
    const cors = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };
    if (request.method === 'OPTIONS') return new Response(null, { headers: cors });

    const url = new URL(request.url);
    if (url.pathname !== '/api/scores') {
      return new Response('Not found', { status: 404, headers: cors });
    }

    const KV = env.TELL_THE_TIME_SCORES;

    if (request.method === 'GET') {
      const data = await KV.get('scores', 'json') || [];
      return new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json', ...cors } });
    }

    if (request.method === 'POST') {
      const { name, score } = await request.json();
      if (!name || typeof score !== 'number') {
        return new Response(JSON.stringify({ error: 'Invalid' }), { status: 400, headers: { 'Content-Type': 'application/json', ...cors } });
      }
      let scores = await KV.get('scores', 'json') || [];
      scores.push({ name, score, date: new Date().toISOString() });
      scores.sort((a, b) => b.score - a.score);
      scores = scores.slice(0, 30);
      await KV.put('scores', JSON.stringify(scores));
      return new Response(JSON.stringify(scores), { headers: { 'Content-Type': 'application/json', ...cors } });
    }

    return new Response('Method not allowed', { status: 405, headers: cors });
  }
};
