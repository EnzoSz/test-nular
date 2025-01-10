const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    nombre: {type: String, required: true},
    descripcion: {type: String, required: true},
    precio: {type: Number, required: true},
    ingredientes: {type: [String], required: true},
    disponible: {type: Boolean, required: true}
});

const Product = mongoose.model('Product', productSchema);
module.exports = { Product };