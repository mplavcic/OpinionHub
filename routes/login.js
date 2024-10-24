var express = require('express');
var router = express.Router();
const user_controller = require("../controllers/userController.js");

/* GET login page. */
router.get("/", function(req, res, next) {
  res.render("login");
});

/* POST login page */
router.post("/", user_controller.user_login_post);

module.exports = router;
