const express = require('express');
const router = express.Router();
const { middleWare } = require('../../Middleware/middleWare');
const sql = require('../../../database/db');

const availablePaylods = [
    'CREATE_CLAN',
    'GET_PLAYER_INFO',
    'DISBAND_CLAN',
    'DECLINE_CLAN_INVITE',
    'ACCEPT_CLAN_INVITE',
    'KICK_CLAN_MEMBER',
    'SEND_CLAN_INVITE',
    'REVOKE_CLAN_INVITE',
    'LEAVE_CLAN',
    'DONATE_TO_CLAN',
];

router.post('/clans', middleWare, async (req, res) => {
    const { payload, robloxId } = req.body;
    if (!payload || !availablePaylods.includes(payload) || !robloxId) {
        return res.json({
            success: false,
            error: 'Missing payload or Invalid payload or missing robloxId',
        });
    }

    if (payload === 'CREATE_CLAN') {
        const { clan_desc, clan_name, clan_image, clan_owner_country } = req.body;
        const checkInClan = await sql.query(`SELECT * FROM clans_players WHERE invited_id = $1 AND accepted = true`, [
            robloxId,
        ]);
        if (checkInClan.rowCount > 0) {
            return res.json({
                success: false,
                error: 'Player is already in a clan.',
            });
        }

        const existingRobloxId = await sql.query('SELECT * FROM clans WHERE owner_id = $1', [robloxId]);
        if (existingRobloxId.rowCount > 0) {
            return res.json({
                success: false,
                error: 'Roblox ID already associated with a clan',
            });
        }

        const existingClan = await sql.query('SELECT * FROM clans WHERE LOWER(clan_name) = LOWER($1)', [clan_name]);
        if (existingClan.rowCount > 0) {
            return res.json({
                success: false,
                error: 'Clan name already exists',
            });
        }

        try {
            await sql.query(
                'INSERT INTO clans (owner_id, owner_country, clan_name, clan_image, clan_desc) VALUES ($1, $2, $3, $4, $5)',
                [robloxId, clan_owner_country, clan_name, clan_image, clan_desc]
            );

            return res.json({
                success: true,
                message: 'Successfully created clan.',
            });
        } catch (err) {
            return res.json({
                success: false,
                error: 'error while trying to create clan',
            });
        }
    } else if (payload === 'GET_PLAYER_INFO') {
        try {
            let data = {};

            let isClanOwner = true;
            const findIsClanOwner = await sql.query(
                `SELECT owner_id FROM clans_players WHERE invited_id = $1 AND accepted = true`,
                [robloxId]
            );
            if (findIsClanOwner.rowCount > 0) {
                isClanOwner = false;
            }

            const clan_owner_id = isClanOwner ? robloxId : findIsClanOwner.rows[0].owner_id;
            const myClanQuery = await sql.query(
                `
                WITH RankedClans AS (
                    SELECT *,
                           RANK() OVER (ORDER BY clan_diamonds DESC) AS rank_position
                    FROM clans
                )
                SELECT *
                FROM RankedClans
                WHERE owner_id = $1
            `,
                [clan_owner_id]
            );

            if (myClanQuery.rowCount > 0) {
                myClanQuery.rows[0].owner_id = Number(myClanQuery.rows[0].owner_id);
                myClanQuery.rows[0].clan_diamonds = Number(myClanQuery.rows[0].clan_diamonds);
                myClanQuery.rows[0].rank_position = Number(myClanQuery.rows[0].rank_position);
                data.my_clan = myClanQuery.rows[0];

                const clanMembersExecute = await sql.query(
                    `SELECT * FROM clans_players WHERE owner_id = $1 AND accepted = true`,
                    [clan_owner_id]
                );

                let members = [];
                members.push(Number(clan_owner_id));

                for (const i of clanMembersExecute.rows) {
                    members.push(Number(i.invited_id));
                }

                data.my_clan.members = Array.from(new Set(members));

                let outgoing_invites = [];
                const getInvites = await sql.query(
                    `SELECT * FROM clans_players WHERE owner_id = $1 AND accepted = false`,
                    [clan_owner_id]
                );

                for (const i of getInvites.rows) {
                    outgoing_invites.push({
                        pending_id: Number(i.invited_id),
                        sender_id: Number(i.owner_id),
                        invited_at: i.invited_at,
                    });
                }

                data.my_clan.outgoing_invites = outgoing_invites;
            } else {
                data.my_clan = false;
            }

            const topClansQuery = `
                SELECT *
                    FROM clans
                        ORDER BY clan_diamonds DESC
                            LIMIT 10;
            `;

            const topClans = await sql.query(topClansQuery);
            for (let i of topClans.rows) {
                i.owner_id = Number(i.owner_id);
                i.clan_diamonds = Number(i.clan_diamonds);

                let clanMembers = [];
                const getMembers = await sql.query(
                    `SELECT invited_id FROM clans_players WHERE owner_id = $1 AND accepted = true`,
                    [i.owner_id]
                );

                clanMembers.push(i.owner_id);
                for (const x of getMembers.rows) {
                    clanMembers.push(Number(x.invited_id));
                }
                i.members = Array.from(new Set(clanMembers));
            }
            data.top_clans = topClans.rows;

            const invitesQuery = `
            SELECT *
                FROM clans_players
                    WHERE invited_id = $1 AND accepted = false
        `;
            const invites = await sql.query(invitesQuery, [robloxId]);
            let invitesTbl = [];

            for (const x of invites.rows) {
                const getInvitesClan = await sql.query(`SELECT * FROM clans WHERE owner_id = $1`, [Number(x.owner_id)]);
                if (getInvitesClan.rowCount > 0) {
                    getInvitesClan.rows[0].owner_id = Number(getInvitesClan.rows[0].owner_id);
                    getInvitesClan.rows[0].clan_diamonds = Number(getInvitesClan.rows[0].clan_diamonds);

                    invitesTbl.push(getInvitesClan.rows[0]);
                }
            }

            data.invites = invitesTbl;

            return res.json({
                success: true,
                data: data,
            });
        } catch (err) {
            console.log('there was an error while fetching', err);
            return res.json({
                success: false,
                error: 'there was an internal error while fetching player info',
            });
        }
    } else if (payload === 'DISBAND_CLAN') {
        try {
            const deleteClan = await sql.query(`DELETE FROM clans WHERE owner_id = $1`, [robloxId]);
            if (deleteClan.rowCount <= 0) {
                return res.json({
                    success: false,
                    error: 'no rows were effected.',
                });
            }

            await sql.query(`DELETE FROM clans_players WHERE owner_id = $1`, [robloxId]);
            return res.json({
                success: true,
                message: 'successfully disbanded clan.',
            });
        } catch (err) {
            console.log(err);

            return res.json({
                success: false,
                error: 'error while disbanding clan.',
            });
        }
    } else if (payload === 'DECLINE_CLAN_INVITE') {
        const { clan_owner_id } = req.body;
        if (!clan_owner_id || typeof clan_owner_id != 'number') {
            return res.json({
                success: false,
                error: 'invalid clan name type',
            });
        }

        try {
            const declineClanQuery = `
                DELETE FROM clans_players
                    WHERE invited_id = $1
                        AND owner_id = $2
            `;

            const execute = await sql.query(declineClanQuery, [robloxId, clan_owner_id]);
            if (execute.rowCount <= 0) {
                return res.json({
                    success: false,
                    error: 'no rows effected',
                });
            }

            return res.json({
                success: true,
                message: 'successfully declined invitation',
            });
        } catch (err) {
            console.log('error while decling clan invite', err);
            return res.json({
                success: false,
                error: 'there was an error while decling clan invite.',
            });
        }
    } else if (payload === 'KICK_CLAN_MEMBER') {
        const { member_id } = req.body;
        if (!member_id || typeof member_id != 'number') {
            return res.json({
                success: false,
                error: 'invalid member_id type',
            });
        }

        try {
            const kickMember = await sql.query(
                `DELETE FROM clans_players WHERE owner_id = $1 AND invited_id = $2 AND accepted = true`,
                [robloxId, member_id]
            );
            if (kickMember.rowCount <= 0) {
                return res.json({
                    success: false,
                    error: 'no rows effected',
                });
            }

            return res.json({
                success: true,
                message: 'successfully kicked member',
            });
        } catch (err) {
            console.log('error while kicking', err);
            return res.json({
                success: false,
                error: 'internal error while kicking member',
            });
        }
    } else if (payload === 'SEND_CLAN_INVITE') {
        const { member_id } = req.body;
        if (!member_id || typeof member_id != 'number') {
            return res.json({
                success: false,
                error: 'invalid member id type',
            });
        }

        try {
            // CHECK IF MEMBER IN CLAN
            // CHECK IF OUTGOING INVITE IS OVER 5

            const isMemberInClan = await sql.query(`SELECT * FROM clans_players WHERE invited_id = $1`, [member_id]);
            if (isMemberInClan.rowCount > 0) {
                return res.json({
                    success: false,
                    error: 'Member is already in the clan.',
                });
            }

            const isOutGoingOverLimit = await sql.query(
                `SELECT * FROM clans_players WHERE owner_id = $1 AND accepted = false`,
                [robloxId]
            );
            if (isOutGoingOverLimit.rowCount >= 5) {
                return res.json({
                    success: false,
                    error: 'Outgoing invite cannot go over 5.',
                });
            }

            const sendInvite = await sql.query(`INSERT INTO clans_players (owner_id, invited_id) VALUES ($1, $2)`, [
                robloxId,
                member_id,
            ]);
            if (sendInvite.rowCount > 0) {
                return res.json({
                    success: true,
                    message: 'Successfully invited member.',
                });
            } else {
                return res.json({
                    success: false,
                    error: 'no rows were effected.',
                });
            }
        } catch (err) {
            console.log('error while sending out invite', err);
            return res.json({
                success: false,
                error: 'internal error while sending out invite.',
            });
        }
    } else if (payload === 'REVOKE_CLAN_INVITE') {
        const { member_id } = req.body;
        if (!member_id || typeof member_id != 'number') {
            return res.json({
                success: false,
                error: 'invalid member id type',
            });
        }

        try {
            const revokeInvite = await sql.query(
                `DELETE FROM clans_players WHERE owner_id = $1 AND invited_id = $2 AND accepted = false`,
                [robloxId, member_id]
            );
            if (revokeInvite.rowCount <= 0) {
                return res.json({
                    success: false,
                    error: 'no rows were effected.',
                });
            }

            return res.json({
                success: true,
                message: 'successfully revoked invite.',
            });
        } catch (err) {
            console.log('error while revoking invite', err);
            return res.json({
                success: false,
                error: 'internal error while revoking invite.',
            });
        }
    } else if (payload === 'LEAVE_CLAN') {
        try {
            const leaveClan = await sql.query(`DELETE FROM clans_players WHERE invited_id = $1 AND accepted = true`, [
                robloxId,
            ]);
            if (leaveClan.rowCount <= 0) {
                return res.json({
                    success: false,
                    error: 'no rows were effected',
                });
            }

            return res.json({
                success: true,
                message: 'successfully left clan!',
            });
        } catch (err) {
            console.log('error while trying to leave clan', err);
            return res.json({
                success: false,
                error: 'internal error while trying to leave clan',
            });
        }
    } else if (payload === 'ACCEPT_CLAN_INVITE') {
        const { clan_owner_id } = req.body;
        if (!clan_owner_id || typeof clan_owner_id != 'number') {
            return res.json({
                success: false,
                error: 'invalid clan owner id type',
            });
        }

        try {
            const checkIfInClan = await sql.query(
                `SELECT * FROM clans_players WHERE invited_id = $1 AND accepted = true`,
                [robloxId]
            );
            if (checkIfInClan.rowCount > 0) {
                return res.json({
                    success: false,
                    error: 'player is already in a clan.',
                });
            }

            // CHECK IF CLAN HAS MORE THAN 5
            const getClan = await sql.query(`SELECT * FROM clans_players WHERE owner_id = $1 AND accepted = true`, [
                robloxId,
            ]);
            if (getClan.rowCount >= 3) {
                return res.json({
                    success: false,
                    error: 'clan is full!',
                });
            }

            const acceptInvite = await sql.query(
                `UPDATE clans_players SET accepted = true WHERE owner_id = $1 AND invited_id = $2 AND accepted = false`,
                [clan_owner_id, robloxId]
            );
            if (acceptInvite.rowCount <= 0) {
                return res.json({
                    success: false,
                    error: 'no invitation found.',
                });
            }

            return res.json({
                success: true,
                message: 'succesfully accepted invite!',
            });
        } catch (err) {
            console.log('error while trying to accept invite', err);
            return res.json({
                success: false,
                error: 'there was an internal error while accepting.',
            });
        }
    } else if (payload === 'DONATE_TO_CLAN') {
        const { diamonds } = req.body;
        if (!diamonds || typeof diamonds != 'number') {
            return res.json({
                success: false,
                error: 'invalid type of diamonds',
            });
        }

        try {
            // CHECK OWNER
            const getClanOwner = await sql.query(`SELECT * FROM clans WHERE owner_id = $1`, [robloxId]);
            if (getClanOwner.rowCount <= 0) {
                return res.json({
                    success: false,
                    error: 'no rows returned',
                });
            }

            const getClan = await sql.query(
                `SELECT owner_id FROM clans_players WHERE invited_id = $1 AND accepted = true`,
                [robloxId]
            );

            if (getClan.rowCount <= 0) {
                return res.json({
                    success: false,
                    error: 'not in a clan.',
                });
            }

            const ownerId = Number(getClan.rows[0].owner_id);
            const donateAmount = Number(diamonds);

            const donateClan = await sql.query(
                `UPDATE clans SET clan_diamonds = clan_diamonds + $1 WHERE owner_id = $2`,
                [donateAmount, ownerId]
            );
            if (donateClan.rowCount <= 0) {
                return res.json({
                    success: false,
                    error: 'no rows were effected',
                });
            }

            return res.json({
                success: true,
                message: 'successfully donated.',
            });
        } catch (err) {
            console.log('error while trying to donate diamonds', err);
            return res.json({
                success: false,
                error: 'internal error while trying to donate diamonds',
            });
        }
    }
});

module.exports = router;
