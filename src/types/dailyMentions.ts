
export type SentimentType = 'Positive' | 'Neutral' | 'Negative' | 'N/A';

export interface NewsLink {
  url: string;
  label?: string;
}

export interface MediaMention {
  id: string;
  title: string;
  content: string;
  sentiment: SentimentType;
  reporter?: string;
  source?: string;
  publication?: string;
  publicationPage?: string;
  publicationDate?: string;
  links: NewsLink[];
}

export interface MentionSection {
  id: string;
  title: string;
  mentions: MediaMention[];
}

export interface DailyMediaReport {
  id: string;
  date: string;
  sections: MentionSection[];
  expectingPublications?: string[];
  footerNote?: string;
}

export const createEmptyMention = (): MediaMention => ({
  id: `mention-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
  title: '',
  content: '',
  sentiment: 'Positive',
  reporter: '',
  source: '',
  links: [{ url: '' }],
});

export const createEmptySection = (): MentionSection => ({
  id: `section-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
  title: '',
  mentions: [createEmptyMention()],
});

export const createEmptyReport = (): DailyMediaReport => ({
  id: `report-${Date.now()}`,
  date: new Date().toISOString().split('T')[0],
  sections: [createEmptySection()],
  expectingPublications: [],
});

// Create mock data for a sample daily media report
export const createMockReport = (): DailyMediaReport => {
  return {
    id: 'mock-report-1',
    date: new Date().toISOString().split('T')[0],
    sections: [
      {
        id: 'section-1',
        title: 'STANBIC IBTC',
        mentions: [
          {
            id: 'mention-1',
            title: 'Stanbic IBTC Promotes Financial Inclusion With Digital Solutions',
            content: 'Stanbic IBTC Bank, a subsidiary of Stanbic IBTC Holdings Plc, has restated its commitment to enhancing financial inclusion through innovative digital solutions. The bank announced this at the launch of its new mobile banking application designed to simplify financial transactions.',
            sentiment: 'Positive',
            reporter: 'Sarah Johnson',
            source: 'BusinessDay',
            publication: 'BusinessDay',
            publicationPage: '12',
            publicationDate: '10th June',
            links: [{ url: 'https://example.com/stanbic-1', label: 'Read more' }],
          },
          {
            id: 'mention-2',
            title: 'Stanbic IBTC Pension Managers Records 12% Growth in Assets',
            content: 'Stanbic IBTC Pension Managers, a subsidiary of Stanbic IBTC Holdings Plc, has reported a 12% growth in assets under management for the first quarter of 2023, reaching N4.5 trillion.',
            sentiment: 'Positive',
            reporter: 'Michael Oladipo',
            source: 'ThisDay',
            publication: 'ThisDay',
            publicationPage: '8',
            publicationDate: '11th June',
            links: [{ url: 'https://example.com/stanbic-2', label: 'Read more' }],
          }
        ]
      },
      {
        id: 'section-2',
        title: 'STANDARD BANK AFRICA',
        mentions: [
          {
            id: 'mention-3',
            title: 'Standard Bank Expands Operations in East Africa',
            content: 'Standard Bank Group has announced plans to expand its operations in East Africa with a focus on digital banking services. The bank aims to increase its customer base by 30% over the next two years.',
            sentiment: 'Positive',
            reporter: 'Elizabeth Mwangi',
            source: 'African Business',
            publication: 'African Business Magazine',
            publicationPage: '15',
            publicationDate: '9th June',
            links: [{ url: 'https://example.com/standard-1', label: 'Read more' }],
          }
        ]
      },
      {
        id: 'section-3',
        title: 'COMPETITOR ACTIVITIES',
        mentions: [
          {
            id: 'mention-4',
            title: 'First Bank Records Q2 Profit Decline',
            content: 'First Bank of Nigeria has reported a 5% decline in profits for the second quarter of 2023, citing challenging economic conditions and increased operational costs.',
            sentiment: 'Negative',
            reporter: 'James Adeyemi',
            source: 'The Guardian',
            publication: 'The Guardian',
            publicationPage: '22',
            publicationDate: '10th June',
            links: [{ url: 'https://example.com/competitor-1', label: 'Read more' }],
          },
          {
            id: 'mention-5',
            title: 'UBA Launches New Digital Platform for SMEs',
            content: 'United Bank for Africa (UBA) has launched a new digital platform designed to support small and medium enterprises (SMEs) with loan applications, business advisory services, and financial management tools.',
            sentiment: 'Neutral',
            reporter: 'Patricia Nnadi',
            source: 'Vanguard',
            publication: 'Vanguard',
            publicationPage: '18',
            publicationDate: '11th June',
            links: [{ url: 'https://example.com/competitor-2', label: 'Read more' }],
          }
        ]
      }
    ],
    expectingPublications: ['The Punch', 'Daily Trust', 'Leadership'],
    footerNote: 'P+ Measurement Services Daily Media Briefs cover all relevant news reports, features and photo stories in major Nigerian newspapers, magazines, online news sites & blogs.'
  };
};
