Permissions matrix CSV exports — how to read and fill them
============================================================

WHAT THESE FILES ARE
--------------------
These CSVs mirror the *data model* behind the prototype (permissions-data.js),
not a pixel-perfect export of every visual row in the browser.

1) permissions_roles.csv  (**authoritative catalog for canned roles + features**)
   - One row per line in the permissions UI under each parent group.
   - Columns: Parent_Group_ID, Parent_Group_Name, Sort_Order, Row_Kind,
     Feature_ID, Display_Name, Super_Admin, Admin, Responder, Help_Desk,
     Security_Analyst, Read_only (yes/no).
   - Row_Kind: SUBCATEGORY (bold header), SUBITEM_LABEL (label row),
     LINKED_FEATURE (tree / indented), STANDALONE_FEATURE.
   - Optional **Tree_Group** (integer): use when two or more LINKED_FEATURE
     blocks sit back-to-back with no other row between them. Give every line
     in the first visual bracket run the same number (e.g. 1), then every
     line in the next run the next number (e.g. 2). Omit the column or leave
     cells blank for a single linked run (or legacy CSVs).
   - After editing, regenerate `permissions-data.js` → `GROUPS` by running:
       node scripts/build-groups-from-permissions-roles-csv.js
     Replace the entire `var GROUPS = [ ... ];` block in permissions-data.js
     with the script output (from `var GROUPS` through the closing `];`).
   - Column → JS fields: Responder=`b`, Help_Desk=`a`, Security_Analyst=`aa`,
     Read_only=`ro` (boolean), Super_Admin/Admin enforced in compare logic.

2) permissions_feature_catalog.csv
   - Legacy / alternate catalog layout; not auto-synced to the app.
   - Prefer permissions_roles.csv for updates that should appear in the UI.

3) permissions_feature_links.csv
   - Directional rules: "when feature A is granted, also grant B".
   - The Add-role UI still implements one hardcoded Alerts link in add-role.js
     (see ALERT_TAKE_ACTION_REF / ALERT_READ_REF). Update those refs if you
     change the Alerts feature indices in the catalog.

4) permissions_feature_link_groups.csv
   - Linked subtrees reference (documentation).


HOW COLUMNS MAP TO THE PERMISSIONS MATRIX (left to right)
---------------------------------------------------------
After the "Feature / product" column, the matrix columns are (in the UI):

  Super Admin | Admin | Responder | Help Desk | Security Analyst | Read-only

The catalog CSV uses the same order in the role columns:

  Super_Admin   → In code, this role is always "granted" for every feature.
  Admin         → Same: always granted for every feature in the prototype.
  Responder     → Comes from the "b" field in permissions-data.js (yes/no).
  Help_Desk     → Comes from the "a" field.
  Security_Analyst → Comes from the "aa" field (analyst role key).
  Read_only     → Comes from "ro" (read-only friendly features = yes).


WHY IT CAN LOOK "NOT LIKE THE UI"
---------------------------------
- SUBCATEGORY rows are section headers (no checkbox in the permission column
  on predefined view; on custom role edit, subitems still get checkboxes).
- Super_Admin and Admin columns are often all "yes" in the sheet; the app
  still applies compareAllowed() rules for display.
- Custom roles are stored per browser (localStorage). Changing feature IDs
  invalidates old saved checkbox maps until roles are re-saved.


HOW TO FILL THE CATALOG WHEN YOU ADD OR CHANGE FEATURES
--------------------------------------------------------
1) Pick Parent_Group_ID (stable id) and Parent_Group_Name (group title).
2) Set Sort_Order within that group (1, 2, 3, ...).
3) Set Row_Kind (see above).
4) Feature_ID (e.g. general:6) should match array index in code: first row
   in that group is :0, next :1, … after sorting by Sort_Order.
5) Display_Name = exact UI label.
6) Fill role columns with yes/no, then regenerate permissions-data.js GROUPS.
