const express = require('express');
const router = express.Router();
const Pago = require('../modelos/pagos');

router.get('/', async (req, res) => {
    try {
        const pagos = await Pago.find()
            .populate('vehiculo', 'placa')
            .populate('propietario', 'nombre documento')
            .populate('espacio', 'codigo')
            .sort({ fechaSalida: -1 });
            
        res.json(pagos);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});



module.exports = router;
