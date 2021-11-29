const { application } = require('express');
const express = require('express');
const router  = express.Router();

const userItems = (db) => {
  router.get("/", (req, res) => {
    const id = req.session.user_id

  if (!id) {
    const templateVars = {
      user_id: null,
      email: null,
      username: null,
      profile_pic: null
    }

    console.log(templateVars)
    return res.render('items', templateVars)
  }
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
        res.render('items', templateVars)
        return items;
      })
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message });
      });
  });
  return router;
};
module.exports = userItems;
