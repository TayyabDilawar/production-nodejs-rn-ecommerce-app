import { categoryModel } from "../models/categoryModel.js";
import { productModel } from "../models/productModel.js";
import { orderModel } from "../models/orderModel.js";
import { stripe } from "../server.js";

// CREATE ORDER
export const createOrderController = async (req, res) => {
  try {
    const {
      shippingInfo,
      orderItems,
      //   paymentMethod,
      //   paymentInfo,
      itemPrice,
      tax,
      shippingCharges,
      totalAmount,
    } = req.body;

    // validaion
    if (
      !shippingInfo ||
      !orderItems ||
      !itemPrice ||
      !tax ||
      !shippingCharges ||
      !totalAmount
    ) {
      return res.status(404).send({
        success: false,
        message: "Please Provide All Fields",
      });
    }

    // create order
    await orderModel.create({
      user: req.user._id,
      shippingInfo,
      orderItems,
      //   paymentMethod,
      //   paymentInfo,
      itemPrice,
      tax,
      shippingCharges,
      totalAmount,
    });

    // stock update
    for (let i = 0; i < orderItems.length; i++) {
      // find product
      const product = await productModel.findById(orderItems[i].product);
      product.stock -= orderItems[i].quantity;
      await product.save();
    }

    res.status(201).send({
      success: true,
      message: `Order Places Successfully`,
    });
  } catch (error) {
    console.log("err", error);
    res.status(500).send({
      success: false,
      message: "Error in Create Order API",
      error,
    });
  }
};

// GET ALL ORDERS - MY ORDERS
export const getMyOrdersController = async (req, res) => {
  try {
    // find orders
    const orders = await orderModel.find({ user: req.user._id });

    // validation
    if (!orders) {
      return res.status(404).send({
        success: false,
        message: "No Orders Found",
      });
    }

    res.status(200).send({
      success: true,
      message: "Your Orders Data",
      totalOrders: orders.length,
      orders,
    });
  } catch (error) {
    console.log("err", error);
    res.status(500).send({
      success: false,
      message: "Error in My Orders API",
      error,
    });
  }
};

// GET SINGLE ORDERS INFO
export const singleOrderDetailsController = async (req, res) => {
  try {
    // find order
    const order = await orderModel.findById(req.params.id);

    // validation
    if (!order) {
      return res.status(404).send({
        success: false,
        message: "No Order Found",
      });
    }

    res.status(200).send({
      success: true,
      message: "Your Order Data",
      order,
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
      message: "Error in My Orders API",
      error,
    });
  }
};

// ACCEPT PAYMENT
export const paymentController = async (req, res) => {
  try {
    // get amount
    const { totalAmount } = req.body;
    if (!totalAmount) {
      return res.status(404).send({
        success: false,
        message: "Total Amount is require",
      });
    }
    const { client_secret } = await stripe.paymentIntents.create({
      amount: Number(totalAmount * 100),
      currency: "usd",
    });

    res.status(200).send({
      success: true,
      message: "Done Payment",
      client_secret,
    });
  } catch (error) {
    console.log("err", error);
    res.status(500).send({
      success: false,
      message: "Error in Payment API",
      error,
    });
  }
};

// ================= ADMIN SECTION ===============

// GET ALL ORDERS
export const getAllOrdersController = async (req, res) => {
  try {
    const orders = await orderModel.find({});
    res.status(200).send({
      success: true,
      message: "All Orders Data",
      totalOrders: orders.length,
      orders,
    });
  } catch (error) {
    console.log("err", error);
    res.status(500).send({
      success: false,
      message: "Error in Admin get orders API",
      error,
    });
  }
};

// CHANGE ORDER STATUS
export const changeOrderStatusController = async (req, res) => {
  try {
    // find order
    const order = await orderModel.findById(req.params.id);

    // validation
    if (!order) {
      return res.status(404).send({
        success: false,
        message: "Order Not Found",
      });
    }

    if (order.orderStatus === "processing") order.orderStatus = "shipped";
    else if (order.orderStatus === "shipped") {
      order.orderStatus = "deliverd";
      order.deliverdAt = Date.now();
    } else {
      return res.status(500).send({
        success: false,
        message: "Order Already Delievered",
      });
    }

    await order.save();

    res.status(200).send({
      success: true,
      message: "Order Status Updated",
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
      message: "Error in Change Order Status API",
      error,
    });
  }
};
