'use strict';

var hub = $.connection.orderHub;

angular.module('services', []);
angular.module('directives', ['services']);

var app = angular.module('ordersApp', ['services', 'directives', 'ngRoute', 'ngLocalStore', 'restangular'])
  .config(['$routeProvider', 'RestangularProvider', function ($routeProvider, RestangularProvider) {
    $routeProvider.when('/login', {
      templateUrl: 'Assets/Views/login.html',
      controller: 'LoginController'
    })
      .when('/orders', {
        templateUrl: 'Assets/Views/orders.html',
        controller: 'OrdersController'
      })
      .when('/order/print', {
        templateUrl: 'Assets/Views/print.html',
        controller: 'PrintController'
      })
      .otherwise({
        redirectTo: '/login'
      });

    RestangularProvider.setBaseUrl(window.API_ROOT);

    RestangularProvider.setResponseInterceptor(function (data, operation, what, url, response, deferred) {
      var headers = response.headers();
      var result = response.data;
      if (result) {
        result.headers = headers;
      }
      return result;
    });
  }]);
