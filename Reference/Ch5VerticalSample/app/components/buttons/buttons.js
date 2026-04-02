/*jslint es6 */
/*global document, window, appModule, setTimeout */
var buttonsModule = (function () {
    'use strict';

    /**
     * This is private method for add the class on targeted class element
     * @param {array} gatherElementsClass is array of class which you have to target.
     * @param {string} appendClass is class name which you have to add.
     */
    function _addButtonClasses(gatherElementsClass, appendClass) {
        var elements = document.querySelectorAll(gatherElementsClass);
        if (elements) {
            elements.forEach(function (element) {
                element.addEventListener('click', function (e) {
                    e.currentTarget.classList.add(appendClass);
                    var myButton = e.currentTarget;
                    setTimeout(function () {
                        myButton.classList.remove(appendClass);
                    }, 1500);
                });
            });
        }
    }

    /**
     * All method is concating in one method
     */
    function _buttonsInit() {
        _addButtonClasses('.shadow-pulse-button', 'shadow-pulse-button-once');
        _addButtonClasses('.shadow-pulse-gradient-button', 'shadow-pulse-gradient-button-once');
        _addButtonClasses('.outline-animate-button', 'outline-animate-button-once');
    }

    /**
     * All public or private methods which need to call on init
     */
    var buttonsPage = document.querySelector('.buttons-page');
    buttonsPage.addEventListener('afterLoad', _buttonsInit);

    /**
     * All public method and properties exporting here
     */
    return {};
}());