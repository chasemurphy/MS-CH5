/*jslint es6 */
/*global document, window, XMLHttpRequest, CrComLib, event, translateModule, setTimeout */
var appModule = (function () {
    'use strict';
    /**
     * All public and local(prefix '_') properties
     */
    var _triggerview = document.querySelector('.triggerview');
    var _navbarThumb = document.querySelector('.navbar-thumb');
    var _activeIndex = 0;
    var _themeNav = document.getElementById('changeTheme');

    /**
     * This is public method to change the theme
     * @param {string} theme pass theme type like 'LIGHT', 'DARK'
     */
    function changeTheme(theme) {
        var body = document.body;
        var self;
        body.classList.remove('light-theme', 'dark-theme');
        var themeLink = _themeNav.getElementsByClassName('btn-link');
        if (theme === 'LIGHT') {
            self = themeLink[1];
            body.classList.add('light-theme');
            CrComLib.publishEvent('s', 'ch5_brand', './assets/img/ch5-logo-light.png');
        } else {
            self = themeLink[2];
            body.classList.add('dark-theme');
            CrComLib.publishEvent('s', 'ch5_brand', './assets/img/ch5-logo-dark.png');
        }
        // add active class
        var current = _themeNav.getElementsByClassName('active');
        if (current.length > 0) {
            current[0].className = current[0].className.replace(' active', '');
        }
        self.className += ' active';
    }

    /**
     * This is public method to toggle left navigation sidebar
     */
    function toggleSidebar() {
        _themeNav.firstElementChild.classList.toggle('active');
        _navbarThumb.classList.toggle('open');
        event.stopPropagation();
    }

    /**
     * This is public method for bottom navigation to navigate to next page
     * @param {number} idx is current index for navigate to appropriate page
     */
    function addNavItemClickListener(idx) {
        var itemElem = document.querySelector('.thumb-btn-' + idx);
        itemElem.addEventListener('click', function () {
            if (_triggerview !== null && idx !== _activeIndex) {
                _triggerview.setActiveView(idx);
                return;
            }
        });
    }

    /**
     * This is public method for bottom navigation to set active state
     * @param {number} idx is current index for active state
     */
    function navActiveState(idx) {
        CrComLib.subscribeState('n', 'nav.items.size', function (numNavs) {
            var i = 0;
            while (i < numNavs) {
                CrComLib.publishEvent('b', 'active_state_class_' + i, false);
                i += 1;
            }
        });
        if (_activeIndex === idx) {
            CrComLib.publishEvent('b', 'active_state_class_' + idx, true);
        }
    }

    /**
     * This is public method for triggerview
     * @param {number} navItemSize is number of bottom navigation list
     */
    function triggerviewOnInit(navItemSize) {
        // storing active class index
        var storedActiveCls = document.querySelectorAll('.navbar-thumb .ch5-button');
        storedActiveCls.forEach(function (cls, navIdx) {
            if (cls.className === 'ch5-button--selected') {
                navActiveState(navIdx);
            }
        });
        _triggerview.addEventListener('select', function (event) {
            _activeIndex = event.detail;
            navActiveState(_activeIndex);
        });

        // on init
        if (navItemSize !== storedActiveCls.length) {
            CrComLib.publishEvent('n', 'nav.items.size', navItemSize);
            navActiveState(_activeIndex);
        }
    }

    /**
     * This is public method to show language dropdown in smaller screen
     * @param {object} self is current element
     */
    function openLngMenu(self) {
        self.className += ' open';
        event.stopPropagation();
    }

    /**
     * on init setting language code
     */
    setTimeout(function () {
        changeTheme('LIGHT');
        translateModule.getLanguage(translateModule.defaultLng);
    });

    /**
     * This method will invoke on body click
     */
    document.body.addEventListener('click', function () {
        translateModule.currentLng.classList.remove('open');
        _navbarThumb.classList.remove('open');
        _themeNav.firstElementChild.classList.remove('active');
    });

    /**
     * All public method and properties exporting here
     */
    return {
        toggleSidebar: toggleSidebar,
        changeTheme: changeTheme,
        addNavItemClickListener: addNavItemClickListener,
        navActiveState: navActiveState,
        triggerviewOnInit: triggerviewOnInit,
        openLngMenu: openLngMenu
    };
}());

/**
 * Loader method is for spinner
 */
function loader() {
    'use strict';
    var spinner = document.getElementById('loader');
    setTimeout(function () {
        spinner.style.display = 'none';
    }, 1000);
}
document.addEventListener('DOMContentLoaded', loader, false);
