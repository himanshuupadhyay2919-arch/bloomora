// =====================================================================
// BLOOMORA FLOWERS — "Beautiful Flowers. Beautiful Moments."
// Single-file full-stack e-commerce project (Node.js + Express + MongoDB)
// Built as a beginner-friendly BCA/college project.
//
// THIS IS AN EDUCATIONAL DEMO PROJECT.
// The login system below uses plain-text passwords stored in MongoDB and
// a localStorage-based "session" on the frontend. THIS IS ONLY A SIMPLE
// EDUCATIONAL LOGIN SYSTEM. IT IS NOT SECURE FOR A REAL PRODUCTION WEBSITE.
// A real production app would use hashed passwords, HTTPS, sessions/JWT,
// CSRF protection, etc.
// =====================================================================

// =============================
// IMPORTS
// =============================
const express = require("express");
const mongoose = require("mongoose");

// =============================
// APP + CONFIG
// =============================
const app = express();
const PORT = process.env.PORT || 5000;

// ⬇️ PUT YOUR MONGODB ATLAS CONNECTION STRING HERE (or use env var) ⬇️
const MONGO_URI =
  process.env.MONGO_URI ||
  "mongodb+srv://bloomora_new:bloomora123@cluster0.7bkrpbq.mongodb.net/?appName=Cluster0";

app.use(express.json());

// =============================
// DATABASE CONNECTION
// =============================
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB");
    seedProducts();
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    console.error(
      "   Please set a valid MONGO_URI (MongoDB Atlas connection string) near the top of server.js."
    );
  });

// =============================
// MONGOOSE SCHEMAS
// =============================

// ---- Users (customers) ----
const userSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  // THIS IS ONLY A SIMPLE EDUCATIONAL LOGIN SYSTEM.
  // IT IS NOT SECURE FOR A REAL PRODUCTION WEBSITE.
  password: { type: String, required: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});
const User = mongoose.model("User", userSchema);

// ---- Products ----
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  image: { type: String, required: true },
  available: { type: Boolean, default: true },
  rating: { type: Number, default: 4.5 },
  createdAt: { type: Date, default: Date.now },
});
const Product = mongoose.model("Product", productSchema);

// ---- Orders ----
const orderSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  customerName: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  items: { type: Array, required: true }, // [{ productId, name, price, qty }]
  subtotal: { type: Number, required: true },
  deliveryFee: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
  status: {
    type: String,
    enum: [
      "Pending",
      "Confirmed",
      "Preparing",
      "Out for Delivery",
      "Delivered",
      "Cancelled",
    ],
    default: "Pending",
  },
  createdAt: { type: Date, default: Date.now },
});
const Order = mongoose.model("Order", orderSchema);

// =============================
// DEFAULT PRODUCTS (SEED DATA)
// =============================
const DEFAULT_PRODUCTS = [
  {
    name: "Classic Red Roses",
    description:
      "12 fresh red roses beautifully arranged with elegant wrapping.",
    price: 599,
    category: "Romance",
    image:
      "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=800&q=80",
  },
  {
    name: "Pink Love Bouquet",
    description:
      "Beautiful pink roses arranged with soft decorative wrapping.",
    price: 699,
    category: "Anniversary",
    image:
      "https://images.unsplash.com/photo-1518895312237-a9e23508077d?w=800&q=80",
  },
  {
    name: "White Lily Elegance",
    description:
      "Elegant white lilies arranged into a premium floral bouquet.",
    price: 799,
    category: "General",
    image:
      "https://images.unsplash.com/photo-1567696911980-2eed69a46042?w=800&q=80",
  },
  {
    name: "Sunshine Yellow Bouquet",
    description:
      "Bright yellow flowers designed to bring happiness and warmth.",
    price: 549,
    category: "Congratulations",
    image:
      "https://images.unsplash.com/photo-1487070183336-b863922373d4?w=800&q=80",
  },
  {
    name: "Birthday Bliss Bouquet",
    description: "Colorful seasonal flowers perfect for birthday celebrations.",
    price: 649,
    category: "Birthday",
    image:
      "https://images.unsplash.com/photo-1520763185298-1b434c919102?w=800&q=80",
  },
  {
    name: "Premium Red Rose Basket",
    description:
      "Premium red roses beautifully arranged in an elegant flower basket.",
    price: 999,
    category: "Romance",
    image:
      "https://images.unsplash.com/photo-1455659817273-f96807779a8a?w=800&q=80",
  },
  {
    name: "Mother's Day Special",
    description:
      "A beautiful floral arrangement created specially for Mother's Day.",
    price: 849,
    category: "Mother's Day",
    image:
      "https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=800&q=80",
  },
  {
    name: "Royal Purple Bouquet",
    description: "Elegant purple flowers arranged in a premium presentation.",
    price: 749,
    category: "General",
    image:
      "https://images.unsplash.com/photo-1509587584298-0f3b3a3a1797?w=800&q=80",
  },
];

async function seedProducts() {
  try {
    const count = await Product.countDocuments();
    if (count === 0) {
      await Product.insertMany(DEFAULT_PRODUCTS);
      console.log("🌸 Default Bloomora products inserted.");
    }
  } catch (err) {
    console.error("Error seeding products:", err.message);
  }
}

// =============================
// SMALL HELPERS
// =============================
function isDbReady() {
  return mongoose.connection.readyState === 1;
}

function handleServerError(res, err, friendlyMessage) {
  console.error(err);
  res
    .status(500)
    .json({ success: false, message: friendlyMessage || "Something went wrong. Please try again." });
}

// =============================
// API ROUTES — PRODUCTS
// =============================
app.get("/api/products", async (req, res) => {
  if (!isDbReady())
    return res.status(503).json({ success: false, message: "Database not connected yet." });
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json({ success: true, products });
  } catch (err) {
    handleServerError(res, err, "Could not load products.");
  }
});

app.post("/api/products", async (req, res) => {
  try {
    const { name, description, price, category, image, available } = req.body;
    if (!name || !description || price === undefined || !category || !image) {
      return res.status(400).json({ success: false, message: "Please fill in all product fields." });
    }
    if (isNaN(price) || Number(price) <= 0) {
      return res.status(400).json({ success: false, message: "Please enter a valid price." });
    }
    const product = new Product({
      name,
      description,
      price: Number(price),
      category,
      image,
      available: available !== undefined ? available : true,
    });
    await product.save();
    res.json({ success: true, product });
  } catch (err) {
    handleServerError(res, err, "Could not add product.");
  }
});

app.put("/api/products/:id", async (req, res) => {
  try {
    const { name, description, price, category, image, available } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: "Product not found." });

    if (name) product.name = name;
    if (description) product.description = description;
    if (price !== undefined) product.price = Number(price);
    if (category) product.category = category;
    if (image) product.image = image;
    if (available !== undefined) product.available = available;

    await product.save();
    res.json({ success: true, product });
  } catch (err) {
    handleServerError(res, err, "Could not update product.");
  }
});

app.delete("/api/products/:id", async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: "Product not found." });
    res.json({ success: true, message: "Product deleted." });
  } catch (err) {
    handleServerError(res, err, "Could not delete product.");
  }
});

// =============================
// API ROUTES — AUTH (CUSTOMER)
// =============================
app.post("/api/register", async (req, res) => {
  try {
    const { userId, password, name, phone, address } = req.body;
    if (!userId || !password || !name || !phone || !address) {
      return res.status(400).json({ success: false, message: "Please fill in all fields." });
    }
    const existing = await User.findOne({ userId });
    if (existing) {
      return res.status(409).json({ success: false, message: "That User ID is already taken." });
    }
    // THIS IS ONLY A SIMPLE EDUCATIONAL LOGIN SYSTEM.
    // IT IS NOT SECURE FOR A REAL PRODUCTION WEBSITE.
    const user = new User({ userId, password, name, phone, address });
    await user.save();
    res.json({ success: true, message: "Registration successful!", user: { userId, name, phone, address } });
  } catch (err) {
    handleServerError(res, err, "Could not register. Please try again.");
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { userId, password } = req.body;
    if (!userId || !password) {
      return res.status(400).json({ success: false, message: "Please enter your User ID and password." });
    }
    const user = await User.findOne({ userId });
    // THIS IS ONLY A SIMPLE EDUCATIONAL LOGIN SYSTEM.
    // IT IS NOT SECURE FOR A REAL PRODUCTION WEBSITE.
    if (!user || user.password !== password) {
      return res.status(401).json({ success: false, message: "Invalid User ID or password." });
    }
    res.json({
      success: true,
      message: "Login successful!",
      user: { userId: user.userId, name: user.name, phone: user.phone, address: user.address },
    });
  } catch (err) {
    handleServerError(res, err, "Login failed. Please try again.");
  }
});

app.get("/api/users/:userId", async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.params.userId }).select("-password");
    if (!user) return res.status(404).json({ success: false, message: "User not found." });
    res.json({ success: true, user });
  } catch (err) {
    handleServerError(res, err, "Could not load user.");
  }
});

// =============================
// API ROUTES — ORDERS
// =============================
app.post("/api/orders", async (req, res) => {
  try {
    const { userId, customerName, phone, address, items, subtotal, deliveryFee, totalPrice } = req.body;
    if (!userId || !customerName || !phone || !address || !items || !items.length) {
      return res.status(400).json({ success: false, message: "Missing order information or empty cart." });
    }
    const order = new Order({
      userId,
      customerName,
      phone,
      address,
      items,
      subtotal,
      deliveryFee,
      totalPrice,
      status: "Pending",
    });
    await order.save();
    res.json({ success: true, message: "Order placed successfully!", order });
  } catch (err) {
    handleServerError(res, err, "Could not place order. Please try again.");
  }
});

app.get("/api/orders/:userId", async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (err) {
    handleServerError(res, err, "Could not load orders.");
  }
});

// =============================
// API ROUTES — ADMIN
// =============================
app.get("/api/admin/orders", async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (err) {
    handleServerError(res, err, "Could not load orders.");
  }
});

app.put("/api/admin/orders/:id", async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: "Order not found." });
    order.status = status;
    await order.save();
    res.json({ success: true, order });
  } catch (err) {
    handleServerError(res, err, "Could not update order status.");
  }
});

app.get("/api/admin/customers", async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (err) {
    handleServerError(res, err, "Could not load customers.");
  }
});

app.get("/api/admin/stats", async (req, res) => {
  try {
    const [totalProducts, totalOrders, totalCustomers, pendingOrders] = await Promise.all([
      Product.countDocuments(),
      Order.countDocuments(),
      User.countDocuments(),
      Order.countDocuments({ status: "Pending" }),
    ]);
    res.json({ success: true, stats: { totalProducts, totalOrders, totalCustomers, pendingOrders } });
  } catch (err) {
    handleServerError(res, err, "Could not load stats.");
  }
});

// Admin login is intentionally a fixed demo credential check —
// NOT JWT, NOT OAuth, NOT a real auth system. Educational demo only.
app.post("/api/admin/login", (req, res) => {
  const { adminId, password } = req.body;
  if (adminId === "admin" && password === "admin123") {
    return res.json({ success: true, message: "Login successful!" });
  }
  res.status(401).json({ success: false, message: "Invalid admin credentials." });
});

