import { body, validationResult } from "express-validator";
import User from "../models/user.model.js";
import { hashPassword, comparePassword } from "../utils/password.util.js";
import { signToken, cookieOptions } from "../utils/token.util.js";
import { ok, fail, created } from "../utils/response.util.js";
import { uploadBufferToCloudinary } from "../utils/cloudinary.util.js";

export const registerValidators = [
  body("name").isString().trim().isLength({ min: 2 }),
  body("email").isEmail().normalizeEmail(),
  body("password").isLength({ min: 6 }),
];

export const register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return fail(res, 422, "Validation failed", errors.array());

  const { name, email, password } = req.body;
  const exists = await User.findOne({ email });
  if (exists) return fail(res, 409, "Email already registered");

  let profilePhoto = { url: "", publicId: "" };
  if (req.file && process.env.CLOUDINARY_CLOUD_NAME) {
    try {
      const r = await uploadBufferToCloudinary(req.file.buffer);
      profilePhoto = { url: r.secure_url, publicId: r.public_id };
    } catch (e) {
      console.warn(
        "Cloudinary upload failed, continuing without photo:",
        e.message,
      );
    }
  }

  const hashed = await hashPassword(password);
  const user = await User.create({
    name,
    email,
    password: hashed,
    profilePhoto,
  });

  const token = signToken({ id: user._id, role: user.role });
  res.cookie("token", token, cookieOptions());

  const safe = user.toObject();
  delete safe.password;

  return created(res, { user: safe, token }, "Registered successfully");
};

export const loginValidators = [
  body("email").isEmail(),
  body("password").isString().notEmpty(),
];

export const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+password");
  if (!user) return fail(res, 401, "Invalid credentials");

  const match = await comparePassword(password, user.password);
  if (!match) return fail(res, 401, "Invalid credentials");

  const token = signToken({ id: user._id, role: user.role });
  res.cookie("token", token, cookieOptions());

  const safe = user.toObject();
  delete safe.password;
  return ok(res, { user: safe, token }, "Logged in");
};

export const logout = async (_req, res) => {
  res.clearCookie("token", { ...cookieOptions(), maxAge: 0 });
  return ok(res, null, "Logged out");
};

export const me = async (req, res) => ok(res, { user: req.user });

/**
 * Admin login: credentials live in .env as a single-admin model. We ensure an
 * admin user exists in the DB on first successful login so we can issue JWTs.
 */
export const adminLogin = async (req, res) => {
  const { email, password } = req.body;
  if (
    email !== process.env.ADMIN_EMAIL ||
    password !== process.env.ADMIN_PASSWORD
  ) {
    return fail(res, 401, "Invalid admin credentials");
  }

  let admin = await User.findOne({ email }).select("+password");
  if (!admin) {
    admin = await User.create({
      name: "NexTrain Admin",
      email,
      password: await hashPassword(password),
      role: "admin",
    });
  } else if (admin.role !== "admin") {
    admin.role = "admin";
    await admin.save();
  }

  const token = signToken({ id: admin._id, role: admin.role });
  res.cookie("token", token, cookieOptions());

  const safe = admin.toObject();
  delete safe.password;

  return ok(res, { user: safe, token }, "Admin authenticated");
};
