require('dotenv').config();

const express = require('express');
const session = require('express-session');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const products = require('./data/products.json');

const app = express();
const PORT = process.env.PORT || 3000;

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use((req, res, next) => {
  res.locals.uxcamKey = process.env.UXCAM_APP_KEY; 
  next();
});

app.use(session({
  secret: process.env.SESSION_SECRET || 'uxcam-demo-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

// Make cart available to all templates
app.use((req, res, next) => {
  if (!req.session.cart) {
    req.session.cart = [];
  }
  res.locals.cart = req.session.cart;
  res.locals.cartCount = req.session.cart.reduce((sum, item) => sum + item.quantity, 0);
  res.locals.cartTotal = req.session.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  next();
});

// ─── ROUTES ───────────────────────────────────────────────

// Home page
app.get('/', (req, res) => {
  const featured = products.filter(p => p.badge);
  res.render('home', {
    title: 'Nørd Store — Quality Essentials',
    featured,
    products
  });
});

// All products / category filter
app.get('/products', (req, res) => {
  const { category, sort } = req.query;
  let filtered = [...products];

  if (category && category !== 'all') {
    filtered = filtered.filter(p => p.category === category);
  }

  if (sort === 'price-asc') filtered.sort((a, b) => a.price - b.price);
  if (sort === 'price-desc') filtered.sort((a, b) => b.price - a.price);
  if (sort === 'rating') filtered.sort((a, b) => b.rating - a.rating);

  const categories = [...new Set(products.map(p => p.category))];

  res.render('products', {
    title: 'All Products — Nørd Store',
    products: filtered,
    categories,
    activeCategory: category || 'all',
    activeSort: sort || 'default'
  });
});

// Product detail
app.get('/product/:slug', (req, res) => {
  const product = products.find(p => p.slug === req.params.slug);
  if (!product) return res.status(404).render('404', { title: 'Not Found' });

  const related = products
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 3);

  res.render('product-detail', {
    title: `${product.name} — Nørd Store`,
    product,
    related
  });
});

// Add to cart
app.post('/cart/add', (req, res) => {
  const { productId, quantity = 1 } = req.body;
  const product = products.find(p => p.id === productId);
  if (!product) return res.status(404).json({ error: 'Product not found' });

  const existing = req.session.cart.find(item => item.productId === productId);
  if (existing) {
    existing.quantity += parseInt(quantity);
  } else {
    req.session.cart.push({
      id: uuidv4(),
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      image: product.thumbnail,
      quantity: parseInt(quantity)
    });
  }

  // If AJAX request, return JSON
  if (req.xhr || req.headers.accept?.includes('application/json')) {
    return res.json({
      success: true,
      cartCount: req.session.cart.reduce((sum, item) => sum + item.quantity, 0),
      cartTotal: req.session.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    });
  }
  res.redirect('/cart');
});

// Update cart item quantity
app.post('/cart/update', (req, res) => {
  const { itemId, quantity } = req.body;
  const item = req.session.cart.find(i => i.id === itemId);
  if (item) {
    if (parseInt(quantity) <= 0) {
      req.session.cart = req.session.cart.filter(i => i.id !== itemId);
    } else {
      item.quantity = parseInt(quantity);
    }
  }
  res.redirect('/cart');
});

// Remove from cart
app.post('/cart/remove', (req, res) => {
  const { itemId } = req.body;
  req.session.cart = req.session.cart.filter(i => i.id !== itemId);
  res.redirect('/cart');
});

// Cart page
app.get('/cart', (req, res) => {
  res.render('cart', { title: 'Your Cart — Nørd Store' });
});

// Checkout page
app.get('/checkout', (req, res) => {
  if (req.session.cart.length === 0) return res.redirect('/cart');
  res.render('checkout', { title: 'Checkout — Nørd Store' });
});

// Process order (demo — just clears the cart)
app.post('/checkout/complete', (req, res) => {
  const orderId = 'NRD-' + Date.now().toString(36).toUpperCase();
  req.session.cart = [];
  res.render('order-confirmation', {
    title: 'Order Confirmed — Nørd Store',
    orderId,
    orderDetails: req.body
  });
});

// Search
app.get('/search', (req, res) => {
  const { q } = req.query;
  const query = (q || '').toLowerCase();
  const results = products.filter(p =>
    p.name.toLowerCase().includes(query) ||
    p.description.toLowerCase().includes(query) ||
    p.category.toLowerCase().includes(query)
  );
  res.render('search', {
    title: `Search: "${q}" — Nørd Store`,
    query: q,
    results
  });
});

// 404
app.use((req, res) => {
  res.status(404).render('404', { title: 'Page Not Found — Nørd Store' });
});

// Start
app.listen(PORT, () => {
  console.log(`\n  🛍  Nørd Store is running at http://localhost:${PORT}\n`);
});
