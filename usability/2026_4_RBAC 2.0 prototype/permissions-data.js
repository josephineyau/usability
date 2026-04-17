/**
 * Single source of truth for the permission feature tree and per-role rules.
 * Loaded by add-role.js (Add / Edit / View) and permissions-matrix.js so lists
 * and granted/denied logic stay identical everywhere.
 *
 * Feature tree and per-role yes/no columns are generated from exports/permissions_roles.csv — fields:
 *   ro, a (Help Desk), b (Responder), aa (Security Analyst; compareAllowed uses aa for analyst key).
 */
(function (global) {
  "use strict";

  var GROUPS = [
    {
      id: "general",
      name: "General permissions",
      features: [
        {
          n: "Account",
          ro: true,
          a: "yes",
          b: "yes",
          aa: "yes",
          subsection: true
        },
        {
          n: "Manage account",
          ro: false,
          a: "no",
          b: "no",
          aa: "no",
          treeChild: true,
          treeGroup: 1
        },
        {
          n: "Perform account operations",
          ro: false,
          a: "no",
          b: "no",
          aa: "no",
          treeChild: true,
          treeGroup: 1
        },
        {
          n: "Run account health checks",
          ro: true,
          a: "yes",
          b: "yes",
          aa: "yes",
          subitem: true
        },
        {
          n: "Alerts",
          ro: true,
          a: "yes",
          b: "yes",
          aa: "yes",
          subsection: true
        },
        {
          n: "Manage alert notifications",
          ro: false,
          a: "no",
          b: "no",
          aa: "no",
          treeChild: true,
          treeGroup: 2
        },
        {
          n: "View alerts",
          ro: true,
          a: "yes",
          b: "yes",
          aa: "yes",
          treeChild: true,
          treeGroup: 2
        },
        {
          n: "Directory & Federation",
          ro: true,
          a: "yes",
          b: "yes",
          aa: "yes",
          subsection: true
        },
        {
          n: "Manage directory sync client",
          ro: false,
          a: "no",
          b: "no",
          aa: "no",
          subitem: true
        },
        {
          n: "Manage directory",
          ro: false,
          a: "no",
          b: "no",
          aa: "no",
          treeChild: true,
          treeGroup: 3
        },
        {
          n: "View directory",
          ro: true,
          a: "yes",
          b: "yes",
          aa: "yes",
          treeChild: true,
          treeGroup: 3
        },
        {
          n: "Manage federation",
          ro: false,
          a: "no",
          b: "no",
          aa: "no",
          subitem: true
        },
        {
          n: "Identity & Access",
          ro: true,
          a: "yes",
          b: "yes",
          aa: "yes",
          subsection: true
        },
        {
          n: "Manage credentials",
          ro: false,
          a: "no",
          b: "no",
          aa: "no",
          treeChild: true,
          treeGroup: 4
        },
        {
          n: "View credentials",
          ro: true,
          a: "yes",
          b: "yes",
          aa: "yes",
          treeChild: true,
          treeGroup: 4
        },
        {
          n: "Manage Users and Groups",
          ro: false,
          a: "no",
          b: "no",
          aa: "no",
          subitem: true
        },
        {
          n: "Manage roles",
          ro: false,
          a: "no",
          b: "no",
          aa: "no",
          treeChild: true,
          treeGroup: 5
        },
        {
          n: "View roles",
          ro: true,
          a: "yes",
          b: "yes",
          aa: "yes",
          treeChild: true,
          treeGroup: 5
        },
        {
          n: "Integrations",
          ro: true,
          a: "yes",
          b: "yes",
          aa: "yes",
          subsection: true
        },
        {
          n: "Manage integrations",
          ro: false,
          a: "no",
          b: "no",
          aa: "no",
          treeChild: true,
          treeGroup: 6
        },
        {
          n: "View integrations",
          ro: true,
          a: "yes",
          b: "yes",
          aa: "yes",
          treeChild: true,
          treeGroup: 6
        },
        {
          n: "Monitoring & Reports",
          ro: true,
          a: "yes",
          b: "yes",
          aa: "yes",
          subsection: true
        },
        {
          n: "Manage events",
          ro: false,
          a: "no",
          b: "no",
          aa: "no",
          treeChild: true,
          treeGroup: 7
        },
        {
          n: "View events",
          ro: true,
          a: "yes",
          b: "yes",
          aa: "yes",
          treeChild: true,
          treeGroup: 7
        },
        {
          n: "Manage reports",
          ro: false,
          a: "no",
          b: "no",
          aa: "no",
          subitem: true
        },
        {
          n: "View audit logs",
          ro: true,
          a: "yes",
          b: "yes",
          aa: "yes",
          subitem: true
        },
        {
          n: "Platform Settings",
          ro: true,
          a: "yes",
          b: "yes",
          aa: "yes",
          subsection: true
        },
        {
          n: "Manage download tokens",
          ro: false,
          a: "no",
          b: "no",
          aa: "no",
          subitem: true
        },
        {
          n: "Manage MDR Preferences",
          ro: false,
          a: "no",
          b: "no",
          aa: "no",
          subitem: true
        },
        {
          n: "Manage SLEC",
          ro: false,
          a: "no",
          b: "no",
          aa: "no",
          subitem: true
        },
        {
          n: "Manage tags",
          ro: false,
          a: "no",
          b: "no",
          aa: "no",
          treeChild: true,
          treeGroup: 8
        },
        {
          n: "View tags",
          ro: true,
          a: "yes",
          b: "yes",
          aa: "yes",
          treeChild: true,
          treeGroup: 8
        },
        {
          n: "Submit surveys & feedback",
          ro: true,
          a: "yes",
          b: "yes",
          aa: "yes",
          subitem: true
        },
        {
          n: "Manage web profiles",
          ro: false,
          a: "no",
          b: "no",
          aa: "no",
          treeChild: true,
          treeGroup: 9
        },
        {
          n: "View web profiles",
          ro: true,
          a: "yes",
          b: "yes",
          aa: "yes",
          treeChild: true,
          treeGroup: 9
        },
        {
          n: "Policies",
          ro: true,
          a: "yes",
          b: "yes",
          aa: "yes",
          subsection: true
        },
        {
          n: "Create, modify, and delete policies",
          ro: false,
          a: "no",
          b: "no",
          aa: "no",
          subitem: true
        },
        {
          n: "Assign polices",
          ro: false,
          a: "no",
          b: "yes",
          aa: "no",
          subitem: true
        },
        {
          n: "View policies",
          ro: true,
          a: "yes",
          b: "yes",
          aa: "yes",
          subitem: true
        }
      ],
    },
    {
      id: "endpoint",
      name: "Endpoint Protection",
      features: [
        {
          n: "Device Controls",
          ro: true,
          a: "yes",
          b: "yes",
          aa: "yes",
          subsection: true
        },
        {
          n: "Configure endpoint auto-remove policy",
          ro: false,
          a: "no",
          b: "no",
          aa: "no",
          treeChild: true,
          treeGroup: 1
        },
        {
          n: "View endpoint auto-remove policy",
          ro: true,
          a: "yes",
          b: "yes",
          aa: "yes",
          treeChild: true,
          treeGroup: 1
        },
        {
          n: "Configure endpoint live terminal",
          ro: false,
          a: "no",
          b: "no",
          aa: "no",
          subitem: true
        },
        {
          n: "Launch endpoint live terminal",
          ro: true,
          a: "no",
          b: "yes",
          aa: "no",
          subitem: true
        },
        {
          n: "Override endpoint tamper protection",
          ro: true,
          a: "no",
          b: "yes",
          aa: "no",
          subitem: true
        },
        {
          n: "Unisolate endpoints",
          ro: true,
          a: "yes",
          b: "yes",
          aa: "no",
          subitem: true
        }
      ],
    },
    {
      id: "server",
      name: "Server Protection",
      features: [
        {
          n: "Device Controls",
          ro: true,
          a: "yes",
          b: "yes",
          aa: "yes",
          subsection: true
        },
        {
          n: "Configure server auto-remove policy",
          ro: false,
          a: "no",
          b: "no",
          aa: "no",
          treeChild: true,
          treeGroup: 1
        },
        {
          n: "View server auto-remove policy",
          ro: true,
          a: "yes",
          b: "yes",
          aa: "yes",
          treeChild: true,
          treeGroup: 1
        },
        {
          n: "Configure server live terminal",
          ro: false,
          a: "no",
          b: "no",
          aa: "no",
          subitem: true
        },
        {
          n: "Launch server live terminal",
          ro: true,
          a: "no",
          b: "yes",
          aa: "no",
          subitem: true
        },
        {
          n: "Override server tamper protection",
          ro: true,
          a: "no",
          b: "yes",
          aa: "no",
          subitem: true
        },
        {
          n: "Unisolate servers",
          ro: true,
          a: "yes",
          b: "yes",
          aa: "no",
          subitem: true
        }
      ],
    },
    {
      id: "mobile",
      name: "Mobile",
      features: [
        {
          n: "Mobile enrollment",
          ro: true,
          a: "no",
          b: "yes",
          aa: "no"
        },
        {
          n: "Mobile compliance",
          ro: false,
          a: "yes",
          b: "no",
          aa: "yes"
        }
      ],
    },
    {
      id: "encryption",
      name: "Encryption",
      features: [
        {
          n: "Device encryption",
          ro: true,
          a: "yes",
          b: "yes",
          aa: "yes"
        },
        {
          n: "Recovery keys",
          ro: false,
          a: "no",
          b: "no",
          aa: "no"
        }
      ],
    },
    {
      id: "email",
      name: "Email Security",
      features: [
        {
          n: "Message quarantine",
          ro: true,
          a: "yes",
          b: "yes",
          aa: "yes"
        },
        {
          n: "Policy rules",
          ro: false,
          a: "yes",
          b: "no",
          aa: "yes"
        }
      ],
    },
    {
      id: "phish",
      name: "Phish Threat",
      features: [
        {
          n: "Simulation campaigns",
          ro: true,
          a: "no",
          b: "yes",
          aa: "no"
        },
        {
          n: "Training assignments",
          ro: false,
          a: "yes",
          b: "yes",
          aa: "yes"
        }
      ],
    },
    {
      id: "wireless",
      name: "Wireless",
      features: [
        {
          n: "Access points",
          ro: true,
          a: "yes",
          b: "no",
          aa: "yes"
        },
        {
          n: "SSID management",
          ro: false,
          a: "yes",
          b: "yes",
          aa: "yes"
        }
      ],
    },
    {
      id: "firewall",
      name: "Firewall",
      features: [
        {
          n: "Firewall rules",
          ro: true,
          a: "yes",
          b: "yes",
          aa: "yes"
        },
        {
          n: "VPN settings",
          ro: false,
          a: "no",
          b: "yes",
          aa: "no"
        }
      ],
    },
    {
      id: "cloud",
      name: "Cloud Optix",
      features: [
        {
          n: "Cloud inventory",
          ro: true,
          a: "yes",
          b: "no",
          aa: "yes"
        },
        {
          n: "Misconfiguration alerts",
          ro: false,
          a: "yes",
          b: "yes",
          aa: "yes"
        }
      ],
    },
    {
      id: "ztn",
      name: "Zero Trust Network",
      features: [
        {
          n: "ZTNA policies",
          ro: true,
          a: "no",
          b: "yes",
          aa: "no"
        },
        {
          n: "Access logs",
          ro: false,
          a: "yes",
          b: "yes",
          aa: "yes"
        }
      ],
    },
    {
      id: "switches",
      name: "Switches",
      features: [
        {
          n: "Switch configuration",
          ro: true,
          a: "yes",
          b: "yes",
          aa: "yes"
        },
        {
          n: "Port management",
          ro: false,
          a: "yes",
          b: "no",
          aa: "yes"
        }
      ],
    },
    {
      id: "dns",
      name: "DNS Protection",
      features: [
        {
          n: "DNS policies",
          ro: true,
          a: "yes",
          b: "yes",
          aa: "yes"
        },
        {
          n: "Blocked domains",
          ro: false,
          a: "no",
          b: "yes",
          aa: "no"
        }
      ],
    },
    {
      id: "risk",
      name: "Managed Risk",
      features: [
        {
          n: "Risk assessments",
          ro: true,
          a: "yes",
          b: "no",
          aa: "yes"
        },
        {
          n: "Remediation tasks",
          ro: false,
          a: "yes",
          b: "yes",
          aa: "yes"
        }
      ],
    }
  ];

  function featureByRef(ref) {
    if (!ref) return null;
    var i = ref.indexOf(":");
    if (i < 0) return null;
    var gid = ref.slice(0, i);
    var fi = parseInt(ref.slice(i + 1), 10);
    for (var g = 0; g < GROUPS.length; g++) {
      if (GROUPS[g].id === gid && GROUPS[g].features[fi]) {
        return GROUPS[g].features[fi];
      }
    }
    return null;
  }

  function compareAllowed(spec, f) {
    if (!spec || !f) return null;
    if (spec.type === "custom") {
      /* Custom roles: use saved permissions per feature (add-role.js compareCellValue, permissions matrix). */
      return null;
    }
    var key = spec.key;
    if (key === "super-admin" || key === "admin") return "yes";
    if (key === "read-only") return f.ro ? "yes" : "no";
    if (key === "help-desk") return f.a;
    if (key === "responder") return f.b;
    if (key === "analyst") return f.aa !== undefined ? f.aa : f.a;
    return null;
  }

  /**
   * Consecutive LINKED_FEATURE rows form one bracket run unless Tree_Group changes
   * (optional numeric treeGroup on each feature from CSV). If treeGroup is omitted
   * on all rows in a streak, behavior is unchanged: one run for the whole streak.
   */
  function sameLinkedTreeGroup(prev, curr) {
    var p = prev.treeGroup;
    var c = curr.treeGroup;
    if (p === undefined && c === undefined) return true;
    return p === c;
  }

  function annotateTreePositions(features) {
    var i = 0;
    while (i < features.length) {
      if (!features[i].treeChild) {
        i += 1;
        continue;
      }
      var runStart = i;
      i += 1;
      while (
        i < features.length &&
        features[i].treeChild &&
        sameLinkedTreeGroup(features[i - 1], features[i])
      ) {
        i += 1;
      }
      var runEnd = i - 1;
      var len = runEnd - runStart + 1;
      var j;
      for (j = runStart; j <= runEnd; j += 1) {
        features[j].treeRunLength = len;
        if (len === 1) {
          features[j].treePos = "solo";
        } else if (j === runStart) {
          features[j].treePos = "first";
        } else if (j === runEnd) {
          features[j].treePos = "last";
        } else {
          features[j].treePos = "mid";
        }
      }
    }
  }

  /**
   * Whether a feature is granted for saved custom-role state (groups[gid].v / .cbs).
   * Matches applyPermissionToGroup + checkbox semantics on Add/Edit custom role.
   */
  function featureAllowedFromSavedGroupState(gstate, ref, f) {
    if (!gstate || !gstate.v || !f) return false;
    var v = gstate.v;
    if (v === "super-admin" || v === "admin") return true;
    if (v === "none") return false;
    if (v === "read-only") return !!f.ro;
    if (v === "help-desk") return f.a === "yes";
    if (v === "responder") return f.b === "yes";
    if (v === "analyst") {
      return (f.aa !== undefined ? f.aa : f.a) === "yes";
    }
    if (v === "custom") {
      if (gstate.cbs && Object.prototype.hasOwnProperty.call(gstate.cbs, ref)) {
        return !!gstate.cbs[ref];
      }
      return false;
    }
    return false;
  }

  /**
   * Uniform preset for every permission group (same as add-role buildPermissionsFromPredefinedCloneKey).
   * Used when seeding default custom role data after prototype logout reset.
   */
  function defaultPermissionsUniformPreset(presetKey) {
    var uniform = ["super-admin", "admin", "help-desk", "read-only"];
    if (uniform.indexOf(presetKey) === -1) {
      return { groups: {} };
    }
    var groups = {};
    GROUPS.forEach(function (g) {
      groups[g.id] = { v: presetKey };
    });
    return { groups: groups };
  }

  var LS_PROTO_CUSTOM_NAMES = "sophosProtoCustomRoleNames";
  var LS_PROTO_CUSTOM_DATA = "sophosProtoCustomRoleData";

  /**
   * Prototype default custom roles (name + preset). Single source for logout reset + storage hydration.
   */
  var PROTOTYPE_CUSTOM_ROLE_SEEDS = [
    {
      name: "Tier 1 help desk",
      preset: "help-desk",
      description: "Custom role for your organization.",
    },
  ];

  function getPrototypeLogoutCustomRoleDataMap() {
    var map = {};
    PROTOTYPE_CUSTOM_ROLE_SEEDS.forEach(function (s) {
      map[s.name] = {
        description: s.description,
        permissions: defaultPermissionsUniformPreset(s.preset),
      };
    });
    return map;
  }

  function getPrototypeLogoutCustomRoleNames() {
    return PROTOTYPE_CUSTOM_ROLE_SEEDS.map(function (s) {
      return s.name;
    });
  }

  /**
   * If localStorage lists a seeded role but has no permissions (e.g. before logout or old sessions),
   * merge Help desk–equivalent data so compare / edit role work. Runs at permissions-data load
   * (before add-role.js) so compare initializes with valid data.
   */
  function ensurePrototypeCustomRoleStorageSeeded() {
    if (typeof window === "undefined" || !window.localStorage) return;
    try {
      var names = JSON.parse(window.localStorage.getItem(LS_PROTO_CUSTOM_NAMES) || "[]");
      if (!Array.isArray(names)) names = [];
      var map = JSON.parse(window.localStorage.getItem(LS_PROTO_CUSTOM_DATA) || "{}");
      if (!map || typeof map !== "object") map = {};
      var changed = false;
      PROTOTYPE_CUSTOM_ROLE_SEEDS.forEach(function (s) {
        if (names.indexOf(s.name) === -1) return;
        var rec = map[s.name];
        if (rec && rec.permissions && rec.permissions.groups) return;
        map[s.name] = {
          description: s.description,
          permissions: defaultPermissionsUniformPreset(s.preset),
        };
        changed = true;
      });
      if (changed) {
        window.localStorage.setItem(LS_PROTO_CUSTOM_DATA, JSON.stringify(map));
        if (typeof BroadcastChannel !== "undefined") {
          try {
            var ch = new BroadcastChannel("sophosProtoCustomRoles");
            ch.postMessage({ type: "change" });
            ch.close();
          } catch (bcErr) {
            /* ignore */
          }
        }
      }
    } catch (e) {
      /* ignore */
    }
  }

  global.sophosProtoPermissions = {
    GROUPS: GROUPS,
    featureByRef: featureByRef,
    compareAllowed: compareAllowed,
    annotateTreePositions: annotateTreePositions,
    featureAllowedFromSavedGroupState: featureAllowedFromSavedGroupState,
    defaultPermissionsUniformPreset: defaultPermissionsUniformPreset,
    getPrototypeLogoutCustomRoleDataMap: getPrototypeLogoutCustomRoleDataMap,
    getPrototypeLogoutCustomRoleNames: getPrototypeLogoutCustomRoleNames,
    ensurePrototypeCustomRoleStorageSeeded: ensurePrototypeCustomRoleStorageSeeded,
  };

  if (typeof window !== "undefined" && window.localStorage) {
    ensurePrototypeCustomRoleStorageSeeded();
  }
})(typeof window !== "undefined" ? window : this);
