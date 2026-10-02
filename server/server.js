const express = require("express");
const cors = require("cors");
const Database = require("better-sqlite3");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = 5000;
const JWT_SECRET = "mystore_secret_2026_change_this_later";

app.use(cors());
app.use(express.json());

const db = new Database("mystore.db");

/* =========================
   DATABASE
========================= */

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'customer',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    category TEXT DEFAULT 'General',
    image TEXT DEFAULT '',
    stock INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_name TEXT,
    phone TEXT,
    address TEXT,
    items TEXT,
    total REAL,
    status TEXT DEFAULT 'Pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

/* =========================
   DEFAULT ADMIN
========================= */

const adminEmail = "admin@mystore.com";
const adminPassword = "Admin@12345";

const existingAdmin = db
  .prepare("SELECT id FROM users WHERE email = ?")
  .get(adminEmail);

if (!existingAdmin) {
  const hashedPassword = bcrypt.hashSync(adminPassword, 10);

  db.prepare(
    "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)"
  ).run(
    "MyStore Admin",
    adminEmail,
    hashedPassword,
    "admin"
  );

  console.log("Default admin created");
}

/* =========================
   DEFAULT PRODUCTS
========================= */

const productCount = db
  .prepare("SELECT COUNT(*) AS count FROM products")
  .get();

if (productCount.count === 0) {
  const insertProduct = db.prepare(
    "INSERT INTO products (name, price, category, image, stock) VALUES (?, ?, ?, ?, ?)"
  );

  insertProduct.run(
    "Wireless Headphones",
    1499,
    "Electronics",
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
    20
  );

  insertProduct.run(
    "Smart Watch",
    1999,
    "Electronics",
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
    15
  );

  insertProduct.run(
    "Running Shoes",
    2499,
    "Fashion",
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
    10
  );
}

/* =========================
   AUTH MIDDLEWARE
========================= */

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      message: "Authentication required"
    });
  }

  const parts = authHeader.split(" ");

  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return res.status(401).json({
      message: "Invalid authorization format"
    });
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = db
      .prepare(
        "SELECT id, name, email, role FROM users WHERE id = ?"
      )
      .get(decoded.id);

    if (!user) {
      return res.status(401).json({
        message: "User not found"
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token"
    });
  }
}

function adminOnly(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({
      message: "Admin access required"
    });
  }

  next();
}

/* =========================
   BASIC
========================= */

app.get("/", function (req, res) {
  res.send("MyStore Backend + Database is working!");
});

/* =========================
   SIGNUP
========================= */

app.post("/api/auth/signup", function (req, res) {
  try {
    const name = String(req.body.name || "").trim();
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required"
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters"
      });
    }

    const existingUser = db
      .prepare("SELECT id FROM users WHERE email = ?")
      .get(email);

    if (existingUser) {
      return res.status(409).json({
        message: "Email already registered"
      });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    const result = db
      .prepare(
        "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)"
      )
      .run(name, email, hashedPassword, "customer");

    const user = {
      id: result.lastInsertRowid,
      name: name,
      email: email,
      role: "customer"
    };

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role
      },
      JWT_SECRET,
      {
        expiresIn: "7d"
      }
    );

    res.json({
      message: "Signup successful",
      token: token,
      user: user
    });
  } catch (error) {
    console.error("Signup error:", error);

    res.status(500).json({
      message: "Signup failed"
    });
  }
});

/* =========================
   LOGIN
========================= */

app.post("/api/auth/login", function (req, res) {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required"
      });
    }

    const user = db
      .prepare("SELECT * FROM users WHERE email = ?")
      .get(email);

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    const passwordMatch = bcrypt.compareSync(
      password,
      user.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role
      },
      JWT_SECRET,
      {
        expiresIn: "7d"
      }
    );

    res.json({
      message: "Login successful",
      token: token,
      user: safeUser
    });
  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
      message: "Login failed"
    });
  }
});

/* =========================
   CURRENT USER
========================= */

app.get("/api/auth/me", authenticate, function (req, res) {
  res.json({
    user: req.user
  });
});

/* =========================
   PRODUCTS
========================= */

app.get("/api/products", function (req, res) {
  try {
    const products = db
      .prepare("SELECT * FROM products ORDER BY id DESC")
      .all();

    res.json(products);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to load products"
    });
  }
});

/* =========================
   ADD PRODUCT - ADMIN
========================= */

app.post(
  "/api/products",
  authenticate,
  adminOnly,
  function (req, res) {
    try {
      const name = String(req.body.name || "").trim();
      const price = Number(req.body.price);
      const category = String(
        req.body.category || "General"
      ).trim();
      const image = String(req.body.image || "").trim();
      const stock = Number(req.body.stock || 0);

      if (!name || !Number.isFinite(price)) {
        return res.status(400).json({
          message: "Product name and valid price are required"
        });
      }

      const result = db
        .prepare(
          "INSERT INTO products (name, price, category, image, stock) VALUES (?, ?, ?, ?, ?)"
        )
        .run(
          name,
          price,
          category,
          image,
          stock
        );

      const product = db
        .prepare("SELECT * FROM products WHERE id = ?")
        .get(result.lastInsertRowid);

      res.json(product);
    } catch (error) {
      console.error(error);

      res.status(500).json({
        message: "Failed to add product"
      });
    }
  }
);

