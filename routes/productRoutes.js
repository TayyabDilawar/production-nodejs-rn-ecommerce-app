import express from "express";

import { isAdmin, isAuth } from "../middlewares/authMiddleware.js";
import { singleUpload } from "../middlewares/multer.js";
import {
  createProductController,
  deleteProductController,
  deleteProductImageController,
  getAllProductsController,
  getSignleProductController,
  getTopProductController,
  productReviewController,
  updateProductController,
  updateProductImageController,
} from "../controllers/productController.js";

const router = express.Router();

// routes
// GET ALL PRODUCTS
router.get("/get-all", getAllProductsController);

// GET TOP PRODUCTS
router.get("/top", getTopProductController);

// GET SINGLE PRODUCT
router.get("/:id", getSignleProductController);

// CREATE PRODUCT
router.post("/create", isAuth, isAdmin, singleUpload, createProductController);

// UPPDATE PRODUCT
router.put("/:id", isAuth, isAdmin, updateProductController);

// UPPDATE PRODUCT IMAGE
router.put(
  "/image/:id",
  isAuth,
  isAdmin,
  singleUpload,
  updateProductImageController
);

// DELETE PRODUCT IMAGE
router.delete(
  "/delete-image/:id",
  isAuth,
  isAdmin,
  deleteProductImageController
);

// DELETE PRODUCT
router.delete("/delete/:id", isAuth, isAdmin, deleteProductController);

// REVIEW PRODUCT
router.put("/:id/review", isAuth, productReviewController);

export default router;
