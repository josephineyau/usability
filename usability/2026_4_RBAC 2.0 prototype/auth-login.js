(function () {
  "use strict";

  function normalizeUser(s) {
    return String(s || "")
      .trim()
      .toLowerCase();
  }

  /**
   * @returns {{ ok: boolean, type?: string, user?: string, passwordUsed?: string, message?: string }}
   */
  function validateLogin(username, password) {
    var U = typeof window !== "undefined" && window.SOPHOS_PROTO_UTEST;
    if (!U) {
      return { ok: false, message: "Sign-in is not configured." };
    }
    var u = normalizeUser(username);
    var p = String(password || "");

    if (u === "dan" && p === U.typeA.dan) {
      return { ok: true, type: "A", user: "dan" };
    }
    if (u === "jo" && p === U.typeA.jo) {
      return { ok: true, type: "A", user: "jo" };
    }

    if (u === normalizeUser(U.adminUsername)) {
      var consumed = [];
      try {
        consumed = JSON.parse(
          localStorage.getItem(U.LS_CONSUMED_ADMIN_PASSWORDS) || "[]"
        );
      } catch (e) {
        consumed = [];
      }
      if (!Array.isArray(consumed)) consumed = [];

      if (U.adminPasswords.indexOf(p) === -1) {
        return { ok: false, message: "Invalid username or password." };
      }
      if (consumed.indexOf(p) !== -1) {
        return {
          ok: false,
          message: "This password has already been used. Ask the moderator for a new one.",
        };
      }
      return { ok: true, type: "B", user: U.adminUsername, passwordUsed: p };
    }

    return { ok: false, message: "Invalid username or password." };
  }

  function applySessionFromLogin(result) {
    try {
      sessionStorage.setItem("sophosProtoAuth", "1");
      sessionStorage.setItem("sophosProtoUsername", result.user);
      sessionStorage.setItem("sophosProtoAccountType", result.type);
      if (result.type === "B" && result.passwordUsed) {
        sessionStorage.setItem(
          "sophosProtoAdminPasswordUsed",
          result.passwordUsed
        );
      } else {
        sessionStorage.removeItem("sophosProtoAdminPasswordUsed");
      }
    } catch (e) {
      /* ignore */
    }
  }

  window.sophosProtoValidateLogin = validateLogin;
  window.sophosProtoApplySessionFromLogin = applySessionFromLogin;
})();
