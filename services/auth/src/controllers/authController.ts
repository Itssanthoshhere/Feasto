import User from "../model/User.js";
import jwt from "jsonwebtoken";
import TryCatch from "../middlewares/trycatch.js";

export const loginUser = TryCatch(async (req, res) => {
  const { email, name, image } = req.body;
  let user = await User.findOne({ email });

  if (!user) {
    user = await User.create({
      name,
      email,
      image,
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
