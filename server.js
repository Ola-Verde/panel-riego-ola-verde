const express = require('express');
const { Pool } = require('pg');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/registros', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM registros_riego ORDER BY creado_en DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Error al consultar la base de datos' });
  }
});

app.post('/api/registros', async (req, res) => {
  const { lote, operador, arboles, litros, especie, aves, estado, pin } = req.body;

  // Clave de seguridad actualizada
  if (pin !== '7865') {
    return res.status(401).json({ error: 'Clave de seguridad incorrecta' });
  }

  try {
    const queryText = `
      INSERT INTO registros_riego (lote, operador, arboles, litros, especie, aves, estado)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;
    const values = [lote, operador, arboles, litros, especie, aves || 0, estado];
    const result = await pool.query(queryText, values);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al insertar en la base de datos' });
  }
});

app.listen(port, () => {
  console.log(`Servidor activo en el puerto ${port}`);
});
