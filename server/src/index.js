require("dotenv").config();
const express = require("express");
const cors = require("cors");

require("./db/mongoose");

const authRoute = require("./routes/auth");

const app = express();
app.use(cors());

app.use(express.json());

app.use("/auth", authRoute);

const port = process.env.port || 4000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}...`);
});
