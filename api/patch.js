// api/patch.js
import { createClient } from "@libsql/client";

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// Main API handler
export default async function handler(req, res) {
  try {

    // Handle PATCH — update checked status
    if (req.method === 'PATCH') {
      const { id, checked } = req.body || {};

      if (!id || typeof checked !== 'boolean') {
        res.status(400).json({ error: 'Invalid PATCH data' });
        return;
      }

      await turso.execute({
        sql: `UPDATE groceries SET checked = ? WHERE id = ?`,
        args: [checked ? 1 : 0, id],
      });

      res.status(200).json({ ok: true });
      return;
    }

    // If any other HTTP method → not allowed
    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('DB error:', err);
    res.status(500).json({ error: 'Server error' });
  }
}