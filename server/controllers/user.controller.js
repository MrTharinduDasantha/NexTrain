import User from "../models/user.model.js";
import { ok, fail } from "../utils/response.util.js";
import { hashPassword, comparePassword } from "../utils/password.util.js";
import {
  uploadBufferToCloudinary,
  destroyFromCloudinary,
} from "../utils/cloudinary.util.js";

export const getProfile = async (req, res) => ok(res, { user: req.user });

export const updateProfile = async (req, res) => {
  const allowed = ["name", "age", "gender", "contactNumber", "address"];
  const updates = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  }

  if (req.file && process.env.CLOUDINARY_URL) {
    const user = await User.findById(req.user._id);
    if (user?.profilePhoto?.publicId) {
      destroyFromCloudinary(user.profilePhoto.publicId).catch(() => {});
    }
    const r = await uploadBufferToCloudinary(req.file.buffer);
    updates.profilePhoto = { url: r.secure_url, publicId: r.public_id };
  }

  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  });

  return ok(res, { user }, "Profile updated");
};

export const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword || newPassword.length < 6) {
    return fail(
      res,
      400,
      "Provide currentPassword and newPassword (min 6 chars)",
    );
  }
  const user = await User.findById(req.user._id).select("+password");
  const match = await comparePassword(currentPassword, user.password);
  if (!match) return fail(res, 401, "Current password is incorrect");

  user.password = await hashPassword(newPassword);
  await user.save();

  return ok(res, null, "Password changed");
};
