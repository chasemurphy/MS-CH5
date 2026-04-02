/*jslint es6 */
/*global document, window, CrComLib, appModule, setTimeout */
var sourceModule = (function () {
    'use strict';
    /**
     * All public and local(prefix '_') properties
     */
    var _sourceItemSize;

    /**
     * This is private method, it invokes on tile click.
     * @param {number} idx is current index of element for active state
     */
    function _addSourceItemClickListener(idx) {
        var itemElem = document.querySelector('.source-btn-' + idx);
        itemElem.addEventListener('click', function () {
            CrComLib.subscribeState('n', 'source.item.size', function (numBtn) {
                var i = 0;
                while (i < numBtn) {
                    CrComLib.publishEvent('b', `source.button.active.state${i}`, false);
                    i += 1;
                }
            });
            CrComLib.publishEvent('b', `source.button.active.state${idx}`, true);
        });
    }

    /**
     * Using this method we getting translated data of source tiles
     * @param {object} srcObj is translated data of source tiles
     */
    function updateTranslateObj(srcObj) {
        // published source navigation size
        if (_sourceItemSize !== srcObj.length) {
            _sourceItemSize = srcObj.length;
            CrComLib.publishEvent('n', 'source.item.size', _sourceItemSize);
        }

        if (srcObj.length) {
            srcObj.forEach(function (src, idx) {
                CrComLib.publishEvent('s', `source.button.label${idx}`, src.title);
                CrComLib.publishEvent('s', `source.button.icon${idx}`, src.icon);
                _addSourceItemClickListener(idx);
            });
        }
    }

    /**
     * All method is concating in one method
     */
    function _sourcesInit() {}

    /**
     * All public or private methods which need to call on init
     */
    var buttonsPage = document.querySelector('.source-page');
    buttonsPage.addEventListener('afterLoad', _sourcesInit);

    /**
     * All public method and properties exporting here
     */
    return {
        updateTranslateObj: updateTranslateObj
    };
}());
