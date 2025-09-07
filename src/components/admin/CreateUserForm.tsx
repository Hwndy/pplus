import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import { CalendarIcon, Pencil, Image, Loader2, Plus, Trash2 } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { User } from "./EditUserForm";
// Assuming you have new hooks for companies and subsidiaries
import { useCreateUser, useSupervisors, useCompanies } from "@/hooks/useApi";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";

interface CreateUserFormProps {
  onSave: (user: User) => void;
  onCancel: () => void;
}

export default function CreateUserForm({ onSave, onCancel }: CreateUserFormProps) {
  const [avatar, setAvatar] = useState("");
  const [showSupervisorField, setShowSupervisorField] = useState(false);
  const [showClientFields, setShowClientFields] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createUser = useCreateUser();
  const { data: supervisors } = useSupervisors();
  const { data: companies } = useCompanies();
  // const { data: subsidiaries } = useSubsidiaries();

  const form = useForm({
    defaultValues: {
      username: "",
      email: "",
      role: "Admin",
      mobile_number: "",
      country_code: "+234",
      joinDate: new Date(),
      expirationDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
      password: "",
      confirmPassword: "",
      supervisorId: "",
      company_monitorings: [{ company_id: "", competitor_company_id: "", monitoring_date: null }],
      subsidiary_comparisons: [{ subsidiary_id: "", comparison_id: "", media_prominence: "" }],
    },
  });

  const selectedRole = form.watch("role");
  const companyMonitorings = form.watch("company_monitorings");
  const subsidiaryComparisons = form.watch("subsidiary_comparisons");

  useEffect(() => {
    setShowSupervisorField(selectedRole === "Analyst" || selectedRole === "Client");
    setShowClientFields(selectedRole === "Client");
    if (selectedRole !== "Analyst" && selectedRole !== "Client") {
      form.setValue("supervisorId", "");
    }
  }, [selectedRole, form]);

  const addCompanyMonitoring = () => {
    form.setValue("company_monitorings", [...companyMonitorings, { company_id: "", competitor_company_id: "", monitoring_date: null }]);
  };

  const removeCompanyMonitoring = (index: number) => {
    const newMonitorings = companyMonitorings.filter((_, i) => i !== index);
    form.setValue("company_monitorings", newMonitorings);
  };

  const addSubsidiaryComparison = () => {
    form.setValue("subsidiary_comparisons", [...subsidiaryComparisons, { subsidiary_id: "", comparison_id: "", media_prominence: "" }]);
  };

  const removeSubsidiaryComparison = (index: number) => {
    const newComparisons = subsidiaryComparisons.filter((_, i) => i !== index);
    form.setValue("subsidiary_comparisons", newComparisons);
  };

  const onSubmit = async (values: any) => {
    if (isSubmitting) return;

    if (values.password !== values.confirmPassword) {
      form.setError("confirmPassword", {
        type: "manual",
        message: "Passwords don't match!",
      });
      return;
    }

    if ((values.role === "Analyst" || values.role === "Client") && !values.supervisorId) {
      form.setError("supervisorId", {
        type: "manual",
        message: "Supervisor is required for analysts and clients",
      });
      return;
    }
    
    // Validate client-specific fields
    if (values.role === "Client") {
      const hasEmptyCompanyMonitoring = values.company_monitorings.some(
        (cm: any) => !cm.company_id || !cm.competitor_company_id || !cm.monitoring_date
      );
      const hasEmptySubsidiaryComparison = values.subsidiary_comparisons.some(
        (sc: any) => !sc.subsidiary_id || !sc.comparison_id || !sc.media_prominence
      );

      if (hasEmptyCompanyMonitoring || hasEmptySubsidiaryComparison) {
        toast.error("All client monitoring fields are required.");
        return;
      }
    }

    setIsSubmitting(true);

    const userData = {
      username: values.username,
      email: values.email,
      password: values.password,
      role: values.role,
      country_code: values.country_code,
      mobile_number: values.mobile_number,
      supervisor_id: values.supervisorId ? Number(values.supervisorId) : undefined,
      joinDate: values.joinDate.toISOString(),
      expiration_date: values.expirationDate.toISOString(),
      avatar,
      // Pass the new client-specific data if the role is Client
      company_monitorings: values.role === "Client"
        ? values.company_monitorings.map((cm: any) => ({
            ...cm,
            company_id: Number(cm.company_id),
            competitor_company_id: Number(cm.competitor_company_id),
            monitoring_date: cm.monitoring_date.toISOString(),
          }))
        : undefined,
      subsidiary_comparisons: values.role === "Client"
        ? values.subsidiary_comparisons.map((sc: any) => ({
            ...sc,
            subsidiary_id: Number(sc.subsidiary_id),
            comparison_id: Number(sc.comparison_id),
          }))
        : undefined,
    };

    console.log("Creating user with payload:", userData);

    createUser.mutate(userData, {
      onSuccess: (result: any) => {
        toast.success(result?.message || "User created successfully");
        onSave(result?.data?.user || result?.data);
        form.reset();
        onCancel();
      },
      onError: (error: any) => {
        console.error("Error creating user:", error);
        const errorMsg =
          error?.response?.data?.message ||
          (Array.isArray(error?.response?.data?.errors)
            ? error.response.data.errors.map((e: any) => e.message).join(", ")
            : "Something went wrong");
        toast.error(errorMsg);
      },
      onSettled: () => setIsSubmitting(false),
    });
  };

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="flex flex-col items-center mb-6">
        <div className="relative">
          <Avatar className="h-24 w-24 border-2 border-primary/20 bg-gray-100">
            <AvatarImage src={avatar} />
            <AvatarFallback>
              <Image className="h-10 w-10 text-gray-400" />
            </AvatarFallback>
          </Avatar>
          <Button
            size="icon"
            variant="outline"
            className="absolute bottom-0 right-0 rounded-full h-7 w-7 bg-background border border-input shadow-sm"
            onClick={() => {
              const seed = Math.random().toString(36).substring(7);
              setAvatar(`https://api.dicebear.com/7.x/personas/svg?seed=${seed}`);
            }}
          >
            <Pencil className="h-3 w-3" />
          </Button>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input {...field} className="bg-gray-50 border-gray-200" placeholder="Enter username" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input {...field} className="bg-gray-50 border-gray-200" placeholder="Enter email" type="email" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-3 gap-2">
            <FormField
              control={form.control}
              name="country_code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country Code</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-gray-50 border-gray-200">
                        <SelectValue placeholder="Code" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="+234">+234 (NG)</SelectItem>
                      <SelectItem value="+1">+1 (US/CA)</SelectItem>
                      <SelectItem value="+44">+44 (UK)</SelectItem>
                      <SelectItem value="+91">+91 (IN)</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="mobile_number"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>Mobile Number</FormLabel>
                  <FormControl>
                    <Input {...field} className="bg-gray-50 border-gray-200" placeholder="Enter mobile number" type="tel" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Role</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="bg-gray-50 border-gray-200">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Admin">Admin</SelectItem>
                    <SelectItem value="Supervisor">Supervisor</SelectItem>
                    <SelectItem value="Analyst">Analyst</SelectItem>
                    <SelectItem value="Client">Client</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {showSupervisorField && (
            <FormField
              control={form.control}
              name="supervisorId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assign Supervisor</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-gray-50 border-gray-200">
                        <SelectValue placeholder="Choose Supervisor" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {supervisors?.map((sup: any) => (
                        <SelectItem key={sup.id} value={sup.id.toString()}>
                          {sup.username}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {showClientFields && (
            <>
              {/* Company Monitoring Fields */}
              <div className="space-y-4">
                <Label className="font-semibold text-lg">Company Monitoring</Label>
                {companyMonitorings.map((monitoring, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 border p-4 rounded-md relative">
                    <div className="absolute top-2 right-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeCompanyMonitoring(index)}
                        className="text-red-500 hover:text-red-700"
                        disabled={companyMonitorings.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <FormField
                      control={form.control}
                      name={`company_monitorings.${index}.company_id`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Choose Company</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-gray-50 border-gray-200">
                                <SelectValue placeholder="Search for a company" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {companies?.map((comp: any) => (
                                <SelectItem key={comp.id} value={comp.id.toString()}>{comp.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`company_monitorings.${index}.competitor_company_id`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Choose Company Competitor</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-gray-50 border-gray-200">
                                <SelectValue placeholder="Search for a competitor" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {companies?.map((comp: any) => (
                                <SelectItem key={comp.id} value={comp.id.toString()}>{comp.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`company_monitorings.${index}.monitoring_date`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button variant="outline" className={cn("pl-3 text-left font-normal bg-gray-50 border-gray-200 w-full", !field.value && "text-muted-foreground")}>
                                  {field.value ? format(field.value, "dd MMM yyyy") : <span>mm/dd/yyyy</span>}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus className="p-3 pointer-events-auto" />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                ))}
                <Button type="button" onClick={addCompanyMonitoring} variant="outline" className="w-full">
                  <Plus className="mr-2 h-4 w-4" /> Add Company Monitoring
                </Button>
              </div>

              {/* Subsidiary Comparison Fields */}
              <div className="space-y-4 pt-6">
                <Label className="font-semibold text-lg">Subsidiary Comparison</Label>
                {subsidiaryComparisons.map((comparison, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 border p-4 rounded-md relative">
                    <div className="absolute top-2 right-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeSubsidiaryComparison(index)}
                        className="text-red-500 hover:text-red-700"
                        disabled={subsidiaryComparisons.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {/* <FormField
                      control={form.control}
                      name={`subsidiary_comparisons.${index}.subsidiary_id`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Choose Subsidiary</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-gray-50 border-gray-200">
                                <SelectValue placeholder="Search for a subsidiary" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {subsidiaries?.map((sub: any) => (
                                <SelectItem key={sub.id} value={sub.id.toString()}>{sub.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    /> */}

                    <FormField
                      control={form.control}
                      name={`subsidiary_comparisons.${index}.comparison_id`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Choose Company Competitor</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-gray-50 border-gray-200">
                                <SelectValue placeholder="Search for a company" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {companies?.map((comp: any) => (
                                <SelectItem key={comp.id} value={comp.id.toString()}>{comp.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`subsidiary_comparisons.${index}.media_prominence`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Select media Prominence</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-gray-50 border-gray-200">
                                <SelectValue placeholder="Search" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="High">High</SelectItem>
                              <SelectItem value="Medium">Medium</SelectItem>
                              <SelectItem value="Low">Low</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                ))}
                <Button type="button" onClick={addSubsidiaryComparison} variant="outline" className="w-full">
                  <Plus className="mr-2 h-4 w-4" /> Add Subsidiary Comparison
                </Button>
              </div>
            </>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="joinDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Join Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button variant="outline" className={cn("pl-3 text-left font-normal bg-gray-50 border-gray-200", !field.value && "text-muted-foreground")}>
                          {field.value ? format(field.value, "dd MMM yyyy") : <span>Select date</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus className="p-3 pointer-events-auto" />
                    </PopoverContent>
                  </Popover>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="expirationDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Expiration Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button variant="outline" className={cn("pl-3 text-left font-normal bg-gray-50 border-gray-200", !field.value && "text-muted-foreground")}>
                          {field.value ? format(field.value, "dd MMM yyyy") : <span>Select date</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus className="p-3 pointer-events-auto" />
                    </PopoverContent>
                  </Popover>
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input {...field} className="bg-gray-50 border-gray-200" placeholder="Enter password" type="password" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <Input {...field} className="bg-gray-50 border-gray-200" placeholder="Confirm password" type="password" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end space-x-2 pt-4 border-t mt-6">
            <Button type="button" variant="outline" onClick={onCancel} className="bg-gray-50 hover:bg-gray-100 text-gray-800" disabled={isSubmitting}>
              Discard
            </Button>
            <Button type="submit" className="bg-indigo-950" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Save"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}