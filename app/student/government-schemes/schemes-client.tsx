"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  GOVERNMENT_SCHEMES,
  SocialCategory,
  Gender,
  QualificationLevel,
  StudentEligibilityProfile,
  isEligibleForScheme
} from "@/lib/government-schemes";

type UserBasics = {
  university: string | null;
  stream: string | null;
};

type Props = {
  userBasics: UserBasics;
};

const defaultProfile: StudentEligibilityProfile = {
  qualificationLevel: "UG",
  previousMarksPercent: 0,
  socialCategory: "GENERAL",
  domicileState: "",
  annualIncome: 0,
  hasIncomeCertificate: false,
  hasCasteCertificate: false,
  hasDomicileCertificate: false,
  hasBankAccount: false,
  isBankAadhaarLinked: false,
  hasAadhaarCard: false,
  hasAdmissionProof: false,
  gender: "OTHER",
  attendancePercent: 0,
  notReceivingAnotherScholarship: false,
  isWorkingWoman: false
};

export default function SchemesClient({ userBasics: _userBasics }: Props) {
  const [profile, setProfile] = useState<StudentEligibilityProfile>(defaultProfile);

  const missingFields = useMemo(() => {
    const missing: string[] = [];

    if (!profile.qualificationLevel) missing.push("Educational Qualification");
    if (profile.previousMarksPercent <= 0) missing.push("Previous Marks/Percentage");
    if (profile.annualIncome <= 0) missing.push("Annual Family Income");
    if (!profile.socialCategory) missing.push("Category/Caste");
    if (!profile.domicileState.trim()) missing.push("Domicile State");
    if (!profile.hasIncomeCertificate) missing.push("Income Certificate");

    if (profile.socialCategory !== "GENERAL" && !profile.hasCasteCertificate) {
      missing.push("Caste Certificate");
    }

    if (!profile.hasDomicileCertificate) missing.push("Domicile Certificate");
    if (!profile.hasBankAccount) missing.push("Student Bank Account");
    if (!profile.isBankAadhaarLinked) missing.push("Aadhaar-linked Bank Account");
    if (!profile.hasAadhaarCard) missing.push("Aadhaar Card");
    if (!profile.hasAdmissionProof) missing.push("Admission Proof");
    if (profile.attendancePercent <= 0) missing.push("Attendance Percentage");

    if (!profile.notReceivingAnotherScholarship) missing.push("Not Receiving Another Scholarship");

    return missing;
  }, [profile]);

  const isProfileComplete = missingFields.length === 0;

  const sectioned = useMemo(() => {
    return {
      students: GOVERNMENT_SCHEMES.filter((s) => s.section === "Students"),
      food: GOVERNMENT_SCHEMES.filter((s) => s.section === "Food & Living Support")
    };
  }, []);

  const counts = useMemo(() => {
    if (!isProfileComplete) {
      return { eligible: 0, notEligible: 0, total: GOVERNMENT_SCHEMES.length };
    }

    const eligible = GOVERNMENT_SCHEMES.filter((s) => isEligibleForScheme(s.id, profile)).length;
    return {
      eligible,
      notEligible: GOVERNMENT_SCHEMES.length - eligible,
      total: GOVERNMENT_SCHEMES.length
    };
  }, [profile, isProfileComplete]);

  const updateBool = (key: keyof StudentEligibilityProfile, value: boolean) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
  };

  const updateCategory = (value: string) => {
    setProfile((prev) => ({ ...prev, socialCategory: value as SocialCategory }));
  };

  const updateGender = (value: string) => {
    setProfile((prev) => ({ ...prev, gender: value as Gender }));
  };

  const updateQualification = (value: string) => {
    setProfile((prev) => ({ ...prev, qualificationLevel: value as QualificationLevel }));
  };

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle>Complete Profile For Eligibility Check</CardTitle>
          <CardDescription>
            Fill all required profile details first. Eligibility will be calculated only after profile completion.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Educational Qualification</Label>
              <Select value={profile.qualificationLevel} onValueChange={updateQualification}>
                <SelectTrigger>
                  <SelectValue placeholder="Select qualification" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DIPLOMA">Diploma</SelectItem>
                  <SelectItem value="UG">UG</SelectItem>
                  <SelectItem value="PG">PG</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={profile.socialCategory} onValueChange={updateCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GENERAL">General</SelectItem>
                  <SelectItem value="SC">SC</SelectItem>
                  <SelectItem value="ST">ST</SelectItem>
                  <SelectItem value="OBC">OBC</SelectItem>
                  <SelectItem value="EWS">EWS</SelectItem>
                  <SelectItem value="EBC">EBC</SelectItem>
                  <SelectItem value="DNT">DNT</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Gender</Label>
              <Select value={profile.gender} onValueChange={updateGender}>
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MALE">Male</SelectItem>
                  <SelectItem value="FEMALE">Female</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Annual Family Income (INR)</Label>
              <Input
                type="number"
                min={0}
                value={profile.annualIncome}
                onChange={(e) =>
                  setProfile((prev) => ({
                    ...prev,
                    annualIncome: Number.isFinite(Number(e.target.value)) ? Number(e.target.value) : 0
                  }))
                }
              />
              <p className="text-xs text-gray-500">Below 2 lakh: more schemes; 2-8 lakh: limited schemes.</p>
            </div>

            <div className="space-y-2">
              <Label>Previous Marks (%)</Label>
              <Input
                type="number"
                min={0}
                max={100}
                value={profile.previousMarksPercent}
                onChange={(e) =>
                  setProfile((prev) => ({
                    ...prev,
                    previousMarksPercent: Number.isFinite(Number(e.target.value)) ? Number(e.target.value) : 0
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Domicile State</Label>
              <Input
                value={profile.domicileState}
                onChange={(e) => setProfile((prev) => ({ ...prev, domicileState: e.target.value }))}
                placeholder="e.g. Maharashtra"
              />
            </div>

            <div className="space-y-2">
              <Label>Attendance (%)</Label>
              <Input
                type="number"
                min={0}
                max={100}
                value={profile.attendancePercent}
                onChange={(e) =>
                  setProfile((prev) => ({
                    ...prev,
                    attendancePercent: Number.isFinite(Number(e.target.value)) ? Number(e.target.value) : 0
                  }))
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label className="flex items-center gap-2 text-sm">
              <Checkbox checked={profile.hasIncomeCertificate} onCheckedChange={(v) => updateBool("hasIncomeCertificate", Boolean(v))} />
              Income Certificate available
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox checked={profile.hasCasteCertificate} onCheckedChange={(v) => updateBool("hasCasteCertificate", Boolean(v))} />
              Caste Certificate available (if applicable)
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox checked={profile.hasDomicileCertificate} onCheckedChange={(v) => updateBool("hasDomicileCertificate", Boolean(v))} />
              Domicile Certificate available
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox checked={profile.hasBankAccount} onCheckedChange={(v) => updateBool("hasBankAccount", Boolean(v))} />
              Student bank account available
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox checked={profile.isBankAadhaarLinked} onCheckedChange={(v) => updateBool("isBankAadhaarLinked", Boolean(v))} />
              Bank account is Aadhaar-linked
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox checked={profile.hasAadhaarCard} onCheckedChange={(v) => updateBool("hasAadhaarCard", Boolean(v))} />
              Aadhaar card available
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox checked={profile.hasAdmissionProof} onCheckedChange={(v) => updateBool("hasAdmissionProof", Boolean(v))} />
              Admission proof available (bonafide/fee receipt/college ID)
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox checked={profile.notReceivingAnotherScholarship} onCheckedChange={(v) => updateBool("notReceivingAnotherScholarship", Boolean(v))} />
              I am not receiving another scholarship
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox checked={profile.isWorkingWoman} onCheckedChange={(v) => updateBool("isWorkingWoman", Boolean(v))} />
              I am a working woman
            </label>
          </div>

          {!isProfileComplete && (
            <div className="rounded-lg border border-amber-300 bg-amber-50 p-4">
              <p className="text-sm font-medium text-amber-900">Complete profile required before eligibility check.</p>
              <p className="text-sm text-amber-800 mt-1">Missing: {missingFields.join(", ")}</p>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <Badge className="bg-green-600 hover:bg-green-600">Eligible: {counts.eligible}</Badge>
            <Badge variant="destructive">Not Eligible: {counts.notEligible}</Badge>
            <Badge variant="secondary">Total: {counts.total}</Badge>
          </div>
        </CardContent>
      </Card>

      {isProfileComplete ? (
        <>
          <SchemeSection title="Students Ke Liye Government Schemes" items={sectioned.students} profile={profile} />
          <SchemeSection title="Food & Living Support Schemes" items={sectioned.food} profile={profile} />
        </>
      ) : (
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle>Eligibility Results Locked</CardTitle>
            <CardDescription>
              Complete all mandatory profile details above to view scheme-wise eligibility.
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  );
}

type SectionProps = {
  title: string;
  items: typeof GOVERNMENT_SCHEMES;
  profile: StudentEligibilityProfile;
};

function SchemeSection({ title, items, profile }: SectionProps) {
  return (
    <Card className="border-0 shadow-md">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map((scheme) => {
          const eligible = isEligibleForScheme(scheme.id, profile);
          return (
            <div key={scheme.id} className="rounded-xl border p-4 bg-white">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-gray-900">{scheme.id}. {scheme.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">Category: {scheme.category}</p>
                </div>
                <Badge className={eligible ? "bg-green-600 hover:bg-green-600" : "bg-red-600 hover:bg-red-600"}>
                  {eligible ? "Eligible" : "Not Eligible"}
                </Badge>
              </div>
              <p className="text-sm text-gray-700 mt-2"><span className="font-medium">Benefit:</span> {scheme.benefit}</p>
              <p className="text-sm text-gray-700 mt-1"><span className="font-medium">Target:</span> {scheme.target}</p>
              {scheme.applicationUrl && (
                <div className="mt-3">
                  <Link href={scheme.applicationUrl} target="_blank" rel="noopener noreferrer">
                    <Button size="sm" variant="outline">Apply / View Scheme</Button>
                  </Link>
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
