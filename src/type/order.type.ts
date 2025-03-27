import { z } from "zod";

const createOrderSchema = z.object({
  orderItems: z.array(
    z.object({
      groceryId: z.number({ message: "groceryId should be in number." }),
      quantity: z
      .number({ message: "stock should be in number." })
      .min(1, { message: "stock should be minimum 1." }),
    })
  ).nonempty({ message: "At least one order item is required." })
  .refine((items) => {
    const ids = items.map((item) => item.groceryId);
    return new Set(ids).size === ids.length;
  }, { message: "groceryId should be unique." }),
});

export { createOrderSchema };