// =============================
// SHARED CSS (used by both customer + admin pages)
// =============================
const SHARED_CSS = `
:root{
  --ivory:#FBF7F1;
  --cream:#F6EFE6;
  --blush:#F3D9DD;
  --rose:#D98A9C;
  --burgundy:#7A2E3B;
  --burgundy-dark:#5E212B;
  --sage:#8A9A82;
  --charcoal:#2B2622;
  --white:#FFFFFF;
  --shadow-sm: 0 2px 10px rgba(43,38,34,0.06);
  --shadow-md: 0 10px 30px rgba(43,38,34,0.10);
  --shadow-lg: 0 20px 50px rgba(43,38,34,0.16);
  --radius-lg: 20px;
  --radius-md: 14px;
  --radius-sm: 10px;
  --ease: cubic-bezier(.4,0,.2,1);
}
*{box-sizing:border-box;}
html{scroll-behavior:smooth;}
body{
  margin:0;
  font-family:'Poppins', sans-serif;
  background:var(--ivory);
  color:var(--charcoal);
  -webkit-font-smoothing:antialiased;
}
h1,h2,h3,h4{
  font-family:'Playfair Display', serif;
  margin:0;
  color:var(--charcoal);
  line-height:1.15;
}
p{margin:0; line-height:1.7; color:#5c5650;}
a{text-decoration:none; color:inherit;}
img{max-width:100%; display:block;}
button{font-family:'Poppins', sans-serif; cursor:pointer; border:none;}
input,select,textarea{font-family:'Poppins', sans-serif;}
.container{max-width:1300px; margin:0 auto; padding:0 32px;}
@media(max-width:768px){ .container{padding:0 20px;} }

/* focus visibility for accessibility */
a:focus-visible, button:focus-visible, input:focus-visible, select:focus-visible, textarea:focus-visible{
  outline:2px solid var(--burgundy); outline-offset:2px;
}

@media (prefers-reduced-motion: reduce){
  *{animation-duration:0.001ms !important; animation-iteration-count:1 !important; transition-duration:0.001ms !important; scroll-behavior:auto !important;}
}

/* ---------- Buttons ---------- */
.btn{
  display:inline-flex; align-items:center; justify-content:center; gap:8px;
  padding:15px 32px; border-radius:999px; font-weight:600; font-size:15px;
  transition:transform .25s var(--ease), box-shadow .25s var(--ease), background .25s var(--ease), color .25s var(--ease);
}
.btn:active{ transform:scale(0.97); }
.btn-primary{ background:var(--burgundy); color:var(--white); box-shadow:var(--shadow-sm); }
.btn-primary:hover{ background:var(--burgundy-dark); transform:translateY(-2px); box-shadow:var(--shadow-md); }
.btn-outline{ background:transparent; color:var(--burgundy); border:1.5px solid var(--burgundy); }
.btn-outline:hover{ background:var(--burgundy); color:var(--white); transform:translateY(-2px); }
.btn-block{ width:100%; }
.btn-sm{ padding:10px 18px; font-size:13px; }

/* ---------- Navbar ---------- */
.navbar{
  position:sticky; top:0; z-index:200;
  background:rgba(251,247,241,0.75);
  backdrop-filter:blur(14px);
  -webkit-backdrop-filter:blur(14px);
  transition:box-shadow .3s var(--ease), background .3s var(--ease);
}
.navbar.scrolled{ background:rgba(251,247,241,0.95); box-shadow:var(--shadow-sm); }
.nav-inner{ display:flex; align-items:center; justify-content:space-between; padding:18px 0; }
.logo{ font-family:'Playfair Display', serif; font-size:24px; font-weight:700; color:var(--burgundy); letter-spacing:0.5px; }
.logo span{ color:var(--sage); }
.nav-links{ display:flex; gap:36px; align-items:center; list-style:none; margin:0; padding:0; }
.nav-links a{ position:relative; font-size:14.5px; font-weight:500; color:var(--charcoal); padding:4px 0; }
.nav-links a::after{
  content:''; position:absolute; left:0; bottom:-2px; width:0; height:2px; background:var(--burgundy);
  transition:width .3s var(--ease);
}
.nav-links a:hover::after, .nav-links a.active::after{ width:100%; }
.nav-actions{ display:flex; align-items:center; gap:18px; }
.icon-btn{ position:relative; background:none; font-size:20px; color:var(--charcoal); transition:color .2s; }
.icon-btn:hover{ color:var(--burgundy); }
.cart-count{
  position:absolute; top:-8px; right:-10px; background:var(--burgundy); color:#fff; font-size:11px;
  min-width:18px; height:18px; border-radius:999px; display:flex; align-items:center; justify-content:center;
  font-weight:700; transition:transform .3s var(--ease);
}
.cart-count.bump{ animation:bump .35s var(--ease); }
@keyframes bump{ 0%{transform:scale(1);} 40%{transform:scale(1.5);} 100%{transform:scale(1);} }
.hamburger{ display:none; background:none; flex-direction:column; gap:5px; }
.hamburger span{ width:24px; height:2px; background:var(--charcoal); border-radius:2px; transition:.3s; }

/* Mobile nav */
.mobile-menu{
  position:fixed; inset:0; z-index:300; display:none;
}
.mobile-menu.open{ display:block; }
.mobile-overlay{
  position:absolute; inset:0; background:rgba(43,38,34,0.4); opacity:0; transition:opacity .3s var(--ease);
}
.mobile-menu.open .mobile-overlay{ opacity:1; }
.mobile-panel{
  position:absolute; top:0; right:0; height:100%; width:78%; max-width:340px; background:var(--ivory);
  padding:30px 28px; transform:translateX(100%); transition:transform .35s var(--ease);
  display:flex; flex-direction:column; gap:26px; box-shadow:var(--shadow-lg);
}
.mobile-menu.open .mobile-panel{ transform:translateX(0); }
.mobile-panel a{ font-size:19px; font-weight:600; opacity:0; transform:translateY(8px); transition:.35s var(--ease); }
.mobile-menu.open .mobile-panel a{ opacity:1; transform:translateY(0); }
.mobile-close{ align-self:flex-end; background:none; font-size:26px; color:var(--charcoal); }

@media(max-width:900px){
  .nav-links{ display:none; }
  .hamburger{ display:flex; }
}

/* ---------- Hero ---------- */
.hero{ padding:70px 0 40px; overflow:hidden; }
.hero-grid{ display:grid; grid-template-columns:1.05fr 1fr; gap:60px; align-items:center; }
.hero-label{
  display:inline-block; font-size:12.5px; font-weight:600; letter-spacing:1.5px; color:var(--burgundy);
  background:var(--blush); padding:8px 16px; border-radius:999px; opacity:0; animation:fadeIn .6s var(--ease) .1s forwards;
}
.hero h1{ font-size:52px; margin:22px 0 20px; opacity:0; transform:translateY(24px); animation:slideUp .7s var(--ease) .3s forwards; }
.hero p.hero-desc{ font-size:17px; max-width:460px; margin-bottom:32px; opacity:0; animation:fadeIn .7s var(--ease) .55s forwards; }
.hero-buttons{ display:flex; gap:16px; flex-wrap:wrap; opacity:0; animation:fadeIn .7s var(--ease) .75s forwards; }
.hero-visual{ position:relative; opacity:0; transform:scale(0.94); animation:scaleIn .8s var(--ease) .35s forwards; }
.hero-visual img{ border-radius:var(--radius-lg); box-shadow:var(--shadow-lg); width:100%; height:520px; object-fit:cover; }
.hero-blob{
  position:absolute; width:170px; height:170px; border-radius:50%; background:var(--blush); z-index:-1;
  top:-30px; right:-30px; opacity:.7; animation:float 6s ease-in-out infinite;
}
.hero-blob.two{ background:var(--sage); opacity:.25; width:130px; height:130px; bottom:-20px; left:-20px; top:auto; right:auto; animation-delay:1.2s; }
@keyframes float{ 0%,100%{ transform:translateY(0);} 50%{ transform:translateY(-16px);} }
@keyframes fadeIn{ from{opacity:0;} to{opacity:1;} }
@keyframes slideUp{ from{opacity:0; transform:translateY(24px);} to{opacity:1; transform:translateY(0);} }
@keyframes scaleIn{ from{opacity:0; transform:scale(0.94);} to{opacity:1; transform:scale(1);} }

@media(max-width:900px){
  .hero-grid{ grid-template-columns:1fr; }
  .hero h1{ font-size:38px; }
  .hero-visual{ order:-1; }
  .hero-visual img{ height:320px; }
}

/* ---------- Feature strip ---------- */
.feature-strip{ background:var(--white); padding:36px 0; border-top:1px solid #eee2d6; border-bottom:1px solid #eee2d6; }
.feature-strip .container{ display:grid; grid-template-columns:repeat(4,1fr); gap:24px; }
.feature-item{ display:flex; align-items:center; gap:14px; }
.feature-item .ficon{ font-size:26px; color:var(--burgundy); }
.feature-item h4{ font-size:15px; margin-bottom:4px; }
.feature-item p{ font-size:13px; }
@media(max-width:900px){ .feature-strip .container{ grid-template-columns:repeat(2,1fr); } }
@media(max-width:520px){ .feature-strip .container{ grid-template-columns:1fr; } }

/* ---------- Sections ---------- */
.section{ padding:90px 0; }
.section-head{ text-align:center; max-width:600px; margin:0 auto 52px; }
.section-head h2{ font-size:36px; margin-bottom:14px; }
.section-head p{ font-size:15.5px; }
.reveal{ opacity:0; transform:translateY(30px); transition:opacity .7s var(--ease), transform .7s var(--ease); }
.reveal.in{ opacity:1; transform:translateY(0); }

/* ---------- Occasion cards ---------- */
.occasion-grid{ display:grid; grid-template-columns:repeat(3,1fr); gap:26px; }
.occasion-card{
  position:relative; border-radius:var(--radius-md); overflow:hidden; height:260px;
  box-shadow:var(--shadow-sm); transition:transform .4s var(--ease), box-shadow .4s var(--ease);
}
.occasion-card:hover{ transform:translateY(-6px); box-shadow:var(--shadow-lg); }
.occasion-card img{ width:100%; height:100%; object-fit:cover; transition:transform .5s var(--ease); }
.occasion-card:hover img{ transform:scale(1.07); }
.occasion-overlay{
  position:absolute; inset:0; background:linear-gradient(to top, rgba(43,38,34,0.75), rgba(43,38,34,0.05) 60%);
  display:flex; flex-direction:column; justify-content:flex-end; padding:22px; color:#fff;
}
.occasion-overlay h4{ color:#fff; font-size:20px; margin-bottom:4px; }
.occasion-overlay p{ color:#f1e8e0; font-size:13px; margin-bottom:10px; }
.occasion-arrow{ font-size:18px; transition:transform .3s var(--ease); }
.occasion-card:hover .occasion-arrow{ transform:translateX(6px); }
@media(max-width:900px){ .occasion-grid{ grid-template-columns:repeat(2,1fr);} }
@media(max-width:560px){ .occasion-grid{ grid-template-columns:1fr;} }

/* ---------- Product cards ---------- */
.product-grid{ display:grid; grid-template-columns:repeat(4,1fr); gap:26px; }
.product-card{
  background:var(--white); border-radius:var(--radius-md); overflow:hidden; box-shadow:var(--shadow-sm);
  transition:transform .35s var(--ease), box-shadow .35s var(--ease); display:flex; flex-direction:column;
}
.product-card:hover{ transform:translateY(-6px); box-shadow:var(--shadow-md); }
.product-thumb{ position:relative; height:210px; overflow:hidden; cursor:pointer; }
.product-thumb img{ width:100%; height:100%; object-fit:cover; transition:transform .5s var(--ease); }
.product-card:hover .product-thumb img{ transform:scale(1.05); }
.product-cat{ position:absolute; top:12px; left:12px; background:rgba(255,255,255,0.92); color:var(--burgundy); font-size:11px; font-weight:700; padding:5px 11px; border-radius:999px; letter-spacing:.3px; }
.product-body{ padding:18px 18px 20px; display:flex; flex-direction:column; gap:8px; flex:1; }
.product-body h4{ font-size:17px; cursor:pointer; }
.product-body p.pdesc{ font-size:13px; min-height:38px; }
.product-rating{ font-size:12.5px; color:var(--sage); font-weight:600; }
.product-footer{ display:flex; align-items:center; justify-content:space-between; margin-top:6px; }
.price{ font-size:19px; font-weight:700; color:var(--burgundy); font-family:'Playfair Display', serif; }
.add-cart-btn{
  background:var(--burgundy); color:#fff; padding:10px 16px; border-radius:999px; font-size:13px; font-weight:600;
  transition:transform .25s var(--ease), background .25s var(--ease);
}
.add-cart-btn:hover{ background:var(--burgundy-dark); transform:translateY(-2px); }
.add-cart-btn:active{ transform:scale(0.94); }
@media(max-width:1050px){ .product-grid{ grid-template-columns:repeat(3,1fr);} }
@media(max-width:760px){ .product-grid{ grid-template-columns:repeat(2,1fr);} }
@media(max-width:480px){ .product-grid{ grid-template-columns:1fr;} }

/* skeleton loading */
.skeleton-card{ background:var(--white); border-radius:var(--radius-md); overflow:hidden; box-shadow:var(--shadow-sm); }
.skeleton-block{ background:linear-gradient(90deg,#eee2d6 25%,#f4ece2 37%,#eee2d6 63%); background-size:400% 100%; animation:shimmer 1.4s ease infinite; }
.skeleton-thumb{ height:210px; }
.skeleton-line{ height:12px; margin:14px 18px; border-radius:6px; }
@keyframes shimmer{ 0%{background-position:100% 50%;} 100%{background-position:0 50%;} }

/* ---------- About ---------- */
.about-grid{ display:grid; grid-template-columns:1fr 1fr; gap:60px; align-items:center; }
.about-grid img{ border-radius:var(--radius-lg); box-shadow:var(--shadow-md); height:420px; object-fit:cover; width:100%; }
.about-text h2{ font-size:34px; margin-bottom:18px; }
.about-text p{ margin-bottom:14px; }
@media(max-width:900px){ .about-grid{ grid-template-columns:1fr; } .about-grid img{ order:-1; height:280px; } }

/* why bloomora */
.why-grid{ display:grid; grid-template-columns:repeat(4,1fr); gap:24px; }
.why-card{ background:var(--white); padding:32px 24px; border-radius:var(--radius-md); text-align:center; box-shadow:var(--shadow-sm); transition:transform .3s var(--ease), box-shadow .3s var(--ease); }
.why-card:hover{ transform:translateY(-6px); box-shadow:var(--shadow-md); }
.why-card .wicon{ font-size:30px; color:var(--sage); margin-bottom:14px; }
.why-card h4{ font-size:16px; margin-bottom:8px; }
.why-card p{ font-size:13px; }
@media(max-width:900px){ .why-grid{ grid-template-columns:repeat(2,1fr);} }
@media(max-width:520px){ .why-grid{ grid-template-columns:1fr;} }

/* testimonials */
.testi-grid{ display:grid; grid-template-columns:repeat(3,1fr); gap:26px; }
.testi-card{ background:var(--white); border-radius:var(--radius-md); padding:30px; box-shadow:var(--shadow-sm); transition:transform .3s var(--ease); }
.testi-card:hover{ transform:translateY(-5px); }
.testi-stars{ color:#e0a13a; margin-bottom:14px; font-size:14px; }
.testi-quote{ font-style:italic; margin-bottom:18px; color:var(--charcoal); }
.testi-name{ font-weight:700; font-size:14px; }
@media(max-width:900px){ .testi-grid{ grid-template-columns:1fr;} }

/* contact */
.contact-grid{ display:grid; grid-template-columns:1fr 1.2fr; gap:50px; }
.contact-info-item{ display:flex; gap:14px; margin-bottom:22px; align-items:flex-start; }
.contact-info-item .cicon{ color:var(--burgundy); font-size:20px; margin-top:2px; }
.contact-info-item h4{ font-size:15px; margin-bottom:3px; }
.contact-form{ background:var(--white); padding:34px; border-radius:var(--radius-md); box-shadow:var(--shadow-sm); display:flex; flex-direction:column; gap:18px; }
@media(max-width:900px){ .contact-grid{ grid-template-columns:1fr;} }

/* ---------- Form fields ---------- */
.field{ display:flex; flex-direction:column; gap:7px; }
.field label{ font-size:13px; font-weight:600; color:var(--charcoal); }
.field .input-wrap{ position:relative; }
.field input, .field select, .field textarea{
  width:100%; padding:13px 16px; border:1.5px solid #e7ddce; border-radius:var(--radius-sm); font-size:14.5px;
  background:var(--white); transition:border-color .25s var(--ease), box-shadow .25s var(--ease); color:var(--charcoal);
}
.field input:focus, .field select:focus, .field textarea:focus{
  border-color:var(--burgundy); box-shadow:0 0 0 4px rgba(122,46,59,0.10); outline:none;
}
.field .toggle-pass{ position:absolute; right:14px; top:50%; transform:translateY(-50%); background:none; color:#999; font-size:15px; }
.field-error{ color:#b53939; font-size:12.5px; display:none; }
.field.has-error input{ border-color:#b53939; }
.field.has-error .field-error{ display:block; }

/* ---------- Footer ---------- */
footer{ background:var(--charcoal); color:#e7ded4; padding:64px 0 22px; margin-top:40px; }
.footer-grid{ display:grid; grid-template-columns:1.4fr 1fr 1fr 1fr; gap:40px; margin-bottom:40px; }
.footer-col h4{ color:#fff; font-size:15px; margin-bottom:16px; font-family:'Playfair Display', serif; }
.footer-col p{ color:#b8ada0; font-size:13.5px; }
.footer-col ul{ list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:10px; }
.footer-col a{ color:#c9beb0; font-size:13.5px; transition:color .2s; }
.footer-col a:hover{ color:#fff; }
.footer-bottom{ border-top:1px solid rgba(255,255,255,0.1); padding-top:20px; text-align:center; font-size:12.5px; color:#9a8f80; }
@media(max-width:900px){ .footer-grid{ grid-template-columns:1fr 1fr; } }
@media(max-width:520px){ .footer-grid{ grid-template-columns:1fr; } }

/* ---------- Toasts ---------- */
#toast-container{ position:fixed; top:22px; right:22px; z-index:900; display:flex; flex-direction:column; gap:12px; }
.toast{
  background:var(--white); color:var(--charcoal); padding:14px 20px; border-radius:var(--radius-sm); box-shadow:var(--shadow-md);
  display:flex; align-items:center; gap:10px; font-size:14px; font-weight:500; min-width:240px;
  transform:translateX(120%); opacity:0; transition:transform .4s var(--ease), opacity .4s var(--ease);
  border-left:4px solid var(--sage);
}
.toast.show{ transform:translateX(0); opacity:1; }
.toast.error{ border-left-color:#b53939; }
@media(max-width:520px){ #toast-container{ left:16px; right:16px; } .toast{ min-width:0; } }

/* ---------- Modal ---------- */
.modal-overlay{
  position:fixed; inset:0; background:rgba(43,38,34,0.5); display:none; align-items:center; justify-content:center;
  z-index:500; padding:20px; opacity:0; transition:opacity .3s var(--ease);
}
.modal-overlay.open{ display:flex; opacity:1; }
.modal-box{
  background:var(--white); border-radius:var(--radius-lg); max-width:560px; width:100%; max-height:88vh; overflow-y:auto;
  padding:32px; transform:scale(0.92) translateY(10px); transition:transform .32s var(--ease); box-shadow:var(--shadow-lg);
}
.modal-overlay.open .modal-box{ transform:scale(1) translateY(0); }
.modal-close{ float:right; background:none; font-size:22px; color:#999; }
.modal-close:hover{ color:var(--charcoal); }

/* ---------- Shop page ---------- */
.shop-hero{ padding:56px 0 30px; text-align:center; }
.shop-hero h1{ font-size:38px; margin-bottom:10px; }
.shop-controls{ display:flex; gap:14px; flex-wrap:wrap; align-items:center; justify-content:space-between; margin-bottom:34px; }
.shop-search{ flex:1; min-width:220px; position:relative; }
.shop-search input{ width:100%; padding:13px 16px 13px 42px; border-radius:999px; border:1.5px solid #e7ddce; font-size:14px; }
.shop-search .search-icon{ position:absolute; left:16px; top:50%; transform:translateY(-50%); color:#a89b89; }
.chip-row{ display:flex; gap:10px; flex-wrap:wrap; }
.chip{ padding:9px 18px; border-radius:999px; font-size:13px; font-weight:600; background:var(--white); border:1.5px solid #e7ddce; color:var(--charcoal); transition:.25s var(--ease); }
.chip.active, .chip:hover{ background:var(--burgundy); color:#fff; border-color:var(--burgundy); }
.sort-select{ padding:11px 16px; border-radius:999px; border:1.5px solid #e7ddce; background:var(--white); font-size:13.5px; }
.empty-state{ text-align:center; padding:70px 20px; }
.empty-state .eicon{ font-size:56px; margin-bottom:18px; }
.empty-state h3{ font-size:22px; margin-bottom:10px; }
.empty-state p{ margin-bottom:24px; }

/* ---------- Cart page ---------- */
.cart-layout{ display:grid; grid-template-columns:1.6fr 1fr; gap:32px; align-items:flex-start; }
.cart-item{ display:flex; gap:16px; background:var(--white); border-radius:var(--radius-md); padding:16px; margin-bottom:14px; box-shadow:var(--shadow-sm); align-items:center; }
.cart-item img{ width:84px; height:84px; border-radius:12px; object-fit:cover; }
.cart-item-info{ flex:1; }
.cart-item-info h4{ font-size:15.5px; margin-bottom:4px; }
.qty-control{ display:flex; align-items:center; gap:10px; margin-top:8px; }
.qty-btn{ width:28px; height:28px; border-radius:50%; background:var(--cream); font-size:15px; font-weight:700; transition:.2s; }
.qty-btn:hover{ background:var(--blush); }
.remove-item{ background:none; color:#b53939; font-size:12.5px; font-weight:600; margin-top:8px; }
.summary-box{ background:var(--white); border-radius:var(--radius-md); padding:26px; box-shadow:var(--shadow-sm); position:sticky; top:100px; }
.summary-row{ display:flex; justify-content:space-between; font-size:14.5px; margin-bottom:14px; color:#5c5650; }
.summary-row.total{ font-size:19px; font-weight:700; color:var(--charcoal); border-top:1px solid #eee2d6; padding-top:16px; margin-top:6px; }
@media(max-width:860px){ .cart-layout{ grid-template-columns:1fr; } .summary-box{ position:static; } }

/* ---------- Auth pages ---------- */
.auth-wrap{ max-width:460px; margin:60px auto; background:var(--white); border-radius:var(--radius-lg); padding:44px; box-shadow:var(--shadow-md); }
.auth-wrap h2{ font-size:28px; margin-bottom:6px; text-align:center; }
.auth-wrap > p{ text-align:center; margin-bottom:28px; font-size:14px; }
.auth-switch{ text-align:center; margin-top:20px; font-size:14px; }
.auth-switch a{ color:var(--burgundy); font-weight:600; }

/* ---------- Dashboard ---------- */
.dash-welcome{ margin-bottom:34px; }
.dash-welcome h2{ font-size:30px; }
.profile-card{ background:var(--white); border-radius:var(--radius-md); padding:26px; box-shadow:var(--shadow-sm); margin-bottom:30px; display:grid; grid-template-columns:repeat(4,1fr); gap:20px; }
.profile-card div span{ display:block; font-size:12px; color:#a89b89; margin-bottom:5px; text-transform:uppercase; letter-spacing:.5px; }
.profile-card div strong{ font-size:15px; }
.stat-row{ display:grid; grid-template-columns:repeat(3,1fr); gap:20px; margin-bottom:36px; }
.stat-card{ background:var(--white); border-radius:var(--radius-md); padding:24px; text-align:center; box-shadow:var(--shadow-sm); }
.stat-card h3{ font-size:32px; color:var(--burgundy); }
.stat-card p{ font-size:13px; margin-top:6px; }
.order-card{ background:var(--white); border-radius:var(--radius-md); padding:20px 22px; margin-bottom:14px; box-shadow:var(--shadow-sm); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; }
.order-id{ font-weight:700; font-size:14.5px; }
.order-date{ font-size:12.5px; color:#a89b89; }
.status-badge{ padding:6px 14px; border-radius:999px; font-size:12px; font-weight:700; }
.status-Pending{ background:#fdf1d6; color:#8a6d1c; }
.status-Confirmed{ background:#dcecf9; color:#1f5c8a; }
.status-Preparing{ background:#f0e2fb; color:#6a2fa0; }
.status-Out-for-Delivery{ background:#ffe6d1; color:#a1531b; }
.status-Delivered{ background:#dcf5e3; color:#217a45; }
.status-Cancelled{ background:#fbdcdc; color:#a23030; }
@media(max-width:800px){ .profile-card{ grid-template-columns:1fr 1fr; } .stat-row{ grid-template-columns:1fr; } }

/* ---------- Checkout / confirmation ---------- */
.checkout-layout{ display:grid; grid-template-columns:1.4fr 1fr; gap:32px; }
.order-review-item{ display:flex; justify-content:space-between; font-size:14px; margin-bottom:10px; color:#5c5650; }
.success-box{ max-width:520px; margin:60px auto; text-align:center; background:var(--white); border-radius:var(--radius-lg); padding:50px 36px; box-shadow:var(--shadow-md); }
.success-icon{ font-size:60px; margin-bottom:18px; }
@media(max-width:860px){ .checkout-layout{ grid-template-columns:1fr; } }

/* ---------- Admin layout ---------- */
.admin-body{ background:var(--cream); min-height:100vh; }
.admin-wrap{ display:flex; min-height:100vh; }
.admin-sidebar{ width:250px; background:var(--charcoal); color:#e7ded4; padding:28px 20px; display:flex; flex-direction:column; gap:6px; position:sticky; top:0; height:100vh; }
.admin-logo{ font-family:'Playfair Display', serif; font-size:21px; color:#fff; margin-bottom:34px; }
.admin-logo span{ color:var(--rose); }
.admin-nav-item{ padding:13px 16px; border-radius:10px; font-size:14.5px; font-weight:500; display:flex; align-items:center; gap:10px; transition:.2s; color:#c9beb0; }
.admin-nav-item:hover{ background:rgba(255,255,255,0.06); color:#fff; }
.admin-nav-item.active{ background:var(--burgundy); color:#fff; }
.admin-main{ flex:1; padding:28px 34px; }
.admin-topbar{ display:flex; justify-content:space-between; align-items:center; margin-bottom:28px; }
.admin-topbar h2{ font-size:24px; }
.admin-search{ padding:10px 16px; border-radius:999px; border:1.5px solid #e7ddce; font-size:13.5px; width:220px; }
.admin-stats{ display:grid; grid-template-columns:repeat(4,1fr); gap:22px; margin-bottom:30px; }
.admin-stat-card{ background:var(--white); border-radius:var(--radius-md); padding:24px; box-shadow:var(--shadow-sm); opacity:0; transform:translateY(16px); animation:slideUp .5s var(--ease) forwards; }
.admin-stat-card h3{ font-size:28px; color:var(--burgundy); }
.admin-stat-card p{ font-size:13px; margin-top:6px; }
.admin-card{ background:var(--white); border-radius:var(--radius-md); padding:26px; box-shadow:var(--shadow-sm); }
.admin-table{ width:100%; border-collapse:collapse; font-size:13.5px; }
.admin-table th{ text-align:left; padding:12px 14px; color:#a89b89; font-size:12px; text-transform:uppercase; letter-spacing:.4px; border-bottom:2px solid #f0e8dd; }
.admin-table td{ padding:14px; border-bottom:1px solid #f4eee5; vertical-align:middle; }
.admin-table img{ width:44px; height:44px; border-radius:8px; object-fit:cover; }
.table-actions{ display:flex; gap:8px; }
.icon-action{ background:var(--cream); width:32px; height:32px; border-radius:8px; display:flex; align-items:center; justify-content:center; transition:.2s; font-size:14px; }
.icon-action:hover{ background:var(--blush); }
.icon-action.danger:hover{ background:#fbdcdc; }
.status-select{ padding:8px 12px; border-radius:8px; border:1.5px solid #e7ddce; font-size:13px; }
@media(max-width:1000px){ .admin-stats{ grid-template-columns:repeat(2,1fr); } .admin-sidebar{ position:fixed; left:-260px; z-index:400; transition:.3s; } .admin-sidebar.open{ left:0; } .admin-table{ display:block; overflow-x:auto; white-space:nowrap; } }
.admin-login-wrap{ min-height:100vh; display:flex; align-items:center; justify-content:center; background:var(--ivory); }

.hidden{ display:none !important; }
`;

