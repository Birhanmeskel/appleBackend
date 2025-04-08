// const mysql = require("mysql");
// const express = require("express");
import cors from "cors";
import express from "express";
import mysql from "mysql";
const port = 3306;

const app = express();
// extract from html body name attribute
app.use(express.urlencoded({ extended: true }));
// extract info from the fronend that sent through json
// app.use(express.json())

app.use(cors());
app.listen(port, (err) => {
  if (err) throw err;
  console.log("new Server is running on port 3002 clever-cloud.com");
});

const mysqlConnection = mysql.createConnection({
  host: "bds6wa3rbautob85uxah-mysql.services.clever-cloud.com",
  user: "ufgrpo3ohnlaux6u",
  password: "2bYrrxXuq9FCIOQiEvGR",
  database: "bds6wa3rbautob85uxah",
});

mysqlConnection.connect((err) => {
  if (err) console.log(err);
  else console.log("Connected to MySQL server");
});

app.get("/install", (req, res) => {
  let products_table = `CREATE TABLE IF NOT EXISTS Products_Table (
    product_id INT AUTO_INCREMENT PRIMARY KEY,
    product_url VARCHAR(255) NOT NULL,
    product_name VARCHAR(255) NOT NULL
  )`;

  let product_description_table = `CREATE TABLE IF NOT EXISTS Product_Description (
    description_id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT,
    product_brief_description VARCHAR(255) NOT NULL,
    product_description TEXT, 
    product_img VARCHAR(255) NOT NULL,
    product_link VARCHAR(255) NOT NULL,
    FOREIGN KEY (product_id) REFERENCES Products_Table(product_id)
  )`;

  let product_price_table = `CREATE TABLE IF NOT EXISTS Product_Price_Table (
    price_id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT,
    starting_price VARCHAR(255) NOT NULL, 
    price_range VARCHAR(255) NOT NULL, 
    FOREIGN KEY (product_id) REFERENCES Products_Table(product_id)
)`;

  let user_table = `CREATE TABLE IF NOT EXISTS Users_Table (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    user_name VARCHAR(255) NOT NULL,
    user_password VARCHAR(255) NOT NULL
   
)`;
  let orders_table = `CREATE TABLE IF NOT EXISTS Order_Table (
      order_id INT AUTO_INCREMENT PRIMARY KEY,
      product_id INT,
      user_id INT,
  FOREIGN KEY (product_id) REFERENCES Products_Table(product_id),
  FOREIGN KEY (user_id) REFERENCES Users_Table(user_id)
    )`;

  mysqlConnection.query(products_table, (err) => {
    if (err) console.log(err);
  });
  mysqlConnection.query(product_description_table, (err) => {
    if (err) console.log(err);
  });

  mysqlConnection.query(product_price_table, (err) => {
    if (err) console.log(err);
  });
  mysqlConnection.query(user_table, (err) => {
    if (err) console.log(err);
  });

  mysqlConnection.query(orders_table, (err) => {
    if (err) console.log(err);
  });
  res.end("Tables created successfully");
});

app.post("/add-product", (req, res) => {
  //  console.log("Received form data:", req.body); Object Destructuring

  const {
    product_name,
    product_url,
    product_brief_description,
    product_description,
    product_img,
    product_link,
    starting_price,
    price_range,
    user_name,
    user_password,
  } = req.body;

  let insertProduct =
    "INSERT INTO Products_Table(product_name,product_url) VALUES(?,?)";
  let insertDescription =
    "INSERT INTO Product_Description(product_id,product_brief_description,product_description, product_img, product_link) VALUES (?,?,?,?,?)";
  let insertUser =
    "INSERT INTO Users_Table(user_name, user_password) VALUES (?,?)";
  let insertPrice =
    "INSERT INTO Product_Price_Table(product_id, starting_price, price_range) VALUES (?,?,?)";
  let insertOrder = "INSERT INTO Order_Table(product_id, user_id) VALUES (?,?)";

  mysqlConnection.query(
    insertProduct,
    [product_name, product_url],
    (err, result) => {
      if (err) console.log(err);
      let productId = result.insertId;
      mysqlConnection.query(
        insertDescription,
        [
          productId,
          product_brief_description,
          product_description,
          product_img,
          product_link,
        ],
        (err) => {
          if (err) console.log(err);
        }
      );

      mysqlConnection.query(
        insertUser,
        [user_name, user_password],
        (err, result) => {
          if (err) console.log(err);
          let userId = result.insertId;
          mysqlConnection.query(insertOrder, [productId, userId], (err) => {
            if (err) console.log(err);
          });
        }
      );
      mysqlConnection.query(
        insertPrice,
        [productId, starting_price, price_range],
        (err) => {
          if (err) console.log(err);
        }
      );
    }
  );

  res.end(" products added successfully");
});

app.get("/iphonesData", (req, res) => {
  let selectData = `
    SELECT
     *
    FROM Products_Table p
    LEFT JOIN Product_Description d ON p.product_id = d.product_id
    LEFT JOIN Product_Price_Table pr ON p.product_id = pr.product_id
  `;

  mysqlConnection.query(selectData, (err, result) => {
    if (err) return res.status(500).send("Internal Server Error");
    res.json(result);
  });
});
