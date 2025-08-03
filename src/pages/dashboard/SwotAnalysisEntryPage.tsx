import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Save, FileText, ArrowLeft, Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { SwotForm, SwotAnalysis } from '@/components/admin/SwotMentionForm';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { useCompanies, useCreateSwotAnalysis, useUpdateSwotAnalysis, useSwotAnalysisById } from '@/hooks/useApi';
import { apiService } from '@/services/apiService';

// Default form data
const defaultFormData: SwotAnalysis = {
  id: 1,
  date: new Date().toISOString().split('T')[0],
  company: '',
  currentCategory: 'strengths',
  currentAnalysis: '',
  analystNote: '',
  supervisorNote: '',
  adminNote: '',
  status: 'DRAFT'
};

export default function SwotAnalysisEntryPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const companyIdFromQuery = queryParams.get('companyId') || '';

  // API hooks
  const { data: companiesData = [], loading: companiesLoading } = useCompanies();
  const { mutate: createSwotAnalysis, loading: creating } = useCreateSwotAnalysis();
  const { mutate: updateSwotAnalysis, loading: updating } = useUpdateSwotAnalysis();

  // State management
  const [swotAnalyses, setSwotAnalyses] = useState<SwotAnalysis[]>([
    {
      ...defaultFormData,
      company: ''
    }
  ]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // User role (mock - in real app this would come from auth context)
  const userRole = 'analyst';

  // Update company name when companies data loads
  useEffect(() => {
    if (companiesData.length > 0 && companyIdFromQuery) {
      const selectedCompany = companiesData.find(c => c.id === companyIdFromQuery);
      if (selectedCompany) {
        setSwotAnalyses(prev => prev.map((swot, index) =>
          index === 0 ? { ...swot, company: selectedCompany.name } : swot
        ));
      }
    }
  }, [companiesData, companyIdFromQuery]);

  // Form handlers
  const handleSwotChange = (updatedSwotAnalyses: SwotAnalysis[]) => {
    setSwotAnalyses(updatedSwotAnalyses);
  };

  const handleAddSwot = () => {
    const newSwot: SwotAnalysis = {
      ...defaultFormData,
      id: Date.now(),
    };
    setSwotAnalyses([...swotAnalyses, newSwot]);
    setActiveIndex(swotAnalyses.length);
  };

  const handleCloneSwot = () => {
    const currentSwot = swotAnalyses[activeIndex];
    const clonedSwot: SwotAnalysis = {
      ...currentSwot,
      id: Date.now(),
      currentAnalysis: `${currentSwot.currentAnalysis} (Copy)`,
    };
    setSwotAnalyses([...swotAnalyses, clonedSwot]);
    setActiveIndex(swotAnalyses.length);
  };

  const handleSwitchSwot = (index: number) => {
    setActiveIndex(index);
  };

  const handleFieldChange = (name: string, value: string | string[]) => {
    const updatedSwotAnalyses = [...swotAnalyses];
    updatedSwotAnalyses[activeIndex] = {
      ...updatedSwotAnalyses[activeIndex],
      [name]: value
    };
    setSwotAnalyses(updatedSwotAnalyses);

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleClearError = (fieldName: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  };

  // Validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    const currentSwot = swotAnalyses[activeIndex];

    if (!currentSwot.company.trim()) {
      newErrors.company = 'Company is required';
    }
    if (!currentSwot.date) {
      newErrors.date = 'Date is required';
    }
    if (!currentSwot.currentAnalysis?.trim()) {
      newErrors.currentAnalysis = 'Analysis is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit handlers
  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error('Please fix the validation errors before submitting.');
      return;
    }

    setIsSubmitting(true);
    try {
      const currentSwot = swotAnalyses[activeIndex];
      const selectedCompany = companiesData.find(c => c.name === currentSwot.company);

      if (!selectedCompany) {
        toast.error('Please select a valid company.');
        return;
      }

      // Prepare SWOT analysis data for API
      const swotData = {
        companyId: selectedCompany.id,
        title: `SWOT Analysis - ${currentSwot.company} - ${format(new Date(currentSwot.date), 'MMM dd, yyyy')}`,
        date: currentSwot.date,
        strengths: currentSwot.currentCategory === 'strengths' ? [currentSwot.currentAnalysis] : [],
        weaknesses: currentSwot.currentCategory === 'weaknesses' ? [currentSwot.currentAnalysis] : [],
        opportunities: currentSwot.currentCategory === 'opportunities' ? [currentSwot.currentAnalysis] : [],
        threats: currentSwot.currentCategory === 'threats' ? [currentSwot.currentAnalysis] : [],
        analystNote: currentSwot.analystNote,
        supervisorNote: currentSwot.supervisorNote,
        status: currentSwot.status || 'PENDING'
      };

      console.log('Submitting SWOT analysis:', swotData);

      // Call the API to create SWOT analysis
      await createSwotAnalysis(swotData);

      toast.success('SWOT analysis saved successfully!');
      navigate('/dashboard/swot-analysis');
    } catch (error) {
      console.error('Error saving SWOT analysis:', error);
      toast.error('Failed to save SWOT analysis. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveAsDraft = async () => {
    setIsSubmitting(true);
    try {
      const currentSwot = swotAnalyses[activeIndex];
      const selectedCompany = companiesData.find(c => c.name === currentSwot.company);

      if (!selectedCompany) {
        toast.error('Please select a valid company.');
        return;
      }

      // Prepare SWOT analysis data for API with DRAFT status
      const swotData = {
        companyId: selectedCompany.id,
        title: `SWOT Analysis - ${currentSwot.company} - ${format(new Date(currentSwot.date), 'MMM dd, yyyy')} (Draft)`,
        date: currentSwot.date,
        strengths: currentSwot.currentCategory === 'strengths' ? [currentSwot.currentAnalysis] : [],
        weaknesses: currentSwot.currentCategory === 'weaknesses' ? [currentSwot.currentAnalysis] : [],
        opportunities: currentSwot.currentCategory === 'opportunities' ? [currentSwot.currentAnalysis] : [],
        threats: currentSwot.currentCategory === 'threats' ? [currentSwot.currentAnalysis] : [],
        analystNote: currentSwot.analystNote,
        supervisorNote: currentSwot.supervisorNote,
        status: 'DRAFT'
      };

      console.log('Saving SWOT analysis as draft:', swotData);

      // Call the API to create SWOT analysis as draft
      await createSwotAnalysis(swotData);

      toast.success('SWOT analysis saved as draft!');
    } catch (error) {
      console.error('Error saving SWOT analysis as draft:', error);
      toast.error('Failed to save draft. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate('/dashboard/swot-analysis');
  };

  return (
    <div className="h-full flex flex-col animate-fade-in max-w-full overflow-hidden">
      {/* Breadcrumb */}
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard/swot-analysis">SWOT Analysis</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink>Create Analysis</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Create SWOT Analysis</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleSaveAsDraft}
            disabled={isSubmitting || creating}
          >
            {creating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving Draft...
              </>
            ) : (
              <>
                <FileText className="mr-2 h-4 w-4" />
                Save as Draft
              </>
            )}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || creating}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {creating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Analysis
              </>
            )}
          </Button>
        </div>
      </div>

      {/* SWOT Form */}
      <div className="flex-1 overflow-hidden">
        <SwotForm
          swotAnalyses={swotAnalyses}
          activeIndex={activeIndex}
          errors={errors}
          apiCompanies={companiesData}
          userRole={userRole}
          onSwotChange={handleSwotChange}
          onAddSwot={handleAddSwot}
          onCloneSwot={handleCloneSwot}
          onSwitchSwot={handleSwitchSwot}
          onFieldChange={handleFieldChange}
          onClearError={handleClearError}
          onSave={handleSubmit}
          onCancel={handleBack}
        />
      </div>

      {/* Multiple SWOT Analyses Navigation */}
      {swotAnalyses.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              SWOT Analyses ({swotAnalyses.length})
            </CardTitle>
            <CardDescription>
              Switch between multiple SWOT analyses or add new ones
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {swotAnalyses.map((swot, index) => (
                <Button
                  key={swot.id}
                  variant={index === activeIndex ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleSwitchSwot(index)}
                  className="flex items-center gap-2"
                >
                  <span>Analysis {index + 1}</span>
                  {swot.currentAnalysis && <span className="text-xs opacity-70">({swot.currentAnalysis.substring(0, 20)}...)</span>}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddSwot}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add New
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}