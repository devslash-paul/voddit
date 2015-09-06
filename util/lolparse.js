var request = require('request'),
  cheerio = require('cheerio');

function lolGameFromTable(table, $, results) {
  var info = {
    "Team 1": -1,
    "Team 2": -1,
    "YouTube": -1
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

    if (team1.length == 0 || team2.length == 0) {
      return;
    }

    var pickBanURL = $(row).find("td").eq(info["YouTube"]).find("a").eq(0).attr('href');
    var gameStartURL = $(row).find("td").eq(info["YouTube"] + 1).find("a").eq(0).attr('href');

    var pickBanTime = pickBanURL.match(/t=([0-9ms]+)/);
    var gameStartTime = gameStartURL.match(/t=([0-9ms]+)/);


    if (teamNames.length == 0) {
      teamNames = [team1, team2];
      gameAttrs.teamA = team1;
      gameAttrs.teamB = team2;
    }

    if (-1 === teamNames.indexOf(team1) || -1 === teamNames.indexOf(team2)) {
      // In this case the same day, new teams. Create a new rounds
      if (gameAttrs.games.length > 0) {
        results.push({teamA: gameAttrs.teamA, teamB: gameAttrs.teamB, games: gameAttrs.games});

      }

      teamNames = [team1, team2];
      gameAttrs.teamA = team1;
      gameAttrs.teamB = team2;
      gameAttrs.games = [];
    }

    var round = {};
    round["Team 1"] = team1;
    round["Team 2"] = team2;
    round.YouTube = pickBanURL;
    round.pickBanTime = pickBanTime == null || pickBanTime.length == 0 ? 0 : pickBanTime[1];
    round.gameStartTime = gameStartTime == null || gameStartTime.length == 0 ? 0 : gameStartTime[1];
    // Check if this is a new set on the same day
    // Check for a game link
    if (round["Team 2"].length > 0) {
      gameAttrs.games.push(round);
    }
  });

  if (gameAttrs.games.length > 0) {
    results.push({teamA: gameAttrs.teamA, teamB: gameAttrs.teamB, games: gameAttrs.games});
  }
}

renderLol = function (url, callback) {
  // Now we have to fetch the page
  request(url, function (err, resp, body) {
    var $ = cheerio.load(body);
    var tables = $("div.content .expando form table");

    var resObject = {games: []};
    $(tables).each(function (i, table) {
      // Each table is a new match. Lets get some stats. The first line tells us how the
      // table is layed out. We're going to look for some words
      lolGameFromTable(table, $, resObject.games);
    });

    callback(resObject);
  });
};

module.exports.renderLol = renderLol;