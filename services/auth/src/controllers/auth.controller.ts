import User from "../model/User.js";
import jwt from "jsonwebtoken";
import TryCatch from "../middlewares/trycatch.js";
import { AuthenticatedRequest } from "../middlewares/isAuth.js";
import { oauth2client } from "../config/googleConfig.js";
import axios from "axios";

export const loginUser = TryCatch(async (req, res) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({
      message: "Authorization code is required",
    });
  }

  const googleRes = await oauth2client.getToken(code);
  oauth2client.setCredentials(googleRes.tokens);

  const userRes = await axios.get(
    `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${googleRes.tokens.access_token}`,
  );

  const { email, name, picture } = userRes.data;

  let user = await User.findOne({ email });

  if (!user) {
    user = await User.create({
      name,
      email,
      image: picture || "https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg",
    });
  }

  const token = jwt.sign({ user }, process.env.JWT_SECRET as string, {
    expiresIn: "15d",
  });

  res.status(200).json({
    message: "Logged In Successfully",
    token,
    user,
  });
});

// Mobile login — accepts an access_token obtained directly by the mobile
// client (expo-auth-session implicit/token flow). Bypasses code exchange
// so redirect URI mismatch is never an issue.
export const mobileLoginUser = TryCatch(async (req, res) => {
  const { access_token } = req.body;

  if (!access_token) {
    return res.status(400).json({
      message: "access_token is required",
    });
  }

  const userRes = await axios.get(
    `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${access_token}`,
  );

  const { email, name, picture } = userRes.data;

  let user = await User.findOne({ email });

  if (!user) {
    user = await User.create({
      name,
      email,
      image: picture || "https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg",
    });
  }

  const token = jwt.sign({ user }, process.env.JWT_SECRET as string, {
    expiresIn: "15d",
  });

  res.status(200).json({
    message: "Logged In Successfully",
    token,
    user,
  });
});

export const appleLoginUser = TryCatch(async (req, res) => {
  const { identityToken, fullName } = req.body;

  if (!identityToken) {
    return res.status(400).json({
      message: "identityToken is required",
    });
  }

  const decoded = jwt.decode(identityToken) as any;
  if (!decoded || !decoded.email) {
    return res.status(400).json({
      message: "Invalid identity token",
    });
  }

  const email = decoded.email;
  const name = fullName ? `${fullName.givenName || ""} ${fullName.familyName || ""}`.trim() : "Apple User";

  let user = await User.findOne({ email });

  if (!user) {
    user = await User.create({
      name,
      email,
      image: "https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg",
    });
  }

  const token = jwt.sign({ user }, process.env.JWT_SECRET as string, {
    expiresIn: "15d",
  });

  res.status(200).json({
    message: "Logged In Successfully with Apple",
    token,
    user,
  });
});


const allowedRoles = ["customer", "rider", "seller"] as const;

type Role = (typeof allowedRoles)[number];

export const addUserRole = TryCatch(async (req: AuthenticatedRequest, res) => {
  if (!req.user?._id) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  const { role } = req.body as { role: Role };

  if (!allowedRoles.includes(role)) {
    return res.status(400).json({
      message: "Invalid role",
    });
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { role },
    { new: true },
  );

  if (!user) {
    return res.status(404).json({
      message: "User not found",
    });
  }

  const token = jwt.sign({ user }, process.env.JWT_SECRET as string, {
    expiresIn: "15d",
  });

  res.json({ user, token });
});

export const myProfile = TryCatch(async (req: AuthenticatedRequest, res) => {
  const user = req.user;
  res.json(user);
});

export const savePushToken = TryCatch(async (req: AuthenticatedRequest, res) => {
  if (!req.user?._id) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { pushToken } = req.body;

  if (!pushToken) {
    return res.status(400).json({ message: "pushToken is required" });
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { pushToken },
    { new: true },
  );

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.json({ message: "Push token saved", user });
});
