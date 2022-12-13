const CONFIG = {
  resource: 'source',
  title: 'Create a new source',
  editTitle: 'Edit Source',
  subTitle: 'A repository for content that you create',
  nameAndDescription: {
    title: 'Name and description',
    subTitle: 'Choose a short code for your source',
    shortCode: {
      label: 'Short Code',
      tooltip: "OCL's key identifier for your Source. Keep this short and sweet but also unique and distinct. Alphanumeric characters plus @, hyphens, periods, and underscores are allowed."
    },
    shortName: {
      label: 'Short Name',
      tooltip: "Short display name for your Source, such as a nickname or an abbreviation."
    },
    fullName: {
      label: 'Full Name',
      tooltip: "Fully-specified name for your Source."
    },
    description: {
      label: 'Description',
      tooltip: "A headline for your Source. If you have lots of information, put it in the About page below."
    },
  },
  language: {
    title: 'Language',
    defaultLanguage: {
      label: 'Default Language',
      placeholder: 'Choose a default language',
      tooltip: 'The primary language for your Source used to define concepts. Other languages can be added as Supported Languages.',
    },
    supportedLanguages: {
      label: 'Supported Languages',
      placeholder: 'Choose Supported languages',
      tooltip: 'Other languages that may be used in your Source.',
    },
 },
  configuration: {
    title: 'Configuration',
    type: {
      label: 'Source type',
      placeholder: 'Select source type',
      tooltip: 'The type of Source that you want to create. Note that some Source types have special meaning.',
    },
    customValidationSchema: {
      label: 'Validation Schema',
      tooltip: 'A specific format for your Source. If specified, OCL will validate your Source according to rules defined in this schema.',
    },
    publicAccess: {
      label: 'Visibility',
      tooltip: "The audience who can see your Source's content. Set it to Private if your content should only be shown to authorized users or organizations."
    },
    canonicalURL: {
      label: 'Canonical URL',
      tooltip: "A unique identifier for your Source in URL format. It will allow you to leverage OCL's powerful collection management features using this Source."
    },
    website: {
      label: 'Website',
      tooltip: 'Link to a user-friendly website associated with this Source',
    },
    externalID: {
      label: 'External ID',
      tooltip: 'An identifier for the Source that is external to OCL'
    },
  },
  advanceSettings: {
    title: 'Advanced Settings',
    fhirSettings: {
      title: 'FHIR Settings',
      subTitle: 'Manage how your source is represented as a FHIR resource',
      publisher: {
        label: 'Publisher',
        tooltip: 'The name of the organization or individual responsible for the release and ongoing maintenance of the resource.'
      },
      jurisdiction: {
        label: 'Jurisdiction',
        tooltip: 'A legal or geographic region in which the resource is intended to be used. (Format: JSON)'
      },
      purpose: {
        label: 'Purpose',
        tooltip: 'Explanation of why this resource is needed and why it has been designed as it has.'
      },
      copyright: {
        label: 'Copyright',
        tooltip: 'A copyright statement relating to the resource and/or its contents. Copyright statements are generally legal restrictions on the use and publishing of the resource.'
      },
      identifier: {
        label: 'Identifier',
        tooltip: 'A formal identifier that is used to identify this code system when it is represented in other formats, or referenced in a specification, model, design or an instance. (Format: JSON)'
      },
      contact: {
        label: 'Contact',
        tooltip: 'Contact details to assist a user in finding and communicating with the publisher. (Format: JSON)'
      },
      contentType: {
        label: 'Content Type',
        tooltip: 'The extent of the content of the resource (the concepts and codes it defines) are represented in this resource instance.'
      },
      meta: {
        label: 'Meta',
        tooltip: 'The metadata about the resource. This is content that is maintained by the infrastructure. Changes to the content might not always be associated with version changes to the resource. (Format: JSON)'
      },
      revisionDate: {
        label: 'Revision Date',
        tooltip: 'The date (and optionally time) when the resource was published. The date must change when the business version changes and it must change if the status code changes. In addition, it should change when the substantive content of the code system changes.'
      },
      experimental: {
        label: 'Experimental',
        tooltip: 'A Boolean value to indicate that this resource is authored for testing purposes (or education/evaluation/marketing) and is not intended to be used for genuine usage.'
      },
      caseSensitive: {
        label: 'Case Sensitive',
        tooltip: 'If code comparison is case sensitive when codes within this resource are compared to each other.'
      },
      compositional: {
        label: 'Compositional',
        tooltip: 'The resource defines a compositional (post-coordination) grammar.'
      },
      versionNeeded: {
        label: 'Version Needed',
        tooltip: 'This flag is used to signify that the resource does not commit to concept permanence across versions. If true, a version must be specified when referencing this resource.'
      },
    },
    assigningIds: {
      title: 'ID Auto-Assignment',
      subTitle: 'Configure ID assignment for Concepts and Mappings',
      conceptID: {
        label: 'Concept IDs',
        tooltip: 'This determines if an ID is automatically assigned to new concepts.'
      },
      conceptExternalID: {
        label: 'Concept External IDs',
        tooltip: 'This determines if an external ID is automatically assigned to new concepts. External IDs are optional but can be useful for IDs from other systems.'
      },
      mappingID: {
        label: 'Mapping IDs',
        tooltip: 'This determines if an ID is automatically assigned to new mappings.'
      },
      mappingExternalID: {
        label: 'Mapping External IDs',
        tooltip: 'This determines if an external ID is automatically assigned to new mappings. External IDs are optional but can be useful for IDs from other systems.'
      },
      conceptIDStartFrom: {
        label: 'Start From',
        tooltip: 'From where to start the sequential Concept IDs'
      },
      mappingIDStartFrom: {
        label: 'Start From',
        tooltip: 'From where to start the sequential Mapping IDs'
      },
      conceptExternalIDStartFrom: {
        label: 'Start From',
        tooltip: 'From where to start the sequential Concept External IDs'
      },
      mappingExternalIDStartFrom: {
        label: 'Start From',
        tooltip: 'From where to start the sequential Mapping External IDs'
      },
    },
    customAttributes: {
      title: 'Custom Attributes',
      subTitle: 'Manage your own Source attributes',
    },
    about: {
      title: 'Source About Page',
      subTitle: 'Add a page containing rich text information about your Source'
    },
  }
}

export default CONFIG;
