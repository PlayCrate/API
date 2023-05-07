const express = require('express');
const router = express.Router();
const { middleWare } = require('../../Middleware/middleWare');
const sql = require('../../../database/db');

router.post('/pets-serial', middleWare, async (req, res) => {
    const { petId } = req.body;

    // Insert new pet record with new serial value
    const query = `
        INSERT INTO pets_serial (pet_id, serial)
        VALUES ($1::varchar, (
            SELECT COALESCE(MAX(serial), 0) + 1
            FROM pets_serial
            WHERE pet_id = $1::varchar
        ))
        ON CONFLICT (pet_id, serial) DO NOTHING
        RETURNING serial
    `;
    const result = await sql.query(query, [petId]);
    const petSerial = result.rows[0]?.serial;

    return res.json({ petSerial, petId });
});

module.exports = router;
