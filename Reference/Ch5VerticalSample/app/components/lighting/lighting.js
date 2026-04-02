/*jslint es6 */
/*global document, window, CrComLib, serviceModule, setTimeout, event, appModule */
var lightingModule = (function () {
    'use strict';
    /**
     * This is for emulator where getting json response and initializing emulator
     * @param {string} url is path of list emulator json
     */
    function _lightingEmulator(url) {
        serviceModule.loadJSON(url, function (response) {
            var lightongEmulator = JSON.parse(response);
            serviceModule.initEmulator(lightongEmulator);
        });
    }

    /**
     * This method is for add/remove class for pulse effect on button
     */
    function _lightingButtonClasses() {
        var elements = document.querySelectorAll('.lighting-button');
        if (elements) {
            elements.forEach(function (element) {
                element.addEventListener('click', function (e) {
                    e.currentTarget.classList.add('pulse-once-lighting');
                    var myButton = e.currentTarget;
                    setTimeout(function () {
                        myButton.classList.remove('pulse-once-lighting');
                    }, 1500);
                });
            });
        }
    }

    /**
     * This method is for toggle sidebar in smaller divice
     */
    function lightingSidebarToggle() {
        var lightingSidebar = document.getElementById('lightingSidebar');
        lightingSidebar.classList.toggle('open');
        event.stopPropagation();
    }

    /**
     * Using this method we getting translated data of lighting
     * @param {object} lightObj is translated data of lighting
     */
    function updateTranslateObj(lightObj) {
        // update light name
        lightObj.lightName.forEach(function (val, idx) {
            CrComLib.publishEvent('s', 'lighting.loads.name_' + (idx), val);
        });
        // update scenes list
        CrComLib.publishEvent('s', 'scenesVarTpl', JSON.stringify(lightObj.scenes));
    }

    /**
     * All method is concating in one method
     */
    function _lightingInit() {
        _lightingEmulator('./assets/data/lighting-emulator.json');
        _lightingButtonClasses();
    }

    /**
     * All public or private methods which need to call on init
     */
    var buttonsPage = document.querySelector('.lighting-page');
    buttonsPage.addEventListener('afterLoad', _lightingInit);

    /**
     * All public method and properties exporting here
     */
    return {
        lightingSidebarToggle: lightingSidebarToggle,
        updateTranslateObj: updateTranslateObj
    };
}());
