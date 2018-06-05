/**
 * @preserve jquery-polly-carousel
 * @name jquery.polly-carousel.js
 * @author Abdulah Pazarbasi <mail@abdullahpazarbasi.com>
 * @version 0.0.1
 * @copyright (c) 2018
 * @keywords carousel, javascript, jquery, plugin
 * @license MIT License
 */
; (function($, window, document, undefined) {

    'use strict';

    var defaults = {
        // Options:
        debug: false,
        autoRoll: false,
        // Events:
        onMoreItemsExpectingStarted: function (element) {},
        onMoreItemsExpectingFinished: function (element) {},
        onRollingStarted: function (element) {},
        whileRollAnimating: function (element) {},
        onRollingFinished: function (element) {},
        onEdgeReachedOnPastSide: function (element) {},
        onEdgeReachedOnFutureSide: function (element) {},
        onNumberOfItemsOnPastSideChanged: function (element) {},
        onNumberOfItemsOnFutureSideChanged: function (element) {},
        onItemSelected: function (element) {},
        onItemReplaced: function (element) {},
        onItemAppended: function (element) {},
        onItemPrepended: function (element) {},
        onItemInserted: function (element) {},
        onItemRemoved: function (element) {},
        onOptionChanged: function (element) {},
        onLoadedMediaLazily: function (element) {},
        onConstructed: function (element) {}
    };

    function PollyCarousel() {
        this.element = arguments[0];
        this.defaults = defaults;
        this.options = {};
        var doArguments = Array.prototype.slice.call(arguments, 1);
        this._do.apply(this, doArguments);
        this.reinit();
    }

    PollyCarousel.prototype = {

        _do: function (optionsOrMethod, optionName, optionValue) {
            if (typeof optionsOrMethod === 'object') {
                for (optionName in optionsOrMethod) {
                    if (optionsOrMethod.hasOwnProperty(optionName)) {
                        this.option(optionName, optionsOrMethod[optionName]);
                    }
                }
                this.options = $.extend({}, this.defaults, this.options);
                return true;
            }
            if (optionsOrMethod === 'option') {
                return this.option(optionName, optionValue);
            }
            //
            // You can add another method
            //
            return false;
        },

        _debug: function () {
            var o = this.options;
            if (!o.debug || typeof console === 'undefined' || typeof console.debug === 'undefined') {
                return;
            }
            console.debug.apply(console, arguments);
        },

        _warn: function () {
            if (typeof console === 'undefined' || typeof console.warn === 'undefined') {
                return;
            }
            console.warn.apply(console, arguments);
        },

        _log: function () {
            var o = this.options;
            if (!o.debug || typeof console === 'undefined' || typeof console.log === 'undefined') {
                return;
            }
            console.log.apply(console, arguments);
        },

        _generateUuidV4: function () {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        },

        option: function (optionName, optionValue) {
            if (typeof optionName === 'undefined') {
                return -1;
            }
            var state = 0; // 0: 'unknown option', 1: 'old and default value not changed', 2: 'old value not changed', 3: 'default value assigned as first value', 4: 'first value assigned', 5: 'old value changed to default value', 6: 'old value changed to new value'
            var optionOldValue = this.options[optionName];
            var optionDefaultValue = this.defaults[optionName];
            if (typeof optionOldValue === 'undefined') { // if option old value does not exist
                if (typeof optionDefaultValue === 'undefined') { // if option is unknown
                    state = 0;
                }
                else { // if option is known
                    if (typeof optionValue === 'undefined') { // if option first value is undefined
                        this.options[optionName] = optionDefaultValue;
                        state = 3;
                    }
                    else { // if option first value is defined
                        this.options[optionName] = optionValue;
                        state = 4;
                    }
                }
            }
            else { // if option old value exists
                if (typeof optionValue === 'undefined') { // if option new value is undefined
                    if (optionOldValue === optionDefaultValue) { // if option default value and new value is the same
                        state = 1;
                    }
                    else { // if option default value and new value is different
                        this.options[optionName] = optionDefaultValue;
                        state = 5;
                    }
                }
                else { // if option new value is defined
                    if (this.options[optionName] === optionValue) { // if option old value and new value is the same
                        state = 2;
                    }
                    else { // if option old value and new value is different
                        this.options[optionName] = optionValue;
                        state = 6;
                    }
                }
            }
            // validations and operations
            // /validations and operations
            return state;
        },

        reinit: function () {
            var o = this.options;
            if (typeof o.onConstructed === 'function') {
                o.onConstructed(this.element);
            }
        },

        rollTo: function (index) {
            //
        },

        next: function () {
            //
        },

        previous: function () {
            //
        },

        pauseAutoRolling: function () {
            //
        },

        continueToAutoRoll: function () {
            //
        },

        isHovered: function () {
            // todo: returns true on mouse over the stage
        },

        showItem: function (index) {
            //
        },

        hideItem: function (index) {
            //
        },

        howManyItemsMoreDoesExistInPastSide: function () {
            //
        },

        howManyItemsMoreDoesExistInFutureSide: function () {
            //
        },

        howManyBlocksMoreDoesExistInPastSide: function () {
            //
        },

        howManyBlocksMoreDoesExistInFutureSide: function () {
            //
        },

        replaceItem: function (index, itemHtml) {
            //
        },

        swapItem: function (index1, index2) {
            //
        },

        appendItem: function (itemHtml) {
            //
        },

        prependItem: function (itemHtml) {
            //
        },

        insertItem: function (index, itemHtml, after) {
            if (typeof after !== 'boolean') {
                after = false;
            }
        },

        removeItem: function (index) {
            //
        },

        destroy: function () {
            //
        }

    };

    /**
     * jQuery plug-in definition
     *
     * @returns {boolean}
     */
    $.fn.pollyCarousel = function () {
        var numberOfArguments = arguments.length;
        var pluginArgumentsArray = [];
        if (numberOfArguments < 1) {
            pluginArgumentsArray[0] = {};
        }
        else {
            pluginArgumentsArray = Array.prototype.slice.call(arguments);
        }
        return this.each(function () {
            var dataKey = 'plugin-polly-carousel';
            var instance = $.data(this, dataKey);
            if (instance) {
                if (typeof pluginArgumentsArray[0] === 'object') {
                    instance._do.apply(instance, [pluginArgumentsArray[0]]);
                }
                else {
                    instance._do.apply(instance, pluginArgumentsArray);
                }
            }
            else {
                if (typeof pluginArgumentsArray[0] === 'object') {
                    instance = new PollyCarousel(this, pluginArgumentsArray[0]);
                }
                else {
                    pluginArgumentsArray.unshift(this);
                    instance = new (Function.prototype.bind.apply(PollyCarousel, pluginArgumentsArray));
                }
                $.data(this, dataKey, instance);
            }
        });
    };

})(function() {
    if (typeof module !== 'undefined' && module.exports) {
        return require('jquery');
    }
    return window.jQuery;
}(), window, document);
