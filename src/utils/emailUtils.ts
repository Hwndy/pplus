import { EmailItem } from '@/components/dashboard/EmailListView';
import { industryLandscapeData, insightRecommendationData } from '@/utils/clientDashboardData';

// Function to convert industry landscape data to email format
export const convertIndustryDataToEmailFormat = (): EmailItem[] => {
  return industryLandscapeData.map(item => ({
    id: item.id,
    title: `Industry Update from ${item.source}`,
    source: item.source,
    content: item.content,
    isRead: false,
    date: new Date().toISOString(), // Using current date as these don't have dates
  }));
};

// Function to convert insight recommendation data to email format
export const convertInsightDataToEmailFormat = (): EmailItem[] => {
  return insightRecommendationData.map(item => ({
    id: item.id,
    title: item.title,
    content: item.content,
    isRead: false,
    date: new Date().toISOString(), // Using current date as these don't have dates
  }));
};

// Banking competitive intelligence updates
export const getCompetitiveIntelligenceEmails = (): EmailItem[] => {
  return [
    {
      id: 'ci-1',
      title: 'Competitive Media Share Analysis - Q2 2024',
      source: 'Competitive Intelligence Team',
      content: `
        <h3>Banking Business - Competitive Media Share Analysis</h3>
        <p>Our latest analysis shows that First Bank leads with 35% of media share in the banking sector, followed closely by UBA at 35%. FCMB has 22% share while GTB trails at 6%.</p>
        <p>Key findings:</p>
        <ul>
          <li>First Bank dominates media prominence on Corporate news (55%)</li>
          <li>UBA leads in CSR/ESG coverage (50%)</li>
          <li>FCMB has significant prominence in Financial Reports (40%)</li>
          <li>UBA shows strong performance in Partnership news (69%)</li>
        </ul>
        <p>Recommendation: Consider increasing corporate news coverage and CSR initiatives to improve competitive positioning in media share.</p>
      `,
      isRead: false,
      date: '2024-05-20T09:30:00',
      preview: 'Our latest analysis shows that First Bank leads with 35% of media share in the banking sector, followed closely by UBA at 35%...'
    },
    {
      id: 'ci-2',
      title: 'Sentiment Analysis Report - Banking Sector',
      source: 'Media Analytics Department',
      content: `
        <h3>Competitive Sentiment Intelligence - Banking Business</h3>
        <p>The latest sentiment analysis shows First Bank leading with a positive sentiment score of 0.33, significantly ahead of GTB (0.18) and UBA (0.14).</p>
        <p>Sentiment distribution highlights:</p>
        <ul>
          <li>First Bank has the highest proportion of strongly positive mentions (50%)</li>
          <li>Wema Bank follows with 30% strongly positive mentions</li>
          <li>FCMB shows balanced sentiment distribution but fewer strongly positive mentions</li>
          <li>All banks maintain a similar ratio of negative sentiment (approximately 10-15%)</li>
        </ul>
        <p>Recommendation: Focus on quality of media coverage rather than just quantity, as sentiment scores have stronger correlation with brand perception than mere volume of mentions.</p>
      `,
      isRead: false,
      date: '2024-05-18T14:15:00',
      preview: 'The latest sentiment analysis shows First Bank leading with a positive sentiment score of 0.33, significantly ahead of GTB (0.18) and UBA (0.14)...'
    },
    {
      id: 'ci-3',
      title: 'Competitive PR Drivers Analysis - Banking Sector',
      source: 'PR Strategy Team',
      content: `
        <h3>Key PR Drivers in the Banking Sector</h3>
        <p>Our analysis of key PR drivers for major competitors reveals distinct focus areas:</p>
        <h4>First Bank</h4>
        <ul>
          <li>Infrastructure development (automated branch in Lekki)</li>
          <li>Crisis management (N550 Million fraud allegations)</li>
          <li>Financial inclusion (dollar trading platform for women)</li>
        </ul>
        <h4>UBA</h4>
        <ul>
          <li>Gender diversity and inclusion (58% female intake in GMAP)</li>
          <li>Professional development (3,200 young professionals in GMAP initiative)</li>
          <li>Innovation partnerships (with ICAN)</li>
        </ul>
        <h4>Wema Bank</h4>
        <ul>
          <li>Customer engagement (5 for 5 Promo winners)</li>
          <li>Capital raising (N149.3bn rights issue)</li>
          <li>Digital transformation ("Positioning Nigeria For Greater Digital Journey")</li>
          <li>Impressive financial performance (135% profit growth)</li>
        </ul>
        <p>Recommendation: Develop PR strategies that highlight our strengths in digital innovation and financial inclusion to compete effectively with these key drivers.</p>
      `,
      isRead: false,
      date: '2024-05-15T11:45:00',
      preview: 'Our analysis of key PR drivers for major competitors reveals distinct focus areas across First Bank, UBA, and Wema Bank...'
    },
    {
      id: 'ci-4',
      title: 'Media Prominence on Sponsorship - Competitive Analysis',
      source: 'Sponsorship Strategy Team',
      content: `
        <h3>Competitive Analysis: Media Prominence on Sponsorship</h3>
        <p>UBA currently dominates media prominence on sponsorship activities with 69% share, followed by Wema Bank at 31%.</p>
        <p>Key sponsorship activities driving media coverage:</p>
        <ul>
          <li>UBA's sponsorship of arts and cultural events has generated significant positive coverage</li>
          <li>Wema Bank's sponsorship of tech and innovation events is gaining traction</li>
          <li>First Bank, FCMB, and GTB have minimal visibility in sponsorship-related media coverage</li>
        </ul>
        <p>Recommendation: Consider strategic sponsorships in high-visibility sectors aligned with our brand values to increase media prominence in this category.</p>
      `,
      isRead: false,
      date: '2024-05-10T16:20:00',
      preview: 'UBA currently dominates media prominence on sponsorship activities with 69% share, followed by Wema Bank at 31%...'
    },
    {
      id: 'ci-5',
      title: 'Gender Inclusion Initiatives - Competitive Landscape',
      source: 'Diversity & Inclusion Analysis',
      content: `
        <h3>Gender Inclusion Initiatives in Banking - Competitive Analysis</h3>
        <p>Several competitors are making significant strides in gender inclusion initiatives:</p>
        <ul>
          <li>UBA is leading with its "UBA Business Series, Female Leaders Spotlight" and "IWD 2023: UBA To Host Special Business Series On Women"</li>
          <li>First Bank has launched a "maiden dollar trading platform for women"</li>
          <li>Wema Bank's CEO has publicly committed to women empowerment</li>
        </ul>
        <p>These initiatives are generating positive sentiment and media coverage, particularly for UBA which has accelerated gender inclusion with 58% female intake in their graduate program.</p>
        <p>Recommendation: Develop and promote more visible gender inclusion initiatives to remain competitive in this increasingly important area of corporate social responsibility.</p>
      `,
      isRead: false,
      date: '2024-05-05T10:30:00',
      preview: 'Several competitors are making significant strides in gender inclusion initiatives, with UBA leading through its business series for female leaders...'
    }
  ];
};
