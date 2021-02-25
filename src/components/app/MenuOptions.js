export const MARKETING_SITE_URL = 'https://aws.openconceptlab.org/';
const COMMUNITY_OPTIONS = [
  {
    label: 'Architecture Community Call',
    href: MARKETING_SITE_URL + 'community-resources/ocl-architecture-call/'
  },
  {
    label: 'Developer Community Call',
    href: MARKETING_SITE_URL + 'community-resources/ocl-dev-community/'
  },
  {
    label: 'OpenHIE Terminology Service Call',
    href: MARKETING_SITE_URL + 'community-resources/community-calls/'
  },
  {
    label: 'Github',
    href: 'https://github.com/OpenConceptLab'
  },
  {
    label: 'Documentation',
    href: 'https://docs.openconceptlab.org'
  },
  {
    label: 'OCL for OpenMRS',
    href: MARKETING_SITE_URL + 'community-resources/ocl-for-openmrs/'
  },
  {
    label: 'OCL Mailing List',
    href: MARKETING_SITE_URL + 'list/'
  },
];
const TOOLS_OPTIONS = [
  {
    label: 'Metadata Browser',
    href: MARKETING_SITE_URL + 'ocl-tools/metadata-browser/'
  },
  {
    label: 'Authoring Interface',
    href: MARKETING_SITE_URL + 'ocl-tools/authoring-interface/'
  },
  {
    label: 'Terminology Service',
    href: MARKETING_SITE_URL + 'ocl-tools/terminology-service/'
  },
];
export const OPTIONS = [
  {
    label: 'About',
    href: MARKETING_SITE_URL + 'about/'
  },
  {
    label: 'Blog',
    href: MARKETING_SITE_URL + 'blog/'
  },
  {
    label: 'Community',
    nested: [...COMMUNITY_OPTIONS]
  },
  {
    label: 'Metadata Clearinghouse',
    selected: true
  },
  {
    label: 'Tools',
    nested: [...TOOLS_OPTIONS]
  }
]
