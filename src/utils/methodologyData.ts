/** Static content for the principles & methodology page. */

export interface ProcessStep {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export const auditProcessSteps: ProcessStep[] = [
  {
    id: 'media-monitoring',
    title: 'Media Monitoring',
    description: 'This involves the use of human analyst and a media monitoring tool.',
    icon: 'monitor'
  },
  {
    id: 'data-gathering',
    title: 'Data Gathering',
    description: 'The process involves the use of human analyst and a tool for data collection.',
    icon: 'database'
  },
  {
    id: 'data-verification',
    title: 'Data Verification',
    description: 'An analyst is tasked to authenticate and verify the media data collected.',
    icon: 'shield-check'
  },
  {
    id: 'data-analysis',
    title: 'Data Analysis',
    description: 'A human analyst and a data analysis tool are used to perform this action.',
    icon: 'chart-bar'
  },
  {
    id: 'audit-report',
    title: 'Audit Report',
    description: 'We deploy human input to eliminate machine errors to achieve a thorough media performance report for clients.',
    icon: 'document-report'
  }
];

export const principlesData = {
  title: 'BARCELONA PRINCIPLES 3.0',
  organization: 'amec',
  description: 'Our analysis, measurements and evaluations are based on the AMEC® Standard in accordance with the Barcelona Principle 3.0.'
};

export const methodologyData = {
  title: 'Methodology',
  description: 'We deploy the *P+MCA methodology, recognized as a commercial system for media content evaluation and analysis. It takes into consideration qualitative and quantitative metrics in analysing media exposure.'
};
