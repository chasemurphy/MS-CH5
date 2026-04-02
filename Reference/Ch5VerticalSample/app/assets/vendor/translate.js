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