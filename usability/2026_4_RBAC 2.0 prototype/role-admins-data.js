/**
 * Prototype administrators — global list (administrators.html) + directory for assign-selector.
 */
(function (global) {
  "use strict";

  /** Canonical assignments (same people / roles as administrators.html). */
  global.sophosProtoRoleAdmins = [
    { name: "Alex Morgan", email: "alex.morgan@company.example", role: "Super Admin" },
    { name: "Jordan Lee", email: "jordan.lee@company.example", role: "Admin" },
    { name: "Sam Rivera", email: "sam.rivera@company.example", role: "Admin" },
    { name: "Taylor Chen", email: "taylor.chen@company.example", role: "Help Desk" },
    { name: "Riley Patel", email: "riley.patel@company.example", role: "Security Analyst" },
    { name: "Casey Nguyen", email: "casey.nguyen@company.example", role: "Read-only" },
  ];

  /**
   * Same pool size as the Administrators tab (sophosProtoRoleAdmins).
   * Used for “n of X” on the Available panel.
   */
  global.sophosProtoOrgAdminTotal = global.sophosProtoRoleAdmins.length;

  /**
   * Directory of assignees — same people as administrators.html only.
   * currentRole matches their Role column there.
   */
  global.sophosProtoDirectoryAdmins = global.sophosProtoRoleAdmins.map(function (a) {
    return { name: a.name, currentRole: a.role };
  });

  global.getAdminsForRole = function (roleName) {
    var r = String(roleName || "").trim();
    if (!r) return [];
    return global.sophosProtoRoleAdmins.filter(function (a) {
      return a.role === r;
    });
  };

  /**
   * People in the directory who are not currently shown as assigned to this role.
   * Matching uses the same role strings as getAdminsForRole (canonical role name).
   */
  global.getAvailableAdministratorsForRole = function (roleName) {
    var r = String(roleName || "").trim();
    if (!r) return global.sophosProtoDirectoryAdmins.slice();
    var assigned = global.getAdminsForRole(r);
    var assignedNames = {};
    assigned.forEach(function (a) {
      assignedNames[a.name] = true;
    });
    return global.sophosProtoDirectoryAdmins.filter(function (d) {
      return !assignedNames[d.name];
    });
  };

  /** Selected side: assigned to this role (same Role as Administrators tab). */
  global.getSelectedAdministratorsForRole = function (roleName) {
    return global.getAdminsForRole(roleName).map(function (a) {
      return { name: a.name, currentRole: a.role };
    });
  };
})(typeof window !== "undefined" ? window : globalThis);
