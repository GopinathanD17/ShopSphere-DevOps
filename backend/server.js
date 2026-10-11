
require("dotenv").config();

const dns = require("node:dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const Product = require("./models/Product");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Log incoming requests
app.use(function (req, res, next) {
    console.log(req.method + " " + req.originalUrl);
    next();
});

// Backend home route
app.get("/", function (req, res) {
    res.send("ShopSphere Backend is running!");
});

// Health check
app.get("/api/health", function (req, res) {
    res.json({ status: "ok" });
});

// Get all products
app.get("/api/products", async function (req, res) {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (error) {
        console.error("Failed to fetch products:", error.message);
        res.status(500).json({
            message: "Failed to fetch products"
        });
    }
});

// Get one product's current stock
app.get("/api/products/:id/stock", async function (req, res) {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        res.json({
            productId: product._id,
            name: product.name,
            stock: product.stock
        });
    } catch (error) {
        if (error.name === "CastError") {
            return res.status(400).json({
                message: "Invalid product ID"
            });
        }

        console.error("Failed to fetch stock:", error.message);
        res.status(500).json({
            message: "Failed to fetch stock"
        });
    }
});

// Update product stock
// PATCH /api/products/:id/stock
// Request body: { "stock": 25 }
app.patch("/api/products/:id/stock", async function (req, res) {
    try {
        const stock = req.body.stock;

        if (!Number.isSafeInteger(stock) || stock < 0) {
            return res.status(400).json({
                message: "Stock must be a non-negative whole number"
            });
        }

        const product = await Product.findByIdAndUpdate(
            req.params.id,
            { $set: { stock: stock } },
            {
                new: true,
                runValidators: true
            }
        );

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        return res.json({
            message: "Stock updated successfully",
            productId: product._id,
            name: product.name,
            stock: product.stock
        });
    } catch (error) {
        if (error.name === "CastError") {
            return res.status(400).json({
                message: "Invalid product ID"
            });
        }

        console.error("Stock update failed:", error.message);

        return res.status(500).json({
            message: "Failed to update stock"
        });
    }
});

// Purchase a product and reduce stock
app.post("/api/products/:id/purchase", async function (req, res) {
    try {
        const quantity = req.body.quantity;

        if (!Number.isSafeInteger(quantity) || quantity <= 0) {
            return res.status(400).json({
                message: "Quantity must be a positive whole number"
            });
        }

        const product = await Product.findOneAndUpdate(
            {
                _id: req.params.id,
                stock: { $gte: quantity }
            },
            {
                $inc: { stock: -quantity }
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!product) {
            const existingProduct = await Product.findById(req.params.id);

            if (!existingProduct) {
                return res.status(404).json({
                    message: "Product not found"
                });
            }

            return res.status(409).json({
                message: "Insufficient stock",
                availableStock: existingProduct.stock
            });
        }

        return res.json({
            message: "Purchase successful (inventory demo)",
            product: product.name,
            purchasedQuantity: quantity,
            remainingStock: product.stock
        });
    } catch (error) {
        if (error.name === "CastError") {
            return res.status(400).json({
                message: "Invalid product ID"
            });
        }

        console.error("Purchase failed:", error.message);

        return res.status(500).json({
            message: "Purchase failed"
        });
    }
});

// Return JSON for unknown API routes
app.use("/api", function (req, res) {
    res.status(404).json({
        message: "API route not found",
        method: req.method,
        path: req.originalUrl
    });
});

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI)
    .then(function () {
        console.log("MongoDB connected successfully");

        app.listen(PORT, function () {
            console.log(
                "ShopSphere backend running on port " + PORT
            );
        });
    })
    .catch(function (error) {
        console.error(
            "MongoDB connection failed:",
            error.message
        );
        process.exit(1);
    });
