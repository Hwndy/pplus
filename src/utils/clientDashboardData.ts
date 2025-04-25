// Mock data for the client media dashboard

// Executive Summary data
export const executiveSummaryData = {
  totalMedia: 397,
  brandMediaReputationScore: 0.98,
  brandExposureLocalMedia: 391,
  brandExposureInternationalMedia: 6,
  positiveMediaExposure: 392,
  neutralMediaExposure: 3,
  negativeMediaExposure: 2,
  languageDistribution: [
    { name: 'English', value: 98 },
    { name: 'Portuguese', value: 1 },
    { name: 'Turkish', value: 1 }
  ],
  mediaVehicleDistribution: [
    { name: 'Online Media', value: 81 },
    { name: 'Print Media', value: 19 }
  ]
};

// Insight and Recommendation data
export const insightRecommendationData = [
  {
    id: '01',
    title: 'Sentiment Analysis',
    content: "The brand's media coverage for the month showed 98% positive sentiment, 1% negative sentiment, and 1% neutral sentiment, indicating strong public approval and a widely favorable media presence. This success was driven by strategic media engagements, compelling storytelling, and effective responses to key industry events. The consistently positive reception reinforced the brand's credibility, industry leadership, and reputation. To sustain this momentum, ongoing media visibility, thought leadership initiatives, and impactful brand activities will be essential."
  },
  {
    id: '02',
    title: 'Competitive Trend',
    content: "First Bank led media coverage in the banking sector with major developments, including the inauguration of an e-branch in Lekki, a harassment claim of N450 million naira from his security aide, and the bank's response refuting the fraud allegations as unfounded and false. UBA followed closely with significant highlights, such as discussions on gender parity at the UBA Business Series and plans to host special business series in celebration of International Women's Day 2023.Wema Bank ranked third in media coverage, featuring key initiatives like 80 customers emerging as winners in the 5 for 5 Promo and its plan to raise N149.3 billion through a rights issue."
  },
  {
    id: '03',
    title: 'Government Policy Watch',
    content: "As reported by Thenationonlineng.net, the Central Bank of Nigeria (CBN) has introduced detailed guidelines for the interbank foreign exchange (FX) trading system via EFEMS, establishing a minimum tradable amount of $100,000 with incremental clips sizes of $50,000. This framework is designed to enhance transparency and efficiency in FX transactions. Additionally, the CBN has implemented strategic policy measures, such as increasing forex supply and tightening monetary regulations, to stabilize the FX market, strengthen the naira, and bolster foreign reserves."
  },
  {
    id: '04',
    title: 'CEO Performance Analysis',
    content: "In March, the CEOs of First Bank, Wema Bank, and UBA led in media prominence, gaining notable visibility across major media outlets. Their strong presence reinforced both personal and brand credibility, highlighting their leadership and influence within the industry. This exposure further elevated their respective banks' profiles, emphasizing their commitment to innovation, strategic growth, and excellence. A strong media presence continues to be instrumental in enhancing brand reputation and demonstrating industry leadership. We recommend regular participation in high-profile industry events, media interviews, and thought leadership initiatives to maintain and strengthen the brand CEO's presence."
  },
  {
    id: '05',
    title: 'Analyst Advisory',
    content: "In response to the Central Bank of Nigeria's (CBN) recent reforms aimed at stabilizing the naira and boosting investor confidence, we recommend that the brand strengthen its capital base to stay competitive and resilient in the evolving financial landscape. This can be achieved by exploring strategic partnerships, mergers, or acquisitions to enhance financial capacity and expand market presence, as well as developing innovative financial products and services tailored to evolving consumer needs to foster customer loyalty."
  }
];

// Industry Landscape data
export const industryLandscapeData = [
  {
    id: '1',
    source: 'Thisdaylive.com',
    content: "the Central Bank of Nigeria (CBN) is strengthening regulatory oversight in Nigeria's financial sector by enforcing stricter compliance measures, particularly in anti-money laundering (AML) and counter-financing of terrorism (CFT). At a recent workshop, experts emphasized the need for stronger KYC, KYB, and KYT protocols to curb money financial crimes, highlighting the risks of illicit financial flows. CBN Governor Olayemi Cardoso reaffirmed the commitment to aligning with global banking standards, enhancing transparency, and reinforcing trust in the financial system. These measures reflect a broader effort to fortify regulatory compliance, enhance transparency, and maintain Nigeria's position in the global financial landscape."
  },
  {
    id: '2',
    source: 'Thenationonlineng.net',
    content: "the Central Bank of Nigeria (CBN) has named 16 new directors across key departments to improve regulatory oversight and operational efficiency. These appointments span critical areas such as Banking Supervision, Payment Systems, and Consumer Protection, underscoring the CBN's dedication to reinforcing compliance, combating financial fraud, and enhancing consumer grievance resolution. This strategic leadership restructuring is designed to strengthen the financial sector's stability in response to evolving economic challenges."
  },
  {
    id: '3',
    source: 'Dailytrust.com',
    content: "the Central Bank of Nigeria (CBN) reported a decrease in currency circulation to N5.03 trillion. The last notable decline occurred in January 2024, when circulation marginally dropped from N3.653 trillion to N3.650 trillion. This reduction reflects the CBN's ongoing efforts to manage liquidity and stabilize the nation's financial system."
  }
];

