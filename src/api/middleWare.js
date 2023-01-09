const { twitter } = require('../../config.json');

async function middleWare(req, res, next) {
    const { authorization } = req.headers;
    if (!authorization || authorization !== twitter.API_KEY) {
        return res.status(401).json({
            success: false,
            message: 'Unauthorized',
        });
    }

    next();
}

module.exports = { middleWare };