// =============================
// SHARED CLIENT JS HELPERS (toast, mobile menu, scroll reveal, navbar scroll)
// =============================
const COMMON_JS = `
// ---- Toast notifications ----
function showToast(message, type){
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = 'toast' + (type === 'error' ? ' error' : '');
  toast.innerHTML = '<span>' + (type === 'error' ? '⚠️' : '🌸') + '</span><span>' + message + '</span>';
  container.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('show'));
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 400);
  }, 3200);
}

// ---- Navbar scroll effect ----
function initNavbarScroll(){
  const nav = document.getElementById('navbar');
  if(!nav) return;
  window.addEventListener('scroll', () => {
    if(window.scrollY > 20) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  });
}

// ---- Mobile menu ----
function initMobileMenu(){
  const hamburger = document.getElementById('hamburger');
  const menu = document.getElementById('mobile-menu');
  const closeBtn = document.getElementById('mobile-close');
  const overlay = menu ? menu.querySelector('.mobile-overlay') : null;
  if(!hamburger || !menu) return;
  hamburger.addEventListener('click', () => menu.classList.add('open'));
  closeBtn.addEventListener('click', () => menu.classList.remove('open'));
  overlay.addEventListener('click', () => menu.classList.remove('open'));
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => menu.classList.remove('open')));
}

// ---- Scroll reveal using IntersectionObserver ----
function initScrollReveal(){
  const items = document.querySelectorAll('.reveal');
  if(!items.length) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if(entry.isIntersecting){
        setTimeout(() => entry.target.classList.add('in'), i * 60);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  items.forEach(item => observer.observe(item));
}

// ---- Cart helpers (localStorage) ----
function getCart(){
  try { return JSON.parse(localStorage.getItem('cart')) || []; } catch(e){ return []; }
}
function saveCart(cart){
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
}
function addToCart(product, qty){
  qty = qty || 1;
  const cart = getCart();
  const existing = cart.find(i => i.productId === product._id);
  if(existing){ existing.qty += qty; }
  else { cart.push({ productId: product._id, name: product.name, price: product.price, image: product.image, qty }); }
  saveCart(cart);
  bumpCartCount();
  showToast('Bouquet added to cart!');
}
function removeFromCart(productId){
  let cart = getCart().filter(i => i.productId !== productId);
  saveCart(cart);
  showToast('Product removed from cart.');
  renderCartPage && renderCartPage();
}
function changeQty(productId, delta){
  let cart = getCart();
  const item = cart.find(i => i.productId === productId);
  if(!item) return;
  item.qty += delta;
  if(item.qty <= 0){ cart = cart.filter(i => i.productId !== productId); }
  saveCart(cart);
  renderCartPage && renderCartPage();
}
function cartCountTotal(){
  return getCart().reduce((sum, i) => sum + i.qty, 0);
}
function updateCartCount(){
  const el = document.getElementById('cart-count');
  if(el) el.textContent = cartCountTotal();
}
function bumpCartCount(){
  const el = document.getElementById('cart-count');
  if(!el) return;
  updateCartCount();
  el.classList.remove('bump');
  void el.offsetWidth;
  el.classList.add('bump');
}

// ---- Session helpers ----
function getLoggedInUser(){
  try { return JSON.parse(localStorage.getItem('loggedInUser')); } catch(e){ return null; }
}
function setLoggedInUser(user){
  localStorage.setItem('loggedInUser', JSON.stringify(user));
}
function logoutUser(){
  localStorage.removeItem('loggedInUser');
  showToast('Logged out.');
  setTimeout(() => window.location.href = '/', 500);
}

document.addEventListener('DOMContentLoaded', () => {
  initNavbarScroll();
  initMobileMenu();
  initScrollReveal();
  updateCartCount();
});
`;

