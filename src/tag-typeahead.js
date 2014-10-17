angular // jshint ignore:line
    .module('tag-typeahead', ['ui.bootstrap.tpls', 'basic'], function () {
        "use strict";
    })
    .directive('tagTypeaheadInput', function () {
        "use strict";
        return {
            restrict: 'C',
            replace: true,
            scope: {
                list: '=',
                placeholder: '='
            },
            controller: function ($scope) {
                var _key;
                $scope._list = [];
                for (_key in $scope.list) {
                    //noinspection JSUnresolvedFunction
                    if ($scope.list.hasOwnProperty(_key)) {
                        $scope._list.push({value: _key, name: $scope.list[_key]});
                    }
                }
            },
            link: function ($scope) {
                $scope.tags = [];
                $scope.onSelect = function (item) {
                    var _key;
                    for (_key in $scope._list) {
                        if ($scope._list.hasOwnProperty(_key) && $scope._list[_key] === item) {
                            $scope.tags.push($scope._list[_key]);
                            $scope.tagInput = '';
                            $scope._list.splice(_key, 1);
                        }
                    }
                };
                $scope.onClose = function (input) {
                    var _key;
                    for (_key in $scope.tags) {
                        if ($scope.tags.hasOwnProperty(_key) && $scope.tags[_key].value === input.tag.value) {
                            $scope._list.push($scope.tags[_key]);
                            $scope.tags.splice(_key, 1);
                        }
                    }

                };
            },
            template: '<div ng-class="{\'input-group\': tags.length}">' +
            '<div class="input-group-btn">' +
            '<span ng-repeat="tag in tags" class="btn btn-info" type="input" value="{{tag.value}}" ng-click="onClose(this);">{{tag.name}}</span>' +
            '</div>' +
            '<input type="text" placeholder="{{placeholder}}" ng-model="tagInput" class="form-control" typeahead="state.name for state in _list | filter: $viewValue" typeahead-editable="false" typeahead-on-select="onSelect($item)" />' +
            '</div>'
        };
    });