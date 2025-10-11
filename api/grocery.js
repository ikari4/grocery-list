// api/grocery.js
import { createClient } from "@libsql/client";

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// Simple validation helper
const isValidString = (s) => typeof s === 'string' && s.trim().length > 0;

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { itemName, category } = req.body || {};

    if (!isValidString(itemName) || !isValidString(category)) {
      res.status(400).json({ error: 'Invalid input' });
      return;
    }

    try {
      await turso.execute({
        sql: `INSERT INTO groceries (item_name, category) VALUES (?, ?)`,
        args: [itemName.trim(), category.trim()],
      });

      res.status(200).json({ ok: true });
    } catch (err) {
      console.error('DB error', err);
      res.status(500).json({ error: 'Server error' });
    }

  } else if (req.method === 'GET') {
    // Handle fetching all grocery items
    try {
      const result = await turso.execute(`SELECT item_name FROM groceries ORDER BY item_name`);
      res.status(200).json({ items: result.rows });
    } catch (err) {
      console.error('DB fetch error', err);
      res.status(500).json({ error: 'Server error' });
    }

  } else {
    res.status(405).json({ error: 'Only GET and POST allowed' });
  }
}