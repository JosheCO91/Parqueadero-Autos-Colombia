const mongoose = require('mongoose');

const vehiculoSchema = new mongoose.Schema({
    placa: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true,
        validate: {
            validator: function (v) {

                return /^[A-Z]{2,4}\d{2,4}$/.test(v.replace(/[\s-]/g, ''));
            },
            message: props => `${props.value} no es un formato de placa válido. Ejemplos: ABC123, XYZ9876`
        }
    },
    marca: { type: String, required: true },
    modelo: { type: String, required: true },
    color: { type: String, required: true },
    tipo: { type: String, enum: ['carro', 'moto', 'otro'], required: true },
    propietario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    },
    fechaEntrada: { type: Date, default: Date.now },
    fechaSalida: { type: Date },
    espacioAsignado: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Espacio'
    },
    estado: { type: String, enum: ['activo', 'inactivo'], default: 'activo' }
});

vehiculoSchema.pre('save', function (next) {

    this.placa = this.placa.replace(/[\s-]/g, '').toUpperCase();
    next();
});

module.exports = mongoose.model('Vehiculo', vehiculoSchema);
























