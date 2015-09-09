var request = require('request'),
  cheerio = require('cheerio'),
  Page = require("../model/pagecache");


function lolGameFromTable(table, $, results) {
  var info = {
    "Team 1": -1,
    "Team 2": -1,
    "YouTube": -1,
    "#": -1
  };

  var headings = $(table).find('th');

  $(headings).each(function (i, heading) {
    if (info[$(heading).text()] == -1) {
      info[$(heading).text()] = i;
    }
  });

  // We have the heading info, so lets grab out the team names for each game, as well as the yt link
  var roundRows = $(table).find('tbody tr');
  var gameAttrs = {teamA: "", teamB: "", games: []};

  var teamNames = [];
  $(roundRows).each(function (i, row) {
    var team1 = $(row).find("td").eq(info["Team 1"]).text().trim();
    var team2 = $(row).find("td").eq(info["Team 2"]).text().trim();
    var number = $(row).find("td").eq(info["#"]).text().trim();


    if (team1.length == 0 || team2.length == 0) {
      return;
    }

    var pickBanURL = $(row).find("td").eq(info["YouTube"]).find("a").eq(0).attr('href');
    var gameStartURL = $(row).find("td").eq(info["YouTube"] + 1).find("a").eq(0).attr('href');

    var pickBanTime = pickBanURL.match(/t=([0-9ms]+)/);
    var gameStartTime = gameStartURL.match(/t=([0-9ms]+)/);

    // This means that this is the first row that we're dealing
    // with from this table.
    if (teamNames.length == 0) {
      teamNames = [team1, team2];
      gameAttrs.teamA = team1;
      gameAttrs.teamB = team2;
      gameAttrs.roundId = number;
    }

    // This occurs in the event that it's on the same day
    // but with new teams
    if (-1 === teamNames.indexOf(team1) || -1 === teamNames.indexOf(team2)) {
      if (gameAttrs.games.length > 0) {
        results.push({
          roundId: gameAttrs.roundId,
          teamA: gameAttrs.teamA,
          teamB: gameAttrs.teamB,
          games: gameAttrs.games
        });
      }

      teamNames = [team1, team2];
      gameAttrs.teamA = team1;
      gameAttrs.teamB = team2;
      gameAttrs.roundId = number;
      gameAttrs.games = [];
    }

    var round = {};
    round["Team 1"] = team1;
    round["Team 2"] = team2;
    round.YouTube = pickBanURL;
    round.pickBanTime = pickBanTime == null || pickBanTime.length == 0 ? 0 : pickBanTime[1];
    round.gameStartTime = gameStartTime == null || gameStartTime.length == 0 ? 0 : gameStartTime[1];

    // It's possible that this is an empty row so thus we should ignore it
    if (round["Team 2"].length > 0) {
      gameAttrs.games.push(round);
    }
  });

  if (gameAttrs.games.length > 0) {
    results.push({roundId: gameAttrs.roundId, teamA: gameAttrs.teamA, teamB: gameAttrs.teamB, games: gameAttrs.games});
  }
}

var renderLol = function (url, callback) {
  // Now we have to fetch the page
  url = url.replace(/^https?:\/\/?/, "")
  url = "https://" + url;
  // Look for the url in the db. If it was available less than 5 minutes ago go get it.
  var hasReturned = false;
  Page.findOne({url: url}, function (err, doc) {
    if (err) console.log(err);
    // if it exists and is still valid
    if (doc) {
      console.log("Request has been cached");
      hasReturned = false;
      var moreThanMinute = doc.updated - Date.now() < -60000;

      // If you query between 5 and 10 minutes we'll give it to you
      // but we'll go back and query as well
      if (!moreThanMinute) {
        return callback(doc.content);
      }
      else
      {
        hasReturned = true;
        callback(doc.content);
      }

    }

    request(url, function (err, resp, body) {
      if (err) console.log(err);
      var $ = cheerio.load(body);
      var tables = $("div.content .expando form table");

      var resObject = {games: []};
      $(tables).each(function (i, table) {
        // Each table is a new match. Lets get some stats. The first line tells us how the
        // table is layed out. We're going to look for some words
        lolGameFromTable(table, $, resObject.games);
      });

      // Now we should cache the object
      var query = {url: url};
      Page.findOneAndUpdate(query, {
        url: url,
        updated: new Date(),
        content: resObject
      }, {upsert: true}, function (err, doc) {
        if (err) console.log(err);
        else console.log("Saved new page")
      });

      if (!hasReturned)
        return callback(resObject);
    });
  });
};

module.exports.renderLol = renderLol;
