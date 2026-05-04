import { Link } from "react-router";
import {
  HiOutlineEnvelope,
  HiOutlinePhone,
  HiOutlineMapPin,
} from "react-icons/hi2";
import {
  FaFacebookF,
  FaInstagram,
  FaXTwitter,
  FaLinkedinIn,
} from "react-icons/fa6";
import logo from "../../assets/logo.png";

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-border-subtle bg-bg-base/60 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="h-12 w-12 overflow-hidden rounded-lg group-hover:scale-105 transition-transform">
                <img
                  src={logo}
                  alt="NexTrain Logo"
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="font-display font-bold text-lg">
                Nex<span className="gradient-text">Train</span>
              </div>
            </div>
            <p className="text-sm text-text-secondary leading-relaxed">
              Sri Lanka's modern railway reservation system. Search routes, pick
              the perfect seat, and ride confidently with a digital ticket in
              your pocket.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <SocialIcon Icon={FaFacebookF} href="#" label="Facebook" />
              <SocialIcon Icon={FaInstagram} href="#" label="Instagram" />
              <SocialIcon Icon={FaXTwitter} href="#" label="X" />
              <SocialIcon Icon={FaLinkedinIn} href="#" label="LinkedIn" />
            </div>
          </div>

          {/* Explore */}
          <FooterSection title="Explore">
            <FooterLink to="/search">Search trains</FooterLink>
            <FooterLink to="/classes">Train classes</FooterLink>
            <FooterLink to="/my-bookings">My bookings</FooterLink>
            <FooterLink to="/profile">Account</FooterLink>
          </FooterSection>

          {/* Support */}
          <FooterSection title="Support">
            <FooterLink to="#">Help center</FooterLink>
            <FooterLink to="#">Booking policy</FooterLink>
            <FooterLink to="#">Refund policy</FooterLink>
            <FooterLink to="#">Privacy & terms</FooterLink>
          </FooterSection>

          {/* Contact */}
          <div>
            <h4 className="font-display font-semibold text-sm uppercase tracking-wider text-text-secondary mb-4">
              Contact
            </h4>
            <ul className="space-y-3 text-sm text-text-secondary">
              <li className="flex items-start gap-3">
                <HiOutlineMapPin className="h-5 w-5 mt-0.5 text-(--color-brand-400)" />
                Colombo Fort Railway Station, Sri Lanka
              </li>
              <li className="flex items-start gap-3">
                <HiOutlineEnvelope className="h-5 w-5 mt-0.5 text-(--color-brand-400)" />
                <a
                  href="mailto:support@nextrain.lk"
                  className="hover:text-text-primary"
                >
                  support@nextrain.lk
                </a>
              </li>
              <li className="flex items-start gap-3">
                <HiOutlinePhone className="h-5 w-5 mt-0.5 text-(--color-brand-400)" />
                +94 11 243 5215
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-border-subtle flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-text-muted">
          <p>© {new Date().getFullYear()} NexTrain. All rights reserved.</p>
          <p>Built with care for Sri Lankan rail travellers.</p>
        </div>
      </div>
    </footer>
  );
}

function FooterSection({ title, children }) {
  return (
    <div>
      <h4 className="font-display font-semibold text-sm uppercase tracking-wider text-text-secondary mb-4">
        {title}
      </h4>
      <ul className="space-y-2.5">{children}</ul>
    </div>
  );
}

function FooterLink({ to, children }) {
  return (
    <li>
      <Link
        to={to}
        className="text-sm text-text-secondary hover:text-(--color-brand-400) transition-colors"
      >
        {children}
      </Link>
    </li>
  );
}

function SocialIcon({ Icon, href, label }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="h-9 w-9 grid place-items-center rounded-lg border border-border-subtle text-text-secondary hover:text-(--color-brand-400) hover:border-(--color-brand-400) transition-colors"
    >
      <Icon className="h-4 w-4" />
    </a>
  );
}
