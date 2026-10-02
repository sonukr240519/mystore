import { useEffect, useState } from "react";
import "./App.css";

const API = "http://localhost:5000";

const demoProducts = [
  {
    id: 1,
    name: "Wireless Headphones",
    price: 1499,
    oldPrice: 2499,
    category: "Electronics",
    rating: 4.7,
    reviews: 128,
    stock: 20,
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80",
    description:
      "Premium wireless headphones with deep bass, clear sound and comfortable ear cushions."
  },
  {
    id: 2,
    name: "Smart Watch",
    price: 1999,
    oldPrice: 2999,
    category: "Electronics",
    rating: 4.6,
    reviews: 96,
    stock: 15,
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80",
    description:
      "Modern smart watch with fitness tracking, notifications and long battery life."
  },
  {
    id: 3,
    name: "Running Shoes",
    price: 2499,
    oldPrice: 3999,
    category: "Fashion",
    rating: 4.8,
    reviews: 174,
    stock: 10,
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80",
    description:
      "Lightweight running shoes designed for comfort, walking and workouts."
  },
  {
    id: 4,
    name: "Premium Backpack",
    price: 1299,
    oldPrice: 1999,
    category: "Fashion",
    rating: 4.5,
    reviews: 83,
    stock: 25,
    image:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=80",
    description:
      "Durable backpack with multiple compartments for laptop, books and accessories."
  },
  {
    id: 5,
    name: "Modern Sunglasses",
    price: 899,
    oldPrice: 1499,
    category: "Fashion",
    rating: 4.4,
    reviews: 61,
    stock: 30,
    image:
      "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=900&q=80",
    description:
      "Stylish sunglasses with a modern frame and comfortable everyday fit."
  },
  {
    id: 6,
    name: "Mechanical Keyboard",
    price: 1799,
    oldPrice: 2499,
    category: "Electronics",
    rating: 4.7,
    reviews: 112,
    stock: 18,
    image:
      "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=900&q=80",
    description:
      "Mechanical keyboard with responsive keys and premium build quality."
  }
];

