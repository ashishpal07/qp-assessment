import { prisma } from "../config/db";
import { Request, Response } from "express";
import { createOrderSchema } from "../type/order.type";
import { OrderStatus } from "@prisma/client";

/**
 * Handles the creation of a new order for a user.
 *
 * This function performs the following operations:
 * 1. Authenticates the user based on the request.
 * 2. Validates the request body against the order schema.
 * 3. Retrieves grocery items associated with the order.
 * 4. Checks for sufficient stock of each grocery item.
 * 5. Calculates the total amount for the order.
 * 6. Creates the order and updates the stock of each grocery item.
 *
 * Responds with:
 * - 401 Unauthorized if the user is not authenticated.
 * - 400 Bad Request if the request body is invalid or if stock is insufficient.
 * - 404 Not Found if any grocery item is not found.
 * - 201 Created if the order is successfully created.
 * - 500 Internal Server Error if an unexpected error occurs during processing.
 *
 * @param {Request} req - The HTTP request object.
 * @param {Response} res - The HTTP response object.
 */
const createOrder = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    const parseBody = createOrderSchema.safeParse(req.body);
    if (!parseBody.success) {
      res.status(400).json({ message: parseBody.error });
      return;
    }

    const { orderItems } = parseBody.data;

    const groceries = await getGroceries(orderItems);

    if (groceries.length !== orderItems.length) {
      res.status(404).json({ message: "Some groceries not found" });
      return;
    }

    let totalAmount = 0;
    for (const item of orderItems) {
      const grocery = groceries.find((g) => g.id === item.groceryId);
      if (!grocery || grocery.stock < item.quantity) {
        res.status(400).json({
          message: `Insufficient stock for ${grocery?.name}`,
        });
        return;
      }
      totalAmount += grocery.price * item.quantity;
    }

    const createdOrder = await createOrderAndUpdateStock(
      userId,
      totalAmount,
      orderItems,
      groceries
    );

    res
      .status(201)
      .json({ message: "Order created successfully.", order: createdOrder });
    return;
  } catch (error) {
    res.status(500).json({
      message: "Internal server error while creating order.",
      error,
    });
    return;
  }
};

/**
 * Cancels a pending order for a user.
 *
 * This function performs the following operations:
 * 1. Validates the request body against the cancel order schema.
 * 2. Retrieves the order and its items from the database.
 * 3. Checks if the order exists and belongs to the requesting user.
 * 4. Ensures that the order is in a 'PENDING' state before cancellation.
 * 5. Reverts the stock of the grocery items associated with the order.
 * 6. Updates the order status to 'CANCELLED'.
 *
 * Responds with:
 * - 404 Not Found if the order does not exist.
 * - 403 Forbidden if the user tries to cancel an order that does not belong to them.
 * - 400 Bad Request if the order is not pending.
 * - 200 OK if the order is successfully canceled.
 * - 500 Internal Server Error if an unexpected error occurs during processing.
 *
 * @param {Request} req - The HTTP request object.
 * @param {Response} res - The HTTP response object.
 */
const cancelOrder = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.user?.id);
    const orderId = parseInt(req.params.orderId);
    if (!orderId || isNaN(orderId)) {
      res.status(400).json({ message: "Invalid or missing orderId." });
      return;
    }


    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { orderItems: true },
    });
  
    if (!order) {
      res.status(404).json({ message: 'Order not found.' });
      return;
    }
  
    if (order.userId !== userId) {
      res.status(403).json({ message: 'You can only cancel your own orders.' });
      return;
    }
  
    if (order.orderStatus !== 'PENDING') {
      res.status(400).json({ message: 'Only pending orders can be canceled.' });
      return;
    }
  
    await prisma.$transaction(async (prisma) => {
      await Promise.all(
        order.orderItems.map((item) =>
          prisma.grocery.update({
            where: { id: item.groceryId },
            data: { stock: { increment: item.quantity } },
          })
        )
      );
  
      await prisma.order.update({
        where: { id: orderId },
        data: { orderStatus: OrderStatus.CANCELLED },
      });
    });
  
    res.status(200).json({ message: 'Order canceled successfully.' });
    return;
  } catch (error) {
    res.status(500).json({
      message: "Internal server error while canceling order.",
      error,
    });
    return;
  }
}


