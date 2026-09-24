/** Definitions of the metrics used across the client reports, in the order of the P+ audit report glossary. */

export interface GlossaryTerm {
  term: string;
  /** Paragraphs are separated by a blank line. */
  definition: string;
}

export const glossaryTerms: GlossaryTerm[] = [
  {
    term: 'Brand Exposure In Local/International Media',
    definition: "The brand's presence in local and international media underscores its visibility and impact across diverse markets, highlighting its ability to engage with a wide audience and strengthen its global reputation.",
  },
  {
    term: 'Language',
    definition: "Language analysis reflects the brand's visibility across various languages, showcasing its reach and adaptability to diverse linguistic audiences (e.g. Yoruba, Pidgin, Igbo, Hausa, Swahili, German, French, English, etc.).",
  },
  {
    term: 'Media Vehicle (Web & Print)',
    definition: "Media Vehicle represents the proportion of web articles compared to print articles, expressed as a percentage, highlighting the distribution of the brand's media presence across digital and traditional platforms.",
  },
  {
    term: 'SWOT Analysis',
    definition: "SWOT Analysis refers to a strategic framework that assesses a brand's Strengths, Weaknesses, Opportunities, and Threats to provide a comprehensive understanding of its current standing and future potential.",
  },
  {
    term: 'Key Brand Reputational Drivers & Media Sentiment Index',
    definition: "The key brand reputational drivers refer to the pivotal articles that significantly influenced the brand's reputation during the observed period.\n\nThe Media Sentiment Index represents the percentage distribution of positive, negative, and neutral sentiments recorded for the brand.",
  },
  {
    term: 'Potential Reach',
    definition: "This metric integrates the audience reach of print publications with the online traffic of websites, offering a comprehensive estimate of the brand's overall media exposure during the specified period.",
  },
  {
    term: 'Thematic Distribution Of Media Activities',
    definition: 'This highlights the range of media activities the brand participated in during the observed period, showcasing its efforts to maintain visibility, engage with audiences, and strengthen its market presence.',
  },
  {
    term: 'Brand Message Placement In The Media',
    definition: "The brand's message placement in the media refers to how its exposure is presented and distributed across various formats, such as headlines, photos, videos, and advertorials, showcasing the diversity in content delivery.",
  },
  {
    term: 'Publication And Reporter Analysis',
    definition: "The publication analysis provides a detailed breakdown of the top media publications (both web and print) that featured the brand's articles. Similarly, the reporter analysis highlights the leading journalists (across web and print) responsible for driving the brand's media coverage. This data can serve as a valuable resource for the brand's Journalist Reward Management (JRM) initiatives.",
  },
  {
    term: 'Spokesperson Analysis',
    definition: 'The Spokesperson Analysis highlights the key individuals who represented and spoke on behalf of the brand during the review period.',
  },
  {
    term: 'Social Stats',
    definition: "This metric provides a summary of the brand's social media statistics. Due to third-party restrictions, only a general overview of the brand's social metrics is included.",
  },
  {
    term: 'Online Coverage By Region',
    definition: "This outlines the brand's online media presence in foreign countries, offering a detailed regional analysis of its coverage. Presented on a map, it highlights areas with high and low article frequency, providing a clear view of the brand's international online media impact.",
  },
  {
    term: 'Competitive Intelligence & Media Sentiment Index',
    definition: "Competitive Intelligence provides a comprehensive view of the brand's standing relative to its competitors, showcasing its performance across various activities. Additionally, it highlights the comparative visibility and impact of the brand's CEO/Leader against those of its competitors.\n\nThe Media Sentiment Index further complements this analysis by presenting the sentiment distribution of the brand and its competitors, offering insights into public perception and emotional resonance.",
  },
  {
    term: 'Competitive Metrics',
    definition: "Competitive Metrics are the media activities (for example CSR/CSI, Awards, Partnership or Sponsorship) on which the brand's coverage is compared with that of its competitors, showing who leads the conversation on each activity.",
  },
  {
    term: 'Competitive PR Drivers',
    definition: 'Competitive PR Drivers are the headlines that shaped the media coverage of the brand and each of its competitors during the review period.',
  },
];
