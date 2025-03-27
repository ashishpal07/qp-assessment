import { z } from "zod";

const createGrocerySchema = z.object({
  name: z
    .string({ message: "name should be in string." })
    .min(3, { message: "name should be minimum 3 characters." }),
  description: z
    .string({ message: "description should be in string." })
    .min(3, { message: "description should be minimum 3 characters." }),
  price: z
    .number({ message: "price should be in number." })
    .min(1, { message: "price should be minimum 1." }),
  stock: z
    .number({ message: "stock should be in number." })
    .min(1, { message: "stock should be minimum 1." })
    .optional(),
});

const updateGrocerySchema = z.object({
  name: z
    .string({ message: "name should be in string." })
    .min(3, { message: "name should be minimum 3 characters." })
    .optional(),
  description: z
    .string({ message: "description should be in string." })
    .min(3, { message: "description should be minimum 3 characters." })
    .optional(),
  price: z
    .number({ message: "price should be in number." })
    .min(1, { message: "price should be minimum 1." })
    .optional(),
  stock: z
    .number({ message: "stock should be in number." })
    .min(1, { message: "stock should be minimum 1." })
    .optional(),
});

export { createGrocerySchema, updateGrocerySchema };