/**
 * Delivers a pending order for a user.
 *
 * This function performs the following operations:
 * 1. Validates the request body against the deliver order schema.
 * 2. Retrieves the order from the database.
 * 3. Checks if the order exists and belongs to the requesting user.
 * 4. Ensures that the order is in a 'PENDING' state before delivery.
 * 5. Updates the order status to 'DELIVERED'.
 *
 * Responds with:
 * - 404 Not Found if the order does not exist.
 * - 403 Forbidden if the user tries to deliver an order that does not belong to them.
 * - 400 Bad Request if the order is not pending.
 * - 200 OK if the order is successfully delivered.
 * - 500 Internal Server Error if an unexpected error occurs during processing.
 *
 * @param {Request} req - The HTTP request object.
 * @param {Response} res - The HTTP response object.
 */
async function deliverOrder(req: Request, res: Response) {
  try {
    const orderId = parseInt(req.params.orderId);
    if (!orderId || isNaN(orderId)) {
      res.status(400).json({ message: "Invalid or missing orderId." });
      return;
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });
  
    if (!order) {
      res.status(404).json({ message: 'Order not found.' });
      return;
    }
  
    if (order.orderStatus !== OrderStatus.PENDING) {
      res.status(400).json({ message: 'Only pending orders can be delivered.' });
      return;
    }
  
    await prisma.order.update({
      where: { id: orderId },
      data: { orderStatus: OrderStatus.DELIVERED },
    });
  
    res.status(200).json({ message: 'Order delivered successfully.' });
    return;
  } catch (error) {
    res.status(500).json({
      message: "Internal server error while delivering order",
      error,
    });
    return;
  }
}



/**
 * Creates an order and updates the stock of each grocery item in a single transaction.
 *
 * @param {any} userId - The ID of the user who is creating the order.
 * @param {number} totalAmount - The total amount of the order.
 * @param {{ groceryId: number; quantity: number }[]} orderItems - The items in the order.
 * @param {{ name: string; id: number; stock: number; price: number }[]} groceries - The groceries in the order.
 *
 * @returns {Promise<import("@prisma/client").Order>} The newly created order.
 */
async function createOrderAndUpdateStock(
  userId: string,
  totalAmount: number,
  orderItems: { groceryId: number; quantity: number }[],
  groceries: { name: string; id: number; stock: number; price: number }[]
): Promise<import("@prisma/client").Order> {
  return await prisma.$transaction(async (prisma) => {
    const order = await prisma.order.create({
      data: {
        userId: parseInt(userId),
        totalPrice: totalAmount,
        orderItems: {
          create: orderItems.map((item) => {
            const grocery = groceries.find((g) => g.id === item.groceryId)!;
            return {
              groceryId: item.groceryId,
              quantity: item.quantity,
              price: grocery.price,
            };
          }),
        },
      },
    });

    await Promise.all(
      orderItems.map((item) =>
        prisma.grocery.update({
          where: { id: item.groceryId },
          data: { stock: { decrement: item.quantity } },
        })
      )
    );

    return order;
  });
}



/**
 * Gets the groceries from the database for the given order items.
 *
 * @param {{ groceryId: number; quantity: number }[]} orderItems - The items in the order.
 *
 * @returns {Promise<{ id: number; name: string; price: number; stock: number }[]>} The groceries in the order.
 */
async function getGroceries(
  orderItems: { groceryId: number; quantity: number }[]
): Promise<{ id: number; name: string; price: number; stock: number; }[]> {
  return await prisma.grocery.findMany({
    where: {
      id: {
        in: orderItems.map(
          (item: { groceryId: number; quantity: number }) => item.groceryId
        ),
      },
    },
    select: {
      id: true,
      name: true,
      price: true,
      stock: true,
    },
  });
}


export { createOrder, cancelOrder, deliverOrder };
