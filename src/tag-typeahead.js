angular.module('tag-typeahead', ['basic'], function () {
}).directive('tagTypeaheadInput', function (convert) {
    return {
        restrict: 'C',
        replace: true,
        scope: {
            list: '=',
            placeholder: '='
        },
        controller: function ($scope) {
            $scope.list = convert.toArray($scope.list, true);
        },
        link: function($scope) {
            $scope.tags = {};
            $scope.onSelect = function(item) {
                angular.forEach($scope.list, function (name, key) {
                    if (name === item) {
                        $scope.list.splice(key, 1);
                        $scope.tags[key] = {name: item, value: key};
                        $scope.tagInput = '';
                    }
                });
            };
            $scope.onClose = function (input) {
                delete $scope.tags[input.tag.value];
                $scope.list[input.tag.value] = input.tag.name;
            };
        },
        template: '<div ng-class="{\'input-group\': tags.length}">'+
                        '<div class="input-group-btn">'+
                            '<button ng-repeat="tag in tags | filter: $viewValue" class="btn btn-info" type="input" value="{{tag.value}}" ng-click="onClose(this);">{{tag.name}}</button>'+
                        '</div>'+
                        '<input type="text" placeholder="placeholder" ng-model="tagInput" class="form-control" typeahead="state for state in list | filter: $viewValue" typeahead-editable="false" typeahead-on-select="onSelect($item)" />' +
                    '</div>'
    };
});
