(function () {
  var app = angular.module('spoiler', []);


  app.controller('GameController', ['$http', "$scope", function ($http, $scope) {
    var sc = $scope;
    $scope.games = [];
    $scope.currentSeries = undefined;
    $scope.state = "paused";
    $scope.gameChoices = [];
    $scope.currentGame = 0;

    sc.setGame = function (index) {
      sc.currentGame = index;
      var url = sc.games[sc.currentSeries].games[index].YouTube.match(/v=([^&]+)/)[1];
      player.loadVideoById(url);
      player.playVideo();
    };

    $http.get("getGameData.json").success(function (data) {
      sc.games = data.games;
      window.games = data.games
    });

    sc.setSeries = function(index) {
      sc.currentSeries = index;
      sc.gameChoices = sc.games[index].games;
    }
  }]);

  app.directive('game', ['$http', function ($http, $scope) {
    return {
      restrict: 'E',
      templateUrl: '/templates/template.html',
      controller: function() {
        var gameCtrl = this;
        this.data = {};

      },
      controllerAs: 'gameCtrl'
    };
  }]);
})();