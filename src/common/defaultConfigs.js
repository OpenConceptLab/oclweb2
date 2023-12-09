import React from 'react';
import BetaLabel from '../components/common/BetaLabel';

export const CONCEPT_MAP_DEFAULT_CONFIG = {
  name: "FHIR Default (ConceptMap)",
  web_default: true,
  is_default: false,
  config: {
    tabs: [
      {
        type: "codes",
        label: "Codes",
        page_size: 25,
        default: true,
        layout: "table",
      },
      { type: "versions", label: "Versions", page_size: 25, layout: "table" },
      { type: "about", label: "About" },
    ],
  },
};

export const CODE_SYSTEM_DEFAULT_CONFIG = {
  name: "FHIR Default (CodeSystem)",
  web_default: true,
  is_default: false,
  config: {
    tabs: [
      {
        type: "codes",
        label: "Codes",
        page_size: 25,
        default: true,
        layout: "table",
      },
      { type: "versions", label: "Versions", page_size: 25, layout: "table" },
      { type: "about", label: "About" },
    ],
  },
};

export const VALUE_SET_DEFAULT_CONFIG = {
  name: "FHIR Default (ValueSet)",
  web_default: true,
  is_default: false,
  config: {
    tabs: [
      {
        type: "codes",
        label: "Codes",
        page_size: 25,
        default: true,
        layout: "table",
      },
      { type: "versions", label: "Versions", page_size: 25, layout: "table" },
      { type: "about", label: "About" },
    ],
  },
};

export const FHIR_DEFAULT_CONFIG = {
  name: "FHIR Default",
  web_default: true,
  is_default: false,
  config: {
    tabs: [
      { type: "CodeSystem", label: "Code Systems", default: true },
      { type: "ValueSet", label: "Value Sets" },
      { type: "ConceptMap", label: "Concept Maps" },
    ],
  },
};

const ORG_BACKGROUND_CONFIG = {
  background: {
    image: "",
    backgroundColor: "",
    imageOverlay: true
  },
  forground: {
    color: "",
    titleColor: "",
    descriptionColor: "",
    title: "",
    description: "",
  },
};

export const ORG_DEFAULT_CONFIG = {
  name: "OCL Default (Org)",
  web_default: true,
  is_default: false,
  config: {
    header: {
      ...ORG_BACKGROUND_CONFIG,
      attributes: [
        {
          label: "Company",
          value: "company",
          type: "text",
        },
      ],
      height: null,
      controls: true,
      signatures: true,
      logo: true,
      shrink: false,
    },
    tabs: [
      { type: "about", label: "Overview", color: "" },
      {
        type: "sources",
        label: "Sources",
        page_size: 25,
        layout: "table",
        color: "",
      },
      {
        type: "collections",
        label: "Collections",
        page_size: 25,
        layout: "table",
        color: "",
      },
      {
        type: "users",
        label: "Members",
        page_size: 25,
        layout: "table",
        color: "",
      },
    ],
  },
};

