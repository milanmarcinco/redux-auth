const { jwtVerify } = require("../helpers/jwt");
const User = require("../models/User");

exports.register = async (req, res) => {
  try {
    const { firstName, lastName, nickname, email, password } = req.body.user;

    const match = await User.findOne({ email }).exec();
    if (match) throw { message: "User already exists", statusCode: 409 };

    const newUser = new User({ firstName, lastName, nickname, email, password });

    const accessToken = await newUser.genToken("access", { expiresIn: "30m" });
    const refreshToken = await newUser.genToken("refresh", { expiresIn: "30d" });

    if (!accessToken || !refreshToken)
      throw {
        message: "An error occurred while trying to log in the newly registered user",
        statusCode: 500,
      };

    newUser.refreshTokens.push(refreshToken);

    try {
      await newUser.save();
    } catch (err) {
      throw { message: err.message, statusCode: 500 };
    }

    res.status(201).json({
      error: null,
      user: newUser,
      accessToken,
      refreshToken,
    });
  } catch (err) {
    res.status(err.statusCode || 400).json({
      error: err.message,
    });
  }
};

exports.logIn = async (req, res) => {
  try {
    const { email, password } = req.body.user;
    const foundUser = await User.findOne({ email }, "+password").exec();
    if (!foundUser) throw { message: "User not found", statusCode: 404 };

    const passwordIsCorrect = await foundUser.checkPassword(password);
    if (!passwordIsCorrect) throw { message: "Password is incorrect", statusCode: 401 };

    const accessToken = await foundUser.genToken("access", { expiresIn: "30m" });
    const refreshToken = await foundUser.genToken("refresh", { expiresIn: "30d" });
    if (!accessToken || !refreshToken) {
      throw {
        message: "An error occurred while trying to log in",
        statusCode: 500,
      };
    }

    foundUser.refreshTokens.push(refreshToken);

    try {
      await foundUser.save();
    } catch (err) {
      throw { message: err.message, statusCode: 500 };
    }

    res.status(200).json({
      error: null,
      user: foundUser,
      accessToken,
      refreshToken,
    });
  } catch (err) {
    res.status(err.statusCode || 400).json({
      error: err.message,
    });
  }
};

exports.renewToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    const tokenPayload = jwtVerify(refreshToken, "refresh", { ignoreExpiration: false });
    if (!tokenPayload) throw { message: "Invalid refresh token", statusCode: 401 };

    const { _id } = tokenPayload;
    const foundUser = await User.findById(_id).exec();
    if (!foundUser) throw { message: "User does not exist", statusCode: 404 };

    if (!foundUser.refreshTokens.includes(refreshToken)) throw { message: "Invalid refresh token", statusCode: 401 };

    foundUser.refreshTokens = foundUser.refreshTokens.filter((token) => {
      return token !== refreshToken && jwtVerify(token, "refresh", { ignoreExpiration: false });
    });

    const newAccessToken = await foundUser.genToken("access", { expiresIn: "30m" });

    res.status(200).json({
      error: null,
      accessToken: newAccessToken,
    });
  } catch (err) {
    res.status(err.statusCode || 400).json({
      error: err.message,
    });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const { oldPassword, newPassword } = req.body.user;

    const tokenPayload = jwtVerify(refreshToken, "refresh", { ignoreExpiration: false });
    if (!tokenPayload) throw { message: "Invalid authentication token", statusCode: 401 };

    const { _id } = tokenPayload;
    const foundUser = await User.findById(_id, "+password").exec();
    if (!foundUser) throw { message: "User does not exist", statusCode: 404 };

    if (!foundUser.refreshTokens.includes(refreshToken)) throw { message: "Invalid refresh token", statusCode: 401 };

    const passwordIsCorrect = await foundUser.checkPassword(oldPassword);
    if (!passwordIsCorrect) throw { message: "Password is incorrect", statusCode: 401 };

    foundUser.password = newPassword;

    foundUser.refreshTokens = [];

    try {
      await foundUser.save();
    } catch (err) {
      throw { message: err.message, statusCode: 500 };
    }

    res.status(200).json({
      error: null,
    });
  } catch (err) {
    res.status(err.statusCode || 400).json({
      error: err.message,
    });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { user, refreshToken } = req.body;

    const tokenPayload = jwtVerify(refreshToken, "refresh", { ignoreExpiration: false });
    if (!tokenPayload) throw { message: "Invalid authentication token", statusCode: 401 };

    const { _id } = tokenPayload;
    const foundUser = await User.findById(_id).exec();
    if (!foundUser) throw { message: "User does not exist", statusCode: 404 };

    if (!foundUser.refreshTokens.includes(refreshToken)) throw { message: "Invalid refresh token", statusCode: 401 };

    foundUser.firstName = user.firstName;
    foundUser.lastName = user.lastName;
    foundUser.nickname = user.nickname;

    try {
      await foundUser.save();
    } catch (err) {
      throw { message: err.message, statusCode: 500 };
    }

    res.status(200).json({
      error: null,
      user: foundUser,
    });
  } catch (err) {
    res.status(err.statusCode || 400).json({
      error: err.message,
    });
  }
};

