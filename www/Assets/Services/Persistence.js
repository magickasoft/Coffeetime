/**
 * This service aims to manage the storage on the client side.
 */
angular.module('services')
  .factory('persistence', ['$localStore', function ($localStore) {

    return {
      put: function (key, value) {
        $localStore.put(key, value);
        $localStore.put("latestCookieUpdate", new Date().getTime());
      },
      remove: function (key) {
        $localStore.put("latestCookieUpdate", new Date().getTime());
        $localStore.remove(key);
      },
      get: function (key) {
        return $localStore.get(key);
      }
    }
  }]);