// =============================
// FRONTEND HTML — CUSTOMER SITE ("/")
// =============================
function renderCustomerPage() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Bloomora Flowers — Beautiful Flowers. Beautiful Moments.</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>${SHARED_CSS}</style>
</head>
<body>

<div id="toast-container"></div>

<!-- ============ NAVBAR ============ -->
<nav class="navbar" id="navbar">
  <div class="container nav-inner">
    <a href="/" class="logo">Bloomora <span>Flowers</span></a>
    <ul class="nav-links">
      <li><a href="/#home">Home</a></li>
      <li><a href="/#shop-view" onclick="showView('shop')">Shop</a></li>
      <li><a href="/#about">About</a></li>
      <li><a href="/#contact">Contact</a></li>
    </ul>
    <div class="nav-actions">
      <a class="icon-btn" href="/#dashboard" onclick="showView('dashboard')" aria-label="Account">👤</a>
      <a class="icon-btn" href="/#cart" onclick="showView('cart')" aria-label="Cart">
        🛍️<span class="cart-count" id="cart-count">0</span>
      </a>
      <button class="hamburger" id="hamburger" aria-label="Open menu"><span></span><span></span><span></span></button>
    </div>
  </div>
</nav>

<div class="mobile-menu" id="mobile-menu">
  <div class="mobile-overlay"></div>
  <div class="mobile-panel">
    <button class="mobile-close" id="mobile-close" aria-label="Close menu">×</button>
    <a href="#" onclick="showView('home')">Home</a>
    <a href="#" onclick="showView('shop')">Shop</a>
    <a href="#" onclick="showView('home'); setTimeout(()=>document.getElementById('about').scrollIntoView(),100)">About</a>
    <a href="#" onclick="showView('home'); setTimeout(()=>document.getElementById('contact').scrollIntoView(),100)">Contact</a>
    <a href="#" onclick="showView('cart')">Cart</a>
    <a href="#" onclick="showView('dashboard')">My Account</a>
  </div>
</div>