exports.logOut = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const tokenPayload = jwtVerify(refreshToken, "refresh", { ignoreExpiration: true });
    if (!tokenPayload) throw { message: "Invalid authentication token", statusCode: 401 };

    const { _id } = tokenPayload;
    const foundUser = await User.findById(_id).exec();
    if (!foundUser) throw { message: "User does not exists", statusCode: 404 };

    if (foundUser.refreshTokens.length === 0)
      throw { message: "User is already logged out from all devices", statusCode: 400 };

    if (!foundUser.refreshTokens.includes(refreshToken))
      throw { message: "User was already logged out", statusCode: 404 };

    foundUser.refreshTokens = foundUser.refreshTokens.filter((token) => {
      return token !== refreshToken && jwtVerify(token, "refresh", { ignoreExpiration: false });
    });

    try {
      await foundUser.save();
    } catch (err) {
      throw { message: err.message, statusCode: 500 };
    }

    res.status(200).json({
      error: null,
    });
  } catch (err) {
    res.status(err.statusCode || 400).json({
      error: err.message,
    });
  }
};

exports.logOutAll = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const tokenPayload = jwtVerify(refreshToken, "refresh", { ignoreExpiration: true });
    if (!tokenPayload) throw { message: "Invalid refresh token", statusCode: 401 };

    const { _id } = tokenPayload;
    const foundUser = await User.findById(_id).exec();
    if (!foundUser) throw { message: "User does not exist", statusCode: 404 };

    if (!foundUser.refreshTokens.includes(refreshToken)) throw { message: "Invalid refresh token", statusCode: 401 };

    if (foundUser.refreshTokens.length === 0)
      throw { message: "User already logged out from all devices", statusCode: 400 };

    foundUser.refreshTokens = [];

    try {
      await foundUser.save();
    } catch (err) {
      throw { message: err.message, statusCode: 500 };
    }

    res.status(200).json({
      error: null,
    });
  } catch (err) {
    res.status(err.statusCode || 400).json({
      error: err.message,
    });
  }
};

exports.deleteProfile = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const { password } = req.body.user;

    if (!password) throw { message: "Password not provided", statusCode: 400 };

    const tokenPayload = jwtVerify(refreshToken, "refresh", { ignoreExpiration: true });
    if (!tokenPayload) throw { message: "Invalid refresh token", statusCode: 401 };

    const { _id } = tokenPayload;
    const foundUser = await User.findById(_id, "+password").exec();
    if (!foundUser) throw { message: "User does not exist", statusCode: 404 };

    if (!foundUser.refreshTokens.includes(refreshToken)) throw { message: "Invalid refresh token", statusCode: 401 };

    const passwordIsCorrect = await foundUser.checkPassword(password);
    if (!passwordIsCorrect) throw { message: "Password is incorrect", statusCode: 401 };

    try {
      await foundUser.remove();
    } catch (err) {
      throw { message: err.message, statusCode: 500 };
    }

    res.status(200).json({
      error: null,
    });
  } catch (err) {
    res.status(err.statusCode || 400).json({
      error: err.message,
    });
  }
};
