const express = require('express');
const router = express.Router();
const { middleWare } = require('../../Middleware/middleWare');
const sql = require('../../../database/db');

router.post('/mailbox', middleWare, async (req, res) => {
    if (!req.body) {
        return res.json({
            success: false,
            error: 'Missing body',
        });
    }

    let { robloxId } = req.body;
    const { type, payload, robloxName } = req.body;

    if (!robloxId || isNaN(robloxId)) {
        return res.json({
            success: false,
            error: 'Missing robloxId or malfored robloxId',
        });
    }

    if (type !== 'ADD' && type !== 'REMOVE' && type !== 'UPDATE' && type !== 'READ' && type !== 'SIGNBACK') {
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

        const requiredProps = [
            'id',
            'uid',
            'idt',
            'lvl',
            'place',
            'xp',
            'nk',
            'timestamp',
            'message',
            'senderId',
            'senderName',
            'displayName',
            'targetId',
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
            pet.targetId = String(pet.targetId);
            pet?.serial && (pet.serial = Number(pet.serial));
            pet?.nickname && (pet.nickname = String(pet.nickname));

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
                    `INSERT INTO mailbox (robloxId, robloxName, petId, petUID, petIdt, petLevel, petPlace, petXp, petName, petSerial, petPower, petSentDate, petSentMessage, petSenderId, petSenderName, displayName, targetId, petShiny, petSigned, petTs, petHatchedByName, petHatchedById, petNickname, petEnchanted) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24)`,
                    [
                        robloxId,
                        robloxName,
                        pet.id,
                        pet.uid,
                        pet.idt,
                        pet.lvl,
                        pet.place,
                        pet.xp,
                        pet.nk,
                        pet?.serial,
                        pet?.power,
                        pet.timestamp,
                        pet.message,
                        pet.senderId,
                        pet.senderName,
                        pet.displayName,
                        pet.targetId,
                        pet?.s,
                        pet?.signed,
                        pet?.ts,
                        pet?.hatchedByName,
                        pet?.hatchedById,
                        pet?.nickname,
                        pet?.enchanted,
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
                xp: pet.petxp,
                nk: pet.petname,
                timestamp: pet.petsentdate,
                message: pet.petsentmessage,
                senderId: pet.petsenderid,
                senderName: pet.petsendername,
                displayName: pet.displayname,
                targetId: pet.targetid,
            };

            if (pet.petserial !== null && pet.petserial !== undefined) {
                petObj.serial = pet.petserial;
            }

            if (pet.petpower) {
                petObj.power = pet.petpower;
            }

            if (pet.petshiny) {
                petObj.s = pet.petshiny;
            }

            if (pet.petsigned) {
                petObj.signed = pet.petsigned;
            }

            if (pet.ts) {
                petObj.ts = pet.ts;
            }

            if (pet.pethatchedbyname) {
                petObj.hatchedByName = pet.pethatchedbyname;
            }

            if (pet.pethatchedbyid) {
                petObj.hatchedById = pet.pethatchedbyid;
            }

            if (pet.nickname) {
                petObj.nickname = pet.nickname;
            }

            if (pet.enchanted) {
                petObj.enchanted = pet.petenchanted;
            }
            return petObj;
        });

        return res.json({
            success: true,
            robloxName: rows[0].robloxname,
            pets,
        });
    } else if (type === 'SIGNBACK') {
        const { robloxId, petUID } = req.body;
        if (!robloxId || !petUID) {
            return res.json({
                success: false,
                error: 'Missing robloxId or petUID',
            });
        }

        const { rows } = await sql.query(`SELECT * FROM mailbox WHERE robloxId = $1 AND petUID = $2`, [
            robloxId,
            petUID,
        ]);

        if (rows.length === 0) {
            return res.json({
                success: false,
                error: 'Could not find pet with that UID',
            });
        }

        const pet = rows[0];
        const { petsendername, petsenderid, robloxname, targetid } = pet;
        const { rows: check } = await sql.query(`SELECT * FROM mailbox WHERE robloxId = $1`, [petsenderid]);
        if (check?.length >= 100) {
            return res.json({
                success: false,
                error: 'FULL',
            });
        }

        try {
            const { rows } = await sql.query(
                `UPDATE mailbox 
                SET petSigned = $1, petSenderId = $2, petSenderName = $3, robloxName = $4, robloxId = $5, petSentDate = $6, petSentMessage = $7, displayName = $8, targetId = $9
                WHERE robloxId = $10 AND petUID = $11 RETURNING *`,
                [
                    robloxname,
                    targetid,
                    robloxname,
                    petsendername,
                    petsenderid,
                    0,
                    `This is a signback pet from ${robloxname}`,
                    robloxname,
                    petsenderid,
                    robloxId,
                    petUID,
                ]
            );

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
                    xp: pet.petxp,
                    nk: pet.petname,
                    timestamp: pet.petsentdate,
                    message: pet.petsentmessage,
                    senderId: pet.petsenderid,
                    senderName: pet.petsendername,
                    displayName: pet.displayname,
                    targetId: pet.targetid,
                };

                if (pet.petserial !== null && pet.petserial !== undefined) {
                    petObj.serial = pet.petserial;
                }

                if (pet.petpower) {
                    petObj.power = pet.petpower;
                }

                if (pet.petshiny) {
                    petObj.s = pet.petshiny;
                }

                if (pet.petsigned) {
                    petObj.signed = pet.petsigned;
                }

                if (pet.ts) {
                    petObj.ts = pet.ts;
                }

                if (pet.pethatchedbyname) {
                    petObj.hatchedByName = pet.pethatchedbyname;
                }

                if (pet.pethatchedbyid) {
                    petObj.hatchedById = pet.pethatchedbyid;
                }

                if (pet.nickname) {
                    petObj.nickname = pet.nickname;
                }

                if (pet.enchanted) {
                    petObj.enchanted = pet.petenchanted;
                }

                return petObj;
            });

            return res.json({
                success: true,
                message: 'Successfully signed back pet',
                pets,
            });
        } catch (err) {
            console.log(err);
            return res.json({
                success: false,
                error: 'Unknown error',
            });
        }
    }
});

module.exports = router;
