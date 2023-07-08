const express = require('express');
const router = express.Router();
const { middleWare } = require('../../Middleware/middleWare');
const { randomBytes } = require('crypto');
const sql = require('../../../database/db');

function generateCode() {
    let code = randomBytes(2).toString('hex');
    code += '-' + randomBytes(2).toString('hex') + '-' + randomBytes(2).toString('hex');
    return code.toUpperCase();
}

router.post('/discord-verify', middleWare, async (req, res) => {
    const { payload } = req.body;

    if (payload === 'REQUEST_CODE') {
        const { discordName, discordId } = req.body;

        if (!discordName || !discordId) {
            return res.json({
                success: false,
                error: 'Missing discordName or discordId',
            });
        }

        const checkDiscordId = await sql.query(`SELECT code, used FROM discord_verify WHERE discord_id = $1`, [
            discordId,
        ]);
        if (checkDiscordId.rows.length > 0) {
            const { code, used } = checkDiscordId.rows[0];
            if (used) {
                return res.json({
                    success: false,
                    error: 'This Discord ID is already verified.',
                });
            } else if (used === false) {
                return res.json({
                    success: false,
                    error: `You already have a code. Please use the code: ${code}`,
                });
            }
        }

        const code = generateCode();
        await sql.query(`INSERT INTO discord_verify (discord_id, discord_name, code) VALUES ($1, $2, $3)`, [
            discordId,
            discordName,
            code,
        ]);

        return res.json({
            success: true,
            message: `Your code is: ${code}`,
        });
    } else if (payload === 'VERIFY_CODE') {
        const { code } = req.body;

        if (!code) {
            return res.json({
                success: false,
                error: 'Missing code',
            });
        }

        const checkCode = await sql.query(`SELECT discord_name, used FROM discord_verify WHERE code = $1`, [code]);
        if (checkCode.rows.length === 0) {
            return res.json({
                success: false,
                error: 'Invalid code',
            });
        }

        const { discord_name, used } = checkCode.rows[0];
        if (used) {
            return res.json({
                success: false,
                error: `This code is already used by ${discord_name}`,
            });
        }

        await sql.query(`UPDATE discord_verify SET used = true WHERE code = $1`, [code]);
        return res.json({
            success: true,
            message: `Successfully verified ${discord_name}`,
        });
    } else {
        return res.json({
            success: false,
            error: 'Missing payload',
        });
    }
});

module.exports = router;
