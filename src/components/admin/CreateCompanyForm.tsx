// src/components/admin/CreateCompanyForm.tsx
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CreateCompanyFormProps {
  onSuccess?: () => void; // Callback after successful creation
}

const CreateCompanyForm: React.FC<CreateCompanyFormProps> = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    name: "",
    industry: "",
    location: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("https://p-analytics.onrender.com/api/companies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to create company");
      }

      setFormData({ name: "", industry: "", location: "" });
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Company Name</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Enter company name"
          required
        />
      </div>

      <div>
        <Label htmlFor="industry">Industry</Label>
        <Input
          id="industry"
          name="industry"
          value={formData.industry}
          onChange={handleChange}
          placeholder="Enter industry"
          required
        />
      </div>

      <div>
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          name="location"
          value={formData.location}
          onChange={handleChange}
          placeholder="Enter location"
          required
        />
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <Button type="submit" disabled={loading}>
        {loading ? "Creating..." : "Create Company"}
      </Button>
    </form>
  );
};

export default CreateCompanyForm;
