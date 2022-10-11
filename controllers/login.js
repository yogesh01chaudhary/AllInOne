const axios = require("axios");
const Joi = require("joi");
const mongoose = require("mongoose");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const { createToken } = require("../helpers/refreshToken");
exports.home = async (req, res) => {
  res.status(200).send({ success: true, message: "Welcome to All In One" });
};

exports.loginUser = async (req, res) => {
  try {
    const { body } = req;
    const { error } = Joi.object()
      .keys({
        phone: Joi.string()
          .regex(/^[6-9]{1}[0-9]{9}$/)
          .required(),
      })
      .required()
      .validate(body);

    if (error) {
      return res
        .status(400)
        .json({ success: false, message: error.details[0].message });
    }
    console.log({ phone: body.phone });
    const result = await axios.get(
      `https://2factor.in/API/V1/c7573668-cfde-11ea-9fa5-0200cd936042/SMS/${body.phone}/AUTOGEN`
    );
    res.status(200).json({ success: true, result: result.data.Details });
  } catch (e) {
    res
      .status(500)
      .json({ success: false, message: "Something went wrong", error: e.name });
  }
};

exports.verifyOTP = async (req, res) => {
  try {
    const { body } = req;
    console.log({ body });
    const verifySchema = Joi.object()
      .keys({
        details: Joi.string().required(),
        otp: Joi.number().min(100000).max(999999).required(),
        phone: Joi.string()
          .regex(/^[6-9]{1}[0-9]{9}$/)
          .required(),
      })
      .required();
    const { error } = verifySchema.validate(body);
    console.log("error in verificaton", error);
    if (error) {
      return res
        .status(400)
        .send({ success: false, message: error.details[0].message });
    }

    try {
      const { details, otp, phone } = body;
      const result = await axios.get(
        `https://2factor.in/API/V1/c7573668-cfde-11ea-9fa5-0200cd936042/SMS/VERIFY/${details}/${otp}`
      );
      console.log(result.data.Details);
      if (result.data.Details === "OTP Expired") {
        return res.status(410).send({ success: false, message: "OTP Expired" });
      }

      let user = await User.findOne({ phone: phone });

      console.log("user ", user);
      if (!user) {
        console.log("before");
        user = new User({ phone });
        console.log({ user, message: "After saving user" });
        user = await user.save();
        console.log("Before savng");
        let token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
          expiresIn: "1d",
        });
        let refreshToken = await createToken(user);
        console.log(token);
        return res.status(200).send({
          success: true,
          message: "User doesn't exist but data saved wth phone number",
          user,
          token,
          refreshToken,
        });
      }

      console.log("User Id in verify otp", user._id);
      let token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "2d",
      });

      let refreshToken = await createToken(user);
      console.log("token", token);
      return res.status(200).send({
        success: true,
        message: "User already exists",
        token,
        user,
        refreshToken,
      });
    } catch (e) {
      return res
        .status(500)
        .json({ success: false, message: "Invalid OTP", error: e.name });
    }
  } catch (e) {
    return res.status(500).json({ success: false, message: e.name });
  }
};

exports.signUp = async (req, res) => {
  try {
    const { id } = req.user;
    const { body } = req;
    // console.log({ id, body });
    const { error } = Joi.object()
      .keys({
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        DOB: Joi.date().required(),
        gender: Joi.string().required(),
        city: Joi.string().required(),
        pin: Joi.number().required(),
        email: Joi.string().email().required(),
      })
      .required()
      .validate(body);
    // console.log({ error });
    if (error) {
      return res
        .status(400)
        .send({ success: false, message: error.details[0].message });
    }
    // console.log(req.user, req.body);
    const user = await User.findByIdAndUpdate(id, body, { new: true });
    if (!user) {
      return res.status(200).send({
        success: true,
        message:
          "No data found, id you are passing in token not exists,If you have logged in by your number please provide valid token otherwise login/signup first with your number",
      });
    }

    user
      .save()
      .then(async (user) => {
        // console.log("DBUser", user);
        // const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        //   expiresIn: process.env.jwtExpiration,
        // });
        // let refreshToken = await createToken(user);
        return res.status(200).send({
          success: true,
          message: "User saved successfully",
          user,
          // token,
          // refreshToken,
        });
      })
      .catch((e) => {
        // console.log("error in db", e.name);
        return res
          .status(400)
          .send({ success: false, message: "User not saved" });
      });
  } catch (e) {
    res.status(500).send({ success: false, message: e.name });
  }
};

exports.getMyProfile = async (req, res) => {
  try {
    // console.log("mji");
    const { id } = req.user;
    const user = await User.findById(id);
    // console.log("user", user);
    if (!user) {
      return res
        .status(200)
        .send({ success: true, message: "user doen't exist" });
    }
    res.status(200).send({ success: true, user });
  } catch (e) {
    res
      .status(500)
      .send({ success: false, message: "Something went wrong", error: e.name });
  }
};

exports.updateMyProfile = async (req, res) => {
  try {
    const { body } = req;
    // console.log({ body, id: req.user.id });
    const { error } = Joi.object()
      .keys({
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        DOB: Joi.date().required(),
        gender: Joi.string().required(),
        city: Joi.string().required(),
        pin: Joi.number().required(),
        email: Joi.string().email().required(),
      })
      .required()
      .validate(body);
    // console.log({ error });
    if (error) {
      return res
        .status(400)
        .send({ success: false, message: error.details[0].message });
    }
    const user = await User.findByIdAndUpdate(req.user.id, body, { new: true });
    // console.log({ updatedUser: user });
    if (!user) {
      return res
        .status(404)
        .send({ success: false, message: "User not found" });
    }
    return res.status(200).send({ success: true, message: "User found", user });
  } catch (e) {
    res
      .status(500)
      .send({ success: false, message: "Something went wrong", error: e.name });
  }
};

exports.deleteMyProfile = async (req, res) => {
  try {
    // console.log({ id: req.user.id });
    let user = await User.findByIdAndDelete(req.user.id);
    if (!user) {
      return res
        .status(400)
        .send({ success: false, message: "User not found" });
    }
    return res.status(200).send({
      success: true,
      message: "User deleted successfully",
      data: user,
    });
  } catch (e) {
    res
      .status(500)
      .send({ success: false, message: "Something went wrong", error: e.name });
  }
};
