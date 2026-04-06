(function () {
  "use strict";
  try {
    var path = window.location.pathname || "";
    if (path.indexOf("login.html") !== -1) return;
    if (sessionStorage.getItem("sophosProtoAuth") !== "1") {
      window.location.replace("login.html");
    }
  } catch (e) {
    /* sessionStorage unavailable — allow page load */
  }
})();
