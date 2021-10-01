const express = require("express");
const app = express();

app.use(express.json());

const cookieParser = require('cookie-parser');
app.use(cookieParser());

// importing connect from config
const connect = require("./src/config/dbconfig");

// controllers
const smallCaseController = require("./src/controllers/landingPage.controller");
const allSmallcasesController = require("./src/controllers/allSmallcases.controller");
const smallcaseDetailController = require("./src/controllers/smallcaseDetail.controller");
const userController = require("./src/controllers/user.controller");

const Smallcases = require("./src/models/smallcase.model");

app.use("/", smallCaseController);
app.use("/discover/all", allSmallcasesController);
app.use("/smallcase/", smallcaseDetailController);
app.use("/api/", userController);

// public 
app.use(express.static("public"));

// view engine
app.set("view engine", "ejs");

// collection page api
app.get("/discover/explore", async (req, res) => {
  const isUserLoggedIn = !!req.cookies.userId;
  res.render("collection", {
    isUserLoggedIn
  });
})

// login page api
app.get("/login", async (req, res) => {
  res.render("login");
})

// signup page api
app.get("/signup", async (req, res) => {
  res.render("signup");
})


app.get('/api/logout', function(req, res){
  res.clearCookie("userId");
  res.send("clear cookie")
})

// orders page api
app.get("/orders", async (req, res) => {
  const isUserLoggedIn = !!req.cookies.userId;
  res.render("orders", {
    isUserLoggedIn
  })
})


// filters api
app.get('/api/data', async (req, res) => {
  let tags;
  if (req.query.volatility) {
    tags = req.query.volatility.split(",");
  }
  const underMinAmount = req.query.under || 100000000;
  tags = tags || ["Low", "High", "Med."];
  let data = await Smallcases.find({ $and: [{ "minAmount": { $lt: underMinAmount } }, { "volatility": { $in: tags } }] });

  let filteredData = data;
  if (req.query.sortBy === "minAmount") {
    filteredData.sort((a, b) => a.minAmount - b.minAmount);
  } else if (req.query.sortBy === "returns") {
    filteredData.sort((a, b) => b.cagRate - a.cagRate);
  } else if (req.query.sortBy === "popularity") {
    filteredData = data;
  }

  res.send(filteredData);
})

// server
app.listen(2930, async () => {
  await connect();
  console.log("listening to port 2930");
})