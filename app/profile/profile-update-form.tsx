"use client";

import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

type UserType = "STUDENT" | "PROPERTY_OWNER";

type ProfileData = {
  name: string;
  email: string;
  phone: string;
  userType: UserType;
  university: string | null;
  stream: "ENGINEERING" | "MEDICAL" | null;
  serviceType: "ACCOMMODATION" | "FOOD" | "BOTH" | null;
  businessType: "INDIVIDUAL" | "COMPANY" | "INSTITUTION" | null;
};

type Props = {
  initialUser: ProfileData;
};

const NONE_VALUE = "NONE";

export default function ProfileUpdateForm({ initialUser }: Props) {
  const { toast } = useToast();
  const { update } = useSession();
  const router = useRouter();

  const [savedUser, setSavedUser] = useState<ProfileData>(initialUser);

  const [name, setName] = useState(savedUser.name || "");
  const [phone, setPhone] = useState(savedUser.phone || "");
  const [university, setUniversity] = useState(savedUser.university || "");
  const [stream, setStream] = useState<string>(savedUser.stream || NONE_VALUE);
  const [serviceType, setServiceType] = useState<string>(savedUser.serviceType || NONE_VALUE);
  const [businessType, setBusinessType] = useState<string>(savedUser.businessType || NONE_VALUE);
  const [isSaving, setIsSaving] = useState(false);

  const isStudent = savedUser.userType === "STUDENT";

  const isChanged = useMemo(() => {
    return (
      name.trim() !== (savedUser.name || "") ||
      phone.trim() !== (savedUser.phone || "") ||
      university.trim() !== (savedUser.university || "") ||
      stream !== (savedUser.stream || NONE_VALUE) ||
      serviceType !== (savedUser.serviceType || NONE_VALUE) ||
      businessType !== (savedUser.businessType || NONE_VALUE)
    );
  }, [
    name,
    phone,
    university,
    stream,
    serviceType,
    businessType,
    savedUser,
  ]);

  const resetForm = () => {
    setName(savedUser.name || "");
    setPhone(savedUser.phone || "");
    setUniversity(savedUser.university || "");
    setStream(savedUser.stream || NONE_VALUE);
    setServiceType(savedUser.serviceType || NONE_VALUE);
    setBusinessType(savedUser.businessType || NONE_VALUE);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isChanged) {
      toast({ title: "No changes", description: "Update a field before saving." });
      return;
    }

    setIsSaving(true);

    try {
      const payload: Record<string, any> = {
        name: name.trim(),
        phone: phone.trim(),
      };

      if (isStudent) {
        payload.university = university.trim();
        payload.stream = stream === NONE_VALUE ? null : stream;
        payload.serviceType = serviceType === NONE_VALUE ? null : serviceType;
      } else {
        payload.businessType = businessType === NONE_VALUE ? null : businessType;
      }

      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Failed to update profile");
      }

      await update({
        name: data.user?.name,
        phone: data.user?.phone,
        university: data.user?.university,
      });

      const nextSavedUser: ProfileData = {
        ...savedUser,
        name: data.user?.name ?? savedUser.name,
        phone: data.user?.phone ?? savedUser.phone,
        university: data.user?.university ?? null,
        stream: data.user?.stream ?? null,
        serviceType: data.user?.serviceType ?? null,
        businessType: data.user?.businessType ?? null,
      };

      setSavedUser(nextSavedUser);
      setName(nextSavedUser.name || "");
      setPhone(nextSavedUser.phone || "");
      setUniversity(nextSavedUser.university || "");
      setStream(nextSavedUser.stream || NONE_VALUE);
      setServiceType(nextSavedUser.serviceType || NONE_VALUE);
      setBusinessType(nextSavedUser.businessType || NONE_VALUE);

      // Re-fetch server-rendered profile cards from DB so current data updates immediately.
      router.refresh();

      toast({
        title: "Profile updated",
        description: "Your profile details were saved successfully.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Update failed",
        description: error instanceof Error ? error.message : "Something went wrong",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your full name"
            required
            maxLength={80}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" value={savedUser.email} disabled readOnly />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Enter phone number"
            required
            maxLength={20}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="userType">User Type</Label>
          <Input
            id="userType"
            value={savedUser.userType === "STUDENT" ? "Student" : "Property Owner"}
            disabled
            readOnly
          />
        </div>
      </div>

      {isStudent && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="university">University</Label>
            <Input
              id="university"
              value={university}
              onChange={(e) => setUniversity(e.target.value)}
              placeholder="Enter university name"
              maxLength={120}
            />
          </div>

          <div className="space-y-2">
            <Label>Stream</Label>
            <Select value={stream} onValueChange={setStream}>
              <SelectTrigger>
                <SelectValue placeholder="Select stream" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE_VALUE}>Not set</SelectItem>
                <SelectItem value="ENGINEERING">Engineering</SelectItem>
                <SelectItem value="MEDICAL">Medical</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Service Need</Label>
            <Select value={serviceType} onValueChange={setServiceType}>
              <SelectTrigger>
                <SelectValue placeholder="Select service" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE_VALUE}>Not set</SelectItem>
                <SelectItem value="ACCOMMODATION">Accommodation</SelectItem>
                <SelectItem value="FOOD">Food</SelectItem>
                <SelectItem value="BOTH">Both</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {!isStudent && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Business Type</Label>
            <Select value={businessType} onValueChange={setBusinessType}>
              <SelectTrigger>
                <SelectValue placeholder="Select business type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE_VALUE}>Not set</SelectItem>
                <SelectItem value="INDIVIDUAL">Individual</SelectItem>
                <SelectItem value="COMPANY">Company</SelectItem>
                <SelectItem value="INSTITUTION">Institution</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-3 pt-1">
        <Button type="submit" disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
        <Button type="button" variant="outline" onClick={resetForm} disabled={isSaving || !isChanged}>
          Reset
        </Button>
      </div>
    </form>
  );
}
