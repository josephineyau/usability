(function () {
  "use strict";

  var PROFILE_MENU_ID = "profile-menu";
  var LS_CONSUMED_ADMIN_PASSWORDS = "sophosProtoConsumedAdminPasswords";
  var LS_CUSTOM_ROLE_NAMES = "sophosProtoCustomRoleNames";
  var LS_CUSTOM_ROLE_DATA = "sophosProtoCustomRoleData";
  /** After logout, custom roles = this list only (predefined rows stay from HTML). */
  var DEFAULT_LOGOUT_CUSTOM_ROLES = ["Tier 1 help desk"];

  function resetPrototypeRolesToDefault() {
    try {
      localStorage.setItem(
        LS_CUSTOM_ROLE_NAMES,
        JSON.stringify(DEFAULT_LOGOUT_CUSTOM_ROLES)
      );
      localStorage.setItem(LS_CUSTOM_ROLE_DATA, JSON.stringify({}));
    } catch (e) {
      /* ignore */
    }
    try {
      if (typeof BroadcastChannel !== "undefined") {
        var ch = new BroadcastChannel("sophosProtoCustomRoles");
        ch.postMessage({ type: "change" });
        ch.close();
      }
    } catch (bcErr) {
      /* ignore */
    }
  }

  function syncProfileMenuUsername(menu) {
    var m = menu || document.getElementById(PROFILE_MENU_ID);
    if (!m) return;
    var el = m.querySelector(".profile-menu__username");
    if (!el) return;
    var name = "usernameHere";
    try {
      var s = sessionStorage.getItem("sophosProtoUsername");
      if (s) name = s;
    } catch (e) {
      /* ignore */
    }
    el.textContent = name;
  }

  function performLogout() {
    try {
      var type = sessionStorage.getItem("sophosProtoAccountType");
      var pwdUsed = sessionStorage.getItem("sophosProtoAdminPasswordUsed");
      if (type === "B" && pwdUsed) {
        var arr = [];
        try {
          arr = JSON.parse(
            localStorage.getItem(LS_CONSUMED_ADMIN_PASSWORDS) || "[]"
          );
        } catch (e) {
          arr = [];
        }
        if (!Array.isArray(arr)) arr = [];
        if (arr.indexOf(pwdUsed) === -1) arr.push(pwdUsed);
        localStorage.setItem(
          LS_CONSUMED_ADMIN_PASSWORDS,
          JSON.stringify(arr)
        );
      }
      sessionStorage.removeItem("sophosProtoAuth");
      sessionStorage.removeItem("sophosProtoUsername");
      sessionStorage.removeItem("sophosProtoAccountType");
      sessionStorage.removeItem("sophosProtoAdminPasswordUsed");
    } catch (err) {
      /* ignore */
    }
    resetPrototypeRolesToDefault();
    window.location.href = "login.html";
  }

  function ensureMenuEl() {
    var menu = document.getElementById(PROFILE_MENU_ID);
    if (menu) return menu;
    menu = document.createElement("div");
    menu.id = PROFILE_MENU_ID;
    menu.className = "profile-menu";
    menu.setAttribute("role", "menu");
    menu.setAttribute("aria-label", "Account");
    menu.hidden = true;
    menu.setAttribute("aria-hidden", "true");
    menu.innerHTML =
      '<div class="profile-menu__identity">' +
      '<span class="profile-menu__avatar" aria-hidden="true">' +
      '<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">' +
      '<circle cx="16" cy="16" r="16" fill="#fff"/>' +
      '<path d="M16 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" fill="#5f6368"/>' +
      '<path d="M8 26c0-4.42 3.58-8 8-8s8 3.58 8 8v1H8v-1Z" fill="#5f6368"/>' +
      "</svg></span>" +
      '<span class="profile-menu__username">usernameHere</span></div>' +
      '<div class="profile-menu__sep" role="separator"></div>' +
      '<div class="profile-menu__actions">' +
      '<button type="button" class="profile-menu__signout" role="menuitem" aria-label="Sign out">' +
      '<svg class="profile-menu__signout-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
      '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<path d="M16 17l5-5-5-5M21 12H9" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>' +
      "</svg>" +
      "<span>Sign out</span></button></div>";
    document.body.appendChild(menu);
    var signOut = menu.querySelector(".profile-menu__signout");
    if (signOut) {
      signOut.addEventListener("click", function (e) {
        e.stopPropagation();
        closeProfileMenu();
        performLogout();
      });
    }
    menu.addEventListener("click", function (e) {
      e.stopPropagation();
    });
    return menu;
  }

  function closeRoleMenuIfOpen() {
    var rm = document.getElementById("role-menu");
    if (!rm || rm.hidden) return;
    rm.hidden = true;
    rm.setAttribute("aria-hidden", "true");
    rm.innerHTML = "";
    document.querySelectorAll(".role-kebab[aria-expanded='true']").forEach(function (b) {
      b.setAttribute("aria-expanded", "false");
    });
  }

  function closeProfileMenu() {
    var menu = document.getElementById(PROFILE_MENU_ID);
    var trigger = document.querySelector(".icon-btn--profile");
    if (menu) {
      menu.hidden = true;
      menu.setAttribute("aria-hidden", "true");
    }
    if (trigger) {
      trigger.setAttribute("aria-expanded", "false");
    }
  }

  function positionProfileMenu(trigger) {
    var menu = document.getElementById(PROFILE_MENU_ID);
    if (!menu || !trigger) return;
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        if (!menu || menu.hidden) return;
        menu.style.position = "fixed";
        menu.style.zIndex = "220";
        var br = trigger.getBoundingClientRect();
        var mw = menu.offsetWidth || 260;
        var gap = 4;
        var pad = 8;
        var vw = window.innerWidth;
        var left = Math.round(br.right - mw);
        left = Math.max(pad, Math.min(left, vw - mw - pad));
        menu.style.top = Math.round(br.bottom + gap) + "px";
        menu.style.left = left + "px";
      });
    });
  }

  var trigger = document.querySelector(".icon-btn--profile");
  if (!trigger) return;

  trigger.setAttribute("aria-haspopup", "true");
  trigger.setAttribute("aria-expanded", "false");
  trigger.setAttribute("aria-controls", PROFILE_MENU_ID);

  trigger.addEventListener("click", function (e) {
    e.stopPropagation();
    var menu = ensureMenuEl();
    if (menu.hidden) {
      closeRoleMenuIfOpen();
      menu.hidden = false;
      menu.setAttribute("aria-hidden", "false");
      trigger.setAttribute("aria-expanded", "true");
      syncProfileMenuUsername(menu);
      positionProfileMenu(trigger);
    } else {
      closeProfileMenu();
    }
  });

  document.addEventListener("click", function (e) {
    var menu = document.getElementById(PROFILE_MENU_ID);
    var tr = document.querySelector(".icon-btn--profile");
    if (!menu || menu.hidden) return;
    if (tr && tr.contains(e.target)) return;
    if (menu.contains(e.target)) return;
    closeProfileMenu();
  });

  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    var menu = document.getElementById(PROFILE_MENU_ID);
    if (menu && !menu.hidden) {
      closeProfileMenu();
      e.preventDefault();
    }
  });

  window.addEventListener(
    "scroll",
    function () {
      var menu = document.getElementById(PROFILE_MENU_ID);
      var tr = document.querySelector(".icon-btn--profile");
      if (menu && !menu.hidden && tr) positionProfileMenu(tr);
    },
    true
  );

  window.addEventListener("resize", function () {
    var menu = document.getElementById(PROFILE_MENU_ID);
    var tr = document.querySelector(".icon-btn--profile");
    if (menu && !menu.hidden && tr) positionProfileMenu(tr);
  });
})();
