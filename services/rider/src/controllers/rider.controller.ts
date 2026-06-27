import axios from "axios";
import getBuffer from "../config/datauri.js";
import { AuthenticatedRequest } from "../middlewares/isAuth.js";
import TryCatch from "../middlewares/trycatch.js";
import { Rider } from "../model/Rider.js";

export const addRiderProfile = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    if (user.role !== "rider") {
      return res.status(403).json({
        message: "Only riders can create rider profile",
      });
    }

    const file = req.file;

    if (!file) {
      return res.status(400).json({
        message: "Rider Image is required",
      });
    }

    const fileBuffer = getBuffer(file);

    if (!fileBuffer?.content) {
      return res.status(500).json({
        message: "Failed to generate image buffer",
      });
    }

    const {
      phoneNumber,
      aadhaarNumber,
      drivingLicenseNumber,
      latitude,
      longitude,
    } = req.body;

    if (
      !phoneNumber ||
      !aadhaarNumber ||
      !drivingLicenseNumber ||
      latitude === undefined ||
      longitude === undefined
    ) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const existingProfile = await Rider.findOne({
      userId: user._id,
    });

    if (existingProfile) {
      return res.status(400).json({
        message: "Rider profile already exists",
      });
    }

    let uploadResult;
    try {
      const { data } = await axios.post(
        `${process.env.UTILS_SERVICE}/api/upload`,
        {
          buffer: fileBuffer.content,
        },
        { timeout: 10000 },
      );
      uploadResult = data;
    } catch (uploadError: any) {
      return res.status(503).json({
        message: "Image upload failed. Please try again.",
      });
    }

    try {
      const riderProfile = await Rider.create({
        userId: user._id,
        picture: uploadResult.url,
        phoneNumber,
        aadhaarNumber,
        drivingLicenseNumber,
        location: {
          type: "Point",
          coordinates: [longitude, latitude],
        },
        isAvailble: false,
        isVerified: false,
      });

      return res.status(201).json({
        message: "Rider profile created successfully",
        riderProfile,
      });
    } catch (dbError) {
      // Cleanup path: Ideally we would call an endpoint to delete the image from Cloudinary here.
      // Since UTILS_SERVICE doesn't expose a delete endpoint, we log a warning for manual cleanup.
      console.warn(
        `Profile creation failed. Orphaned image at: ${uploadResult.url}`,
      );
      throw dbError; // let TryCatch handle it
    }
  },
);

export const fetchMyProfile = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const account = await Rider.findOne({ userId: user._id });

    res.json(account);
  },
);

export const toggleRiderAvailablity = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    if (user.role !== "rider") {
      return res.status(403).json({
        message: "Only riders can create rider profile",
      });
    }

    const { isAvailble, latitude, longitude } = req.body;

    if (typeof isAvailble !== "boolean") {
      return res.status(400).json({
        message: "isAvailble must be boolean",
      });
    }

    if (isAvailble && (latitude === undefined || longitude === undefined)) {
      return res.status(400).json({
        message: "location is required when going online",
      });
    }

    const rider = await Rider.findOne({
      userId: user._id,
    });

    if (!rider) {
      return res.status(404).json({
        message: "Rider profile not found",
      });
    }

    if (isAvailble && !rider.isVerified) {
      return res.status(403).json({
        message: "Rider is not verified",
      });
    }

    rider.isAvailble = isAvailble;

    if (isAvailble) {
      rider.location = {
        type: "Point",
        coordinates: [longitude, latitude],
      };
    }

    rider.lastActiveAt = new Date();

    await rider.save();

    res.json({
      message: isAvailble ? "Rider is now online" : "Rider is now offline",
      rider,
    });
  },
);
