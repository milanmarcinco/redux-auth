const jwt = require("jsonwebtoken");

const jwtSign = (payload, keyType, options) => {
  try {
    const secret = determineSecret(keyType);
    const token = jwt.sign(payload, secret, options);
    return token;
  } catch {
    return null;
  }
};

const jwtVerify = (token, keyType, options) => {
  try {
    const secret = determineSecret(keyType);
    const payload = jwt.verify(token, secret, options);
    return payload;
  } catch {
    return null;
  }
};

module.exports = {
  jwtSign: jwtSign,
  jwtVerify: jwtVerify,
};

// ###

function determineSecret(keyType) {
  switch (keyType) {
    case "access":
      return process.env.AUTH_TOKEN_SECRET;
    case "refresh":
      return process.env.REFRESH_TOKEN_SECRET;
    default:
      return process.env.AUTH_TOKEN_SECRET;
  }
}
