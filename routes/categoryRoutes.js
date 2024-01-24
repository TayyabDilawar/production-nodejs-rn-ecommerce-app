import express from "express";

import { isAdmin, isAuth } from "../middlewares/authMiddleware.js";
import {
  createCategoryController,
  deleteCategoryController,
  getAllCategoriesController,
  updateCategoryController,
} from "../controllers/categoryController.js";

const router = express.Router();

// routes
// CREATE CATEGORY
router.post("/create", isAuth, isAdmin, createCategoryController);

// GET ALL PRODUCTS
router.get("/get-all", getAllCategoriesController);

// DELETE CATEGORY
router.delete("/delete/:id", isAuth, isAdmin, deleteCategoryController);

// UPPDATE CATEGORY
router.put("/update/:id", isAuth, isAdmin, updateCategoryController);

export default router;
