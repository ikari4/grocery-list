import { createClient } from "@libsql/client";

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const isValidString = (s) => typeof s === "string" && s.trim().length > 0;

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { itemName, category, checked } = req.body || {};

    if (!isValidString(itemName) || !isValidString(category)) {
      res.status(400).json({ error: "Invalid input" });
      return;
    }

    try {
      await turso.execute({
        sql: `INSERT INTO groceries (item_name, category, checked) VALUES (?, ?, ?)`,
        args: [itemName.trim(), category.trim(), checked ? 1 : 0],
      });

      res.status(200).json({ ok: true });
    } catch (err) {
      console.error("DB insert error", err);
      res.status(500).json({ error: "Server error" });
    }

  } else if (req.method === "GET") {
    const filter = req.query.filter;
    let sql, args = [];

    if (filter === "allChecked") {
      sql = `SELECT id, item_name, category, checked 
             FROM groceries 
             WHERE checked = 1 
             ORDER BY item_name`;
    } else if (filter === "allItems" || !filter) {
      sql = `SELECT id, item_name, category, checked 
             FROM groceries 
             ORDER BY item_name`;
    } else {
      sql = `SELECT id, item_name, category, checked 
             FROM groceries 
             WHERE category = ? 
             ORDER BY item_name`;
      args = [filter];
    }

    try {
      const result = await turso.execute({ sql, args });
      res.status(200).json({ items: result.rows });
    } catch (err) {
      console.error("DB fetch error", err);
      res.status(500).json({ error: "Server error" });
    }

  } else if (req.method === "PATCH") {
    const { id, checked } = req.body || {};

    if (typeof id !== "number" || typeof checked !== "boolean") {
      res.status(400).json({ error: "Invalid input" });
      return;
    }

    try {
      await turso.execute({
        sql: `UPDATE groceries SET checked = ? WHERE id = ?`,
        args: [checked ? 1 : 0, id],
      });

      res.status(200).json({ ok: true });
    } catch (err) {
      console.error("DB update error", err);
      res.status(500).json({ error: "Server error" });
    }

  } else {
    res.status(405).json({ error: "Only GET, POST, and PATCH allowed" });
  }
}
