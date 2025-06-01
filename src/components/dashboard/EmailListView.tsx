import React, { useState } from 'react';
import { format } from 'date-fns';
import { Mail, MailOpen, Clock, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface EmailItem {
  id: string;
  subject?: string;
  title?: string;
  sender?: {
    name: string;
    email: string;
  };
  source?: string;
  date?: string;
  content: string;
  isRead: boolean;
  preview?: string;
}

interface EmailListViewProps {
  emails: EmailItem[];
  title: string;
  description: string;
}

export function EmailListView({ emails, title, description }: EmailListViewProps) {
  const [selectedEmail, setSelectedEmail] = useState<EmailItem | null>(null);
  const [emailsState, setEmailsState] = useState<EmailItem[]>(emails);

  const handleEmailClick = (email: EmailItem) => {
    // Mark the email as read
    if (!email.isRead) {
      const updatedEmails = emailsState.map(e =>
        e.id === email.id ? { ...e, isRead: true } : e
      );
      setEmailsState(updatedEmails);
    }

    // Set as selected email
    setSelectedEmail(email);
  };

  return (
    <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
      <div className="p-4 border-b bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        <p className="text-sm text-gray-500">{description}</p>
      </div>

      <div className="flex flex-col md:flex-row h-[600px]">
        {/* Email List */}
        <div className="w-full md:w-2/5 border-r overflow-y-auto">
          {emailsState.map((email) => (
            <div
              key={email.id}
              onClick={() => handleEmailClick(email)}
              className={cn(
                "p-4 border-b cursor-pointer transition-colors",
                "hover:bg-blue-50",
                selectedEmail?.id === email.id ? "bg-blue-50" : "",
                email.isRead ? "bg-gray-50" : ""
              )}
            >
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  {email.isRead ? (
                    <MailOpen size={18} className="text-gray-400" />
                  ) : (
                    <Mail size={18} className="text-blue-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h4 className={cn(
                      "text-sm font-medium truncate mb-1",
                      email.isRead ? "text-gray-500" : "text-gray-900"
                    )}>
                      {email.subject || email.title}
                    </h4>
                  </div>
                  {email.sender && (
                    <p className="text-xs text-gray-500 font-medium">{email.sender.name}</p>
                  )}
                  {email.source && (
                    <p className="text-xs text-gray-500 font-medium">
                      <Globe size={12} className="inline mr-1" />
                      {email.source}
                    </p>
                  )}
                  {email.preview && (
                    <p className={cn(
                      "text-xs line-clamp-2 mt-1",
                      email.isRead ? "text-gray-400" : "text-gray-600"
                    )}>
                      {email.preview}
                    </p>
                  )}
                  {!email.preview && (
                    <p className={cn(
                      "text-xs line-clamp-2 mt-1",
                      email.isRead ? "text-gray-400" : "text-gray-600"
                    )}>
                      {email.content.substring(0, 120)}...
                    </p>
                  )}
                  {email.date && (
                    <div className="flex items-center mt-2 text-xs text-gray-400">
                      <Clock size={12} className="mr-1" />
                      {format(new Date(email.date), 'MMM d, yyyy')}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Email Content */}
        <div className="w-full md:w-3/5 p-6 overflow-y-auto bg-white">
          {selectedEmail ? (
            <div className="animate-fade-in">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {selectedEmail.subject || selectedEmail.title}
                </h2>
                <div className="flex items-center justify-between text-sm text-gray-500 mb-1">
                  {selectedEmail.sender && (
                    <div>
                      From: <span className="font-medium">{selectedEmail.sender.name}</span> &lt;{selectedEmail.sender.email}&gt;
                    </div>
                  )}
                  {selectedEmail.source && (
                    <div>
                      Source: <span className="font-medium">{selectedEmail.source}</span>
                    </div>
                  )}
                  {selectedEmail.date && (
                    <div>
                      {format(new Date(selectedEmail.date), 'MMM d, yyyy')}
                    </div>
                  )}
                </div>
              </div>

              <div className="prose prose-sm max-w-none text-gray-700 border-t pt-4">
                {selectedEmail.content.includes('<') ? (
                  <div dangerouslySetInnerHTML={{ __html: selectedEmail.content }} />
                ) : (
                  <p>{selectedEmail.content}</p>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <Mail size={48} className="mb-4 opacity-20" />
              <p className="text-sm">Select an item to view its content</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
