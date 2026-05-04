import { HiOutlineSparkles, HiOutlineCheckBadge } from "react-icons/hi2";

// Static client-side images, indexed by class code
import FCO from "../../assets/class-images/FCO.png";
import FAC from "../../assets/class-images/FAC.png";
import SCR from "../../assets/class-images/SCR.png";
import SCU from "../../assets/class-images/SCU.png";
import TCR from "../../assets/class-images/TCR.png";
import TCU from "../../assets/class-images/TCU.png";

const FALLBACK = {
  FCO,
  FAC,
  SCR,
  SCU,
  TCR,
  TCU,
};

const FEATURES = {
  FCO: [
    "Panoramic windows",
    "Reclining lounge seats",
    "Top-tier service",
    "Premium scenic class",
  ],
  FAC: [
    "Air conditioning",
    "Soft seats with armrests",
    "Power outlets",
    "Quiet, comfortable cabin",
  ],
  SCR: [
    "Reserved seating",
    "Comfortable cushioned seats",
    "Larger luggage rack",
    "Great everyday choice",
  ],
  SCU: [
    "Open seating, no reservation",
    "Affordable & flexible",
    "Boarding by ticket",
  ],
  TCR: ["Reserved seating", "Budget-friendly", "Luggage rack overhead"],
  TCU: ["Most affordable option", "Open seating", "First-come, first-served"],
};

/**
 * Marketing-style card for a single train class.
 *
 * Props:
 *   trainClass: { code, name, description, image, isReserved }
 *   featured: highlights with gold ring (used for FCO)
 */
export default function ClassInfoCard({ trainClass, featured = false }) {
  const features = FEATURES[trainClass.code] || [];
  const imgSrc = trainClass.image || FALLBACK[trainClass.code];

  return (
    <article
      className={[
        "glass overflow-hidden h-full flex flex-col group",
        featured
          ? "ring-1 ring-(--color-gold-400)/40 shadow-[0_0_60px_-20px_rgba(251,191,36,0.4)]"
          : "",
      ].join(" ")}
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={imgSrc}
          alt={trainClass.name}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-linear-to-t from-bg-base via-transparent to-transparent" />

        {featured && (
          <span className="absolute top-3 right-3 chip chip-gold">
            <HiOutlineSparkles className="h-3 w-3" />
            Premium
          </span>
        )}
        {!trainClass.isReserved && (
          <span className="absolute top-3 left-3 chip">Unreserved</span>
        )}

        <div className="absolute bottom-3 left-4">
          <span className="font-mono text-xs uppercase tracking-[0.25em] text-text-muted">
            {trainClass.code}
          </span>
          <h3 className="font-display font-bold text-xl leading-tight">
            {trainClass.name}
          </h3>
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col">
        <p className="text-sm ttext-text-secondary leading-relaxed">
          {trainClass.description ||
            "Comfortable rail travel across Sri Lanka with NexTrain."}
        </p>

        {features.length > 0 && (
          <ul className="mt-4 space-y-2">
            {features.map((f) => (
              <li
                key={f}
                className="flex items-start gap-2 text-sm text-text-secondary"
              >
                <HiOutlineCheckBadge className="h-4 w-4 mt-0.5 text-(--color-brand-400) shrink-0" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </article>
  );
}
