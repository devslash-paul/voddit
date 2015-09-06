function getMinsSecs(str) {
  var minStr = str.match(/(\d+)m/);
  var secStr = str.match(/(\d+)s/);

  var mins = minStr == null || minStr.length == 0 ? 0 : parseInt(minStr[1]);
  var secs = secStr == null || secStr.length == 0 ? 0 : parseInt(secStr[1]);
  return {mins: mins, secs: secs};
}

(function () {
  var app = angular.module('spoiler', ['angularSpinner']);


  app.controller('GameController', ['$http', "$scope", function ($http, $scope) {
    var sc = $scope;
    $scope.games = [];
    $scope.currentSeries = undefined;

    $scope.gameChoices = [];
    $scope.currentGame = undefined;

    $scope.playingGame = undefined;
    $scope.playingSeries = undefined;

    $http.get("getGameData.json").success(function (data) {
      sc.games = data.games;
      window.games = data.games
    });

    sc.winner = function (str) {
      return str.indexOf("Winner of") != -1;
    };

    sc.loser = function (str) {
      return str.indexOf("Loser of") != -1;
    };

    sc.removeWinLose = function (str) {
      return str.replace("Winner of", "").replace("Loser of", "");
    };

    sc.setGame = function (index) {
      sc.currentGame = index;
      var url = sc.games[sc.currentSeries].games[index].YouTube.match(/v=([^&]+)/)[1];
      startYT(url);
      sc.playingSeries = sc.currentSeries;
      sc.playingGame = sc.currentGame;
    };

    sc.setSeries = function (index) {
      sc.currentSeries = index;
      sc.gameChoices = sc.games[index].games;
    };

    sc.toStart = function () {
      player.seekTo(0);
    };

    sc.toPickBans = function () {
      var str = sc.games[sc.currentSeries].games[sc.currentGame].pickBanTime;
      var __ret = getMinsSecs(str)
      var mins = __ret.mins;
      var secs = __ret.secs;
      console.log(mins);
      console.log(secs)
      player.seekTo(mins * 60 + secs);
    };

    sc.toGameStart = function () {
      var str = sc.games[sc.currentSeries].games[sc.currentGame].gameStartTime;
      console.log(str);
      var __ret = getMinsSecs(str);
      var mins = __ret.mins;
      var secs = __ret.secs;
      player.seekTo(mins * 60 + secs);
    };

  }]);

  app.directive('game', ['$http', function ($http, $scope) {
    return {
      restrict: 'E',
      templateUrl: '/templates/template.html',
      controller: function () {
        var gameCtrl = this;
        this.data = {};

      },
      controllerAs: 'gameCtrl'
    };
  }]);
})();