function App() {
  const [products, setProducts] = useState(demoProducts);
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [page, setPage] = useState("home");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState("");

  const [user, setUser] = useState(null);
  const [token, setToken] = useState("");

  useEffect(function () {
    const savedToken = localStorage.getItem("mystore_token");
    const savedUser = localStorage.getItem("mystore_user");

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
  }, []);

  useEffect(function () {
    loadProducts();
  }, []);

  function loadProducts() {
    fetch(API + "/api/products")
      .then(function (res) {
        return res.json();
      })
      .then(function (data) {
        if (Array.isArray(data) && data.length > 0) {
          const updated = data.map(function (product, index) {
            const demo = demoProducts[index % demoProducts.length];

            return {
              ...product,
              oldPrice: demo.oldPrice,
              rating: demo.rating,
              reviews: demo.reviews,
              description: demo.description,
              image: product.image || demo.image
            };
          });

          setProducts(updated);
        }
      })
      .catch(function () {
        setProducts(demoProducts);
      });
  }

  function showMessage(text) {
    setMessage(text);

    setTimeout(function () {
      setMessage("");
    }, 2200);
  }

  function saveLogin(data) {
    localStorage.setItem("mystore_token", data.token);
    localStorage.setItem("mystore_user", JSON.stringify(data.user));

    setToken(data.token);
    setUser(data.user);
  }

  function logout() {
    localStorage.removeItem("mystore_token");
    localStorage.removeItem("mystore_user");

    setToken("");
    setUser(null);
    setPage("home");

    showMessage("Logged out successfully");
  }

  function openProduct(product) {
    setSelectedProduct(product);
    setQuantity(1);
    setPage("details");
    window.scrollTo(0, 0);
  }

  function addToCart(product, qty) {
    const amount = qty || 1;

    setCart(function (oldCart) {
      const exists = oldCart.find(function (item) {
        return item.id === product.id;
      });

      if (exists) {
        return oldCart.map(function (item) {
          if (item.id === product.id) {
            return {
              ...item,
              quantity: item.quantity + amount
            };
          }

          return item;
        });
      }

      return [
        ...oldCart,
        {
          ...product,
          quantity: amount
        }
      ];
    });

    showMessage(product.name + " added to cart");
  }

  function removeFromCart(id) {
    setCart(function (oldCart) {
      return oldCart.filter(function (item) {
        return item.id !== id;
      });
    });
  }

  function changeQuantity(id, change) {
    setCart(function (oldCart) {
      return oldCart
        .map(function (item) {
          if (item.id === id) {
            return {
              ...item,
              quantity: item.quantity + change
            };
          }

          return item;
        })
        .filter(function (item) {
          return item.quantity > 0;
        });
    });
  }

  function toggleWishlist(product) {
    const exists = wishlist.some(function (item) {
      return item.id === product.id;
    });

    if (exists) {
      setWishlist(function (oldList) {
        return oldList.filter(function (item) {
          return item.id !== product.id;
        });
      });

      showMessage("Removed from wishlist");
    } else {
      setWishlist(function (oldList) {
        return [...oldList, product];
      });

      showMessage("Added to wishlist");
    }
  }

  function isWishlisted(id) {
    return wishlist.some(function (item) {
      return item.id === id;
    });
  }

  const categories = ["All", "Electronics", "Fashion"];

  const filteredProducts = products.filter(function (product) {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesCategory =
      category === "All" || product.category === category;

    return matchesSearch && matchesCategory;
  });

  const cartTotal = cart.reduce(function (total, item) {
    return total + item.price * item.quantity;
  }, 0);

  const cartCount = cart.reduce(function (total, item) {
    return total + item.quantity;
  }, 0);

  function Header() {
    return (
      <>
        <header className="header">
          <div
            className="logo"
            onClick={function () {
              setPage("home");
              window.scrollTo(0, 0);
            }}
          >
            My<span>Store</span>
          </div>

          <div className="searchBox">
            <span>⌕</span>

            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={function (e) {
                setSearch(e.target.value);
                setPage("home");
              }}
            />
          </div>

          <div className="headerActions">
            {user ? (
              <button
                title={user.name}
                onClick={function () {
                  if (user.role === "admin") {
                    setPage("admin");
                  } else {
                    setPage("account");
                  }
                }}
              >
                👤
              </button>
            ) : (
              <button
                onClick={function () {
                  setPage("login");
                }}
              >
                👤
              </button>
            )}

            <button
              onClick={function () {
                setPage("wishlist");
              }}
            >
              ♡
              {wishlist.length > 0 && (
                <b className="countBadge">{wishlist.length}</b>
              )}
            </button>

            <button
              onClick={function () {
                setPage("cart");
              }}
            >
              🛒
              {cartCount > 0 && (
                <b className="countBadge">{cartCount}</b>
              )}
            </button>
          </div>
        </header>

        <nav className="categoryBar">
          {categories.map(function (item) {
            return (
              <button
                key={item}
                className={category === item ? "activeCategory" : ""}
                onClick={function () {
                  setCategory(item);
                  setPage("home");
                }}
              >
                {item}
              </button>
            );
          })}

          {user && user.role === "admin" && (
            <button
              onClick={function () {
                setPage("admin");
              }}
            >
              Admin
            </button>
          )}
        </nav>
      </>
    );
  }

  function Home() {
    return (
      <>
        <section className="hero">
          <div className="heroContent">
            <p className="heroSmall">NEW COLLECTION 2026</p>

            <h1>
              Upgrade Your
              <br />
              <span>Everyday Life.</span>
            </h1>

            <p>
              Discover premium products at prices you'll love.
              Fast delivery and secure shopping.
            </p>

            <button
              className="primaryButton"
              onClick={function () {
                document
                  .getElementById("products")
                  .scrollIntoView({ behavior: "smooth" });
              }}
            >
              Shop Now →
            </button>
          </div>

          <div className="heroCircle">
            <img
              src={products[0] ? products[0].image : demoProducts[0].image}
              alt="Featured"
            />
          </div>
        </section>

        <section className="benefits">
          <div>
            <strong>🚚 Free Delivery</strong>
            <span>On orders above ₹999</span>
          </div>

          <div>
            <strong>🔒 Secure Payment</strong>
            <span>100% secure checkout</span>
          </div>

          <div>
            <strong>↩️ Easy Returns</strong>
            <span>7 day return policy</span>
          </div>

          <div>
            <strong>⚡ Fast Support</strong>
            <span>We're here to help</span>
          </div>
        </section>

        <section className="productsSection" id="products">
          <div className="sectionHeading">
            <div>
              <p>OUR COLLECTION</p>
              <h2>Popular Products</h2>
            </div>

            <span>{filteredProducts.length} products</span>
          </div>

          <div className="productGrid">
            {filteredProducts.map(function (product) {
              const discount =
                product.oldPrice > product.price
                  ? Math.round(
                      ((product.oldPrice - product.price) /
                        product.oldPrice) *
                        100
                    )
                  : 0;

              return (
                <div className="productCard" key={product.id}>
                  <div
                    className="productImage"
                    onClick={function () {
                      openProduct(product);
                    }}
                  >
                    {discount > 0 && (
                      <span className="discount">{discount}% OFF</span>
                    )}

                    <button
                      className={
                        "heartButton " +
                        (isWishlisted(product.id) ? "liked" : "")
                      }
                      onClick={function (e) {
                        e.stopPropagation();
                        toggleWishlist(product);
                      }}
                    >
                      {isWishlisted(product.id) ? "♥️" : "♡"}
                    </button>

                    <img src={product.image} alt={product.name} />
                  </div>

                  <div className="productInfo">
                    <span className="productCategory">
                      {product.category}
                    </span>

                    <h3
                      onClick={function () {
                        openProduct(product);
                      }}
                    >
                      {product.name}
                    </h3>

                    <div className="rating">
                      ★ {product.rating || "4.5"}
                      <span>({product.reviews || 0})</span>
                    </div>

                    <div className="priceRow">
                      <strong>₹{product.price}</strong>
                      {product.oldPrice && (
                        <del>₹{product.oldPrice}</del>
                      )}
                    </div>

                    <button
                      className="addButton"
                      onClick={function () {
                        addToCart(product);
                      }}
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </>
    );
  }

  function AuthPage() {
    const [mode, setMode] = useState("login");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    function submitAuth(e) {
      e.preventDefault();

      if (!email || !password || (mode === "signup" && !name)) {
        showMessage("Please fill all fields");
        return;
      }

      setLoading(true);

      const endpoint =
        mode === "login"
          ? "/api/auth/login"
          : "/api/auth/signup";

      fetch(API + endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: name,
          email: email,
          password: password
        })
      })
        .then(function (res) {
          return res.json().then(function (data) {
            return {
              ok: res.ok,
              data: data
            };
          });
        })
        .then(function (result) {
          setLoading(false);

          if (!result.ok) {
            showMessage(result.data.message || "Authentication failed");
            return;
          }

          saveLogin(result.data);
          showMessage("Welcome to MyStore");

          if (result.data.user.role === "admin") {
            setPage("admin");
          } else {
            setPage("home");
          }
        })
        .catch(function () {
          setLoading(false);
          showMessage("Backend connection failed");
        });
    }

    return (
      <section className="authPage">
        <div className="authCard">
          <div className="authLogo">
            My<span>Store</span>
          </div>

          <p className="authSmall">
            {mode === "login"
              ? "WELCOME BACK"
              : "CREATE YOUR ACCOUNT"}
          </p>

          <h1>
            {mode === "login" ? "Login" : "Create Account"}
          </h1>

          <p className="authSub">
            {mode === "login"
              ? "Login to continue shopping."
              : "Join MyStore and start shopping."}
          </p>

          <form onSubmit={submitAuth}>
            {mode === "signup" && (
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={function (e) {
                  setName(e.target.value);
                }}
              />
            )}

            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={function (e) {
                setEmail(e.target.value);
              }}
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={function (e) {
                setPassword(e.target.value);
              }}
            />

            <button className="authButton" disabled={loading}>
              {loading
                ? "Please wait..."
                : mode === "login"
                ? "Login"
                : "Create Account"}
            </button>
          </form>

          <div className="authSwitch">
            {mode === "login" ? (
              <>
                Don't have an account?
                <button
                  onClick={function () {
                    setMode("signup");
                  }}
                >
                  Sign Up
                </button>
              </>
            ) : (
              <>
                Already have an account?
                <button
                  onClick={function () {
                    setMode("login");
                  }}
                >
                  Login
                </button>
              </>
            )}
          </div>

          <button
            className="backButton authBack"
            onClick={function () {
              setPage("home");
            }}
          >
            ← Back to store
          </button>
        </div>
      </section>
    );
  }

  function AccountPage() {
    return (
      <section className="accountPage">
        <div className="accountCard">
          <div className="accountAvatar">👤</div>

          <h1>{user ? user.name : "My Account"}</h1>

          <p>{user ? user.email : ""}</p>

          <div className="accountInfo">
            <div>
              <span>Account Type</span>
              <strong>Customer</strong>
            </div>

            <div>
              <span>Email</span>
              <strong>{user ? user.email : ""}</strong>
            </div>
          </div>

          <button
            className="primaryButton fullButton"
            onClick={function () {
              logout();
            }}
          >
            Logout
          </button>
        </div>
      </section>
    );
  }

  function ProductDetails() {
    if (!selectedProduct) {
      return null;
    }

    const product = selectedProduct;

    const discount =
      product.oldPrice > product.price
        ? Math.round(
            ((product.oldPrice - product.price) /
              product.oldPrice) *
              100
          )
        : 0;

    return (
      <section className="detailsPage">
        <button
          className="backButton"
          onClick={function () {
            setPage("home");
          }}
        >
          ← Back to products
        </button>

        <div className="detailsCard">
          <div className="detailsImageBox">
            {discount > 0 && (
              <span className="detailsDiscount">
                {discount}% OFF
              </span>
            )}

            <button
              className={
                "detailsHeart " +
                (isWishlisted(product.id) ? "liked" : "")
              }
              onClick={function () {
                toggleWishlist(product);
              }}
            >
              {isWishlisted(product.id) ? "♥️" : "♡"}
            </button>

            <img src={product.image} alt={product.name} />
          </div>

          <div className="detailsInfo">
            <span className="detailsCategory">
              {product.category}
            </span>

            <h1>{product.name}</h1>

            <div className="bigRating">
              <span>★ {product.rating || "4.5"}</span>
              <span>{product.reviews || 0} Reviews</span>
            </div>

            <div className="detailsPrice">
              <strong>₹{product.price}</strong>

              {product.oldPrice && (
                <del>₹{product.oldPrice}</del>
              )}

              {discount > 0 && <span>Save {discount}%</span>}
            </div>

            <p className="detailsDescription">
              {product.description ||
                "Premium quality product for everyday use."}
            </p>

            <div className="stockBox">
              <span>●</span>
              {product.stock > 0
                ? product.stock + " items available"
                : "Out of stock"}
            </div>

            <div className="deliveryBox">
              <div>
                🚚
                <div>
                  <strong>Free Delivery</strong>
                  <small>Delivered within 3–5 days</small>
                </div>
              </div>

              <div>
                ↩️
                <div>
                  <strong>Easy Returns</strong>
                  <small>7 days return available</small>
                </div>
              </div>
            </div>

            <div className="quantityArea">
              <span>Quantity</span>

              <div className="quantityControl">
                <button
                  onClick={function () {
                    if (quantity > 1) {
                      setQuantity(quantity - 1);
                    }
                  }}
                >
                  −
                </button>

                <strong>{quantity}</strong>

                <button
                  onClick={function () {
                    if (quantity < product.stock) {
                      setQuantity(quantity + 1);
                    }
                  }}
                >
                  +
                </button>
              </div>
            </div>

            <div className="detailsButtons">
              <button
                className="buyButton"
                onClick={function () {
                  addToCart(product, quantity);
                  setPage("cart");
                }}
              >
                Buy Now
              </button>

              <button
                className="detailsCartButton"
                onClick={function () {
                  addToCart(product, quantity);
                }}
              >
                🛒 Add to Cart
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  function Cart() {
    return (
      <section className="cartPage">
        <div className="sectionHeading">
          <div>
            <p>YOUR SHOPPING BAG</p>
            <h2>Shopping Cart</h2>
          </div>
        </div>

        {cart.length === 0 ? (
          <div className="emptyBox">
            <div>🛒</div>
            <h2>Your cart is empty</h2>
            <p>Add products to get started.</p>

            <button
              className="primaryButton"
              onClick={function () {
                setPage("home");
              }}
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="cartLayout">
            <div className="cartItems">
              {cart.map(function (item) {
                return (
                  <div className="cartItem" key={item.id}>
                    <img src={item.image} alt={item.name} />

                    <div className="cartItemInfo">
                      <span>{item.category}</span>
                      <h3>{item.name}</h3>
                      <strong>₹{item.price}</strong>
                    </div>

                    <div className="quantityControl">
                      <button
                        onClick={function () {
                          changeQuantity(item.id, -1);
                        }}
                      >
                        −
                      </button>

                      <strong>{item.quantity}</strong>

                      <button
                        onClick={function () {
                          changeQuantity(item.id, 1);
                        }}
                      >
                        +
                      </button>
                    </div>

                    <strong className="itemTotal">
                      ₹{item.price * item.quantity}
                    </strong>

                    <button
                      className="removeButton"
                      onClick={function () {
                        removeFromCart(item.id);
                      }}
                    >
                      ×
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="summary">
              <h2>Order Summary</h2>

              <div>
                <span>Subtotal</span>
                <strong>₹{cartTotal}</strong>
              </div>

              <div>
                <span>Delivery</span>
                <strong>{cartTotal >= 999 ? "FREE" : "₹49"}</strong>
              </div>

              <hr />

              <div className="grandTotal">
                <span>Total</span>
                <strong>
                  ₹{cartTotal >= 999 ? cartTotal : cartTotal + 49}
                </strong>
              </div>

              <button
                className="primaryButton fullButton"
                onClick={function () {
                  setPage("checkout");
                }}
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        )}
      </section>
    );
  }

  function Wishlist() {
    return (
      <section className="productsSection">
        <div className="sectionHeading">
          <div>
            <p>SAVED PRODUCTS</p>
            <h2>My Wishlist</h2>
          </div>
        </div>

        {wishlist.length === 0 ? (
          <div className="emptyBox">
            <div>♡</div>
            <h2>Your wishlist is empty</h2>
            <p>Save products you want to buy later.</p>
          </div>
        ) : (
          <div className="productGrid">
            {wishlist.map(function (product) {
              return (
                <div className="productCard" key={product.id}>
                  <div
                    className="productImage"
                    onClick={function () {
                      openProduct(product);
                    }}
                  >
                    <button
                      className="heartButton liked"
                      onClick={function (e) {
                        e.stopPropagation();
                        toggleWishlist(product);
                      }}
                    >
                      ♥️
                    </button>

                    <img src={product.image} alt={product.name} />
                  </div>

                  <div className="productInfo">
                    <span className="productCategory">
                      {product.category}
                    </span>

                    <h3>{product.name}</h3>

                    <div className="priceRow">
                      <strong>₹{product.price}</strong>
                    </div>

                    <button
                      className="addButton"
                      onClick={function () {
                        addToCart(product);
                      }}
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    );
  }

  function Checkout() {
    const [name, setName] = useState(user ? user.name : "");
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");

    function placeOrder() {
      if (!name || !phone || !address) {
        showMessage("Please fill all details");
        return;
      }

      fetch(API + "/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          user_id: user ? user.id : null,
          customer_name: name,
          phone: phone,
          address: address,
          items: JSON.stringify(cart),
          total: cartTotal >= 999 ? cartTotal : cartTotal + 49
        })
      })
        .then(function (res) {
          return res.json();
        })
        .then(function (data) {
          if (data.orderId) {
            setCart([]);
            setPage("success");
          } else {
            showMessage(data.message || "Order failed");
          }
        })
        .catch(function () {
          showMessage("Backend connection failed");
        });
    }

    return (
      <section className="checkoutPage">
        <div className="checkoutBox">
          <p>CHECKOUT</p>
          <h2>Delivery Details</h2>

          {!user && (
            <div className="loginNotice">
              Login is recommended so you can track your orders.
              <button
                onClick={function () {
                  setPage("login");
                }}
              >
                Login
              </button>
            </div>
          )}

          <input
            placeholder="Full Name"
            value={name}
            onChange={function (e) {
              setName(e.target.value);
            }}
          />

          <input
            placeholder="Mobile Number"
            value={phone}
            onChange={function (e) {
              setPhone(e.target.value);
            }}
          />

          <textarea
            placeholder="Complete Address"
            value={address}
            onChange={function (e) {
              setAddress(e.target.value);
            }}
          />

          <button className="primaryButton" onClick={placeOrder}>
            Place Order
          </button>
        </div>

        <div className="summary">
          <h2>Order Total</h2>

          <div>
            <span>Items</span>
            <strong>₹{cartTotal}</strong>
          </div>

          <div>
            <span>Delivery</span>
            <strong>{cartTotal >= 999 ? "FREE" : "₹49"}</strong>
          </div>

          <hr />

          <div className="grandTotal">
            <span>Total</span>
            <strong>
              ₹{cartTotal >= 999 ? cartTotal : cartTotal + 49}
            </strong>
          </div>
        </div>
      </section>
    );
  }

  function Success() {
    return (
      <section className="successPage">
        <div className="successBox">
          <div className="successIcon">✓</div>

          <h1>Order Placed!</h1>

          <p>
            Thank you for shopping with MyStore.
            Your order has been received successfully.
          </p>

          <button
            className="primaryButton"
            onClick={function () {
              setPage("home");
            }}
          >
            Continue Shopping
          </button>
        </div>
      </section>
    );
  }

  function AdminDashboard() {
    const [orders, setOrders] = useState([]);
    const [editingId, setEditingId] = useState(null);

    const [form, setForm] = useState({
      name: "",
      price: "",
      category: "Electronics",
      image: "",
      stock: ""
    });

    useEffect(function () {
      if (user && user.role === "admin") {
        loadOrders();
      }
    }, []);

    function authHeaders() {
      return {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token
      };
    }

    function loadOrders() {
      fetch(API + "/api/orders", {
        headers: {
          Authorization: "Bearer " + token
        }
      })
        .then(function (res) {
          return res.json();
        })
        .then(function (data) {
          if (Array.isArray(data)) {
            setOrders(data);
          }
        })
        .catch(function () {
          showMessage("Could not load orders");
        });
    }

    function resetForm() {
      setForm({
        name: "",
        price: "",
        category: "Electronics",
        image: "",
        stock: ""
      });

      setEditingId(null);
    }

    function saveProduct(e) {
      e.preventDefault();

      if (!form.name || !form.price || !form.stock) {
        showMessage("Fill product details");
        return;
      }

      const method = editingId ? "PUT" : "POST";
      const url = editingId
        ? API + "/api/products/" + editingId
        : API + "/api/products";

      fetch(url, {
        method: method,
        headers: authHeaders(),
        body: JSON.stringify({
          name: form.name,
          price: Number(form.price),
          category: form.category,
          image: form.image,
          stock: Number(form.stock)
        })
      })
        .then(function (res) {
          return res.json();
        })
        .then(function (data) {
          if (data.message && !data.id) {
            showMessage(data.message);
            return;
          }

          showMessage(
            editingId
              ? "Product updated"
              : "Product added successfully"
          );

          resetForm();
          loadProducts();
        })
        .catch(function () {
          showMessage("Product operation failed");
        });
    }

    function editProduct(product) {
      setEditingId(product.id);

      setForm({
        name: product.name,
        price: product.price,
        category: product.category || "General",
        image: product.image || "",
        stock: product.stock
      });

      window.scrollTo(0, 0);
    }

    function deleteProduct(id) {
      const confirmed = window.confirm(
        "Delete this product permanently?"
      );

      if (!confirmed) {
        return;
      }

      fetch(API + "/api/products/" + id, {
        method: "DELETE",
        headers: {
          Authorization: "Bearer " + token
        }
      })
        .then(function (res) {
          return res.json();
        })
        .then(function (data) {
          showMessage(data.message || "Product deleted");
          loadProducts();
        })
        .catch(function () {
          showMessage("Delete failed");
        });
    }

    function updateStatus(id, status) {
      fetch(API + "/api/orders/" + id + "/status", {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({
          status: status
        })
      })
        .then(function (res) {
          return res.json();
        })
        .then(function (data) {
          showMessage(data.message || "Status updated");
          loadOrders();
        })
        .catch(function () {
          showMessage("Status update failed");
        });
    }

    if (!user || user.role !== "admin") {
      return (
        <section className="adminPage">
          <div className="emptyBox">
            <div>🔒</div>
            <h2>Admin Access Required</h2>
            <p>Please login with an administrator account.</p>

            <button
              className="primaryButton"
              onClick={function () {
                setPage("login");
              }}
            >
              Admin Login
            </button>
          </div>
        </section>
      );
    }

    const totalProducts = products.length;
    const totalStock = products.reduce(function (sum, product) {
      return sum + Number(product.stock || 0);
    }, 0);

    const totalOrders = orders.length;

    const totalSales = orders.reduce(function (sum, order) {
      return sum + Number(order.total || 0);
    }, 0);

    return (
      <section className="adminPage">
        <div className="adminHeader">
          <div>
            <p>MY STORE CONTROL CENTER</p>
            <h1>Admin Dashboard</h1>
            <span>
              Welcome, {user.name}
            </span>
          </div>

          <button
            className="adminLogout"
            onClick={function () {
              logout();
            }}
          >
            Logout
          </button>
        </div>

        <div className="adminStats">
          <div>
            <span>Products</span>
            <strong>{totalProducts}</strong>
          </div>

          <div>
            <span>Total Stock</span>
            <strong>{totalStock}</strong>
          </div>

          <div>
            <span>Orders</span>
            <strong>{totalOrders}</strong>
          </div>

          <div>
            <span>Sales</span>
            <strong>₹{totalSales}</strong>
          </div>
        </div>

        <div className="adminGrid">
          <div className="adminPanel">
            <div className="adminPanelTitle">
              <div>
                <p>CATALOG</p>
                <h2>
                  {editingId
                    ? "Edit Product"
                    : "Add New Product"}
                </h2>
              </div>

              {editingId && (
                <button
                  className="cancelEdit"
                  onClick={resetForm}
                >
                  Cancel
                </button>
              )}
            </div>

            <form className="productForm" onSubmit={saveProduct}>
              <input
                placeholder="Product Name"
                value={form.name}
                onChange={function (e) {
                  setForm({
                    ...form,
                    name: e.target.value
                  });
                }}
              />

              <div className="formTwo">
                <input
                  type="number"
                  placeholder="Price"
                  value={form.price}
                  onChange={function (e) {
                    setForm({
                      ...form,
                      price: e.target.value
                    });
                  }}
                />

                <input
                  type="number"
                  placeholder="Stock"
                  value={form.stock}
                  onChange={function (e) {
                    setForm({
                      ...form,
                      stock: e.target.value
                    });
                  }}
                />
              </div>

              <select
                value={form.category}
                onChange={function (e) {
                  setForm({
                    ...form,
                    category: e.target.value
                  });
                }}
              >
                <option>Electronics</option>
                <option>Fashion</option>
                <option>Home</option>
                <option>General</option>
              </select>

              <input
                placeholder="Product Image URL"
                value={form.image}
                onChange={function (e) {
                  setForm({
                    ...form,
                    image: e.target.value
                  });
                }}
              />

              <button className="adminSaveButton">
                {editingId
                  ? "Update Product"
                  : "Add Product"}
              </button>
            </form>
          </div>

          <div className="adminPanel">
            <div className="adminPanelTitle">
              <div>
                <p>INVENTORY</p>
                <h2>Products</h2>
              </div>
            </div>

            <div className="adminProducts">
              {products.map(function (product) {
                return (
                  <div className="adminProduct" key={product.id}>
                    <img
                      src={product.image}
                      alt={product.name}
                    />

                    <div>
                      <strong>{product.name}</strong>
                      <span>
                        ₹{product.price} · Stock {product.stock}
                      </span>
                    </div>

                    <button
                      className="editButton"
                      onClick={function () {
                        editProduct(product);
                      }}
                    >
                      Edit
                    </button>

                    <button
                      className="deleteButton"
                      onClick={function () {
                        deleteProduct(product.id);
                      }}
                    >
                      Delete
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="adminPanel ordersPanel">
          <div className="adminPanelTitle">
            <div>
              <p>SALES</p>
              <h2>Recent Orders</h2>
            </div>

            <button
              className="refreshButton"
              onClick={loadOrders}
            >
              ↻ Refresh
            </button>
          </div>

          {orders.length === 0 ? (
            <div className="adminEmpty">
              No orders yet.
            </div>
          ) : (
            <div className="ordersTable">
              {orders.map(function (order) {
                return (
                  <div className="orderRow" key={order.id}>
                    <div>
                      <strong>Order #{order.id}</strong>
                      <span>{order.customer_name}</span>
                    </div>

                    <div>
                      <span>{order.phone}</span>
                      <small>{order.address}</small>
                    </div>

                    <strong>₹{order.total}</strong>

                    <select
                      value={order.status}
                      onChange={function (e) {
                        updateStatus(
                          order.id,
                          e.target.value
                        );
                      }}
                    >
                      <option>Pending</option>
                      <option>Confirmed</option>
                      <option>Processing</option>
                      <option>Shipped</option>
                      <option>Delivered</option>
                      <option>Cancelled</option>
                    </select>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    );
  }

  return (
    <div className="app">
      <Header />

      {message && <div className="toast">{message}</div>}

      <main>
        {page === "home" && <Home />}
        {page === "details" && <ProductDetails />}
        {page === "login" && <AuthPage />}
        {page === "account" && <AccountPage />}
        {page === "wishlist" && <Wishlist />}
        {page === "cart" && <Cart />}
        {page === "checkout" && <Checkout />}
        {page === "success" && <Success />}
        {page === "admin" && <AdminDashboard />}
      </main>

      <footer>
        <div>
          <h2>
            My<span>Store</span>
          </h2>
          <p>
            Simple, premium and reliable online shopping.
          </p>
        </div>

        <div>
          <h4>Shop</h4>
          <p>Electronics</p>
          <p>Fashion</p>
          <p>New Arrivals</p>
        </div>

        <div>
          <h4>Support</h4>
          <p>Contact Us</p>
          <p>Returns</p>
          <p>Delivery</p>
        </div>

        <div>
          <h4>Secure</h4>
          <p>🔒 Protected Account</p>
          <p>💳 Secure Checkout</p>
        </div>
      </footer>
    </div>
  );
}

export default App;