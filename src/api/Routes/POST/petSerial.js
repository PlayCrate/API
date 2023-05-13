const express = require('express');
const router = express.Router();
const { middleWare } = require('../../Middleware/middleWare');
const sql = require('../../../database/db');

const limits = [
    { petId: 1, limit: 200 },
    { petId: 2, limit: 100 },
    { petId: 4, limit: 50 },
];

router.post('/pets-serial', middleWare, async (req, res) => {
    const { petId, payload } = req.body;

    if (!payload) {
        return res.json({
            error: 'Missing petId or payload',
        });
    }

    if (payload === 'SEND') {
        const limitObj = limits.find((item) => item.petId === petId);
        if (!limitObj) {
            return res.json({
                success: false,
                error: 'Invalid pet ID.',
            });
        }

        const { limit } = limitObj;
        try {
            const { rows } = await sql.query(`SELECT * FROM pets_serial WHERE pet_id = $1`, [petId]);
            const serial = rows.length + 1;

            if (serial > limit) {
                return res.json({
                    success: false,
                    error: 'Limit reached.',
                });
            }

            await sql.query(`INSERT INTO pets_serial (pet_id, serial) VALUES ($1, $2)`, [petId, serial]);
            return res.json({
                success: true,
                serial,
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                error: 'Internal server error.',
            });
        }
    } else if (payload === 'READ') {
        try {
            const { rows } = await sql.query(
                `SELECT pet_id, COUNT(*) AS totalSerials FROM pets_serial GROUP BY pet_id`
            );
            const data = rows
                .map((row) => ({
                    petId: parseInt(row.pet_id, 10),
                    totalSerials: row.totalserials !== null ? parseInt(row.totalserials, 10) : 0,
                }))
                .filter((item) => limits.some((limit) => limit.petId === item.petId))
                .map((item) => ({
                    ...item,
                    maxLimit: limits.find((limit) => limit.petId === item.petId)?.limit || 0,
                }));

            return res.json({
                success: true,
                data,
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                success: false,
                error: 'Internal server error.',
            });
        }
    }
});

module.exports = router;
