import { z } from "zod";

const registerUserSchema = z.object({
  email: z
    .string({ message: "email should be in string." })
    .email({ message: "Email should be in format user@example.com." }),
  password: z
    .string({ message: "password should be in string." })
    .min(3, { message: "Password should be minimum 3 characters." }),
  name: z
    .string({ message: "name should be in string." })
    .min(3, { message: "Name should be minimum 3 characters." }),
});

const loginUserSchema = z.object({
  email: z
  .string({ message: "email should be in string." })
  .email({ message: "Email should be in format user@example.com."}),
  password: z
    .string({ message: "password should be in string." })
    .min(3, { message: "Password should be minimum 3 characters." }),
});

export { registerUserSchema, loginUserSchema };
