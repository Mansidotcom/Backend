
import mongoose from "mongoose";
import { Product } from "../models/productsModel.js";
import cloudinary, { uploadToCloudinary } from "../utils/cloudinary.js";

export const addProduct = async (req, res) => {
  try {
    console.log("=== ADD PRODUCT REQUEST ===");
    console.log("BODY:", req.body);
    console.log("FILES:", req.files);
    console.log("USER:", req.user);

    const rawBody = req.body || {};
    const normalizedBody = Object.entries(rawBody).reduce((fields, [key, value]) => {
      fields[key.trim()] = value;
      return fields;
    }, {});
    const productName = String(normalizedBody.productName ?? normalizedBody.productname ?? "").trim();
    const productDesc = String(normalizedBody.productDesc ?? normalizedBody.description ?? "").trim();
    const category = String(normalizedBody.category ?? "").trim();
    const brand = String(normalizedBody.brand ?? "").trim();
    const priceValue = String(normalizedBody.productPrice ?? normalizedBody.price ?? "0").replace(/,/g, "").trim();
    const productPrice = Number(priceValue);

    console.log("Extracted data:", { productName, productDesc, category, brand, productPrice });

    // Validate required fields
    if (!productName) {
      return res.status(400).json({
        success: false,
        message: "Product name is required",
      });
    }
    if (!productDesc) {
      return res.status(400).json({
        success: false,
        message: "Product description is required",
      });
    }
    if (!category) {
      return res.status(400).json({
        success: false,
        message: "Category is required",
      });
    }
    if (!brand) {
      return res.status(400).json({
        success: false,
        message: "Brand is required",
      });
    }
    if (Number.isNaN(productPrice) || productPrice <= 0) {
      return res.status(400).json({
        success: false,
        message: "Price must be a valid positive number",
      });
    }

    // Get userId from authenticated user
    const userId = req.user?._id;
    if (!userId) {
      console.error("User ID not found in request");
      return res.status(401).json({
        success: false,
        message: "User authentication failed",
      });
    }

    console.log("User ID:", userId);

    let productimg = [];

    // Extract files from multer
    const filesArray = Array.isArray(req.files)
      ? req.files
      : req.files?.images || req.files?.files || [];

    console.log("Files array length:", filesArray?.length || 0);

    if (filesArray && filesArray.length > 0) {
      console.log("Uploading files to Cloudinary...");
      for (const file of filesArray) {
        try {
          console.log("Uploading file:", file.originalname, file.size);
          const result = await uploadToCloudinary(file.buffer);
          console.log("Cloudinary upload result:", result.public_id);

          productimg.push({
            url: result.secure_url,
            public_id: result.public_id,
          });
        } catch (uploadError) {
          console.error("Cloudinary upload error for file:", file.originalname, uploadError);
          return res.status(500).json({
            success: false,
            message: `Failed to upload image: ${uploadError.message}`,
          });
        }
      }
    } else {
      console.warn("No images provided");
      return res.status(400).json({
        success: false,
        message: "At least one product image is required",
      });
    }

    console.log("Creating product in database...");
    const newProduct = await Product.create({
      userId,
      productName,
      productDesc,
      productPrice,
      category,
      brand,
      productimg,
    });

    console.log("Product created successfully:", newProduct._id);

    const allProducts = await Product.find();

    return res.status(201).json({
      success: true,
      message: "Product added successfully",
      product: newProduct,
      products: allProducts,
    });
  } catch (error) {
    console.error("=== ADD PRODUCT ERROR ===");
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);

    return res.status(500).json({
      success: false,
      message: `Error adding product: ${error.message}`,
    });
  }
};


const defaultProducts = [
  {
    productName: "Wireless Headphones",
    productDesc: "Premium wireless headphones with immersive sound and long battery life.",
    productPrice: 2499,
    category: "Audio",
    brand: "Noise",
    productimg: [
      { url: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=900&q=80", public_id: "demo-headphones" },
    ],
  },
  {
    productName: "Smartwatch Pro",
    productDesc: "Track fitness, heart rate, and notifications with a premium AMOLED display.",
    productPrice: 3999,
    category: "Wearables",
    brand: "Boat",
    productimg: [
      { url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80", public_id: "demo-watch" },
    ],
  },
  {
    productName: "Gaming Laptop",
    productDesc: "Ultra-fast performance laptop built for work, streaming, and gaming.",
    productPrice: 78999,
    category: "Laptops",
    brand: "Dell",
    productimg: [
      { url: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=80", public_id: "demo-laptop" },
    ],
  },
];

const ensureDefaultProducts = async () => {
  const count = await Product.countDocuments();
  if (count > 0) return;

  await Product.insertMany(
    defaultProducts.map((product) => ({
      ...product,
      userId: null,
    }))
  );
};

export const getAllProduct = async (req, res) => {
  try {
    await ensureDefaultProducts();
    const products = await Product.find();

    return res.status(200).json({
      success: true,
      products,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // delete images from cloudinary
    if (product.productimg && product.productimg.length > 0) {
      for (let img of product.productimg) {
        await cloudinary.uploader.destroy(img.public_id);
      }
    }

    // delete product from DB
    await Product.findByIdAndDelete(productId);

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const {
      productName,
      productDesc,
      productPrice,
      category,
      brand,
      existingImages,
    } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    let updatedImages = [];

    // ✅ keep selected old images
    if (existingImages) {
      const keepIds = JSON.parse(existingImages);

      updatedImages = product.productimg.filter((img) =>
        keepIds.includes(img.public_id)
      );

      // delete removed images from cloudinary
      const removedImages = product.productimg.filter(
        (img) => !keepIds.includes(img.public_id)
      );

      for (let img of removedImages) {
        await cloudinary.uploader.destroy(img.public_id);
      }
    } else {
      updatedImages = product.productimg;
    }

    // ✅ add new images (if any)
    if (req.files && req.files.length > 0) {
      for (let file of req.files) {
        const result = await new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            { folder: "products" },
            (err, res) => (err ? reject(err) : resolve(res))
          ).end(file.buffer);
        });

        updatedImages.push({
          url: result.secure_url,
          public_id: result.public_id,
        });
      }
    }

    // ✅ update fields
    product.productName = productName ?? product.productName;
    product.productDesc = productDesc ?? product.productDesc;
    product.productPrice = productPrice ?? product.productPrice;
    product.category = category ?? product.category;
    product.brand = brand ?? product.brand;
    product.productimg = updatedImages;

    await product.save();

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



