const express = require('express');
const router = express.Router();
const { middleWare } = require('../../Middleware/middleWare');
const sql = require('../../../database/db');
const Redis = require('ioredis');
const redis = new Redis({});

async function SetPets() {
    const pets = await sql.query('SELECT * FROM pets_count');
    const petsMapped = pets.rows.map((pet) => {
        return {
            petId: pet.petid,
            count: pet.petcount,
            s: pet.petshiny,
        };
    });

    await redis.set('pets', JSON.stringify(petsMapped));
}

SetPets()
    .then(() => {
        setInterval(SetPets, 1000 * 30);
    })
    .catch((err) => {
        console.log(err);
    });

router.post('/pets', middleWare, async (req, res) => {
    if (!req.body) {
        return res.json({
            success: false,
            error: 'Missing body',
        });
    }

    const { type, payload } = req.body;
    if (type !== 'ADD' && type !== 'REMOVE' && type !== 'UPDATE' && type !== 'READ') {
        return res.json({
            success: false,
            error: `Unknown type: ${type}`,
        });
    }

    if (type === 'ADD') {
        if (!payload || !Array.isArray(payload) || payload.length === 0) {
            return res.json({
                success: false,
                error: 'Missing payload or malformed payload',
            });
        }

        const requiredProps = ['petId', 'count', 's'];

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

            if (isNaN(pet.petId) || isNaN(pet.count)) {
                return res.json({
                    success: false,
                    error: 'Malformed petId or count',
                });
            }

            try {
                const petExists = await sql.query('SELECT * FROM pets_count WHERE petId = $1 AND petShiny = $2', [
                    pet.petId,
                    pet.s,
                ]);
                if (petExists.rowCount === 0) {
                    await sql.query('INSERT INTO pets_count (petId, petCount, petShiny) VALUES ($1, $2, $3)', [
                        pet.petId,
                        pet.count,
                        pet.s,
                    ]);
                } else {
                    await sql.query(
                        'UPDATE pets_count SET petCount = petCount + $1 WHERE petId = $2 AND petShiny = $3',
                        [pet.count, pet.petId, pet.s]
                    );
                }
            } catch (err) {
                return res.json({
                    success: false,
                    error: 'Internal server error',
                });
            }
        }

        return res.json({
            success: true,
        });
    } else if (type === 'REMOVE') {
        if (!payload || !Array.isArray(payload) || payload.length === 0) {
            return res.json({
                success: false,
                error: 'Missing payload or malformed payload',
            });
        }

        const requiredProps = ['petId', 'count', 's'];

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

            if (isNaN(pet.petId) || isNaN(pet.count)) {
                return res.json({
                    success: false,
                    error: 'Malformed petId or count',
                });
            }

            try {
                const petExists = await sql.query('SELECT * FROM pets_count WHERE petId = $1 AND petShiny = $2', [
                    pet.petId,
                    pet.s,
                ]);
                if (petExists.rowCount === 0) {
                    return res.json({
                        success: false,
                        error: 'Pet does not exist',
                    });
                } else {
                    await sql.query(
                        'UPDATE pets_count SET petCount = petCount - $1 WHERE petId = $2 AND petShiny = $3',
                        [pet.count, pet.petId, pet.s]
                    );
                }
            } catch (err) {
                return res.json({
                    success: false,
                    error: 'Internal server error',
                });
            }
        }

        return res.json({
            success: true,
        });
    } else if (type === 'READ') {
        try {
            const redisPets = await redis.get('pets');
            if (redisPets) {
                return res.json({
                    success: true,
                    pets: JSON.parse(redisPets),
                });
            }
        } catch (err) {
            return res.json({
                success: false,
                error: 'Internal server error',
            });
        }
    }
});

module.exports = router;
