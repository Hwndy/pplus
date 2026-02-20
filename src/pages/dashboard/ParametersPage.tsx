import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  PlusCircle,
  FileEdit,
  Trash2,
  Loader2,
  Search,
  Edit3,
  Tag,
  List,
  CheckCircle,
  FileText,
  Calendar,
  Eye,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from '@/components/auth/AuthContext';

// -------------------- Types --------------------
type CategoryValue = {
  id: number | string;
  value: string;
  is_deleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
};
type CategoryRaw = {
  id: number | string;
  name: string;
  description?: string | null;
  is_deleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
  values?: CategoryValue[];
};
export type Parameter = {
  _id: string;
  name: string;
  values: string[];
  rawValues?: CategoryValue[];
  active: boolean;
  description?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

// -------------------- Config --------------------
const API_BASE = "https://pplus-g19c.onrender.com/api/v1";

// -------------------- jsonFetch helper with Auth --------------------
async function jsonFetch<T = any>(path: string, options: RequestInit = {}, token?: string | null): Promise<T> {
  const url = path.startsWith("http") ? path : `${API_BASE}${path}`;
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(url, { ...options, headers });
  const isJson = res.headers.get?.("content-type")?.includes("application/json");
  const body = isJson ? await res.json().catch(() => ({})) : undefined;

  if (!res.ok) {
    const message =
      (body &&
        (Array.isArray(body.message)
          ? body.message.map((m: any) => `${m.field}: ${m.message}`).join(", ")
          : body.message || body.error)) ||
      res.statusText ||
      "Request failed";
    throw new Error(message);
  }
  return (body as T) ?? ({} as T);
}

// -------------------- Helpers --------------------
function useDebouncedValue<T>(value: T, delay = 500) {
  const [debounced, setDebounced] = useState<T>(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

function formatDate(d?: string) {
  if (!d) return "Never";
  try {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    }).format(new Date(d));
  } catch {
    return d;
  }
}

// -------------------- ViewCategoryDetails Component --------------------
const ViewCategoryDetails: React.FC<{ category: Parameter; onCancel: () => void }> = ({ category, onCancel }) => {
  if (!category) return null;
  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        <div className="flex items-center gap-2">
          <Tag className="h-5 w-5 text-indigo-600" />
          <div>
            <p className="text-sm text-gray-500">Category Name</p>
            <p className="text-base font-medium">{category.name || 'N/A'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <List className="h-5 w-5 text-indigo-600" />
          <div>
            <p className="text-sm text-gray-500">Values</p>
            <div className="flex flex-wrap gap-2">
              {category.values.length ? (
                category.values.map((value, i) => (
                  <span
                    key={i}
                    className="px-2 py-1 rounded-full text-xs bg-indigo-100 text-indigo-800"
                  >
                    {value}
                  </span>
                ))
              ) : (
                <p className="text-base font-medium">No values</p>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-indigo-600" />
          <div>
            <p className="text-sm text-gray-500">Status</p>
            <span
              className={`px-2 py-1 rounded-full text-xs ${
                category.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}
            >
              {category.active ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-indigo-600" />
          <div>
            <p className="text-sm text-gray-500">Description</p>
            <p className="text-base font-medium">{category.description || 'N/A'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-indigo-600" />
          <div>
            <p className="text-sm text-gray-500">Last Updated</p>
            <p className="text-base font-medium">{formatDate(category.updatedAt)}</p>
          </div>
        </div>
      </div>
      <div className="flex justify-end">
        <Button variant="outline" onClick={onCancel}>
          Close
        </Button>
      </div>
    </div>
  );
};

// -------------------- Main Component --------------------
const ParametersPage: React.FC = () => {
  const { toast } = useToast();
  const { token } = useAuth();

  // table & query state
  const [data, setData] = useState<Parameter[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 600);

  // pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  // dialog & form state
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Parameter | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [viewCategory, setViewCategory] = useState<Parameter | null>(null);

  // category form state
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    values: [""],
    active: true,
    description: "",
  });

  // value edit dialog
  const [isValueDialogOpen, setIsValueDialogOpen] = useState(false);
  const [editingValue, setEditingValue] = useState<{ id?: number | string; value: string; categoryName?: string } | null>(null);

  // -------------------- Unified Data Fetching --------------------
  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        toast({ title: "Not authenticated", description: "Please log in again.", variant: "destructive" });
        return;
      }

      setLoading(true);
      try {
        const resp: any = await jsonFetch(`/data-parameters`, {}, token);
        const categories: CategoryRaw[] = resp?.data?.data?.[0]?.categories ?? [];

        const filtered = categories.filter((c) =>
          debouncedSearch
            ? String(c.name).toLowerCase().includes(String(debouncedSearch).toLowerCase())
            : true
        );

        const mapped: Parameter[] = filtered.map((c) => ({
          _id: String(c.id),
          name: c.name,
          values: (c.values || []).map((v) => v.value),
          rawValues: c.values || [],
          active: !c.is_deleted,
          description: c.description ?? "",
          createdAt: c.createdAt,
          updatedAt: c.updatedAt,
        }));

        setTotal(mapped.length);

        const start = (page - 1) * pageSize;
        const end = start + pageSize;
        const paginated = mapped.slice(start, end);

        setData(paginated);
      } catch (err: any) {
        toast({
          title: "Failed to load parameters",
          description: err?.message || "Please try again",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [debouncedSearch, page, pageSize, token, toast]);

  // -------------------- Category CRUD --------------------
  const openCreateCategory = useCallback(() => {
    setEditingCategory(null);
    setCategoryForm({ name: "", values: [""], active: true, description: "" });
    setIsCategoryDialogOpen(true);
  }, []);

  const openEditCategory = useCallback((cat: Parameter) => {
    setEditingCategory(cat);
    setCategoryForm({
      name: cat.name,
      values: cat.values.length ? cat.values : [""],
      active: !!cat.active,
      description: cat.description ?? "",
    });
    setIsCategoryDialogOpen(true);
  }, []);

  const openViewCategory = useCallback((cat: Parameter) => {
    setViewCategory(cat);
    setIsViewDialogOpen(true);
  }, []);

  const saveCategory = useCallback(async () => {
    if (!token) return;

    const name = String(categoryForm.name || "").trim();
    const description = categoryForm.description?.trim() || undefined;
    const trimmedValues = (categoryForm.values || []).map((v) => v.trim()).filter(Boolean);

    if (!name) {
      toast({ title: "Name required", variant: "destructive" });
      return;
    }

    try {
      setSaving(true);

      if (editingCategory) {
        const payload: any = { name, description };
        if (typeof categoryForm.active !== 'undefined') {
          payload.is_deleted = !categoryForm.active;
        }
        await jsonFetch(`/data-parameters-category/update/${editingCategory._id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        }, token);
        toast({ title: "Category updated" });
      } else {
        try {
          await jsonFetch(`/data-parameters/create`, { method: "POST", body: JSON.stringify({}) }, token);
        } catch (err) {
          // Ignore "Only one DataParameter can exist" error
        }

        const newCategory = await jsonFetch(`/data-parameters-category/create`, {
          method: "POST",
          body: JSON.stringify({ name, description }),
        }, token);

        toast({ title: "Category created" });

        if (trimmedValues.length > 0 && newCategory?.data?.id) {
          await jsonFetch(`/data-parameters-category-value/create`, {
            method: "POST",
            body: JSON.stringify({
              dataParametersCategoryId: newCategory.data.id,
              value: trimmedValues,
            }),
          }, token);
        }
      }

      setIsCategoryDialogOpen(false);
      setEditingCategory(null);
      setPage(1); // Triggers refetch via useEffect
    } catch (err: any) {
      toast({ title: "Save failed", description: err.message || "Try again", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }, [categoryForm, editingCategory, token, toast]);

  const deleteCategory = useCallback(
    async (cat: Parameter) => {
      if (!token) return;
      try {
        await jsonFetch(`/data-parameters-category/delete/${cat._id}`, { method: "PUT" }, token);
        toast({ title: "Category deleted" });
        setPage(1); // Refresh from page 1
      } catch (err: any) {
        toast({ title: "Delete failed", description: err?.message || "Try again", variant: "destructive" });
      }
    },
    [token, toast]
  );

  // -------------------- Value-level CRUD --------------------
  const createValue = useCallback(async (categoryId: number | string, valueText: string) => {
    if (!token) return;
    const trimmed = valueText.trim();
    if (!trimmed) {
      toast({ title: "Value required", variant: "destructive" });
      return;
    }
    try {
      await jsonFetch(`/data-parameters-category-value/create`, {
        method: "POST",
        body: JSON.stringify({
          dataParametersCategoryId: Number(categoryId),
          value: [trimmed],
        }),
      }, token);
      toast({ title: "Value created" });
      setPage(1);
    } catch (err: any) {
      toast({ title: "Create value failed", description: err.message || "Try again", variant: "destructive" });
    }
  }, [token, toast]);

  const updateValue = useCallback(
    async (valueId: number | string, newValue: string) => {
      if (!token) return;
      if (!String(newValue).trim()) {
        toast({ title: "Value required", variant: "destructive" });
        return;
      }
      try {
        await jsonFetch(`/data-parameters-category-value/update/${valueId}`, {
          method: "PUT",
          body: JSON.stringify({ value: String(newValue).trim() }),
        }, token);
        toast({ title: "Value updated" });
        setIsValueDialogOpen(false);
        setEditingValue(null);
        setPage(1);
      } catch (err: any) {
        toast({ title: "Update failed", description: err?.message || "Try again", variant: "destructive" });
      }
    },
    [token, toast]
  );

  const deleteValue = useCallback(
    async (value: CategoryValue) => {
      if (!token) return;
      try {
        await jsonFetch(`/data-parameters-category-value/delete/${value.id}`, { method: "PUT" }, token);
        toast({ title: "Value deleted" });
        setPage(1);
      } catch (err: any) {
        toast({ title: "Delete failed", description: err?.message || "Try again", variant: "destructive" });
      }
    },
    [token, toast]
  );

  // -------------------- Table columns --------------------
  const columns = useMemo<ColumnDef<Parameter>[]>(
    () => [
      {
        id: "serial",
        header: "Sn.",
        cell: ({ row }) => (
          <div className="w-14">{(page - 1) * pageSize + row.index + 1}</div>
        ),
      },
      {
        accessorKey: "name",
        header: "Category",
        cell: ({ row }) => (
          <div className="font-medium truncate max-w-[240px]" title={row.original.name}>
            {row.original.name}
          </div>
        ),
      },
      {
        accessorKey: "values",
        header: "Values",
        cell: ({ row }) => {
          const orig = row.original;
          const values = orig.rawValues ?? (orig.values || []).map((v) => ({ id: v, value: v }));
          const visible = values.slice(0, 6);
          return (
            <div className="flex flex-col gap-1 max-w-[520px]">
              <div className="flex flex-wrap gap-2">
                {visible.map((v, i) => (
                  <span
                    key={String((v as any).id ?? i)}
                    className="px-2 py-1 rounded-full text-xs bg-indigo-100 text-indigo-800 truncate"
                    title={(v as any).value}
                  >
                    {(v as any).value}
                  </span>
                ))}
                {values.length > 6 ? <span className="text-gray-500">+{values.length - 6} more</span> : null}
              </div>
              <div className="flex gap-2 mt-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setEditingValue({ id: undefined, value: "", categoryName: orig.name });
                    setIsValueDialogOpen(true);
                  }}
                >
                  + Add value
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openEditCategory(orig)}
                >
                  Manage values
                </Button>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "active",
        header: "Status",
        cell: ({ row }) => (
          <span
            className={`px-2 py-1 rounded-full text-xs ${
              row.original.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            }`}
          >
            {row.original.active ? 'Active' : 'Inactive'}
          </span>
        ),
      },
      {
        accessorKey: "updatedAt",
        header: "Updated",
        cell: ({ row }) => (
          <div className="text-gray-500">{formatDate(row.original.updatedAt)}</div>
        ),
      },
      {
        id: "actions",
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => (
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => openViewCategory(row.original)}
              aria-label="View"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => openEditCategory(row.original)}
              aria-label="Edit"
            >
              <FileEdit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => deleteCategory(row.original)}
              aria-label="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ),
      },
    ],
    [page, pageSize, openEditCategory, openViewCategory, deleteCategory]
  );

  const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel() });

  // -------------------- UI helpers for category dialog --------------------
  function renderCategoryValuesEditor() {
    if (editingCategory) {
      const raw = editingCategory.rawValues ?? [];
      return (
        <div className="space-y-3">
          <div className="flex flex-col gap-2">
            {raw.map((v) => (
              <div key={String(v.id)} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="font-medium">{v.value}</div>
                  <div className="text-xs text-gray-500">id:{v.id}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => {
                      setEditingValue({ id: v.id, value: v.value, categoryName: editingCategory.name });
                      setIsValueDialogOpen(true);
                    }}
                    aria-label="Edit value"
                  >
                    <Edit3 className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => deleteValue(v)}
                    aria-label="Delete value"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <div className="pt-2 border-t">
            <div className="flex items-center gap-2">
              <Input
                placeholder="New value"
                value={categoryForm.values[0] ?? ""}
                onChange={(e) => setCategoryForm(s => ({ ...s, values: [e.target.value] }))}
              />
              <Button
                onClick={() => {
                  const val = String((categoryForm.values && categoryForm.values[0]) || "").trim();
                  if (!val) {
                    toast({ title: "Value required", variant: "destructive" });
                    return;
                  }
                  createValue(editingCategory._id, val).then(() =>
                    setCategoryForm(s => ({ ...s, values: [""] }))
                  );
                }}
              >
                Add
              </Button>
            </div>
          </div>
        </div>
      );
    }
    return (
      <div className="space-y-2">
        {categoryForm.values.map((v, i) => (
          <div key={i} className="flex gap-2 items-center">
            <Input
              placeholder={`Value ${i + 1}`}
              value={v}
              onChange={(e) => {
                const next = [...categoryForm.values];
                next[i] = e.target.value;
                setCategoryForm((s) => ({ ...s, values: next }));
              }}
            />
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setCategoryForm(s => ({ ...s, values: s.values.filter((_, idx) => idx !== i) }))}
              disabled={categoryForm.values.length <= 1}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          onClick={() => setCategoryForm(s => ({ ...s, values: [...s.values, ""] }))}
        >
          + Add value
        </Button>
      </div>
    );
  }

  // -------------------- Value dialog submit --------------------
  const handleValueDialogSave = useCallback(async () => {
    if (!editingValue || !token) return;
    const trimmedValue = editingValue.value.trim();
    if (!trimmedValue) {
      toast({ title: "Value required", variant: "destructive" });
      return;
    }
    try {
      if (!editingValue.id) {
        if (!editingCategory) {
          toast({ title: "Category not selected", variant: "destructive" });
          return;
        }
        await jsonFetch(`/data-parameters-category-value/create`, {
          method: "POST",
          body: JSON.stringify({
            dataParametersCategoryId: editingCategory._id,
            value: [trimmedValue],
          }),
        }, token);
        toast({ title: "Value created" });
      } else {
        await jsonFetch(`/data-parameters-category-value/update/${editingValue.id}`, {
          method: "PUT",
          body: JSON.stringify({ value: trimmedValue }),
        }, token);
        toast({ title: "Value updated" });
      }
      setIsValueDialogOpen(false);
      setEditingValue(null);
      setPage(1);
    } catch (err: any) {
      toast({ title: "Value save failed", description: err.message || "Try again", variant: "destructive" });
    }
  }, [editingValue, editingCategory, token, toast]);

  // -------------------- Render --------------------
  return (
    <div className="p-6 h-full">
      {/* Header Actions */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Parameters</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setPage(1)} disabled={loading}>
            <Loader2 className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : 'hidden'}`} />
            Refresh
          </Button>
        </div>
      </div>

      {loading && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-md text-blue-600">
          Loading parameters...
        </div>
      )}

      {/* Search + Create */}
      <div className="flex justify-between mb-4">
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search parameters..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>

        <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateCategory} className="bg-indigo-950">
              <PlusCircle className="mr-2 h-4 w-4" /> Create Category
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{editingCategory ? "Edit Category" : "Create Category"}</DialogTitle>
              <DialogDescription>
                {editingCategory ? "Update category and manage its values." : "Create a category and add values."}
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[calc(100vh-200px)] pr-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm((s) => ({ ...s, name: e.target.value }))}
                    placeholder="e.g. Industry, PublicationType"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Values</Label>
                  {renderCategoryValuesEditor()}
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="active"
                    checked={categoryForm.active}
                    onCheckedChange={(c) => setCategoryForm((s) => ({ ...s, active: !!c }))}
                  />
                  <Label htmlFor="active">Active</Label>
                </div>
                <div className="space-y-2">
                  <Label>Description (optional)</Label>
                  <Textarea
                    value={categoryForm.description}
                    onChange={(e) => setCategoryForm((s) => ({ ...s, description: e.target.value }))}
                  />
                </div>
              </div>
            </ScrollArea>
            <div className="flex justify-end gap-2 mt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setIsCategoryDialogOpen(false);
                  setEditingCategory(null);
                  setCategoryForm({ name: "", values: [""], active: true, description: "" });
                }}
              >
                Cancel
              </Button>
              <Button disabled={saving} onClick={saveCategory}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingCategory ? "Save" : "Create"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Table */}
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mx-auto" />
                  <p className="text-gray-500">Loading parameters...</p>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-8 text-gray-500">
                  No parameters found
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {total > pageSize && (
        <div className="mt-4">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, total)} of {total} results
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page * pageSize >= total}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
                className="border rounded px-2 py-1 text-sm text-gray-700"
              >
                {[5, 10, 20, 50].map((size) => (
                  <option key={size} value={size}>
                    {size} / page
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>View {viewCategory?.name || 'Category'}</DialogTitle>
            <DialogDescription>View details of the selected category.</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[calc(100vh-200px)] pr-4">
            {viewCategory && (
              <ViewCategoryDetails category={viewCategory} onCancel={() => setIsViewDialogOpen(false)} />
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Value Dialog */}
      <Dialog open={isValueDialogOpen} onOpenChange={setIsValueDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingValue?.id ? "Edit Value" : "Add Value"}</DialogTitle>
            <DialogDescription>
              {editingValue?.categoryName ? `Category: ${editingValue.categoryName}` : "Add a new value to the category."}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[calc(100vh-200px)] pr-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Value</Label>
                <Input
                  value={editingValue?.value ?? ""}
                  onChange={(e) => setEditingValue((s) => (s ? { ...s, value: e.target.value } : { id: undefined, value: e.target.value }))}
                />
              </div>
            </div>
          </ScrollArea>
          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => {
                setIsValueDialogOpen(false);
                setEditingValue(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleValueDialogSave}>
              {editingValue?.id ? "Save" : "Create"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ParametersPage;