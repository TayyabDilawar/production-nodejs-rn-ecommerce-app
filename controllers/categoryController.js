import { categoryModel } from "../models/categoryModel.js";
import { productModel } from "../models/productModel.js";

// CREATE CATEGORY
export const createCategoryController = async (req, res) => {
  try {
    const { category } = req.body;

    // validaion
    if (!category) {
      return res.status(404).send({
        success: false,
        message: "Please Provide Category Name",
      });
    }

    await categoryModel.create({ category });

    res.status(201).send({
      success: true,
      message: `${category} Category Created Successfully`,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in Create Category API",
      error,
    });
  }
};

// GET ALL CATEGORIES
export const getAllCategoriesController = async (req, res) => {
  try {
    const categories = await categoryModel.find({});

    res.status(200).send({
      success: true,
      message: "Get All Categories Successfully",
      totalCat: categories.length,
      categories,
    });
  } catch (error) {
    console.log("err", error);
    res.status(500).send({
      success: false,
      message: "Error in Get All Categories API",
      error,
    });
  }
};

// DELETE CATEGORY
export const deleteCategoryController = async (req, res) => {
  try {
    // find category
    const category = await categoryModel.findById(req.params.id);
    // validaion
    if (!category) {
      return res.status(404).send({
        success: false,
        message: "Category not found",
      });
    }

    // find product with this category id
    const products = productModel.find({ category: category._id });
    // update product category
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      product.category = undefined;
      await product.save();
    }

    await category.deleteOne();

    return res.status(200).send({
      success: true,
      message: "Category Deleted Successfully",
    });
  } catch (error) {
    console.log("err", error);
    if (error.name === "CastError") {
      res.status(500).send({
        success: false,
        message: "Invalid Id",
      });
    }
    res.status(500).send({
      success: false,
      message: "Error in Delete Category API",
      error,
    });
  }
};

// UPDATE CATEGORY
export const updateCategoryController = async (req, res) => {
  try {
    // find category
    const category = await categoryModel.findById(req.params.id);
    // validaion
    if (!category) {
      return res.status(404).send({
        success: false,
        message: "category not found",
      });
    }

    // get new category
    const { updatedCategory } = req.body;
    // find product with this category id
    const products = productModel.find({ category: category._id });
    // update product category
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      product.category = updatedCategory;
      await product.save();
    }

    if (updatedCategory) category.category = updatedCategory;
    await category.save();

    res.status(200).send({
      success: true,
      message: "Category Updated Successfully",
    });
  } catch (error) {
    console.log("err", error);
    if (error.name === "CastError") {
      res.status(500).send({
        success: false,
        message: "Invalid Id",
      });
    }
    res.status(500).send({
      success: false,
      message: "Error in Update Category API",
      error,
    });
  }
};
