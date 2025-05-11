const express = require('express');
const router = express.Router();
const Pago = require('../modelos/pago');


router.get('/', async (req, res) => {
    try {
        const pagos = await Pago.find()
            .sort({ fecha: -1 })
            .limit(10);
        res.json(pagos);
    } catch (err) {
        res.status(500).json({ message: 'Error al cargar pagos' });
    }
});


router.post('/', async (req, res) => {
    try {
        const pago = new Pago({
            placa: req.body.placa,
            tiempo: req.body.tiempo,
            monto: req.body.monto
        });

        await pago.save();
        res.status(201).json(pago);
    } catch (err) {
        res.status(400).json({ message: 'Datos incorrectos' });
    }
});

module.exports = router;