const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

// ==========================================
// 1. MIDDLEWARES
// ==========================================
// 1. MIDDLEWARES
app.use(cors({
  origin: '*', // Pinapayagan ang lahat ng frontend port (5173, 5174, etc.)
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
// ==========================================
// 2. MYSQL DATABASE CONNECTION POOL
// ==========================================
// Baguhin ang credentials dito ayon sa MySQL setup mo
const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Imnotready!@', 
  database: process.env.DB_NAME || 'alltimefitness_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test Connection sa pag-start ng server
db.getConnection()
  .then((conn) => {
    console.log('✅ Connected to MySQL Database successfully!');
    conn.release();
  })
  .catch((err) => {
    console.error('❌ Database connection failed:', err.message);
  });

// ==========================================
// 3. API ROUTES
// ==========================================

// Health Check Route
app.get('/', (req, res) => {
  res.send('GymHub Backend API is running on Port ' + PORT);
});

// ------------------------------------------
// GET ALL PRODUCTS (Client Catalog & Admin Inventory)
// ------------------------------------------
app.get('/api/products', async (req, res) => {
  try {
    const [products] = await db.query('SELECT * FROM products ORDER BY product_id DESC');
    res.json(products);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ message: 'Failed to fetch products', error: err.message });
  }
});

// ------------------------------------------
// GET SINGLE PRODUCT BY ID (Product Details Page + Specs)
// ------------------------------------------
app.get('/api/products/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // 1. Kunin ang main product data
    const [products] = await db.query('SELECT * FROM products WHERE product_id = ?', [id]);

    if (products.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const product = products[0];

    // 2. Kunin ang kaugnay na technical specs
    const [specs] = await db.query('SELECT spec_label, spec_value FROM product_specs WHERE product_id = ?', [id]);

    // 3. I-return ang combined object
    res.json({
      ...product,
      specs: specs
    });
  } catch (err) {
    console.error('Error fetching product details:', err);
    res.status(500).json({ message: 'Failed to fetch product details', error: err.message });
  }
});

// ------------------------------------------
// POST NEW PRODUCT (Admin Add Product Form)
// ------------------------------------------
app.post('/api/products', async (req, res) => {
  const {
    name,
    price,
    stock,
    category,
    subcategory,
    badge_tag,
    image_url,
    short_description,
    full_description,
    warranty_info,
    shipping_info,
    specs // Array ng objects: [{ label: "Material", value: "Cast Iron" }]
  } = req.body;

  // Validation
  if (!name || price === undefined || stock === undefined) {
    return res.status(400).json({ message: 'Product Name, Price, and Stock are required.' });
  }

  const connection = await db.getConnection();

  try {
    // Gamit ang transaction para siguradong parehong ma-save ang product at specs
    await connection.beginTransaction();

    // 1. Insert sa main `products` table
    const [result] = await connection.query(
      `INSERT INTO products 
       (name, price, stock, category, subcategory, badge_tag, image_url, short_description, full_description, warranty_info, shipping_info) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        parseFloat(price),
        parseInt(stock, 10),
        category || 'Equipment',
        subcategory || null,
        badge_tag || category || 'EQUIPMENT',
        image_url || null,
        short_description || null,
        full_description || null,
        warranty_info || null,
        shipping_info || null
      ]
    );

    const productId = result.insertId;

    // 2. Insert sa `product_specs` table kung may ipinasa na specs
    if (specs && Array.isArray(specs) && specs.length > 0) {
      const specRows = specs.map((s) => [
        productId,
        s.label || s.spec_label,
        s.value || s.spec_value
      ]);

      await connection.query(
        'INSERT INTO product_specs (product_id, spec_label, spec_value) VALUES ?',
        [specRows]
      );
    }

    await connection.commit();
    connection.release();

    res.status(201).json({
      message: 'Product and Specifications added successfully!',
      product_id: productId
    });
  } catch (err) {
    await connection.rollback();
    connection.release();
    console.error('Error adding product:', err);
    res.status(500).json({ message: 'Failed to add product', error: err.message });
  }
});

// ------------------------------------------
// GET ALL USERS (Admin Portal - User Management)
// ------------------------------------------
app.get('/api/users', async (req, res) => {
  try {
    // SELECT * na lang para makuha lahat ng columns nang walang column name mismatch error
    const [users] = await db.query('SELECT * FROM users');
    res.json(users);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ message: 'Failed to fetch users', error: err.message });
  }
});

// ==========================================
// 4. START SERVER
// ==========================================
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});