export const SOURCE_DEFAULT_CONFIG = {
  name: "OCL Default (Source)",
  web_default: true,
  is_default: false,
  config: {
    header: {
      shrink: false,
      visibleAttributes: [
        {
          label: "Source Type",
          value: "source_type",
          type: "text",
        },
        {
          label: "Supported Locales",
          value: "supported_locales",
        },
        {
          label: "Custom Validation Schema",
          value: "custom_validation_schema",
          type: "text",
        },
        {
          label: "Canonical URL",
          value: "canonical_url",
          type: "url",
        },
        {
          label: "Standard Checksum",
          value: "checksums.standard",
          type: "text",
        },
        {
          label: "Smart Checksum",
          value: "checksums.smart",
          type: "text",
        },
      ],
      invisibleAttributes: [
        {
          label: "Publisher",
          value: "publisher",
          type: "text",
        },
        {
          label: "Purpose",
          value: "purpose",
          type: "text",
        },
        {
          label: "Copyright",
          value: "copyright",
          type: "text",
        },
        {
          label: "Content Type",
          value: "content_type",
          type: "text",
        },
        {
          label: "Revision Date",
          value: "revision_date",
          type: "date",
        },
        {
          label: "Identifier",
          value: "identifier",
          type: "json",
        },
        {
          label: "Contact",
          value: "contact",
          type: "json",
        },
        {
          label: "Jurisdiction",
          value: "jurisdiction",
          type: "json",
        },
        {
          label: "Meta",
          value: "meta",
          type: "json",
        },
        {
          label: "Collection Reference",
          value: "collection_reference",
          type: "text",
        },
        {
          label: "Hierarchy Meaning",
          value: "hierarchy_meaning",
          type: "text",
        },
        {
          label: "Experimental",
          value: "experimental",
          type: "boolean",
        },
        {
          label: "Case Sensitive",
          value: "case_sensitive",
          type: "boolean",
        },
        {
          label: "Compositional",
          value: "compositional",
          type: "boolean",
        },
        {
          label: "Version Needed",
          value: "version_needed",
          type: "boolean",
        },
        {
          label: "AutoID Concept ID",
          value: "autoid_concept_mnemonic",
          type: "text",
        },
        {
          label: "AutoID Concept External ID",
          value: "autoid_concept_external_id",
          type: "text",
        },
        {
          label: "AutoID Concept Name External ID",
          value: "autoid_concept_name_external_id",
          type: "text",
        },
        {
          label: "AutoID Concept Description External ID",
          value: "autoid_concept_description_external_id",
          type: "text",
        },
        {
          label: "AutoID Mapping ID",
          value: "autoid_mapping_mnemonic",
          type: "text",
        },
        {
          label: "AutoID Mapping External ID",
          value: "autoid_mapping_external_id",
          type: "text",
        },
      ],
    },
    tabs: [
      {
        type: "concepts",
        label: "Concepts",
        page_size: 25,
        default: true,
        layout: "table",
      },
      { type: "mappings", label: "Mappings", page_size: 25, layout: "table" },
      { type: "versions", label: "Versions", page_size: 25, layout: "table" },
      { type: "summary", label: <BetaLabel label="Summary" /> },
      { type: "about", label: "About" },
    ],
  },
};

export const COLLECTION_DEFAULT_CONFIG = {
  name: "OCL Default (Collection)",
  web_default: true,
  is_default: false,
  config: {
    header: {
      shrink: false,
      visibleAttributes: [
        {
          label: "Short Code",
          value: "short_code",
          type: "text",
        },
        {
          label: "Name",
          value: "name",
          type: "text",
        },
        {
          label: "Collection Type",
          value: "collection_type",
          type: "text",
        },
        {
          label: "Custom Validation Schema",
          value: "custom_validation_schema",
          type: "text",
        },
        {
          label: "Supported Locales",
          value: "supported_locales",
        },
        {
          label: "Canonical URL",
          value: "canonical_url",
          type: "url",
        },
        {
          label: "Standard Checksum",
          value: "checksums.standard",
          type: "text",
        },
        {
          label: "Smart Checksum",
          value: "checksums.smart",
          type: "text",
        },
      ],
      invisibleAttributes: [
        {
          label: "Publisher",
          value: "publisher",
          type: "text",
        },
        {
          label: "Purpose",
          value: "purpose",
          type: "text",
        },
        {
          label: "Copyright",
          value: "copyright",
          type: "text",
        },
        {
          label: "Preferred Source",
          value: "preferred_source",
          type: "text",
        },
        {
          label: "Custom Resources Linked Source",
          value: "custom_resources_linked_source",
          type: "text",
        },
        {
          label: "Revision Date",
          value: "revision_date",
          type: "date",
        },
        {
          label: "Identifier",
          value: "identifier",
          type: "json",
        },
        {
          label: "Contact",
          value: "contact",
          type: "json",
        },
        {
          label: "Jurisdiction",
          value: "jurisdiction",
          type: "json",
        },
        {
          label: "Meta",
          value: "meta",
          type: "json",
        },
        {
          label: "Immutable",
          value: "immutable",
          type: "boolean",
        },
        {
          label: "Locked Date",
          value: "locked_date",
          type: "date",
        },
        {
          label: "Experimental",
          value: "experimental",
          type: "boolean",
        },
      ],
    },
    tabs: [
      {
        type: "concepts",
        label: "Concepts",
        page_size: 25,
        default: true,
        layout: "table",
      },
      { type: "mappings", label: "Mappings", page_size: 25, layout: "table" },
      {
        type: "references",
        label: "References",
        page_size: 25,
        layout: "table",
      },
      { type: "versions", label: "Versions & Expansions", page_size: 25, layout: "table" },
      { type: "summary", label: <BetaLabel label="Summary" /> },
      { type: "about", label: "About" },
    ],
  },
};
