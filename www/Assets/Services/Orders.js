app.factory('orders', ['Restangular', function (Restangular) {
  return {
    all: Restangular.one('orders'),
    manage: Restangular.one('orders'),
    currentOrder: {}
  };
}]);