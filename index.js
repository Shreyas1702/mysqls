const connection = require("./server");
const express = require("express");
const engine = require("ejs-mate");
const bodyParser = require("body-parser");
const path = require("path");
const { connect } = require("http2");
const session = require("express-session");
var app = express();
app.use(
  session({
    proxy: true,
    key: "keyin",
    secret: "webslesson",
    resave: false,
    saveUninitialized: true,
  })
);
app.set("trust proxy", 1);
app.use(bodyParser.json());
app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.engine("ejs", engine);
app.set("views", path.join(__dirname, "views"));
app.use(express.static(__dirname + "/public"));

app.get("/", (req, res) => {
  const data = req.session.user_id;
  res.render("homepage.ejs", { data });
});

app.get("/customer", (req, res) => {
  const data = req.session.user_id;
  res.render("customerpage.ejs", { data });
});

app.post("/logins", (req, res, next) => {
  const cust1 = "customer1";
  const cust2 = "customer2";
  var weight1,
    weight2,
    tweight,
    bcount1,
    bcount2,
    tbcount,
    quantity1,
    quantity2,
    tquantity;
  connection.query(
    "select * from user where username=?",
    [req.body.id],
    (err, row) => {
      if (err) {
        console.log(err);
      } else {
        req.session.user_id = req.body.id;
        console.log(row);
        if (row[0].password === req.body.password) {
          console.log(row);

          if (row[0].username == "admin") {
            console.log("Neither");
            connection.query(
              "select sum(quantity) as tquantity from customer where onwer = ?",
              [cust1],
              (err, row) => {
                quantity1 = row[0].tquantity;
              }
            );
            connection.query(
              "select sum(quantity) as tquantity from customer where onwer = ?",
              [cust2],
              (err, row) => {
                quantity2 = row[0].tquantity;
              }
            );
            connection.query(
              "select sum(weight) as tweight from customer where onwer = ?",
              [cust1],
              (err, row) => {
                weight1 = row[0].tweight;
              }
            );
            connection.query(
              "select sum(bcount) as tbcount from customer where onwer = ?",
              [cust1],
              (err, row) => {
                bcount1 = row[0].tbcount;
              }
            );
            connection.query(
              "select sum(weight) as tweight from customer where onwer = ?",
              [cust2],
              (err, row) => {
                weight2 = row[0].tweight;
              }
            );
            connection.query(
              "select sum(bcount) as tbcount from customer where onwer = ?",
              [cust2],
              (err, row) => {
                console.log(typeof weight1);
                bcount2 = row[0].tbcount;
                tbcount = Number(bcount1) + Number(bcount2);
                tweight = weight1 + weight2;
                tquantity = Number(quantity1) + Number(quantity2);
                res.render("adminpage.ejs", {
                  weight1,
                  weight2,
                  tweight,
                  bcount1,
                  bcount2,
                  tbcount,
                  quantity1,
                  quantity2,
                  tquantity,
                });
              }
            );
          } else {
            res.render("customerpage.ejs");
          }
        }
      }
    }
  );
});

app.get("/admin", (req, res) => {
  const cust1 = "customer1";
  const cust2 = "customer2";
  var weight1,
    weight2,
    tweight,
    bcount1,
    bcount2,
    tbcount,
    quantity1,
    quantity2,
    tquantity;

  connection.query(
    "select sum(quantity) as tquantity from customer where onwer = ?",
    [cust1],
    (err, row) => {
      quantity1 = row[0].tquantity;
    }
  );
  connection.query(
    "select sum(quantity) as tquantity from customer where onwer = ?",
    [cust2],
    (err, row) => {
      quantity2 = row[0].tquantity;
    }
  );
  connection.query(
    "select sum(weight) as tweight from customer where onwer = ?",
    [cust1],
    (err, row) => {
      weight1 = row[0].tweight;
    }
  );
  connection.query(
    "select sum(bcount) as tbcount from customer where onwer = ?",
    [cust1],
    (err, row) => {
      bcount1 = row[0].tbcount;
    }
  );
  connection.query(
    "select sum(weight) as tweight from customer where onwer = ?",
    [cust2],
    (err, row) => {
      weight2 = row[0].tweight;
    }
  );
  connection.query(
    "select sum(bcount) as tbcount from customer where onwer = ?",
    [cust2],
    (err, row) => {
      console.log(typeof weight1);
      bcount2 = row[0].tbcount;
      tbcount = Number(bcount1) + Number(bcount2);
      tweight = weight1 + weight2;
      tquantity = Number(quantity1) + Number(quantity2);
      res.render("adminpage.ejs", {
        weight1,
        weight2,
        tweight,
        bcount1,
        bcount2,
        tbcount,
        quantity1,
        quantity2,
        tquantity,
      });
    }
  );
});

app.post("/customers", (req, res) => {
  const cust = req.body;
  const custData = [
    cust.odate,
    cust.cname,
    cust.onwer,
    cust.item,
    cust.quantity,
    cust.weight,
    cust.rshipment,
    cust.trackid,
    cust.ssize,
    cust.bcount,
    cust.specification,
    cust.cquantity,
  ];
  connection.query(
    "insert into customer(odate,cname,onwer,item,quantity,weight,rshipment,trackid,ssize,bcount,specification,cquantity) values(?)",
    [custData],
    (err, rows) => {
      if (err) {
        console.log(err);
      } else {
        res.render("customerpage.ejs");
      }
    }
  );
});

app.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

app.get("/login", (req, res) => {
  req.session.destroy();

  res.render("loginform.ejs");
});

app.listen("3000", (req, res) => {
  console.log("Listening to the server");
});
