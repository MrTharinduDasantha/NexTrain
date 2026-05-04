import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { toast } from "react-toastify";
import {
  HiOutlineEnvelope,
  HiOutlineLockClosed,
  HiOutlineArrowRight,
  HiOutlineEye,
  HiOutlineEyeSlash,
} from "react-icons/hi2";
import {
  login,
  selectAuth,
  clearAuthError,
} from "../../app/features/authSlice.js";
import heroImage from "../../assets/train-hero.png";

const schema = yup.object({
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup.string().required("Password is required"),
});

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, status, error } = useSelector(selectAuth);
  const from = location.state?.from?.pathname || "/";

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema) });

  // Watch the values to determine if the icon should show
  const passwordValue = watch("password", "");

  useEffect(() => {
    if (user) navigate(from, { replace: true });
  }, [user, from, navigate]);

  useEffect(() => {
    return () => dispatch(clearAuthError());
  }, [dispatch]);

  const onSubmit = async (data) => {
    await dispatch(login(data)).unwrap();
    toast.success("Welcome back");
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
      <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
        {/* Form panel */}
        <div className="max-w-md w-full mx-auto lg:mx-0 order-2 lg:order-1">
          <h1 className="section-title">
            Welcome <span className="gradient-text">back</span>
          </h1>
          <p className="mt-2 text-text-secondary">
            Sign in to continue your journey with NexTrain.
          </p>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="mt-8 glass p-6 sm:p-7 space-y-4"
          >
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
              {status === "loading" ? "Signing in…" : "Sign in"}
              <HiOutlineArrowRight className="h-4 w-4" />
            </button>

            <p className="text-center text-sm text-text-secondary pt-2">
              New to NexTrain?{" "}
              <Link
                to="/register"
                className="text-(--color-brand-400) hover:underline"
              >
                Create an account
              </Link>
            </p>
          </form>

          <div className="mt-4 text-center">
            <Link
              to="/admin/login"
              className="text-xs text-text-muted hover:text-(--color-brand-400)"
            >
              Admin Access →
            </Link>
          </div>
        </div>

        {/* Brand panel */}
        <div className="order-1 lg:order-2 hidden md:block">
          <div
            className="glass relative overflow-hidden h-100 lg:h-130"
            style={{
              backgroundImage: `linear-gradient(135deg, rgba(7,11,20,0.4), rgba(7,11,20,0.85)), url(${heroImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="absolute inset-0 p-8 flex flex-col justify-end">
              <span className="chip chip-brand mb-3 self-start">NexTrain</span>
              <h2 className="font-display font-bold text-3xl leading-tight">
                Your journey,{" "}
                <span className="gradient-text">just a tap away.</span>
              </h2>
              <p className="mt-3 text-sm text-text-secondary max-w-lg">
                Real-time seat maps, instant e-tickets, and zero queue stress —
                rail travel built for the way you live.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
