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

    if (!/^\d{10}$/.test(phoneNumber)) {
      return res.status(400).json({ message: "Invalid Phone Number. Must be exactly 10 digits." });
    }
    if (!/^\d{12}$/.test(aadhaarNumber)) {
      return res.status(400).json({ message: "Invalid Aadhaar Number. Must be exactly 12 digits." });
    }
    if (!/^[A-Z0-9]{15,16}$/i.test(drivingLicenseNumber.replace(/[\s-]/g, ""))) {
      return res.status(400).json({ message: "Invalid Driving License. Must be 15 or 16 alphanumeric characters." });
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

export const acceptOrder = TryCatch(async (req: AuthenticatedRequest, res) => {
  const riderUserId = req.user?._id;
  const { orderId } = req.params;

  if (!riderUserId) {
    return res.status(400).json({
      message: "Please Login",
    });
  }

  const rider = await Rider.findOne({ userId: riderUserId, isAvailble: true });

  if (!rider) {
    return res.status(404).json({ message: "rider not found" });
  }

  try {
    const { data } = await axios.put(
      `${process.env.RESTAURANT_SERVICE}/api/order/assign/rider`,
      {
        orderId,
        riderId: rider._id.toString(),
        riderUserId: rider.userId,
        riderName: req.user?.name || "Rider",
        riderPicture: rider.picture,
        riderPhone: rider.phoneNumber,
      },
      {
        headers: {
          "x-internal-key": process.env.INTERNAL_SERVICE_KEY,
        },
        timeout: 5000,
      },
    );

    if (data.success || data.message) {
      const riderDetails = await Rider.findOneAndUpdate(
        {
          userId: riderUserId,
          isAvailble: true,
        },
        { isAvailble: false },
        { new: true },
      );

      if (!riderDetails) {
        return res
          .status(400)
          .json({ message: "Failed to update rider availability" });
      }

      return res.json({ message: "Order accepted" });
    } else {
      return res
        .status(400)
        .json({ message: data.message || "Failed to assign order" });
    }
  } catch (error: any) {
    console.error("Fetch current order error:", error.message);

    return res.status(error.response?.status || 500).json({
      message:
        error.response?.data?.message ||
        error.message ||
        "Something went wrong",
    });
  }
});

export const fetchMyCurrentOrder = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const riderUserId = req.user?._id;
    const statusQuery =
      typeof req.query.status === "string" ? req.query.status : "current";
    const normalizedStatus = statusQuery.toLowerCase();

    if (!riderUserId) {
      return res.status(400).json({
        message: "Please Login",
      });
    }

    const rider = await Rider.findOne({
      userId: riderUserId,
      isVerified: true,
    });

    if (!rider) {
      if (normalizedStatus === "current") {
        return res.json({ order: null });
      }
      return res.json({ orders: [] });
    }

    try {
      const { data } = await axios.get(
        `${process.env.RESTAURANT_SERVICE}/api/order/current/rider?riderId=${rider._id}&status=${normalizedStatus}`,
        {
          headers: {
            "x-internal-key": process.env.INTERNAL_SERVICE_KEY,
          },
          timeout: 5000,
        },
      );
      if (normalizedStatus === "current") {
        return res.json({
          order: data,
        });
      }

      return res.json({
        orders: Array.isArray(data?.orders) ? data.orders : [],
      });
    } catch (error: any) {
      if (error.response?.status === 404 && normalizedStatus === "current") {
        return res.json({ order: null });
      }

      console.error("Fetch current order error:", error.message);

      return res.status(error.response?.status || 500).json({
        message:
          error.response?.data?.message ||
          error.message ||
          "Something went wrong",
      });
    }
  },
);

