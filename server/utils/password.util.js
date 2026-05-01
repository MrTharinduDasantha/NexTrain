import bcrypt from "bcrypt";

const ROUNDS = 10;

export const hashPassword = (password) => bcrypt.hash(password, ROUNDS);

export const comparePassword = (raw, hash) => bcrypt.compare(raw, hash);
