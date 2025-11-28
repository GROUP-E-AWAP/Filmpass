import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { createUser, findUserByEmail, findUserById } from "./auth.repository.js";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

function generateToken(userRow) {
  return jwt.sign(
    {
      userId: userRow.user_id,
      email: userRow.email,
      role: userRow.role
    },
    JWT_SECRET,
    { expiresIn: "2h" }
  );
}

export async function registerUserService({ name, email, password }) {
  const existing = await findUserByEmail(email);
  if (existing) {
    const err = new Error("User with this email already exists");
    err.statusCode = 409;
    throw err;
  }

  const hash = await bcrypt.hash(password, 10);
  const displayName = name && name.trim() ? name.trim() : email.split("@")[0];

  const user = await createUser(displayName, email, hash, "customer");
  const token = generateToken(user);

  return {
    token,
    user: {
      id: user.user_id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  };
}

export async function loginUserService({ email, password }) {
  const user = await findUserByEmail(email);
  if (!user) {
    const err = new Error("Invalid email or password");
    err.statusCode = 401;
    throw err;
  }
  const matches = await bcrypt.compare(password, user.password || "");
  if (!matches) {
    const err = new Error("Invalid email or password");
    err.statusCode = 401;
    throw err;
  }
  const token = generateToken(user);
  return {
    token,
    user: {
      id: user.user_id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  };
}

export async function meService(userId) {
  const user = await findUserById(userId);
  if (!user) {
    const err = new Error("User not found");
    err.statusCode = 404;
    throw err;
  }
  return {
    id: user.user_id,
    name: user.name,
    email: user.email,
    role: user.role
  };
}
