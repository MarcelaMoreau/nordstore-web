# Nørd Store — E-Commerce Demo for UXCam SDK Practice

A minimal, clean e-commerce website built with **Node.js / Express / EJS** specifically for learning how to integrate the [UXCam](https://uxcam.com) Web SDK (and later, mobile SDKs).

## Features

- **Home page** — hero banner, featured products, category cards
- **Product listing** — filter by category, sort by price/rating
- **Product detail** — image, description, features, add-to-cart with AJAX
- **Cart** — quantity controls, order summary, free shipping threshold
- **Checkout** — multi-section form (contact, shipping, payment)
- **Order confirmation** — success screen with order ID
- **Search** — keyword search across products
- **Session-based cart** — persists across page navigation

All pages generate realistic user journeys perfect for UXCam session replay, heatmaps, and event analytics.

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start the server
npm start

# 3. Open in browser
open http://localhost:3000
```

The server runs on port `3000` by default. Set `PORT` env var to change it.

---

## Integrating UXCam Web SDK

### Step 1: Get your API key

Sign up / log into [UXCam](https://dashboard.uxcam.com) and create a new Web project to get your app key.

### Step 2: Add the SDK snippet

Open `views/partials/header.ejs` and find the placeholder comment block near the top of `<head>`. Replace it with your UXCam snippet:

```html
<script>
  // Paste your UXCam Web SDK snippet here
  // It will look something like:
  // (function(w,d,s,l,i){...})(window,document,'script','uxcam','YOUR-APP-KEY');
</script>
```

That's it — UXCam will now record sessions across all pages.

### Step 3 (optional): Add custom events

Open `public/js/main.js` and use UXCam's API to fire custom events:

```javascript
// Track product views
// UXCam.logEvent('product_viewed', { product_id: '1', product_name: 'Headphones' });

// Track add-to-cart
// UXCam.logEvent('add_to_cart', { product_id: '1', quantity: 2 });

// Track checkout
// UXCam.logEvent('checkout_started', { cart_total: 249.99 });
```

---

## Deploying

### Heroku

```bash
# Login and create app
heroku login
heroku create my-uxcam-demo

# Deploy
git init
git add .
git commit -m "Initial commit"
git push heroku main
```

### Render / Railway

Both support Node.js out of the box. Connect your GitHub repo and set:
- **Build command:** `npm install`
- **Start command:** `npm start`

### Run locally with ngrok (for mobile testing)

```bash
npm start
# In another terminal:
ngrok http 3000
```

This gives you a public URL you can open on your phone — useful for testing UXCam's mobile web tracking.

---

## Project Structure

```
├── server.js              # Express app & routes
├── package.json
├── data/
│   └── products.json      # Product catalog (8 items)
├── views/
│   ├── partials/
│   │   ├── header.ejs     # ← UXCam SDK goes here
│   │   ├── footer.ejs
│   │   └── product-card.ejs
│   ├── home.ejs
│   ├── products.ejs
│   ├── product-detail.ejs
│   ├── cart.ejs
│   ├── checkout.ejs
│   ├── order-confirmation.ejs
│   ├── search.ejs
│   └── 404.ejs
└── public/
    ├── css/style.css
    └── js/main.js         # ← Custom UXCam events go here
```

---

## Future: Mobile App

The Express server can double as an API backend. Add JSON endpoints like:

```javascript
app.get('/api/products', (req, res) => res.json(products));
app.get('/api/products/:slug', (req, res) => { ... });
app.post('/api/cart/add', (req, res) => { ... });
```

Then build a React Native or Flutter app that consumes these endpoints and integrates UXCam's mobile SDK.

---

## License

MIT — built as a learning tool, use however you like.