export const updateOrderStatus = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        message: "Please Login",
      });
    }

    const rider = await Rider.findOne({ userId: userId });

    if (!rider) {
      return res.status(404).json({
        message: "Please Login",
      });
    }

    const { orderId } = req.params;

    try {
      const { data } = await axios.put(
        `${process.env.RESTAURANT_SERVICE}/api/order/update/status/rider`,
        { orderId },
        {
          headers: {
            "x-internal-key": process.env.INTERNAL_SERVICE_KEY,
          },
          timeout: 5000,
        },
      );

      res.json({
        message: data.message,
      });
    } catch (error: any) {
      console.error("Fetch current order error:", error.message);

      return res.status(error.response?.status || 500).json({
        message:
          error.response?.data?.message ||
          error.message ||
          "Something went wrong",
      });
    }
  },
);

export const updateRiderLocation = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const { orderId, latitude, longitude } = req.body;

    if (!orderId || !latitude || !longitude) {
      return res
        .status(400)
        .json({ message: "Missing location or order data" });
    }

    await axios.post(
      `${process.env.REALTIME_SERVICE}/api/v1/internal/emit`,
      {
        event: "rider:location",
        room: `user:${orderId}`,
        payload: { latitude, longitude },
      },
      {
        headers: {
          "x-internal-key": process.env.INTERNAL_SERVICE_KEY,
        },
        timeout: 5000,
      },
    );

    res.status(200).json({ success: true });
  },
);

// Internal endpoint — called by restaurant service on delivery
export const incrementRiderEarnings = TryCatch(async (req, res) => {
  if (req.headers["x-internal-key"] !== process.env.INTERNAL_SERVICE_KEY) {
    return res.status(403).json({ message: "Forbidden" });
  }

  const { riderId, amount } = req.body;

  if (!riderId || !amount) {
    return res.status(400).json({ message: "riderId and amount are required" });
  }

  const rider = await Rider.findByIdAndUpdate(
    riderId,
    {
      $inc: { totalEarnings: amount, totalDeliveries: 1 },
    },
    { new: true },
  );

  if (!rider) {
    return res.status(404).json({ message: "Rider not found" });
  }

  res.json({ success: true, totalEarnings: rider.totalEarnings, totalDeliveries: rider.totalDeliveries });
});

// Authenticated — rider edits their own profile
export const updateRiderProfile = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: "Please Login" });
    }

    const rider = await Rider.findOne({ userId });

    if (!rider) {
      return res.status(404).json({ message: "Rider profile not found" });
    }

    const { phoneNumber, aadhaarNumber, drivingLicenseNumber } = req.body;

    if (phoneNumber) {
      if (!/^\d{10}$/.test(phoneNumber)) {
        return res.status(400).json({ message: "Invalid Phone Number. Must be exactly 10 digits." });
      }
      rider.phoneNumber = phoneNumber;
    }

    if (aadhaarNumber) {
      if (!/^\d{12}$/.test(aadhaarNumber)) {
        return res.status(400).json({ message: "Invalid Aadhaar Number. Must be exactly 12 digits." });
      }
      rider.aadhaarNumber = aadhaarNumber;
    }

    if (drivingLicenseNumber) {
      if (!/^[A-Z0-9]{15,16}$/i.test(drivingLicenseNumber.replace(/[\s-]/g, ""))) {
        return res.status(400).json({ message: "Invalid Driving License. Must be 15 or 16 alphanumeric characters." });
      }
      rider.drivingLicenseNumber = drivingLicenseNumber;
    }

    // Handle optional picture upload
    const file = req.file;
    if (file) {
      const fileBuffer = getBuffer(file);
      if (!fileBuffer?.content) {
        return res.status(500).json({ message: "Failed to generate image buffer" });
      }

      try {
        const { data } = await axios.post(
          `${process.env.UTILS_SERVICE}/api/upload`,
          { buffer: fileBuffer.content },
          { timeout: 10000 },
        );
        rider.picture = data.url;
      } catch (uploadError: any) {
        return res.status(503).json({
          message: "Image upload failed, please try again",
        });
      }
    }

    await rider.save();

    res.json({ message: "Profile updated successfully", rider });
  },
);
