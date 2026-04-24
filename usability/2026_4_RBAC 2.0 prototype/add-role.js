(function () {
  "use strict";

  var _SP = window.sophosProtoPermissions;
  if (
    !_SP ||
    !_SP.GROUPS ||
    !_SP.featureByRef ||
    !_SP.compareAllowed ||
    !_SP.annotateTreePositions ||
    !_SP.featureAllowedFromSavedGroupState
  ) {
    console.error("Load permissions-data.js before add-role.js");
    return;
  }
  var GROUPS = _SP.GROUPS;
  var featureByRef = _SP.featureByRef;
  var compareAllowed = _SP.compareAllowed;
  var annotateTreePositions = _SP.annotateTreePositions;
  var featureAllowedFromSavedGroupState = _SP.featureAllowedFromSavedGroupState;

  var LS_CUSTOM_NAMES = "sophosProtoCustomRoleNames";
  var LS_ROLE_DATA = "sophosProtoCustomRoleData";

  function customRoleExistsInStorage(name) {
    try {
      var cur = JSON.parse(localStorage.getItem(LS_CUSTOM_NAMES) || "[]");
      if (!Array.isArray(cur)) return false;
      return cur.indexOf(name) !== -1;
    } catch (e) {
      return false;
    }
  }

  var NAME_TO_PREDEFINED_KEY = {
    "Super Admin": "super-admin",
    Admin: "admin",
    Responder: "responder",
    "Help Desk": "help-desk",
    "Security Analyst": "analyst",
    "Read-only": "read-only",
  };

  function nameToPredefinedKey(displayName) {
    return NAME_TO_PREDEFINED_KEY[displayName] || null;
  }

  function normalizeRoleName(s) {
    return String(s || "")
      .trim()
      .toLowerCase();
  }

  function roleNameIsTaken(name, excludeWhenEditing) {
    var n = normalizeRoleName(name);
    if (!n) return false;
    var ex = excludeWhenEditing ? normalizeRoleName(excludeWhenEditing) : "";
    if (ex && n === ex) return false;
    var k;
    for (k in NAME_TO_PREDEFINED_KEY) {
      if (Object.prototype.hasOwnProperty.call(NAME_TO_PREDEFINED_KEY, k)) {
        if (normalizeRoleName(k) === n) return true;
      }
    }
    try {
      var raw = localStorage.getItem(LS_CUSTOM_NAMES);
      var arr = JSON.parse(raw || "[]");
      if (!Array.isArray(arr)) return false;
      var i;
      for (i = 0; i < arr.length; i++) {
        if (normalizeRoleName(arr[i]) === n) return true;
      }
    } catch (e) {
      return false;
    }
    return false;
  }

  var PREDEFINED_ROLE_COPY = {
    "Super Admin": {
      short:
        "The Super Admin role is a pre-defined role that has access to everything in Sophos Central.",
      long:
        "The Super Admin role is a pre-defined role that has access to everything in Sophos Central.",
    },
    Admin: {
      short:
        "The Admin role is a pre-defined role that has access to almost everything like the Super Admin except the ability to manage roles and role assignments.",
      long:
        "The Admin role is a pre-defined role that has access to almost everything like the Super Admin except the ability to manage roles and role assignments.",
    },
    Responder: {
      short:
        "The Partner Responder role allows the admin to remedy threats from within Sophos Central Partner and Sophos Central Admin. Placeholder text... TBD.",
      long:
        "The Partner Responder role allows the admin to remedy threats from within Sophos Central Partner and Sophos Central Admin. Placeholder text... TBD.",
    },
    "Help Desk": {
      short:
        "The Help Desk role is a pre-defined role that allows the admin to take certain administrative actions.",
      long:
        "The Help Desk role is a pre-defined role that allows the admin to take certain administrative actions.",
      cloneDesc:
        "The Help Desk role is a pre-defined role that allows the admin to take certain administrative actions.",
    },
    "Security Analyst": {
      short:
        "The Partner Analyst role allows the admin to analyze security incidents from within Sophos Central Partner and Sophos Central Admin. Placeholder text... TBD.",
      long:
        "The Partner Analyst role allows the admin to analyze security incidents from within Sophos Central Partner and Sophos Central Admin. Placeholder text... TBD.",
    },
    "Read-only": {
      short:
        "The Read-only role is a pre-defined role that has read-only access to everything in Sophos Central.",
      long:
        "The Read-only role is a pre-defined role that has read-only access to everything in Sophos Central.",
    },
  };

  var PAGE_KIND = document.body.getAttribute("data-role-page") || "add";
  var ORIGINAL_ROLE_NAME = null;
  var PREDEFINED_EDIT_KEY = null;
  var CLONE_SOURCE_NAME = null;

  var urlParams = new URLSearchParams(window.location.search);

  function getRolesLandingUrl() {
    var r = urlParams.get("return");
    if (r === "permissions-matrix") return "permissions-matrix.html";
    return "index.html";
  }

  if (PAGE_KIND === "add") {
    var cloneQ = urlParams.get("clone");
    if (cloneQ && String(cloneQ).trim()) {
      var cn = String(cloneQ).trim();
      if (nameToPredefinedKey(cn) || customRoleExistsInStorage(cn)) {
        CLONE_SOURCE_NAME = cn;
      } else {
        window.location.replace("add-role.html");
        return;
      }
    }
  }

  if (PAGE_KIND === "edit") {
    var roleParam = urlParams.get("role");
    if (!roleParam || !String(roleParam).trim()) {
      window.location.replace("index.html");
      return;
    }
    roleParam = String(roleParam).trim();
    if (!customRoleExistsInStorage(roleParam)) {
      window.location.replace("index.html");
      return;
    }
    ORIGINAL_ROLE_NAME = roleParam;
  }

  if (PAGE_KIND === "predefined-edit") {
    var roleParamPre = urlParams.get("role");
    if (!roleParamPre || !String(roleParamPre).trim()) {
      window.location.replace("index.html");
      return;
    }
    roleParamPre = String(roleParamPre).trim();
    PREDEFINED_EDIT_KEY = nameToPredefinedKey(roleParamPre);
    if (!PREDEFINED_EDIT_KEY) {
      window.location.replace("index.html");
      return;
    }
    ORIGINAL_ROLE_NAME = roleParamPre;
  }

  var CMP_PREDEFINED = [
    { value: "super-admin", label: "Super Admin" },
    { value: "admin", label: "Admin" },
    { value: "responder", label: "Responder" },
    { value: "help-desk", label: "Help Desk" },
    { value: "analyst", label: "Security Analyst" },
    { value: "read-only", label: "Read-only" },
  ];

  var DD_OPTIONS = [
    { value: "super-admin", label: "Super Admin" },
    { value: "admin", label: "Admin" },
    { value: "help-desk", label: "Help Desk" },
    { value: "read-only", label: "Read-only" },
    { sep: true },
    { value: "custom", label: "Custom" },
    { value: "none", label: "None", none: true },
  ];

  function esc(s) {
    var d = document.createElement("div");
    d.textContent = s;
    return d.innerHTML;
  }

  function escAttr(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function compareDenyXSvg() {
    return (
      '<svg class="perm-x-icon" width="12" height="12" viewBox="0 0 12 12" aria-hidden="true" focusable="false">' +
      '<path d="M3 3l6 6M9 3l-6 6" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round"/>' +
      "</svg>"
    );
  }

  function predefinedLabelForKey(key) {
    var j;
    for (j = 0; j < CMP_PREDEFINED.length; j += 1) {
      if (CMP_PREDEFINED[j].value === key) return CMP_PREDEFINED[j].label;
    }
    return key;
  }

  function actualYesForCloneKey(f, cloneKey) {
    return compareAllowed({ type: "predefined", key: cloneKey }, f) === "yes";
  }

  function expectedYesForPreset(presetKey, f) {
    if (presetKey === "none") return false;
    if (presetKey === "super-admin" || presetKey === "admin") return true;
    if (presetKey === "read-only") return !!f.ro;
    if (presetKey === "help-desk") return f.a === "yes";
    if (presetKey === "responder") return f.b === "yes";
    if (presetKey === "analyst") {
      return (f.aa !== undefined ? f.aa : f.a) === "yes";
    }
    return false;
  }

  function presetMatchesGroup(g, cloneKey, presetKey) {
    var i;
    for (i = 0; i < g.features.length; i += 1) {
      var f = g.features[i];
      if (f.subsection) continue;
      if (expectedYesForPreset(presetKey, f) !== actualYesForCloneKey(f, cloneKey)) {
        return false;
      }
    }
    return true;
  }

  function inferGroupDropdownForPredefinedClone(g, cloneKey) {
    if (presetMatchesGroup(g, cloneKey, "none")) return "none";
    if (presetMatchesGroup(g, cloneKey, "read-only")) return "read-only";
    if (
      (cloneKey === "super-admin" || cloneKey === "admin") &&
      presetMatchesGroup(g, cloneKey, "super-admin")
    ) {
      return cloneKey;
    }
    if (cloneKey === "help-desk" && presetMatchesGroup(g, cloneKey, "help-desk")) {
      return "help-desk";
    }
    if (presetMatchesGroup(g, cloneKey, "help-desk")) return "help-desk";
    if (cloneKey === "responder" && presetMatchesGroup(g, cloneKey, "responder")) {
      return "responder";
    }
    if (presetMatchesGroup(g, cloneKey, "responder")) return "responder";
    if (cloneKey === "analyst" && presetMatchesGroup(g, cloneKey, "analyst")) {
      return "analyst";
    }
    if (presetMatchesGroup(g, cloneKey, "analyst")) return "analyst";
    var any = false;
    for (var i = 0; i < g.features.length; i += 1) {
      var f2 = g.features[i];
      if (f2.subsection) continue;
      if (actualYesForCloneKey(f2, cloneKey)) any = true;
    }
    if (!any) return "none";
    return "custom";
  }

  function buildPermissionsFromPredefinedCloneKey(cloneKey) {
    var uniformPresetKeys = ["super-admin", "admin", "help-desk", "read-only"];
    if (uniformPresetKeys.indexOf(cloneKey) !== -1) {
      var groupsUniform = {};
      GROUPS.forEach(function (g) {
        groupsUniform[g.id] = { v: cloneKey };
      });
      return { groups: groupsUniform };
    }
    var groups = {};
    GROUPS.forEach(function (g) {
      var inferred = inferGroupDropdownForPredefinedClone(g, cloneKey);
      var gstate = { v: inferred };
      if (inferred === "custom") {
        gstate.cbs = {};
        g.features.forEach(function (f, fi) {
          if (f.subsection) return;
          var ref = g.id + ":" + fi;
          gstate.cbs[ref] = actualYesForCloneKey(f, cloneKey);
        });
      }
      groups[g.id] = gstate;
    });
    return { groups: groups };
  }

  function getCompareSpecAndLabelForClone(displayName) {
    var pk = nameToPredefinedKey(displayName);
    if (pk) {
      return {
        spec: { type: "predefined", key: pk },
        label: predefinedLabelForKey(pk),
      };
    }
    return { spec: { type: "custom", name: displayName }, label: displayName };
  }

  function getCustomRoleNamesSorted() {
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

  function compareCell(col) {
    return (
      '<td class="perm-compare" data-cmp-col="' +
      col +
      '"><span class="perm-compare-inner perm-compare-inner--empty"></span></td>'
    );
  }

  function compareGroupCell(col) {
    return (
      '<td class="perm-compare perm-compare--group" data-cmp-col="' +
      col +
      '"><span class="perm-compare-summary"></span></td>'
    );
  }

  function emptyTailCell() {
    return '<td class="perm-td-tail" aria-hidden="true"></td>';
  }

  function subsectionPermCell() {
    return '<td class="perm-td-perm-empty"></td>';
  }

  var GROUP_TOGGLE_SVG =
    '<svg class="perm-group-toggle__icon" width="12" height="12" viewBox="0 0 12 12" aria-hidden="true" focusable="false"><path d="M3 4.5L6 7.5L9 4.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  function treeConnectorAssetSrc(pos) {
    if (pos === "first") return "assets/___rb2_connect_last.svg";
    if (pos === "mid") return "assets/___rb2_connector_middle.svg";
    if (pos === "last") return "assets/___rb2_connect_first.svg";
    return "assets/___rb2_connector_middle.svg";
  }

  var PERM_MANAGE_DIRECTORY_INFO_SVG =
    '<svg class="info-icon-svg" width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" focusable="false"><circle cx="7" cy="7" r="7" fill="currentColor"/><rect x="6.25" y="6" width="1.5" height="4.75" fill="#fff" rx="0.5"/><rect x="6.25" y="3.1" width="1.5" height="1.5" fill="#fff" rx="0.75"/></svg>';

  function permFeatureLabelHtml(f, label, titleAttr, subsectionClass) {
    var cls = "perm-tree__label";
    if (subsectionClass) cls += " " + subsectionClass;
    if (f.n === "Manage directory") {
      return (
        '<span class="' +
        cls +
        ' perm-tree__label--with-info"' +
        titleAttr +
        '><span class="perm-tree__label-text">' +
        label +
        "</span>" +
        PERM_MANAGE_DIRECTORY_INFO_SVG +
        "</span>"
      );
    }
    return '<span class="' + cls + '"' + titleAttr + ">" + label + "</span>";
  }

  function featureNameCellHtml(f) {
    var label = esc(f.n);
    var titleAttr = ' title="' + escAttr(f.n) + '"';
    if (f.subsection) {
      return (
        '<td class="perm-name-cell perm-name-cell--subsection">' +
        permFeatureLabelHtml(f, label, titleAttr, "perm-tree__label--subsection") +
        "</td>"
      );
    }
    if (f.subitem) {
      return (
        '<td class="perm-name-cell perm-name-cell--subitem">' +
        permFeatureLabelHtml(f, label, titleAttr, null) +
        "</td>"
      );
    }
    if (f.treeChild) {
      var pos = f.treePos || "solo";
      var runLen = f.treeRunLength || 1;
      if (runLen >= 2) {
        return (
          '<td class="perm-name-cell perm-name-cell--tree">' +
          '<img class="perm-tree__connector" src="' +
          escAttr(treeConnectorAssetSrc(pos)) +
          '" alt="" width="23" height="36" decoding="async" aria-hidden="true" />' +
          '<div class="perm-tree perm-tree--lined perm-tree--rb2-feature">' +
          permFeatureLabelHtml(f, label, titleAttr, null) +
          "</div></td>"
        );
      }
      return (
        '<td class="perm-name-cell perm-name-cell--tree">' +
        '<span class="perm-tree__guide perm-tree__guide--solo" aria-hidden="true"></span>' +
        '<div class="perm-tree perm-tree--lined">' +
        permFeatureLabelHtml(f, label, titleAttr, null) +
        "</div></td>"
      );
    }
    return '<td class="perm-name-cell">' + permFeatureLabelHtml(f, label, titleAttr, null) + "</td>";
  }

  function groupPermSummaryForTbody(tbody, key) {
    var spec = { type: "predefined", key: key };
    var yes = 0;
    var no = 0;
    tbody.querySelectorAll("tr.perm-feature-row").forEach(function (tr) {
      if (tr.getAttribute("data-subsection") === "true") return;
      var ref = tr.getAttribute("data-feature-ref");
      if (!ref) return;
      var f = featureByRef(ref);
      var v = compareAllowed(spec, f);
      if (v === "yes") yes += 1;
      else if (v === "no") no += 1;
    });
    if (yes + no === 0) return "";
    if (no === 0) return "All";
    if (yes === 0) return "None";
    return "Partial";
  }

  function predefinedPermTdHtml(f) {
    var spec = { type: "predefined", key: PREDEFINED_EDIT_KEY };
    var v = compareAllowed(spec, f);
    if (v === "yes") {
      return (
        '<td class="perm-td-perm-icon"><span class="perm-compare-inner perm-compare--yes" title="Granted">✓</span></td>'
      );
    }
    if (v === "no") {
      return (
        '<td class="perm-td-perm-icon"><span class="perm-compare-inner perm-compare--no" title="Not granted">' +
        compareDenyXSvg() +
        "</span></td>"
      );
    }
    return '<td class="perm-td-perm-icon"><span class="perm-compare-inner perm-compare-inner--empty"></span></td>';
  }

  function dropdownHtml() {
    var items = DD_OPTIONS.map(function (o) {
      if (o.sep) {
        return '<div class="perm-dd__sep" role="separator"></div>';
      }
      var cls = "perm-dd__item";
      if (o.none) cls += " perm-dd__item--none";
      if (o.value === "none") cls += " perm-dd__item--sel";
      return (
        '<button type="button" class="' +
        cls +
        '" role="option" data-value="' +
        o.value +
        '" data-label="' +
        esc(o.label) +
        '" data-none="' +
        (o.none ? "1" : "") +
        '">' +
        esc(o.label) +
        "</button>"
      );
    }).join("");
    return (
      '<div class="perm-dd" data-perm-dd data-current-value="none">' +
      '<button type="button" class="perm-dd__trigger" aria-expanded="false" aria-haspopup="listbox">' +
      '<span class="perm-dd__label perm-dd__value--none">None</span>' +
      '<span class="perm-dd__chev" aria-hidden="true">▼</span>' +
      "</button>" +
      '<div class="perm-dd__menu" role="listbox" hidden>' +
      items +
      "</div>" +
      "</div>"
    );
  }

  function renderPermissionsTable() {
    var table = document.getElementById("perm-table");
    if (!table) return;
    var frag = document.createDocumentFragment();
    GROUPS.forEach(function (g) {
      var tbody = document.createElement("tbody");
      tbody.className = "perm-group";
      tbody.dataset.permGroup = g.id;
      tbody.id = "perm-group-" + g.id;

      annotateTreePositions(g.features);

      var trCat = document.createElement("tr");
      trCat.className = "perm-cat-row";
      var permCatTd =
        PREDEFINED_EDIT_KEY
          ? '<td class="perm-td-perm-summary"><span class="perm-compare-summary" data-perm-summary></span></td>'
          : "<td>" + dropdownHtml() + "</td>";
      trCat.innerHTML =
        '<td class="perm-cat-row__name-td">' +
        '<div class="perm-cat-row__cell">' +
        '<button type="button" class="perm-group-toggle" aria-expanded="true" aria-controls="perm-group-' +
        escAttr(g.id) +
        '" id="perm-group-btn-' +
        escAttr(g.id) +
        '">' +
        GROUP_TOGGLE_SVG +
        "</button>" +
        '<span class="perm-cat-row__title" title="' +
        escAttr(g.name) +
        '">' +
        esc(g.name) +
        "</span></div></td>" +
        permCatTd +
        compareGroupCell(0) +
        compareGroupCell(1) +
        emptyTailCell();
      tbody.appendChild(trCat);

      g.features.forEach(function (f, fi) {
        var tr = document.createElement("tr");
        tr.className = "perm-feature-row";
        if (f.subsection) tr.classList.add("perm-feature-row--subsection");
        if (f.subitem) tr.classList.add("perm-feature-row--subitem");
        if (f.treeChild) tr.classList.add("perm-feature-row--tree");
        if (f.subsection) {
          tr.setAttribute("data-subsection", "true");
          tr.innerHTML =
            featureNameCellHtml(f) +
            subsectionPermCell() +
            compareCell(0) +
            compareCell(1) +
            emptyTailCell();
        } else {
          tr.dataset.featureRef = g.id + ":" + fi;
          if (PREDEFINED_EDIT_KEY) {
            tr.innerHTML =
              featureNameCellHtml(f) +
              predefinedPermTdHtml(f) +
              compareCell(0) +
              compareCell(1) +
              emptyTailCell();
          } else {
            var roAttr = f.ro ? ' data-readonly="true"' : "";
            tr.innerHTML =
              featureNameCellHtml(f) +
              '<td><input type="checkbox" class="perm-cb"' +
              roAttr +
              " /></td>" +
              compareCell(0) +
              compareCell(1) +
              emptyTailCell();
          }
        }
        tbody.appendChild(tr);
      });
      if (PREDEFINED_EDIT_KEY) {
        var sumEl = trCat.querySelector("[data-perm-summary]");
        if (sumEl) sumEl.textContent = groupPermSummaryForTbody(tbody, PREDEFINED_EDIT_KEY);
      }
      frag.appendChild(tbody);
    });
    table.appendChild(frag);
  }

  /**
   * Alerts: "Manage alert notifications" (general:5) forces "View alerts" (general:6) on and locks it.
   * Unchecking the former clears the latter; in Custom only, view can still be checked alone.
   * When the parent category is not Custom (e.g. None), do not re-enable view — applyPermissionToGroup owns disabled.
   */
  var ALERT_TAKE_ACTION_REF = "general:5";
  var ALERT_READ_REF = "general:6";

  function getPermCheckboxForRef(tbody, ref) {
    var tr = tbody.querySelector('tr[data-feature-ref="' + ref + '"]');
    return tr ? tr.querySelector(".perm-cb") : null;
  }

  function parsePermFeatureRef(ref) {
    if (!ref) return null;
    var i = ref.indexOf(":");
    if (i < 0) return null;
    return { gid: ref.slice(0, i), fi: parseInt(ref.slice(i + 1), 10) };
  }

  function getPermGroupById(gid) {
    var gi;
    for (gi = 0; gi < GROUPS.length; gi++) {
      if (GROUPS[gi].id === gid) return GROUPS[gi];
    }
    return null;
  }

  /**
   * Linked tree rows (treeChild): when the first row in a run is checked, rows below
   * in the same run are checked and disabled; when it is unchecked, rows below are
   * enabled (and cleared only on direct user toggle — see listener). If the first row
   * is unchecked, the user may still check lower rows alone.
   */
  function syncLinkedTreeCheckboxes(tbody) {
    if (!tbody) return;
    var ddGate = tbody.querySelector("[data-perm-dd]");
    if (!ddGate || (ddGate.dataset.currentValue || "none") !== "custom") return;
    var gid = tbody.dataset.permGroup;
    if (!gid) return;
    var g = getPermGroupById(gid);
    if (!g || !g.features) return;
    var feats = g.features;
    var fi;
    for (fi = 0; fi < feats.length; fi++) {
      var f = feats[fi];
      if (!f.treeChild || f.treePos !== "first" || !f.treeRunLength || f.treeRunLength < 2) {
        continue;
      }
      var firstRef = gid + ":" + fi;
      var firstCb = getPermCheckboxForRef(tbody, firstRef);
      if (!firstCb) continue;
      var locked = firstCb.disabled;
      var j;
      if (firstCb.checked) {
        for (j = 1; j < f.treeRunLength; j++) {
          var c = getPermCheckboxForRef(tbody, gid + ":" + (fi + j));
          if (!c) continue;
          c.checked = true;
          if (!locked) c.disabled = true;
        }
      } else {
        for (j = 1; j < f.treeRunLength; j++) {
          var c2 = getPermCheckboxForRef(tbody, gid + ":" + (fi + j));
          if (!c2) continue;
          if (!locked) c2.disabled = false;
        }
      }
    }
  }

  function applyLinkedTreeFirstUserToggle(tbody, gid, fi, runLen, isChecked) {
    var j;
    if (isChecked) {
      for (j = 1; j < runLen; j++) {
        var cc = getPermCheckboxForRef(tbody, gid + ":" + (fi + j));
        if (cc) {
          cc.checked = true;
          cc.disabled = true;
        }
      }
    } else {
      for (j = 1; j < runLen; j++) {
        var cc = getPermCheckboxForRef(tbody, gid + ":" + (fi + j));
        if (cc) {
          cc.checked = false;
          cc.disabled = false;
        }
      }
    }
  }

  function syncAlertLinkedCheckboxes(tbody) {
    if (!tbody || tbody.dataset.permGroup !== "general") return;
    var takeCb = getPermCheckboxForRef(tbody, ALERT_TAKE_ACTION_REF);
    var readCb = getPermCheckboxForRef(tbody, ALERT_READ_REF);
    if (!takeCb || !readCb) return;
    if (takeCb.checked) {
      readCb.checked = true;
      readCb.disabled = true;
    } else {
      var ddGate = tbody.querySelector("[data-perm-dd]");
      var mode = ddGate ? ddGate.dataset.currentValue || "none" : "none";
      if (mode === "custom") {
        readCb.disabled = false;
      }
    }
  }

  function initAlertLinkedCheckboxListeners() {
    var table = document.getElementById("perm-table");
    if (!table || PREDEFINED_EDIT_KEY) return;
    table.addEventListener("change", function (e) {
      var t = e.target;
      if (!t || !t.classList || !t.classList.contains("perm-cb")) return;
      var tr = t.closest("tr");
      var ref = tr && tr.getAttribute("data-feature-ref");
      if (!ref) return;
      var tbody = tr.closest("tbody");
      if (!tbody) return;

      var parsed = parsePermFeatureRef(ref);
      if (parsed && !isNaN(parsed.fi) && !t.disabled) {
        var g = getPermGroupById(parsed.gid);
        if (g && g.features[parsed.fi]) {
          var feat = g.features[parsed.fi];
          if (feat.treeChild && feat.treePos === "first" && feat.treeRunLength >= 2) {
            applyLinkedTreeFirstUserToggle(
              tbody,
              parsed.gid,
              parsed.fi,
              feat.treeRunLength,
              t.checked
            );
          }
        }
      }

      if (
        (ref === ALERT_TAKE_ACTION_REF || ref === ALERT_READ_REF) &&
        tbody.dataset.permGroup === "general"
      ) {
        if (ref === ALERT_TAKE_ACTION_REF && !t.checked) {
          var readCb = getPermCheckboxForRef(tbody, ALERT_READ_REF);
          if (readCb) {
            readCb.checked = false;
            readCb.disabled = false;
          }
        } else {
          syncAlertLinkedCheckboxes(tbody);
        }
      }
    });
  }

  function applyPermissionToGroup(tbody, value) {
    var cbs = tbody.querySelectorAll(".perm-feature-row .perm-cb");
    if (value === "super-admin" || value === "admin") {
      cbs.forEach(function (cb) {
        cb.checked = true;
        cb.disabled = true;
      });
    } else if (value === "none") {
      cbs.forEach(function (cb) {
        cb.checked = false;
        cb.disabled = true;
      });
    } else if (value === "custom") {
      cbs.forEach(function (cb) {
        cb.checked = false;
        cb.disabled = false;
      });
    } else if (value === "read-only") {
      cbs.forEach(function (cb) {
        cb.disabled = true;
        cb.checked = cb.hasAttribute("data-readonly");
      });
    } else if (value === "help-desk") {
      cbs.forEach(function (cb) {
        var tr = cb.closest("tr");
        var f = featureByRef(tr && tr.getAttribute("data-feature-ref"));
        cb.disabled = true;
        if (!f) {
          cb.checked = false;
          return;
        }
        cb.checked = f.a === "yes";
      });
    } else if (value === "responder") {
      cbs.forEach(function (cb) {
        var tr = cb.closest("tr");
        var f = featureByRef(tr && tr.getAttribute("data-feature-ref"));
        cb.disabled = true;
        if (!f) {
          cb.checked = false;
          return;
        }
        cb.checked = f.b === "yes";
      });
    } else if (value === "analyst") {
      cbs.forEach(function (cb) {
        var tr = cb.closest("tr");
        var f = featureByRef(tr && tr.getAttribute("data-feature-ref"));
        cb.disabled = true;
        if (!f) {
          cb.checked = false;
          return;
        }
        cb.checked = (f.aa !== undefined ? f.aa : f.a) === "yes";
      });
    }
    syncLinkedTreeCheckboxes(tbody);
    syncAlertLinkedCheckboxes(tbody);
  }

  function updateTrigger(dd, value, label, isNone) {
    var labelEl = dd.querySelector(".perm-dd__label");
    if (!labelEl) return;
    labelEl.textContent = label;
    if (isNone) {
      labelEl.removeAttribute("title");
    } else {
      labelEl.setAttribute("title", label);
    }
    labelEl.classList.toggle("perm-dd__value--none", !!isNone);
    dd.dataset.currentValue = value;
    dd.querySelectorAll(".perm-dd__item").forEach(function (btn) {
      var sel = btn.getAttribute("data-value") === value;
      btn.classList.toggle("perm-dd__item--sel", sel);
    });
  }

  function closeAllDd() {
    document.querySelectorAll(".perm-dd__menu, .cmp-dd__menu").forEach(function (m) {
      m.hidden = true;
    });
    document.querySelectorAll(".perm-dd__trigger").forEach(function (t) {
      t.setAttribute("aria-expanded", "false");
    });
    document.querySelectorAll(".cmp-dd__primary, .cmp-dd__chev-btn").forEach(function (t) {
      t.setAttribute("aria-expanded", "false");
    });
  }

  function initPermissionDropdowns() {
    if (!PREDEFINED_EDIT_KEY) {
      document.querySelectorAll("[data-perm-dd]").forEach(function (dd) {
      var trigger = dd.querySelector(".perm-dd__trigger");
      var menu = dd.querySelector(".perm-dd__menu");
      if (!trigger || !menu) return;

      dd.addEventListener("click", function (e) {
        e.stopPropagation();
      });

      trigger.addEventListener("click", function (e) {
        e.stopPropagation();
        var wasOpen = !menu.hidden;
        closeAllDd();
        if (!wasOpen) {
          menu.hidden = false;
          trigger.setAttribute("aria-expanded", "true");
        }
      });

      menu.querySelectorAll(".perm-dd__item").forEach(function (item) {
        item.addEventListener("click", function (e) {
          e.stopPropagation();
          var value = item.getAttribute("data-value");
          var label = item.getAttribute("data-label") || item.textContent.trim();
          var isNone = item.getAttribute("data-none") === "1";
          updateTrigger(dd, value, label, isNone);
          menu.hidden = true;
          trigger.setAttribute("aria-expanded", "false");
          var tbody = dd.closest("tbody");
          if (tbody) applyPermissionToGroup(tbody, value);
        });
      });
    });
    }

    document.addEventListener("click", function () {
      closeAllDd();
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeAllDd();
    });
  }

  function cmpDdClear(dd) {
    dd.removeAttribute("data-cmp-predef");
    dd.removeAttribute("data-cmp-custom");
    var labelEl = dd.querySelector(".cmp-dd__label");
    var clearBtn = dd.querySelector(".cmp-dd__clear");
    if (labelEl) {
      labelEl.textContent = "Select";
      labelEl.removeAttribute("title");
      labelEl.classList.add("cmp-dd__label--placeholder");
    }
    if (clearBtn) clearBtn.hidden = true;
    var col = parseInt(dd.getAttribute("data-cmp-col"), 10);
    applyCompareColumn(isNaN(col) ? 0 : col, null);
  }

  function cmpDdSetSelection(dd, spec, displayLabel) {
    dd.removeAttribute("data-cmp-predef");
    dd.removeAttribute("data-cmp-custom");
    if (spec.type === "custom") {
      dd.setAttribute("data-cmp-custom", spec.name);
    } else {
      dd.setAttribute("data-cmp-predef", spec.key);
    }
    var labelEl = dd.querySelector(".cmp-dd__label");
    var clearBtn = dd.querySelector(".cmp-dd__clear");
    if (labelEl) {
      labelEl.textContent = displayLabel;
      labelEl.setAttribute("title", displayLabel);
      labelEl.classList.remove("cmp-dd__label--placeholder");
    }
    if (clearBtn) clearBtn.hidden = false;
    var col = parseInt(dd.getAttribute("data-cmp-col"), 10);
    applyCompareColumn(isNaN(col) ? 0 : col, spec);
  }

  function getCompareSpecFromDd(dd) {
    if (!dd) return null;
    var pre = dd.getAttribute("data-cmp-predef");
    if (pre) return { type: "predefined", key: pre };
    var cu = dd.getAttribute("data-cmp-custom");
    if (cu) return { type: "custom", name: cu };
    return null;
  }

  function updateGroupSummariesForColumn(colIndex) {
    var dd = document.querySelector('.cmp-dd[data-cmp-col="' + colIndex + '"]');
    var spec = getCompareSpecFromDd(dd);
    document.querySelectorAll("#perm-table tbody.perm-group").forEach(function (tbody) {
      var catTd = tbody.querySelector('tr.perm-cat-row td[data-cmp-col="' + colIndex + '"]');
      if (!catTd) return;
      var span = catTd.querySelector(".perm-compare-summary");
      if (!span) return;
      if (!spec) {
        span.textContent = "";
        span.removeAttribute("data-summary");
        return;
      }
      var rows = tbody.querySelectorAll("tr.perm-feature-row");
      var yes = 0;
      var no = 0;
      rows.forEach(function (tr) {
        if (tr.getAttribute("data-subsection") === "true") return;
        var ref = tr.getAttribute("data-feature-ref");
        var f = featureByRef(ref);
        var v = compareCellValue(spec, f, ref);
        if (v === "yes") yes += 1;
        else if (v === "no") no += 1;
      });
      if (yes + no === 0) {
        span.textContent = "";
        span.removeAttribute("data-summary");
        return;
      }
      if (no === 0) {
        span.textContent = "All";
        span.setAttribute("data-summary", "all");
      } else if (yes === 0) {
        span.textContent = "None";
        span.setAttribute("data-summary", "none");
      } else {
        span.textContent = "Partial";
        span.setAttribute("data-summary", "partial");
      }
    });
  }

  function applyCompareColumn(colIndex, spec) {
    document.querySelectorAll("#perm-table tr.perm-feature-row").forEach(function (tr) {
      var td = tr.querySelector('td[data-cmp-col="' + colIndex + '"]');
      if (!td) return;
      if (tr.getAttribute("data-subsection") === "true") {
        td.innerHTML = '<span class="perm-compare-inner perm-compare-inner--empty"></span>';
        return;
      }
      var ref = tr.getAttribute("data-feature-ref");
      var f = featureByRef(ref);
      if (!spec || !f) {
        td.innerHTML = '<span class="perm-compare-inner perm-compare-inner--empty"></span>';
        return;
      }
      var v = compareCellValue(spec, f, ref);
      if (v === "yes") {
        td.innerHTML =
          '<span class="perm-compare-inner perm-compare--yes" title="Feature is selected">✓</span>';
      } else if (v === "no") {
        td.innerHTML =
          '<span class="perm-compare-inner perm-compare--no" title="Feature is not selected">' +
          compareDenyXSvg() +
          "</span>";
      } else {
        td.innerHTML = '<span class="perm-compare-inner perm-compare-inner--empty"></span>';
      }
    });
    updateGroupSummariesForColumn(colIndex);
  }

  function fillCompareMenu(menu, dd) {
    var names = getCustomRoleNamesSorted();
    var curPre = dd ? dd.getAttribute("data-cmp-predef") : null;
    var curCu = dd ? dd.getAttribute("data-cmp-custom") : null;
    var html = "";
    html += '<div class="cmp-dd__section-title">Pre-defined</div>';
    CMP_PREDEFINED.forEach(function (p) {
      var sel = curPre === p.value ? " cmp-dd__item--sel" : "";
      html +=
        '<button type="button" class="cmp-dd__item' +
        sel +
        '" data-kind="predefined" data-value="' +
        escAttr(p.value) +
        '">' +
        esc(p.label) +
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
          escAttr(n) +
          '">' +
          esc(n) +
          "</button>";
      });
    }
    menu.innerHTML = html;
  }

  function mountCompareDropdowns() {
    if (PREDEFINED_EDIT_KEY) return;
    var mounts = document.getElementById("cmp-dd-mounts");
    if (!mounts) return;
    mounts.innerHTML = [0, 1]
      .map(function (col) {
        return (
          '<div class="cmp-dd" data-cmp-col="' +
          col +
          '">' +
          '<div class="cmp-dd__shell">' +
          '<button type="button" class="cmp-dd__primary" aria-expanded="false" aria-haspopup="listbox">' +
          '<span class="cmp-dd__label cmp-dd__label--placeholder">Select</span></button>' +
          '<button type="button" class="cmp-dd__clear" aria-label="Clear selection" hidden><span class="cmp-dd__clear-icon" aria-hidden="true">×</span></button>' +
          '<button type="button" class="cmp-dd__chev-btn" aria-label="Open menu" aria-expanded="false">' +
          '<span class="cmp-dd__chev" aria-hidden="true">▼</span></button></div>' +
          '<div class="cmp-dd__menu" role="listbox" hidden></div></div>'
        );
      })
      .join("");

    mounts.querySelectorAll(".cmp-dd").forEach(function (dd) {
      var menu = dd.querySelector(".cmp-dd__menu");
      var primary = dd.querySelector(".cmp-dd__primary");
      var chev = dd.querySelector(".cmp-dd__chev-btn");
      var clearBtn = dd.querySelector(".cmp-dd__clear");

      function openMenu() {
        closeAllDd();
        if (menu) {
          fillCompareMenu(menu, dd);
          menu.hidden = false;
        }
        if (primary) primary.setAttribute("aria-expanded", "true");
        if (chev) chev.setAttribute("aria-expanded", "true");
      }

      function toggleMenu() {
        if (menu && !menu.hidden) {
          closeAllDd();
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
          cmpDdClear(dd);
          closeAllDd();
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
            cmpDdSetSelection(
              dd,
              { type: "predefined", key: item.getAttribute("data-value") },
              label
            );
          } else if (kind === "custom") {
            cmpDdSetSelection(
              dd,
              { type: "custom", name: item.getAttribute("data-name") || label },
              label
            );
          }
          menu.hidden = true;
          if (primary) primary.setAttribute("aria-expanded", "false");
          if (chev) chev.setAttribute("aria-expanded", "false");
        });
      }
    });

    var d0 = mounts.querySelector('.cmp-dd[data-cmp-col="0"]');
    var d1 = mounts.querySelector('.cmp-dd[data-cmp-col="1"]');
    if (CLONE_SOURCE_NAME) {
      var sl = getCompareSpecAndLabelForClone(CLONE_SOURCE_NAME);
      if (d0) {
        cmpDdSetSelection(d0, sl.spec, sl.label);
      }
      if (d1) {
        cmpDdClear(d1);
      }
    } else {
      if (d0) {
        cmpDdSetSelection(d0, { type: "predefined", key: "admin" }, "Admin");
      }
      if (d1) {
        cmpDdSetSelection(d1, { type: "predefined", key: "read-only" }, "Read-only");
      }
    }
  }

  function initDescriptionCounter() {
    var ta = document.getElementById("role-description");
    var out = document.getElementById("role-desc-count");
    if (!ta || !out) return;
    if (ta.disabled) {
      out.hidden = true;
      return;
    }
    function sync() {
      out.textContent = String(ta.value.length) + "/250";
    }
    ta.addEventListener("input", sync);
    ta.setAttribute("maxlength", "250");
    sync();
  }

  function mergeCustomRoleName(name) {
    var trimmed = name.trim();
    if (!trimmed) return;
    try {
      var cur = JSON.parse(localStorage.getItem(LS_CUSTOM_NAMES) || "[]");
      if (!Array.isArray(cur)) cur = [];
      if (cur.indexOf(trimmed) === -1) cur.push(trimmed);
      localStorage.setItem(LS_CUSTOM_NAMES, JSON.stringify(cur));
    } catch (e) {
      /* ignore */
    }
  }

  function renameCustomRoleInStorage(oldName, newName) {
    var o = oldName.trim();
    var n = newName.trim();
    if (!o || !n) return;
    try {
      var cur = JSON.parse(localStorage.getItem(LS_CUSTOM_NAMES) || "[]");
      if (!Array.isArray(cur)) cur = [];
      var filtered = cur.filter(function (x) {
        return x !== o;
      });
      if (filtered.indexOf(n) !== -1) return;
      filtered.push(n);
      filtered.sort(function (a, b) {
        return a.localeCompare(b, undefined, { sensitivity: "base" });
      });
      localStorage.setItem(LS_CUSTOM_NAMES, JSON.stringify(filtered));
      renameRoleDataKey(o, n);
    } catch (e) {
      /* ignore */
    }
  }

  function removeCustomRoleFromStorage(name) {
    try {
      var cur = JSON.parse(localStorage.getItem(LS_CUSTOM_NAMES) || "[]");
      if (!Array.isArray(cur)) cur = [];
      localStorage.setItem(
        LS_CUSTOM_NAMES,
        JSON.stringify(
          cur.filter(function (x) {
            return x !== name;
          })
        )
      );
    } catch (e) {
      /* ignore */
    }
    removeRoleData(name);
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

  function getRoleDataMap() {
    try {
      var raw = localStorage.getItem(LS_ROLE_DATA);
      var m = JSON.parse(raw || "{}");
      return m && typeof m === "object" ? m : {};
    } catch (e) {
      return {};
    }
  }

  function getRoleDataForName(name) {
    return getRoleDataMap()[name] || null;
  }

  /**
   * Compare column value for a feature row: predefined roles use compareAllowed;
   * custom roles use saved permissions (same rules as permissions matrix / edit role).
   */
  function compareCellValue(spec, f, ref) {
    if (!spec || !f || !ref) return null;
    if (spec.type === "custom") {
      var rec = getRoleDataForName(spec.name);
      if (!rec || !rec.permissions || !rec.permissions.groups) return null;
      var gi = ref.indexOf(":");
      if (gi < 0) return null;
      var gid = ref.slice(0, gi);
      var gstate = rec.permissions.groups[gid];
      if (!gstate || !gstate.v) return "no";
      return featureAllowedFromSavedGroupState(gstate, ref, f) ? "yes" : "no";
    }
    return compareAllowed(spec, f);
  }

  var DEFAULT_ROLE_DESCRIPTION = "Custom role for your organization.";

  function getDescriptionForRole(name) {
    try {
      var map = getRoleDataMap();
      var r = map[name];
      if (r && r.description && String(r.description).trim()) {
        return String(r.description).trim();
      }
    } catch (e) {
      /* ignore */
    }
    return DEFAULT_ROLE_DESCRIPTION;
  }

  function getCloneDescription(displayName) {
    var pk = nameToPredefinedKey(displayName);
    if (pk) {
      var C = PREDEFINED_ROLE_COPY[displayName];
      if (C && C.cloneDesc) return C.cloneDesc;
      if (C && C.long) return C.long;
      if (C && C.short) return C.short;
    }
    var rec = getRoleDataForName(displayName);
    if (rec && rec.description && String(rec.description).trim()) {
      return String(rec.description).trim();
    }
    return DEFAULT_ROLE_DESCRIPTION;
  }

  function removeRoleData(name) {
    var map = getRoleDataMap();
    if (map[name]) {
      delete map[name];
      localStorage.setItem(LS_ROLE_DATA, JSON.stringify(map));
    }
  }

  function renameRoleDataKey(oldName, newName) {
    var map = getRoleDataMap();
    if (map[oldName]) {
      map[newName] = map[oldName];
      delete map[oldName];
      localStorage.setItem(LS_ROLE_DATA, JSON.stringify(map));
    }
  }

  function saveRoleFull(roleName, description, permissions) {
    var map = getRoleDataMap();
    map[roleName] = {
      description: description || "",
      permissions: permissions || { groups: {} },
    };
    localStorage.setItem(LS_ROLE_DATA, JSON.stringify(map));
  }

  function collectRolePermissions() {
    var groups = {};
    document.querySelectorAll("#perm-table tbody.perm-group").forEach(function (tbody) {
      var gid = tbody.dataset.permGroup;
      if (!gid) return;
      var dd = tbody.querySelector("[data-perm-dd]");
      if (!dd) return;
      var v = dd.dataset.currentValue || "none";
      var g = { v: v };
      if (v === "custom") {
        g.cbs = {};
        tbody.querySelectorAll(".perm-feature-row .perm-cb").forEach(function (cb) {
          var tr = cb.closest("tr");
          var ref = tr && tr.getAttribute("data-feature-ref");
          if (ref) g.cbs[ref] = cb.checked;
        });
      }
      groups[gid] = g;
    });
    return { groups: groups };
  }

  function labelForPermValue(v) {
    var i;
    for (i = 0; i < DD_OPTIONS.length; i += 1) {
      var o = DD_OPTIONS[i];
      if (o.sep) continue;
      if (o.value === v) return o.label;
    }
    for (i = 0; i < CMP_PREDEFINED.length; i += 1) {
      if (CMP_PREDEFINED[i].value === v) return CMP_PREDEFINED[i].label;
    }
    return "None";
  }

  function applyRolePermissions(permObj) {
    if (!permObj || !permObj.groups) return;
    GROUPS.forEach(function (g) {
      var tbody = document.querySelector('tbody[data-perm-group="' + g.id + '"]');
      if (!tbody) return;
      var gstate = permObj.groups[g.id];
      var v = gstate && gstate.v ? gstate.v : "none";
      var dd = tbody.querySelector("[data-perm-dd]");
      if (dd) {
        var isNone = v === "none";
        updateTrigger(dd, v, labelForPermValue(v), isNone);
      }
      applyPermissionToGroup(tbody, v);
      if (v === "custom" && gstate && gstate.cbs) {
        tbody.querySelectorAll(".perm-feature-row .perm-cb").forEach(function (cb) {
          var tr = cb.closest("tr");
          var ref = tr && tr.getAttribute("data-feature-ref");
          if (ref && Object.prototype.hasOwnProperty.call(gstate.cbs, ref)) {
            cb.checked = !!gstate.cbs[ref];
          }
        });
        syncLinkedTreeCheckboxes(tbody);
        syncAlertLinkedCheckboxes(tbody);
      }
    });
  }

  function applyRolePermissionsOrDefault(permObj) {
    if (permObj && permObj.groups) {
      applyRolePermissions(permObj);
    } else {
      GROUPS.forEach(function (g) {
        var tbody = document.querySelector('tbody[data-perm-group="' + g.id + '"]');
        if (tbody) applyPermissionToGroup(tbody, "none");
      });
    }
  }

  function initPermGroupToggles() {
    document.querySelectorAll(".perm-group-toggle").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = btn.getAttribute("aria-controls");
        var tbody = id ? document.getElementById(id) : null;
        if (!tbody) return;
        var collapsed = tbody.classList.toggle("perm-group--collapsed");
        btn.setAttribute("aria-expanded", collapsed ? "false" : "true");
        btn.classList.toggle("perm-group-toggle--collapsed", collapsed);
      });
    });
  }

  renderPermissionsTable();
  initPermGroupToggles();
  mountCompareDropdowns();
  initPermissionDropdowns();
  initAlertLinkedCheckboxListeners();

  var loadedRoleRecord = null;
  if (PAGE_KIND === "edit" && ORIGINAL_ROLE_NAME) {
    loadedRoleRecord = getRoleDataForName(ORIGINAL_ROLE_NAME);
    var taPre = document.getElementById("role-description");
    if (taPre) {
      taPre.value = getDescriptionForRole(ORIGINAL_ROLE_NAME);
    }
  }
  var clonePermissionsPayload = null;
  if (PAGE_KIND === "add" && CLONE_SOURCE_NAME) {
    var pkClone = nameToPredefinedKey(CLONE_SOURCE_NAME);
    if (pkClone) {
      clonePermissionsPayload = buildPermissionsFromPredefinedCloneKey(pkClone);
    } else {
      var recClone = getRoleDataForName(CLONE_SOURCE_NAME);
      clonePermissionsPayload = recClone && recClone.permissions ? recClone.permissions : null;
    }
  }

  if (!PREDEFINED_EDIT_KEY) {
    var permToApply =
      clonePermissionsPayload != null
        ? clonePermissionsPayload
        : loadedRoleRecord && loadedRoleRecord.permissions;
    applyRolePermissionsOrDefault(permToApply);
  }

  var nameInput = document.getElementById("role-name");
  if (nameInput && PAGE_KIND === "edit" && ORIGINAL_ROLE_NAME) {
    nameInput.value = ORIGINAL_ROLE_NAME;
    var titleHeading = document.getElementById("role-page-title");
    if (titleHeading) titleHeading.textContent = ORIGINAL_ROLE_NAME;
    document.title = ORIGINAL_ROLE_NAME + " – Edit custom role";
  }
  if (nameInput && PAGE_KIND === "add" && CLONE_SOURCE_NAME) {
    nameInput.value = CLONE_SOURCE_NAME + " - clone";
    var taClone = document.getElementById("role-description");
    if (taClone) {
      taClone.value = getCloneDescription(CLONE_SOURCE_NAME);
    }
  }
  if (nameInput && PAGE_KIND === "predefined-edit" && ORIGINAL_ROLE_NAME) {
    nameInput.value = ORIGINAL_ROLE_NAME;
    nameInput.disabled = true;
    nameInput.classList.add("add-role-field__control--disabled");
    var taPredef = document.getElementById("role-description");
    if (taPredef) {
      var copy = PREDEFINED_ROLE_COPY[ORIGINAL_ROLE_NAME];
      taPredef.value = copy && copy.long ? copy.long : copy && copy.short ? copy.short : "";
      taPredef.disabled = true;
      taPredef.classList.add("add-role-field__control--disabled");
    }
    var titlePre = document.getElementById("role-page-title");
    if (titlePre) titlePre.textContent = ORIGINAL_ROLE_NAME;
    document.title = ORIGINAL_ROLE_NAME + " – Edit pre-defined role";
  }

  initDescriptionCounter();

  function initRoleAdminsTabPanel() {
    var permPanel = document.getElementById("role-panel-permissions");
    var admPanel = document.getElementById("role-panel-administrators");
    var permTab = document.getElementById("role-tab-permissions");
    var admTab = document.getElementById("role-tab-administrators");
    var availableTbody = document.getElementById("assign-available-tbody");
    var selectedTbody = document.getElementById("assign-selected-tbody");
    var countAvailableEl = document.getElementById("assign-available-count");
    var countSelectedEl = document.getElementById("assign-selected-count");
    var badge = document.getElementById("tab-admin-badge");
    var btnRight = document.getElementById("assign-move-right");
    var btnLeft = document.getElementById("assign-move-left");
    var searchAvail = document.getElementById("assign-available-search");
    var searchSel = document.getElementById("assign-selected-search");
    var availablePager = document.getElementById("assign-available-pager");
    if (availablePager) availablePager.hidden = true;

    if (!permPanel || !admPanel || !permTab || !admTab) return;
    if (!availableTbody || !selectedTbody) return;

    var orgTotal =
      typeof window.sophosProtoOrgAdminTotal === "number"
        ? window.sophosProtoOrgAdminTotal
        : Array.isArray(window.sophosProtoRoleAdmins)
          ? window.sophosProtoRoleAdmins.length
          : 6;

    var roleNameForList = null;
    if (PAGE_KIND === "edit" || PAGE_KIND === "predefined-edit") {
      roleNameForList = ORIGINAL_ROLE_NAME;
    } else if (PAGE_KIND === "add" && CLONE_SOURCE_NAME) {
      roleNameForList = CLONE_SOURCE_NAME;
    }

    function sortEntries(arr) {
      return arr.slice().sort(function (a, b) {
        return a.name.localeCompare(b.name);
      });
    }

    function updateAvailableCountLabel() {
      if (!countAvailableEl) return;
      var n = availableTbody.querySelectorAll(".assign-selector__checkbox:checked")
        .length;
      countAvailableEl.textContent = n + " of " + orgTotal;
    }

    function updateSelectedCounts() {
      var n = selectedTbody.querySelectorAll("tr").length;
      if (countSelectedEl) countSelectedEl.textContent = String(n);
      if (badge) badge.textContent = String(n);
    }

    function createAssignRow(entry) {
      var tr = document.createElement("tr");
      tr.dataset.adminName = entry.name;
      var tdCheck = document.createElement("td");
      tdCheck.className = "assign-selector__td-check";
      var cb = document.createElement("input");
      cb.type = "checkbox";
      cb.className = "assign-selector__checkbox";
      cb.setAttribute("aria-label", "Select " + entry.name);
      tdCheck.appendChild(cb);
      var tdName = document.createElement("td");
      tdName.textContent = entry.name;
      var tdRole = document.createElement("td");
      var cr = entry.currentRole;
      tdRole.textContent = cr || "";
      if (!cr) tdRole.className = "assign-selector__td-role--empty";
      tr.appendChild(tdCheck);
      tr.appendChild(tdName);
      tr.appendChild(tdRole);
      return tr;
    }

    function sortTbodyByName(tbody) {
      var rows = Array.prototype.slice
        .call(tbody.querySelectorAll("tr"))
        .filter(function (r) {
          return r.dataset.adminName;
        });
      rows.sort(function (a, b) {
        return (a.dataset.adminName || "").localeCompare(
          b.dataset.adminName || ""
        );
      });
      rows.forEach(function (r) {
        tbody.appendChild(r);
      });
    }

    function applySearch(tbody, query) {
      var q = String(query || "")
        .trim()
        .toLowerCase();
      tbody.querySelectorAll("tr").forEach(function (tr) {
        if (!tr.dataset.adminName) return;
        var name = (tr.dataset.adminName || "").toLowerCase();
        var roleCell = tr.cells[2];
        var roleText = roleCell ? roleCell.textContent.toLowerCase() : "";
        var match = !q || name.indexOf(q) !== -1 || roleText.indexOf(q) !== -1;
        tr.classList.toggle("assign-selector__row--hidden", !match);
      });
    }

    var availFn = window.getAvailableAdministratorsForRole;
    var selFn = window.getSelectedAdministratorsForRole;
    var availableData =
      typeof availFn === "function" ? sortEntries(availFn(roleNameForList)) : [];
    var selectedData =
      typeof selFn === "function" ? sortEntries(selFn(roleNameForList)) : [];

    availableTbody.innerHTML = "";
    selectedTbody.innerHTML = "";
    availableData.forEach(function (e) {
      availableTbody.appendChild(createAssignRow(e));
    });
    selectedData.forEach(function (e) {
      selectedTbody.appendChild(createAssignRow(e));
    });

    updateAvailableCountLabel();
    updateSelectedCounts();

    admPanel.addEventListener("change", function (e) {
      var t = e.target;
      if (!t || !t.classList.contains("assign-selector__checkbox")) return;
      var tr = t.closest("tr");
      if (!tr) return;
      tr.classList.toggle("assign-selector__row--selected", t.checked);
      var tb = tr.closest("tbody");
      if (tb === availableTbody) updateAvailableCountLabel();
    });

    function moveChecked(fromTbody, toTbody) {
      var cbs = fromTbody.querySelectorAll(".assign-selector__checkbox:checked");
      var trs = Array.prototype.map.call(cbs, function (cb) {
        return cb.closest("tr");
      }).filter(Boolean);
      trs.forEach(function (tr) {
        var cb = tr.querySelector(".assign-selector__checkbox");
        if (cb) {
          cb.checked = false;
        }
        tr.classList.remove("assign-selector__row--selected");
        tr.classList.remove("assign-selector__row--hidden");
        toTbody.appendChild(tr);
      });
      sortTbodyByName(toTbody);
      updateAvailableCountLabel();
      updateSelectedCounts();
      if (searchAvail) applySearch(availableTbody, searchAvail.value);
      if (searchSel) applySearch(selectedTbody, searchSel.value);
    }

    if (btnRight) {
      btnRight.addEventListener("click", function () {
        moveChecked(availableTbody, selectedTbody);
      });
    }
    if (btnLeft) {
      btnLeft.addEventListener("click", function () {
        moveChecked(selectedTbody, availableTbody);
      });
    }
    if (searchAvail) {
      searchAvail.addEventListener("input", function () {
        applySearch(availableTbody, searchAvail.value);
      });
    }
    if (searchSel) {
      searchSel.addEventListener("input", function () {
        applySearch(selectedTbody, searchSel.value);
      });
    }

    function showPermissions() {
      permPanel.hidden = false;
      admPanel.hidden = true;
      permTab.classList.add("tab--active");
      permTab.setAttribute("aria-selected", "true");
      admTab.classList.remove("tab--active");
      admTab.setAttribute("aria-selected", "false");
    }
    function showAdministrators() {
      permPanel.hidden = true;
      admPanel.hidden = false;
      admTab.classList.add("tab--active");
      admTab.setAttribute("aria-selected", "true");
      permTab.classList.remove("tab--active");
      permTab.setAttribute("aria-selected", "false");
    }
    permTab.addEventListener("click", showPermissions);
    admTab.addEventListener("click", showAdministrators);
  }

  initRoleAdminsTabPanel();

  if (nameInput && PAGE_KIND === "add") {
    window.setTimeout(function () {
      nameInput.focus();
    }, 0);
  }

  document.querySelectorAll('.breadcrumbs a[href="#"]').forEach(function (el) {
    el.addEventListener("click", function (e) {
      e.preventDefault();
    });
  });

  var nameErrorEl = document.getElementById("role-name-error");

  function clearRoleNameError() {
    if (nameErrorEl) {
      nameErrorEl.textContent = "";
      nameErrorEl.hidden = true;
    }
    if (nameInput) {
      nameInput.classList.remove("add-role-field__input--error");
      nameInput.removeAttribute("aria-invalid");
    }
  }

  function setRoleNameError(message) {
    if (nameErrorEl) {
      nameErrorEl.textContent = message;
      nameErrorEl.hidden = false;
    }
    if (nameInput) {
      nameInput.classList.add("add-role-field__input--error");
      nameInput.setAttribute("aria-invalid", "true");
    }
  }

  if (nameInput && nameErrorEl) {
    nameInput.addEventListener("input", function () {
      clearRoleNameError();
    });
  }

  var saveBtn = document.getElementById("add-role-save");
  var descInput = document.getElementById("role-description");
  if (saveBtn) {
    saveBtn.addEventListener("click", function (e) {
      e.preventDefault();
      if (PREDEFINED_EDIT_KEY) {
        try {
          sessionStorage.setItem("sophosProtoToastMessage", "Role saved");
        } catch (err) {
          /* ignore */
        }
        window.location.href = getRolesLandingUrl();
        return;
      }
      clearRoleNameError();
      var n = nameInput ? nameInput.value.trim() : "";
      if (!n) {
        setRoleNameError("Required");
        return;
      }
      var exclude =
        PAGE_KIND === "edit" && ORIGINAL_ROLE_NAME ? ORIGINAL_ROLE_NAME : null;
      if (roleNameIsTaken(n, exclude)) {
        setRoleNameError("Name already used");
        return;
      }
      var desc = descInput ? descInput.value.trim() : "";
      var perms = collectRolePermissions();
      if (PAGE_KIND === "edit" && ORIGINAL_ROLE_NAME) {
        if (n !== ORIGINAL_ROLE_NAME) {
          renameCustomRoleInStorage(ORIGINAL_ROLE_NAME, n);
        } else {
          mergeCustomRoleName(n);
        }
      } else {
        mergeCustomRoleName(n);
      }
      saveRoleFull(n, desc, perms);
      try {
        sessionStorage.setItem("sophosProtoToastMessage", "Role saved");
      } catch (err) {
        /* ignore */
      }
      window.location.href = getRolesLandingUrl();
    });
  }

  var deleteEditBtn = document.getElementById("edit-role-delete");
  var deleteModalEl = document.getElementById("delete-role-modal");
  var deleteBackdrop = document.getElementById("delete-role-modal-backdrop");
  var deleteBody = document.getElementById("delete-role-modal-body");
  var deleteCancel = document.getElementById("delete-role-modal-cancel");
  var deleteX = document.getElementById("delete-role-modal-x");
  var deleteSubmit = document.getElementById("delete-role-modal-submit");

  function closeEditDeleteModal() {
    if (deleteBackdrop) deleteBackdrop.hidden = true;
    if (deleteModalEl) deleteModalEl.hidden = true;
  }

  function openEditDeleteModal() {
    if (!ORIGINAL_ROLE_NAME || !deleteBody) return;
    deleteBody.innerHTML =
      "Delete role <strong>" + esc(ORIGINAL_ROLE_NAME) + "</strong>.";
    if (deleteBackdrop) deleteBackdrop.hidden = false;
    if (deleteModalEl) deleteModalEl.hidden = false;
  }

  function confirmEditDelete() {
    if (!ORIGINAL_ROLE_NAME) return;
    removeCustomRoleFromStorage(ORIGINAL_ROLE_NAME);
    closeEditDeleteModal();
    try {
      sessionStorage.setItem("sophosProtoToastMessage", "Role deleted");
    } catch (err) {
      /* ignore */
    }
    window.location.href = getRolesLandingUrl();
  }

  if (PAGE_KIND === "edit" && deleteEditBtn) {
    deleteEditBtn.addEventListener("click", openEditDeleteModal);
  }
  if (deleteCancel) deleteCancel.addEventListener("click", closeEditDeleteModal);
  if (deleteX) deleteX.addEventListener("click", closeEditDeleteModal);
  if (deleteBackdrop) deleteBackdrop.addEventListener("click", closeEditDeleteModal);
  if (deleteModalEl) {
    deleteModalEl.addEventListener("click", function (e) {
      if (e.target === deleteModalEl) closeEditDeleteModal();
    });
  }
  if (deleteSubmit) deleteSubmit.addEventListener("click", confirmEditDelete);

  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    if (deleteModalEl && !deleteModalEl.hidden) {
      closeEditDeleteModal();
      e.preventDefault();
    }
  });

  var cloneBtn = document.getElementById("edit-role-clone");
  if (cloneBtn) {
    cloneBtn.addEventListener("click", function () {
      var rt = urlParams.get("return");
      var retQ = rt ? "&return=" + encodeURIComponent(rt) : "";
      if (ORIGINAL_ROLE_NAME) {
        window.location.href =
          "add-role.html?clone=" + encodeURIComponent(ORIGINAL_ROLE_NAME) + retQ;
      } else {
        window.location.href = "add-role.html" + (retQ ? "?" + retQ.slice(1) : "");
      }
    });
  }
})();
