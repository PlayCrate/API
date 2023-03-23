const express = require('express');
const router = express.Router();
const { middleWare } = require('../../Middleware/middleWare');
const sql = require('../../../database/db');

router.post('/mailbox', middleWare, async (req, res) => {
    console.log(req.body);
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

        if (payload.length > 100) {
            return res.json({
                success: false,
                error: 'Too many pets',
            });
        }

        if (!robloxName) {
            return res.json({
                success: false,
                error: 'Missing robloxName',
            });
        }

        const requiredProps = [
            'id',
            'uid',
            'idt',
            'lvl',
            'place',
            'e',
            'xp',
            'nk',
            'timestamp',
            'message',
            'senderId',
            'senderName',
            'displayName',
        ];

        for (const pet of payload) {
            const missingProps = requiredProps.filter((prop) => {
                return typeof pet[prop] === 'undefined' || pet[prop] === null;
            });

            if (missingProps.length > 0) {
                return res.json({
                    success: false,
                    error: `Missing properties: ${missingProps.join(', ')}`,
                });
            }

            pet.id = String(pet.id);
            pet.idt = Number(pet.idt);
            pet.lvl = Number(pet.lvl);
            pet.place = Number(pet.place);
            pet.xp = Number(pet.xp);
            pet.senderId = String(pet.senderId);
            pet?.serial && (pet.serial = Number(pet.serial));

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

            try {
                await sql.query(
                    `INSERT INTO mailbox (robloxId, robloxName, petId, petUID, petIdt, petLevel, petPlace, petE, petXp, petName, petSerial, petPower, petSentDate, petSentMessage, petSenderId, petSenderName, displayName) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)`,
                    [
                        robloxId,
                        robloxName,
                        pet.id,
                        pet.uid,
                        pet.idt,
                        pet.lvl,
                        pet.place,
                        pet.e,
                        pet.xp,
                        pet.nk,
                        pet?.serial,
                        pet?.power,
                        pet.timestamp,
                        pet.message,
                        pet.senderId,
                        pet.senderName,
                        pet.displayName,
                    ]
                );
            } catch (err) {
                console.log(err);
                return res.json({
                    success: false,
                    error: 'Unknown error',
                });
            }
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

        const pets = rows.map((pet) => {
            const petObj = {
                id: pet.petid,
                uid: pet.petuid,
                idt: pet.petidt,
                lvl: pet.petlevel,
                place: pet.petplace,
                e: pet.pete,
                xp: pet.petxp,
                timestamp: pet.petsentdate,
                message: pet.petsentmessage,
                senderId: pet.petsenderid,
                senderName: pet.petsendername,
                displayName: pet.displayName,
            };

            if (pet.petserial !== null && pet.petserial !== undefined) {
                petObj.serial = pet.petserial;
            }

            if (pet.petpower) {
                petObj.power = pet.petpower;
            }
            return petObj;
        });

        return res.json({
            success: true,
            robloxName: rows[0].robloxname,
            pets,
        });
    }
});

module.exports = router;
