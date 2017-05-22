var interval;
app.controller('OrdersController', ['$scope', '$timeout', '$interval', 'persistence', 'orders', 'Restangular', '$location', '$filter',
  function ($scope, $timeout, $interval, persistence, orders, Restangular, $location, $filter) {
    $scope.$parent.mode = 'new';
    //$interval(function () {
    //  console.log('getOrders: 4s');
    //  getOrders();
    //}, 4000);
    if (!$scope.orders && persistence.get('token')) {
      Restangular.setDefaultHeaders({ token: persistence.get('token') });
        getOrders();
    }
    else if (!$scope.loggedIn) {
      $location.path('/login');
    }

    $scope.setMode = function(mode) {
      switch (mode) {
        case 'new':
          $scope.searchWord = '';
          $scope.$parent.mode = 'new';
          $scope.$parent.showedOrders = $scope.orders.filter(function(item) {
            return item.status == 'new';
          }).reverse();
          break;
        case 'orders':
          $scope.searchWord = '';
          $scope.$parent.mode = 'orders';

          $scope.$parent.showedOrders = $scope.orders.filter(function (item) {
            return item.status != 'new';
          });
          break;
        case 'search':
          $scope.$parent.mode = 'search';
          break;
      }
    };

    $scope.optionsList = function(options) {
      if (options.length == 1) {
        return options[0].name;
      }
      return options.map(function (option) {
        return option.name;
      }).join(', ');
    };

    $scope.parseItemName = function (quantity, name, addColon) {
      var suffix = '';
      if (addColon) {
        suffix = ':';
      }
      if (quantity > 1) {
        return quantity + 'x ' + name + suffix;
      }
      else {
        return name + suffix;
      }
    };

    $scope.parsePrice = function (price) {
      if (price == 0) {
        return '-';
      }
      return price.toFixed(2);
    };

    $scope.parseCustomisationPrice = function (item) {
      if (item.options.length > 0) {
        var total = 0;
        item.options.forEach(function (option) {
          total += option.priceOffset;
        });
        return total == 0 ? '-' : total.toFixed(2);
      }
      else if (item.priceOffset == 0) {
        return '-';
      }
      else {
        return item.priceOffset.toFixed(2);
      }
    };

    $scope.paidStatus = function(order) {
      return order.pickupInfo.payOnPickup ? 'UNPAID' : 'PAID';
    };

    $scope.searchOrders = function() {
      $scope.delay = 500;
      $scope.latestTypedTime = new Date().getTime();
      $scope.hideEmptyResult = true;

      $timeout(function () {
        if ($scope.latestTypedTime + $scope.delay <= new Date().getTime()) {
          $scope.$parent.showedOrders = $scope.orders.filter(function (item) {
            return item.pickupInfo.name.toLowerCase().indexOf($scope.searchWord) > -1
              || item.orderCode.toLowerCase().indexOf($scope.searchWord) > -1
            || item.items.filter(productNameFilter).length > 0;
          });
        }
      }, $scope.delay);
    };

    function productNameFilter(item) {
      return item.product.name.toLowerCase().indexOf($scope.searchWord.toLowerCase()) > -1;
    }

    $scope.acceptOrder = function (order) {
      $scope.$parent.loading = true;
      orders.manage.post(order.id + '/confirm').then(function() {
        order.status = 'accepted';
        var index = $scope.showedOrders.indexOf(order);
        $scope.showedOrders.splice(index, 1);
        $scope.$parent.loading = false;
        $scope.$parent.newOrdersCount = $scope.orders.filter(function (item) {
          return item.status == 'new';
        }).length;
      });
    };

    $scope.tryDeclineOrder = function(order) {
      $scope.$parent.declining = true;
      $scope.$parent.selectedOrder = order;
    };

    $scope.$parent.showedOrders = $scope.orders.filter(function (item) {
      return item.status == 'new';
    });

    $scope.formatDate = function (date) {
      return $filter('date')(date, 'hh:mma, dd MMM`yy')
                    .replace('AM', 'am').replace('PM', 'pm');
    };

    $scope.printOrder = function(order) {
      $scope.$parent.printing = true;
      orders.currentOrder = order;
      $location.path('/order/print');
    };

    function getOrders() {
      orders.all.customGET('').then(function (response) {
        if (!$scope.$parent) {
          return;
        }

        $scope.$parent.orders = response.orders;
        $scope.$parent.placeName = response.placeName;
        $scope.$parent.tax = response.tax;

        if (!$scope.$parent.placeImageId) {
          $scope.$parent.placeImageId = response.placeImageId;
        }

        $scope.$parent.error = '';
        if ($scope.$parent.mode == 'orders') {
          $scope.$parent.showedOrders = $scope.orders.filter(function(item) {
            return item.status != 'new';
          });
        }

        if ($scope.$parent.mode == 'new') {
          $scope.$parent.showedOrders = $scope.orders.filter(function (item) {
            return item.status == 'new';
          });
        }
        setTimeout(function() {
          $.connection.hub.start().done(function () {
            console.log('getOrders: ',response.placeId);
            hub.server.subscribe(response.placeId);
          });
        }, 1000);


        $scope.$parent.loggedIn = true;

        $scope.$parent.newOrdersCount = $scope.orders.filter(function (item) {
          return item.status == 'new';
        }).length;
      }, function (error) {
        $scope.$parent.error = error.statusText;
        $scope.$parent.loading = false;
        $location.path('/login');
      });
    };

  }]);
