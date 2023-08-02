const CONFIG = {
  resource: 'collection',
  title: 'Create a new collection',
  editTitle: 'Edit Collection',
  subTitle: 'A repository for content from a mix of sources',
  nameAndDescription: {
    title: 'Name and description',
    subTitle: 'Choose a short code for your collection',
    shortCode: {
      label: 'Short Code',
      tooltip: "OCL's key identifier for your Collection . Keep this short and sweet but also unique and distinct. Alphanumeric characters plus @, hyphens, periods, and underscores are allowed."
    },
    shortName: {
      label: 'Short Name',
      tooltip: "Short display name for your Collection, such as a nickname or an abbreviation."
    },
    fullName: {
      label: 'Full Name',
      tooltip: "Fully-specified name for your Collection."
    },
    description: {
      label: 'Description',
      tooltip: "A headline for your Collection. If you have lots of information, put it in the About page below."
    },
  },
  language: {
    title: 'Language',
    defaultLanguage: {
      label: 'Default Language',
      placeholder: 'Choose a default language',
      tooltip: 'The primary language for concepts in your Collection. Other languages can be added as Supported Languages.',
    },
    supportedLanguages: {
      label: 'Supported Languages',
      placeholder: 'Choose Supported languages',
      tooltip: 'Other languages that may be used in your Collection.',
    },
  },
  configuration: {
    title: 'Configuration',
    type: {
      label: 'Collection type',
      placeholder: 'Select collection type',
      tooltip: 'The type of Collection that you want to create. Note that some Collection types have special meaning.',
    },
    customValidationSchema: {
      label: 'Validation Schema',
      tooltip: 'A specific format for your Collection. If specified, OCL will validate your Collection according to rules defined in this schema.',
    },
    publicAccess: {
      label: 'Visibility',
      tooltip: "The audience who can see your Collection's content. Set it to Private if your content should only be shown to authorized users or organizations."
    },
    canonicalURL: {
      label: 'Canonical URL',
      tooltip: "A unique identifier for your Collection in URL format. It will allow you to leverage OCL's powerful collection management features using this Collection."
    },
    autoexpandHEAD: {
      label: 'Auto-Expand HEAD',
      tooltip: "If enabled, updates to your collection's references will automatically be evaluated and reflected in your collection's HEAD version using the collection's default settings. Disable this to have full control over when and how your references are evaluated."
    },
    website: {
      label: 'Website',
      tooltip: 'Link to a user-friendly website associated with this Collection',
    },
    externalID: {
      label: 'External ID',
      tooltip: 'An identifier for the Collection that is external to OCL'
    },
  },
  advanceSettings: {
    title: 'Advanced Settings',
    fhirSettings: {
      title: 'FHIR Settings',
      subTitle: 'Manage how your collection is represented as a FHIR resource',
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
      meta: {
        label: 'Meta',
        tooltip: 'The metadata about the resource. This is content that is maintained by the infrastructure. Changes to the content might not always be associated with version changes to the resource. (Format: JSON)'
      },
      revisionDate: {
        label: 'Revision Date',
        tooltip: 'The date (and optionally time) when the resource was published. The date must change when the business version changes and it must change if the status code changes. In addition, it should change when the substantive content of the code system changes.'
      },
      lockedDate: {
        label: 'Locked Date',
        tooltip: 'Fixed date for references with no specified version (transitive)',
      },
      experimental: {
        label: 'Experimental',
        tooltip: 'A Boolean value to indicate that this resource is authored for testing purposes (or education/evaluation/marketing) and is not intended to be used for genuine usage.'
      },
      immutable: {
        label: 'Immutable',
        tooltip: 'If this is set to "true", then no new versions of the content logical definition can be created. Note: Other metadata might still change.'
      },
    },
    customAttributes: {
      title: 'Custom Attributes',
      subTitle: 'Manage your own Collection attributes',
    },
    about: {
      title: 'Collection About Page',
      subTitle: 'Add a page containing rich text information about your Collection'
    },
  }
}

export default CONFIG
