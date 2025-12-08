// api/post.js
import { createClient } from "@libsql/client";

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// Helper to validate strings
const isValidString = (s) => typeof s === 'string' && s.trim().length > 0;

export default async function handler(req, res) {
  try {
  // Handle POST — add new grocery item
    if (req.method === 'POST') {
      const { itemName, category, store } = req.body || {};

      if (!isValidString(itemName) || !isValidString(category) || !isValidString(store)) {
        res.status(400).json({ error: 'Invalid input' });
        return;
      }

      await turso.execute({
        sql: `INSERT INTO groceries (item_name, category, store, checked)
              VALUES (?, ?, ?, 0)`,
        args: [itemName.trim(), category.trim(), store.trim()],
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