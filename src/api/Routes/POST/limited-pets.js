const express = require('express');
const router = express.Router();
const { middleWare } = require('../../Middleware/middleWare');
const sql = require('../../../database/db');

const limiteds = [{ petId: 30, limit: 5 }];
const payloads = ['PURCHASE_LIMITED', 'READ_LIMITED'];

router.post('/limited-pets', middleWare, async (req, res) => {
    const { robloxId, petId, payload } = req.body;
    if (!robloxId && !petId && !payload) {
        return res.json({
            success: false,
            error: 'Missing robloxId or petId or payload',
        });
    }

    if (!payloads.includes(payload)) {
        return res.json({
            success: false,
            error: 'Invalid payload.',
        });
    }

    if (payload === 'PURCHASE_LIMITED') {
        const limitObj = limiteds.find((item) => item.petId === petId);
        if (!limitObj) {
            return res.json({
                success: false,
                error: 'Invalid pet ID.',
            });
        }

        const { limit } = limitObj;
        try {
            const { rows } = await sql.query(`SELECT * FROM limited_pets WHERE petId = $1`, [petId]);
            const serial = rows.length + 1;
            if (serial > limit) {
                return res.json({
                    success: false,
                    error: 'Limit reached.',
                });
            }

            await sql.query(`INSERT INTO limited_pets (robloxId, petId) VALUES ($1, $2)`, [robloxId, petId]);
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
    } else if (payload === 'READ_LIMITED') {
        try {
            const { rows } = await sql.query(`SELECT id, robloxId, petId FROM limited_pets WHERE petId = $1`, [petId]);
            if (!rows) {
                return res.json({
                    success: false,
                    error: 'No rows returned.',
                });
            }

            const max_limit = limiteds.find((x) => x.petId == petId);
            if (!max_limit) {
                return res.json({
                    success: false,
                    error: 'petId not found.',
                });
            }

            let count = 0;
            for (const x in rows) {
                count += 1;
            }

            return res.json({
                success: true,
                data: rows,
                limit: max_limit.limit,
                remaining: max_limit.limit - count,
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
