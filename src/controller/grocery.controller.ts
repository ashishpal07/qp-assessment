import { Request, Response } from "express";
import { prisma } from "../config/db";
import { createGrocerySchema, updateGrocerySchema } from "../type/grocery.type";

/**
 * Creates a new grocery item.
 *
 * @remarks
 * This endpoint is protected. Only the admin user can create a new grocery item.
 *
 * @param req - The express request object.
 * @param res - The express response object.
 *
 * @returns {Promise<void>} - A promise that resolves to void.
 */
const createGrocery = async (req: Request, res: Response) => {
  try {
    const parseBody = createGrocerySchema.safeParse(req.body);
    if (!parseBody.success) {
      res.status(400).json({ message: parseBody.error });
      return;
    }

    const grocery = await prisma.grocery.create({
      data: { ...parseBody.data },
    });

    res
      .status(201)
      .json({ message: "Grocery created successfully.", grocery });
    return;
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error while creating grocery.", error });
    return;
  }
};

/**
 * Updates an existing grocery item.
 *
 * @remarks
 * This endpoint is protected. Only the admin user can update an existing grocery item.
 *
 * @param req - The express request object.
 * @param res - The express response object.
 *
 * @returns {Promise<void>} - A promise that resolves to void.
 */
const updateGrocery = async (req: Request, res: Response) => {
  const groceryId = Number(req.params.groceryId);
  if (!groceryId || isNaN(groceryId)) {
    res.status(400).json({ message: "Invalid or missing grocery ID." });
    return;
  }

  try {
    const parseBody = updateGrocerySchema.safeParse(req.body);
    if (!parseBody.success) {
      res.status(400).json({ message: parseBody.error });
      return;
    }

    const grocery = await prisma.grocery.findFirst({
      where: {
        id: groceryId,
      },
    });

    if (!grocery) {
      res.status(404).json({ message: "Grocery not found." });
      return;
    }

    const updateGrocery = await prisma.grocery.update({
      where: {
        id: groceryId,
      },
      data: { ...parseBody.data },
    });

    res
      .status(200)
      .json({ message: "Grocery updated successfully.", updateGrocery });
    return;
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error while updating grocery.", error });
    return;
  }
};

/**
 * Deletes a grocery item by its ID.
 *
 * @remarks
 * This endpoint is protected. Only the admin user can delete a grocery item.
 *
 * @param req - The express request object containing the grocery ID as a URL parameter.
 * @param res - The express response object used to send back the appropriate HTTP response.
 *
 * @returns {Promise<void>} - A promise that resolves to void.
 *
 * Responds with:
 * - 400 Bad Request if the grocery ID is invalid or missing.
 * - 404 Not Found if the grocery item does not exist.
 * - 200 OK if the grocery is successfully deleted.
 * - 500 Internal Server Error if an unexpected error occurs during the deletion process.
 */
const deleteGrocery = async (req: Request, res: Response) => {
  const groceryId = Number(req.params.groceryId);
  if (!groceryId || isNaN(groceryId)) {
    res.status(400).json({ message: "Invalid or missing grocery ID." });
    return;
  }

  try {
    const grocery = await prisma.grocery.findFirst({
      where: {
        id: groceryId,
      },
    });

    if (!grocery) {
      res.status(404).json({ message: "Grocery not found." });
      return;
    }

    const deleteGrocery = await prisma.grocery.delete({
      where: {
        id: groceryId,
      },
    });

    res
      .status(200)
      .json({ message: "Grocery deleted successfully.", deleteGrocery });
    return;
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error while deleting grocery.", error });
    return;
  }
};

/**
 * Retrieves a grocery item by its ID.
 *
 * @param req - The express request object containing the grocery ID as a URL parameter.
 * @param res - The express response object used to send back the appropriate HTTP response.
 *
 * @returns {Promise<void>} - A promise that resolves to void.
 *
 * Responds with:
 * - 400 Bad Request if the grocery ID is invalid or missing.
 * - 404 Not Found if the grocery item does not exist.
 * - 200 OK with the grocery item if found.
 * - 500 Internal Server Error if an unexpected error occurs during the retrieval process.
 */

const getGrocery = async (req: Request, res: Response) => {
  const groceryId = Number(req.params.groceryId);
  if (!groceryId || isNaN(groceryId)) {
    res.status(400).json({ message: "Invalid or missing grocery ID." });
    return;
  }
  
  try {
    const grocery = await prisma.grocery.findFirst({
      where: {
        id: groceryId,
      },
    });

    if (!grocery) {
      res.status(404).json({ message: "Grocery not found." });
      return;
    }

    res.status(200).json({ grocery });
    return;
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error while fetching grocery.", error });
    return;
  }
};

/**
 * Retrieves all grocery items from the database.
 *
 * @param req - The express request object.
 * @param res - The express response object used to send back the appropriate HTTP response.
 *
 * @returns {Promise<void>} - A promise that resolves to void.
 *
 * Responds with:
 * - 200 OK with an array of all grocery items if found.
 * - 500 Internal Server Error if an unexpected error occurs during the retrieval process.
 */
const getAllGroceries = async (req: Request, res: Response) => {
  try {
    const groceries = await prisma.grocery.findMany();

    res.status(200).json({ groceries });
    return;
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error while fetching groceries.", error });
    return;
  }
};

export { createGrocery, updateGrocery, deleteGrocery, getGrocery, getAllGroceries };
