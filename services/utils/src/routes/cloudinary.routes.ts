import express from "express";
import cloudinary from "cloudinary";

const router = express.Router();
router.post("/upload", async (req, res) => {
  try {
    const { buffer } = req.body;

    if (!buffer) {
      return res.status(400).json({
        message: "Buffer is required",
      });
    }

    const cloud = await cloudinary.v2.uploader.upload(buffer);
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
