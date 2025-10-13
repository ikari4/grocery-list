// api/grocery.js
import { createClient } from "@libsql/client";

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// Helper to validate strings
const isValidString = (s) => typeof s === 'string' && s.trim().length > 0;

// Main API handler
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

    // Handle GET — fetch items based on store + filter
    if (req.method === 'GET') {
      const { store, filter } = req.query || {};

      if (!isValidString(store)) {
        res.status(400).json({ error: 'Missing store parameter' });
        return;
      }

      let sql = `SELECT id, item_name, category, checked, store FROM groceries WHERE store = ?`;
      const args = [store];

      if (filter === 'allChecked') {
        sql += ` AND checked = 1`;
      } else if (filter === 'Produce') {
        sql += ` AND category = 'Produce'`;
      } else if (filter === 'Dairy') {
        sql += ` AND category = 'Dairy'`;
      } else if (filter === 'Meat') {
        sql += ` AND category = 'Meat'`;
      } else if (filter === 'Frozen') {
        sql += ` AND category = 'Frozen'`;
      } else if (filter === 'Grocery') {
        sql += ` AND category = 'Grocery'`;
      } else if (filter === 'Bakery') {
        sql += ` AND category = 'Bakery'`;
      } else if (filter === 'Household') {
        sql += ` AND category = 'Household'`;
      } else if (filter === 'Alcohol') {
        sql += ` AND category = 'Alcohol'`;
      } // 'allItems' → no extra filter

      sql += ` ORDER BY category, item_name`;

      const result = await turso.execute({ sql, args });
      res.status(200).json({ items: result.rows });
      return;
    }

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

