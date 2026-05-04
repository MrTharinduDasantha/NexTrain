import { useEffect, useState } from "react";
import { Link } from "react-router";
import {
  HiOutlineShieldCheck,
  HiOutlineBoltSlash,
  HiOutlineDevicePhoneMobile,
  HiOutlineSparkles,
  HiOutlineArrowRight,
} from "react-icons/hi2";
import TrainSearchForm from "../../components/user/TrainSearchForm.jsx";
import ClassInfoCard from "../../components/user/ClassInfoCard.jsx";
import { classApi } from "../../api/class.api.js";
import heroImage from "../../assets/train-hero.png";

export default function HomePage() {
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    classApi
      .list()
      .then((data) => setClasses(data?.classes || []))
      .catch(() => {});
  }, []);

  const featured = classes.filter((c) =>
    ["FCO", "FAC", "SCR"].includes(c.code),
  );

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-visible">
        <div
          className="absolute inset-0 -z-10"
          style={{
            backgroundImage: `linear-gradient(to bottom, rgba(7,11,20,0.4), rgba(7,11,20,0.95)), url(${heroImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 sm:pt-24 pb-12">
          <div className="max-w-3xl">
            <span className="chip chip-brand mb-4">
              <HiOutlineSparkles className="h-3 w-3" />
              Sri Lanka's modern rail booking
            </span>
            <h1 className="font-display text-4xl sm:text-6xl font-bold leading-[1.05] tracking-tight">
              Travel the island,
              <br />
              <span className="gradient-text">one rail at a time.</span>
            </h1>
            <p className="mt-5 text-lg text-text-secondary max-w-xl">
              Search routes across the country, pick the seat with the best
              view, and ride confidently with a digital ticket in your pocket.
            </p>
          </div>

          {/* Search */}
          <div className="mt-10 relative z-40">
            <TrainSearchForm />
          </div>

          {/* Mini-stats */}
          <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-3xl">
            <Stat label="Active trains" value="50+" />
            <Stat label="Stations" value="120+" />
            <Stat label="Routes covered" value="1,800 km" />
            <Stat label="Happy travellers" value="100k+" />
          </div>
        </div>
      </section>

      {/* VALUE PROPS */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-16 sm:mt-24">
        <div className="grid sm:grid-cols-3 gap-4">
          <Feature
            icon={HiOutlineShieldCheck}
            title="Secure & instant"
            text="Stripe-powered checkout with real-time confirmation and an e-ticket sent to your inbox."
          />
          <Feature
            icon={HiOutlineBoltSlash}
            title="No more queues"
            text="Skip the counter. Search, select your seat, and pay — all from your phone."
          />
          <Feature
            icon={HiOutlineDevicePhoneMobile}
            title="Travel light"
            text="Carry your boarding pass anywhere. Download the PDF or show it from My Bookings."
          />
        </div>
      </section>

      {/* FEATURED CLASSES */}
      {featured.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-16 sm:mt-24">
          <div className="flex items-end justify-between mb-6 flex-wrap gap-3">
            <div>
              <span className="text-[10px] uppercase tracking-[0.25em] text-text-muted">
                Choose your ride
              </span>
              <h2 className="section-title mt-2">
                Travel <span className="gradient-text">your way</span>
              </h2>
            </div>
            <Link
              to="/classes"
              className="text-sm text-(--color-brand-400) hover:underline inline-flex items-center gap-1"
            >
              View all classes <HiOutlineArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {featured.map((c) => (
              <ClassInfoCard
                key={c._id}
                trainClass={c}
                featured={c.code === "FCO"}
              />
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 my-20">
        <div className="glass p-8 sm:p-12 text-center relative overflow-hidden">
          <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-brand-500/20 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-accent-500/20 blur-3xl" />
          <div className="relative">
            <h2 className="section-title">Ready to ride?</h2>
            <p className="mt-3 text-text-secondary max-w-xl mx-auto">
              Sign up in 30 seconds and book your first journey today.
            </p>
            <div className="mt-6 flex items-center justify-center gap-3 flex-wrap">
              <Link to="/register" className="btn-primary">
                Create free account
              </Link>
              <Link to="/search" className="btn-ghost">
                Browse trains
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function Stat({ label, value }) {
  return (
    <div className="glass px-4 py-3">
      <div className="font-display font-bold text-2xl gradient-text">
        {value}
      </div>
      <div className="text-[11px] uppercase tracking-wider text-text-muted">
        {label}
      </div>
    </div>
  );
}

function Feature({ icon: Icon, title, text }) {
  return (
    <div className="glass glass-hover p-6">
      <div className="h-11 w-11 rounded-xl bg-brand-500/15 grid place-items-center text-brand-300 mb-4">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="font-display font-semibold text-lg">{title}</h3>
      <p className="mt-2 text-sm text-text-secondary leading-relaxed">{text}</p>
    </div>
  );
}
