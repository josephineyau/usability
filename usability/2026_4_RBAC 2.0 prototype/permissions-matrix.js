(function () {
  "use strict";

  var LS_CUSTOM_NAMES = "sophosProtoCustomRoleNames";
  var LS_ROLE_DATA = "sophosProtoCustomRoleData";

  var PREDEFINED_COLUMNS = [
    { key: "super-admin", label: "Super Admin" },
    { key: "admin", label: "Admin" },
    { key: "responder", label: "Responder" },
    { key: "help-desk", label: "Help Desk" },
    { key: "analyst", label: "Security Analyst" },
    { key: "read-only", label: "Read-only" },
  ];

  var P = window.sophosProtoPermissions;
  if (!P || !P.featureAllowedFromSavedGroupState) return;
  var GROUPS = P.GROUPS;
  var featureByRef = P.featureByRef;
  var compareAllowed = P.compareAllowed;
  var annotateTreePositions = P.annotateTreePositions;

  var GROUP_TOGGLE_SVG =
    '<svg class="perm-group-toggle__icon" width="12" height="12" viewBox="0 0 12 12" aria-hidden="true" focusable="false"><path d="M3 4.5L6 7.5L9 4.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  /** Minimum column widths (must match styles.css --perm-matrix-* tokens). */
  var MATRIX_FEATURE_MIN = 280;
  var MATRIX_ROLE_MIN = 120;

  function applyMatrixColumnStretch() {
    var table = document.getElementById("perm-matrix-table");
    var scrollEl = document.getElementById("perm-matrix-scroll");
    if (!table || !scrollEl) return;

    var colEls = table.querySelectorAll("colgroup col");
    if (!colEls.length) return;

    var colCount = colEls.length;
    var roleCount = colCount - 1;
    var naturalWidth = MATRIX_FEATURE_MIN + roleCount * MATRIX_ROLE_MIN;
    var avail = Math.floor(scrollEl.clientWidth);

    if (avail <= naturalWidth) {
      table.classList.remove("perm-matrix-table--fill");
      table.style.width = naturalWidth + "px";
      table.style.minWidth = naturalWidth + "px";
      colEls[0].style.width = MATRIX_FEATURE_MIN + "px";
      for (var i = 1; i < colCount; i++) {
        colEls[i].style.width = MATRIX_ROLE_MIN + "px";
      }
      return;
    }

    table.classList.add("perm-matrix-table--fill");
    var extra = avail - naturalWidth;
    var totalWeight = MATRIX_FEATURE_MIN + roleCount * MATRIX_ROLE_MIN;
    var fFloat = MATRIX_FEATURE_MIN + (extra * MATRIX_FEATURE_MIN) / totalWeight;
    var rFloat = MATRIX_ROLE_MIN + (extra * MATRIX_ROLE_MIN) / totalWeight;

    var ints = [];
    ints[0] = Math.floor(fFloat);
    var rInt = Math.floor(rFloat);
    for (var j = 1; j < colCount; j++) {
      ints[j] = rInt;
    }
    var sum = ints[0];
    for (var k = 1; k < colCount; k++) {
      sum += ints[k];
    }
    var remainder = avail - sum;
    var idx = 0;
    while (remainder > 0) {
      ints[idx % colCount]++;
      remainder--;
      idx++;
    }

    table.style.width = avail + "px";
    table.style.minWidth = naturalWidth + "px";
    for (var m = 0; m < colCount; m++) {
      colEls[m].style.width = ints[m] + "px";
    }
  }

  var matrixStretchTimer = null;
  function scheduleMatrixColumnStretch() {
    if (matrixStretchTimer) window.clearTimeout(matrixStretchTimer);
    matrixStretchTimer = window.setTimeout(function () {
      matrixStretchTimer = null;
      applyMatrixColumnStretch();
    }, 100);
  }

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

  function matrixDenyXSvg() {
    return (
      '<svg class="perm-x-icon" width="12" height="12" viewBox="0 0 12 12" aria-hidden="true" focusable="false">' +
      '<path d="M3 3l6 6M9 3l-6 6" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round"/>' +
      "</svg>"
    );
  }

  function treeConnectorAssetSrc(pos) {
    if (pos === "first") return "assets/___rb2_connect_last.svg";
    if (pos === "mid") return "assets/___rb2_connector_middle.svg";
    if (pos === "last") return "assets/___rb2_connect_first.svg";
    return "assets/___rb2_connector_middle.svg";
  }

  function featureNameCellHtml(f) {
    var label = esc(f.n);
    var titleAttr = ' title="' + escAttr(f.n) + '"';
    if (f.subsection) {
      return (
        '<td class="perm-name-cell perm-name-cell--subsection perm-matrix__feature">' +
        '<span class="perm-tree__label perm-tree__label--subsection"' +
        titleAttr +
        ">" +
        label +
        "</span></td>"
      );
    }
    if (f.subitem) {
      return (
        '<td class="perm-name-cell perm-name-cell--subitem perm-matrix__feature">' +
        '<span class="perm-tree__label"' +
        titleAttr +
        ">" +
        label +
        "</span></td>"
      );
    }
    if (f.treeChild) {
      var pos = f.treePos || "solo";
      var runLen = f.treeRunLength || 1;
      if (runLen >= 2) {
        return (
          '<td class="perm-name-cell perm-name-cell--tree perm-matrix__feature">' +
          '<img class="perm-tree__connector" src="' +
          escAttr(treeConnectorAssetSrc(pos)) +
          '" alt="" width="23" height="36" decoding="async" aria-hidden="true" />' +
          '<div class="perm-tree perm-tree--lined perm-tree--rb2-feature">' +
          '<span class="perm-tree__label"' +
          titleAttr +
          ">" +
          label +
          "</span></div></td>"
        );
      }
      return (
        '<td class="perm-name-cell perm-name-cell--tree perm-matrix__feature">' +
        '<span class="perm-tree__guide perm-tree__guide--solo" aria-hidden="true"></span>' +
        '<div class="perm-tree perm-tree--lined">' +
        '<span class="perm-tree__label"' +
        titleAttr +
        ">" +
        label +
        "</span></div></td>"
      );
    }
    return (
      '<td class="perm-name-cell perm-matrix__feature"><span class="perm-tree__label"' +
      titleAttr +
      ">" +
      label +
      "</span></td>"
    );
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

  var featureAllowedFromSavedGroupState = P.featureAllowedFromSavedGroupState;

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

  function featureAllowedFromCustomStorage(permObj, gid, ref, f) {
    if (!permObj || !permObj.groups) return false;
    return featureAllowedFromSavedGroupState(permObj.groups[gid], ref, f);
  }

  function groupSummaryFromCounts(yes, no) {
    if (yes + no === 0) return { text: "", attr: null };
    if (no === 0) return { text: "All", attr: "all" };
    if (yes === 0) return { text: "None", attr: "none" };
    return { text: "Partial", attr: "partial" };
  }

  function countGroupForPredefined(g, spec) {
    var yes = 0;
    var no = 0;
    g.features.forEach(function (f, fi) {
      if (f.subsection) return;
      var ref = g.id + ":" + fi;
      var feat = featureByRef(ref);
      var v = compareAllowed(spec, feat);
      if (v === "yes") yes += 1;
      else if (v === "no") no += 1;
    });
    return groupSummaryFromCounts(yes, no);
  }

  function countGroupForCustom(g, permObj) {
    var yes = 0;
    var no = 0;
    g.features.forEach(function (f, fi) {
      if (f.subsection) return;
      var ref = g.id + ":" + fi;
      var feat = featureByRef(ref);
      if (featureAllowedFromCustomStorage(permObj, g.id, ref, feat)) yes += 1;
      else no += 1;
    });
    return groupSummaryFromCounts(yes, no);
  }

  function matrixFeatureCellHtml(spec, isPredefined, permObj, gid, ref, f) {
    var granted;
    if (isPredefined) {
      var v = compareAllowed(spec, f);
      granted = v === "yes";
    } else {
      granted = featureAllowedFromCustomStorage(permObj, gid, ref, f);
    }
    if (granted) {
      return (
        '<td class="perm-matrix-cell">' +
        '<span class="perm-compare-inner perm-compare--yes" title="Granted">✓</span></td>'
      );
    }
    if (isPredefined) {
      return (
        '<td class="perm-matrix-cell">' +
        '<span class="perm-matrix-deny perm-matrix-deny--pre" title="Not granted">-</span></td>'
      );
    }
    return (
      '<td class="perm-matrix-cell">' +
      '<span class="perm-matrix-deny perm-matrix-deny--custom" title="Not granted">' +
      matrixDenyXSvg() +
      "</span></td>"
    );
  }

  function matrixGroupSummaryCell(summary) {
    var span =
      '<span class="perm-compare-summary perm-matrix-summary"' +
      (summary.attr ? ' data-summary="' + escAttr(summary.attr) + '"' : "") +
      (summary.text ? ' title="' + escAttr(summary.text) + '"' : "") +
      ">" +
      esc(summary.text) +
      "</span>";
    return '<td class="perm-matrix-cell perm-matrix-cell--group">' + span + "</td>";
  }

  function emptyMatrixCell() {
    return '<td class="perm-matrix-cell perm-matrix-cell--empty"></td>';
  }

  function buildColumns() {
    var predefined = PREDEFINED_COLUMNS.map(function (c) {
      return { kind: "predefined", key: c.key, label: c.label };
    });
    var custom = getCustomRoleNamesSorted().map(function (name) {
      return { kind: "custom", name: name, label: name };
    });
    return predefined.concat(custom);
  }

  function renderMatrix() {
    var table = document.getElementById("perm-matrix-table");
    if (!table) return;

    var cols = buildColumns();
    var roleDataMap = getRoleDataMap();

    var featureColPx = MATRIX_FEATURE_MIN;
    var roleColPx = MATRIX_ROLE_MIN;
    var tableWidthPx = featureColPx + cols.length * roleColPx;

    var colgroupHtml =
      "<colgroup>" +
      '<col class="perm-matrix-col-feature" style="width:' +
      featureColPx +
      'px" />';
    cols.forEach(function () {
      colgroupHtml +=
        '<col class="perm-matrix-col-role" style="width:' + roleColPx + 'px" />';
    });
    colgroupHtml += "</colgroup>";

    var theadHtml = "<tr>";
    theadHtml +=
      '<th scope="col" class="perm-matrix__feature-head">' +
      "Feature / product" +
      "</th>";
    cols.forEach(function (c) {
      var lab = esc(c.label);
      theadHtml +=
        '<th scope="col" class="perm-matrix__role-head" title="' +
        escAttr(c.label) +
        '"><span class="perm-matrix__role-head-inner">' +
        lab +
        "</span></th>";
    });
    theadHtml += "</tr>";

    var bodyHtml = "";
    GROUPS.forEach(function (g) {
      annotateTreePositions(g.features);

      bodyHtml += '<tbody class="perm-group" id="perm-matrix-group-' + escAttr(g.id) + '">';

      var trCat = '<tr class="perm-cat-row">';
      trCat +=
        '<td class="perm-cat-row__name-td perm-matrix__feature">' +
        '<div class="perm-cat-row__cell">' +
        '<button type="button" class="perm-group-toggle" aria-expanded="true" aria-controls="perm-matrix-group-' +
        escAttr(g.id) +
        '" id="perm-matrix-btn-' +
        escAttr(g.id) +
        '">' +
        GROUP_TOGGLE_SVG +
        "</button>" +
        '<span class="perm-cat-row__title" title="' +
        escAttr(g.name) +
        '">' +
        esc(g.name) +
        "</span></div></td>";

      cols.forEach(function (c) {
        if (c.kind === "predefined") {
          var spec = { type: "predefined", key: c.key };
          trCat += matrixGroupSummaryCell(countGroupForPredefined(g, spec));
        } else {
          var rec = roleDataMap[c.name];
          var permObj = rec && rec.permissions ? rec.permissions : null;
          trCat += matrixGroupSummaryCell(countGroupForCustom(g, permObj));
        }
      });
      trCat += "</tr>";
      bodyHtml += trCat;

      g.features.forEach(function (f, fi) {
        var tr = '<tr class="perm-feature-row';
        if (f.subsection) tr += " perm-feature-row--subsection";
        if (f.subitem) tr += " perm-feature-row--subitem";
        if (f.treeChild) tr += " perm-feature-row--tree";
        tr += '">';

        if (f.subsection) {
          tr += featureNameCellHtml(f);
          cols.forEach(function () {
            tr += emptyMatrixCell();
          });
        } else {
          var ref = g.id + ":" + fi;
          tr += featureNameCellHtml(f);
          cols.forEach(function (c) {
            if (c.kind === "predefined") {
              tr += matrixFeatureCellHtml(
                { type: "predefined", key: c.key },
                true,
                null,
                g.id,
                ref,
                f
              );
            } else {
              var rec2 = roleDataMap[c.name];
              var permObj2 = rec2 && rec2.permissions ? rec2.permissions : null;
              tr += matrixFeatureCellHtml(
                { type: "custom", name: c.name },
                false,
                permObj2,
                g.id,
                ref,
                f
              );
            }
          });
        }
        tr += "</tr>";
        bodyHtml += tr;
      });

      bodyHtml += "</tbody>";
    });

    table.innerHTML = colgroupHtml + "<thead>" + theadHtml + "</thead>" + bodyHtml;
    applyMatrixColumnStretch();

    table.querySelectorAll(".perm-group-toggle").forEach(function (btn) {
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

  function filterMatrixTable(q) {
    var table = document.getElementById("perm-matrix-table");
    if (!table) return;
    var lower = (q || "").trim().toLowerCase();
    table.querySelectorAll("tbody.perm-group").forEach(function (tbody) {
      var any = false;
      tbody.querySelectorAll(".perm-feature-row").forEach(function (tr) {
        var text = tr.textContent.toLowerCase();
        var show = !lower || text.indexOf(lower) !== -1;
        tr.hidden = !show;
        if (show) any = true;
      });
      var cat = tbody.querySelector(".perm-cat-row");
      if (cat) {
        cat.hidden = lower && !any;
      }
    });
  }

  function refreshMatrix() {
    renderMatrix();
    var s = document.getElementById("perm-matrix-search");
    if (s && s.value) filterMatrixTable(s.value);
  }

  refreshMatrix();

  var search = document.getElementById("perm-matrix-search");
  if (search) {
    search.addEventListener("input", function () {
      filterMatrixTable(search.value);
    });
  }

  window.addEventListener("resize", scheduleMatrixColumnStretch);

  window.addEventListener("pageshow", function (ev) {
    if (ev.persisted) refreshMatrix();
  });

  window.addEventListener("storage", function (e) {
    if (e.key === LS_CUSTOM_NAMES || e.key === LS_ROLE_DATA) {
      refreshMatrix();
    }
  });

  try {
    if (typeof BroadcastChannel !== "undefined") {
      var rolesBc = new BroadcastChannel("sophosProtoCustomRoles");
      rolesBc.addEventListener("message", function () {
        refreshMatrix();
      });
    }
  } catch (bcErr) {
    /* ignore */
  }
})();
