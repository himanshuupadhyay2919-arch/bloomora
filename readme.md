# 🌸 Bloomora Flowers

> **Beautiful Flowers. Beautiful Moments.**

Bloomora Flowers is a full-stack flower bouquet e-commerce website built with **Node.js, Express.js, MongoDB, and Mongoose**.

The project provides a customer-facing flower shopping experience along with a simple admin panel for managing products, customers, and orders.

> **Note:** This project is designed as an educational/college project. The current authentication system is intentionally simple and is **not recommended for production use without additional security improvements**.

---

## ✨ Features

### 🛍️ Customer Features

- Modern responsive flower-shop website
- Beautiful hero section and product showcase
- Flower categories and occasions
- Product browsing
- Product details
- Add products to cart
- Cart management
- Customer registration
- Customer login
- Customer profile
- Checkout/order placement
- Order history
- Order status tracking
- Responsive mobile navigation
- Animated UI elements
- Mobile-friendly design

### 👨‍💼 Admin Features

- Dedicated admin panel
- Admin login
- Dashboard statistics
- View total products
- View total orders
- View total customers
- View pending orders
- Add new products
- Edit products
- Delete products
- View customer list
- View all customer orders
- Update order status

### 🗄️ Database Features

MongoDB is used to store:

- Customers
- Products
- Orders

The application also includes automatic default product seeding.

---

# 🛠️ Technology Stack

| Technology | Purpose |
|---|---|
| Node.js | Backend runtime |
| Express.js | Web server and API |
| MongoDB Atlas | Cloud database |
| Mongoose | MongoDB object modeling |
| HTML5 | Website structure |
| CSS3 | Styling and responsive design |
| JavaScript | Frontend functionality |
| GitHub | Source-code repository |
| Render | Recommended deployment platform |

---

# 📁 Project Structure

```text
bloomora/
│
├── server.js
├── package.json
├── package-lock.json
├── .gitignore
└── README.md
```

The project uses a single `server.js` file containing the Express server, API routes, database models, seed data, and website interface.

---

# 🚀 Getting Started

## 1. Requirements

Make sure you have installed:

- Node.js 18+
- npm
- MongoDB Atlas account
- Git

Check Node.js:

```bash
node -v
```

Check npm:

```bash
npm -v
```

---

# 📥 Installation

Clone the repository:

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
```

Move into the project folder:

```bash
cd bloomora
```

Install dependencies:

```bash
npm install
```

---

# 🔐 MongoDB Configuration

Bloomora uses MongoDB Atlas.

Create a MongoDB Atlas cluster and database user.

Then obtain your MongoDB connection string.

Example:

```text
mongodb+srv://USERNAME:PASSWORD@cluster.mongodb.net/bloomora
```

### Recommended Environment Variable

Do **not** store your MongoDB username and password directly inside `server.js`.

Use:

```text
MONGO_URI
```

Your application reads the MongoDB connection string from the environment.

For local development, create:

```text
.env
```

and add:

```env
MONGO_URI=mongodb+srv://USERNAME:PASSWORD@cluster.mongodb.net/bloomora
```

> Never upload `.env` to GitHub.

---

# 🌱 Seed Data

Bloomora includes built-in default flower products.

When the application successfully connects to MongoDB, it checks whether the product collection is empty.

If there are no products, the application automatically inserts the default products.

The default catalog includes products such as:

- Classic Red Roses
- Pink Love Bouquet
- White Lily Elegance
- Sunshine Yellow Bouquet
- Birthday Bliss Bouquet
- Premium Red Rose Basket
- Mother's Day Special
- Royal Purple Bouquet

If products already exist in the database, the default products are not inserted again.

---

# ▶️ Running the Application

Start the application:

```bash
npm start
```

The application uses:

```text
PORT
```

from the environment when available and otherwise uses port:

```text
5000
```

Open the website:

```text
http://localhost:5000
```

---

# 👨‍💼 Admin Panel

The admin panel is available at:

```text
http://localhost:5000/admin
```

### Demo Admin Credentials

```text
Admin ID: admin
Password: admin123
```

> These are demo credentials included for the educational project. They should be replaced with a secure authentication system before production use.

---

# 🔌 API Endpoints

## Products

### Get Products

```http
GET /api/products
```

Returns all available products.

### Add Product

```http
POST /api/products
```

### Update Product

```http
PUT /api/products/:id
```

### Delete Product

```http
DELETE /api/products/:id
```

---

## Customer Authentication

### Register

```http
POST /api/register
```

### Login

```http
POST /api/login
```

### Get Customer

```http
GET /api/users/:userId
```

---

## Orders

### Place Order

```http
POST /api/orders
```

### Get Customer Orders

```http
GET /api/orders/:userId
```

---

## Admin

### Admin Login

```http
POST /api/admin/login
```

### Get All Orders

```http
GET /api/admin/orders
```

### Update Order Status

```http
PUT /api/admin/orders/:id
```

### Get Customers

```http
GET /api/admin/customers
```

### Get Dashboard Statistics

```http
GET /api/admin/stats
```

---

# 📦 Order Statuses

Orders can have the following statuses:

```text
Pending
Confirmed
Preparing
Out for Delivery
Delivered
Cancelled
```

---

# 🗃️ Database Collections

The application uses three main MongoDB collections.

### Users

Stores customer information such as:

```text
userId
password
name
phone
address
createdAt
```

### Products

Stores:

```text
name
description
price
category
image
available
rating
createdAt
```

### Orders

Stores:

```text
userId
customerName
phone
address
items
subtotal
deliveryFee
totalPrice
status
createdAt
```

---

# 🌐 Deployment

The recommended deployment architecture is:

```text
GitHub
   │
   ▼