/* =========================
   UPDATE PRODUCT - ADMIN
========================= */

app.put(
  "/api/products/:id",
  authenticate,
  adminOnly,
  function (req, res) {
    try {
      const id = Number(req.params.id);

      const name = String(req.body.name || "").trim();
      const price = Number(req.body.price);
      const category = String(
        req.body.category || "General"
      ).trim();
      const image = String(req.body.image || "").trim();
      const stock = Number(req.body.stock || 0);

      const existing = db
        .prepare("SELECT id FROM products WHERE id = ?")
        .get(id);

      if (!existing) {
        return res.status(404).json({
          message: "Product not found"
        });
      }

      db.prepare(
        "UPDATE products SET name = ?, price = ?, category = ?, image = ?, stock = ? WHERE id = ?"
      ).run(
        name,
        price,
        category,
        image,
        stock,
        id
      );

      const product = db
        .prepare("SELECT * FROM products WHERE id = ?")
        .get(id);

      res.json(product);
    } catch (error) {
      console.error(error);

      res.status(500).json({
        message: "Failed to update product"
      });
    }
  }
);

/* =========================
   DELETE PRODUCT - ADMIN
========================= */

app.delete(
  "/api/products/:id",
  authenticate,
  adminOnly,
  function (req, res) {
    try {
      const id = Number(req.params.id);

      const result = db
        .prepare("DELETE FROM products WHERE id = ?")
        .run(id);

      if (result.changes === 0) {
        return res.status(404).json({
          message: "Product not found"
        });
      }

      res.json({
        message: "Product deleted"
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        message: "Failed to delete product"
      });
    }
  }
);

/* =========================
   CREATE ORDER
========================= */

app.post("/api/orders", function (req, res) {
  try {
    const customerName = String(
      req.body.customer_name || req.body.customerName || ""
    ).trim();

    const phone = String(
      req.body.phone || ""
    ).trim();

    const address = String(
      req.body.address || ""
    ).trim();

    const items = req.body.items || [];
    const total = Number(req.body.total || 0);

    if (!customerName || !phone || !address) {
      return res.status(400).json({
        message: "Customer name, phone and address are required"
      });
    }

    const result = db
      .prepare(
        "INSERT INTO orders (customer_name, phone, address, items, total, status) VALUES (?, ?, ?, ?, ?, ?)"
      )
      .run(
        customerName,
        phone,
        address,
        JSON.stringify(items),
        total,
        "Pending"
      );

    res.json({
      message: "Order placed successfully",
      orderId: result.lastInsertRowid
    });
  } catch (error) {
    console.error("Order error:", error);

    res.status(500).json({
      message: "Failed to place order"
    });
  }
});

/* =========================
   GET ORDERS - ADMIN
========================= */

app.get(
  "/api/orders",
  authenticate,
  adminOnly,
  function (req, res) {
    try {
      const orders = db
        .prepare(
          "SELECT * FROM orders ORDER BY id DESC"
        )
        .all();

      const formattedOrders = orders.map(function (order) {
        let items = [];

        try {
          items = JSON.parse(order.items || "[]");
        } catch (error) {
          items = [];
        }

        return {
          id: order.id,
          customer_name: order.customer_name,
          phone: order.phone,
          address: order.address,
          items: items,
          total: order.total,
          status: order.status,
          created_at: order.created_at
        };
      });

      res.json(formattedOrders);
    } catch (error) {
      console.error(error);

      res.status(500).json({
        message: "Failed to load orders"
      });
    }
  }
);

/* =========================
   UPDATE ORDER STATUS - ADMIN
========================= */

app.put(
  "/api/orders/:id/status",
  authenticate,
  adminOnly,
  function (req, res) {
    try {
      const id = Number(req.params.id);
      const status = String(
        req.body.status || ""
      ).trim();

      const allowedStatuses = [
        "Pending",
        "Confirmed",
        "Processing",
        "Shipped",
        "Delivered",
        "Cancelled"
      ];

      if (allowedStatuses.indexOf(status) === -1) {
        return res.status(400).json({
          message: "Invalid order status"
        });
      }

      const result = db
        .prepare(
          "UPDATE orders SET status = ? WHERE id = ?"
        )
        .run(status, id);

      if (result.changes === 0) {
        return res.status(404).json({
          message: "Order not found"
        });
      }

      res.json({
        message: "Order status updated",
        status: status
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        message: "Failed to update order status"
      });
    }
  }
);

/* =========================
   SERVER
========================= */

app.listen(PORT, function () {
  console.log("");
  console.log("================================");
  console.log("MyStore Backend + Database");
  console.log("http://localhost:" + PORT);
  console.log("================================");
  console.log("");
  console.log("Admin Login:");
  console.log("Email: admin@mystore.com");
  console.log("Password: Admin@12345");
  console.log("");
});