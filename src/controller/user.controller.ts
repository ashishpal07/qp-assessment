import bcrypt from "bcrypt";
import { Request, Response } from "express";
import { prisma } from "../config/db";
import { loginUserSchema, registerUserSchema } from "../type/user.type";
import { generateToken } from "../utils/jwt";

/**
 * Handles the registration of a new user.
 *
 * This function performs the following operations:
 * 1. Validates the request body against the register schema.
 * 2. Checks if the user with the given email already exists.
 * 3. Hashes the password of the user.
 * 4. Creates a new user with the given email, hashed password and name.
 *
 * Responds with:
 * - 400 Bad Request if the request body is invalid.
 * - 409 Conflict if the user with the given email already exists.
 * - 201 Created if the user is successfully registered.
 * - 500 Internal Server Error if an unexpected error occurs during processing.
 *
 * @param {Request} req - The HTTP request object.
 * @param {Response} res - The HTTP response object.
 */
const register = async (req: Request, res: Response) => {
  try {
    const parseBody = registerUserSchema.safeParse(req.body);
    if (!parseBody.success) {
      res.status(400).json({ message: parseBody.error });
      return;
    }

    const { email, password, name } = parseBody.data;
    const user = await prisma.user.findFirst({
      where: {
        email,
      },
    });

    if (user) {
      res.status(409).json({ message: "User already exists." });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });

    res
      .status(201)
      .json({ message: "User registered successfully.", user: newUser });
    return;
  } catch (error) {
    res
      .status(500)
      .json({ message: "error while registering user.", error });
    return;
  }
};

/**
 * Logs in a user.
 *
 * Validates the request body against the login schema.
 * Retrieves the user from the database based on the email.
 * Checks if the user exists and if the password matches.
 * Generates a JWT token with the user's ID and role.
 * Returns the token in the response.
 *
 * Responds with:
 * - 400 Bad Request if the request body is invalid.
 * - 404 Not Found if the user is not found.
 * - 401 Unauthorized if the password is invalid.
 * - 200 OK if the login is successful.
 * - 500 Internal Server Error if an unexpected error occurs during processing.
 *
 * @param {Request} req - The HTTP request object.
 * @param {Response} res - The HTTP response object.
 */
const login = async (req: Request, res: Response) => {
  try {
    const parseBody = loginUserSchema.safeParse(req.body);
    if (!parseBody.success) {
      res.status(400).json({ message: parseBody.error });
      return;
    }

    const { email, password } = parseBody.data;
    const user = await prisma.user.findFirst({
      where: {
        email,
      },
    });

    if (!user) {
      res.status(404).json({ message: "User not found." });
      return;
    }

    if (!bcrypt.compareSync(password, user.password)) {
      res.status(401).json({ message: "Invalid credentials." });
      return;
    }

    const token = generateToken(user.id, user.role);

    res.status(200).json({ message: "User logged in successfully.", token });
    return;
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error while logging in user.", error });
    return;
  }
};

export { register, login };