Render
   │
   ├── Node.js
   └── Express.js
          │
          ▼
     MongoDB Atlas
```

## Deploying to Render

Push the project to GitHub.

Then create a new **Web Service** on Render and connect your GitHub repository.

Use:

### Build Command

```bash
npm install
```

### Start Command

```bash
npm start
```

Add the following environment variable in Render:

```text
MONGO_URI
```

Set its value to your MongoDB Atlas connection string.

Render will then start the application using the project's `npm start` script.

---

# 🔒 Security Notice

This project is intended for educational purposes.

The current authentication implementation is intentionally simple and should **not be considered production-grade authentication**.

Before using Bloomora for a real business, consider implementing:

- Password hashing with bcrypt
- Secure sessions or JWT authentication
- Secure admin authentication
- HTTPS
- CSRF protection
- Rate limiting
- Input validation
- Authorization middleware
- Protected admin API routes
- Secure environment variables
- Strong admin credentials
- Proper password-reset functionality
- Production database security

Never commit:

```text
.env
MongoDB passwords
API keys
private credentials
```

to GitHub.

---

# 🧪 Testing Checklist

Before deployment, test:

### Customer

- [ ] Homepage loads
- [ ] Products load
- [ ] Product images display
- [ ] Registration works
- [ ] Login works
- [ ] Cart works
- [ ] Checkout works
- [ ] Order placement works
- [ ] Order history works
- [ ] Mobile layout works

### Admin

- [ ] Admin login works
- [ ] Dashboard loads
- [ ] Products can be added
- [ ] Products can be edited
- [ ] Products can be deleted
- [ ] Orders are visible
- [ ] Order status can be updated
- [ ] Customers are visible
- [ ] Dashboard statistics work

### Database

- [ ] MongoDB connection works
- [ ] Products are seeded
- [ ] Customers are stored
- [ ] Orders are stored
- [ ] Data persists after server restart

---

# 🐛 Troubleshooting

## MongoDB connection error

Check:

```text
MONGO_URI
```

Make sure:

- MongoDB Atlas cluster is running
- Database username is correct
- Database password is correct
- IP access/network settings allow the deployment server
- Connection string is valid

---

## Products are not showing

Check the server logs.

The application should successfully connect to MongoDB before loading products.

If the database is empty, the application automatically seeds the default product catalog.

---

## Application doesn't start

Run:

```bash
npm install
```

Then:

```bash
npm start
```

Check the terminal for the actual error message.

---

# 📜 License

This project is intended for educational and academic purposes.

You may modify and extend the project for learning and demonstration.

---

# 🌸 Future Improvements

Possible future improvements include:

- Online payment integration
- Product search
- Advanced product filtering
- Wishlist
- Coupon system
- Email order confirmation
- SMS notifications
- Delivery tracking
- Customer reviews
- Image upload
- Cloud image storage
- Secure authentication
- Role-based admin accounts
- Analytics dashboard
- Inventory management
- Order cancellation
- Password reset
- Production-grade security

---

# 👨‍💻 Project

**Bloomora Flowers**

> Beautiful Flowers. Beautiful Moments. 🌸

Built with **Node.js + Express + MongoDB**.
