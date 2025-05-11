const express = require('express');
const router = express.Router();
const Espacio = require('../modelos/espacios');
const Vehiculo = require('../modelos/vehiculos');


router.get('/', async (req, res) => {
    try {
        const espacios = await Espacio.find().populate({
            path: 'vehiculo',
            populate: {
                path: 'propietario',
                select: 'documento nombre'
            }
        });
        res.json(espacios);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


router.post('/inicializar', async (req, res) => {
    try {

        await Espacio.deleteMany({});

        for (let i = 1; i <= 10; i++) {
            await new Espacio({
                codigo: `C${i}`,
                tipo: 'carro'
            }).save();
        }


        for (let i = 1; i <= 5; i++) {
            await new Espacio({
                codigo: `M${i}`,
                tipo: 'moto'
            }).save();
        }

        res.json({ message: '15 espacios creados exitosamente (10 carros, 5 motos)' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/resetear', async (req, res) => {
    try {

        await Espacio.deleteMany({});


        for (let i = 1; i <= 10; i++) {
            await new Espacio({
                codigo: `C${i}`,
                tipo: 'carro',
                estado: 'disponible'
            }).save();
        }


        for (let i = 1; i <= 5; i++) {
            await new Espacio({
                codigo: `M${i}`,
                tipo: 'moto',
                estado: 'disponible'
            }).save();
        }

        res.json({ message: '15 espacios reseteados correctamente' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


router.patch('/:id/asignar', async (req, res) => {
    try {
        const { vehiculoId } = req.body;

        const espacio = await Espacio.findById(req.params.id);
        if (!espacio) return res.status(404).json({ message: 'Espacio no encontrado' });

        if (espacio.estado === 'ocupado') {
            return res.status(400).json({ message: 'El espacio ya está ocupado' });
        }

        espacio.vehiculo = vehiculoId;
        espacio.estado = 'ocupado';
        await espacio.save();

        res.json(espacio);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});


router.patch('/:id/liberar', async (req, res) => {
    try {
        const espacio = await Espacio.findById(req.params.id);
        if (!espacio) return res.status(404).json({ message: 'Espacio no encontrado' });

        espacio.vehiculo = null;
        espacio.estado = 'disponible';
        await espacio.save();

        res.json(espacio);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;