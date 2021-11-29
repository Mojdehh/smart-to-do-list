// load .env data into process.env
require("dotenv").config();

// Web server config
const PORT = process.env.PORT || 8080;
const sassMiddleware = require("./lib/sass-middleware");
const express = require("express");
const app = express();
const morgan = require("morgan");
const cookieSession = require("cookie-session");

// PG database client/connection setup
const { Pool } = require("pg");
const dbParams = require("./lib/db.js");
const db = new Pool(dbParams);
db.connect();

// Load the logger first so all (static) HTTP requests are logged to STDOUT
// 'dev' = Concise output colored by response status for development use.
//         The :status token will be colored red for server error codes, yellow for client error codes, cyan for redirection codes, and uncolored for all other codes.
app.use(morgan("dev"));

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

app.use(
  "/styles",
  sassMiddleware({
    source: __dirname + "/styles",
    destination: __dirname + "/public/styles",
    isSass: false, // false => scss, true => sass
  })
);

app.use(express.static("public"));

app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],
  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

// Separated Routes for each Resource
// Note: Feel free to replace the example routes below with your own
const usersRoutes = require("./routes/users");
const widgetsRoutes = require("./routes/widgets");
const profileRoutes = require("./routes/profile");
const loginRoutes = require("./routes/login");
const signupRoutes = require("./routes/signup");
const logoutRoutes = require("./routes/logout");

const listRoutes = require("./routes/lists");
const listitemsRoutes = require("./routes/listitems");
// const userItems = require("./routes/listitems")
// Mount all resource routes
// Note: Feel free to replace the example routes below with your own
app.use("/api/users", usersRoutes(db));
app.use("/api/widgets", widgetsRoutes(db));
// Note: mount other resources here, using the same pattern above
app.use("/login", loginRoutes(db));
app.use("/signup", signupRoutes(db));
app.use("/logout", logoutRoutes);

app.use("/profile", profileRoutes(db));
app.use("/lists", listRoutes(db));
app.use("/items", listitemsRoutes(db));
// Home page
// Warning: avoid creating more routes in this file!
// Separate them into separate routes files (see above).

app.get("/", (req, res) => {
  const id = req.session.user_id

  if (!id) {
    const templateVars = {
      user_id: null,
      email: null,
      username: null,
      profile_pic: null
    }

    console.log(templateVars)
    return res.render('landing', templateVars)
  }
  console.log('========', id)
    db.query(`SELECT *
    FROM users WHERE id = ${id};`)
      .then(result => {
        const items = result.rows[0];

        console.log(items)

        const templateVars = {
          user_id: items.id,
          email: items.email,
          username: items.username,
          profile_pic: items.profile_pic
        }

        console.log(templateVars)
        res.render('landing', templateVars)
        return items;
      })
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message });
      });
  });

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
