const express = require("express");
const mysql = require("mysql2");
require("dotenv").config();

const app = express();
const port = 3000;

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    ssl: {
        rejectUnauthorized: false
    }
});


db.connect(err => {
    if (err) throw err;
    console.log("Connected to database");
});

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    db.query("SELECT * FROM restaurant", (err, restaurants) => {
        if (err) throw err;
        res.render("index", { restaurants });
    });
});

app.get("/showReviews", (req, res) => {
    const restaurant_id = req.query.id;
    db.query("SELECT * FROM review WHERE restaurant_id = ?", [restaurant_id], (err, reviews) => {
        if (err) throw err;
        res.render("reviews", { reviews, restaurant_id }); // Pass restaurant_id
    });
});


app.post("/addRestaurant", (req, res) => {
    const { name, description } = req.body;
    db.query("INSERT INTO restaurant (name, description) VALUES (?, ?)", [name, description], () => {
        res.redirect("/");
    });
});

app.post("/addReview", (req, res) => {
    const { restaurant_id, reviewer_name, details, rating } = req.body;
    db.query("INSERT INTO review (restaurant_id, reviewer_name, details, rating) VALUES (?, ?, ?, ?)", 
    [restaurant_id, reviewer_name, details, rating], () => {
        res.redirect(`/showReviews?id=${restaurant_id}`);
    });
});

app.post("/deleteRestaurant", (req, res) => {
    const { id } = req.body;
    db.query("DELETE FROM restaurant WHERE restaurant_id = ?", [id], () => {
        res.redirect("/");
    });
});

app.post("/deleteReview", (req, res) => {
    const { id, restaurant_id } = req.body;
    db.query("DELETE FROM review WHERE review_id = ?", [id], () => {
        res.redirect(`/showReviews?id=${restaurant_id}`);
    });
});
app.use(express.static("public"));

app.listen(port, () => console.log(`Server running on port ${port}`));
