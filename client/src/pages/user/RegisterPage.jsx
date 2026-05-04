import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { toast } from "react-toastify";
import {
  HiOutlineUser,
  HiOutlineEnvelope,
  HiOutlineLockClosed,
  HiOutlineCamera,
  HiOutlineArrowRight,
  HiOutlineEye,
  HiOutlineEyeSlash,
} from "react-icons/hi2";
import {
  register as registerThunk,
  selectAuth,
  clearAuthError,
} from "../../app/features/authSlice.js";

const schema = yup.object({
  name: yup
    .string()
    .trim()
    .min(2, "Name too short")
    .required("Name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup
    .string()
    .min(6, "At least 6 characters")
    .required("Password is required"),
  confirm: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords don't match")
    .required("Confirm your password"),
});

export default function RegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, status, error } = useSelector(selectAuth);
  const [photoFile, setPhotoFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema) });

  // Watch the values to determine if the icon should show
  const passwordValue = watch("password", "");
  const confirmValue = watch("confirm", "");

  useEffect(() => {
    if (user) navigate("/", { replace: true });
  }, [user, navigate]);

  useEffect(() => () => dispatch(clearAuthError()), [dispatch]);

  const handlePhoto = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 3 * 1024 * 1024) {
      toast.error("Photo must be under 3 MB");
      return;
    }
    setPhotoFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const onSubmit = async (data) => {
    const fd = new FormData();
    fd.append("name", data.name);
    fd.append("email", data.email);
    fd.append("password", data.password);
    if (photoFile) fd.append("profilePhoto", photoFile);

    await dispatch(registerThunk(fd)).unwrap();
    toast.success("Account created — welcome aboard!");
  };

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
      <div className="text-center mb-8">
        <h1 className="section-title">
          Join <span className="gradient-text">NexTrain</span>
        </h1>
        <p className="mt-2 text-text-secondary">
          Create your account and book your first journey in seconds.
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="glass p-6 sm:p-8 space-y-5"
      >
        {/* Photo */}
        <div className="flex items-center gap-4">
          <div className="h-20 w-20 rounded-full bg-bg-overlay border border-border-subtle grid place-items-center overflow-hidden">
            {preview ? (
              <img
                src={preview}
                alt="Preview"
                className="h-full w-full object-cover"
              />
            ) : (
              <HiOutlineCamera className="h-8 w-8 text-text-muted" />
            )}
          </div>
          <div>
            <label className="btn-ghost">
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
              JPG, PNG, or WEBP | Max 3 MB
            </p>
          </div>
        </div>

        <div>
          <label className="field-label">
            <HiOutlineUser className="inline h-4 w-4 mr-1 -mt-0.5" />
            Full name
          </label>
          <input
            {...register("name")}
            placeholder="John Doe"
            className="field-input"
            autoComplete="name"
          />
          {errors.name && <p className="field-error">{errors.name.message}</p>}
        </div>

        <div>
          <label className="field-label">
            <HiOutlineEnvelope className="inline h-4 w-4 mr-1 -mt-0.5" />
            Email
          </label>
          <input
            {...register("email")}
            type="email"
            placeholder="you@example.com"
            className="field-input"
            autoComplete="email"
          />
          {errors.email && (
            <p className="field-error">{errors.email.message}</p>
          )}
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="field-label">
              <HiOutlineLockClosed className="inline h-4 w-4 mr-1 -mt-0.5" />
              Password
            </label>
            <div className="relative">
              <input
                {...register("password")}
                type={showPassword ? "text" : "password"}
                placeholder="At least 6 characters"
                className="field-input pr-10"
                autoComplete="new-password"
              />
              {passwordValue && (
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
                >
                  {showPassword ? (
                    <HiOutlineEyeSlash className="h-5 w-5" />
                  ) : (
                    <HiOutlineEye className="h-5 w-5" />
                  )}
                </button>
              )}
            </div>
            {errors.password && (
              <p className="field-error">{errors.password.message}</p>
            )}
          </div>

          <div>
            <label className="field-label">Confirm password</label>
            <div className="relative">
              <input
                {...register("confirm")}
                type={showConfirm ? "text" : "password"}
                placeholder="Re-enter password"
                className="field-input pr-10"
                autoComplete="new-password"
              />
              {confirmValue && (
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
                >
                  {showConfirm ? (
                    <HiOutlineEyeSlash className="h-5 w-5" />
                  ) : (
                    <HiOutlineEye className="h-5 w-5" />
                  )}
                </button>
              )}
            </div>
            {errors.confirm && (
              <p className="field-error">{errors.confirm.message}</p>
            )}
          </div>
        </div>

        {error && (
          <div className="rounded-md border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={status === "loading"}
          className="btn-primary w-full"
        >
          {status === "loading" ? "Creating account…" : "Create account"}
          <HiOutlineArrowRight className="h-4 w-4" />
        </button>

        <p className="text-center text-sm text-text-secondary">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-(--color-brand-400) hover:underline"
          >
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}
