const mongoose = require('mongoose');

const pagoSchema = new mongoose.Schema({
    vehiculo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vehiculo',
        required: true
    },
    propietario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    },
    espacio: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Espacio',
        required: true
    },
    fechaEntrada: {
        type: Date,
        required: true
    },
    fechaSalida: {
        type: Date,
        default: Date.now
    },
    tarifaBase: {
        type: Number,
        required: true
    },
    total: {
        type: Number,
        required: true
    },
    metodoPago: {
        type: String,
        enum: ['efectivo', 'tarjeta', 'transferencia'],
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Pago', pagoSchema);
