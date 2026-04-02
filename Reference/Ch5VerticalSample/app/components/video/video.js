/*jslint es6 */
/*global document, window, appModule, translateModule */
var videoModule = (function () {
    'use strict';

    /**
     * All method is concating in one method
     */
    function _videoInit() {}

    /**
     * All public or private methods which need to call on init
     */
    var videoPage = document.querySelector('.video-page');
    videoPage.addEventListener('afterLoad', _videoInit);

    /**
     * All public method and properties exporting here
     */
    return {};
}());
