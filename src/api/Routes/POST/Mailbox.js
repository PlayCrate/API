const express = require('express');
const router = express.Router();
const { middleWare } = require('../../Middleware/middleWare');
const sql = require('../../../database/db');

router.post('/mailbox', middleWare, async (req, res) => {
    let { robloxId } = req.body;
    const { type, payload, robloxName } = req.body;

    if (!robloxId || isNaN(robloxId)) {
        return res.json({
            success: false,
            error: 'Missing robloxId or malfored robloxId',
        });
    }

    if (type !== 'ADD' && type !== 'REMOVE' && type !== 'UPDATE' && type !== 'READ') {
        return res.json({
            success: false,
            error: `Unknown type: ${type}`,
        });
    }

    robloxId = String(robloxId);

    if (type === 'ADD') {
        if (!payload || !Array.isArray(payload) || payload.length === 0) {
            return res.json({
                success: false,
                error: 'Missing payload or malformed payload',
            });
        }

        if (!robloxName) {
            return res.json({
                success: false,
                error: 'Missing robloxName',
            });
        }

        const requiredProps = ['id', 'uid', 'lvl'];
        for (const pet of payload) {
            const missingProps = requiredProps.filter((prop) => !pet[prop]);

            if (missingProps.length > 0) {
                return res.json({
                    success: false,
                    error: `Missing properties: ${missingProps.join(', ')}`,
                });
            }

            if (isNaN(pet.id) || isNaN(pet.lvl)) {
                return res.json({
                    success: false,
                    error: 'Malformed pet Id or pet Level',
                });
            }

            pet.id = String(pet.id);
            pet.lvl = Number(pet.lvl);

            const { rows } = await sql.query(`SELECT * FROM mailbox WHERE robloxId = $1 AND petUID = $2`, [
                robloxId,
                pet.uid,
            ]);

            if (rows.length > 0) {
                return res.json({
                    success: false,
                    error: `Pet UID ${pet.uid} already exists`,
                });
            }

            await sql.query(
                `INSERT INTO mailbox (robloxName, robloxId, petId, petUID, petLevel) VALUES ($1, $2, $3, $4, $5)`,
                [robloxName, robloxId, pet.id, pet.uid, pet.lvl]
            );
        }

        return res.json({
            success: true,
            message: 'Successfully added pets to mailbox',
        });
    } else if (type === 'REMOVE') {
        if (!payload || !Array.isArray(payload) || payload.length === 0) {
            return res.json({
                success: false,
                error: 'Missing payload or malformed payload',
            });
        }

        let deleted = 0;
        for (const uniqueId of payload) {
            const del = await sql.query(`DELETE FROM mailbox WHERE robloxId = $1 AND petUID = $2`, [
                robloxId,
                uniqueId,
            ]);
            deleted += del.rowCount;
        }

        if (deleted === 0) {
            return res.json({
                success: false,
                error: 'No pets were deleted',
            });
        }

        return res.json({
            success: true,
            message: `Successfully deleted ${deleted} pets from mailbox`,
        });
    } else if (type === 'READ') {
        const { rows } = await sql.query(`SELECT * FROM mailbox WHERE robloxId = $1`, [robloxId]);
        if (rows.length === 0) {
            return res.json({
                success: false,
                error: 'Unknown robloxId',
            });
        }

        const pets = rows.map(({ petid: id, petuid: uid, petlevel: lvl, maildate: timestamp }) => {
            return {
                id,
                uid,
                lvl,
                timestamp,
            };
        });

        return res.json({
            success: true,
            robloxName: rows[0].robloxname,
            pets,
        });
    }
});

module.exports = router;
