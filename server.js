import crypto from "crypto";
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./database/db.js";

dotenv.config({ path: new URL(".env", import.meta.url) });

if (typeof globalThis.crypto === "undefined") {
  globalThis.crypto = crypto;
}

import userRoute from "./routes/UserRoute.js";
import productRoutes from "./routes/productsRout.js";
import cartRoute from "./routes/cartRoute.js";
import orderRoute from "./routes/orderRoute.js";

const app = express();
const PORT = process.env.PORT || 8000;

// Body parsing middleware - always apply for JSON and URL-encoded
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cors());

// Routes
app.use("/api/v1/user", userRoute);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/cart", cartRoute);
app.use("/api/v1/orders", orderRoute);

app.get("/", (req, res) => {
  res.send("Backend Running ");
});

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error);
    process.exit(1);
  }
};

startServer();
