Permissions matrix CSV exports — how to read and fill them
============================================================

WHAT THESE FILES ARE
--------------------
These CSVs mirror the *data model* behind the prototype (permissions-data.js),
not a pixel-perfect export of every visual row in the browser.

1) permissions_feature_catalog.csv
   - One row per *feature line* in the flat list inside each parent group.
   - The gray "Parent-group" bar in the UI is NOT a separate row here.
     Instead, every row has Parent_Group_ID + Parent_Group_Name so you know
     which group it belongs to (same as the collapsible section in the UI).
   - Sort_Order is the order of that feature within its group (top to bottom),
     matching the order in the code.

2) permissions_feature_links.csv
   - Directional rules only: "when feature A is granted, also grant B" (and
     typically lock B while A is on).
   - Covers Alert notifications (Take action → Read alerts) and suggested
     Reporting rules (Create/Update → Read reports). Reporting suggestion
     rows are marked "Confirm with product" in Rule_Notes.

3) permissions_feature_link_groups.csv
   - Which features belong to the same *linked subtree* under a subcategory
     (Alert notifications vs Reporting). This is what the UI tree shows as
     linked/indented rows — it is NOT the same as the dependency list.
   - Use this sheet to see "who is in the group"; use feature_links for
     "if A then B" behavior.

4) permissions_roles.csv
   - Short reference for predefined role keys vs labels.


HOW COLUMNS MAP TO THE PERMISSIONS MATRIX (left to right)
---------------------------------------------------------
After the "Feature / product" column, the matrix columns are (in the UI):

  Super Admin | Admin | Responder | Help Desk | Security Analyst | Read-only

The catalog CSV uses the same order in the role columns:

  Super_Admin   → In code, this role is always "granted" for every feature.
  Admin         → Same: always granted for every feature in the prototype.
  Responder     → Comes from the "b" field in permissions-data.js (yes/no).
  Help_Desk     → Comes from the "a" field.
  Security_Analyst → In the prototype, same source as Help Desk ("a").
  Read_only     → Comes from "ro" (read-only friendly features = yes).

So if you edit the spreadsheet to change dummy data, you are editing the same
logical values the UI uses: a, b, ro, plus the rule that Super Admin/Admin
see everything as granted.


WHY IT CAN LOOK "NOT LIKE THE UI"
---------------------------------
- You will NOT see a row for the gray bar itself — only for features under it.
- Super_Admin and Admin columns are all "yes" in the export because that is
  how compareAllowed() works today, not because the sheet is wrong.
- Custom roles are stored per user in the prototype (localStorage), not in
  permissions-data.js, so they are not in this export unless you add columns.


HOW TO FILL THE CATALOG WHEN YOU ADD OR CHANGE FEATURES
--------------------------------------------------------
1. Pick Parent_Group_ID (stable id) and Parent_Group_Name (label on gray bar).
2. Set Sort_Order within that group (1, 2, 3, ...).
3. Set Row_Kind:
   STANDALONE_FEATURE = normal line
   SUBCATEGORY        = bold section header with children (e.g. "Alert notifications")
   SUBITEM_LABEL      = label row under a subcategory (e.g. "Configure alert recipients")
   LINKED_FEATURE     = indented row under a subcategory (tree lines)
4. Give each grantable line a stable Feature_ID (e.g. general:9). Use the same
   id in the links sheet for dependencies.
5. Display_Name = exact text in the "Feature / product" column.
6. Fill Read_only, Help_Desk, Responder, Security_Analyst with yes/no according
   to your product rules. Leave Super_Admin/Admin as yes unless your rules change.
