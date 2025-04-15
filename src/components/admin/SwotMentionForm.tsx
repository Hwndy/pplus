import { useState, useEffect } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { Textarea } from "@/components/ui/textarea";
import { format } from 'date-fns';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon, Plus, X, AlertCircle } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Define the schema for form validation
const swotSchema = z.object({
  company: z.string().min(1, { message: "Company is required" }),
  date: z.date({ required_error: "Date is required" }),
  strengths: z.array(
    z.object({
      content: z.string().min(1, { message: "Strength cannot be empty" })
    })
  ).min(1),
  weaknesses: z.array(
    z.object({
      content: z.string().min(1, { message: "Weakness cannot be empty" })
    })
  ).min(1),
  opportunities: z.array(
    z.object({
      content: z.string().min(1, { message: "Opportunity cannot be empty" })
    })
  ).min(1),
  threats: z.array(
    z.object({
      content: z.string().min(1, { message: "Threat cannot be empty" })
    })
  ).min(1),
  analystNote: z.string().optional(),
  supervisorNote: z.string().optional(),
});

type SwotFormValues = z.infer<typeof swotSchema>;

// Mock companies data - in a real app, this would come from an API
const companies = [
  { label: "Company A", value: "company-a" },
  { label: "Company B", value: "company-b" },
  { label: "Company C", value: "company-c" },
  { label: "Company D", value: "company-d" },
  { label: "Company E", value: "company-e" },
];

interface SwotMentionFormProps {
  onClose?: () => void;
  initialData?: Partial<SwotFormValues>;
  isEdit?: boolean;
}

