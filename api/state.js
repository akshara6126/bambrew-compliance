// /api/state — single shared RAG-status store for the whole Bambrew team.
// GET   → returns the current shared compliance state
// POST  → overwrites the shared state with the new payload
//
// State shape (matches the data structures in index.html):
//   {
//     statusMap:        { [compId]: 'not-started' | 'in-progress' | 'completed' },
//     userCompliances:  [ { id, dept, type, sNo, description, statutoryRef, ... } ]
//   }
//
// `compId` is `${dept}-${sNo}` — uniquely identifies each compliance row.
// Conflict policy: last write wins. Fine for a small team where two people
// rarely edit the exact same row at the exact same time.

import { kv } from '@vercel/kv';

const SHARED_KEY = 'bambrew-compliance-state';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const data = await kv.get(SHARED_KEY);
      return res.status(200).json(data || {
        statusMap: {},
        userCompliances: [],
        priorityMap: {},
        remarksMap: {},
        ownerOverrideMap: {},
        pocOverrideMap: {},
        dismissedAutoIds: [],
      });
    }

    if (req.method === 'POST') {
      const { state } = req.body || {};
      if (!state || typeof state !== 'object') {
        return res.status(400).json({ error: 'Missing state body' });
      }
      if (JSON.stringify(state).length > 200_000) {
        return res.status(413).json({ error: 'State payload too large' });
      }
      await kv.set(SHARED_KEY, state);
      return res.status(200).json({ ok: true });
    }

    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('compliance state api error', err);
    return res.status(500).json({ error: 'Internal error: ' + err.message });
  }
}
