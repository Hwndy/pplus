import { SocialMediaMentionForm } from './components/SocialMediaMentionForm';

export default function SocialMediaMentionsPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Social Media Mentions</h1>
      </div>
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <SocialMediaMentionForm />
        </div>
      </div>
    </div>
  );
}