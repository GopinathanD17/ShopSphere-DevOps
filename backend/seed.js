
require("dotenv").config();

const dns = require("node:dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const mongoose = require("mongoose");
const Product = require("./models/Product");

const sampleProducts = [
  {
    name: "Wireless Headphones",
    price: 1499,
    stock: 20,
    vendor: "SoundWave Store",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=700&q=80",
    description: "Wireless headphones with immersive sound"
  },
  {
    name: "Smart Watch",
    price: 2499,
    stock: 15,
    vendor: "TechWorld",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=700&q=80",
    description: "Smart watch for everyday fitness tracking"
  },
  {
    name: "USB-C Charger",
    price: 799,
    stock: 30,
    vendor: "Gadget Hub",
    image: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=700&q=80",
    description: "Compact charger for everyday use"
  },
  {
    name: "Travel Backpack",
    price: 1299,
    stock: 18,
    vendor: "Urban Bags",
    image: "https://images.unsplash.com/photo-1622560480654-d96214fdc887?auto=format&fit=crop&w=700&q=80",
    description: "Spacious backpack for travel and college"
  },
  {
    name: "Running Sneakers",
    price: 1999,
    stock: 12,
    vendor: "StepUp Fashion",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=700&q=80",
    description: "Comfortable sneakers for daily activities"
  },
  {
    name: "Digital Camera",
    price: 18999,
    stock: 5,
    vendor: "Pixel Point",
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=700&q=80",
    description: "Capture everyday moments in detail"
  },
  {
    name: "Wireless Keyboard",
    price: 1599,
    stock: 14,
    vendor: "TechWorld",
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=700&q=80",
    description: "Comfortable keyboard for work and study"
  },
  {
    name: "Wireless Mouse",
    price: 699,
    stock: 25,
    vendor: "Gadget Hub",
    image: "https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&w=700&q=80",
    description: "Wireless mouse for smooth navigation"
  },
  {
    name: "Classic Sunglasses",
    price: 999,
    stock: 16,
    vendor: "Urban Style",
    image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=700&q=80",
    description: "Classic sunglasses for everyday style"
  },
  {
    name: "Reusable Water Bottle",
    price: 499,
    stock: 35,
    vendor: "Green Living",
    image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=700&q=80",
    description: "Reusable bottle for everyday hydration"
  }
];

async function seedProducts() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected successfully");

    for (const product of sampleProducts) {
      await Product.updateOne(
        { name: product.name },
        { $set: product },
        { upsert: true }
      );
    }

    console.log("10 products added or updated successfully");
  } catch (error) {
    console.error("Seeding failed:", error.message);
    process.exitCode = 1;
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  }
}

seedProducts();
