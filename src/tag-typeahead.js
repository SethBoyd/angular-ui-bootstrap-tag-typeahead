angular // jshint ignore:line
    .module('tag-typeahead', ['ui.bootstrap.tpls', 'basic'], function () {
        "use strict";
    })
    .constant({
        grid: 12
    })
    .value('tagTypeaheadPopupConfig', {
        maxColumns: 1,
        maxColumnItems: 0
    })
    .value('tagTypeaheadInputConfig', {
        maxTags: 0,
        moreTagsText: '...'
    })
    .directive('activateOnEmptyFocus', function () {
        "use strict";
        return {
            restrict: "C",
            require: "?ngModel",
            link: function ($scope, element, attrs, model) {
                var _mark = '.';
                $scope.col = 3;
                if ($scope.activateOnEmptyFocus) {
                    element.bind('focus', function () {
                        $scope.$apply(function () {
                            model.$setViewValue(_mark);
                        });
                    });
                    model.$parsers.push(function (input) {
                        if (angular.isDefined(input) && !input.length) {
                            model.$setViewValue(_mark);
                        }
                    });
                }
                $scope.empty = function (input, view) {
                    return ($scope.activateOnEmptyFocus && view === _mark) || input.toLowerCase().indexOf(view.toLowerCase()) > -1;
                };
            }
        };
    })
    .directive('tagTypeaheadInput', function () {
        "use strict";
        return {
            restrict: 'C',
            replace: true,
            scope: {
                list: '=',
                tags: '=',
                typeaheadAppendToBody: '=',
                activateOnEmptyFocus: '=',
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
            '<input type="text" placeholder="{{placeholder}}" ng-trim="false" ng-model="tagInput" class="form-control activate-on-empty-focus" typeahead="state.name for state in _list| filter:$viewValue:empty" typeahead-append-to-body="{{typeaheadAppendToBody}}" typeahead-editable="false" typeahead-on-select="onSelect($item)" />' +
            '</div>'
        };
    });