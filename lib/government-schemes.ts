export type SchemeCategory =
  | "Scholarship"
  | "Merit Scholarship"
  | "Accommodation"
  | "Loan Support"
  | "Food Support";

export type SocialCategory = "SC" | "ST" | "OBC" | "EWS" | "EBC" | "DNT" | "GENERAL";
export type Gender = "MALE" | "FEMALE" | "OTHER";
export type QualificationLevel = "DIPLOMA" | "UG" | "PG" | "OTHER";

export type StudentEligibilityProfile = {
  qualificationLevel: QualificationLevel;
  previousMarksPercent: number;
  socialCategory: SocialCategory;
  domicileState: string;
  annualIncome: number;
  hasIncomeCertificate: boolean;
  hasCasteCertificate: boolean;
  hasDomicileCertificate: boolean;
  hasBankAccount: boolean;
  isBankAadhaarLinked: boolean;
  hasAadhaarCard: boolean;
  hasAdmissionProof: boolean;
  gender: Gender;
  attendancePercent: number;
  notReceivingAnotherScholarship: boolean;
  isWorkingWoman: boolean;
};

export type GovernmentScheme = {
  id: number;
  name: string;
  category: SchemeCategory;
  benefit: string;
  target: string;
  section: "Students" | "Food & Living Support";
  applicationUrl?: string;
};

export const GOVERNMENT_SCHEMES: GovernmentScheme[] = [
  {
    id: 1,
    name: "Post Matric Scholarship Scheme",
    category: "Scholarship",
    benefit: "Tuition fees + hostel + maintenance allowance",
    target: "SC/ST/OBC/EWS students",
    section: "Students",
    applicationUrl: "https://scholarships.gov.in/"
  },
  {
    id: 2,
    name: "Top Class Education Scheme for SC Students",
    category: "Scholarship",
    benefit: "Full financial support (fees + living expenses)",
    target: "SC students in top colleges",
    section: "Students",
    applicationUrl: "https://scholarships.gov.in/"
  },
  {
    id: 3,
    name: "Central Sector Scheme of Scholarships for College and University Students",
    category: "Merit Scholarship",
    benefit: "INR 10,000-INR 20,000 per year",
    target: "Meritorious students",
    section: "Students",
    applicationUrl: "https://scholarships.gov.in/"
  },
  {
    id: 4,
    name: "National Means-cum-Merit Scholarship (NMMS)",
    category: "Scholarship",
    benefit: "Financial aid for economically weaker students",
    target: "Economically weaker students",
    section: "Students",
    applicationUrl: "https://scholarships.gov.in/"
  },
  {
    id: 5,
    name: "Hostel Subsidy Scheme for SC/ST/OBC Students",
    category: "Accommodation",
    benefit: "Free / subsidized hostel stay",
    target: "SC/ST/OBC students who need hostel support",
    section: "Students",
    applicationUrl: "https://mahadbt.maharashtra.gov.in/"
  },
  {
    id: 6,
    name: "Working Women Hostel Scheme",
    category: "Accommodation",
    benefit: "Safe & affordable housing for women",
    target: "Working women",
    section: "Students",
    applicationUrl: "https://wcd.nic.in/schemes/working-women-hostel"
  },
  {
    id: 7,
    name: "Dr. Ambedkar Central Sector Scheme of Interest Subsidy on Education Loan",
    category: "Loan Support",
    benefit: "Interest subsidy during study period",
    target: "Students with education loan from weaker sections",
    section: "Students",
    applicationUrl: "https://socialjustice.gov.in/schemes/25"
  },
  {
    id: 8,
    name: "PM-YASASVI Scheme",
    category: "Scholarship",
    benefit: "Financial support for OBC/EBC/DNT students",
    target: "OBC/EBC/DNT students",
    section: "Students",
    applicationUrl: "https://yet.nta.ac.in/"
  },
  {
    id: 9,
    name: "Pradhan Mantri Garib Kalyan Anna Yojana",
    category: "Food Support",
    benefit: "Free ration (5kg grains per person)",
    target: "Economically weaker households",
    section: "Food & Living Support",
    applicationUrl: "https://dfpd.gov.in/pmgkay.htm"
  },
  {
    id: 10,
    name: "Public Distribution System (PDS)",
    category: "Food Support",
    benefit: "Subsidized food grains",
    target: "Eligible low-income households",
    section: "Food & Living Support",
    applicationUrl: "https://nfsa.gov.in/"
  }
];

export function isEligibleForScheme(
  schemeId: number,
  profile: StudentEligibilityProfile
): boolean {
  const hasCoreDocuments =
    profile.hasIncomeCertificate &&
    profile.hasDomicileCertificate &&
    profile.hasBankAccount &&
    profile.isBankAadhaarLinked &&
    profile.hasAadhaarCard &&
    profile.hasAdmissionProof;

  if (!hasCoreDocuments) {
    return false;
  }

  const hasCommonAcademicConditions =
    profile.attendancePercent >= 75 &&
    profile.notReceivingAnotherScholarship;

  if (!hasCommonAcademicConditions) {
    return false;
  }

  const isEconomicallyWeaker = profile.annualIncome <= 200000;
  const inSocialReservedGroup = ["SC", "ST", "OBC", "EWS"].includes(profile.socialCategory);
  const inObcEbcDntGroup = ["OBC", "EBC", "DNT"].includes(profile.socialCategory);
  const hasCasteDocsForReserved =
    profile.socialCategory === "GENERAL" || profile.hasCasteCertificate;

  if (!hasCasteDocsForReserved) {
    return false;
  }

  switch (schemeId) {
    case 1:
      return inSocialReservedGroup && profile.previousMarksPercent >= 60;
    case 2:
      return profile.socialCategory === "SC" && profile.previousMarksPercent >= 75;
    case 3:
      return profile.previousMarksPercent >= 75;
    case 4:
      return isEconomicallyWeaker;
    case 5:
      return ["SC", "ST", "OBC"].includes(profile.socialCategory);
    case 6:
      return profile.gender === "FEMALE" && profile.isWorkingWoman;
    case 7:
      return isEconomicallyWeaker;
    case 8:
      return inObcEbcDntGroup;
    case 9:
      return isEconomicallyWeaker;
    case 10:
      return profile.annualIncome <= 800000;
    default:
      return false;
  }
}