<!-- ============ VIEW: HOME ============ -->
<div id="view-home">

  <section class="hero" id="home">
    <div class="container hero-grid">
      <div>
        <span class="hero-label">FRESH FLOWERS • HANDCRAFTED WITH LOVE</span>
        <h1>Make Every Moment Bloom.</h1>
        <p class="hero-desc">Beautiful handcrafted bouquets made to turn ordinary moments into unforgettable memories.</p>
        <div class="hero-buttons">
          <a href="#" class="btn btn-primary" onclick="showView('shop')">Shop Bouquets</a>
          <a href="#occasion" class="btn btn-outline">Explore Collections</a>
        </div>
      </div>
      <div class="hero-visual">
        <div class="hero-blob"></div>
        <div class="hero-blob two"></div>
        <img src="https://images.unsplash.com/photo-1487070183336-b863922373d4?w=900&q=80" alt="Premium flower bouquet" />
      </div>
    </div>
  </section>

  <section class="feature-strip">
    <div class="container">
      <div class="feature-item"><span class="ficon">🌼</span><div><h4>Fresh Every Day</h4><p>Fresh flowers selected daily.</p></div></div>
      <div class="feature-item"><span class="ficon">✂️</span><div><h4>Handcrafted</h4><p>Every bouquet arranged with care.</p></div></div>
      <div class="feature-item"><span class="ficon">🚚</span><div><h4>Fast Delivery</h4><p>Reliable flower delivery.</p></div></div>
      <div class="feature-item"><span class="ficon">🎁</span><div><h4>Beautifully Wrapped</h4><p>Premium presentation for every order.</p></div></div>
    </div>
  </section>

  <section class="section" id="occasion">
    <div class="container">
      <div class="section-head reveal">
        <h2>Flowers For Every Moment</h2>
        <p>Find the perfect arrangement for life's special occasions.</p>
      </div>
      <div class="occasion-grid">
        ${[
          ["Birthday", "Colorful blooms to celebrate another year.", "https://images.unsplash.com/photo-1520763185298-1b434c919102?w=600&q=80"],
          ["Anniversary", "Romantic arrangements for milestones.", "https://images.unsplash.com/photo-1518895312237-a9e23508077d?w=600&q=80"],
          ["Romance", "Classic roses to say it best.", "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=600&q=80"],
          ["Wedding", "Elegant florals for the big day.", "https://images.unsplash.com/photo-1519741497674-611481863552?w=600&q=80"],
          ["Mother's Day", "Thoughtful bouquets to say thank you.", "https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=600&q=80"],
          ["Congratulations", "Bright blooms to mark an achievement.", "https://images.unsplash.com/photo-1509587584298-0f3b3a3a1797?w=600&q=80"],
        ].map(([name, desc, img]) => `
        <div class="occasion-card reveal" onclick="showView('shop'); setTimeout(()=>filterCategory('${name}'),50)">
          <img src="${img}" alt="${name} bouquet" loading="lazy" />
          <div class="occasion-overlay">
            <h4>${name}</h4>
            <p>${desc}</p>
            <span class="occasion-arrow">Shop now →</span>
          </div>
        </div>`).join("")}
      </div>
    </div>
  </section>

  <section class="section" style="background:var(--white)">
    <div class="container">
      <div class="section-head reveal">
        <h2>Our Most Loved Bouquets</h2>
        <p>Thoughtfully arranged to make every gift unforgettable.</p>
      </div>
      <div class="product-grid reveal" id="home-product-grid"></div>
    </div>
  </section>

  <section class="section" id="about">
    <div class="container about-grid">
      <img class="reveal" src="https://images.unsplash.com/photo-1502741338009-cac2772e18bc?w=900&q=80" alt="Florist arranging flowers" />
      <div class="about-text reveal">
        <h2>Flowers That Tell Your Story.</h2>
        <p>At Bloomora Flowers, every bouquet begins with fresh, hand-selected blooms sourced with care.</p>
        <p>Our florists craft each handcrafted arrangement with an eye for detail, wrapping every order in beautiful, premium presentation.</p>
        <p>Whether it's a birthday, an anniversary, or a simple "thinking of you," we believe flowers should feel personal — and customer satisfaction is at the heart of everything we make.</p>
      </div>
    </div>
  </section>

  <section class="section" style="background:var(--white)">
    <div class="container">
      <div class="section-head reveal"><h2>Why Bloomora</h2></div>
      <div class="why-grid">
        <div class="why-card reveal"><div class="wicon">🌿</div><h4>Freshness Guaranteed</h4><p>Only the freshest blooms make it into every bouquet.</p></div>
        <div class="why-card reveal"><div class="wicon">🤍</div><h4>Handcrafted With Care</h4><p>Each arrangement is designed by hand, never mass produced.</p></div>
        <div class="why-card reveal"><div class="wicon">🎀</div><h4>Beautiful Presentation</h4><p>Elegant wrapping that makes every gift feel special.</p></div>
        <div class="why-card reveal"><div class="wicon">🚴</div><h4>Reliable Delivery</h4><p>On-time delivery so your moment arrives just right.</p></div>
      </div>
    </div>
  </section>

  <section class="section">
    <div class="container">
      <div class="section-head reveal"><h2>What Our Customers Say</h2></div>
      <div class="testi-grid">
        <div class="testi-card reveal"><div class="testi-stars">★★★★★</div><p class="testi-quote">"The bouquet was absolutely beautiful and arrived fresh. It made the birthday celebration extra special."</p><p class="testi-name">— Ananya S.</p></div>
        <div class="testi-card reveal"><div class="testi-stars">★★★★★</div><p class="testi-quote">"The perfect anniversary surprise. The presentation was gorgeous."</p><p class="testi-name">— Rohan K.</p></div>
        <div class="testi-card reveal"><div class="testi-stars">★★★★★</div><p class="testi-quote">"Ordering was simple and the flowers looked even better than expected."</p><p class="testi-name">— Meera P.</p></div>
      </div>
    </div>
  </section>

  <section class="section" id="contact" style="background:var(--white)">
    <div class="container contact-grid">
      <div class="reveal">
        <h2 style="font-size:32px; margin-bottom:22px;">Get In Touch</h2>
        <div class="contact-info-item"><span class="cicon">📞</span><div><h4>Phone</h4><p>+91 98765 43210</p></div></div>
        <div class="contact-info-item"><span class="cicon">✉️</span><div><h4>Email</h4><p>hello@bloomoraflowers.com</p></div></div>
        <div class="contact-info-item"><span class="cicon">📍</span><div><h4>Address</h4><p>Noida, Uttar Pradesh, India</p></div></div>
        <div class="contact-info-item"><span class="cicon">🕒</span><div><h4>Business Hours</h4><p>9:00 AM – 9:00 PM</p></div></div>
      </div>
      <form class="contact-form reveal" onsubmit="return submitContact(event)">
        <div class="field"><label>Name</label><input type="text" required /></div>
        <div class="field"><label>Email</label><input type="email" required /></div>
        <div class="field"><label>Message</label><textarea rows="4" required></textarea></div>
        <button class="btn btn-primary btn-block" type="submit">Send Message</button>
      </form>
    </div>
  </section>
</div>

<!-- ============ VIEW: SHOP ============ -->
<div id="view-shop" class="hidden">
  <section class="shop-hero container">
    <h1>Shop Our Flowers</h1>
    <p>Find the perfect bouquet for every occasion.</p>
  </section>
  <section class="container" style="padding-bottom:90px;">
    <div class="shop-controls">
      <div class="shop-search">
        <span class="search-icon">🔍</span>
        <input type="text" id="search-input" placeholder="Search bouquets..." oninput="renderShopGrid()" />
      </div>
      <select class="sort-select" id="sort-select" onchange="renderShopGrid()">
        <option value="featured">Featured</option>
        <option value="low">Price: Low to High</option>
        <option value="high">Price: High to Low</option>
        <option value="az">Name: A-Z</option>
      </select>
    </div>
    <div class="chip-row" id="category-chips" style="margin-bottom:34px;"></div>
    <div class="product-grid" id="shop-product-grid"></div>
  </section>
</div>

<!-- ============ VIEW: CART ============ -->
<div id="view-cart" class="hidden">
  <section class="container" style="padding:56px 0 90px;">
    <h1 style="margin-bottom:34px;">Your Flower Basket</h1>
    <div id="cart-content"></div>
  </section>
</div>

<!-- ============ VIEW: LOGIN ============ -->
<div id="view-login" class="hidden">
  <div class="container">
    <div class="auth-wrap">
      <h2>Welcome Back</h2>
      <p>Login to track your orders and manage your account.</p>
      <form onsubmit="return handleLogin(event)">
        <div class="field" style="margin-bottom:18px;"><label>User ID</label><input type="text" id="login-userid" required /></div>
        <div class="field" style="margin-bottom:22px;">
          <label>Password</label>
          <div class="input-wrap">
            <input type="password" id="login-password" required />
            <button type="button" class="toggle-pass" onclick="togglePass('login-password', this)">👁</button>
          </div>
        </div>
        <button class="btn btn-primary btn-block" type="submit">Login</button>
      </form>
      <p class="auth-switch">New to Bloomora? <a href="#" onclick="showView('register')">Create an account</a></p>
    </div>
  </div>
</div>

<!-- ============ VIEW: REGISTER ============ -->
<div id="view-register" class="hidden">
  <div class="container">
    <div class="auth-wrap">
      <h2>Create Account</h2>
      <p>Join Bloomora Flowers for a beautiful ordering experience.</p>
      <form onsubmit="return handleRegister(event)">
        <div class="field" style="margin-bottom:16px;"><label>User ID</label><input type="text" id="reg-userid" required /></div>
        <div class="field" style="margin-bottom:16px;">
          <label>Password</label>
          <div class="input-wrap">
            <input type="password" id="reg-password" required />
            <button type="button" class="toggle-pass" onclick="togglePass('reg-password', this)">👁</button>
          </div>
        </div>
        <div class="field" style="margin-bottom:16px;"><label>Full Name</label><input type="text" id="reg-name" required /></div>
        <div class="field" style="margin-bottom:16px;"><label>Phone</label><input type="tel" id="reg-phone" required /></div>
        <div class="field" style="margin-bottom:22px;"><label>Address</label><input type="text" id="reg-address" required /></div>
        <button class="btn btn-primary btn-block" type="submit">Register</button>
      </form>
      <p class="auth-switch">Already have an account? <a href="#" onclick="showView('login')">Login</a></p>
    </div>
  </div>
</div>

<!-- ============ VIEW: CHECKOUT ============ -->
<div id="view-checkout" class="hidden">
  <section class="container" style="padding:56px 0 90px;">
    <h1 style="margin-bottom:34px;">Checkout</h1>
    <div class="checkout-layout">
      <div class="admin-card">
        <h3 style="margin-bottom:20px;">Delivery Details</h3>
        <form id="checkout-form" onsubmit="return placeOrder(event)">
          <div class="field" style="margin-bottom:16px;"><label>Customer Name</label><input type="text" id="co-name" required /><span class="field-error">Please enter your name.</span></div>
          <div class="field" style="margin-bottom:16px;"><label>Phone</label><input type="tel" id="co-phone" required /><span class="field-error">Please enter a valid phone number.</span></div>
          <div class="field" style="margin-bottom:20px;"><label>Delivery Address</label><textarea id="co-address" rows="3" required></textarea><span class="field-error">Please enter your delivery address.</span></div>
          <button class="btn btn-primary btn-block" type="submit">Place Order</button>
        </form>
      </div>
      <div class="summary-box">
        <h3 style="margin-bottom:16px;">Order Summary</h3>
        <div id="checkout-items"></div>
        <div class="summary-row"><span>Subtotal</span><span id="co-subtotal">₹0</span></div>
        <div class="summary-row"><span>Delivery</span><span id="co-delivery">₹0</span></div>
        <div class="summary-row total"><span>Total</span><span id="co-total">₹0</span></div>
      </div>
    </div>
  </section>
</div>

