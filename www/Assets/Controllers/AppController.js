app.controller('AppController', ['$scope', '$log','$interval', '$location', 'persistence', 'orders', 'Restangular',
  function ($scope, $log, $interval, $location, persistence, orders, Restangular) {
    function onTimeout() {
      $log.log('AppCtrl controller');
      /*var storeImage = $('.store-image').attr('src');
       if (storeImage && storeImage!== null) {
       if (storeImage.indexOf(window.API_ROOT.substring(0, window.API_ROOT.length - 4)) === -1) {
       $('.store-image').attr('src',window.API_ROOT.substring(0, window.API_ROOT.length - 4) +''+ storeImage);
       }
       }*/

    }
    /*$interval(function() {
      onTimeout();
    }, 1000);*/

    $scope.isRoute = function (path) {
      return $location.path().indexOf(path) > -1;
    };

    $scope.soundText = 'Sound off';
    $scope.orders = [];
    $scope.placeName = '';
    $scope.soundEnabled = false;
    $scope.prettyPrinting = false;
    var $playingSound;
    $scope.sound = document.getElementById('order-notification-sound');

    $scope.$watch('newOrdersCount', function(value) {
      if (value > 0) {
        if ($scope.soundEnabled) {
          if (!$scope.sound) {
            $scope.sound = document.getElementById('order-notification-sound');
          }

          $scope.startPlayingSound();
        }
      }
      else {
        if ($playingSound) {
          clearInterval($playingSound);
        }
      }
    });

    $scope.$watch('soundEnabled', function(value) {
      if (!value) {
        clearInterval($playingSound);
      }
      else if ($scope.newOrdersCount > 0) {
        $scope.startPlayingSound();
      }
    });

    $scope.startPlayingSound = function () {
      playSound();
      $playingSound = window.setInterval(playSound, 30000);
    };

    $scope.openMenu = function () {
      if (!$scope.menuShowed) {
        $scope.menuShowed = true;
        $scope.isOpening = true;
      }
    };

    $scope.tryHideMenu = function () {
      if ($scope.menuShowed && !$scope.isOpening) {
        $scope.menuShowed = false;
      }

      if ($scope.isOpening) {
        $scope.isOpening = false;
      }
    };

    $scope.toggleSound = function () {
      $scope.soundEnabled = !$scope.soundEnabled;
      if ($scope.soundEnabled) {
        $scope.soundText = 'Sound on';
      }
      else {
        $scope.soundText = 'Sound off';
      }
    };

    $scope.logout = function () {
      Restangular.one('usersessions').post();

      if (persistence.get('token')) {
        persistence.remove('token');
        Restangular.setDefaultHeaders({ token: '' });
      }
      clearInterval(interval);
      $scope.menuShowed = false;
      $scope.orders = [];
      $scope.newOrdersCount = 0;
      $scope.loggedIn = false;
      $location.path('login');
    };

    $scope.cancelDecline = function () {
      $scope.selectedOrder = null;
      $scope.declining = false;
    };

    $scope.declineOrder = function () {
      $scope.loading = true;
      $scope.declining = false;
      orders.manage.post($scope.selectedOrder.id + '/decline', { message: $scope.declineMessage }).then(function () {
        $scope.selectedOrder.status = 'declined';
        $scope.loading = false;
        $scope.selectedOrder.status = 'declined';
        var index = $scope.showedOrders.indexOf($scope.selectedOrder);
        $scope.showedOrders.splice(index, 1);
        $scope.newOrdersCount = $scope.showedOrders.length;
      });
    };

    function playSound() {
      if ($scope.soundEnabled) {
        $scope.sound.play();
      }
    };

    hub.client.getNewOrder = function (order) {
      order.status = 'new';

      $scope.orders.unshift(order);
      $scope.newOrdersCount = $scope.orders.filter(function (item) {
        return item.status == 'new';
      }).length;

      if ($scope.mode == 'orders') {
        $scope.showedOrders = $scope.orders.filter(function (item) {
          return item.status != 'new';
        });
      }
      if ($scope.mode == 'new') {
        $scope.showedOrders = $scope.orders.filter(function (item) {
          return item.status == 'new';
        }).reverse();
      }

      $scope.$apply();
    };
}]);