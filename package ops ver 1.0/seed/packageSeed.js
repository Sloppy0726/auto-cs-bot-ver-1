"use strict";

module.exports = [
  {
    id: "pkg_may_hydrafacial_active",
    businessId: "beauty_demo",
    customerExternalId: "85261112222",
    customerName: "May",
    packageName: "保濕 facial 6 次套票",
    serviceName: "保濕 facial",
    totalSessions: 6,
    usedSessions: 3,
    expiryDate: "2026-07-31",
    lastServiceDate: "2026-05-01",
    termsRef: "beauty_package_standard_terms",
    status: "active"
  },
  {
    id: "pkg_may_laser_expiring",
    businessId: "beauty_demo",
    customerExternalId: "85261112222",
    customerName: "May",
    packageName: "腋下 laser 4 次套票",
    serviceName: "腋下 laser",
    totalSessions: 4,
    usedSessions: 3,
    expiryDate: "2026-05-20",
    lastServiceDate: "2026-04-20",
    termsRef: "beauty_package_standard_terms",
    status: "active"
  },
  {
    id: "pkg_carmen_expired",
    businessId: "beauty_demo",
    customerExternalId: "85263334444",
    customerName: "Carmen",
    packageName: "HIFU 3 次套票",
    serviceName: "HIFU",
    totalSessions: 3,
    usedSessions: 1,
    expiryDate: "2026-04-30",
    lastServiceDate: "2026-03-12",
    termsRef: "beauty_package_standard_terms",
    status: "active"
  },
  {
    id: "pkg_amy_disputed",
    businessId: "beauty_demo",
    customerExternalId: "85265556666",
    customerName: "Amy",
    packageName: "去印護理 5 次套票",
    serviceName: "去印護理",
    totalSessions: 5,
    usedSessions: 2,
    expiryDate: "2026-09-30",
    lastServiceDate: "2026-04-18",
    termsRef: "beauty_package_standard_terms",
    status: "disputed",
    riskFlags: ["prior_complaint"]
  }
];
