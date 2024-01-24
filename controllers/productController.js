import cloudinary from "cloudinary";

import { productModel } from "../models/productModel.js";
import { getDatdaUri } from "../utils/features.js";

// GET ALL PRODUCTS
export const getAllProductsController = async (req, res) => {
  const { keyword, category } = req.query;
  try {
    const products = await productModel
      .find({
        name: {
          $regex: keyword ? keyword : "",
          $options: "i",
        },
        // category: category ? category : undefined,
      })
      .populate("category");

    res.status(200).send({
      success: true,
      message: "Get All Products Successfully",
      totalProducts: products.length,
      products,
    });
  } catch (error) {
    console.log("err", error);
    res.status(500).send({
      success: false,
      message: "Error in Get All Products API",
      error,
    });
  }
};

// GET TOP PRODUCT
export const getTopProductController = async (req, res) => {
  try {
    const products = await productModel.find({}).sort({ rating: -1 }).limit(3);

    res.status(200).send({
      success: true,
      message: "Top 3 Products",
      products,
    });
  } catch (error) {
    console.log("err", error);
    res.status(500).send({
      success: false,
      message: "Error in Get Top Products API",
      error,
    });
  }
};

// GET SINGLE PRODUCT
export const getSignleProductController = async (req, res) => {
  try {
    // get product id
    const product = await productModel.findById(req.params.id);

    // validation
    if (!product) {
      res.status(404).send({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).send({
      success: true,
      message: "Product Found Successfully",
      product,
    });
  } catch (error) {
    console.log("err", error);
    // cast error || Object Id
    if (error.name === "CastError") {
      res.status(500).send({
        success: false,
        message: "Invalid Id",
      });
    }
    res.status(500).send({
      success: false,
      message: "Error in Get Single Product API",
      error,
    });
  }
};

// CREATE PRODUCT
export const createProductController = async (req, res) => {
  try {
    const { name, description, price, stock, category } = req.body;

    // validaion
    if (!name || !description || !price || !stock) {
      return res.status(500).send({
        success: false,
        message: "Please Provide All Fields",
      });
    }
    if (!req.file) {
      return res.status(500).send({
        success: false,
        message: "Please Provide product images",
      });
    }
    const file = getDatdaUri(req.file);
    const cdb = await cloudinary.v2.uploader.upload(file.content);
    const image = {
      public_id: cdb.public_id,
      url: cdb.secure_url,
    };
    await productModel.create({
      name,
      description,
      price,
      stock,
      category,
      images: [image],
    });

    res.status(201).send({
      success: true,
      message: "Product Created Successfully",
    });
  } catch (error) {
    console.log("err", error);
    res.status(500).send({
      success: false,
      message: "Error in Create Product API",
      error,
    });
  }
};

// UPDATE PRODUCT
export const updateProductController = async (req, res) => {
  try {
    // find product
    const product = await productModel.findById(req.params.id);
    // validaion
    if (!product) {
      return res.status(404).send({
        success: false,
        message: "Product not found",
      });
    }

    const { name, description, price, stock, category } = req.body;
    // validaion + update
    if (name) product.name = name;
    if (description) product.description = description;
    if (price) product.price = price;
    if (stock) product.stock = stock;
    if (category) product.category = category;

    await product.save();

    res.status(200).send({
      success: true,
      message: "Product Updated Successfully",
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
      message: "Error in Update Product API",
      error,
    });
  }
};

// UPDATE PRODUCT IMAGE
export const updateProductImageController = async (req, res) => {
  try {
    // find product
    const product = await productModel.findById(req.params.id);
    // validaion
    if (!product) {
      return res.status(404).send({
        success: false,
        message: "Product not found",
      });
    }

    // check file
    if (!req.file) {
      return res.status(404).send({
        success: false,
        message: "Product image not found",
      });
    }
    const file = getDatdaUri(req.file);
    const cdb = await cloudinary.v2.uploader.upload(file.content);
    const image = {
      public_id: cdb.public_id,
      url: cdb.secure_url,
    };

    product.images.push(image);

    await product.save();

    res.status(200).send({
      success: true,
      message: "Product Image Updated Successfully",
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
      message: "Error in Update Product Image API",
      error,
    });
  }
};

// DELETE PRODUCT IMAGE
export const deleteProductImageController = async (req, res) => {
  try {
    // find product
    const product = await productModel.findById(req.params.id);
    // validaion
    if (!product) {
      return res.status(404).send({
        success: false,
        message: "Product not found",
      });
    }

    // image id find
    const id = req.query.id;
    if (!id) {
      return res.status(404).send({
        success: false,
        message: "product image not found",
      });
    }

    let isExist = -1;
    product.images.forEach((item, index) => {
      if (item._id.toString() === id.toString()) isExist = index;
    });
    if (isExist < 0) {
      return res.status(404).send({
        success: false,
        message: "Image Not Found",
      });
    }

    // DELETE PRODUCT IMAGE
    await cloudinary.v2.uploader.destroy(product.images[isExist].public_id);
    product.images.splice(isExist, 1);
    await product.save();

    return res.status(200).send({
      success: true,
      message: "Product Image Deleteed Successfully",
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
      message: "Error in Delete Product Image API",
      error,
    });
  }
};

// DELETE PRODUCT
export const deleteProductController = async (req, res) => {
  try {
    // find product
    const product = await productModel.findById(req.params.id);
    // validaion
    if (!product) {
      return res.status(404).send({
        success: false,
        message: "Product not found",
      });
    }
    // find and delete image cloudinary
    for (let index = 0; index < product.images.length; index++) {
      await cloudinary.v2.uploader.destroy(product.images[index].public_id);
    }

    await product.deleteOne();

    return res.status(200).send({
      success: true,
      message: "Product Deleteed Successfully",
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
      message: "Error in Delete Product Image API",
      error,
    });
  }
};

// CREATE PRODUCT REVIEW AND COMMENT
export const productReviewController = async (req, res) => {
  try {
    const { comment, rating } = req.body;
    // find product
    const product = await productModel.findById(req.params.id);

    // chech previous review
    const alreadyReview = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );
    if (alreadyReview) {
      return res.status(400).send({
        success: false,
        message: "Product Already Reviewed",
      });
    }

    // review object
    const review = {
      name: req.user.name,
      rating: Number(rating),
      comment,
      user: req.user._id,
    };

    // passing review object to review array
    product.reviews.push(review);
    // number or reviews
    product.numReviews = product.reviews.length;
    product.rating =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) /
      product.reviews.length;

    // save product
    await product.save();
    res.status(200).send({
      success: true,
      message: "Review Added!",
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
      message: "Error in Review Comment API",
      error,
    });
  }
};
