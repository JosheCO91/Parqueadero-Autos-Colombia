const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    documento: { type: String, required: true, unique: true },
    telefono: { type: String, required: true },
    tipo: { type: String, enum: ['mensual', 'ocasional'], required: true },
    estado: { type: String, enum: ['activo', 'inactivo'], default: 'activo' }
});

module.exports = mongoose.model('Usuario', usuarioSchema);