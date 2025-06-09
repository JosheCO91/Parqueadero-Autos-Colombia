const express = require('express');
const router = express.Router();
const Espacio = require('../modelos/espacios');
const Vehiculo = require('../modelos/vehiculos');
const Pago = require('../modelos/pagos');



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
        const espacio = await Espacio.findById(req.params.id).populate('vehiculo');
        if (!espacio) return res.status(404).json({ message: 'Espacio no encontrado' });

        if (!espacio.vehiculo) {
            espacio.estado = 'disponible';
            await espacio.save();
            return res.json(espacio);
        }

        const vehiculo = await Vehiculo.findById(espacio.vehiculo._id).populate('propietario');
        if (!vehiculo) return res.status(404).json({ message: 'Vehículo no encontrado' });

        const tarifaBase = calcularTarifa(vehiculo.tipo, vehiculo.propietario.tipo);
        const total = calcularTotal(vehiculo.tipo, vehiculo.propietario.tipo, vehiculo.fechaEntrada);

        
        const responseData = {
            espacio: {
                _id: espacio._id,
                codigo: espacio.codigo,
                estado: 'disponible' 
            },
            pagoData: {
                vehiculo: vehiculo._id,
                propietario: vehiculo.propietario._id,
                espacio: espacio._id,
                fechaEntrada: vehiculo.fechaEntrada,
                tarifaBase,
                total
            },
            vehiculoInfo: {
                placa: vehiculo.placa,
                tipo: vehiculo.tipo
            },
            propietarioInfo: {
                nombre: vehiculo.propietario.nombre,
                documento: vehiculo.propietario.documento,
                tipo: vehiculo.propietario.tipo
            }
        };

        res.json(responseData);

    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});


router.post('/:id/confirmar-pago', async (req, res) => {
    try {
        const { metodoPago, pagoData } = req.body;

        const pago = new Pago({
            ...pagoData,
            metodoPago,
            fechaSalida: new Date()
        });
        await pago.save();

        await Espacio.findByIdAndUpdate(req.params.id, {
            $set: {
                vehiculo: null,
                estado: 'disponible'
            }
        });

        await Vehiculo.findByIdAndUpdate(pagoData.vehiculo, {
            $set: { fechaSalida: new Date() }
        });

        res.json({ success: true, pago });

    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

function calcularTarifa(tipoVehiculo, tipoUsuario) {
    const tarifas = {
        carro: {
            normal: 80000,
            mensual: 500000,
            horas: 5000
        },
        moto: {
            normal: 40000,
            mensual: 250000,
            horas: 3000
        }
    };
    return tarifas[tipoVehiculo][tipoUsuario] || tarifas[tipoVehiculo].normal;
}

function calcularTotal(tipoVehiculo, tipoUsuario, fechaEntrada) {
    const tarifaBase = calcularTarifa(tipoVehiculo, tipoUsuario);
    if (tipoUsuario === 'horas') {
        const horas = (new Date() - new Date(fechaEntrada)) / (1000 * 60 * 60);
        return Math.ceil(horas) * tarifaBase;
    }
    return tarifaBase;
}

module.exports = router;