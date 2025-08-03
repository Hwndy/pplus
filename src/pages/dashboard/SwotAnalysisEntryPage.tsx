import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Save, FileText, ArrowLeft, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { SwotForm, SwotAnalysis } from '@/components/admin/SwotMentionForm';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb';

// Mock data for companies
const companies = [
  { id: '1', name: 'VFD Group' },
  { id: '2', name: 'ABC Corporation' },
  { id: '3', name: 'XYZ Enterprises' }
];

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

  // State management
  const [swotAnalyses, setSwotAnalyses] = useState<SwotAnalysis[]>([
    {
      ...defaultFormData,
      company: companies.find(c => c.id === companyIdFromQuery)?.name || ''
    }
  ]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // User role (mock - in real app this would come from auth context)
  const userRole = 'analyst';

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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast.success('SWOT analysis saved successfully!');
      navigate('/dashboard/swot-analysis');
    } catch (error) {
      toast.error('Failed to save SWOT analysis. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveAsDraft = async () => {
    setIsSubmitting(true);
    try {
      // Update status to draft
      handleFieldChange('status', 'DRAFT');

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast.success('SWOT analysis saved as draft!');
    } catch (error) {
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
            disabled={isSubmitting}
          >
            <FileText className="mr-2 h-4 w-4" />
            Save as Draft
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Save className="mr-2 h-4 w-4" />
            {isSubmitting ? 'Saving...' : 'Save Analysis'}
          </Button>
        </div>
      </div>

      {/* SWOT Form */}
      <div className="flex-1 overflow-hidden">
        <SwotForm
          swotAnalyses={swotAnalyses}
          activeIndex={activeIndex}
          errors={errors}
          apiCompanies={companies}
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