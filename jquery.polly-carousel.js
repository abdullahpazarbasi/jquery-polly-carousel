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
        responsive: false,
        resizableViewport: 'window',
        checkingIntervalForResizing: 250, // in milliseconds
        vertical: false, // default: false (horizontal)
        inverseDirection: false, // past into future and future into past
        numberOfItemsInStage: true, // true for auto
        stageAlignment: 'center', // 'past-side' | 'future-side' | 'center' (resize according to the block) | 'justify' (fit to container)
        stageMinimumWidth: true, // true for auto
        stageMaximumWidth: true, // true for auto
        stageMinimumHeight: true, // true for auto
        stageMaximumHeight: true, // true for auto
        initialCentralItemIndex: 0,
        wheelable: true,
        draggable: true,
        swipable: true,
        autoRolling: false,
        autoRollingInterval: 3000, // in milliseconds
        numberOfRollingItemsForNavButtons: 1,
        numberOfRollingItemsForWheeling: 1,
        numberOfRollingItemsForDragging: true, // true for auto
        numberOfRollingItemsForSwiping: true, // true for auto
        numberOfRollingItemsForAutoRolling: 1,
        showBeforeRollingIn: true,
        hideBeforeRollingOut: false,
        infiniteLoop: false,
        rewinding: false, // valid while infiniteLoop is false
        edgeFriction: .15,
        rollingAnimation: 'linear',
        rollingAnimationSpeed: 250,
        adaptationAnimation: 'linear',
        adaptationAnimationSpeed: 250,
        ignoreActionsWhileAnimating: false,
        mateSelector: null, // for carousel sync.
        loadImageLazily: false,
        lazyImageLoadingSourceDataAttributeName: 'data-polly-carousel-lazy-source',
        urlFragmentDataAttributeName: 'data-polly-carousel-fragment',
        optionDataAttributeName: 'data-polly-carousel-options', // todo: parse
        itemClassName: 'polly-carousel-item',
        itemInStageClassName: 'polly-carousel-item-in-stage',
        pastItemClassName: 'polly-carousel-item-past',
        futureItemClassName: 'polly-carousel-item-future',
        centralItemClassName: 'polly-carousel-item-central',
        rollingItemClassName: 'polly-carousel-item-rolling',
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
        onConstructed: function (element) {},
        onDestructed: function (element) {}
    };

    function PollyCarousel() {
        this.stageElement = arguments[0];
        this.defaults = defaults;
        this.options = {};
        this.actualOptions = {};
        this.updateOptionsFlag = true;
        this.stageElementOriginalHtml = null;
        // other instance properties should be defined in reinitialize method
        var doArguments = Array.prototype.slice.call(arguments, 1);
        this._do.apply(this, doArguments);
        this.reinitialize();
    }

    PollyCarousel.prototype = {

        _do: function () {
            //var numberOfArguments = arguments.length;
            var argumentArray = Array.prototype.slice.call(arguments);
            if (typeof argumentArray[0] === 'object') {
                var options = argumentArray[0];
                this.updateOptionsFlag = false;
                for (var optionName in options) {
                    if (options.hasOwnProperty(optionName)) {
                        this.option(optionName, options[optionName]);
                    }
                }
                this.updateOptionsFlag = true;
                this._updateOptions();
                return true;
            }
            var method = argumentArray[0];
            if (method === 'option') {
                return this.option(argumentArray[1], argumentArray[2]);
            }
            if (method === 'reinitialize') {
                return this.reinitialize();
            }
            if (method === 'destroy') {
                return this.destroy();
            }
            //
            // You can add another method
            //
            return false;
        },

        _debug: function () {
            var o = this.actualOptions;
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
            var o = this.actualOptions;
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
            var state = 0; // 0: 'unknown option', 1: 'old value is default value and not changed', 2: 'old value not changed', 3: 'default value assigned as first value', 4: 'first value assigned', 5: 'old value changed to default value', 6: 'old value changed to new value'
            var optionOldValue = this.options[optionName];
            var optionDefaultValue = this.defaults[optionName];
            if (typeof optionOldValue === 'undefined') { // if old value does not exist
                if (typeof optionDefaultValue === 'undefined') { // if option is unknown
                    state = 0;
                }
                else { // if option is known
                    if (typeof optionValue === 'undefined') { // if first value is undefined
                        this.options[optionName] = optionDefaultValue;
                        state = 3;
                    }
                    else { // if first value is defined
                        this.options[optionName] = optionValue;
                        state = 4;
                    }
                }
            }
            else { // if old value exists
                if (typeof optionValue === 'undefined') { // if new value is undefined
                    if (optionOldValue === optionDefaultValue) { // if default value and new value is the same
                        state = 1;
                    }
                    else { // if default value and new value is different
                        this.options[optionName] = optionDefaultValue;
                        state = 5;
                    }
                }
                else { // if new value is defined
                    if (this.options[optionName] === optionValue) { // if old value and new value is the same
                        state = 2;
                    }
                    else { // if old value and new value is different
                        this.options[optionName] = optionValue;
                        state = 6;
                    }
                }
            }
            // validations and operations
            if (state > 2 && optionName === 'resizableViewport' && typeof this.options.responsive === 'object' && this.options.responsive.length > 0) {
                this._listenResizing(this.options[optionName], optionOldValue);
            }
            if (state > 2 && optionName === 'responsive' && typeof this.options.resizableViewport === 'string') {
                this._listenResizing(this.options.resizableViewport);
            }
            // /validations and operations
            if (this.updateOptionsFlag) {
                this._updateOptions();
            }
            return state;
        },

        _updateOptions: function (viewport) {
            this.options = $.extend({}, this.defaults, this.options);
            if (typeof viewport === 'undefined') {
                viewport = this.options.resizableViewport;
            }
            if (typeof this.options.responsive === 'object' && this.options.responsive.length > 0) {
                var responsiveOptions = this.options.responsive;
                var matchedBreakpoint = -1;
                var width = this._getViewportWidth(viewport);
                $.each(responsiveOptions, function(breakpoint) {
                    if (breakpoint <= width && breakpoint > matchedBreakpoint) {
                        matchedBreakpoint = parseInt(breakpoint);
                    }
                });
                if (typeof responsiveOptions[matchedBreakpoint] === 'object') {
                    delete responsiveOptions[matchedBreakpoint].debug;
                    delete responsiveOptions[matchedBreakpoint].responsive;
                    delete responsiveOptions[matchedBreakpoint].resizableViewport;
                }
                this.actualOptions = $.extend({}, this.options, responsiveOptions[matchedBreakpoint]);
            }
            else {
                this.actualOptions = $.extend({}, this.options);
            }
        },

        _listenResizing: function (newBase, oldBase) {
            if (typeof oldBase === 'string') {
                var jqOldBaseObject = null;
                if (oldBase === 'window') {
                    jqOldBaseObject = $(window);
                }
                else if (oldBase === 'document') {
                    jqOldBaseObject = $(document);
                }
                else {
                    jqOldBaseObject = $(oldBase);
                }
                jqOldBaseObject.off('resize', '**', $.proxy(this, 'onResize'));
            }
            var jqNewBaseObject = null;
            if (newBase === 'window') {
                jqNewBaseObject = $(window);
            }
            else if (newBase === 'document') {
                jqNewBaseObject = $(document);
            }
            else {
                jqNewBaseObject = $(newBase);
            }
            jqNewBaseObject.on('resize', $.proxy(this, 'onResize'));
        },

        _getActualWidth: function (jqElement) {
            var isContentBox = (jqElement.css('box-sizing') === 'content-box');
            var width = jqElement.width();
            if (isContentBox) {
                width +=
                    parseFloat(jqElement.css('padding-left'))
                  + parseFloat(jqElement.css('padding-right'));
            }
            return width;
        },

        _getActualHeight: function (jqElement) {
            var isContentBox = (jqElement.css('box-sizing') === 'content-box');
            var height = jqElement.height();
            if (isContentBox) {
                height +=
                    parseFloat(jqElement.css('padding-top'))
                  + parseFloat(jqElement.css('padding-bottom'));
            }
            return height;
        },

        _getStageSizeObject: function () {
            //var o = this.actualOptions;
            var jqStageElement = $(this.stageElement);
            return {
                width: this._getActualWidth(jqStageElement),
                height: this._getActualHeight(jqStageElement)
            };
        },

        _getNumberOfItems: function () {
            //var o = this.actualOptions;
            return $(this.stageElement).children().length;
        },

        _findOldestItemInStage: function () {
            //
        },

        _findNewestItemInStage: function () {
            //
        },

        _findItemInCenterOfStage: function () {
            return 0;
        },

        _getViewportWidth: function (viewport) {
            var width;
            if (typeof viewport === 'undefined') {
                viewport = window;
            }
            if (viewport === window) {
                width = window.innerWidth;
            }
            else if (viewport === document && document.documentElement.clientWidth) {
                width = document.documentElement.clientWidth;
            }
            else {
                width = $(viewport).width();
            }
            return width;
        },

        onResize: function (event) {
            this._updateOptions(event.target);
            // todo: relocations
        },

        reinitialize: function () {
            var o = this.actualOptions;
            var jqStageElement = $(this.stageElement);
            if (this.stageElementOriginalHtml === null) {
                this.stageElementOriginalHtml = this.stageElement.outerHTML;
            }
            else {
                var jqNewStageElement = $($.parseHTML(this.stageElementOriginalHtml, document, true));
                jqStageElement.replaceWith(jqNewStageElement);
                this.stageElement = jqNewStageElement.get(0);
                $.data(this.stageElement, 'polly-carousel-instance', this);
            }
            //
            this.stageHolded = false;
            this.stageDragged = false;
            jqStageElement.css('overflow', 'hidden');
            var originalStageSize = this._getStageSizeObject();
            //
            if (typeof o.onConstructed === 'function') {
                o.onConstructed(this.stageElement);
            }
        },

        rollTo: function (index) {
            //
        },

        next: function () {
            return this.rollTo(this._findItemInCenterOfStage() + 1);
        },

        previous: function () {
            return this.rollTo(this._findItemInCenterOfStage() - 1);
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
            var o = this.actualOptions;
            // todo: roll back to original element html
            $.removeData(this.stageElement, 'polly-carousel-instance');
            if (typeof o.onDestructed === 'function') {
                o.onDestructed(this.stageElement);
            }
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
            var instance = $.data(this, 'polly-carousel-instance');
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
                    $.data(this, 'polly-carousel-instance', instance);
                }
                else {
                    //pluginArgumentsArray.unshift(this);
                    //instance = new (Function.prototype.bind.apply(PollyCarousel, pluginArgumentsArray));
                    //$.data(this, 'polly-carousel-instance', instance);
                    console.warn('Initialization failed');
                }
            }
        });
    };

})(function() {
    if (typeof module !== 'undefined' && module.exports) {
        return require('jquery');
    }
    return window.jQuery;
}(), window, document);