// Brand Media Sentiment data
export const brandMediaSentimentData = {
  sentimentDistribution: {
    stronglyPositive: 70,
    positive: 8,
    neutral: 4,
    slightlyNegative: 8,
    stronglyNegative: 0,
    negative: 10
  },
  keyDrivers: {
    positive: [
      "Nigeria's Private Sector Sees Strong Growth in A Year: Stanbic IBTC PMI Report",
      "Stanbic IBTC Bank Continuously Provide Banking Offerings to Empower Nigerians",
      "Stanbic IBTC Asset Management Partners with SIFAX Group to Develop Ultra-Modern Iota Terminal in Lagos",
      "NESG-Stanbic IBTC Business Confidence Monitor for February 2023",
      "Stanbic IBTC Holdings to pay shareholders N39.97 bn as dividend in 2024",
      "Stanbic IBTC reports N203.706 billion pre-tax profit in 2024",
      "Stanbic IBTC Pension Managers Renovates School, Boosts Education in Cross River"
    ],
    negative: [
      "Suit No: FBTC Legal Scandal: N450m crisis threatens financial institution"
    ],
    neutral: [
      "Moneypoint Clinches Access Stanbic IBTC, Poaches Top Talents",
      "Moneypoint on hiring spree, hunts top talent in Access, Stanbic IBTC as it expands operations"
    ]
  }
};

// Brand Media Analysis data
export const brandMediaAnalysisData = {
  newsMentions: 367,
  photoMentions: 28,
  videoMentions: 2,
  potentialReach: 291050010,
  thematicDistribution: [
    { name: 'Corporate', value: 33 },
    { name: 'Industry Report', value: 21 },
    { name: 'Partnership', value: 16 },
    { name: 'Appointment', value: 12 },
    { name: 'CSR/ESG', value: 10 },
    { name: 'Financial Report', value: 4 },
    { name: 'Innovation', value: 2 },
    { name: 'Awards', value: 1 },
    { name: 'Sponsorship', value: 1 }
  ],
  subsidiariesExposure: [
    { name: 'Stanbic IBTC Bank', value: 52 },
    { name: 'Stanbic IBTC Pension Managers', value: 12 },
    { name: 'Stanbic IBTC Stockbrokers', value: 12 },
    { name: 'Stanbic IBTC Asset Mgt', value: 12 },
    { name: 'Stanbic IBTC Holdings', value: 11 },
    { name: 'Stanbic IBTC Capital', value: 1 }
  ],
  messagePlacement: [
    { name: 'Headline Mentions', value: 84 },
    { name: 'Logo Mentions', value: 9 },
    { name: 'Photo Mentions', value: 6 },
    { name: 'Video Mentions', value: 1 }
  ],
  weeklyTrend: [
    { week: 'Week 1', onlineMedia: 35, printMedia: 30 },
    { week: 'Week 2', onlineMedia: 40, printMedia: 35 },
    { week: 'Week 3', onlineMedia: 15, printMedia: 10 },
    { week: 'Week 4', onlineMedia: 5, printMedia: 5 }
  ],
  monthlyTrend: [
    { month: 'Jan', onlineMedia: 40, printMedia: 35 },
    { month: 'Feb', onlineMedia: 35, printMedia: 30 },
    { month: 'Mar', onlineMedia: 25, printMedia: 20 },
    { month: 'Apr', onlineMedia: 0, printMedia: 0 },
    { month: 'May', onlineMedia: 0, printMedia: 0 },
    { month: 'Jun', onlineMedia: 0, printMedia: 0 },
    { month: 'Jul', onlineMedia: 0, printMedia: 0 },
    { month: 'Aug', onlineMedia: 0, printMedia: 0 },
    { month: 'Sept', onlineMedia: 0, printMedia: 0 },
    { month: 'Oct', onlineMedia: 0, printMedia: 0 },
    { month: 'Nov', onlineMedia: 0, printMedia: 0 },
    { month: 'Dec', onlineMedia: 0, printMedia: 0 }
  ]
};
