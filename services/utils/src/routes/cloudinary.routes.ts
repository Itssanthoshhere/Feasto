import express from "express";
import cloudinary from "cloudinary";

const router = express.Router();
router.post("/upload", async (req, res) => {
  try {
    const { buffer, folder } = req.body;

    if (!buffer) {
      return res.status(400).json({
        message: "Buffer is required",
      });
    }

    const isDataURI = typeof buffer === "string" && buffer.startsWith("data:");
    const isBase64 = typeof buffer === "string" && /^[A-Za-z0-9+/=]+$/.test(buffer);
    if (!isDataURI && !isBase64) {
      return res.status(400).json({
        message: "Buffer must be a valid Base64 string or DataURI",
      });
    }

    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    if (Buffer.byteLength(buffer, "utf8") > MAX_SIZE) {
      return res.status(413).json({
        message: "File exceeds the 10MB size limit",
      });
    }

    const cloud = await cloudinary.v2.uploader.upload(buffer, {
      resource_type: "image",
      folder: folder || "feasto",
    });
    res.json({
      success: true,
      url: cloud.secure_url,
    });
  } catch (error: any) {
    res.status(500).json({
      message: error.message,
    });
  }
});

export default router;
