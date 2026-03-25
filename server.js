import express from "express";
import "dotenv/config";
import connectDB from "./database/db.js";
import userRoute from "./routes/UserRoute.js";
import cors from "cors";
import productRoutes from "./routes/productsRout.js";
import cartRoute from "./routes/cartRoute.js";
import orderRoute from "./routes/orderRoute.js";
import path from "path";
import { fileURLToPath } from "url";

const app = express();

// FIX for __dirname (ES Modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 8000;

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ FIXED CORS (production + local)
app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

// API routes
app.use("/api/v1/user", userRoute);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/cart", cartRoute);
app.use("/api/v1/orders", orderRoute);

// ✅ SERVE FRONTEND (VERY IMPORTANT)
app.use(express.static(path.join(__dirname, "../frontend/dist")));

// Wildcard route catch-all (safe for express path-to-regexp version)
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
});

// start server
app.listen(PORT, () => {
  connectDB();
  console.log(`server is listening at port:${PORT}`);
});