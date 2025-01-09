const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    nombre: {type: String, required: true},
    descripcion: {type: String, required: true},
    precio: {type: Number, required: true},
    categoria: {type: String, required: true},
    ingredientes: {type: [String], required: true},
    disponible: {type: Boolean, required: true}
});

module.exports = mongoose.model('Product', productSchema);