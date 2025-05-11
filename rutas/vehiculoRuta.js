const express = require('express');
const router = express.Router();
const Vehiculo = require('../modelos/vehiculos');
const Usuario = require('../modelos/usuarios')
const Espacio = require('../modelos/espacios');

router.get('/', async (req, res) => {
    try {
        const vehiculos = await Vehiculo.find().populate('propietario espacioAsignado');
        res.json(vehiculos);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/', async (req, res) => {
    try {
        const vehiculos = await Vehiculo.find()
            .populate('propietario')
            .populate('espacioAsignado');

        res.json(vehiculos);
    } catch (err) {
        console.error("Error al obtener vehículos:", err);
        res.status(500).json({
            message: 'Error al cargar vehículos',
            error: err.message
        });
    }
});

router.post('/', async (req, res) => {
    try {

        const tipo = req.body.tipo.toLowerCase();
        const placa = req.body.placa.trim().toUpperCase();

        const existePlaca = await Vehiculo.findOne({ placa });
        if (existePlaca) {
            return res.status(400).json({
                error: 'PLACA_DUPLICADA',
                message: 'Esta placa ya está registrada'
            });
        }

        let espacio = await Espacio.findOne({
            tipo: tipo,
            estado: 'disponible'
        });

        if (!espacio) {
            const totalEspacios = await Espacio.countDocuments();

            if (totalEspacios < 15) {

                const codigo = `${tipo.charAt(0).toUpperCase()}${totalEspacios + 1}`;
                espacio = new Espacio({
                    codigo: codigo,
                    tipo: tipo,
                    estado: 'disponible'
                });
                await espacio.save();
            } else {
                return res.status(400).json({
                    error: 'PARQUEADERO_LLENO',
                    message: 'No hay espacios disponibles (límite de 15 alcanzado)',
                    capacidad: 15,
                    ocupados: await Espacio.countDocuments({ estado: 'ocupado' })
                });
            }
        }

        const usuario = await Usuario.findOne({ documento: req.body.propietarioDoc });
        if (!usuario) {
            return res.status(404).json({
                error: 'USUARIO_NO_ENCONTRADO',
                message: 'El documento del propietario no está registrado'
            });
        }

        const vehiculo = new Vehiculo({
            placa: placa,
            marca: req.body.marca,
            modelo: req.body.modelo,
            color: req.body.color,
            tipo: tipo,
            propietario: usuario._id,
            espacioAsignado: espacio._id
        });

        const nuevoVehiculo = await vehiculo.save();

        espacio.vehiculo = nuevoVehiculo._id;
        espacio.estado = 'ocupado';
        await espacio.save();

        res.status(201).json({
            success: true,
            vehiculo: nuevoVehiculo,
            espacio: espacio.codigo
        });

    } catch (err) {
        console.error("Error en registro de vehículo:", err);
        res.status(500).json({
            error: 'ERROR_SERVIDOR',
            message: 'Error al registrar vehículo',
            detalle: err.message
        });
    }
});

router.patch('/:id/salida', async (req, res) => {
    try {
        const vehiculo = await Vehiculo.findById(req.params.id).populate('espacioAsignado');
        if (!vehiculo) {
            return res.status(404).json({ message: 'Vehículo no encontrado' });
        }

        if (vehiculo.espacioAsignado) {
            vehiculo.espacioAsignado.vehiculo = null;
            vehiculo.espacioAsignado.estado = 'disponible';
            await vehiculo.espacioAsignado.save();
        }


        vehiculo.fechaSalida = new Date();
        vehiculo.estado = 'inactivo';
        const vehiculoActualizado = await vehiculo.save();

        res.json(vehiculoActualizado);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;