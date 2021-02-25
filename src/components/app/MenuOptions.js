const ROOT_URL = 'https://aws.openconceptlab.org/';
const COMMUNITY_OPTIONS = [
  {
    label: 'Architecture Community Call',
    href: ROOT_URL + 'community-resources/ocl-architecture-call/'
  },
  {
    label: 'Developer Community Call',
    href: ROOT_URL + 'community-resources/ocl-dev-community/'
  },
  {
    label: 'OpenHIE Terminology Service Call',
    href: ROOT_URL + 'community-resources/community-calls/'
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
    href: ROOT_URL + 'community-resources/ocl-for-openmrs/'
  },
  {
    label: 'OCL Mailing List',
    href: ROOT_URL + 'list/'
  },
];
const TOOLS_OPTIONS = [
  {
    label: 'Metadata Browser',
    href: ROOT_URL + 'ocl-tools/metadata-browser/'
  },
  {
    label: 'Authoring Interface',
    href: ROOT_URL + 'ocl-tools/authoring-interface/'
  },
  {
    label: 'Terminology Service',
    href: ROOT_URL + 'ocl-tools/terminology-service/'
  },
];
export const OPTIONS = [
  {
    label: 'About',
    href: ROOT_URL + 'about/'
  },
  {
    label: 'Blog',
    href: ROOT_URL + 'blog/'
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
