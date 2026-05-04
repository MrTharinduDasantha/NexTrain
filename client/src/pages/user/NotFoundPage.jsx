import { Link, useNavigate } from "react-router";
import { HiOutlineArrowLeft, HiOutlineHome } from "react-icons/hi2";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-20 text-center">
      <div className="font-display font-black text-[120px] sm:text-[160px] leading-none gradient-text">
        404
      </div>
      <h1 className="section-title mt-2">Off the rails</h1>
      <p className="mt-3 text-text-secondary max-w-md mx-auto">
        The page you're looking for doesn't exist, or it's been retired. Let's
        get you back on track.
      </p>

      <div className="mt-6 flex items-center justify-center gap-3 flex-wrap">
        <button onClick={() => navigate(-1)} className="btn-ghost">
          <HiOutlineArrowLeft className="h-4 w-4" />
          Go back
        </button>
        <Link to="/" className="btn-primary">
          <HiOutlineHome className="h-4 w-4" />
          Home
        </Link>
      </div>
    </div>
  );
}
