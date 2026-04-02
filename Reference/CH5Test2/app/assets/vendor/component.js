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
            self = themeLink[0];
            body.classList.add('light-theme');
            CrComLib.publishEvent('s', 'ch5_brand', './assets/img/ch5-logo-light.png');
        } else {
            self = themeLink[1];
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
            while (i <= numNavs-1) {
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
     * This is public method to show/hide bottom navigation in smaller screen
     */
    function openThumbNav() {
        _navbarThumb.className += ' open';
        event.stopPropagation();
    }

    /**
     * This method will invoke on body click
     */
    document.body.addEventListener('click', function () {
        translateModule.currentLng.classList.remove('open');
        _navbarThumb.classList.remove('open');
    });

    /**
     * on init setting language code
     */
    setTimeout(function () {
        changeTheme('LIGHT');
        translateModule.getLanguage(translateModule.defaultLng);
    });

    /**
     * All public method and properties exporting here
     */
    return {
        changeTheme: changeTheme,
        addNavItemClickListener: addNavItemClickListener,
        navActiveState: navActiveState,
        triggerviewOnInit: triggerviewOnInit,
        openLngMenu: openLngMenu,
        openThumbNav: openThumbNav
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

/*jslint es6 */
/*global document, XMLHttpRequest, CrComLib */
var serviceModule = (function () {
    'use strict';
    /**
     * All public and local(prefix '_') properties
     */
    var _ch5Emulator = CrComLib.Ch5Emulator.getInstance();

    /**
     * This is public method so that we can use in other module also
     * @param {string} url pass json file path
     * @param {object} callback method to get the json response
     */
    function loadJSON(url, callback) {
        var xhr = new XMLHttpRequest();
        xhr.overrideMimeType('application/json');
        xhr.open('GET', url, true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                callback(xhr.responseText);
            }
        };
        xhr.send(null);
    }

    /**
     * This is public method to init the emulator
     * @param {object} emulator pass your emulator response
     */
    function initEmulator(emulator) {
        _ch5Emulator.loadScenario(emulator);
        _ch5Emulator.run();
    }

    /**
     * All public method and properties exporting here
     */
    return {
        loadJSON: loadJSON,
        initEmulator: initEmulator
    };
}());

/*global document, CrComLib, appModule, serviceModule, sourceModule, lightingModule */
var translateModule = (function () {
    'use strict';
    /**
     * All public and local(prefix '_') properties
     */
    var _langData = [];
    var _crComLibTranslator = CrComLib.translationFactory.translator;
    var _ch5Textcontents = [];
    var currentLng = document.getElementById('currentLng');
    var defaultLng = 'en';

    /**
     * This is public method to fetch language data(JSON).
     * @param {string} lng is language code string like en, fr etc...
     */
    function getLanguage(lng) {
        serviceModule.loadJSON('./assets/data/translation/' + lng + '.json', function (response) {
            _langData[lng] = {translation: JSON.parse(response)};
            // update selected language
            _crComLibTranslator.changeLanguage(lng);

            // ch5 textcontent translaion
            _ch5Textcontents = document.querySelectorAll('[data-ch5-textcontent]');
            _ch5Textcontents.forEach(function (textcontent) {
                var _ch5Attr = textcontent.dataset.ch5Textcontent;
                CrComLib.publishEvent('s', _ch5Attr, `-+${_ch5Attr}+-`);
            });

            // slider bottom thumb object
            var _swiperObj = _langData[lng].translation.swiperSlides;
            if (_swiperObj.length) {
                appModule.triggerviewOnInit(_swiperObj.length);
                appModule.navItemSize = _swiperObj.length;
                _swiperObj.forEach(function (swiper, idx) {
                    CrComLib.publishEvent('s', 'nav_label_' + (idx), swiper.thumbTitle);
                    appModule.addNavItemClickListener(idx);
                });
            }

            // source page object
            var _sourceObj = _langData[lng].translation.source.sources;
            sourceModule.updateTranslateObj(_sourceObj);

            // lighting object
            var _lightingObj = _langData[lng].translation.lighting;
            lightingModule.updateTranslateObj(_lightingObj);
        });
    }

    /**
     * This is private method to init ch5 i18next translate library
     */
    function _initCh5LibTranslate() {
        CrComLib.registerTranslationInterface(_crComLibTranslator, '-+', '+-');
        _crComLibTranslator.init({
            fallbackLng: 'en',
            language: currentLng,
            debug: true,
            resources: _langData
        });
    }

    /**
     * This is public method, it invokes on language change click in UI
     * @param {string} lng is language code string like en, fr etc...
     * @param {object} self is current elememt
     */
    function changeLang(lng, self) {
        if (lng !== defaultLng) {
            var langNav = document.getElementById('changeLang');
            // add active class
            var current = langNav.getElementsByClassName('active');
            if (current.length > 0) {
                current[0].className = current[0].className.replace(' active', '');
            }
            self.className += ' active';
            currentLng.innerText = lng;
            defaultLng = lng;

            // invoke on language click
            getLanguage(lng);
        }
    }

    /**
     * All public or private methods which need to call on init
     */
    _initCh5LibTranslate();

    /**
     * All public method and properties exporting here
     */
    return {
        getLanguage: getLanguage,
        changeLang: changeLang,
        currentLng: currentLng,
        defaultLng: defaultLng
    };
}());