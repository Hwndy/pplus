import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { PlusCircle, FileEdit, Trash2, Loader2, Search as SearchIcon, Edit3 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";

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
  name: string;kkkkkkkkkkk
  values: string[];
  rawValues?: CategoryValue[]; // keep raw so we can operate on individual values
  active: boolean;
  description?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

// -------------------- Config --------------------
const API_BASE = "https://backend-e79r.onrender.com/api";

// -------------------- jsonFetch helper --------------------
async function jsonFetch<T = any>(path: string, options: RequestInit = {}): Promise<T> {
  // if the caller passes a full URL (starts with http) we'll use it verbatim
  const url = path.startsWith("http") ? path : `${API_BASE}${path}`;
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  const res = await fetch(url, { ...options, headers });
  const isJson = res.headers.get?.("content-type")?.includes("application/json");
  const body = isJson ? await res.json().catch(() => ({})) : undefined;

  if (!res.ok) {
    // if backend returns array of messages (validation), format sensibly
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
  if (!d) return "—";
  try {
    return new Date(d).toLocaleString();
  } catch {
    return d;
  }
}

// -------------------- Component --------------------
const ParametersPage: React.FC = () => {
  const { toast } = useToast();

  // table & query state
  const [data, setData] = useState<Parameter[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false); // disable Save while request in-flight
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 600);

  // pagination state (client-side pagination over the mapped list)
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  // dialog & form state
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Parameter | null>(null);

  // category form state (used for create and edit)
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    values: [""], // used for batch creation/updating contents when creating category
    active: true,
    description: "",
  });

  // value edit dialog (for editing a single value)
  const [isValueDialogOpen, setIsValueDialogOpen] = useState(false);
  const [editingValue, setEditingValue] = useState<{ id?: number | string; value: string; categoryName?: string } | null>(null);

  // -------------------- Fetch categories --------------------
  // We'll fetch the entire categories list from the backend endpoint /data-parameters,
  // do client-side filtering and pagination (since the API returned whole list previously).
  const fetchParameters = useCallback(
    async (opts?: { resetPage?: boolean }) => {
      setLoading(true);
      try {
        const resp: any = await jsonFetch(`/data-parameters`);
        // backend shape used previously: resp.data.data[0].categories
        const categories: CategoryRaw[] = resp?.data?.data?.[0]?.categories ?? [];

        // apply simple client-side search on category name
        const filtered = categories.filter((c) =>
          debouncedSearch ? String(c.name).toLowerCase().includes(String(debouncedSearch).toLowerCase()) : true
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

        // update total before pagination
        setTotal(mapped.length);

        // if caller requested reset page (e.g., pageSize changed or search changed), reset to page 1
        const currentPage = opts?.resetPage ? 1 : page;
        if (opts?.resetPage) setPage(1);

        const start = (currentPage - 1) * pageSize;
        const paginated = mapped.slice(start, start + pageSize);

        setData(paginated);
      } catch (err: any) {
        toast({ title: "Failed to load parameters", description: err?.message || "Please try again", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    },
    [debouncedSearch, page, pageSize, toast]
  );

  // Fetch when search, page, or pageSize change
  useEffect(() => {
    // Reset to first page when search term changes
    fetchParameters({ resetPage: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, pageSize]);

  useEffect(() => {
    // fetch for initial mount and when page changes (but not pageSize/search — handled above)
    fetchParameters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

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

  const saveCategory = useCallback(async () => {
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
        // --- EDIT EXISTING CATEGORY ---
        // ✅ CORRECTED URL: Your backend uses /update/:id with a PUT request for updates
        const payload: any = { name, description };
        if (typeof categoryForm.active !== 'undefined') {
          payload.is_deleted = !categoryForm.active;
        }

        await jsonFetch(`/data-parameters-category/update/${editingCategory._id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });

        toast({ title: "Category updated" });
      } else {
        // --- CREATE NEW CATEGORY ---
        // Step 1: Create the top-level DataParameter container if it doesn't exist
        try {
          await jsonFetch(`/data-parameters/create`, {
            method: "POST",
            body: JSON.stringify({}),
          });
        } catch (err) {
          // Ignore "Only one DataParameter can exist" error
        }

        // Step 2: Create the new category
        // ✅ CORRECTED URL: Based on your router file, this is the correct route
        const newCategory = await jsonFetch(`/data-parameters-category/create`, {
          method: "POST",
          body: JSON.stringify({ name, description }),
        });

        toast({ title: "Category created" });

        // Step 3: Create the values for the new category
        // ✅ CORRECTED URL: Based on your router file, this is the correct route
        if (trimmedValues.length > 0 && newCategory?.data?.id) {
          await jsonFetch(`/data-parameters-category-value/create`, {
            method: "POST",
            body: JSON.stringify({
              dataParametersCategoryId: newCategory.data.id,
              value: trimmedValues,
            }),
          });
        }
      }

      setIsCategoryDialogOpen(false);
      setEditingCategory(null);
      setPage(1);
      await fetchParameters({ resetPage: true });
    } catch (err: any) {
      toast({ title: "Save failed", description: err.message || "Try again", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }, [categoryForm, editingCategory, fetchParameters, toast]);

  const deleteCategory = useCallback(
    async (cat: Parameter) => {
      if (!confirm(`Delete category "${cat.name}"? This will mark it as deleted.`)) return;
      try {
        // ✅ CORRECTED URL: Your router uses a PUT request to a dedicated delete endpoint
        await jsonFetch(`/data-parameters-category/delete/${cat._id}`, {
          method: "PUT",
        });
        toast({ title: "Category deleted" });
        // reload and stay on same page if possible
        await fetchParameters();
      } catch (err: any) {
        toast({ title: "Delete failed", description: err?.message || "Try again", variant: "destructive" });
      }
    },
    [fetchParameters, toast]
  );

  // -------------------- Value-level CRUD --------------------
  // Create a value for a category (single value)
  const createValue = useCallback(async (categoryId: number | string, valueText: string) => {
    const trimmed = valueText.trim();
    if (!trimmed) {
      toast({ title: "Value required", variant: "destructive" });
      return;
    }

    try {
      // ✅ CORRECTED URL: The router file confirms this route
      await jsonFetch(`/data-parameters-category-value/create`, {
        method: "POST",
        body: JSON.stringify({
          dataParametersCategoryId: Number(categoryId),
          value: [trimmed], // ✅ must be array
        }),
      });
      toast({ title: "Value created" });
      await fetchParameters();
    } catch (err: any) {
      toast({ title: "Create value failed", description: err.message || "Try again", variant: "destructive" });
    }
  }, [fetchParameters, toast]);

  // Update value
  const updateValue = useCallback(
    async (valueId: number | string, newValue: string) => {
      if (!String(newValue).trim()) {
        toast({ title: "Value required", variant: "destructive" });
        return;
      }
      try {
        // ✅ CORRECTED URL: The router file confirms this route and method
        await jsonFetch(`/data-parameters-category-value/update/${valueId}`, {
          method: "PUT",
          body: JSON.stringify({ value: String(newValue).trim() }),
        });
        toast({ title: "Value updated" });
        setIsValueDialogOpen(false);
        setEditingValue(null);
        await fetchParameters();
      } catch (err: any) {
        toast({ title: "Update failed", description: err?.message || "Try again", variant: "destructive" });
      }
    },
    [fetchParameters, toast]
  );

  // Delete a value
  const deleteValue = useCallback(
    async (value: CategoryValue) => {
      if (!confirm(`Delete value "${value.value}"?`)) return;
      try {
        // ✅ CORRECTED URL: The router file confirms this route and method
        await jsonFetch(`/data-parameters-category-value/delete/${value.id}`, {
          method: "PUT",
        });
        toast({ title: "Value deleted" });
        await fetchParameters();
      } catch (err: any) {
        toast({ title: "Delete failed", description: err?.message || "Try again", variant: "destructive" });
      }
    },
    [fetchParameters, toast]
  );

  // -------------------- Table columns --------------------
  const columns = useMemo<ColumnDef<Parameter>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Category",
        cell: ({ row }) => <div className="font-medium truncate max-w-[240px]" title={row.original.name}>{row.original.name}</div>,
      },
      {
        accessorKey: "values",
        header: "Values",
        cell: ({ row }) => {
          const orig = row.original;
          // show up to first 6 values then `...` for readability
          const values = orig.rawValues ?? (orig.values || []).map((v) => ({ id: v, value: v }));
          const visible = values.slice(0, 6);
          return (
            <div className="flex flex-col gap-1 max-w-[520px]">
              <div className="flex flex-wrap gap-2">
                {visible.map((v, i) => (
                  <Badge key={String((v as any).id ?? i)} className="truncate" title={(v as any).value}>
                    {(v as any).value}
                  </Badge>
                ))}
                {values.length > 6 ? <span className="text-muted-foreground">+{values.length - 6} more</span> : null}
              </div>
              <div className="flex gap-2 mt-1">
                <Button size="sm" variant="ghost" onClick={() => {
                  // add value prompt inline: open small input dialog
                  setEditingValue({ id: undefined, value: "", categoryName: orig.name });
                  setIsValueDialogOpen(true);
                }}>+ Add value</Button>
                <Button size="sm" variant="outline" onClick={() => {
                  // open edit modal that lists values with edit/delete
                  setEditingCategory(orig);
                  setIsCategoryDialogOpen(true);
                }}>Manage values</Button>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "active",
        header: "Status",
        cell: ({ row }) =>
          row.original.active ? <Badge>Active</Badge> : <Badge variant="secondary">Inactive</Badge>,
      },
      {
        accessorKey: "updatedAt",
        header: "Updated",
        cell: ({ row }) => <div className="text-muted-foreground">{formatDate(row.original.updatedAt)}</div>,
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex items-center gap-2 justify-end">
            <Button size="icon" variant="outline" onClick={() => openEditCategory(row.original)} aria-label="Edit">
              <FileEdit className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="destructive" onClick={() => deleteCategory(row.original)} aria-label="Delete">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ),
      },
    ],
    [deleteCategory, openEditCategory]
  );

  const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel() });

  // -------------------- UI helpers for category dialog when editing (values listing + per-value ops) --------------------
  // When editing category we show existing values with edit/delete controls, and also allow adding new values inline.
  function renderCategoryValuesEditor() {
    // categoryForm.values used only for new/bulk values when creating a category.
    // When editing an existing category we render rawValues from editingCategory and offer per-value actions.
    if (editingCategory) {
      const raw = editingCategory.rawValues ?? [];
      return (
        <div className="space-y-3">
          <div className="flex flex-col gap-2">
            {raw.map((v) => (
              <div key={String(v.id)} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="font-medium">{v.value}</div>
                  <div className="text-xs text-muted-foreground">id:{v.id}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="icon" variant="ghost" onClick={() => {
                    setEditingValue({ id: v.id, value: v.value, categoryName: editingCategory.name });
                    setIsValueDialogOpen(true);
                  }} aria-label="Edit value">
                    <Edit3 className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="outline" onClick={() => deleteValue(v)} aria-label="Delete value">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t">
            <div className="flex items-center gap-2">
              <Input placeholder="New value" value={categoryForm.values[0] ?? ""} onChange={(e) => setCategoryForm(s => ({ ...s, values: [e.target.value] }))} />
              <Button onClick={() => {
                // create single value for this category
                const val = String((categoryForm.values && categoryForm.values[0]) || "").trim();
                if (!val) { toast({ title: "Value required", variant: "destructive" }); return; }
                // create via API (use 'category' field)
                createValue(editingCategory._id, val).then(() => setCategoryForm(s => ({ ...s, values: [""] })));
              }}>Add</Button>
            </div>
          </div>
        </div>
      );
    }

    // Creating new category: allow multiple values input (categoryForm.values)
    return (
      <div className="space-y-2">
        {categoryForm.values.map((v, i) => (
          <div key={i} className="flex gap-2 items-center">
            <Input placeholder={`Value ${i + 1}`} value={v} onChange={(e) => {
              const next = [...categoryForm.values];
              next[i] = e.target.value;
              setCategoryForm((s) => ({ ...s, values: next }));
            }} />
            <Button size="icon" variant="outline" onClick={() => setCategoryForm(s => ({ ...s, values: s.values.filter((_, idx) => idx !== i) }))} disabled={categoryForm.values.length <= 1}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button type="button" variant="secondary" onClick={() => setCategoryForm(s => ({ ...s, values: [...s.values, ""] }))}>+ Add value</Button>
      </div>
    );
  }

  // -------------------- Value dialog submit --------------------
  const handleValueDialogSave = useCallback(async () => {
    if (!editingValue) return;
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
        // ✅ CORRECTED URL: The router file confirms this route
        await jsonFetch(`/data-parameters-category-value/create`, {
          method: "POST",
          body: JSON.stringify({
            dataParametersCategoryId: editingCategory._id,
            value: [trimmedValue], // Ensure value is sent as an array
          }),
        });
        toast({ title: "Value created" });
      } else {
        // ✅ CORRECTED URL: The router file confirms this route and method
        await jsonFetch(`/data-parameters-category-value/update/${editingValue.id}`, {
          method: "PUT",
          body: JSON.stringify({ value: trimmedValue }),
        });
        toast({ title: "Value updated" });
      }

      setIsValueDialogOpen(false);
      setEditingValue(null);
      await fetchParameters();
    } catch (err: any) {
      toast({ title: "Value save failed", description: err.message || "Try again", variant: "destructive" });
    }
  }, [editingValue, editingCategory, fetchParameters, toast]);

  // -------------------- Render --------------------
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 justify-between">
        <div className="relative w-full sm:w-80">
          <Input placeholder="Search parameters..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={() => fetchParameters({ resetPage: true })} variant="outline">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Refresh
          </Button>
          <Button onClick={openCreateCategory}>
            <PlusCircle className="mr-2 h-4 w-4" /> New Category
          </Button>
        </div>
      </div>

      <div className="rounded-xl border">
        <table className="w-full text-sm">
          <thead className="bg-muted/40">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id} className="border-b">
                {hg.headers.map((header) => (
                  <th key={header.id} className="text-left p-3 font-semibold">
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={columns.length} className="p-6 text-center text-muted-foreground">
                  <div className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> Loading...
                  </div>
                </td>
              </tr>
            )}

            {!loading && table.getRowModel().rows.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="p-6 text-center text-muted-foreground">
                  No data found
                </td>
              </tr>
            )}

            {!loading &&
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="border-b hover:bg-muted/30">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="p-3">{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                  ))}
                </tr>
              ))}
          </tbody>
        </table>

        {/* Pagination Controls */}
        <div className="flex items-center justify-between p-3 border-t">
          <div className="text-sm text-muted-foreground">
            {total === 0 ? "No items" : `Showing ${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, total)} of ${total}`}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
              Previous
            </Button>
            <Button variant="outline" size="sm" disabled={page * pageSize >= total} onClick={() => setPage((p) => p + 1)}>
              Next
            </Button>
            <select
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); fetchParameters({ resetPage: true }); }}
              className="border rounded px-2 py-1 text-sm"
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

      {/* Category create/edit dialog */}
      <Dialog open={isCategoryDialogOpen} onOpenChange={(o) => {
        setIsCategoryDialogOpen(o);
        if (!o) {
          setEditingCategory(null);
          setCategoryForm({ name: "", values: [""], active: true, description: "" });
        }
      }}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingCategory ? "Edit Category" : "New Category"}</DialogTitle>
            <DialogDescription>{editingCategory ? "Update category and manage its values." : "Create a category and add values."}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={categoryForm.name} onChange={(e) => setCategoryForm((s) => ({ ...s, name: e.target.value }))} placeholder="e.g. Industry, PublicationType" />
            </div>

            <div className="space-y-2">
              <Label>Values</Label>
              {renderCategoryValuesEditor()}
            </div>

            <div className="flex items-center gap-2">
              <Checkbox id="active" checked={categoryForm.active} onCheckedChange={(c) => setCategoryForm((s) => ({ ...s, active: !!c }))} />
              <Label htmlFor="active">Active</Label>
            </div>

            <div className="space-y-2">
              <Label>Description (optional)</Label>
              <Textarea value={categoryForm.description} onChange={(e) => setCategoryForm((s) => ({ ...s, description: e.target.value }))} />
            </div>
          </div>

          <DialogFooter className="mt-4">
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button disabled={saving} onClick={async () => {
              await saveCategory();
            }}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {editingCategory ? "Save changes" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Value dialog (single value create/edit) */}
      <Dialog open={isValueDialogOpen} onOpenChange={(o) => {
        setIsValueDialogOpen(o);
        if (!o) setEditingValue(null);
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingValue?.id ? "Edit Value" : "Add Value"}</DialogTitle>
            <DialogDescription>{editingValue?.categoryName ? `Category: ${editingValue.categoryName}` : ""}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label>Value</Label>
              <Input value={editingValue?.value ?? ""} onChange={(e) => setEditingValue((s) => (s ? { ...s, value: e.target.value } : { id: undefined, value: e.target.value }))} />
            </div>
          </div>

          <DialogFooter className="mt-4">
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button onClick={handleValueDialogSave}>{editingValue?.id ? "Save" : "Create"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ParametersPage;
