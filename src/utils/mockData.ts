
// Mock data for the application

// Clients data
export const clients = [
  { id: '1', name: 'Acme Corp', industry: 'Technology', country: 'USA' },
  { id: '2', name: 'Global Media', industry: 'Media', country: 'UK' },
  { id: '3', name: 'Sunset Entertainment', industry: 'Entertainment', country: 'Canada' },
  { id: '4', name: 'Green Energy Ltd', industry: 'Energy', country: 'Germany' },
  { id: '5', name: 'Health Partners', industry: 'Healthcare', country: 'Australia' },
];

// Data parameters
export const dataParameters = [
  { id: '1', name: 'News Mentions', category: 'Mentions', description: 'Count of mentions in news articles' },
  { id: '2', name: 'Social Media Mentions', category: 'Mentions', description: 'Count of mentions on social media' },
  { id: '3', name: 'Video Mentions', category: 'Mentions', description: 'Count of mentions in video content' },
  { id: '4', name: 'Reach', category: 'Engagement', description: 'Potential audience reach' },
  { id: '5', name: 'Engagement', category: 'Engagement', description: 'Interaction with content' },
  { id: '6', name: 'Sentiment', category: 'Analysis', description: 'Positive, negative, or neutral tone' },
  { id: '7', name: 'Brand Placement', category: 'Analysis', description: 'Prominence of brand in content' },
  { id: '8', name: 'Share of Voice', category: 'Analysis', description: 'Comparison to competitors' }
];

// Media channels
export const mediaChannels = [
  { id: '1', name: 'Television', category: 'Traditional', description: 'TV channels and programs' },
  { id: '2', name: 'Radio', category: 'Traditional', description: 'Radio stations and programs' },
  { id: '3', name: 'Newspapers', category: 'Traditional', description: 'Print newspapers' },
  { id: '4', name: 'Magazines', category: 'Traditional', description: 'Print magazines' },
  { id: '5', name: 'Twitter', category: 'Social', description: 'Twitter/X platform' },
  { id: '6', name: 'Facebook', category: 'Social', description: 'Facebook platform' },
  { id: '7', name: 'Instagram', category: 'Social', description: 'Instagram platform' },
  { id: '8', name: 'YouTube', category: 'Social', description: 'YouTube platform' },
  { id: '9', name: 'News Websites', category: 'Digital', description: 'Online news sites' },
  { id: '10', name: 'Blogs', category: 'Digital', description: 'Blog content' }
];

// Mock data entries
export const dataEntries = [
  {
    id: '1',
    clientId: '1',
    parameterId: '1',
    channelId: '1',
    value: 42,
    date: '2023-07-01',
    analystId: '3',
    status: 'approved',
    comments: ''
  },
  {
    id: '2',
    clientId: '1',
    parameterId: '5',
    channelId: '5',
    value: 1250,
    date: '2023-07-01',
    analystId: '3',
    status: 'approved',
    comments: ''
  },
  {
    id: '3',
    clientId: '2',
    parameterId: '1',
    channelId: '3',
    value: 15,
    date: '2023-07-02',
    analystId: '3',
    status: 'pending',
    comments: ''
  },
  {
    id: '4',
    clientId: '3',
    parameterId: '6',
    channelId: '8',
    value: 0.78,
    date: '2023-07-03',
    analystId: '3',
    status: 'rejected',
    comments: 'Please verify the sentiment calculation method'
  },
];

// Generate random data entries (for testing with larger datasets)
export function generateMockDataEntries(count: number) {
  const entries = [];
  
  for (let i = 0; i < count; i++) {
    const clientId = clients[Math.floor(Math.random() * clients.length)].id;
    const parameterId = dataParameters[Math.floor(Math.random() * dataParameters.length)].id;
    const channelId = mediaChannels[Math.floor(Math.random() * mediaChannels.length)].id;
    const analystId = '3'; // Default to our analyst user
    const statuses = ['pending', 'approved', 'rejected'];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const comments = status === 'rejected' ? 'Please review and resubmit' : '';
    
    // Generate a random date in the last 30 days
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 30));
    
    entries.push({
      id: (i + 5).toString(),
      clientId,
      parameterId,
      channelId,
      value: Math.floor(Math.random() * 1000),
      date: date.toISOString().split('T')[0],
      analystId,
      status,
      comments
    });
  }
  
  return entries;
}

// Mock users
export const users = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin',
    active: true
  },
  {
    id: '2',
    name: 'Supervisor User',
    email: 'supervisor@example.com',
    role: 'supervisor',
    active: true
  },
  {
    id: '3',
    name: 'Analyst User',
    email: 'analyst@example.com',
    role: 'analyst',
    active: true
  },
  {
    id: '4',
    name: 'Client User',
    email: 'client@example.com',
    role: 'client',
    active: true
  }
];

// Dashboard summary data
export const dashboardSummary = {
  totalMentions: 1284,
  totalReach: 3570000,
  averageSentiment: 0.65,
  mediaBreakdown: [
    { name: 'Television', value: 25 },
    { name: 'Radio', value: 15 },
    { name: 'Print', value: 20 },
    { name: 'Social', value: 40 }
  ],
  mentionTrend: [
    { date: '2023-01', value: 320 },
    { date: '2023-02', value: 350 },
    { date: '2023-03', value: 400 },
    { date: '2023-04', value: 380 },
    { date: '2023-05', value: 410 },
    { date: '2023-06', value: 490 },
    { date: '2023-07', value: 520 }
  ],
  reachTrend: [
    { date: '2023-01', value: 1200000 },
    { date: '2023-02', value: 1350000 },
    { date: '2023-03', value: 1500000 },
    { date: '2023-04', value: 1600000 },
    { date: '2023-05', value: 1800000 },
    { date: '2023-06', value: 2100000 },
    { date: '2023-07', value: 2350000 }
  ],
  topClients: [
    { name: 'Acme Corp', mentions: 420, reach: 1200000 },
    { name: 'Global Media', mentions: 380, reach: 980000 },
    { name: 'Sunset Entertainment', mentions: 320, reach: 780000 }
  ]
};

// Extended mock data for large tables
export const allDataEntries = [
  ...dataEntries,
  ...generateMockDataEntries(100)
];
