const express = require('express');
const router = express.Router();
const { middleWare } = require('../../Middleware/middleWare');
const sql = require('../../../database/db');

router.post('/pets-serial', middleWare, async (req, res) => {
    const { petId } = req.body;

    // Insert new pet record
    await sql.query(
        `
        INSERT INTO pets_serial (pet_id, serial)
        VALUES ($1::varchar, (SELECT COALESCE(MAX(serial), 0) + 1 FROM pets_serial WHERE pet_id = $1::varchar))
        `,
        [petId]
    );

    // Get serial for pet ID
    const result = await sql.query(
        `
        SELECT serial
        FROM pets_serial
        WHERE pet_id = $1
        ORDER BY id DESC
        LIMIT 1
    `,
        [petId]
    );
    const petSerial = result.rows[0].serial;

    return res.json({ petSerial, petId });
});

module.exports = router;
