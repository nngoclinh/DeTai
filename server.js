const express = require("express");
const app = express();
const port = 3000;
const bookRoutes = require("./src/book/routes");
const readerRoutes = require("./src/reader/router");
const borrowRoutes = require("./src/borrow/routes");
const borrowdetailRoutes = require("./src/borrowdetail/router");

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello world!");
});
// routes
app.use("/api/v1/book", bookRoutes);
app.use("/api/v1/reader", readerRoutes);
app.use("/api/v1/borrow", borrowRoutes);
app.use("/api/v1/borrowdetail", borrowdetailRoutes);
app.listen(port, () => console.log(`app listen on port ${port}`));
