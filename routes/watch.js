var express = require('express');
var router = express.Router();
var lolParser = require('../util/lolparse.js');

/* GET watch listing. */
router.get(/\/(.*)?\/getGameData.json/, function (req, res, next) {
  lolParser.renderLol(req.params[0], function (doc, err) {
    res.send(doc);
  });
});
router.get(/\/(.*)/, function(req, res, next) {

  res.render('index');
});

module.exports = router;
