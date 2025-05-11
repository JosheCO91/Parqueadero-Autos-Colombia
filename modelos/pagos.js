const mongoose = require('mongoose');

const pagoSchema = new mongoose.Schema({
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
    vehiculo: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehiculo', required: true },
    monto: { type: Number, required: true },
    fecha: { type: Date, default: Date.now },
    tipo: { type: String, enum: ['mensualidad', 'ocasional'], required: true },
    metodo: { type: String, enum: ['efectivo', 'tarjeta', 'transferencia'], required: true },
    estado: { type: String, enum: ['pendiente', 'completado', 'cancelado'], default: 'pendiente' }
});

module.exports = mongoose.model('Pago', pagoSchema);