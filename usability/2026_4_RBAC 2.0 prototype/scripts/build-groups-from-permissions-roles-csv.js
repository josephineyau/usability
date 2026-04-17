/**
 * One-off / maintenance: read exports/permissions_roles.csv (feature catalog)
 * and print the GROUPS JS literal for pasting into permissions-data.js
 */
"use strict";

var fs = require("fs");
var path = require("path");

var csvPath = path.join(__dirname, "..", "exports", "permissions_roles.csv");
var raw = fs.readFileSync(csvPath, "utf8");

function parseCsvLine(line) {
  var out = [];
  var cur = "";
  var inQ = false;
  for (var i = 0; i < line.length; i++) {
    var c = line[i];
    if (inQ) {
      if (c === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQ = false;
        }
      } else {
        cur += c;
      }
    } else {
      if (c === '"') inQ = true;
      else if (c === ",") {
        out.push(cur);
        cur = "";
      } else cur += c;
    }
  }
  out.push(cur);
  return out;
}

var lines = raw.split(/\r?\n/).filter(function (l) {
  return l.trim().length;
});
var header = parseCsvLine(lines[0]);
var idx = {};
header.forEach(function (h, j) {
  idx[h.trim()] = j;
});

var rows = [];
for (var r = 1; r < lines.length; r++) {
  rows.push(parseCsvLine(lines[r]));
}

function yn(cell) {
  var s = String(cell || "")
    .trim()
    .toLowerCase();
  return s === "yes" ? "yes" : "no";
}

function roBool(cell) {
  return String(cell || "")
    .trim()
    .toLowerCase() === "yes";
}

var byGroup = {};
rows.forEach(function (cells) {
  var gid = cells[idx["Parent_Group_ID"]];
  var gname = cells[idx["Parent_Group_Name"]];
  if (!byGroup[gid]) byGroup[gid] = { name: gname, rows: [] };
  byGroup[gid].rows.push(cells);
});

var groupOrder = [];
rows.forEach(function (cells) {
  var gid = cells[idx["Parent_Group_ID"]];
  if (groupOrder.indexOf(gid) === -1) groupOrder.push(gid);
});

function rowKindFlags(kind) {
  var k = String(kind || "").trim();
  var o = {};
  if (k === "SUBCATEGORY") o.subsection = true;
  if (k === "SUBITEM_LABEL") o.subitem = true;
  if (k === "LINKED_FEATURE") o.treeChild = true;
  return o;
}

var hasTreeGroupCol = Object.prototype.hasOwnProperty.call(idx, "Tree_Group");

function treeGroupFromCells(cells) {
  if (!hasTreeGroupCol) return null;
  var c = String(cells[idx["Tree_Group"]] || "").trim();
  if (!c) return null;
  var n = parseInt(c, 10);
  return isNaN(n) ? null : n;
}

function escStr(s) {
  return JSON.stringify(s);
}

var parts = [];
parts.push("  var GROUPS = [");

groupOrder.forEach(function (gid, gi) {
  var g = byGroup[gid];
  var sorted = g.rows.slice().sort(function (a, b) {
    return (
      parseInt(a[idx["Sort_Order"]], 10) - parseInt(b[idx["Sort_Order"]], 10)
    );
  });

  parts.push("    {");
  parts.push("      id: " + escStr(gid) + ",");
  parts.push("      name: " + escStr(g.name) + ",");
  parts.push("      features: [");

  sorted.forEach(function (cells, fi) {
    var display = cells[idx["Display_Name"]];
    var kind = cells[idx["Row_Kind"]];
    var flags = rowKindFlags(kind);
    var ro = roBool(cells[idx["Read_only"]]);
    var a = yn(cells[idx["Help_Desk"]]);
    var b = yn(cells[idx["Responder"]]);
    var aa = yn(cells[idx["Security_Analyst"]]);
    var treeGrp = flags.treeChild ? treeGroupFromCells(cells) : null;

    var linesF = [];
    linesF.push("        {");
    linesF.push("          n: " + escStr(display) + ",");
    linesF.push("          ro: " + (ro ? "true" : "false") + ",");
    linesF.push('          a: "' + a + '",');
    linesF.push('          b: "' + b + '",');
    linesF.push('          aa: "' + aa + '"');
    if (flags.subsection) linesF[linesF.length - 1] += ",";
    else if (flags.subitem) linesF[linesF.length - 1] += ",";
    else if (flags.treeChild) linesF[linesF.length - 1] += ",";
    else linesF[linesF.length - 1] += "";

    if (flags.subsection) linesF.push("          subsection: true");
    if (flags.subitem) linesF.push("          subitem: true");
    if (flags.treeChild) {
      linesF.push("          treeChild: true");
      if (treeGrp !== null) {
        if (!linesF[linesF.length - 1].endsWith(",")) linesF[linesF.length - 1] += ",";
        linesF.push("          treeGroup: " + treeGrp);
      }
    }

    var lastIdx = linesF.length - 1;
    if (linesF[lastIdx].endsWith(",")) {
      /* ok */
    } else if (flags.subsection || flags.subitem || flags.treeChild) {
      /* last line is flag line without comma - add nothing */
    }
    /* fix trailing comma on n line when we have flags */
    if (flags.subsection || flags.subitem || flags.treeChild) {
      var nLine = linesF[0];
      /* second line is n: */
      for (var li = 0; li < linesF.length; li++) {
        if (linesF[li].indexOf("aa:") !== -1 && linesF[li].indexOf('"') !== -1) {
          if (!linesF[li].endsWith(",")) linesF[li] += ",";
          break;
        }
      }
    }

    linesF.push("        }" + (fi < sorted.length - 1 ? "," : ""));
    parts.push(linesF.join("\n"));
  });

  parts.push("      ],");
  parts.push("    }" + (gi < groupOrder.length - 1 ? "," : ""));
});

parts.push("  ];");
console.log(parts.join("\n"));
