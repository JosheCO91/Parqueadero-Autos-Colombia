const express = require('express');
const router = express.Router();
const Usuario = require('../modelos/usuarios');


router.get('/', async (req, res) => {
    try {
        const usuarios = await Usuario.find();
        res.json(usuarios);
    } catch (err) {
        res.status(500).json({ message: 'Error al cargar usuarios' });
    }
});


router.post('/', async (req, res) => {
    try {
        const usuario = new Usuario({
            nombre: req.body.nombre,
            documento: req.body.documento,
            telefono: req.body.telefono,
            tipo: req.body.tipo
        });

        const nuevoUsuario = await usuario.save();
        res.status(201).json(nuevoUsuario);
    } catch (err) {
        res.status(400).json({ message: 'Error al crear usuario' });
    }
});


router.put('/:id', async (req, res) => {
    try {
        const usuario = await Usuario.findByIdAndUpdate(
            req.params.id,
            {
                nombre: req.body.nombre,
                documento: req.body.documento,
                telefono: req.body.telefono,
                tipo: req.body.tipo
            },
            { new: true }
        );

        if (!usuario) return res.status(404).json({ message: 'Usuario no encontrado' });
        res.json(usuario);
    } catch (err) {
        res.status(400).json({ message: 'Error al actualizar usuario' });
    }
});


router.delete('/:id', async (req, res) => {
    try {
        const usuario = await Usuario.findByIdAndDelete(req.params.id);
        if (!usuario) return res.status(404).json({ message: 'Usuario no encontrado' });
        res.json({ message: 'Usuario eliminado' });
    } catch (err) {
        res.status(500).json({ message: 'Error al eliminar usuario' });
    }
});

module.exports = router;