app.controller('LoginController', ['$scope', '$timeout', '$interval', '$location', 'orders', 'persistence', 'Restangular',
  function ($scope, $timeout, $interval, $location, orders, persistence, Restangular) {

    var token = persistence.get('token');
    if (token) {
      $scope.$parent.loading = true;
      Restangular.setDefaultHeaders({ token: token });
      orders.all.customGET('').then(function (response) {
        $scope.$parent.orders = response.orders;
        $scope.$parent.placeName = response.placeName;
        $scope.$parent.placeImageId = response.placeImageId;
        $scope.$parent.API = window.API_ROOT+"/images/"+response.placeImageId;
        $scope.$parent.tax = response.tax;
        $scope.$parent.error = '';
        $scope.$parent.loggedIn = true;

        $scope.$parent.newOrdersCount = $scope.orders.filter(function (item) {
          return item.status == 'new';
        }).length;
        $scope.$parent.loading = false;
        $location.path('/orders');
        setTimeout(function() {
          $.connection.hub.start().done(function() {
            console.log('token: ',response.placeId);
            hub.server.subscribe(response.placeId);
          });
        }, 1000);

      }, function (error) {
        $scope.$parent.error = error.statusText;
        $scope.$parent.loading = false;
      });
    }
    $scope.notificationOpenedCallback = function (jsonData) {
      console.log(jsonData);
    }
    $scope.authorize = function () {
      var header = 'Basic ' + window.btoa($scope.email + ':' + $scope.password);
      $scope.$parent.loading = true;
      orders.all.customGET('', {}, { Authorization: header }).then(function (response) {
      //Restangular.one('orders').customGET('', {}, { Authorization: header }).then(function (response) {
        console.log(response);

        if(window.plugins.OneSignal) {
          //window.plugins.OneSignal.setLogLevel({logLevel: 0, visualLevel: 0});
          //console.log(current_key, projectNumber);
          window.plugins.OneSignal.init(window.keys.ios.current, {
            googleProjectNumber: window.keys.google.project_number.current,
            autoRegister: true
          }, $scope.notificationOpenedCallback);
          // Show an alert box if a notification comes in when the user is in your app.
          window.plugins.OneSignal.sendTag("placeId", response.placeId);
          window.plugins.OneSignal.enableInAppAlertNotification(true);
        } else {
          console.log("Can not find variable OneSignal. Push initialization failed.");
        }



        $scope.$parent.orders = response.orders;
        $scope.$parent.placeName = response.placeName;
        $scope.$parent.placeImageId = response.placeImageId;
        $scope.API = window.API_ROOT+"/images/"+response.placeImageId;
        $scope.$parent.tax = response.tax;
        if ($scope.remember) {
          var authToken = response.headers.token;
          persistence.put('token', authToken);
        }

        $scope.$parent.error = '';
        $scope.$parent.loggedIn = true;
        $scope.$parent.newOrdersCount = $scope.orders.filter(function (item) {
          return item.status == 'new';
        }).length;
        $scope.$parent.loading = false;
        $location.path('/orders');
        setTimeout(function() {
          $.connection.hub.start().done(function () {
            console.log('authorize: ',response.placeId);
            hub.server.subscribe(response.placeId);
          });
        }, 1000);

        Restangular.setDefaultHeaders({ token: response.headers.token });
      }, function(error) {
        console.log(error);
        $scope.$parent.error = error.statusText;
        $scope.$parent.loading = false;
      });
    };
}]);

app.directive('backImg', function(){
  return function(scope, element, attrs){
    var url = attrs.backImg;
    element.css({
      'background-image': 'url(' + url +')',
      'background-size' : 'cover'
    });
  };
});