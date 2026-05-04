import { useEffect, useState } from "react";
import { useNavigate, Link, useLocation } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { toast } from "react-toastify";
import {
  HiOutlineEnvelope,
  HiOutlineLockClosed,
  HiOutlineShieldCheck,
  HiOutlineArrowRight,
  HiOutlineEye,
  HiOutlineEyeSlash,
} from "react-icons/hi2";
import {
  adminLogin,
  selectAuth,
  selectIsAdmin,
  clearAuthError,
} from "../../app/features/authSlice.js";
import logo from "../../assets/logo.png";

const schema = yup.object({
  email: yup.string().email("Invalid email").required("Email required"),
  password: yup.string().required("Password required"),
});

export default function AdminLoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { status, error } = useSelector(selectAuth);
  const isAdmin = useSelector(selectIsAdmin);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema) });

  // Watch the values to determine if the icon should show
  const passwordValue = watch("password", "");

  useEffect(() => {
    if (isAdmin) {
      const dest = location.state?.from?.pathname?.startsWith("/admin")
        ? location.state.from.pathname
        : "/admin/dashboard";
      navigate(dest, { replace: true });
    }
  }, [isAdmin, location.state, navigate]);

  useEffect(() => {
    if (location.state?.reason === "admin_required") {
      toast.warn("Admin access required");
    }
    return () => dispatch(clearAuthError());
  }, [location.state, dispatch]);

  const onSubmit = async (data) => {
    await dispatch(adminLogin(data)).unwrap();
    toast.success("Admin authenticated");
  };

  return (
    <div className="min-h-screen grid place-items-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6 group">
          <div className="inline-grid h-16 w-16 overflow-hidden rounded-lg group-hover:scale-105 transition-transform">
            <img
              src={logo}
              alt="NexTrain Logo"
              className="h-full w-full object-contain"
            />
          </div>
          <h1 className="font-display font-bold text-2xl">
            Nex<span className="gradient-text">Train</span> Admin
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Restricted area | Staff access only
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="glass p-6 sm:p-8 space-y-4"
        >
          <div>
            <label className="field-label">
              <HiOutlineEnvelope className="inline h-4 w-4 mr-1 -mt-0.5" />
              Admin email
            </label>
            <input
              {...register("email")}
              type="email"
              placeholder="you@example.com"
              className="field-input"
              autoComplete="username"
              autoFocus
            />
            {errors.email && (
              <p className="field-error">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="field-label">
              <HiOutlineLockClosed className="inline h-4 w-4 mr-1 -mt-0.5" />
              Password
            </label>
            <div className="relative">
              <input
                {...register("password")}
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
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
            <HiOutlineShieldCheck className="h-4 w-4" />
            {status === "loading" ? "Authenticating…" : "Enter admin panel"}
            <HiOutlineArrowRight className="h-4 w-4" />
          </button>
        </form>

        <div className="text-center mt-4">
          <Link
            to="/login"
            className="text-xs text-text-muted hover:text-(--color-brand-400)"
          >
            ← Back to user login
          </Link>
        </div>
      </div>
    </div>
  );
}
