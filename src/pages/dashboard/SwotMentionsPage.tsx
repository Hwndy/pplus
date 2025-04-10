
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown, ArrowUpRight, AlertTriangle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { SwotMentionForm } from '../../components/admin/SwotMentionForm';

export function SwotMentionsPage() {
  const [date] = useState(new Date());

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">SWOT Mentions</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-600">{date.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
          <Dialog>
            <DialogTrigger asChild>
              <Button>Create SWOT Mention</Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Create SWOT Mention</DialogTitle>
              </DialogHeader>
              <SwotMentionForm />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Strengths Card */}
        <div className="rounded-lg border bg-white p-6">
          <div className="flex items-center justify-center mb-4">
            <div className="rounded-full bg-green-100 p-3">
              <ThumbsUp className="h-6 w-6 text-green-500" />
            </div>
          </div>
          <h2 className="text-xl font-semibold text-center mb-4">Strengths</h2>
          <div className="space-y-4">
            <p className="text-gray-600">VFD Group gained media attention when the brand restated its commitment to the NGX Group after the appointment of Kwairanga as new chairman and also when Vbank got positive reviews on its on V App.</p>
            <ul className="list-disc pl-5 space-y-2 text-gray-600">
              <li>Firm Projects Higher Interest Income, Increased Earnings For Banks</li>
              <li>Rising Interest Rate Will Benefit Banks, Says Cowry Asset Boss</li>
            </ul>
          </div>
        </div>

        {/* Weaknesses Card */}
        <div className="rounded-lg border bg-white p-6">
          <div className="flex items-center justify-center mb-4">
            <div className="rounded-full bg-red-100 p-3">
              <ThumbsDown className="h-6 w-6 text-red-500" />
            </div>
          </div>
          <h2 className="text-xl font-semibold text-center mb-4">Weaknesses</h2>
          <div className="space-y-4">
            <p className="text-gray-600">There was no weakness observed in October.</p>
          </div>
        </div>

        {/* Opportunities Card */}
        <div className="rounded-lg border bg-white p-6">
          <div className="flex items-center justify-center mb-4">
            <div className="rounded-full bg-blue-100 p-3">
              <ArrowUpRight className="h-6 w-6 text-blue-500" />
            </div>
          </div>
          <h2 className="text-xl font-semibold text-center mb-4">Opportunities</h2>
          <div className="space-y-4">
            <p className="text-gray-600">We advise the brand to lend its voice on the importance of fintech in financial inclusion and also create more awareness on the best investment areas for real estate in the country.</p>
          </div>
        </div>

        {/* Threats Card */}
        <div className="rounded-lg border bg-white p-6">
          <div className="flex items-center justify-center mb-4">
            <div className="rounded-full bg-yellow-100 p-3">
              <AlertTriangle className="h-6 w-6 text-yellow-500" />
            </div>
          </div>
          <h2 className="text-xl font-semibold text-center mb-4">Threats</h2>
          <div className="space-y-4">
            <p className="text-gray-600">The rise in inflation in the country and its negative effect on all sectors of the economy and the recent flood which will raise the value of housing in some part of the country.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
