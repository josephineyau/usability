(function () {
  "use strict";

  var LS_CUSTOM_NAMES = "sophosProtoCustomRoleNames";
  var LS_ROLE_DATA = "sophosProtoCustomRoleData";

  var CMP_MODAL_PREDEFINED = [
    { value: "super-admin", label: "Super Admin" },
    { value: "admin", label: "Admin" },
    { value: "help-desk", label: "Help desk" },
    { value: "read-only", label: "Read-only" },
  ];

  var PREDEFINED_KEY_TO_CLONE_URL = {
    "super-admin": "Super Admin",
    admin: "Admin",
    "help-desk": "Help Desk",
    "read-only": "Read-only",
  };

  var openKebabBtn = null;
  var roleMenu = document.getElementById("role-menu");
  if (roleMenu) {
    roleMenu.addEventListener("click", function (e) {
      e.stopPropagation();
    });
  }

  function closeRoleMenu() {
    if (openKebabBtn) {
      openKebabBtn.setAttribute("aria-expanded", "false");
      openKebabBtn = null;
    }
    if (roleMenu) {
      roleMenu.style.maxHeight = "";
      roleMenu.style.overflowY = "";
      roleMenu.hidden = true;
      roleMenu.setAttribute("aria-hidden", "true");
      roleMenu.innerHTML = "";
    }
  }

  function menuHtmlPredefined(roleName) {
    return (
      '<div class="role-menu__header">' +
      '<svg class="role-menu__person" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>' +
      '<div><div class="role-menu__label">Role</div><a class="role-menu__name role-menu__name-link" href="edit-predefined-role.html?role=' +
      encodeURIComponent(roleName) +
      '">' +
      escapeHtml(roleName) +
      "</a></div></div>" +
      '<div class="role-menu__sep" role="separator"></div>' +
      '<button type="button" class="role-menu__item" role="menuitem" data-action="clone">Clone</button>'
    );
  }

  function menuHtmlCustom(roleName) {
    return (
      '<div class="role-menu__header">' +
      '<svg class="role-menu__person" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>' +
      '<div><div class="role-menu__label">Role</div><a class="role-menu__name role-menu__name-link" href="edit-role.html?role=' +
      encodeURIComponent(roleName) +
      '">' +
      escapeHtml(roleName) +
      "</a></div></div>" +
      '<div class="role-menu__sep" role="separator"></div>' +
      '<button type="button" class="role-menu__item" role="menuitem" data-action="clone">Clone</button>' +
      '<div class="role-menu__sep" role="separator"></div>' +
      '<button type="button" class="role-menu__item role-menu__item--danger" role="menuitem" data-action="delete">Delete</button>'
    );
  }

  function escapeHtml(s) {
    var d = document.createElement("div");
    d.textContent = s;
    return d.innerHTML;
  }

  function escAttrModal(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function getCustomRoleNamesSortedModal() {
    try {
      var raw = localStorage.getItem(LS_CUSTOM_NAMES);
      var arr = JSON.parse(raw || "[]");
      if (!Array.isArray(arr)) return [];
      return arr
        .filter(function (n) {
          return n && String(n).trim();
        })
        .map(function (n) {
          return String(n).trim();
        })
        .sort(function (a, b) {
          return a.localeCompare(b, undefined, { sensitivity: "base" });
        });
    } catch (e) {
      return [];
    }
  }

  function fillCloneModalMenu(menu, dd) {
    var names = getCustomRoleNamesSortedModal();
    var curPre = dd ? dd.getAttribute("data-cmp-predef") : null;
    var curCu = dd ? dd.getAttribute("data-cmp-custom") : null;
    var html = "";
    html += '<div class="cmp-dd__section-title">Pre-defined</div>';
    CMP_MODAL_PREDEFINED.forEach(function (p) {
      var sel = curPre === p.value ? " cmp-dd__item--sel" : "";
      html +=
        '<button type="button" class="cmp-dd__item' +
        sel +
        '" data-kind="predefined" data-value="' +
        escAttrModal(p.value) +
        '">' +
        escapeHtml(p.label) +
        "</button>";
    });
    html += '<div class="cmp-dd__section-title">Custom</div>';
    if (!names.length) {
      html +=
        '<button type="button" class="cmp-dd__item cmp-dd__item--disabled" disabled>No custom roles yet</button>';
    } else {
      names.forEach(function (n) {
        var sel = curCu === n ? " cmp-dd__item--sel" : "";
        html +=
          '<button type="button" class="cmp-dd__item' +
          sel +
          '" data-kind="custom" data-name="' +
          escAttrModal(n) +
          '">' +
          escapeHtml(n) +
          "</button>";
      });
    }
    menu.innerHTML = html;
  }

  function closeModalCloneDdMenu() {
    var dd = document.getElementById("add-role-modal-clone-dd");
    if (!dd) return;
    var menu = dd.querySelector(".cmp-dd__menu");
    var primary = dd.querySelector(".cmp-dd__primary");
    var chev = dd.querySelector(".cmp-dd__chev-btn");
    if (menu) menu.hidden = true;
    if (primary) primary.setAttribute("aria-expanded", "false");
    if (chev) chev.setAttribute("aria-expanded", "false");
  }

  function cloneModalDdClear(dd) {
    if (!dd) return;
    dd.removeAttribute("data-cmp-predef");
    dd.removeAttribute("data-cmp-custom");
    dd.removeAttribute("data-clone-url-name");
    var labelEl = dd.querySelector(".cmp-dd__label");
    var clearBtn = dd.querySelector(".cmp-dd__clear");
    if (labelEl) {
      labelEl.textContent = "Select";
      labelEl.removeAttribute("title");
      labelEl.classList.add("cmp-dd__label--placeholder");
    }
    if (clearBtn) clearBtn.hidden = true;
    closeModalCloneDdMenu();
  }

  function cloneModalDdApplySelection(dd, kind, value, displayLabel) {
    dd.removeAttribute("data-cmp-predef");
    dd.removeAttribute("data-cmp-custom");
    dd.removeAttribute("data-clone-url-name");
    var urlName;
    if (kind === "predefined") {
      dd.setAttribute("data-cmp-predef", value);
      urlName = PREDEFINED_KEY_TO_CLONE_URL[value] || displayLabel;
    } else {
      dd.setAttribute("data-cmp-custom", value);
      urlName = value;
    }
    dd.setAttribute("data-clone-url-name", urlName);
    var labelEl = dd.querySelector(".cmp-dd__label");
    var clearBtn = dd.querySelector(".cmp-dd__clear");
    if (labelEl) {
      labelEl.textContent = displayLabel;
      labelEl.setAttribute("title", displayLabel);
      labelEl.classList.remove("cmp-dd__label--placeholder");
    }
    if (clearBtn) clearBtn.hidden = false;
  }

  function initModalCloneDropdown(syncNextEnabledFn) {
    var dd = document.getElementById("add-role-modal-clone-dd");
    if (!dd) return;
    var menu = dd.querySelector(".cmp-dd__menu");
    var primary = dd.querySelector(".cmp-dd__primary");
    var chev = dd.querySelector(".cmp-dd__chev-btn");
    var clearBtn = dd.querySelector(".cmp-dd__clear");

    function openMenu() {
      closeRoleMenu();
      if (menu) {
        fillCloneModalMenu(menu, dd);
        menu.hidden = false;
      }
      if (primary) primary.setAttribute("aria-expanded", "true");
      if (chev) chev.setAttribute("aria-expanded", "true");
    }

    function toggleMenu() {
      if (menu && !menu.hidden) {
        closeModalCloneDdMenu();
      } else {
        openMenu();
      }
    }

    dd.addEventListener("click", function (e) {
      e.stopPropagation();
    });

    if (clearBtn) {
      clearBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        cloneModalDdClear(dd);
        var err = document.getElementById("add-role-modal-clone-error");
        if (err) {
          err.hidden = true;
          err.textContent = "";
        }
        if (syncNextEnabledFn) syncNextEnabledFn();
        closeModalCloneDdMenu();
      });
    }

    [primary, chev].forEach(function (btn) {
      if (!btn) return;
      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        toggleMenu();
      });
    });

    if (menu) {
      menu.addEventListener("click", function (e) {
        var item = e.target.closest(".cmp-dd__item");
        if (!item || item.disabled) return;
        e.stopPropagation();
        var kind = item.getAttribute("data-kind");
        var label = item.textContent.trim();
        if (kind === "predefined") {
          cloneModalDdApplySelection(
            dd,
            "predefined",
            item.getAttribute("data-value"),
            label
          );
        } else if (kind === "custom") {
          cloneModalDdApplySelection(dd, "custom", item.getAttribute("data-name") || label, label);
        }
        menu.hidden = true;
        if (primary) primary.setAttribute("aria-expanded", "false");
        if (chev) chev.setAttribute("aria-expanded", "false");
        var err = document.getElementById("add-role-modal-clone-error");
        if (err) {
          err.hidden = true;
          err.textContent = "";
        }
        if (syncNextEnabledFn) syncNextEnabledFn();
      });
    }
  }

  function removeCustomRoleName(name) {
    try {
      var cur = JSON.parse(localStorage.getItem(LS_CUSTOM_NAMES) || "[]");
      if (!Array.isArray(cur)) cur = [];
      var next = cur.filter(function (n) {
        return n !== name;
      });
      localStorage.setItem(LS_CUSTOM_NAMES, JSON.stringify(next));
    } catch (e) {
      /* ignore */
    }
    try {
      var map = JSON.parse(localStorage.getItem(LS_ROLE_DATA) || "{}");
      if (map && map[name]) {
        delete map[name];
        localStorage.setItem(LS_ROLE_DATA, JSON.stringify(map));
      }
    } catch (e2) {
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

  var toastHost = document.getElementById("toast-host");

  function showSuccessToast(message) {
    if (!toastHost || !message) return;
    var toast = document.createElement("div");
    toast.className = "toast toast--success toast--rich";
    toast.setAttribute("role", "status");
    toast.innerHTML =
      '<span class="toast__icon-wrap" aria-hidden="true">' +
      '<svg class="toast__icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' +
      '<circle cx="12" cy="12" r="10" fill="#fff"/>' +
      '<path d="M8 12l2.5 2.5L16 9" stroke="#137333" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>' +
      "</svg></span>" +
      '<span class="toast__msg">' +
      escapeHtml(message) +
      "</span>" +
      '<button type="button" class="toast__dismiss" aria-label="Dismiss">&times;</button>';

    var dismissTimer;
    function dismissToast() {
      window.clearTimeout(dismissTimer);
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }

    toast.querySelector(".toast__dismiss").addEventListener("click", dismissToast);
    toastHost.appendChild(toast);
    dismissTimer = window.setTimeout(dismissToast, 4500);
  }

  var deleteModalEl = document.getElementById("delete-role-modal");
  var deleteBackdrop = document.getElementById("delete-role-modal-backdrop");
  var deleteBody = document.getElementById("delete-role-modal-body");
  var deleteCancel = document.getElementById("delete-role-modal-cancel");
  var deleteX = document.getElementById("delete-role-modal-x");
  var deleteSubmit = document.getElementById("delete-role-modal-submit");
  var pendingDeleteRow = null;

  function closeDeleteModal() {
    pendingDeleteRow = null;
    if (deleteBackdrop) deleteBackdrop.hidden = true;
    if (deleteModalEl) deleteModalEl.hidden = true;
  }

  function openDeleteRoleModal(roleName, row) {
    pendingDeleteRow = row;
    if (deleteBody) {
      deleteBody.innerHTML = "Delete role <strong>" + escapeHtml(roleName) + "</strong>.";
    }
    if (deleteBackdrop) deleteBackdrop.hidden = false;
    if (deleteModalEl) deleteModalEl.hidden = false;
  }

  function confirmDeleteRole() {
    if (!pendingDeleteRow) {
      closeDeleteModal();
      return;
    }
    var row = pendingDeleteRow;
    var name =
      row.getAttribute("data-role-name") ||
      (row.querySelector(".role-link") && row.querySelector(".role-link").textContent.trim()) ||
      "";
    if (name) removeCustomRoleName(name);
    if (typeof window.sophosProtoSyncCustomRolesFromStorage === "function") {
      window.sophosProtoSyncCustomRolesFromStorage();
    } else if (row) {
      row.remove();
    }
    closeDeleteModal();
    showSuccessToast("Role deleted");
  }

  if (deleteCancel) deleteCancel.addEventListener("click", closeDeleteModal);
  if (deleteX) deleteX.addEventListener("click", closeDeleteModal);
  if (deleteBackdrop) deleteBackdrop.addEventListener("click", closeDeleteModal);
  if (deleteModalEl) {
    deleteModalEl.addEventListener("click", function (e) {
      if (e.target === deleteModalEl) closeDeleteModal();
    });
  }
  if (deleteSubmit) deleteSubmit.addEventListener("click", confirmDeleteRole);

  function positionMenu(btn) {
    if (!roleMenu) return;
    /* Double rAF: menu content must layout before offsetHeight is reliable (last row / zoom). */
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        if (!roleMenu || roleMenu.hidden) return;
        roleMenu.style.position = "fixed";
        roleMenu.style.maxHeight = "";
        roleMenu.style.overflowY = "";

        var br = btn.getBoundingClientRect();
        var gap = 4;
        var pad = 8;
        var vh = window.innerHeight;
        var vw = window.innerWidth;

        var mw = roleMenu.offsetWidth || 220;
        var mh = roleMenu.offsetHeight;

        var topBelow = br.bottom + gap;
        var maxHBelow = Math.max(0, vh - pad - topBelow);
        var maxHAbove = Math.max(0, br.top - gap - pad);

        var top;
        if (mh <= maxHBelow) {
          top = topBelow;
        } else if (mh <= maxHAbove) {
          top = br.top - gap - mh;
        } else if (maxHBelow >= maxHAbove) {
          top = topBelow;
          roleMenu.style.maxHeight = Math.max(maxHBelow, 48) + "px";
          roleMenu.style.overflowY = "auto";
        } else {
          top = pad;
          roleMenu.style.maxHeight = Math.max(maxHAbove, 48) + "px";
          roleMenu.style.overflowY = "auto";
        }

        var left = Math.round(br.right - mw);
        left = Math.max(pad, Math.min(left, vw - mw - pad));

        roleMenu.style.top = Math.round(top) + "px";
        roleMenu.style.left = left + "px";
      });
    });
  }

  var tbody = document.getElementById("roles-tbody");

  function getRoleNameFromRolesRow(tr) {
    if (!tr) return "";
    var dn = tr.getAttribute("data-role-name");
    if (dn) return String(dn).trim();
    var link = tr.querySelector(".role-link");
    return link ? link.textContent.trim() : "";
  }

  function updateRolesTableAdminCounts() {
    if (typeof window.getAdminsForRole !== "function") return;
    var tb = document.getElementById("roles-tbody");
    if (tb) {
      tb.querySelectorAll("tr").forEach(function (tr) {
        var name = getRoleNameFromRolesRow(tr);
        if (!name) return;
        var tdNum = tr.querySelector(".td-num");
        if (!tdNum) return;
        tdNum.textContent = String(window.getAdminsForRole(name).length);
      });
    }
    var adBadge = document.getElementById("administrators-tab-badge");
    if (adBadge && Array.isArray(window.sophosProtoRoleAdmins)) {
      adBadge.textContent = String(window.sophosProtoRoleAdmins.length);
    }
  }

  window.sophosProtoUpdateRolesTableAdminCounts = updateRolesTableAdminCounts;

  if (tbody && roleMenu) {
    tbody.addEventListener("click", function (e) {
      var btn = e.target.closest(".role-kebab");
      if (!btn || !tbody.contains(btn)) return;
      e.stopPropagation();
      var row = btn.closest("tr");
      if (!row) return;
      var roleName = row.querySelector(".role-link")
        ? row.querySelector(".role-link").textContent.trim()
        : "Role";
      var type = row.getAttribute("data-role-type") || "predefined";

      if (openKebabBtn === btn && !roleMenu.hidden) {
        closeRoleMenu();
        return;
      }

      closeRoleMenu();
      roleMenu.innerHTML =
        type === "custom" ? menuHtmlCustom(roleName) : menuHtmlPredefined(roleName);
      roleMenu.hidden = false;
      roleMenu.setAttribute("aria-hidden", "false");
      openKebabBtn = btn;
      btn.setAttribute("aria-expanded", "true");
      positionMenu(btn);

      roleMenu.querySelectorAll(".role-menu__item").forEach(function (item) {
        item.addEventListener("click", function (ev) {
          var action = item.getAttribute("data-action");
          if (action === "delete") {
            ev.stopPropagation();
            closeRoleMenu();
            openDeleteRoleModal(roleName, row);
            return;
          }
          if (action === "clone") {
            ev.stopPropagation();
            closeRoleMenu();
            window.location.href =
              "add-role.html?clone=" + encodeURIComponent(roleName);
            return;
          }
          closeRoleMenu();
        });
      });
    });

    tbody.addEventListener("click", function (e) {
      var link = e.target.closest(".role-link");
      if (!link || !tbody.contains(link)) return;
      var tr = link.closest("tr");
      if (tr && tr.getAttribute("data-role-type") === "custom") return;
      var href = link.getAttribute("href") || "";
      if (href && href !== "#" && href.indexOf("edit-predefined-role.html") !== -1) return;
      e.preventDefault();
    });
  }

  window.addEventListener("resize", function () {
    if (openKebabBtn && roleMenu && !roleMenu.hidden) positionMenu(openKebabBtn);
  });
  window.addEventListener(
    "scroll",
    function () {
      if (openKebabBtn && roleMenu && !roleMenu.hidden) positionMenu(openKebabBtn);
    },
    true
  );

  document.addEventListener("click", function () {
    closeRoleMenu();
    closeModalCloneDdMenu();
  });

  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    if (deleteModalEl && !deleteModalEl.hidden) {
      closeDeleteModal();
      e.preventDefault();
      return;
    }
    closeRoleMenu();
    closeModalCloneDdMenu();
  });

  var searchInput = document.getElementById("role-search");
  if (searchInput && tbody) {
    searchInput.addEventListener("input", function () {
      var q = searchInput.value.trim().toLowerCase();
      tbody.querySelectorAll("tr").forEach(function (tr) {
        var text = tr.textContent.toLowerCase();
        tr.hidden = q && text.indexOf(q) === -1;
      });
    });
  }

  var sortState = { col: null, dir: 1 };

  function clearSortClasses() {
    document.querySelectorAll(".th-sort").forEach(function (th) {
      th.classList.remove("th-sort--asc", "th-sort--desc");
    });
  }

  function sortRows(col) {
    if (!tbody) return;
    var rows = Array.prototype.slice.call(tbody.querySelectorAll("tr"));
    if (sortState.col === col) sortState.dir = -sortState.dir;
    else {
      sortState.col = col;
      sortState.dir = 1;
    }
    clearSortClasses();
    var th = document.querySelector('.th-sort[data-sort="' + col + '"]');
    if (th) th.classList.add(sortState.dir > 0 ? "th-sort--asc" : "th-sort--desc");

    rows.sort(function (a, b) {
      var va, vb;
      if (col === "name") {
        va = (a.querySelector(".role-link") || a.cells[0]).textContent.trim().toLowerCase();
        vb = (b.querySelector(".role-link") || b.cells[0]).textContent.trim().toLowerCase();
      } else {
        va = parseInt(a.cells[1].textContent.trim(), 10) || 0;
        vb = parseInt(b.cells[1].textContent.trim(), 10) || 0;
      }
      if (va < vb) return -sortState.dir;
      if (va > vb) return sortState.dir;
      return 0;
    });
    rows.forEach(function (tr) {
      tbody.appendChild(tr);
    });
  }

  document.querySelectorAll(".th-sort").forEach(function (th) {
    th.addEventListener("click", function () {
      var col = th.getAttribute("data-sort");
      if (col) sortRows(col);
    });
  });

  document.querySelectorAll('.breadcrumbs a[href="#"], .more-info').forEach(function (el) {
    el.addEventListener("click", function (e) {
      e.preventDefault();
    });
  });

  var modal = document.getElementById("add-role-modal");
  var backdrop = document.getElementById("add-role-modal-backdrop");
  var openBtn = document.getElementById("add-role-open");
  var cancelBtn = document.getElementById("add-role-modal-cancel");
  var xBtn = document.getElementById("add-role-modal-x");
  var nextBtn = document.getElementById("add-role-modal-next");
  var cloneField = document.getElementById("add-role-modal-clone-field");
  var cloneDd = document.getElementById("add-role-modal-clone-dd");
  var cloneErr = document.getElementById("add-role-modal-clone-error");

  function syncNextEnabled() {
    if (!nextBtn) return;
    nextBtn.disabled = false;
  }

  function openModal() {
    if (modal) modal.hidden = false;
    if (backdrop) backdrop.hidden = false;
    if (cloneDd) {
      cloneModalDdClear(cloneDd);
      var menu = cloneDd.querySelector(".cmp-dd__menu");
      if (menu) fillCloneModalMenu(menu, cloneDd);
    }
    if (cloneErr) {
      cloneErr.hidden = true;
      cloneErr.textContent = "";
    }
    if (cloneField) {
      var cloneRadio = document.querySelector('input[name="add-role-method"][value="clone"]');
      cloneField.hidden = !(cloneRadio && cloneRadio.checked);
    }
    syncNextEnabled();
  }

  function closeModal() {
    if (modal) modal.hidden = true;
    if (backdrop) backdrop.hidden = true;
    closeModalCloneDdMenu();
  }

  initModalCloneDropdown(syncNextEnabled);

  if (openBtn) openBtn.addEventListener("click", openModal);
  if (cancelBtn) cancelBtn.addEventListener("click", closeModal);
  if (xBtn) xBtn.addEventListener("click", closeModal);
  if (backdrop) backdrop.addEventListener("click", closeModal);

  document.querySelectorAll('input[name="add-role-method"]').forEach(function (r) {
    r.addEventListener("change", function () {
      if (r.value === "clone") {
        if (cloneField) cloneField.hidden = false;
        if (cloneDd) {
          var menu = cloneDd.querySelector(".cmp-dd__menu");
          if (menu) fillCloneModalMenu(menu, cloneDd);
        }
      } else {
        if (cloneField) cloneField.hidden = true;
        if (cloneDd) cloneModalDdClear(cloneDd);
        if (cloneErr) {
          cloneErr.hidden = true;
          cloneErr.textContent = "";
        }
      }
      syncNextEnabled();
    });
  });
  syncNextEnabled();

  function buildAddRoleNavigateUrl(cloneUrlName) {
    var ret = document.body && document.body.getAttribute("data-add-role-return");
    var qs = [];
    if (cloneUrlName) qs.push("clone=" + encodeURIComponent(cloneUrlName));
    if (ret) qs.push("return=" + encodeURIComponent(ret));
    if (!qs.length) return "add-role.html";
    return "add-role.html?" + qs.join("&");
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", function () {
      var custom = document.querySelector('input[name="add-role-method"][value="custom"]');
      if (custom && custom.checked) {
        window.location.href = buildAddRoleNavigateUrl(null);
        return;
      }
      var clone = document.querySelector('input[name="add-role-method"][value="clone"]');
      if (clone && clone.checked) {
        var urlName = cloneDd && cloneDd.getAttribute("data-clone-url-name");
        if (!urlName) {
          if (cloneErr) {
            cloneErr.textContent = "Required";
            cloneErr.hidden = false;
          }
          return;
        }
        if (cloneErr) {
          cloneErr.hidden = true;
          cloneErr.textContent = "";
        }
        window.location.href = buildAddRoleNavigateUrl(urlName);
      }
    });
  }

  updateRolesTableAdminCounts();

  try {
    var msg = sessionStorage.getItem("sophosProtoToastMessage");
    if (msg) sessionStorage.removeItem("sophosProtoToastMessage");
    if (!msg) {
      var legacy = sessionStorage.getItem("sophosProtoRoleSavedToast");
      if (legacy === "1") {
        sessionStorage.removeItem("sophosProtoRoleSavedToast");
        msg = "Role saved";
      }
    }
    if (msg) showSuccessToast(msg);
  } catch (err) {
    /* ignore */
  }
})();
