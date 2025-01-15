const mongoose = require('mongoose');
const { Product } = require('../models/Product');
require('dotenv').config();

const sushiProducts = [
  {
    nombre: "California Roll",
    descripcion: "Roll de sushi con aguacate, pepino y cangrejo",
    precio: 12.99,
    categoria: "Rolls Clásicos",
    ingredientes: ["Aguacate", "Pepino", "Cangrejo", "Arroz", "Alga nori"],
    disponible: true
  },
  {
    nombre: "Spicy Tuna Roll",
    descripcion: "Roll picante con atún fresco y verduras",
    precio: 14.99,
    categoria: "Rolls Especiales",
    ingredientes: ["Atún", "Sriracha", "Cebollín", "Arroz", "Alga nori"],
    disponible: true
  },
  {
    nombre: "Dragon Roll",
    descripcion: "Roll especial con tempura de camarón y aguacate por fuera",
    precio: 16.99,
    categoria: "Rolls Premium",
    ingredientes: ["Camarón tempura", "Aguacate", "Pepino", "Arroz", "Alga nori"],
    disponible: true
  },
  {
    nombre: "Sashimi de Salmón",
    descripcion: "Cortes frescos de salmón premium",
    precio: 18.99,
    categoria: "Sashimi",
    ingredientes: ["Salmón"],
    disponible: true
  },
  {
    nombre: "Nigiri Mixto",
    descripcion: "Selección de nigiris variados",
    precio: 20.99,
    categoria: "Nigiri",
    ingredientes: ["Salmón", "Atún", "Camarón", "Arroz"],
    disponible: true
  },
  {
    nombre: "Veggie Roll",
    descripcion: "Roll vegetariano con verduras frescas",
    precio: 11.99,
    categoria: "Vegetariano",
    ingredientes: ["Aguacate", "Pepino", "Zanahoria", "Espinaca", "Arroz", "Alga nori"],
    disponible: true
  }
];

async function seedProducts() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    // Limpiar la colección existente
    await Product.deleteMany({});
    
    // Insertar los nuevos productos
    await Product.insertMany(sushiProducts);
    
    console.log('Productos sembrados exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('Error al sembrar productos:', error);
    process.exit(1);
  }
}

// Ejecutar el seeder si se llama directamente
if (require.main === module) {
  seedProducts();
}

module.exports = seedProducts; 