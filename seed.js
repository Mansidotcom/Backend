import crypto from "crypto";
import dotenv from "dotenv";
import connectDB from "./database/db.js";
import { Product } from "./models/productsModel.js";

if (typeof globalThis.crypto === "undefined") {
    globalThis.crypto = crypto;
}

dotenv.config({ path: new URL(".env", import.meta.url) });

const additionalProducts = [
    {
        productName: "Nova X5 5G Smartphone",
        productDesc: "A bright 6.6-inch 5G smartphone with a 50 MP camera, all-day battery, and fast charging.",
        productPrice: 24999,
        category: "Smartphones",
        brand: "Nova",
        productimg: [{ url: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=80", public_id: "seed-nova-x5" }],
        stock: 24,
        rating: 4.5,
        numReviews: 118,
    },
    {
        productName: "AeroBook 14 Ultrabook",
        productDesc: "A slim 14-inch laptop with an Intel Core i5 processor, 16 GB RAM, and a fast 512 GB SSD.",
        productPrice: 64999,
        category: "Laptops",
        brand: "Aero",
        productimg: [{ url: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=80", public_id: "seed-aerobook-14" }],
        stock: 12,
        rating: 4.6,
        numReviews: 76,
    },
    {
        productName: "Pulse ANC Earbuds",
        productDesc: "Compact true wireless earbuds with active noise cancellation, clear calls, and a 30-hour case.",
        productPrice: 4499,
        category: "Audio",
        brand: "Pulse",
        productimg: [{ url: "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?auto=format&fit=crop&w=900&q=80", public_id: "seed-pulse-earbuds" }],
        stock: 38,
        rating: 4.3,
        numReviews: 204,
    },
    {
        productName: "KeyPro Mechanical Keyboard",
        productDesc: "A compact RGB mechanical keyboard with tactile switches, programmable keys, and a detachable USB-C cable.",
        productPrice: 5999,
        category: "Accessories",
        brand: "KeyPro",
        productimg: [{ url: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=900&q=80", public_id: "seed-keypro-keyboard" }],
        stock: 19,
        rating: 4.7,
        numReviews: 89,
    },
    {
        productName: "Glide Wireless Mouse",
        productDesc: "An ergonomic wireless mouse with silent clicks, adjustable sensitivity, and a rechargeable battery.",
        productPrice: 1799,
        category: "Accessories",
        brand: "Glide",
        productimg: [{ url: "https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&w=900&q=80", public_id: "seed-glide-mouse" }],
        stock: 45,
        rating: 4.4,
        numReviews: 142,
    },
    {
        productName: "EchoBass Bluetooth Speaker",
        productDesc: "A portable waterproof Bluetooth speaker with rich bass, stereo pairing, and up to 16 hours of playback.",
        productPrice: 3299,
        category: "Audio",
        brand: "EchoBass",
        productimg: [{ url: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=900&q=80", public_id: "seed-echobass-speaker" }],
        stock: 27,
        rating: 4.6,
        numReviews: 97,
    },
    {
        productName: "VisionView 27 Monitor",
        productDesc: "A 27-inch Full HD IPS monitor with a 100 Hz refresh rate, slim bezels, and eye-care technology.",
        productPrice: 15999,
        category: "Monitors",
        brand: "VisionView",
        productimg: [{ url: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=900&q=80", public_id: "seed-visionview-monitor" }],
        stock: 14,
        rating: 4.5,
        numReviews: 63,
    },
    {
        productName: "VoltMax 20000mAh Power Bank",
        productDesc: "A high-capacity power bank with 22.5 W fast charging, dual USB outputs, and a digital battery display.",
        productPrice: 2199,
        category: "Power",
        brand: "VoltMax",
        productimg: [{ url: "https://images.unsplash.com/photo-1625842268584-8f3296236761?auto=format&fit=crop&w=900&q=80", public_id: "seed-voltmax-powerbank" }],
        stock: 52,
        rating: 4.2,
        numReviews: 181,
    },
    {
        productName: "FitTrack Active Watch",
        productDesc: "A lightweight fitness smartwatch with GPS, heart-rate monitoring, sleep tracking, and a vivid AMOLED screen.",
        productPrice: 6999,
        category: "Wearables",
        brand: "FitTrack",
        productimg: [{ url: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=900&q=80", public_id: "seed-fittrack-watch" }],
        stock: 21,
        rating: 4.4,
        numReviews: 105,
    },
    {
        productName: "GameCore Wireless Controller",
        productDesc: "A responsive wireless game controller with dual vibration, textured grips, and multi-platform support.",
        productPrice: 3999,
        category: "Gaming",
        brand: "GameCore",
        productimg: [{ url: "https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?auto=format&fit=crop&w=900&q=80", public_id: "seed-gamecore-controller" }],
        stock: 17,
        rating: 4.5,
        numReviews: 71,
    },
];

const seed = async () => {
    await connectDB();

    const existingNames = new Set(
        (await Product.find({}, { productName: 1 })).map((product) => product.productName)
    );
    const productsToInsert = additionalProducts
        .filter((product) => !existingNames.has(product.productName))
        .map((product) => ({ ...product, userId: null }));

    if (productsToInsert.length > 0) {
        await Product.insertMany(productsToInsert);
    }

    const totalProducts = await Product.countDocuments();
    console.log(`Inserted ${productsToInsert.length} products. Total products: ${totalProducts}`);
    await Product.db.close();
};

seed().catch(async (error) => {
    console.error("Product seed failed:", error);
    await Product.db.close();
    process.exitCode = 1;
});