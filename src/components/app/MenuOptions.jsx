import React from 'react';
import {
  Info as AboutIcon,
  Chat as BlogIcon,
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
  Code as TerminologyServiceIcon,
  ContactSupport as ContactIcon
} from '@material-ui/icons';
import OpenMRSLogo from '../common/OpenMRSLogo';

export const MARKETING_SITE_URL = 'https://openconceptlab.org/';
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
    icon: <OpenMRSLogo style={{width: '28px', marginLeft: '-2px'}} />
  },
  {
    label: 'OCL Mailing List',
    href: MARKETING_SITE_URL + 'list/',
    icon: <EmailIcon />
  },
];
const TOOLS_OPTIONS = [
  {
    label: 'TermBrowser',
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
    icon: <AboutIcon />,
  },
  {
    label: 'Blog',
    href: MARKETING_SITE_URL + 'blog/',
    icon: <BlogIcon />
  },
  {
    label: 'Community',
    nested: [...COMMUNITY_OPTIONS],
    icon: <CommunityIcon />,
    href: MARKETING_SITE_URL + 'community-resources/'
  },
  {
    label: 'OCL Online',
    icon: <MetadataClearinghouseIcon color='primary' />,
    selected: true,
    tooltip: 'OCL Online: Hosted terminology service'
  },
  {
    label: 'Tools',
    nested: [...TOOLS_OPTIONS],
    icon: <ToolsIcon />,
    href: MARKETING_SITE_URL + 'ocl-tools/'
  },
  {
    label: 'Contact',
    href: MARKETING_SITE_URL + 'contact/',
    icon: <ContactIcon />
  }
];
