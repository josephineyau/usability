(function () {
  "use strict";

  var KEY = "sophosProtoCustomRoleNames";
  var ROLE_DATA_KEY = "sophosProtoCustomRoleData";
  var DEFAULT_ROLE_DESCRIPTION = "Custom role for your organization.";

  /* Same rules as getDescriptionForRole in add-role.js */
  function getDescForRole(name) {
    try {
      var map = JSON.parse(localStorage.getItem(ROLE_DATA_KEY) || "{}");
      var r = map[name];
      if (r && r.description && String(r.description).trim()) {
        return String(r.description).trim();
      }
    } catch (e) {
      /* ignore */
    }
    return DEFAULT_ROLE_DESCRIPTION;
  }

  function createCustomRoleRow(name) {
    var tr = document.createElement("tr");
    tr.setAttribute("data-role-type", "custom");
    tr.setAttribute("data-role-name", name);

    var tdName = document.createElement("td");
    var a = document.createElement("a");
    a.href = "edit-role.html?role=" + encodeURIComponent(name);
    a.className = "role-link";
    a.textContent = name;
    a.setAttribute("title", name);
    tdName.appendChild(a);

    var tdNum = document.createElement("td");
    tdNum.className = "td-num";
    tdNum.textContent = "0";

    var tdType = document.createElement("td");
    var span = document.createElement("span");
    span.className = "type-cell type-cell--custom";
    span.textContent = "Custom";
    tdType.appendChild(span);

    var tdDesc = document.createElement("td");
    tdDesc.className = "td-desc";
    var descText = getDescForRole(name);
    tdDesc.textContent = descText;
    tdDesc.setAttribute("title", descText);

    var tdKebab = document.createElement("td");
    tdKebab.className = "td-kebab";
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "kebab-btn role-kebab";
    btn.setAttribute("aria-label", "More options for " + name);
    btn.setAttribute("aria-expanded", "false");
    btn.setAttribute("aria-haspopup", "true");
    tdKebab.appendChild(btn);

    tr.appendChild(tdName);
    tr.appendChild(tdNum);
    tr.appendChild(tdType);
    tr.appendChild(tdDesc);
    tr.appendChild(tdKebab);

    return tr;
  }

  /* Legacy names to hide if present in old localStorage (optional). */
  var removedCustomNames = { "Tier 2 helpdesk": true };

  function filterMergedNames(arr) {
    return (arr || []).filter(function (n) {
      return n && !removedCustomNames[n];
    });
  }

  /**
   * Rebuild custom role rows from localStorage (authoritative).
   * Used after delete, and when another tab updates storage.
   */
  function syncCustomRolesTbodyFromLocalStorage() {
    var tb = document.getElementById("roles-tbody");
    if (!tb) return;

    var merged = [];
    try {
      merged = JSON.parse(localStorage.getItem(KEY) || "[]");
    } catch (e) {
      merged = [];
    }
    if (!Array.isArray(merged)) merged = [];
    merged = filterMergedNames(merged);
    merged.sort(function (a, b) {
      return a.localeCompare(b, undefined, { sensitivity: "base" });
    });

    var lastPre = null;
    tb.querySelectorAll('tr[data-role-type="predefined"]').forEach(function (tr) {
      lastPre = tr;
    });
    if (!lastPre) return;

    tb.querySelectorAll('tr[data-role-type="custom"]').forEach(function (tr) {
      tr.remove();
    });

    var frag = document.createDocumentFragment();
    merged.forEach(function (name) {
      var tr = createCustomRoleRow(name);
      var tdDesc = tr.querySelector(".td-desc");
      if (tdDesc) {
        var d = getDescForRole(name);
        tdDesc.textContent = d;
        tdDesc.setAttribute("title", d);
      }
      frag.appendChild(tr);
    });
    lastPre.after(frag);
    if (typeof window.sophosProtoUpdateRolesTableAdminCounts === "function") {
      window.sophosProtoUpdateRolesTableAdminCounts();
    }
  }

  window.sophosProtoSyncCustomRolesFromStorage = syncCustomRolesTbodyFromLocalStorage;

  var tbody = document.getElementById("roles-tbody");
  if (!tbody) {
    return;
  }

  var fromLs = [];
  try {
    fromLs = JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch (e) {
    fromLs = [];
  }
  if (!Array.isArray(fromLs)) fromLs = [];

  /* localStorage is authoritative — do not merge in names from static HTML.
     Otherwise a hardcoded demo row re-seeds storage after delete + refresh. */
  var existingCustom = tbody.querySelectorAll('tr[data-role-type="custom"]');
  var rowByName = new Map();
  existingCustom.forEach(function (tr) {
    var n = tr.getAttribute("data-role-name");
    if (!n) return;
    rowByName.set(n, tr);
  });

  var merged = [];
  var seen = Object.create(null);
  fromLs.forEach(function (n) {
    if (n && !seen[n]) {
      seen[n] = true;
      merged.push(n);
    }
  });

  merged = filterMergedNames(merged);

  merged.sort(function (a, b) {
    return a.localeCompare(b, undefined, { sensitivity: "base" });
  });

  localStorage.setItem(KEY, JSON.stringify(merged));

  var lastPre = null;
  tbody.querySelectorAll('tr[data-role-type="predefined"]').forEach(function (tr) {
    lastPre = tr;
  });
  if (!lastPre) return;

  tbody.querySelectorAll('tr[data-role-type="custom"]').forEach(function (tr) {
    tr.remove();
  });

  var frag = document.createDocumentFragment();
  merged.forEach(function (name) {
    var tr = rowByName.get(name) || createCustomRoleRow(name);
    var tdDesc = tr.querySelector(".td-desc");
    if (tdDesc) {
      var d = getDescForRole(name);
      tdDesc.textContent = d;
      tdDesc.setAttribute("title", d);
    }
    frag.appendChild(tr);
  });
  lastPre.after(frag);

  window.addEventListener("storage", function (e) {
    if (e.key === KEY || e.key === ROLE_DATA_KEY) {
      syncCustomRolesTbodyFromLocalStorage();
    }
  });
})();
