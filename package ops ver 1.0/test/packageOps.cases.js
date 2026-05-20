"use strict";

const packageEntries = [
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

const standardCases = [
  {
    name: "active package lookup by verified sender",
    input: {
      businessId: "beauty_demo",
      senderId: "85261112222",
      sanitizedText: "我想問個package仲有幾多次",
      now: new Date("2026-05-10T00:00:00.000Z")
    },
    expectFound: true,
    expectAutoSendEligible: true,
    expectStatus: "active",
    expectBestPackage: "保濕 facial 6 次套票",
    expectRemainingSessions: 3
  },
  {
    name: "expiring package returns warning flag",
    input: {
      businessId: "beauty_demo",
      senderId: "85261112222",
      sanitizedText: "我個laser package幾時到期？",
      now: new Date("2026-05-10T00:00:00.000Z")
    },
    expectFound: true,
    expectAutoSendEligible: true,
    expectStatus: "active",
    expectBestPackage: "腋下 laser 4 次套票",
    expectRiskFlag: "expiring_soon"
  },
  {
    name: "expired package requires staff review",
    input: {
      businessId: "beauty_demo",
      senderId: "85263334444",
      sanitizedText: "我個HIFU package仲有幾多次",
      now: new Date("2026-05-10T00:00:00.000Z")
    },
    expectFound: true,
    expectAutoSendEligible: false,
    expectStatus: "expired",
    expectRiskFlag: "expired"
  },
  {
    name: "disputed package requires staff review",
    input: {
      businessId: "beauty_demo",
      senderId: "85265556666",
      sanitizedText: "我個去印package仲有幾多次",
      now: new Date("2026-05-10T00:00:00.000Z")
    },
    expectFound: true,
    expectAutoSendEligible: false,
    expectRiskFlag: "prior_complaint"
  },
  {
    name: "sender mismatch does not expose package facts",
    input: {
      businessId: "beauty_demo",
      senderId: "85269990000",
      sanitizedText: "我想問May個package仲有幾多次",
      now: new Date("2026-05-10T00:00:00.000Z")
    },
    expectFound: false,
    expectAutoSendEligible: false,
    expectReason: "No verified package record matched this sender."
  }
];

module.exports = {
  packageEntries,
  standardCases
};
