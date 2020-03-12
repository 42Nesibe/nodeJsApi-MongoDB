const { Router } = require('express');
const router = Router();

const User = require('../models/userModel');
const verifyToken = require('./verifyToken');

const jwt = require('jsonwebtoken');
const config = require('../config');

router.post("/signup", async (req, res) => {
    try {
        const { username, email, password } = req.body;

        const user = new User({
            username,
            email,
            password,
        });

        user.password = await user.e.encryptPassword(password);
        await user.save();

        const token = jwt.sign({
            id: user.id,
        }, config.secret, {
                expiresIn: "24h",
            });
        res.status(200).json({
            auth: true, token
        });
    } catch (error) {
        console.log(error);
        res.status(500).send("Signup kısmında bir problem var.")
    }
});

router.post("/signin", async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.status(404).send("Bu email adresi kayıtlı değildir.")
        };
        const validPassword = await user.validPassword(req.body.password, user.password);
        if (!validPassword) {
            return res.status(401).send({ auth: false, token: null });
        }
        const token = jwt.sign({ id: user.id }, config.secret, {
            expiresIn: "24h"
        });
        res.status(200).json({ auth: true, token });
    } catch (error) {
        console.log(error);
        res.status(500).send("Oturum açılırken hata oluştu");
    }
});
router.get("/logout", function (req, res) {
    res.status(200).send({ auth: false, token: null });
});

module.exports = router;