export function SwotMentionForm({ onClose, initialData, isEdit = false }: SwotMentionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFormDirty, setIsFormDirty] = useState(false);

  // Generate a unique session key for this form
  const getSessionKey = () => {
    // If editing, use a unique key based on the data
    if (isEdit && initialData) {
      return `swot_form_edit_${initialData.company}_${initialData.date}`;
    }
    // For new SWOT mentions, use a consistent key
    return 'swot_form_new';
  };

  const sessionKey = getSessionKey();

  // Get initial form values from session storage or initialData
  const getInitialFormValues = () => {
    // If we're in edit mode, use the provided data
    if (isEdit && initialData) {
      return initialData;
    }

    // Try to get data from session storage
    try {
      const savedData = sessionStorage.getItem(sessionKey);
      if (savedData) {
        return JSON.parse(savedData);
      }
    } catch (error) {
      console.error('Error parsing saved SWOT data:', error);
    }

    // Fall back to default values
    return {
      company: "",
      date: new Date(),
      strengths: [{ content: "" }],
      weaknesses: [{ content: "" }],
      opportunities: [{ content: "" }],
      threats: [{ content: "" }],
      analystNote: "",
      supervisorNote: "",
    };
  };

  // Initialize form with react-hook-form and zod validation
  const form = useForm<SwotFormValues>({
    resolver: zodResolver(swotSchema),
    defaultValues: getInitialFormValues(),
  });

  // Save form data to session storage when it changes
  useEffect(() => {
    if (!isEdit) { // Only save to session storage if not in edit mode
      const subscription = form.watch((value) => {
        sessionStorage.setItem(sessionKey, JSON.stringify(value));
      });
      return () => subscription.unsubscribe();
    }
  }, [form.watch, sessionKey, isEdit]);

  // Track form changes
  useEffect(() => {
    const subscription = form.watch(() => {
      setIsFormDirty(form.formState.isDirty);
    });
    return () => subscription.unsubscribe();
  }, [form.watch, form.formState.isDirty]);

  // Setup field arrays for SWOT categories
  const strengthsArray = useFieldArray({
    control: form.control,
    name: "strengths",
  });

  const weaknessesArray = useFieldArray({
    control: form.control,
    name: "weaknesses",
  });

  const opportunitiesArray = useFieldArray({
    control: form.control,
    name: "opportunities",
  });

  const threatsArray = useFieldArray({
    control: form.control,
    name: "threats",
  });

  // Handle form submission
  const onSubmit = async (data: SwotFormValues) => {
    setIsSubmitting(true);
    try {
      // Filter out empty entries
      const cleanedData = {
        ...data,
        strengths: data.strengths.filter(item => item.content.trim() !== ""),
        weaknesses: data.weaknesses.filter(item => item.content.trim() !== ""),
        opportunities: data.opportunities.filter(item => item.content.trim() !== ""),
        threats: data.threats.filter(item => item.content.trim() !== ""),
      };

      // Validate that each category has at least one non-empty entry
      if (cleanedData.strengths.length === 0 ||
          cleanedData.weaknesses.length === 0 ||
          cleanedData.opportunities.length === 0 ||
          cleanedData.threats.length === 0) {
        toast.error("Each SWOT category must have at least one entry");
        setIsSubmitting(false);
        return;
      }

      // Here you would typically send the data to your backend
      console.log('Submitting SWOT mention:', {
        ...cleanedData,
        createdAt: new Date(),
        status: 'pending'
      });

      // Clear session storage after successful submission
      if (!isEdit) {
        sessionStorage.removeItem(sessionKey);
      }

      // Show success message
      toast.success(isEdit ? "SWOT mention updated successfully" : "SWOT mention created successfully");

      // Close the form after successful submission
      onClose?.();
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Failed to submit SWOT mention. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle cancel button click
  const handleCancel = () => {
    if (isFormDirty) {
      if (window.confirm('Are you sure you want to discard your changes?')) {
        onClose?.();
      }
    } else {
      onClose?.();
    }
  };

  // Helper function to add a field to a SWOT category
  const addField = (fieldArray: any) => {
    fieldArray.append({ content: "" });
  };

  // Helper function to render a SWOT category
  const renderSwotCategory = (
    category: "strengths" | "weaknesses" | "opportunities" | "threats",
    fieldArray: any,
    fields: any[],
    categoryLabel: string
  ) => {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-700 capitalize sticky top-16 bg-white z-10">
            {categoryLabel}
          </h3>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addField(fieldArray)}
                  className="flex items-center gap-1"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Add another {categoryLabel.toLowerCase().slice(0, -1)} entry</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {fields.map((field, index) => (
          <div key={field.id} className="space-y-1">
            <div className="flex gap-2">
              <Controller
                control={form.control}
                name={`${category}.${index}.content`}
                render={({ field, fieldState }) => (
                  <div className="flex-1">
                    <Textarea
                      {...field}
                      placeholder={`Enter ${categoryLabel.toLowerCase().slice(0, -1)}`}
                      className={cn(
                        "min-h-[80px] resize-y",
                        fieldState.error && "border-red-500 focus-visible:ring-red-500"
                      )}
                    />
                    {fieldState.error && (
                      <p className="text-sm text-red-500 mt-1">{fieldState.error.message}</p>
                    )}
                  </div>
                )}
              />
              {fields.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => fieldArray.remove(index)}
                  className="self-start"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-h-[calc(100vh-12rem)] overflow-y-auto">
        <div className="flex gap-4 sticky top-0 bg-white z-10 pb-4 border-b">
          <div className="w-1/2">
            <FormField
              control={form.control}
              name="company"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Combobox
                      items={companies}
                      placeholder="Search for a company"
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="w-1/2">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date <span className="text-red-500">*</span></FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {renderSwotCategory("strengths", strengthsArray, strengthsArray.fields, "Strengths")}
          {renderSwotCategory("weaknesses", weaknessesArray, weaknessesArray.fields, "Weaknesses")}
          {renderSwotCategory("opportunities", opportunitiesArray, opportunitiesArray.fields, "Opportunities")}
          {renderSwotCategory("threats", threatsArray, threatsArray.fields, "Threats")}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <FormField
              control={form.control}
              name="analystNote"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Analyst Note</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter analyst note"
                      className="min-h-[150px] resize-y"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div>
            <FormField
              control={form.control}
              name="supervisorNote"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Supervisor Note</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter supervisor note"
                      className="min-h-[150px] resize-y"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex gap-2 sticky bottom-0 bg-white pt-4 border-t">
          <Button
            type="submit"
            className="bg-indigo-950 hover:bg-indigo-900 text-white"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : isEdit ? "Update SWOT Mention" : "Save & Submit"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}