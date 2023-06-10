const express = require('express');
const router = express.Router();
const { middleWare } = require('../../Middleware/middleWare');
const sql = require('../../../database/db');

const limits = [
    { petId: 308, limit: 300 },
    { petId: 309, limit: 150 },
    { petId: 310, limit: 50 },
    { petId: 363, limit: 500 },
    { petId: 355, limit: 200 },
    { petId: 353, limit: 50 },
    { petId: 386, limit: 500 },
    { petId: 387, limit: 250 },
    { petId: 388, limit: 50 },
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

            let array = [];
            for (const limit of limits) {
                const { petId, limit: maxLimit } = limit;
                const totalSerials = parseInt(rows.find((row) => row.pet_id == petId)?.totalserials || 0, 10);

                array.push({
                    petId,
                    totalSerials,
                    maxLimit,
                });
            }

            return res.json({
                success: true,
                data: array,
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
