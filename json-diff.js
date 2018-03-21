angular.module('jsondiff', ['ngMaterial', 'ngAnimate', 'ngMessages', 'ngAria']);
angular.module('jsondiff').
controller('DiffController', ['$scope', 'JsonValidatorService', function($scope, JsonValidatorService) {
    var sourceJson = {};
    var destJson = {};
    var difference;
    $scope.showDifference = function() {
        $scope.difference = null
        if (!proceedToCompare()) {
            return;
        }

        difference = null;

        if($scope.dataMode){
        	difference = differJsonInDataMode(sourceJson, destJson);
        	//removeEmptyObjects(difference);

        }else{
        	difference = differJsonInSchemaMode(sourceJson, destJson);
        }

        $scope.difference = JSON.stringify(difference, null, 2);
    }

    function removeEmptyObjects(object){
    	for(key in object){
    	    if(angular.equals(object[key], {})){
    	    	delete object[key];
    	    }else {
    	    	arguments.callee(object[key])
    	    }
    	    // arguments.callee(object[key])
    	}
    }

    $scope.clearAll = function() {
        $scope.dataMode = true;
        $scope.sourceFile = null;
        $scope.sourceFileName = null;
        $scope.destFile = null;
        $scope.destFileName = null;
        $scope.sourceError = null;
        $scope.destError = null;
        $scope.difference = null;
        difference = null;
    }
    $scope.clearAll();

    function differJsonInDataMode(obj1, obj2) {
        var result = {};
        for (key in obj1) {
            if (!angular.equals(obj2[key], obj1[key])) {
                result[key] = obj1[key];
            }
            if (Array.isArray(obj2[key]) && Array.isArray(obj1[key])) {
                if (obj1[key].length !== obj2[key].length) {
                    result[key] = obj1[key];
                }
            }
            if (typeof obj2[key] == 'object' && typeof obj1[key] == 'object' && !Array.isArray(obj2[key])) {
                	result[key] = arguments.callee(obj1[key], obj2[key]);
                }
        }
        return result;
    }

    function differJsonInSchemaMode(obj1, obj2) {
        var result = {};
        for (key in obj1) {
            if (angular.isUndefined(obj2[key])) {
                result[key] = obj1[key]
            }
            if (Array.isArray(obj2[key]) && Array.isArray(obj1[key])) {
                if (obj1[key].length !== obj2[key].length) {
                    result[key] = obj1[key];
                }
            }
            if (typeof obj2[key] == 'object' && typeof obj1[key] == 'object' && !Array.isArray(obj2[key])) {
                result[key] = arguments.callee(obj1[key], obj2[key]);
            }
        }
        return result;
    }


    function proceedToCompare() {
        if (!$scope.sourceFile || !$scope.destFile) {
            return false;
        }
        if (JsonValidatorService.isJSON($scope.sourceFile)) {
            sourceJson = JSON.parse($scope.sourceFile);
            $scope.sourceError = null;
        } else {
            console.error('Invalid json  : Source');
            $scope.sourceError = 'Invalid JSON File'
        }
        if (JsonValidatorService.isJSON($scope.destFile)) {
            destJson = JSON.parse($scope.destFile);
            $scope.destError = null;
        } else {
            console.error('Invalid json  : Destination');
            $scope.destError = 'Invalid JSON File'
        }
        if ($scope.sourceError || $scope.destError) {
            return false;
        }
        return true;
    }

    $scope.isDifferenceExixts = function(){

        try{
            if(Object.keys(difference).length > 0){
            		return 'dif'
            }
            return 'eq';
        }catch(e){
            return false;
        }
    }
}]).directive('triggerFileInput', function() {
    return {
        restrict: 'A',
        scope: {
            target: '@'
        },
        link: function(scope, element, attr) {
            element.on('click', function() {
                document.getElementById(scope.target).click();
            });
        }
    };
}).directive("fileread", [function() {
    return {
        scope: {
            fileread: "=",
            filename: "="
        },
        link: function(scope, element, attributes) {
            element.bind("change", function(changeEvent) {
                var reader = new FileReader();
                reader.onload = function(loadEvent) {
                    scope.$apply(function() {
                        scope.fileread = loadEvent.target.result;
                    });
                }
                reader.readAsText(changeEvent.target.files[0]);
                scope.filename = changeEvent.target.files[0].name;
            });
        }
    }
}]);