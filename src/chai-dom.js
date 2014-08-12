var chaiDom, seleniumWebdriver, sizzle;

seleniumWebdriver = require('selenium-webdriver');
sizzle = require('webdriver-sizzle');

module.exports = chaiDom = function (driver) {
    'use strict';
    var $ = sizzle(driver);

    function chaiDom(chai, utils) {

        function assertElementExists(selector) {

            function testElExist(els) {
                return !!els.length;
            }

            return $
                .all(selector)
                .then(testElExist);
        }

        function thisMustBeADomElement() {
            var _chai = this;

            if (!utils.flag(_chai, 'dom')) {
                throw new Error('Can only test  dom elements');
            }
        }

        function by(amount, unitOfMeasurement) {
            var _chai = this;
            if (amount) {
                if (unitOfMeasurement === 'seconds') {
                    amount = amount * 1000;
                }
                utils.flag(_chai, 'by', amount);
            }
        }

        function dom() {
            var _chai = this;
            var selector = _chai._obj,
                dfdQueue = utils.flag(_chai, 'dfdQueue') || [],
                dfdEl = seleniumWebdriver.promise.defer(),
                findInUnder = utils.flag(_chai, 'by') || 2000;

            _chai._dom = {};
            dfdQueue.push(dfdEl);
            utils.flag(_chai, 'dfdQueue', dfdQueue);

            function checkDom() {
                assertElementExists(selector)
                    .then(tryAgainOrResolveDomElement);
            }

            function tryAgainOrResolveDomElement(result) {
                if (result) {
                    dfdEl.fulfill();
                } else {
                    checkDom();
                }
            }

            function endTheDomQuery() {
                dfdEl.reject('Element either doesn\'t exist or did not load within ' + findInUnder + 'ms');
            }

            _chai._dom.searchTimeout = setTimeout(endTheDomQuery, findInUnder);
            utils.flag(_chai, 'dom', true);

            checkDom();
        }

        function text(expectedText) {
            var _chai = this,
                selector = _chai._obj,
                dfdQueue = utils.flag(_chai, 'dfdQueue'),
                dfd = seleniumWebdriver.promise.defer();

            function checkText() {
                $(selector)
                    .getText()
                    .then(assertText);
            }

            function assertText(text) {
                if (utils.flag(_chai, 'contains')) {
                    _chai.assert((text.indexOf(expectedText) !== -1),
                        'Expected element <#{this}> to contain text "#{exp}", but it contains "#{act}" instead.',
                        'Expected element <#{this}> not to contain text "#{exp}", but it contains "#{act}".',
                        expectedText,
                        text);
                } else {
                    _chai.assert(text === expectedText,
                        'Expected text of element <#{this}> to be "#{exp}", but it was "#{act}" instead.',
                        'Expected text of element <#{this}> not to be "#{exp}", but it was.',
                        expectedText,
                        text);
                }
                dfd.fulfill();
            }

            $
                .all(dfdQueue)
                .then(checkText);

            return dfd.promise;
        }

        function visible() {
            var _chai = this,
                selector = _chai._obj,
                dfdQueue = utils.flag(_chai, 'dfdQueue'),
                dfd = seleniumWebdriver.promise.defer();

            thisMustBeADomElement();

            function checkVisible() {
                $(selector)
                    .isDisplayed()
                    .then(assertVisibility);
            }

            function assertVisibility(_visible) {
                _chai.assert(_visible,
                    'Expected #{this} to be visible but it is not visible',
                    'Expected #{this} to not be visible but it is visible');

                dfd.fulfill();
            }

            $
                .all(dfdQueue)
                .then(checkVisible);

            return dfd.promise;
        }

        function count(length) {
            var _chai = this,
                selector = _chai._obj,
                dfdQueue = utils.flag(_chai, 'dfdQueue'),
                dfd = seleniumWebdriver.promise.defer();
            thisMustBeADomElement();

            function checkCount() {
                $(selector).then(assertCount);
            }

            function assertCount(els) {
                _chai.assert(els.length === length,
                    'Expected #{this} to appear in the DOM #{exp} times, but it shows up #{act} times instead.',
                    'Expected #{this} not to appear in the DOM #{exp} times, but it does.',
                    length,
                    els.length);

                dfd.fulfill();
            }

            $
                .all(dfdQueue)
                .then(checkCount);

            return dfd.promise;
        }

        function style(property, value) {
            var _chai = this,
                selector = _chai._obj,
                dfdQueue = utils.flag(_chai, 'dfdQueue'),
                dfd = seleniumWebdriver.promise.defer();
            thisMustBeADomElement();

            function checkStyle() {
                $(selector)
                    .getCssValue(property)
                    .then(assertStyle);
            }

            function assertStyle(style) {
                _chai.assert(style === value,
                    'Expected ' + property + ' of element <' + selector + '> to be "' + value + '", but it is "' + style + '".',
                    'Expected ' + property + ' of element <' + selector + '> to not be "' + value + '", but it is.');

                dfd.fulfill();
            }

            $
                .all(dfdQueue)
                .then(checkStyle);

            return dfd.promise;
        }

        function value(val) {
            var _chai = this,
                selector = _chai._obj,
                dfdQueue = utils.flag(_chai, 'dfdQueue'),
                dfd = seleniumWebdriver.promise.defer();
            thisMustBeADomElement();

            function checkValue() {
                $(selector)
                    .getAttribute('value')
                    .then(assertValue);
            }

            function assertValue(actualValue) {
                _chai.assert(val === actualValue,
                    'Expected value of element <' + selector + '> to be "' + value + '", but it is "' + actualValue + '".',
                    'Expected value of element <' + selector + '> to not be "' + value + '", but it is.');

                dfd.fulfill();
            }

            $
                .all(dfdQueue)
                .then(checkValue);

            return dfd.promise;
        }

        function disabled() {
            var _chai = this,
                selector = _chai._obj,
                dfdQueue = utils.flag(_chai, 'dfdQueue'),
                dfd = seleniumWebdriver.promise.defer();
            thisMustBeADomElement();

            function checkDisabled() {
                $(selector)
                    .getAttribute('disabled')
                    .then(assertDisabled);
            }

            function assertDisabled(actualDisabled) {
                _chai.assert(actualDisabled,
                    'Expected #{this} to be disabled but it is not',
                    'Expected #{this} to not be disabled but it is');

                dfd.fulfill();
            }

            $
                .all(dfdQueue)
                .then(checkDisabled);

            return dfd.promise;
        }

        function htmlClass(val) {
            var _chai = this,
                selector = _chai._obj,
                dfdQueue = utils.flag(_chai, 'dfdQueue'),
                dfd = seleniumWebdriver.promise.defer();
            thisMustBeADomElement();


            function checkHtmlClass() {
                $(selector)
                    .getAttribute('class')
                    .then(assertHtmlClass);
            }

            function assertHtmlClass(classList) {
                _chai.assert(classList.indexOf(value) !== -1, 'Expected ' + classList + ' to contain ' + value + ', but it does not.');
                dfd.fulfill();
            }

            $
                .all(dfdQueue)
                .then(checkHtmlClass);

            return dfd.promise;
        }


        chai.Assertion.addProperty('in', function () {});

        chai.Assertion.addMethod('dom', dom);
        chai.Assertion.addMethod('by', by);

        chai.Assertion.addMethod('visible', visible);
        chai.Assertion.addMethod('count', count);
        chai.Assertion.addMethod('text', text);
        chai.Assertion.addMethod('style', style);
        chai.Assertion.addMethod('value', value);
        chai.Assertion.addMethod('disabled', disabled);
        chai.Assertion.addMethod('htmlClass', htmlClass);
    }

    return chaiDom;
};