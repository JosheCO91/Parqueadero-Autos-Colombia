const mongoose = require('mongoose');

const espacioSchema = new mongoose.Schema({
    codigo: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        uppercase: true
    },
    tipo: {
        type: String,
        enum: ['carro', 'moto'],
        required: true
    },
    estado: {
        type: String,
        enum: ['disponible', 'ocupado', 'mantenimiento'],
        default: 'disponible'
    },
    vehiculo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vehiculo',
        default: null
    }
}, {
    timestamps: true
});


espacioSchema.pre('save', async function () {
    try {
        const collection = mongoose.connection.db.collection('espacios');
        const indexes = await collection.indexes();


        const oldIndex = indexes.find(i => i.key && i.key.numero);
        if (oldIndex) {
            await collection.dropIndex(oldIndex.name);
        }
    } catch (err) {
        console.error('Error al limpiar índices antiguos:', err);
    }
});

module.exports = mongoose.model('Espacio', espacioSchema);