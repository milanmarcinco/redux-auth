const { jwtVerify } = require("../helpers/jwt");
const User = require("../models/User");

const auth = async (req, res, next) => {
  try {
    const { authToken, refreshToken } = req.body;

    let payload = jwtVerify(authToken, "auth", { ignoreExpiration: false });

    if (!payload) {
      payload = jwtVerify(refreshToken, "refresh", { ignoreExpiration: false });
    }

    if (!payload) {
      throw { message: "User not authenticated", statusCode: 401 };
    }

    const user = await User.findById(payload._id).exec();
    if (!user) throw { message: "User does not exist", statusCode: 404 };

    const newAuthToken = await user.genToken("auth", { expiresIn: "30m" });

    req.newAuthToken = newAuthToken;
    req.user = user;

    next();
  } catch (err) {
    res.status(err.statusCode).json({
      error: err.message,
    });
  }
};

module.exports = auth;
