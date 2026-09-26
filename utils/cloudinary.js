import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

dotenv.config({
  path: resolve(dirname(fileURLToPath(import.meta.url)), "../.env"),
});

const cloudinaryConfig = {
  cloud_name: (process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUD_NAME || "").trim(),
  api_key: (process.env.CLOUDINARY_API_KEY || process.env.API_KEY || "").trim(),
  api_secret: (process.env.CLOUDINARY_API_SECRET || process.env.API_SECRET || "").trim(),
};

cloudinary.config({
  ...cloudinaryConfig,
});

const hasPlaceholderCredential = (value) =>
  !value || /YOUR_ACTUAL|YOUR_|<[^>]+>/i.test(value);

export const uploadToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    if (Object.values(cloudinaryConfig).some(hasPlaceholderCredential)) {
      reject(new Error("Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in Backend/.env."));
      return;
    }

    cloudinary.uploader.upload_stream(
      { folder: "products" },
      (error, result) => {
        if (error) reject(error); 
        else resolve(result);
      }
    ).end(fileBuffer);
  });
};

export default cloudinary;
