angular // jshint ignore:line
    .module('tag-typeahead', ['ui.bootstrap', 'basic'])
    .run(function ($templateCache) {
        "use strict";
        $templateCache.put("template/typeahead/typeahead-popup.html",
            "<ul class=\"dropdown-menu\" ng-show=\"isOpen()\" ng-style=\"{'overflow-y': 'auto', height: maxHeight, width: position.width+'px', top: position.top+'px', left: position.left+'px'}\" style=\"display: block;\" role=\"listbox\" aria-hidden=\"{{!isOpen()}}\">\n" +
            "<li ng-repeat=\"match in matches track by $index\" class=\"tag-typeahead-input-popup-item col-xs-{{gridCols}}\" ng-class=\"{active: isActive($index)}\" ng-mouseenter=\"selectActive($index)\" ng-click=\"selectMatch($index)\" role=\"option\" id=\"{{match.id}}\">\n" +
            "<div typeahead-match index=\"$index\" match=\"match\" query=\"query\" template-url=\"templateUrl\"></div>\n" +
            "</li>\n" +
            "</ul>\n");
    })
    .directive('tagTypeaheadInputPopupItem', function ($timeout, tagTypeaheadPopupConfig, tagTypeaheadInputPopup) {
        "use strict";
        return {
            restrict: 'C',
            link: function (scope, element) {
                $timeout(function () {
                    if (element[0].offsetHeight && tagTypeaheadInputPopup.items < tagTypeaheadPopupConfig.maxColumnItems) {
                        tagTypeaheadInputPopup.items += 1;
                        tagTypeaheadInputPopup.maxHeight += element[0].offsetHeight;
                        tagTypeaheadInputPopup.definedHeight();
                    }
                    if (element[0].offsetWidth && element[0].offsetWidth > tagTypeaheadInputPopup.minWidth) {
                        tagTypeaheadInputPopup.minWidth = element[0].offsetWidth;
                        tagTypeaheadInputPopup.definedWidth();
                    }
                });
            }
        };
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
                    return scope.active === matchIdx;
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
                if ($scope.activateOnEmptyFocus) {
                    element.bind('focus', function () {
                        $scope.$apply(function () {
                            model.$setViewValue(element.val() || _mark);
                        });
                    });
                    model.$parsers.push(function (input) {
                        if (angular.isDefined(input) && !input.length) {
                            model.$setViewValue(_mark);
                        }
                    });
                }
                $scope.check = function (input, view) {
                    return ($scope.activateOnEmptyFocus && view === _mark)
                        || input.toLowerCase().indexOf(view.toLowerCase()) > -1;
                };
            }
        };
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
    .directive('tagTypeaheadInput', function (array, tagTypeaheadInputElement, tagTypeaheadInputConfig) {
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
                $scope._list = [];
                $scope.moreTags = false;
                this.attachTag = function () {
                    $scope._tags = [];
                    angular.forEach($scope.tags, function (tag, index) {
                        if (index > tagTypeaheadInputConfig.maxTags && tag !== $scope.moreTagsIndex) {
                            $scope._tags.push(tag);
                        }
                    });
                };
                this.initList = function (index) {
                    return {value: index, name: $scope.list[index]};
                };
                this.initMoreTags = function () {
                    this.random = function () {
                        var _random = Math.floor(Math.random() * 1000) + 1;
                        return $scope.tags.hasOwnProperty(_random) ? this.random() : _random;
                    };
                    $scope.moreTagsIndex = this.random().toString();
                    $scope.list[$scope.moreTagsIndex] = tagTypeaheadInputConfig.moreTagsText;
                };
            },
            link: function (scope, element, attrs, controller) {
                tagTypeaheadInputElement.self = element;
                angular.forEach(scope.list, function (list, index) {
                    if (!array.in(index, scope.tags)) {
                        scope._list.push(controller.initList(index));
                    }
                });
                if (tagTypeaheadInputConfig.maxTags) {
                    controller.initMoreTags();
                    scope.$watchCollection('tags', function (newTags, oldTags) {
                        if (angular.isDefined(newTags) && angular.isDefined(oldTags)) {
                            if (newTags.length > tagTypeaheadInputConfig.maxTags + 1 && !array.in(scope.moreTagsIndex, scope.tags)) {
                                scope.tags.push(scope.moreTagsIndex);
                                controller.attachTag();
                            } else {
                                if (newTags.length !== oldTags.length) {
                                    angular.forEach(scope.tags, function (tag, index) {
                                        if (tag === scope.moreTagsIndex) {
                                            scope.tags.splice(index, 1);
                                            controller.attachTag();
                                        }
                                    });
                                }
                            }
                        }
                    });
                }
                scope.hideTag = function (index, tag) {
                    return tagTypeaheadInputConfig.maxTags !== 0
                        && index > tagTypeaheadInputConfig.maxTags
                        && tag !== scope.moreTagsIndex;
                };
                scope.onSelect = function (item) {
                    angular.forEach(scope._list, function (list, index) {
                        if (list.value === item.value) {
                            scope.tags.push(item.value);
                            scope._list.splice(index, 1);
                            scope.tagInput = '';
                        }
                    });
                };
                scope.onClose = function (input) {
                    if (input === scope.moreTagsIndex) {
                        scope.moreTags = !scope.moreTags;
                    } else {
                        angular.forEach(scope.tags, function (tag, index) {
                            if (tag === input) {
                                scope._list.push(controller.initList(input));
                                scope.tags.splice(index, 1);
                            }
                        });
                    }
                };
            },
            template: '<div ng-class="{\'input-group\': tags.length}">' +
            '<div class="input-group-btn">' +
            '<span ng-repeat="tag in tags" ng-hide="hideTag($index, tag)" class="btn btn-info" type="input" value="{{tag}}" ng-click="onClose(tag);">{{list[tag]}}</span>' +
            '<ul class="dropdown-menu" style="display: block;" role="menu" ng-hide="!moreTags || !_tags.length">' +
            '<li ng-repeat="tag in _tags">' +
            '<div class="input-group-btn">' +
            '<span class="btn btn-block btn-info" type="input" value="{{tag}}" ng-click="onClose(tag);">{{list[tag]}}</span>' +
            '</div>' +
            '</li>' +
            '</ul>' +
            '</div>' +
            '<input type="text" placeholder="{{placeholder}}" ng-trim="false" ng-model="tagInput" class="form-control activate-on-empty-focus" typeahead="state.name for state in _list|filter:$viewValue:check" typeahead-append-to-body="{{typeaheadAppendToBody}}" typeahead-on-select="onSelect($item)" />' +
            '</div>'
        };
    });
