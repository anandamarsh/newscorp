/**
 * Created by amarshanand on 7/3/17.
 */

var FLICKR_FEED = "https://api.flickr.com/services/feeds/photos_public.gne?format=json&jsoncallback=JSON_CALLBACK";
var FLICKER_REST_GET_SIZE = "https://api.flickr.com/services/rest/?method=flickr.photos.getSizes&api_key=440b82c24f1c81f9d11388df00d3ea62&format=json&jsoncallback=JSON_CALLBACK&photo_id=";

var app = angular.module('flickrApp', []);

app.controller('flickrCtrl', function($scope, $http, $timeout) {

    $scope.searchTerm = "";
    $scope.results = [];
    $scope.hires = "";
    $scope.instruction = "Type on the search box to search an image";

    // upon changing the value in the search box, issue a flickr API call to fetch images mathing the given search term
    var searchTimeout = null; // we introduce a slight delay before issuing the call for the user to finish typing
    $scope.search = function() {
        if(searchTimeout) $timeout.cancel(searchTimeout);
        searchTimeout = $timeout(function () {
            searchTimeout = null;
            console.log("will call with : "+FLICKR_FEED+"&tags="+$scope.searchTerm);
            $scope.loading = "loader.gif";  $scope.instruction = "";
            $http.jsonp(FLICKR_FEED+"&tags="+$scope.searchTerm).success(function(data) {
                $scope.results = data.items.map(function(item) {
                    return {thumb:item.media.m, tags:item.tags, author:item.author, hires:item.link}
                });
                $scope.loading = "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="; // ref: http://stackoverflow.com/questions/9126105/blank-image-encoded-as-data-uri
                $scope.instruction = "Click on the thumbnail to view the full image";
            })
        }, 500);
    }

    // upon clicking the thumbnail, show the full image
    $scope.showHiRes = function(result) {
        // as per https://www.flickr.com/services/api/misc.urls.html , get the photoId from the thumbnail
        var photoId = result.thumb.split("/").pop().split("_").shift();
        // lets define a high-resolution image as the largest image size available, for which, we call flickr.photos.getSizes
        console.log("will call : "+FLICKER_REST_GET_SIZE+photoId);
        $scope.loading = "loader.gif"; $scope.instruction = "";
        $http.jsonp(FLICKER_REST_GET_SIZE+photoId).success(function(data) {
            // the response comes with a bunch of sizes. we use the largest
            $scope.hires = data.sizes.size.pop().source;
            $scope.author = result.author; $scope.tags = result.tags;
            $scope.loading = null;
        })
    }

});
