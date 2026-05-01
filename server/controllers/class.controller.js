import TrainClass, { CLASS_CODES } from "../models/trainClass.model.js";
import { ok, created, fail } from "../utils/response.util.js";

const SEED = [
  {
    code: "FCO",
    name: "First Class Observation Saloon",
    isReserved: true,
    description: "Premium scenic class with large windows and reclining seats.",
  },
  {
    code: "FAC",
    name: "First Class Air-Conditioned (AC)",
    isReserved: true,
    description:
      "Air-conditioned first class for the most comfortable journey.",
  },
  {
    code: "SCR",
    name: "Second Class Reserved",
    isReserved: true,
    description: "Reserved seating in the second-class coach.",
  },
  {
    code: "SCU",
    name: "Second Class Unreserved",
    isReserved: false,
    description: "Open seating, no reservation needed.",
  },
  {
    code: "TCR",
    name: "Third Class Reserved",
    isReserved: true,
    description: "Affordable reserved option for budget travellers.",
  },
  {
    code: "TCU",
    name: "Third Class Unreserved",
    isReserved: false,
    description: "The most affordable open-seating option.",
  },
];

export const seedClasses = async (_req, res) => {
  for (const c of SEED) {
    await TrainClass.findOneAndUpdate({ code: c.code }, c, { upsert: true });
  }
  const classes = await TrainClass.find();

  return ok(res, { classes }, "Classes seeded");
};

export const listClasses = async (_req, res) => {
  const classes = await TrainClass.find().sort({ code: 1 });

  return ok(res, { classes });
};

export const getClass = async (req, res) => {
  const c = await TrainClass.findById(req.params.id);
  if (!c) return fail(res, 404, "Class not found");

  return ok(res, { class: c });
};

export const upsertClass = async (req, res) => {
  if (req.body.code && !CLASS_CODES.includes(req.body.code)) {
    return fail(
      res,
      400,
      `Invalid class code. Allowed: ${CLASS_CODES.join(", ")}`,
    );
  }

  const c = await TrainClass.findOneAndUpdate(
    { code: req.body.code },
    req.body,
    { upsert: true, new: true, runValidators: true },
  );

  return created(res, { class: c }, "Class saved");
};
