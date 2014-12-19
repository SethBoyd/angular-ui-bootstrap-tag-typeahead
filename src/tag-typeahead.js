angular // jshint ignore:line
    .module('tag-typeahead', ['ui.bootstrap', 'basic'])
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
    .service('tagTypeaheadInputElement', function () {
        "use strict";
        this.self = {};
    })
    .service('tagTypeaheadInputPopup', function () {
        "use strict";
        var _height = [];
        var _width = [];
        this.self = {};
        this.items = 0;
        this.maxHeight = 0;
        this.minWidth = 0;
        this.definedHeight = function () {
            angular.forEach(_height, function (action) {
                action();
            });
        };
        this.definedWidth = function () {
            angular.forEach(_width, function (action) {
                action();
            });
        };
        this.onDefinedHeight = function (action) {
            _height.push(action);
        };
        this.onDefinedWidth = function (action) {
            _width.push(action);
        };
    })
    .run(function ($templateCache) {
        "use strict";
        $templateCache.put("template/typeahead/typeahead-popup.html",
            "<ul class=\"dropdown-menu\" ng-show=\"isOpen()\" ng-style=\"{'overflow-y': 'auto', height: maxHeight, width: position.width+'px', top: position.top+'px', left: position.left+'px'}\" style=\"display: block;\" role=\"listbox\" aria-hidden=\"{{!isOpen()}}\">\n" +
            "<li ng-repeat=\"match in matches track by $index\" class=\"tag-typeahead-input-popup-item col-xs-{{gridCols}}\" ng-class=\"{active: isActive($index)}\" ng-mouseenter=\"selectActive($index)\" ng-click=\"selectMatch($index)\" role=\"option\" id=\"{{match.id}}\">\n" +
            "<div typeahead-match index=\"$index\" match=\"match\" query=\"query\" template-url=\"templateUrl\"></div>\n" +
            "</li>\n" +
            "</ul>\n");
    })
    .directive('typeaheadPopup', function ($compile, $templateCache, tagTypeaheadPopupConfig, grid, tagTypeaheadInputElement, tagTypeaheadInputPopup) {
        "use strict";
        return {
            link: function (scope, element, attrs) {
                scope.templateUrl = attrs.templateUrl;
                scope.isOpen = function () {
                    return scope.matches.length > 0;
                };
                scope.isActive = function (matchIdx) {
                    return scope.active == matchIdx;
                };
                scope.selectActive = function (matchIdx) {
                    scope.active = matchIdx;
                };
                scope.selectMatch = function (activeIdx) {
                    scope.select(activeIdx);
                };
                tagTypeaheadInputPopup.self = element;
                scope.$watchCollection('matches', function (newMatches, oldMatches) {
                    if (newMatches !== oldMatches && newMatches.length) {
                        if (tagTypeaheadPopupConfig.maxColumns === 0) {
                            scope.cols = Math.floor(scope.position.width / tagTypeaheadInputPopup.minWidth);
                        } else {
                            scope.cols = tagTypeaheadPopupConfig.maxColumns;
                            if (scope.position.width / scope.cols < scope.minWidth) {
                                scope.cols -= 1;
                            }
                        }
                        if (tagTypeaheadPopupConfig.maxColumnItems === 0) {
                            scope.colItem = Math.floor(scope.matches.length / scope.cols) + 1;
                        } else {
                            scope.colItem = tagTypeaheadPopupConfig.maxColumnItems;
                        }
                        if (scope.colItem >= newMatches.length) {
                            scope.maxHeight = 'auto';
                            scope.gridCols = grid;
                        } else {
                            scope.maxHeight = tagTypeaheadInputPopup.maxHeight + 10;
                            scope.gridCols = grid / scope.cols;
                        }
                    } else {
                        tagTypeaheadInputPopup.onDefinedHeight(function () {
                            scope.maxHeight = tagTypeaheadInputPopup.maxHeight + 10;
                        });
                        tagTypeaheadInputPopup.onDefinedWidth(function () {
                            if (angular.isUndefined(scope.minWidth)) {
                                scope.minWidth = tagTypeaheadInputPopup.minWidth;
                            }
                        });
                    }
                });
                scope.$watch('position.left', function (newLeftOffset, oldLeftOffset) {
                    if (newLeftOffset !== oldLeftOffset) {
                        if (newLeftOffset > tagTypeaheadInputElement.self.width()) {
                            scope.position.left -= newLeftOffset - tagTypeaheadInputElement.self.width();
                        }
                    }
                });
                element.replaceWith($compile(angular.element($templateCache.get("template/typeahead/typeahead-popup.html")))(scope));
            }
        };
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