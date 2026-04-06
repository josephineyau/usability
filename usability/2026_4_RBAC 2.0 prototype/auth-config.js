/**
 * Usability-test auth (prototype only). Type A: fixed credentials. Type B (admin):
 * one-time passwords from the pool; consumed on logout (localStorage).
 */
(function (global) {
  "use strict";

  var LS_CONSUMED_ADMIN_PASSWORDS = "sophosProtoConsumedAdminPasswords";

  global.SOPHOS_PROTO_UTEST = {
    /** Type A — fixed; do not expire unless this file is edited. */
    typeA: {
      dan: "m!$nQfu7FLuDC&LD6%",
      jo: "$z7Y*hRYcFEJdnFmY6",
    },
    /** Type B — shared username; each password from the list is single-use after logout. */
    adminUsername: "admin",
    adminPasswords: [
      "ds!kpKz$9qC8CCtXcv",
      "P2ZgjrS6pyzvVXU%jp",
      "aFkxFM35jYVY8X@sdZ",
      "!97sjAMMVhqwTQJ@HA",
      "EGaWaj7@BSM7&BxPyZ",
      "5tKD2daG@S3XdD$*GM",
      "PNTMtwA&AFM&wZqm%&",
      "F845&ZXv759BqmJTdL",
      "CdMP%9MAWxdTEMznHD",
      "%CS3P&Vhjgk%WAFU*3",
      "L6!uZDvSbAzNMbx6H$",
      "4AN&WzGqfp9G9*AXC&",
      "3!@FDkAvJ6ULUGJ$ZR",
      "aqcB58#wsZxJG%zfg6",
      "x*$nYbwV8SKb4pynx8",
      "7KwpZ@pPnCMS%dK94*",
      "usv&C4fLqZtp%3DMBF",
      "%z5J3h$84vuHv%hTb&",
      "pvMH5SVRMwQUNLfSvw",
      "n#$k6dNyBaFhSRzMBC",
      "6b%LNWgx@5w&amJYsN",
      "DWc3VqJCK58h%Q3CEm",
      "CygnWKqEm#ynKdstx$",
      "W3RA&AS5QSUJc&G@HS",
      "u7QMYQmbKX%qv$4@*w",
      "8mGG2nxTy7p%h!RTvk",
      "S!kc#FU$km@!p!sLrb",
      "L%XxgUYc#FaYxUn&CJ",
      "xPvNVrHtk5ZLxSu892",
      "Wz4KVw%Hf4GUuTXFcy",
    ],
    LS_CONSUMED_ADMIN_PASSWORDS: LS_CONSUMED_ADMIN_PASSWORDS,
  };
})(typeof window !== "undefined" ? window : this);