<!-- ============ VIEW: ORDER SUCCESS ============ -->
<div id="view-success" class="hidden">
  <div class="container">
    <div class="success-box">
      <div class="success-icon">🌸</div>
      <h2 style="margin-bottom:10px;">Your order has been placed!</h2>
      <p style="margin-bottom:24px;">Thank you for choosing Bloomora Flowers.</p>
      <div style="text-align:left; background:var(--cream); border-radius:12px; padding:18px 20px; margin-bottom:26px;">
        <div class="summary-row"><span>Order ID</span><strong id="success-orderid"></strong></div>
        <div class="summary-row"><span>Total</span><strong id="success-total"></strong></div>
        <div class="summary-row"><span>Status</span><strong id="success-status"></strong></div>
        <div class="summary-row"><span>Delivery to</span><strong id="success-address" style="max-width:220px; text-align:right;"></strong></div>
      </div>
      <a href="#" class="btn btn-primary btn-block" onclick="showView('dashboard')">View My Orders</a>
    </div>
  </div>
</div>

<!-- ============ VIEW: DASHBOARD ============ -->
<div id="view-dashboard" class="hidden">
  <section class="container" style="padding:56px 0 90px;">
    <div id="dashboard-content"></div>
  </section>
</div>

<!-- ============ PRODUCT MODAL ============ -->
<div class="modal-overlay" id="product-modal">
  <div class="modal-box" id="product-modal-content"></div>
</div>

<!-- ============ FOOTER ============ -->
<footer>
  <div class="container">
    <div class="footer-grid">
      <div class="footer-col">
        <h4>Bloomora Flowers</h4>
        <p>Beautiful Flowers. Beautiful Moments.</p>
      </div>
      <div class="footer-col">
        <h4>Quick Links</h4>
        <ul>
          <li><a href="#" onclick="showView('home')">Home</a></li>
          <li><a href="#" onclick="showView('shop')">Shop</a></li>
          <li><a href="#about" onclick="showView('home')">About</a></li>
          <li><a href="#contact" onclick="showView('home')">Contact</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>Customer</h4>
        <ul>
          <li><a href="#" onclick="showView('dashboard')">My Account</a></li>
          <li><a href="#" onclick="showView('dashboard')">My Orders</a></li>
          <li><a href="#" onclick="showView('cart')">Cart</a></li>
          <li><a href="#" onclick="showView('login')">Login</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>Support</h4>
        <ul>
          <li><a href="#">FAQ</a></li>
          <li><a href="#">Privacy Policy</a></li>
          <li><a href="#">Terms &amp; Conditions</a></li>
          <li><a href="#">Refund Policy</a></li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">© 2026 Bloomora Flowers. All Rights Reserved.</div>
  </div>
</footer>

<script>
${COMMON_JS}

// =============================
// FRONTEND JAVASCRIPT — APP STATE
// =============================
let ALL_PRODUCTS = [];
let ACTIVE_CATEGORY = 'All';

async function loadProducts(){
  showSkeleton('home-product-grid', 4);
  showSkeleton('shop-product-grid', 8);
  try{
    const res = await fetch('/api/products');
    const data = await res.json();
    if(data.success){
      ALL_PRODUCTS = data.products;
      renderHomeGrid();
      renderCategoryChips();
      renderShopGrid();
    } else {
      showToast(data.message || 'Could not load products.', 'error');
    }
  } catch(err){
    showToast('Could not connect to server.', 'error');
  }
}

function showSkeleton(containerId, count){
  const el = document.getElementById(containerId);
  if(!el) return;
  let html = '';
  for(let i=0;i<count;i++){
    html += '<div class="skeleton-card"><div class="skeleton-block skeleton-thumb"></div><div class="skeleton-block skeleton-line" style="width:70%"></div><div class="skeleton-block skeleton-line" style="width:40%"></div></div>';
  }
  el.innerHTML = html;
}

function productCardHTML(p){
  return \`
  <div class="product-card">
    <div class="product-thumb" onclick="openProductModal('\${p._id}')">
      <span class="product-cat">\${p.category}</span>
      <img src="\${p.image}" alt="\${p.name}" loading="lazy" />
    </div>
    <div class="product-body">
      <h4 onclick="openProductModal('\${p._id}')">\${p.name}</h4>
      <p class="pdesc">\${p.description}</p>
      <div class="product-rating">★ \${p.rating || 4.5}</div>
      <div class="product-footer">
        <span class="price">₹\${p.price}</span>
        <button class="add-cart-btn" onclick='addToCart(\${JSON.stringify(p)})'>Add to Cart</button>
      </div>
    </div>
  </div>\`;
}

function renderHomeGrid(){
  const grid = document.getElementById('home-product-grid');
  if(!grid) return;
  grid.innerHTML = ALL_PRODUCTS.slice(0, 8).map(productCardHTML).join('');
}

function renderCategoryChips(){
  const cats = ['All', ...new Set(ALL_PRODUCTS.map(p => p.category))];
  const el = document.getElementById('category-chips');
  el.innerHTML = cats.map(c => \`<button class="chip \${c===ACTIVE_CATEGORY?'active':''}" onclick="filterCategory('\${c}')">\${c}</button>\`).join('');
}

function filterCategory(cat){
  ACTIVE_CATEGORY = cat;
  renderCategoryChips();
  renderShopGrid();
}

function renderShopGrid(){
  const grid = document.getElementById('shop-product-grid');
  if(!grid) return;
  const search = (document.getElementById('search-input')?.value || '').toLowerCase();
  const sort = document.getElementById('sort-select')?.value || 'featured';

  let list = ALL_PRODUCTS.filter(p =>
    (ACTIVE_CATEGORY === 'All' || p.category === ACTIVE_CATEGORY) &&
    p.name.toLowerCase().includes(search)
  );

  if(sort === 'low') list = list.slice().sort((a,b) => a.price - b.price);
  if(sort === 'high') list = list.slice().sort((a,b) => b.price - a.price);
  if(sort === 'az') list = list.slice().sort((a,b) => a.name.localeCompare(b.name));

  if(!list.length){
    grid.innerHTML = '';
    grid.insertAdjacentHTML('afterend', '');
    document.getElementById('shop-product-grid').outerHTML =
      '<div class="empty-state" id="shop-product-grid-empty"><div class="eicon">🌷</div><h3>No bouquets found</h3><p>Try a different search or category.</p></div>';
    return;
  }
  grid.innerHTML = list.map(productCardHTML).join('');
}

// Restore grid element if empty-state replaced it
function ensureShopGridExists(){
  if(!document.getElementById('shop-product-grid')){
    const empty = document.getElementById('shop-product-grid-empty');
    if(empty){ empty.outerHTML = '<div class="product-grid" id="shop-product-grid"></div>'; }
  }
}

// ---- Product modal ----
function openProductModal(id){
  const p = ALL_PRODUCTS.find(x => x._id === id);
  if(!p) return;
  document.getElementById('product-modal-content').innerHTML = \`
    <button class="modal-close" onclick="closeModal('product-modal')">×</button>
    <img src="\${p.image}" alt="\${p.name}" style="width:100%; height:280px; object-fit:cover; border-radius:14px; margin-bottom:20px;" />
    <span class="product-cat" style="position:static; display:inline-block; margin-bottom:10px;">\${p.category}</span>
    <h3 style="font-size:24px; margin-bottom:10px;">\${p.name}</h3>
    <p style="margin-bottom:16px;">\${p.description}</p>
    <p style="margin-bottom:16px; font-size:13px; color:\${p.available ? 'var(--sage)' : '#b53939'};">\${p.available ? '✔ In stock' : '✘ Currently unavailable'}</p>
    <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:22px;">
      <span class="price" style="font-size:24px;">₹\${p.price}</span>
      <div class="qty-control">
        <button class="qty-btn" onclick="modalQty(-1)">−</button>
        <span id="modal-qty">1</span>
        <button class="qty-btn" onclick="modalQty(1)">+</button>
      </div>
    </div>
    <button class="btn btn-primary btn-block" onclick='addToCart(\${JSON.stringify(p)}, window.__modalQty || 1); closeModal("product-modal")' \${!p.available ? 'disabled style="opacity:.5;cursor:not-allowed;"' : ''}>Add to Cart</button>
  \`;
  window.__modalQty = 1;
  openModal('product-modal');
}
function modalQty(delta){
  window.__modalQty = Math.max(1, (window.__modalQty || 1) + delta);
  document.getElementById('modal-qty').textContent = window.__modalQty;
}
function openModal(id){ document.getElementById(id).classList.add('open'); }
function closeModal(id){ document.getElementById(id).classList.remove('open'); }
document.addEventListener('click', (e) => {
  if(e.target.classList.contains('modal-overlay')) e.target.classList.remove('open');
});

// ---- View router (simple SPA) ----
const VIEWS = ['home','shop','cart','login','register','checkout','success','dashboard'];
function showView(view){
  VIEWS.forEach(v => {
    const el = document.getElementById('view-' + v);
    if(el) el.classList.toggle('hidden', v !== view);
  });
  window.scrollTo({ top: 0, behavior: 'smooth' });
  if(view === 'shop'){ ensureShopGridExists(); renderShopGrid(); }
  if(view === 'cart') renderCartPage();
  if(view === 'checkout') renderCheckoutPage();
  if(view === 'dashboard') renderDashboard();
}

// ---- Cart page ----
function renderCartPage(){
  const container = document.getElementById('cart-content');
  const cart = getCart();
  if(!cart.length){
    container.innerHTML = \`
      <div class="empty-state">
        <div class="eicon">🌷</div>
        <h3>Your flower basket is waiting for something beautiful.</h3>
        <button class="btn btn-primary" onclick="showView('shop')">Continue Shopping</button>
      </div>\`;
    return;
  }
  const subtotal = cart.reduce((s,i) => s + i.price * i.qty, 0);
  const delivery = subtotal > 0 ? 49 : 0;
  const total = subtotal + delivery;
  container.innerHTML = \`
    <div class="cart-layout">
      <div>
        \${cart.map(i => \`
          <div class="cart-item">
            <img src="\${i.image}" alt="\${i.name}" />
            <div class="cart-item-info">
              <h4>\${i.name}</h4>
              <span class="price">₹\${i.price}</span>
              <div class="qty-control">
                <button class="qty-btn" onclick="changeQty('\${i.productId}', -1)">−</button>
                <span>\${i.qty}</span>
                <button class="qty-btn" onclick="changeQty('\${i.productId}', 1)">+</button>
              </div>
              <button class="remove-item" onclick="removeFromCart('\${i.productId}')">Remove</button>
            </div>
          </div>\`).join('')}
        <a href="#" onclick="showView('shop')" style="font-size:14px; font-weight:600; color:var(--burgundy);">← Continue Shopping</a>
      </div>
      <div class="summary-box">
        <h3 style="margin-bottom:16px;">Order Summary</h3>
        <div class="summary-row"><span>Subtotal</span><span>₹\${subtotal}</span></div>
        <div class="summary-row"><span>Delivery</span><span>₹\${delivery}</span></div>
        <div class="summary-row total"><span>Total</span><span>₹\${total}</span></div>
        <button class="btn btn-primary btn-block" style="margin-top:16px;" onclick="goToCheckout()">Checkout</button>
      </div>
    </div>\`;
}

function goToCheckout(){
  if(!getCart().length){ showToast('Your basket is empty.', 'error'); return; }
  if(!getLoggedInUser()){ showToast('Please login to checkout.', 'error'); showView('login'); return; }
  showView('checkout');
}

// ---- Checkout page ----
function renderCheckoutPage(){
  const cart = getCart();
  const user = getLoggedInUser();
  if(user){
    document.getElementById('co-name').value = user.name || '';
    document.getElementById('co-phone').value = user.phone || '';
    document.getElementById('co-address').value = user.address || '';
  }
  const subtotal = cart.reduce((s,i) => s + i.price * i.qty, 0);
  const delivery = subtotal > 0 ? 49 : 0;
  const total = subtotal + delivery;
  document.getElementById('checkout-items').innerHTML = cart.map(i =>
    \`<div class="order-review-item"><span>\${i.name} × \${i.qty}</span><span>₹\${i.price * i.qty}</span></div>\`
  ).join('');
  document.getElementById('co-subtotal').textContent = '₹' + subtotal;
  document.getElementById('co-delivery').textContent = '₹' + delivery;
  document.getElementById('co-total').textContent = '₹' + total;
}

async function placeOrder(e){
  e.preventDefault();
  const user = getLoggedInUser();
  const cart = getCart();
  const name = document.getElementById('co-name').value.trim();
  const phone = document.getElementById('co-phone').value.trim();
  const address = document.getElementById('co-address').value.trim();

  let valid = true;
  toggleFieldError('co-name', !name);
  toggleFieldError('co-phone', !/^[0-9+\\-\\s]{7,15}$/.test(phone));
  toggleFieldError('co-address', !address);
  if(!name || !/^[0-9+\\-\\s]{7,15}$/.test(phone) || !address) valid = false;
  if(!cart.length){ showToast('Your basket is empty.', 'error'); valid = false; }
  if(!user){ showToast('Please login to place an order.', 'error'); showView('login'); return false; }
  if(!valid) return false;

  const subtotal = cart.reduce((s,i) => s + i.price * i.qty, 0);
  const deliveryFee = subtotal > 0 ? 49 : 0;
  const totalPrice = subtotal + deliveryFee;

  try{
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user.userId, customerName: name, phone, address,
        items: cart.map(i => ({ productId: i.productId, name: i.name, price: i.price, qty: i.qty })),
        subtotal, deliveryFee, totalPrice
      })
    });
    const data = await res.json();
    if(data.success){
      localStorage.removeItem('cart');
      updateCartCount();
      document.getElementById('success-orderid').textContent = data.order._id;
      document.getElementById('success-total').textContent = '₹' + data.order.totalPrice;
      document.getElementById('success-status').textContent = data.order.status;
      document.getElementById('success-address').textContent = data.order.address;
      showToast('Order placed successfully!');
      showView('success');
    } else {
      showToast(data.message || 'Could not place order.', 'error');
    }
  } catch(err){
    showToast('Could not connect to server.', 'error');
  }
  return false;
}

function toggleFieldError(inputId, hasError){
  const field = document.getElementById(inputId).closest('.field');
  field.classList.toggle('has-error', hasError);
}

// ---- Auth ----
function togglePass(id, btn){
  const input = document.getElementById(id);
  input.type = input.type === 'password' ? 'text' : 'password';
}

async function handleRegister(e){
  e.preventDefault();
  const userId = document.getElementById('reg-userid').value.trim();
  const password = document.getElementById('reg-password').value;
  const name = document.getElementById('reg-name').value.trim();
  const phone = document.getElementById('reg-phone').value.trim();
  const address = document.getElementById('reg-address').value.trim();
  try{
    const res = await fetch('/api/register', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, password, name, phone, address })
    });
    const data = await res.json();
    if(data.success){
      showToast('Registration successful!');
      setLoggedInUser(data.user);
      showView('dashboard');
    } else {
      showToast(data.message || 'Registration failed.', 'error');
    }
  } catch(err){ showToast('Could not connect to server.', 'error'); }
  return false;
}

async function handleLogin(e){
  e.preventDefault();
  const userId = document.getElementById('login-userid').value.trim();
  const password = document.getElementById('login-password').value;
  try{
    const res = await fetch('/api/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, password })
    });
    const data = await res.json();
    if(data.success){
      showToast('Login successful!');
      setLoggedInUser(data.user);
      showView('dashboard');
    } else {
      showToast(data.message || 'Login failed.', 'error');
    }
  } catch(err){ showToast('Could not connect to server.', 'error'); }
  return false;
}

// ---- Dashboard ----
async function renderDashboard(){
  const user = getLoggedInUser();
  const container = document.getElementById('dashboard-content');
  if(!user){
    container.innerHTML = '';
    showView('login');
    return;
  }
  container.innerHTML = \`<div class="dash-welcome"><h2>Welcome back, \${user.name}</h2></div>
    <div class="profile-card">
      <div><span>User ID</span><strong>\${user.userId}</strong></div>
      <div><span>Name</span><strong>\${user.name}</strong></div>
      <div><span>Phone</span><strong>\${user.phone}</strong></div>
      <div><span>Address</span><strong>\${user.address}</strong></div>
    </div>
    <div class="stat-row" id="dash-stats">
      <div class="stat-card"><h3>—</h3><p>Total Orders</p></div>
      <div class="stat-card"><h3>—</h3><p>Pending Orders</p></div>
      <div class="stat-card"><h3>—</h3><p>Delivered Orders</p></div>
    </div>
    <h3 style="margin-bottom:18px;">My Orders</h3>
    <div id="dash-orders"><p>Loading orders...</p></div>
    <button class="btn btn-outline" style="margin-top:24px;" onclick="logoutUser()">Logout</button>\`;

  try{
    const res = await fetch('/api/orders/' + user.userId);
    const data = await res.json();
    if(data.success){
      const orders = data.orders;
      const pending = orders.filter(o => o.status === 'Pending').length;
      const delivered = orders.filter(o => o.status === 'Delivered').length;
      document.querySelectorAll('#dash-stats h3')[0].textContent = orders.length;
      document.querySelectorAll('#dash-stats h3')[1].textContent = pending;
      document.querySelectorAll('#dash-stats h3')[2].textContent = delivered;

      const ordersEl = document.getElementById('dash-orders');
      if(!orders.length){
        ordersEl.innerHTML = '<p>You haven\\'t placed any orders yet.</p>';
      } else {
        ordersEl.innerHTML = orders.map(o => \`
          <div class="order-card">
            <div>
              <div class="order-id">Order #\${o._id.slice(-6).toUpperCase()}</div>
              <div class="order-date">\${new Date(o.createdAt).toLocaleDateString()} · \${o.items.length} item(s)</div>
            </div>
            <div class="price">₹\${o.totalPrice}</div>
            <span class="status-badge status-\${o.status.replace(/ /g,'-')}">\${o.status}</span>
          </div>\`).join('');
      }
    }
  } catch(err){
    document.getElementById('dash-orders').innerHTML = '<p>Could not load orders.</p>';
  }
}

// ---- Contact form ----
function submitContact(e){
  e.preventDefault();
  showToast('Message sent! We will get back to you soon.');
  e.target.reset();
  return false;
}

// ---- Init ----
loadProducts();
window.addEventListener('load', () => {
  if(!getLoggedInUser()){
    // no-op, dashboard link will redirect to login when clicked
  }
});
</script>
</body>
</html>`;
}

