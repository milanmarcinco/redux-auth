const { Schema, model } = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const { jwtSign, jwtVerify } = require("../helpers/jwt");

const UserSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: (v) => validator.isAlpha(v),
        message: "First name contains forbidden characters",
      },
      maxLength: [20, "First name is too long"],
    },

    lastName: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: (v) => validator.isAlpha(v),
        message: "Last name contains forbidden characters",
      },
      maxLength: [20, "Last name is too long"],
    },

    nickname: {
      type: String,
      required: true,
      trim: true,
      maxLength: [20, "Nickname is too long"],
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: (v) => validator.isEmail(v),
        message: "Invalid email address",
      },
    },

    password: {
      type: String,
      required: true,
      select: false,
    },

    refreshTokens: {
      type: [String],
    },
  },
  { timestamps: true }
);

UserSchema.methods.toJSON = function () {
  const user = this;
  const userObj = user.toObject();

  delete userObj.password;
  delete userObj.refreshTokens;
  delete userObj.__v;
  delete userObj.updatedAt;

  return userObj;
};

UserSchema.methods.checkPassword = async function (password) {
  const user = this;
  const passwordIsCorrect = await bcrypt.compare(password, user.password);
  if (passwordIsCorrect) return true;
  else return false;
};

UserSchema.methods.genToken = async function (type, options) {
  const user = this;
  const userObj = {
    _id: user._id,
  };
  const token = jwtSign(userObj, type, options);
  return token;
};

UserSchema.pre("save", async function (next) {
  try {
    const user = this;

    if (user.isModified("password")) {
      if (user.password.length < 8) {
        throw new Error("Password is too short");
      }

      if (user.password.length > 250) {
        throw new Error("Password is too long");
      }

      user.password = await bcrypt.hash(user.password, 8);
    }

    next();
  } catch (err) {
    throw new Error(err.message);
  }
});

const UserModel = model("User", UserSchema);

module.exports = UserModel;
