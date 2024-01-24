import cloudinary from "cloudinary";

import { userModel } from "../models/userModel.js";
import { getDatdaUri } from "../utils/features.js";

// REGISTER USER
export const registerController = async (req, res) => {
  try {
    const { name, email, password, address, city, country, phone, answer } =
      req.body;

    // validaion
    if (
      !name ||
      !email ||
      !password ||
      !address ||
      !city ||
      !country ||
      !phone ||
      !answer
    ) {
      return res.status(500).send({
        success: false,
        message: "Please Provide All Fields",
      });
    }

    // check existing user
    const existingUSer = await userModel.findOne({ email });
    // validation
    if (existingUSer) {
      return res.status(500).send({
        success: false,
        message: "Email already taken.",
      });
    }

    const user = await userModel.create({
      name,
      email,
      password,
      address,
      city,
      country,
      phone,
      answer,
    });
    res.status(201).send({
      success: true,
      message: "User Register Successfully, Please login",
      user,
    });
  } catch (error) {
    console.log("err", error);
    res.status(500).send({
      success: false,
      message: "Error in Register API",
      error,
    });
  }
};

// LOGIN USER
export const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    // validaion
    if (!email || !password) {
      return res.status(500).send({
        success: false,
        message: "Please Add Email OR Password",
      });
    }

    // check user
    const user = await userModel.findOne({ email });
    // user validation
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User Not Found.",
      });
    }

    // check password
    const isMatch = await user.comparePassword(password);

    // validation
    if (!isMatch) {
      return res.status(500).send({
        success: false,
        message: "password not correct.",
      });
    }
    // user.password = "";
    // token
    const token = await user.generateToken();
    res
      .status(200)
      .cookie("token", token, {
        expires: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        // secure: process.env.NODE_ENV === "development" ? true : false,
        httpOnly: process.env.NODE_ENV === "development" ? true : false,
        sameSite: process.env.NODE_ENV === "development" ? true : false,
      })
      .send({
        success: true,
        message: "Login Successfully",
        token,
        user,
      });
  } catch (error) {
    console.log("error", error);
    res.status(500).send({
      success: false,
      message: "Error in Login API",
      error,
    });
  }
};

// GET USER PROFILE
export const getUserProfileController = async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id);
    user.password = undefined;
    res.status(200).send({
      success: true,
      message: "User Profile Fetched Successfully",
      user,
    });
  } catch (error) {
    console.log("error", error);
    res.status(500).send({
      success: false,
      message: "Error in Profile API",
      error,
    });
  }
};

// LOGOUT
export const logoutController = async (req, res) => {
  try {
    res.status(200).clearCookie("token").send({
      success: true,
      message: "Logout Successfully",
    });
  } catch (error) {
    console.log("error", error);
    res.status(500).send({
      success: false,
      message: "Error in Logout API",
      error,
    });
  }
};

// UPDATE USER PROFILE
export const updateProfileController = async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id);
    const { name, email, address, city, country, phone } = req.body;

    // validaion + update
    if (name) user.name = name;
    if (email) user.email = email;
    if (address) user.address = address;
    if (city) user.city = city;
    if (country) user.country = country;
    if (phone) user.phone = phone;

    // save user
    await user.save();

    res.status(200).send({
      success: true,
      message: "User Profile Updated",
    });
  } catch (error) {
    console.log("error", error);
    res.status(500).send({
      success: false,
      message: "Error in Update Profile API",
      error,
    });
  }
};

// UPDATE USER PASSWORD
export const updatePasswordController = async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id);
    const { oldPassword, newPassword } = req.body;

    // validaion
    if (!oldPassword || !newPassword) {
      return res.status(500).send({
        success: false,
        message: "Please provide old or new password",
      });
    }

    // old password check
    const isMatch = await user.comparePassword(oldPassword);

    // validaion
    if (!isMatch) {
      return res.status(500).send({
        success: false,
        message: "Invalid Old Password",
      });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).send({
      success: true,
      message: "Password Updated Successfully",
    });
  } catch (error) {
    console.log("error", error);
    res.status(500).send({
      success: false,
      message: "Error in Update Password API",
      error,
    });
  }
};

// UPDATE USER PROFILE PHOTO
export const updateProflePicController = async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id);

    // file get from client photo
    const file = getDatdaUri(req.file);

    // delete prev image
    await cloudinary.v2.uploader.destroy(user.profilePic.public_id);

    // update
    const cdb = await cloudinary.v2.uploader.upload(file.content);
    user.profilePic = {
      public_id: cdb.public_id,
      url: cdb.secure_url,
    };

    await user.save();

    res.status(200).send({
      success: true,
      message: "Profile Picture Updated Successfully",
    });
  } catch (error) {
    console.log("error", error);
    res.status(500).send({
      success: false,
      message: "Error in Update Profile Pic API",
      error,
    });
  }
};

// FORGOT PASSWORD
export const passwordResetController = async (req, res) => {
  try {
    // user get email || newPassword || answer
    const { email, newPassword, answer } = req.body;
    // validation
    if (!email || !newPassword || !answer) {
      return res.status(500).send({
        success: false,
        message: "Please Provide All Fields",
      });
    }

    // find user
    const user = await userModel.findOne({ email, answer });
    // validation
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "Invalid user or answer",
      });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).send({
      success: true,
      message: "Your Password Has Benn Reset, Please Login!",
    });
  } catch (error) {
    console.log("error", error);
    res.status(500).send({
      success: false,
      message: "Error in Password Reset API",
      error,
    });
  }
};
