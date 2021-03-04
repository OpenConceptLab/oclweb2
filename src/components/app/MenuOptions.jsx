import React from 'react';
import {
  Info as AboutIcon,
  Announcement as BlogIcon,
  People as CommunityIcon,
  AccountBalance as ArchCommunityCallIcon,
  DeveloperMode as DevCommunityCallIcon,
  SpeakerNotes as OpenHIETerminologyServiceIcon,
  GitHub as GitHubIcon,
  InsertDriveFile as DocumentationIcon,
  Email as EmailIcon,
  CloudCircle as MetadataClearinghouseIcon,
  Build as ToolsIcon,
  Web as MetadataBrowserIcon,
  ImportExport as TerminologyServiceIcon,
  Help as ContactIcon
} from '@material-ui/icons';

export const MARKETING_SITE_URL = 'https://aws.openconceptlab.org/';
const COMMUNITY_OPTIONS = [
  {
    label: 'Architecture Community Call',
    href: MARKETING_SITE_URL + 'community-resources/ocl-architecture-call/',
    icon: <ArchCommunityCallIcon />
  },
  {
    label: 'Developer Community Call',
    href: MARKETING_SITE_URL + 'community-resources/ocl-dev-community/',
    icon: <DevCommunityCallIcon />
  },
  {
    label: 'OpenHIE Terminology Service Call',
    href: MARKETING_SITE_URL + 'community-resources/community-calls/',
    icon: <OpenHIETerminologyServiceIcon />
  },
  {
    label: 'Github',
    href: 'https://github.com/OpenConceptLab',
    icon: <GitHubIcon />
  },
  {
    label: 'Documentation',
    href: 'https://docs.openconceptlab.org',
    icon: <DocumentationIcon />
  },
  {
    label: 'OCL for OpenMRS',
    href: MARKETING_SITE_URL + 'community-resources/ocl-for-openmrs/',
    icon: <GitHubIcon />
  },
  {
    label: 'OCL Mailing List',
    href: MARKETING_SITE_URL + 'list/',
    icon: <EmailIcon />
  },
];
const TOOLS_OPTIONS = [
  {
    label: 'Metadata Browser',
    href: MARKETING_SITE_URL + 'ocl-tools/metadata-browser/',
    icon: <MetadataBrowserIcon />
  },
  {
    label: 'Terminology Service',
    href: MARKETING_SITE_URL + 'ocl-tools/terminology-service/',
    icon: <TerminologyServiceIcon />
  },
];
export const OPTIONS = [
  {
    label: 'About',
    href: MARKETING_SITE_URL + 'about/',
    icon: <AboutIcon />
  },
  {
    label: 'Blog',
    href: MARKETING_SITE_URL + 'blog/',
    icon: <BlogIcon />
  },
  {
    label: 'Community',
    nested: [...COMMUNITY_OPTIONS],
    icon: <CommunityIcon />
  },
  {
    label: 'Metadata Clearinghouse',
    icon: <MetadataClearinghouseIcon color='primary' />,
    selected: true
  },
  {
    label: 'Tools',
    nested: [...TOOLS_OPTIONS],
    icon: <ToolsIcon />
  },
  {
    label: 'Contact',
    href: MARKETING_SITE_URL + 'contact/',
    icon: <ContactIcon />
  }
];
