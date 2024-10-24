const express = require("express");
const router = express.Router();
const user_controller = require("../controllers/userController.js");

/* GET signup page. */
router.get("/", function(req, res, next) {
  res.render("signup");
});

/* POST signup page */
router.post("/", user_controller.user_create_post);

module.exports = router;