// =============================
// FRONTEND HTML — ADMIN PANEL ("/admin")
// =============================
function renderAdminPage() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Bloomora Admin — Bloomora Flowers</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>${SHARED_CSS}</style>
</head>
<body class="admin-body">

<div id="toast-container"></div>

<!-- ============ ADMIN LOGIN ============ -->
<div id="admin-login-view" class="admin-login-wrap">
  <div class="auth-wrap">
    <h2>Admin Login</h2>
    <p>Bloomora Flowers — Management Console</p>
    <form onsubmit="return handleAdminLogin(event)">
      <div class="field" style="margin-bottom:18px;"><label>Admin ID</label><input type="text" id="admin-id" required /></div>
      <div class="field" style="margin-bottom:22px;">
        <label>Password</label>
        <div class="input-wrap">
          <input type="password" id="admin-password" required />
          <button type="button" class="toggle-pass" onclick="togglePass('admin-password')">👁</button>
        </div>
      </div>
      <button class="btn btn-primary btn-block" type="submit">Login</button>
    </form>
    <p style="text-align:center; margin-top:18px; font-size:12.5px; color:#a89b89;">Demo credentials — admin / admin123</p>
  </div>
</div>

<!-- ============ ADMIN DASHBOARD ============ -->
<div id="admin-main-view" class="hidden admin-wrap">
  <aside class="admin-sidebar" id="admin-sidebar">
    <div class="admin-logo">Bloomora <span>Admin</span></div>
    <a class="admin-nav-item active" data-tab="dashboard" onclick="showAdminTab('dashboard')">📊 &nbsp;Dashboard</a>
    <a class="admin-nav-item" data-tab="products" onclick="showAdminTab('products')">🌸 &nbsp;Products</a>
    <a class="admin-nav-item" data-tab="orders" onclick="showAdminTab('orders')">📦 &nbsp;Orders</a>
    <a class="admin-nav-item" data-tab="customers" onclick="showAdminTab('customers')">👥 &nbsp;Customers</a>
    <a class="admin-nav-item" onclick="adminLogout()" style="margin-top:auto;">🚪 &nbsp;Logout</a>
  </aside>

  <main class="admin-main">
    <div class="admin-topbar">
      <h2 id="admin-tab-title">Dashboard</h2>
      <div style="display:flex; gap:14px; align-items:center;">
        <input class="admin-search hidden" id="admin-product-search" placeholder="Search products..." oninput="renderAdminProducts()" />
        <span>👤 Admin</span>
        <span>🔔</span>
      </div>
    </div>

    <!-- DASHBOARD TAB -->
    <div id="admin-tab-dashboard">
      <div class="admin-stats" id="admin-stats-grid"></div>
      <div class="admin-card">
        <h3 style="margin-bottom:16px;">Recent Orders</h3>
        <div style="overflow-x:auto;">
          <table class="admin-table" id="admin-recent-orders">
            <thead><tr><th>Order ID</th><th>Customer</th><th>Total</th><th>Status</th></tr></thead>
            <tbody></tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- PRODUCTS TAB -->
    <div id="admin-tab-products" class="hidden">
      <div style="display:flex; justify-content:flex-end; margin-bottom:18px;">
        <button class="btn btn-primary" onclick="openProductForm()">+ Add Product</button>
      </div>
      <div class="admin-card">
        <div style="overflow-x:auto;">
          <table class="admin-table">
            <thead><tr><th>Image</th><th>Name</th><th>Category</th><th>Price</th><th>Available</th><th>Actions</th></tr></thead>
            <tbody id="admin-products-tbody"></tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ORDERS TAB -->
    <div id="admin-tab-orders" class="hidden">
      <div class="admin-card">
        <div style="overflow-x:auto;">
          <table class="admin-table">
            <thead><tr><th>Order ID</th><th>Customer</th><th>Phone</th><th>Items</th><th>Total</th><th>Address</th><th>Date</th><th>Status</th></tr></thead>
            <tbody id="admin-orders-tbody"></tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- CUSTOMERS TAB -->
    <div id="admin-tab-customers" class="hidden">
      <div class="admin-card">
        <div style="overflow-x:auto;">
          <table class="admin-table">
            <thead><tr><th>User ID</th><th>Name</th><th>Phone</th><th>Address</th><th>Registered</th></tr></thead>
            <tbody id="admin-customers-tbody"></tbody>
          </table>
        </div>
      </div>
    </div>
  </main>
</div>

