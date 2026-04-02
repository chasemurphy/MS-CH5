/*jslint es6 */
/*global document, window, CrComLib, serviceModule, includeHtmlTpl */
var listsModule = (function () {
    'use strict';
    /**
     * All public and local(prefix '_') properties
     */
    var SELECTEDCONTACT_STARTJOINOFFSET = 31;
    var CLICKEDCONTACT_STARTJOINOFFSET = 31;
    var NUMCONTACTS_JOIN = '30';

    /**
     * This is private method, it invokes on list click.
     * @param {number} idx is current index of element to show the list detail
     */
    function _addContactItemClickListener(idx) {
        var itemElem = document.getElementById('contact-list-item-' + idx);
        itemElem.addEventListener('click', function () {
            var eventName = (idx + CLICKEDCONTACT_STARTJOINOFFSET).toString(10);
            CrComLib.publishEvent('b', eventName, true);
            CrComLib.publishEvent('b', eventName, false);
        });
    }

    /**
     * This is private method for active state of list and invoked list click.
     */
    function _listActiveState() {
        CrComLib.subscribeState('n', NUMCONTACTS_JOIN, function (numContacts) {
            for (let i = 0; i < numContacts; i++) {
                _addContactItemClickListener(i);
                CrComLib.subscribeState('b', (i + SELECTEDCONTACT_STARTJOINOFFSET).toString(10), function (selected) {
                    const item = document.getElementById('contact-list-item-' + i);
                    if (item) {
                        selected ? item.classList.add('active') : item.classList.remove('active');
                    }
                });
            }
        });
    }

    /**
     * This is for emulator where getting json response and initializing emulator
     * @param {string} url is path of list emulator json
     */
    function _listEmulator(url) {
        serviceModule.loadJSON(url, function (response) {
            var listsEmulator = JSON.parse(response);
            serviceModule.initEmulator(listsEmulator);
            _listActiveState();
            setTimeout(function () {_setListHeight();});
        });
    }

    /**
     * This is for calculate dynamic height of list and setting on the element
     */
    function _setListHeight() {
        var excludeSpace;
        var listScrollerElm = document.getElementById('listScroller');
        window.innerWidth > 767 ? excludeSpace = 38 : excludeSpace = 18;
        var scrollHeight = window.innerHeight - (listScrollerElm.getBoundingClientRect().top + excludeSpace);
        listScrollerElm.setAttribute('maxHeight', scrollHeight + 'px');
    }

    /**
     * This for collapse contact detail
     */
    function toggleContact() {
        var detailElm = document.getElementById('contactDetail');
        detailElm.classList.toggle('open');
        setTimeout(function () {
            _setListHeight();
        }, 301);
    }

    /**
     * All method is concating in one method
     */
    function _listsInit() {
        _listEmulator('./assets/data/list-emulator.json');
    }

    /**
     * This method will invoke on window resize
     */
    window.addEventListener('resize', _setListHeight);

    /**
     * All public or private methods which need to call on init
     */
    var buttonsPage = document.querySelector('.lists-page');
    buttonsPage.addEventListener('afterLoad', _listsInit);

    /**
     * All public method and properties exporting here
     */
    return {
        toggleContact: toggleContact
    };
}());
