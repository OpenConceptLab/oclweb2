import React from 'react';
import {
  Info as AboutIcon,
  Chat as BlogIcon,
  People as CommunityIcon,
  Architecture as ArchCommunityCallIcon,
  DeveloperMode as DevCommunityCallIcon,
  SpeakerNotes as OpenHIETerminologyServiceIcon,
  GitHub as GitHubIcon,
  InsertDriveFile as DocumentationIcon,
  Email as EmailIcon,
  CloudCircle as MetadataClearinghouseIcon,
  Build as ToolsIcon,
  Web as MetadataBrowserIcon,
  Code as TerminologyServiceIcon,
  ContactSupport as FAQIcon,
  Map as MapIcon,
  QuestionAnswer as ContactIcon
} from '@mui/icons-material';
import OpenMRSLogo from '../common/OpenMRSLogo';

export const SITE_URL = 'https://openconceptlab.org/';
const COMMUNITY_OPTIONS = [
  {
    label: 'Architecture Community Call',
    href: SITE_URL + 'community-resources/ocl-architecture-call/',
    icon: <ArchCommunityCallIcon />
  },
  {
    label: 'Developer Community Call',
    href: SITE_URL + 'community-resources/ocl-dev-community/',
    icon: <DevCommunityCallIcon />
  },
  {
    label: 'OpenHIE Terminology Service Call',
    href: SITE_URL + 'community-resources/community-calls/',
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
    label: 'Technical Roadmap',
    href: SITE_URL + '2024-ocl-community-roadmap/',
    icon: <MapIcon />
  },
  {
    label: 'OCL Mailing List',
    href: SITE_URL + 'list/',
    icon: <EmailIcon />
  },
];
const TOOLS_OPTIONS = [
  {
    label: 'TermBrowser',
    href: SITE_URL + 'termbrowser/',
    icon: <MetadataBrowserIcon />
  },
  {
    label: 'Terminology Service',
    href: SITE_URL + 'ocl-tools/terminology-service/',
    icon: <TerminologyServiceIcon />
  },
  {
    label: 'OpenMRS Dictionary Manager',
    href: SITE_URL + 'openmrs-dictionary-manager/',
    icon: <OpenMRSLogo style={{width: '28px', marginLeft: '-2px'}} />,
    deprecated: true
  },
];
export const OPTIONS = [
  {
    label: 'About',
    href: SITE_URL + 'about/',
    icon: <AboutIcon />,
  },
  {
    label: 'Blog',
    href: SITE_URL + 'blog/',
    icon: <BlogIcon />
  },
  {
    label: 'Community',
    nested: [...COMMUNITY_OPTIONS],
    icon: <CommunityIcon />,
    href: SITE_URL + 'community-resources/'
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
    href: SITE_URL + 'ocl-tools/'
  },
  {
    label: 'FAQs',
    href: SITE_URL + 'faq/',
    icon: <FAQIcon />
  },
  {
    label: 'Contact',
    href: SITE_URL + 'contact/',
    icon: <ContactIcon />
  }
];
