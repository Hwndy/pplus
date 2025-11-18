'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/components/auth/AuthContext';

interface Company {
  id: number;
  company_name: string;
}

interface Category {
  name: string;
}

interface InsightEntry {
  id: number;
  category: string;
  analysis: string;
}

interface OutcomeInsightFormProps {
  onClose: (refresh: boolean) => void;
  initialData?: {
    id?: number;
    company_id?: number;
    date?: string;
    analyst_note?: string | null;
    supervisor_note?: string | null;
    insights?: { category: string; analysis: string }[];
  };
  isEdit?: boolean;
}

/* --------------------------------------------------------------- */
/*                     MAIN COMPONENT                              */
/* --------------------------------------------------------------- */
export function OutcomeInsightForm({
  onClose,
  initialData,
  isEdit = false,
}: OutcomeInsightFormProps) {
  const { token } = useAuth();
  const BASE_URL = 'https://pplus-07cr.onrender.com/api';

  /* --------------------- STATE --------------------- */
  const [companies, setCompanies] = useState<Company[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const [formData, setFormData] = useState({
    company_id: initialData?.company_id ?? 0,
    date:
      initialData?.date?.split('T')[0] ??
      new Date().toISOString().split('T')[0],
    analyst_note: initialData?.analyst_note ?? '',
    supervisor_note: initialData?.supervisor_note ?? '',
  });

  const getInitialEntries = (): InsightEntry[] => {
    if (!initialData?.insights?.length) {
      return [{ id: Date.now(), category: '', analysis: '' }];
    }
    return initialData.insights.map((i, idx) => ({
      id: Date.now() + idx,
      category: i.category || '',
      analysis: i.analysis || '',
    }));
  };
  const [entries, setEntries] = useState<InsightEntry[]>(getInitialEntries());

  /* --------------------- FETCH COMPANIES --------------------- */
  const fetchCompanies = async () => {
    setLoadingCompanies(true);
    try {
      const res = await fetch(`${BASE_URL}/companies/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();

      if (json.success && Array.isArray(json.data?.data)) {
        const rawCompanies = json.data.data;

        // Optional: Deduplicate by id (uncomment if needed)
        // const uniqueCompanies = Array.from(
        //   new Map(rawCompanies.map((c: Company) => [c.id, c])).values()
        // );
        // setCompanies(uniqueCompanies);

        setCompanies(rawCompanies);
      } else {
        toast.error(json.message ?? 'Failed to load companies');
        setCompanies([]);
      }
    } catch (err) {
      console.error('Fetch companies error:', err);
      toast.error('Network error loading companies');
      setCompanies([]);
    } finally {
      setLoadingCompanies(false);
    }
  };

  /* --------------------- FETCH CATEGORIES (Analysis only) --------------------- */
  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      const res = await fetch(
        `${BASE_URL}/data-parameters/categories?page=1&limit=2000`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const json = await res.json();

      if (json.success && Array.isArray(json.data?.data)) {
        const analysisCat = json.data.data.find(
          (c: any) => c.name === 'Analysis'
        );
        if (analysisCat?.values?.length) {
          const cats = analysisCat.values
            .map((v: any) => ({ name: v.value }))
            .filter((c: Category) => c.name?.trim());
          setCategories(cats);
        } else {
          toast.error('No “Analysis” category found');
          setCategories([]);
        }
      } else {
        toast.error(json.message ?? 'Failed to load categories');
        setCategories([]);
      }
    } catch (err) {
      console.error('Fetch categories error:', err);
      toast.error('Network error loading categories');
      setCategories([]);
    } finally {
      setLoadingCategories(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchCompanies();
      fetchCategories();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  /* --------------------- COMPANY SEARCH & DISPLAY --------------------- */
  const filteredCompanies = useMemo(() => {
    if (!searchTerm) return companies;
    const lower = searchTerm.toLowerCase();
    return companies.filter((c) =>
      c.company_name.toLowerCase().includes(lower)
    );
  }, [searchTerm, companies]);

  const selectedCompanyName = useMemo(() => {
    if (!formData.company_id || loadingCompanies) return '';
    const found = companies.find((c) => c.id === formData.company_id);
    return found?.company_name ?? 'Unknown Company';
  }, [formData.company_id, companies, loadingCompanies]);

  /* --------------------- HANDLERS --------------------- */
  const handleField = (
    field: keyof typeof formData,
    value: string | number
  ) => {
    setFormData((p) => ({ ...p, [field]: value }));
  };

  const handleEntry = (
    id: number,
    field: 'category' | 'analysis',
    value: string
  ) => {
    setEntries((p) =>
      p.map((e) => (e.id === id ? { ...e, [field]: value } : e))
    );
  };

  const addEntry = () => {
    setEntries((p) => [
      ...p,
      { id: Date.now(), category: '', analysis: '' },
    ]);
  };

  const removeEntry = (id: number) => {
    if (entries.length > 1) {
      setEntries((p) => p.filter((e) => e.id !== id));
    }
  };

  const buildPayload = () => {
    const insights = entries
      .filter((e) => e.category && e.analysis.trim())
      .map((e) => ({ category: e.category, insight: e.analysis.trim() }));

    if (insights.length === 0) {
      toast.error(
        'At least one insight with category & analysis is required'
      );
      return null;
    }

    return {
      company_id: formData.company_id,
      date: formData.date,
      analyst_note: formData.analyst_note || null,
      supervisor_note: formData.supervisor_note || null,
      insights,
    };
  };

  const handleSave = async () => {
    if (!formData.company_id) {
      return toast.error('Please select a company');
    }

    const payload = buildPayload();
    if (!payload) return;

    const url = isEdit && initialData?.id
      ? `${BASE_URL}/outcome-insights/update/${initialData.id}`
      : `${BASE_URL}/outcome-insights/create`;

    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const json = await res.json();

      if (json.success) {
        toast.success(
          isEdit ? 'Updated successfully' : 'Created successfully'
        );
        onClose(true);
      } else {
        toast.error(json.message ?? 'Operation failed');
      }
    } catch (err) {
      console.error('Save error:', err);
      toast.error(`Error ${isEdit ? 'updating' : 'creating'} insight`);
    }
  };

  /* --------------------------------------------------------------- */
  /*                           RENDER                                 */
  /* --------------------------------------------------------------- */
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Card className="flex-1 flex flex-col overflow-hidden">
        <CardContent className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* ---------- Company + Date ---------- */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Company Search */}
            <div className="relative">
              <Label>Company</Label>
              <Input
                placeholder="Search company..."
                value={
                  showDropdown
                    ? searchTerm
                    : loadingCompanies
                    ? 'Loading companies...'
                    : selectedCompanyName || 'Select a company'
                }
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
                onClick={() => setShowDropdown(true)}
                disabled={loadingCompanies}
                className="cursor-pointer"
              />

              {/* DROPDOWN */}
              {showDropdown && (
                <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {loadingCompanies ? (
                    <div className="p-3 text-center text-muted-foreground">
                      <Loader2 className="inline h-4 w-4 animate-spin mr-2" />
                      Loading companies...
                    </div>
                  ) : filteredCompanies.length === 0 ? (
                    <div className="p-3 text-center text-muted-foreground">
                      {searchTerm ? 'No matches found' : 'No companies available'}
                    </div>
                  ) : (
                    filteredCompanies.map((c) => (
                      <div
                        key={c.id}
                        className="px-4 py-2 hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors"
                        onClick={() => {
                          handleField('company_id', c.id);
                          setSearchTerm('');
                          setShowDropdown(false);
                        }}
                      >
                        {c.company_name}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Date */}
            <div>
              <Label>Date</Label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => handleField('date', e.target.value)}
              />
            </div>
          </div>

          {/* ---------- Insight Rows ---------- */}
          <div className="space-y-4">
            {entries.map((entry, idx) => (
              <div
                key={entry.id}
                className="grid grid-cols-12 gap-4 items-start"
              >
                {/* + / – button */}
                <div className="col-span-1">
                  {idx === 0 ? (
                    <Button
                      type="button"
                      variant="default"
                      size="sm"
                      onClick={addEntry}
                      className="h-8 w-8 p-0"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeEntry(entry.id)}
                      className="h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                {/* Category Select */}
                <div className="col-span-3">
                  <Select
                    value={entry.category}
                    onValueChange={(v) =>
                      handleEntry(entry.id, 'category', v)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {loadingCategories ? (
                        <SelectItem value="loading" disabled>
                          <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
                          Loading...
                        </SelectItem>
                      ) : categories.length === 0 ? (
                        <SelectItem value="empty" disabled>
                          No categories
                        </SelectItem>
                      ) : (
                        categories.map((cat) => (
                          <SelectItem key={cat.name} value={cat.name}>
                            {cat.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* Analysis Textarea */}
                <div className="col-span-8">
                  <Textarea
                    placeholder="Analysis"
                    value={entry.analysis}
                    onChange={(e) =>
                      handleEntry(entry.id, 'analysis', e.target.value)
                    }
                    className="min-h-[100px] resize-none"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* ---------- Notes ---------- */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Analyst Note</Label>
              <Textarea
                value={formData.analyst_note}
                onChange={(e) =>
                  handleField('analyst_note', e.target.value)
                }
                className="min-h-[100px] resize-none"
              />
            </div>
            <div>
              <Label>Supervisor Note</Label>
              <Textarea
                value={formData.supervisor_note}
                onChange={(e) =>
                  handleField('supervisor_note', e.target.value)
                }
                className="min-h-[100px] resize-none"
              />
            </div>
          </div>
        </CardContent>

        {/* ---------- Footer ---------- */}
        <div className="border-t bg-card p-6 flex justify-end gap-3">
          <Button onClick={handleSave}>Save &amp; Send</Button>
          <Button variant="outline" onClick={() => onClose(false)}>
            Cancel
          </Button>
        </div>
      </Card>
    </div>
  );
}