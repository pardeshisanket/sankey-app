const express = require("express");
const config = require("./config/config");
const mongoose = require("./db/connect")
// const router = require("./routes/v1/index.routes");
// console.log(mongoose)
const app = express();
// app.use(mongoose)
app.use(express.json());
require("./routes/v1/index.routes")(app);



app.listen(config.appPort, () => {
  console.log("Server started!");
});
