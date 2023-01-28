const express = require('express');
const router = express.Router();
const { middleWare } = require('../middleWare');
const sql = require('../../database/db');

router.post('/new-code', middleWare, async (req, res) => {
    const { code, rewards, used_by } = req.body;
    if (!code || !rewards) return res.status(400).json({ success: false, error: 'Missing required fields.' });

    const checkIfCodeExists = await sql.query(`SELECT * FROM codes WHERE code = $1`, [code]);
    if (checkIfCodeExists.rows.length > 0)
        return res.status(400).json({ success: false, error: 'Code already exists.' });

    await sql.query(`INSERT INTO codes (code, rewards, used_by) VALUES ($1, $2, $3)`, [code, rewards, used_by]);
    return res.status(200).json({ success: true, message: 'Code created.' });
});

module.exports = router;
