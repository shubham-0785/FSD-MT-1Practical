const express = require("express");

const app = express();
const PORT = 3000;

// Middleware: read JSON request bodies
app.use(express.json());

// Initial product records (stored only in server memory)
let products = [
  {
    id: 301,
    name: "Wireless Mouse",
    category: "Electronics",
    price: 799,
    quantity: 25,
    inStock: true
  },
  {
    id: 302,
    name: "Notebook",
    category: "Stationery",
    price: 60,
    quantity: 100,
    inStock: true
  },
  {
    id: 303,
    name: "USB Keyboard",
    category: "Electronics",
    price: 999,
    quantity: 0,
    inStock: false
  }
];

// Generate the next unique numeric ID
let nextId = Math.max(...products.map((product) => product.id)) + 1;

// Validate all fields required by the Set C question
function validateProduct(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return "Request body must be a JSON object.";
  }

  const { name, category, price, quantity, inStock } = body;

  if (typeof name !== "string" || name.trim() === "") {
    return "name must be a non-empty string.";
  }

  if (typeof category !== "string" || category.trim() === "") {
    return "category must be a non-empty string.";
  }

  if (typeof price !== "number" || !Number.isFinite(price) || price < 0) {
    return "price must be a valid non-negative number.";
  }

  if (
    typeof quantity !== "number" ||
    !Number.isInteger(quantity) ||
    quantity < 0
  ) {
    return "quantity must be a non-negative integer.";
  }

  if (typeof inStock !== "boolean") {
    return "inStock must be a Boolean (true or false).";
  }

  return null;
}

// 1. GET all products
app.get("/api/products", (req, res) => {
  res.status(200).json(products);
});

// 2. POST a new product
app.post("/api/products", (req, res) => {
  const error = validateProduct(req.body);

  if (error) {
    return res.status(400).json({ error });
  }

  const newProduct = {
    id: nextId++,
    name: req.body.name.trim(),
    category: req.body.category.trim(),
    price: req.body.price,
    quantity: req.body.quantity,
    inStock: req.body.inStock
  };

  products.push(newProduct);
  return res.status(201).json(newProduct);
});

// 6. FILTER products by category
// Keep this route before /api/products/:id so "filter" is not treated as an ID.
app.get("/api/products/filter", (req, res) => {
  const category = req.query.category;

  if (typeof category !== "string" || category.trim() === "") {
    return res.status(400).json({
      error: "Please provide a category query parameter."
    });
  }

  const filteredProducts = products.filter(
    (product) =>
      product.category.toLowerCase() === category.trim().toLowerCase()
  );

  return res.status(200).json(filteredProducts);
});

// 3. GET a product by ID
app.get("/api/products/:id", (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: "Product ID must be a number." });
  }

  const product = products.find((item) => item.id === id);

  if (!product) {
    return res.status(404).json({ error: "Product not found." });
  }

  return res.status(200).json(product);
});

// 4. PUT / update a product
app.put("/api/products/:id", (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: "Product ID must be a number." });
  }

  const productIndex = products.findIndex((item) => item.id === id);

  if (productIndex === -1) {
    return res.status(404).json({ error: "Product not found." });
  }

  const error = validateProduct(req.body);

  if (error) {
    return res.status(400).json({ error });
  }

  const updatedProduct = {
    id,
    name: req.body.name.trim(),
    category: req.body.category.trim(),
    price: req.body.price,
    quantity: req.body.quantity,
    inStock: req.body.inStock
  };

  products[productIndex] = updatedProduct;
  return res.status(200).json(updatedProduct);
});

// 5. DELETE a product
app.delete("/api/products/:id", (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: "Product ID must be a number." });
  }

  const productIndex = products.findIndex((item) => item.id === id);

  if (productIndex === -1) {
    return res.status(404).json({ error: "Product not found." });
  }

  products.splice(productIndex, 1);

  return res.status(200).json({
    message: "Product deleted successfully."
  });
});

// Handle malformed JSON request bodies
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({ error: "Invalid JSON request body." });
  }
  return next(err);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Product Inventory API is running at http://localhost:${PORT}`);
});
