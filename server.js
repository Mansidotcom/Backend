import express from "express";
import "dotenv/config";
import cors from "cors";
import connectDB from "./database/db.js";

import userRoute from "./routes/UserRoute.js";
import productRoutes from "./routes/productsRout.js";
import cartRoute from "./routes/cartRoute.js";
import orderRoute from "./routes/orderRoute.js";

const app = express();
const PORT = process.env.PORT || 8000;

// basic middleware
app.use(express.json());
app.use(cors());

// routes
app.use("/api/v1/user", userRoute);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/cart", cartRoute);
app.use("/api/v1/orders", orderRoute);

app.get("/", (req, res) => {
res.send("Backend Running ");
});

// start server
app.listen(PORT, () => {
connectDB();
console.log(`Server running on port ${PORT}`);
});
