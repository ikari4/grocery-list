// api/grocery.js
import { createClient } from "@libsql/client";

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// Simple validation helper
const isValidString = (s) => typeof s === 'string' && s.trim().length > 0;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Only POST allowed' });
    return;
  }

  const { itemName, category } = req.body || {};

  if (!isValidString(itemName) || !isValidString(category)) {
    res.status(400).json({ error: 'Invalid input' });
    return;
  }

  try {
    // Parameterized query to prevent injection
    await turso.execute({
      sql: `INSERT INTO groceries (item_name, category) VALUES (?, ?)`,
      args: [itemName.trim(), category.trim()],
    });

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('DB error', err);
    res.status(500).json({ error: 'Server error' });
  }
}