const express = require('express');
const router = express.Router();
const { middleWare } = require('../../Middleware/middleWare');
const sql = require('../../../database/db');

const availablePaylods = [
    'CREATE_PLAYER_VAULT',
    'GET_PLAYER_VAULT',
    'INVITE_VAULT_ACCESS',
    'ACCEPT_VAULT_INVITE',
    'DEPOSIT_VAULT_ITEMS',
    'WITHDRAW_VAULT_ITEMS',
    'CHANGE_VAULT_SETTINGS',
    'REMOVE_FROM_VAULT',
    'STORAGE_UPGRADE',
    'ACCESS_UPGRADE',
];

const availableSettings = ['VaultInvites', 'VaultSettings', 'PlayerSettings'];

router.post('/vaults', middleWare, async (req, res) => {
    const { payload, robloxId } = req.body;
    if (!payload || !availablePaylods.includes(payload) || !robloxId) {
        return res.json({
            success: false,
            error: 'Missing payload or Invalid payload or missing robloxId',
        });
    }

    if (payload === 'CREATE_PLAYER_VAULT') {
        const { vault_invites, player_settings } = req.body;
        if (!vault_invites || !player_settings) {
            return res.json({
                success: false,
                error: 'Missing vault options for creating player vault.',
            });
        }

        if (typeof vault_invites !== 'boolean' || typeof player_settings !== 'boolean') {
            return res.json({
                success: false,
                error: 'Invalid typeof settings',
            });
        }

        try {
            // Assuming player_id is available in your request or session
            const player_id = robloxId;
            await sql.query(
                `
              INSERT INTO vault_players (roblox_id, vault_invites, player_settings)
              VALUES ($1, $2, $3)
              ON CONFLICT (roblox_id)
              DO UPDATE SET vault_invites = $2, player_settings = $3
            `,
                [player_id, vault_invites, player_settings]
            );

            return res.json({
                success: true,
                message: 'Successfully created vault account.',
            });
        } catch (error) {
            console.error('Error creating player vault:', error);
            return res.json({
                success: false,
                error: 'Error creating player vault.',
            });
        }
    } else if (payload === 'GET_PLAYER_VAULT') {
        try {
            const { rows } = await sql.query('SELECT * FROM vault_players WHERE roblox_id = $1', [robloxId]);

            if (rows.length === 0) {
                return res.json({
                    success: false,
                    error: 'No rows returned',
                });
            }

            const { rows: invites } = await sql.query(
                'SELECT roblox_id FROM vault_invites WHERE requester_id = $1 AND accepted = false',
                [robloxId]
            );

            const invites_tbl = invites.map((item) => parseInt(item.roblox_id, 10));

            const { rows: shared } = await sql.query(
                'SELECT roblox_id FROM vault_invites WHERE requester_id = $1 AND accepted = true',
                [robloxId]
            );

            let shared_tbl = shared.map((item) => parseInt(item.roblox_id, 10));
            shared_tbl.push(robloxId);

            let vaults = [];
            for (const i of shared_tbl) {
                const { rows: pets } = await sql.query(`SELECT id, pets FROM vault WHERE roblox_id = $1`, [i]);
                const { rows: slots } = await sql.query(`SELECT vault_slots FROM vault_players WHERE roblox_id = $1`, [
                    i,
                ]);

                let pets_tbl = [];
                for (let x of pets) {
                    x.pets.item_id = x.id;

                    pets_tbl.push(x.pets);
                }

                vaults.push({
                    owner_id: i,
                    max_slots: slots[0].vault_slots,
                    pets: pets_tbl,
                });
            }

            const { rows: members } = await sql.query(
                `SELECT requester_id FROM vault_invites WHERE roblox_id = $1 AND accepted = true;`,
                [robloxId]
            );
            let members_tbl = members.map((item) => parseInt(item.requester_id, 10));
            members_tbl.push(robloxId);

            const body = {
                settings: {
                    vault_invites: rows[0].vault_invites,
                    player_settings: rows[0].player_settings,
                },
                invites: invites_tbl,
                shared: vaults,
                members: members_tbl,
            };

            return res.json({
                success: true,
                data: body,
            });
        } catch (err) {
            console.error('Error fetching player vault:', err);
            return res.json({
                success: false,
                error: 'error while fetching player vault.',
            });
        }
    } else if (payload === 'INVITE_VAULT_ACCESS') {
        const { requester_id } = req.body;
        if (!requester_id) {
            return res.json({
                success: false,
                error: 'requester id not found.',
            });
        }

        try {
            const { rows: self } = await sql.query(`SELECT access_slots FROM vault_players WHERE roblox_id = $1`, [
                robloxId,
            ]);
            if (self.length === 0) {
                return res.json({
                    success: false,
                    error: 'self not found',
                });
            }

            const { rows: sharing_count } = await sql.query(`SELECT COUNT(*) FROM vault_invites WHERE roblox_id = $1`, [
                robloxId,
            ]);
            const the_count = parseInt(sharing_count[0].count) + 1;
            if (self[0].access_slots <= the_count) {
                return res.json({
                    success: false,
                    error: 'not enough access slots',
                });
            }

            const { rows: findUser } = await sql.query(`SELECT vault_invites FROM vault_players WHERE roblox_id = $1`, [
                requester_id,
            ]);
            if (findUser.length === 0) {
                return res.json({
                    success: false,
                    error: 'the user you are trying to request invite does not exist.',
                });
            }

            if (findUser[0].vault_invites === false) {
                return res.json({
                    success: false,
                    error: 'the user you are trying to request has invites disabled.',
                });
            }

            const { rows } = await sql.query(`SELECT * FROM vault_invites WHERE roblox_id = $1 AND requester_id = $2`, [
                robloxId,
                requester_id,
            ]);
            if (rows.length > 0) {
                return res.json({
                    success: false,
                    error: 'User requested is already invited',
                });
            } else {
                await sql.query(`INSERT INTO vault_invites (roblox_id, requester_id) VALUES ($1, $2)`, [
                    robloxId,
                    requester_id,
                ]);

                return res.json({
                    success: true,
                    message: 'Invite sent!',
                });
            }
        } catch (err) {
            console.log('Error while sending vault invite', err);
            return res.json({
                success: false,
                error: 'error while sending vault invite.',
            });
        }
    } else if (payload === 'ACCEPT_VAULT_INVITE') {
        const { owner_id } = req.body;
        if (!owner_id || typeof owner_id !== 'number') {
            return res.json({
                success: false,
                error: 'invalid owner_id type',
            });
        }

        try {
            const { rows } = await sql.query(
                `SELECT * FROM vault_invites WHERE roblox_id = $1 AND requester_id = $2 AND accepted = false`,
                [owner_id, robloxId]
            );
            if (rows.length === 0) {
                return res.json({
                    success: false,
                    error: 'no invite found to accept',
                });
            }

            await sql.query(`UPDATE vault_invites SET accepted = true WHERE roblox_id = $1 AND requester_id = $2`, [
                owner_id,
                robloxId,
            ]);
            return res.json({
                success: true,
                message: 'accepted vault invite',
            });
        } catch (err) {
            console.log('Error while accepting vault invite', err);
            return res.json({
                success: false,
                error: 'error while accepting vault invite',
            });
        }
    } else if (payload === 'DEPOSIT_VAULT_ITEMS') {
        const { items, depositer_id } = req.body;
        if (!depositer_id || typeof depositer_id !== 'number') {
            return res.json({
                success: false,
                error: 'invalid depositer_id type',
            });
        }

        if (!items || typeof items !== 'object') {
            return res.json({
                success: false,
                error: 'items is not an object (array)',
            });
        }

        try {
            // CHGECK IF VAULT PLAYER EXISTS
            const { rows } = await sql.query(`SELECT * FROM vault_players WHERE roblox_id = $1`, [depositer_id]);
            if (rows.length === 0) {
                return res.json({
                    success: false,
                    error: 'no vault player found',
                });
            }

            // CHECK IF SLOTS GO OVER
            const { rows: count } = await sql.query(`SELECT COUNT(*) FROM vault WHERE roblox_id = $1`, [depositer_id]);
            const current_count = parseInt(count[0].count) + items.length;
            if (rows[0].vault_slots < current_count) {
                return res.json({
                    success: false,
                    error: 'not enough slots',
                });
            }

            // CHECK IF THE DEPOSITER_ID HAS AN INVITE AND ALSO IF ITS ACCEPTED
            // IGNORE IF DEPOSITER_ID IS SAME AS ROBLOX ID SINCE ITS THE OWNER
            let valid = false;
            if (depositer_id === robloxId) {
                valid = true;
            } else {
                const { rows: check_accepted } = await sql.query(
                    `SELECT * FROM vault_invites WHERE roblox_id = $1 AND requester_id = $2 AND accepted = true`,
                    [depositer_id, robloxId]
                );
                if (check_accepted.length !== 0) {
                    valid = true;
                }
            }

            if (valid === true) {
                for (const i of items) {
                    await sql.query(`INSERT INTO vault (roblox_id, pets) VALUES ($1, $2)`, [
                        depositer_id,
                        JSON.stringify(i),
                    ]);
                }

                return res.json({
                    success: true,
                    message: 'successfully deposited items into the vault',
                });
            } else {
                return res.json({
                    success: false,
                    error: 'you do not have access to this vault',
                });
            }
        } catch (err) {
            console.log('there was an error while despositing', err);
            return res.json({
                success: false,
                error: 'there was an error while depositing',
            });
        }
    } else if (payload === 'WITHDRAW_VAULT_ITEMS') {
        const { items, vault_owner_id } = req.body;
        if (!vault_owner_id || typeof vault_owner_id !== 'number') {
            return res.json({
                success: false,
                error: 'invalid vault_owner_id type',
            });
        }

        if (!items || typeof items !== 'object') {
            return res.json({
                success: false,
                error: 'invalid items type',
            });
        }

        try {
            let valid = false;
            if (vault_owner_id === robloxId) {
                valid = true;
            } else {
                const { rows: find_vault_player } = await sql.query(
                    `SELECT player_settings FROM vault_players WHERE roblox_id = $1`,
                    [vault_owner_id]
                );
                if (find_vault_player.length === 0) {
                    return res.json({
                        success: false,
                        error: 'unknown vault, vault not found',
                    });
                }

                if (find_vault_player[0].player_settings === false) {
                    return res.json({
                        success: false,
                        error: 'withdrawing is disabled on this vault.',
                    });
                }

                // VALIDATE IF ROBLOXID IS ACCEPTED INTO VAULT
                const { rows: check_accepted } = await sql.query(
                    `SELECT * FROM vault_invites WHERE roblox_id = $1 AND requester_id = $2 AND accepted = true`,
                    [vault_owner_id, robloxId]
                );
                if (check_accepted.length !== 0) {
                    valid = true;
                }
            }

            if (valid === true) {
                let count = 0;
                let pets = [];

                for (const i of items) {
                    const { rowCount, rows } = await sql.query(
                        `DELETE FROM vault WHERE id = $1 AND roblox_id = $2 RETURNING *`,
                        [i, vault_owner_id]
                    );

                    if (rowCount > 0) {
                        // Deletion was successful, increment the count
                        count += 1;
                        pets.push(rows[0].pets);
                    }
                }

                if (count > 0) {
                    return res.json({
                        success: true,
                        message: `successfully withdrew ${count} pets from the vault.`,
                        data: pets,
                    });
                } else {
                    return res.json({
                        success: false,
                        error: 'no pets found to withdraw',
                    });
                }
            } else {
                return res.json({
                    success: false,
                    error: 'you do not have access to this vault to withdraw',
                });
            }
        } catch (err) {
            console.log('ERROR WHILE WITHDRAWING PETS', err);
            return res.json({
                success: false,
                error: 'there was an error while withdrawing pets',
            });
        }
    } else if (payload === 'CHANGE_VAULT_SETTINGS') {
        const { settings } = req.body;
        if (!settings || !availableSettings.includes(settings)) {
            return res.json({
                success: false,
                error: 'invalid settings type',
            });
        }

        try {
            const { rows } = await sql.query(`SELECT * FROM vault_players WHERE roblox_id = $1`, [robloxId]);
            if (rows.length === 0) {
                return res.json({
                    success: false,
                    error: 'vault player not found',
                });
            }

            if (settings === 'VaultInvites') {
                await sql.query(`UPDATE vault_players SET vault_invites = NOT vault_invites WHERE roblox_id = $1`, [
                    robloxId,
                ]);
                return res.json({
                    success: true,
                    message: 'succesfully changed settings',
                });
            } else if (settings === 'VaultSettings') {
                await sql.query(`DELETE FROM vault_invites WHERE roblox_id = $1 AND accepted = false`, [robloxId]);
                return res.json({
                    success: true,
                    message: 'succesfully changed settings',
                });
            } else if (settings === 'PlayerSettings') {
                await sql.query(`UPDATE vault_players SET player_settings = NOT player_settings WHERE roblox_id = $1`, [
                    robloxId,
                ]);
                return res.json({
                    success: true,
                    message: 'succesfully changed settings',
                });
            }
        } catch (err) {
            console.log('error while changing settings', err);
            return res.json({
                success: false,
                error: 'error while changing settings',
            });
        }
    } else if (payload === 'REMOVE_FROM_VAULT') {
        const { remover_id } = req.body;
        if (!remover_id || typeof remover_id !== 'number') {
            return res.json({
                success: false,
                error: 'unknown number type',
            });
        }

        if (remover_id === robloxId) {
            return res.json({
                success: false,
                error: 'you cannot remove yourself!',
            });
        }

        try {
            const { rowCount } = await sql.query(
                `DELETE FROM vault_invites WHERE roblox_id = $1 AND requester_id = $2`,
                [robloxId, remover_id]
            );
            if (rowCount === 0) {
                return res.json({
                    success: false,
                    error: 'no rows were effected',
                });
            }

            return res.json({
                success: true,
                message: 'successfully removed from vault',
            });
        } catch (err) {
            console.log('error while trying to remove', err);
            return res.json({
                success: false,
                error: 'error while trying to remove',
            });
        }
    } else if (payload === 'STORAGE_UPGRADE') {
        try {
            const { rowCount } = await sql.query(
                `UPDATE vault_players SET vault_slots = vault_slots + 50 WHERE roblox_id = $1`,
                [robloxId]
            );
            if (rowCount === 0) {
                return res.json({
                    success: false,
                    error: 'no rows effected while upgrading storage',
                });
            }

            return res.json({
                success: true,
                message: 'successfully upgraded storage',
            });
        } catch (err) {
            console.log('error while upgrading storage', err);
            return res.json({
                success: false,
                error: 'error while upgrading storage',
            });
        }
    } else if (payload === 'ACCESS_UPGRADE') {
        try {
            const { rowCount } = await sql.query(
                `UPDATE vault_players SET access_slots = access_slots + 1 WHERE roblox_id = $1`,
                [robloxId]
            );
            if (rowCount === 0) {
                return res.json({
                    success: false,
                    error: 'no rows effected while upgrading access',
                });
            }

            return res.json({
                success: true,
                message: 'successfully upgraded access',
            });
        } catch (err) {
            console.log('error while upgrading access', err);
            return res.json({
                success: false,
                error: 'error while upgrading access',
            });
        }
    }
});

module.exports = router;
