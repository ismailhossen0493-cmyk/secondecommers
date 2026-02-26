# KIN Store — Premium E-Commerce Platform

## Folder Structure

```
ecommerce/
├── backend/
│   ├── models/
│   │   ├── User.js          # User model with roles
│   │   ├── Product.js       # Product with colors, sizes, pre-order
│   │   ├── Order.js         # Order model
│   │   └── HeroSlide.js     # Hero slider banners
│   ├── routes/
│   │   ├── auth.js          # Login/Register/JWT
│   │   ├── products.js      # CRUD products
│   │   ├── orders.js        # Order management
│   │   ├── users.js         # User/role management (SuperAdmin)
│   │   └── hero.js          # Hero slider management
│   ├── middleware/
│   │   ├── auth.js          # JWT verification
│   │   └── roles.js         # Role-based access control
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── productController.js
│   │   ├── orderController.js
│   │   └── userController.js
│   ├── utils/
│   │   └── whatsapp.js      # WhatsApp order formatter
│   ├── server.js
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── admin/
│   │   │   │   ├── ProductForm.jsx     # Add/edit with color dropper
│   │   │   │   ├── HeroManager.jsx     # Hero slider editor
│   │   │   │   ├── OrdersTable.jsx
│   │   │   │   └── UserManager.jsx     # Role management (SuperAdmin)
│   │   │   ├── customer/
│   │   │   │   ├── ProductCard.jsx
│   │   │   │   ├── Cart.jsx
│   │   │   │   ├── HeroSlider.jsx      # Auto-changing banners
│   │   │   │   └── CheckoutForm.jsx    # WhatsApp checkout
│   │   │   └── shared/
│   │   │       ├── Navbar.jsx          # With role toggle switch
│   │   │       ├── ThemeToggle.jsx     # Dark/light mode
│   │   │       └── ProtectedRoute.jsx
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── Products.jsx
│   │   │   │   ├── Orders.jsx
│   │   │   │   ├── HeroSlides.jsx
│   │   │   │   └── Users.jsx
│   │   │   └── customer/
│   │   │       ├── Home.jsx
│   │   │       ├── Shop.jsx
│   │   │       ├── ProductDetail.jsx
│   │   │       └── OrderTracking.jsx
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   ├── CartContext.jsx
│   │   │   └── ThemeContext.jsx
│   │   ├── hooks/
│   │   │   └── useColorDropper.js
│   │   ├── utils/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── tailwind.config.js
│   └── package.json
│
└── README.md
```
