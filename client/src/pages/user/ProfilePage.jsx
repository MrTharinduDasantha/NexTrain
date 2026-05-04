import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { toast } from "react-toastify";
import {
  HiOutlineUser,
  HiOutlineEnvelope,
  HiOutlinePhone,
  HiOutlineMapPin,
  HiOutlineCalendarDays,
  HiOutlineCamera,
  HiOutlineLockClosed,
  HiOutlineCheck,
  HiOutlineEye,
  HiOutlineEyeSlash,
} from "react-icons/hi2";
import { userApi } from "../../api/user.api.js";
import { fetchCurrentUser, selectUser } from "../../app/features/authSlice.js";

const profileSchema = yup.object({
  name: yup.string().trim().min(2).required(),
  age: yup
    .number()
    .nullable()
    .transform((v) => (Number.isNaN(v) ? null : v))
    .min(1)
    .max(120),
  gender: yup.string().oneOf(["", "male", "female", "other"]),
  contactNumber: yup.string(),
  address: yup.string(),
});

const passwordSchema = yup.object({
  currentPassword: yup.string().required("Current password required"),
  newPassword: yup.string().min(6, "At least 6 characters").required(),
  confirmNew: yup
    .string()
    .oneOf([yup.ref("newPassword")], "Passwords don't match")
    .required(),
});

export default function ProfilePage() {
  const user = useSelector(selectUser);
  const dispatch = useDispatch();
  const [tab, setTab] = useState("profile");

  if (!user) return null;

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10">
      <header className="mb-8">
        <h1 className="section-title">Account</h1>
        <p className="mt-2 text-text-secondary">
          Manage your profile, contact details, and password.
        </p>
      </header>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-border-subtle">
        {[
          { key: "profile", label: "Profile" },
          { key: "password", label: "Password" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={[
              "px-4 py-2 -mb-px text-sm font-medium border-b-2 transition-colors",
              tab === t.key
                ? "border-(--color-brand-400) text-text-primary"
                : "border-transparent text-text-secondary hover:text-text-primary",
            ].join(" ")}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "profile" ? (
        <ProfileForm user={user} onSaved={() => dispatch(fetchCurrentUser())} />
      ) : (
        <PasswordForm />
      )}
    </div>
  );
}

function ProfileForm({ user, onSaved }) {
  const [photoFile, setPhotoFile] = useState(null);
  const [preview, setPreview] = useState(user.profilePhoto?.url || "");
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm({
    resolver: yupResolver(profileSchema),
    defaultValues: {
      name: user.name || "",
      age: user.age || "",
      gender: user.gender || "",
      contactNumber: user.contactNumber || "",
      address: user.address || "",
    },
  });

  useEffect(() => {
    reset({
      name: user.name || "",
      age: user.age || "",
      gender: user.gender || "",
      contactNumber: user.contactNumber || "",
      address: user.address || "",
    });
    setPreview(user.profilePhoto?.url || "");
  }, [user, reset]);

  const handlePhoto = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 3 * 1024 * 1024)
      return toast.error("Photo must be under 3 MB");
    setPhotoFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const onSubmit = async (data) => {
    const fd = new FormData();
    Object.entries(data).forEach(([k, v]) => {
      if (v != null && v !== "") fd.append(k, v);
    });
    if (photoFile) fd.append("profilePhoto", photoFile);
    setSaving(true);
    try {
      await userApi.updateProfile(fd);
      toast.success("Profile updated");
      setPhotoFile(null);
      onSaved && onSaved();
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="glass p-6 sm:p-8 space-y-5"
    >
      <div className="flex items-center gap-5">
        <div className="h-24 w-24 rounded-full bg-bg-overlay border border-border-subtle grid place-items-center overflow-hidden">
          {preview ? (
            <img
              src={preview}
              alt="Profile"
              className="h-full w-full object-cover"
            />
          ) : (
            <HiOutlineUser className="h-10 w-10 text-text-muted" />
          )}
        </div>
        <div>
          <label className="btn-ghost cursor-pointer">
            <HiOutlineCamera className="h-4 w-4" />
            {preview ? "Change photo" : "Upload photo"}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handlePhoto}
              className="hidden"
            />
          </label>
          <p className="text-[11px] text-text-muted mt-1">
            JPG, PNG, or WEBP · max 3 MB
          </p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="field-label">
            <HiOutlineUser className="inline h-4 w-4 mr-1 -mt-0.5" /> Full name
          </label>
          <input
            {...register("name")}
            placeholder="John Doe"
            className="field-input"
          />
          {errors.name && <p className="field-error">{errors.name.message}</p>}
        </div>
        <div>
          <label className="field-label">
            <HiOutlineEnvelope className="inline h-4 w-4 mr-1 -mt-0.5" /> Email
          </label>
          <input
            value={user.email}
            disabled
            className="field-input opacity-60 cursor-not-allowed"
          />
        </div>
        <div>
          <label className="field-label">
            <HiOutlineCalendarDays className="inline h-4 w-4 mr-1 -mt-0.5" />{" "}
            Age
          </label>
          <input
            {...register("age")}
            type="number"
            min={1}
            max={120}
            placeholder="25"
            className="field-input"
          />
          {errors.age && <p className="field-error">{errors.age.message}</p>}
        </div>
        <div>
          <label className="field-label">Gender</label>
          <select {...register("gender")} className="field-input">
            <option value="">Prefer not to say</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label className="field-label">
            <HiOutlinePhone className="inline h-4 w-4 mr-1 -mt-0.5" /> Contact
            number
          </label>
          <input
            {...register("contactNumber")}
            placeholder="+94 71 234 5678"
            className="field-input"
          />
        </div>
        <div>
          <label className="field-label">
            <HiOutlineMapPin className="inline h-4 w-4 mr-1 -mt-0.5" /> Address
          </label>
          <input
            {...register("address")}
            placeholder="Street, City"
            className="field-input"
          />
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={saving || (!isDirty && !photoFile)}
          className="btn-primary cursor-pointer"
        >
          <HiOutlineCheck className="h-4 w-4" />
          {saving ? "Saving…" : "Save changes"}
        </button>
      </div>
    </form>
  );
}