<!-- PRODUCT FORM MODAL -->
<div class="modal-overlay" id="product-form-modal">
  <div class="modal-box">
    <button class="modal-close" onclick="closeModal('product-form-modal')">×</button>
    <h3 id="product-form-title" style="margin-bottom:20px;">Add Product</h3>
    <form id="product-form" onsubmit="return saveProduct(event)">
      <input type="hidden" id="pf-id" />
      <div class="field" style="margin-bottom:14px;"><label>Product Name</label><input type="text" id="pf-name" required /></div>
      <div class="field" style="margin-bottom:14px;"><label>Description</label><textarea id="pf-description" rows="3" required></textarea></div>
      <div class="field" style="margin-bottom:14px;"><label>Price (₹)</label><input type="number" id="pf-price" min="1" required /></div>
      <div class="field" style="margin-bottom:14px;"><label>Category</label>
        <select id="pf-category" required>
          <option>Birthday</option><option>Anniversary</option><option>Wedding</option>
          <option>Romance</option><option>Mother's Day</option><option>Congratulations</option><option>General</option>
        </select>
      </div>
      <div class="field" style="margin-bottom:14px;"><label>Image URL</label><input type="url" id="pf-image" required /></div>
      <div class="field" style="margin-bottom:20px; flex-direction:row; align-items:center; gap:10px;">
        <input type="checkbox" id="pf-available" checked style="width:auto;" /><label style="margin:0;">Available</label>
      </div>
      <button class="btn btn-primary btn-block" type="submit">Save Product</button>
    </form>
  </div>
</div>

<!-- DELETE CONFIRM MODAL -->
<div class="modal-overlay" id="delete-confirm-modal">
  <div class="modal-box" style="max-width:400px; text-align:center;">
    <h3 style="margin-bottom:14px;">Are you sure you want to delete this bouquet?</h3>
    <p style="margin-bottom:24px;">This action cannot be undone.</p>
    <div style="display:flex; gap:12px;">
      <button class="btn btn-outline btn-block" onclick="closeModal('delete-confirm-modal')">Cancel</button>
      <button class="btn btn-primary btn-block" style="background:#b53939;" onclick="confirmDeleteProduct()">Delete</button>
    </div>
  </div>
</div>

<script>
${COMMON_JS}

let ADMIN_PRODUCTS = [];
let DELETE_TARGET_ID = null;

function togglePass(id){
  const input = document.getElementById(id);
  input.type = input.type === 'password' ? 'text' : 'password';
}
function openModal(id){ document.getElementById(id).classList.add('open'); }
function closeModal(id){ document.getElementById(id).classList.remove('open'); }

async function handleAdminLogin(e){
  e.preventDefault();
  const adminId = document.getElementById('admin-id').value.trim();
  const password = document.getElementById('admin-password').value;
  try{
    const res = await fetch('/api/admin/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminId, password })
    });
    const data = await res.json();
    if(data.success){
      sessionStorage.setItem('bloomoraAdmin', 'true');
      showToast('Login successful!');
      enterAdminDashboard();
    } else {
      showToast(data.message || 'Invalid credentials.', 'error');
    }
  } catch(err){ showToast('Could not connect to server.', 'error'); }
  return false;
}

function enterAdminDashboard(){
  document.getElementById('admin-login-view').classList.add('hidden');
  document.getElementById('admin-main-view').classList.remove('hidden');
  loadAdminStats();
  loadAdminProducts();
  loadAdminOrders();
  loadAdminCustomers();
}

function adminLogout(){
  sessionStorage.removeItem('bloomoraAdmin');
  document.getElementById('admin-main-view').classList.add('hidden');
  document.getElementById('admin-login-view').classList.remove('hidden');
  showToast('Logged out.');
}

function showAdminTab(tab){
  ['dashboard','products','orders','customers'].forEach(t => {
    document.getElementById('admin-tab-' + t).classList.toggle('hidden', t !== tab);
  });
  document.querySelectorAll('.admin-nav-item[data-tab]').forEach(el => {
    el.classList.toggle('active', el.dataset.tab === tab);
  });
  document.getElementById('admin-tab-title').textContent = tab.charAt(0).toUpperCase() + tab.slice(1);
  document.getElementById('admin-product-search').classList.toggle('hidden', tab !== 'products');
}

async function loadAdminStats(){
  try{
    const res = await fetch('/api/admin/stats');
    const data = await res.json();
    if(data.success){
      const s = data.stats;
      const cards = [
        ['Total Products', s.totalProducts],
        ['Total Orders', s.totalOrders],
        ['Total Customers', s.totalCustomers],
        ['Pending Orders', s.pendingOrders],
      ];
      document.getElementById('admin-stats-grid').innerHTML = cards.map(([label,val], i) =>
        \`<div class="admin-stat-card" style="animation-delay:\${i*0.08}s"><h3>\${val}</h3><p>\${label}</p></div>\`
      ).join('');
    }
  } catch(err){ showToast('Could not load stats.', 'error'); }
}

async function loadAdminProducts(){
  try{
    const res = await fetch('/api/products');
    const data = await res.json();
    if(data.success){
      ADMIN_PRODUCTS = data.products;
      renderAdminProducts();
    }
  } catch(err){ showToast('Could not load products.', 'error'); }
}

function renderAdminProducts(){
  const search = (document.getElementById('admin-product-search').value || '').toLowerCase();
  const list = ADMIN_PRODUCTS.filter(p => p.name.toLowerCase().includes(search));
  document.getElementById('admin-products-tbody').innerHTML = list.map(p => \`
    <tr>
      <td><img src="\${p.image}" alt="\${p.name}" /></td>
      <td>\${p.name}</td>
      <td>\${p.category}</td>
      <td>₹\${p.price}</td>
      <td>\${p.available ? '✔ Yes' : '✘ No'}</td>
      <td>
        <div class="table-actions">
          <button class="icon-action" onclick='openProductForm(\${JSON.stringify(p)})'>✏️</button>
          <button class="icon-action danger" onclick="openDeleteConfirm('\${p._id}')">🗑️</button>
        </div>
      </td>
    </tr>\`).join('') || '<tr><td colspan="6" style="text-align:center; padding:30px;">No products found.</td></tr>';
}

function openProductForm(product){
  document.getElementById('product-form').reset();
  if(product){
    document.getElementById('product-form-title').textContent = 'Edit Product';
    document.getElementById('pf-id').value = product._id;
    document.getElementById('pf-name').value = product.name;
    document.getElementById('pf-description').value = product.description;
    document.getElementById('pf-price').value = product.price;
    document.getElementById('pf-category').value = product.category;
    document.getElementById('pf-image').value = product.image;
    document.getElementById('pf-available').checked = product.available;
  } else {
    document.getElementById('product-form-title').textContent = 'Add Product';
    document.getElementById('pf-id').value = '';
  }
  openModal('product-form-modal');
}

async function saveProduct(e){
  e.preventDefault();
  const id = document.getElementById('pf-id').value;
  const payload = {
    name: document.getElementById('pf-name').value.trim(),
    description: document.getElementById('pf-description').value.trim(),
    price: Number(document.getElementById('pf-price').value),
    category: document.getElementById('pf-category').value,
    image: document.getElementById('pf-image').value.trim(),
    available: document.getElementById('pf-available').checked,
  };
  try{
    const res = await fetch(id ? '/api/products/' + id : '/api/products', {
      method: id ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if(data.success){
      showToast(id ? 'Product updated successfully.' : 'Product added successfully.');
      closeModal('product-form-modal');
      loadAdminProducts();
      loadAdminStats();
    } else {
      showToast(data.message || 'Could not save product.', 'error');
    }
  } catch(err){ showToast('Could not connect to server.', 'error'); }
  return false;
}

function openDeleteConfirm(id){
  DELETE_TARGET_ID = id;
  openModal('delete-confirm-modal');
}
async function confirmDeleteProduct(){
  try{
    const res = await fetch('/api/products/' + DELETE_TARGET_ID, { method: 'DELETE' });
    const data = await res.json();
    if(data.success){
      showToast('Product deleted.');
      closeModal('delete-confirm-modal');
      loadAdminProducts();
      loadAdminStats();
    } else {
      showToast(data.message || 'Could not delete product.', 'error');
    }
  } catch(err){ showToast('Could not connect to server.', 'error'); }
}

async function loadAdminOrders(){
  try{
    const res = await fetch('/api/admin/orders');
    const data = await res.json();
    if(data.success){
      document.getElementById('admin-orders-tbody').innerHTML = data.orders.map(o => \`
        <tr>
          <td>#\${o._id.slice(-6).toUpperCase()}</td>
          <td>\${o.customerName}</td>
          <td>\${o.phone}</td>
          <td>\${o.items.map(i => i.name + ' ×' + i.qty).join(', ')}</td>
          <td>₹\${o.totalPrice}</td>
          <td>\${o.address}</td>
          <td>\${new Date(o.createdAt).toLocaleDateString()}</td>
          <td>
            <select class="status-select" onchange="updateOrderStatus('\${o._id}', this.value)">
              \${['Pending','Confirmed','Preparing','Out for Delivery','Delivered','Cancelled'].map(s =>
                \`<option value="\${s}" \${s === o.status ? 'selected' : ''}>\${s}</option>\`).join('')}
            </select>
          </td>
        </tr>\`).join('') || '<tr><td colspan="8" style="text-align:center; padding:30px;">No orders yet.</td></tr>';

      document.querySelector('#admin-recent-orders tbody').innerHTML = data.orders.slice(0,5).map(o => \`
        <tr>
          <td>#\${o._id.slice(-6).toUpperCase()}</td>
          <td>\${o.customerName}</td>
          <td>₹\${o.totalPrice}</td>
          <td><span class="status-badge status-\${o.status.replace(/ /g,'-')}">\${o.status}</span></td>
        </tr>\`).join('') || '<tr><td colspan="4" style="text-align:center; padding:20px;">No orders yet.</td></tr>';
    }
  } catch(err){ showToast('Could not load orders.', 'error'); }
}

async function updateOrderStatus(id, status){
  try{
    const res = await fetch('/api/admin/orders/' + id, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    const data = await res.json();
    if(data.success){
      showToast('Order status updated.');
      loadAdminStats();
    } else {
      showToast(data.message || 'Could not update status.', 'error');
    }
  } catch(err){ showToast('Could not connect to server.', 'error'); }
}

async function loadAdminCustomers(){
  try{
    const res = await fetch('/api/admin/customers');
    const data = await res.json();
    if(data.success){
      document.getElementById('admin-customers-tbody').innerHTML = data.users.map(u => \`
        <tr>
          <td>\${u.userId}</td>
          <td>\${u.name}</td>
          <td>\${u.phone}</td>
          <td>\${u.address}</td>
          <td>\${new Date(u.createdAt).toLocaleDateString()}</td>
        </tr>\`).join('') || '<tr><td colspan="5" style="text-align:center; padding:30px;">No customers yet.</td></tr>';
    }
  } catch(err){ showToast('Could not load customers.', 'error'); }
}

// Restore session if already logged in this browser tab
if(sessionStorage.getItem('bloomoraAdmin') === 'true'){
  enterAdminDashboard();
}
</script>
</body>
</html>`;
}

// =============================
// PAGE ROUTES
// =============================
app.get("/", (req, res) => {
  res.send(renderCustomerPage());
});

app.get("/admin", (req, res) => {
  res.send(renderAdminPage());
});

// Fallback for unknown routes
app.use((req, res) => {
  res.status(404).send(
    "<h1 style='font-family:sans-serif; text-align:center; margin-top:100px;'>404 — Page Not Found. <a href='/'>Go Home</a></h1>"
  );
});

// =============================
// START SERVER
// =============================
app.listen(PORT, () => {
  console.log(`🌸 Bloomora Flowers server running at http://localhost:${PORT}`);
  console.log(`🌸 Admin panel available at http://localhost:${PORT}/admin`);
});
