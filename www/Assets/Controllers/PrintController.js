var interval;
app.controller('PrintController', ['$scope', '$timeout', 'orders', '$location',
  function ($scope, $timeout, orders, $location) {
    $scope.order = orders.currentOrder;

    $scope.optionsList = function(options) {
      if (options.length == 1) {
        return options[0];
      }
      return options.join(', ');
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

    $scope.parsePrice = function(price) {
      if (price == 0) {
        return '-';
      }
      return price.toFixed(2);
    }

    $scope.paidStatus = function(order) {
      return order.payOnPickup ? 'UNPAID' : 'PAID';
    };

    $timeout(function() {
      window.print();
      window.onfocus = function() {
        $location.path('/orders');
      }
    }, 500);
  }]);