function PasswordForm() {
  const [saving, setSaving] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showNewConfirm, setShowNewConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({ resolver: yupResolver(passwordSchema) });

  // Watch the values to determine if the icon should show
  const currentPasswordValue = watch("currentPassword", "");
  const newPasswordValue = watch("newPassword", "");
  const confirmValue = watch("confirmNew", "");

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      await userApi.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      toast.success("Password changed");
      reset();
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="glass p-6 sm:p-8 space-y-5"
    >
      <div>
        <label className="field-label">
          <HiOutlineLockClosed className="inline h-4 w-4 mr-1 -mt-0.5" />{" "}
          Current password
        </label>
        <div className="relative">
          <input
            {...register("currentPassword")}
            type={showCurrentPassword ? "text" : "password"}
            className="field-input"
            autoComplete="current-password"
            placeholder="••••••••"
          />
          {currentPasswordValue && (
            <button
              type="button"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors cursor-pointer"
            >
              {showCurrentPassword ? (
                <HiOutlineEyeSlash className="h-5 w-5" />
              ) : (
                <HiOutlineEye className="h-5 w-5" />
              )}
            </button>
          )}
        </div>
        {errors.currentPassword && (
          <p className="field-error">{errors.currentPassword.message}</p>
        )}
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="field-label">New password</label>
          <div className="relative">
            <input
              {...register("newPassword")}
              type={showNewPassword ? "text" : "password"}
              placeholder="At least 6 characters"
              className="field-input"
              autoComplete="new-password"
            />
            {newPasswordValue && (
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors cursor-pointer"
              >
                {showNewPassword ? (
                  <HiOutlineEyeSlash className="h-5 w-5" />
                ) : (
                  <HiOutlineEye className="h-5 w-5" />
                )}
              </button>
            )}
          </div>
          {errors.newPassword && (
            <p className="field-error">{errors.newPassword.message}</p>
          )}
        </div>
        <div>
          <label className="field-label">Confirm new password</label>
          <div className="relative">
            <input
              {...register("confirmNew")}
              type={showNewConfirm ? "text" : "password"}
              placeholder="Re-enter new password"
              className="field-input"
              autoComplete="new-password"
            />
            {confirmValue && (
              <button
                type="button"
                onClick={() => setShowNewConfirm(!showNewConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors cursor-pointer"
              >
                {showNewConfirm ? (
                  <HiOutlineEyeSlash className="h-5 w-5" />
                ) : (
                  <HiOutlineEye className="h-5 w-5" />
                )}
              </button>
            )}
          </div>
          {errors.confirmNew && (
            <p className="field-error">{errors.confirmNew.message}</p>
          )}
        </div>
      </div>
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="btn-primary cursor-pointer"
        >
          {saving ? "Updating…" : "Update password"}
        </button>
      </div>
    </form>
  );
}
