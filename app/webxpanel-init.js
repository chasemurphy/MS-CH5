(function () {
  if (window.WebXPanel) {
    var wxp = window.WebXPanel.default(!window.WebXPanel.runsInContainerApp());
    if (wxp.isActive) {
      var params = new URLSearchParams(window.location.search);
      var ipId = params.get('ipId') || params.get('ipid');
      var authtoken = params.get('authtoken');
      if (ipId && !ipId.toLowerCase().startsWith('0x')) {
        ipId = '0x' + ipId;
      }
      var config = {};
      if (ipId) config.ipId = ipId;
      if (authtoken) config.authToken = authtoken;
      wxp.WebXPanel.initialize(config);
    }
  }
}());
