import React from 'react';
import alertifyjs from 'alertifyjs';
import { Divider, Button } from '@mui/material';
import { orderBy, map, merge, cloneDeep, get, isEmpty } from 'lodash';
import APIService from '../../services/APIService';
import { SOURCE_TYPES, WHITE } from '../../common/constants'
import FormHeader from '../common/conceptContainerFormComponents/FormHeader';
import NameAndDescription from '../common/conceptContainerFormComponents/NameAndDescription';
import ConfigurationForm from '../common/conceptContainerFormComponents/ConfigurationForm';
import AdvanceSettings from '../common/conceptContainerFormComponents/AdvanceSettings';

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
      tooltip: "Identifies the Source. This is OCL's key identifier for the Source, so keep it short and sweet but also unique and distinct. Alphanumeric characters plus @, hyphens, periods, and underscores are allowed."
    },
    shortName: {
      label: 'Short Name',
      tooltip: "Gives a shorter name for the Source, such as a nickname or an abbreviation."
    },
    fullName: {
      label: 'Full Name',
      tooltip: "The fully spelled out name."
    },
    description: {
      label: 'Description',
      tooltip: "Descriptions are like a headline for your Source. If you have lots of information, put it in the About page below."
    },
  },
  configuration: {
    title: 'Configuration',
    subTitle: 'Choose a default language',
    defaultLanguage: {
      label: 'Default Language',
      placeholder: 'Choose a default language',
      tooltip: 'Select one language that your Source will use the most. Other languages can be added as Supported Languages.',
    },
    supportedLanguages: {
      label: 'Supported Languages',
      tooltip: 'Other languages that may appear in your Source.',
    },
    type: {
      label: 'Select source type',
      tooltip: 'Select source type',
    },
    customValidationSchema: {
      label: 'Validation Schema',
      tooltip: 'Helps OCL format the dictionary according to a custom schema',
    },
    publicAccess: {
      label: 'Source visibility - who can view your source?',
      tooltip: "This determines who can see your Source's content. Set it to Private if your content should only be shown to authorized users or organizations."
    },
    canonicalURL: {
      label: 'Canonical URL',
      tooltip: "This provides a unique identifier for your Source. It will allow you to leverage OCL's powerful collection management features using this Source.",
      helperText: 'Unique URL - formatted identifier for your Source'
    },
  },
  advanceSettings: {
    title: 'Advance Settings',
    fhirSettings: {
      title: 'FHIR Settings',
      subTitle: 'Ensure your source is FHIR compliant with these fields',
      publisher: {
        label: 'Publisher',
        tooltip: 'The name of the organization or individual that published the resource.'
      },
      jurisdiction: {
        label: 'Jurisdiction',
        tooltip: 'A legal or geographic region in which the resource is intended to be used.'
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
        tooltip: 'A formal identifier that is used to identify this code system when it is represented in other formats, or referenced in a specification, model, design or an instance.'
      },
      contact: {
        label: 'Contact',
        tooltip: 'Contact details to assist a user in finding and communicating with the publisher.'
      },
      contentType: {
        label: 'Content Type',
        tooltip: 'The extent of the content of the resource (the concepts and codes it defines) are represented in this resource instance.'
      },
      meta: {
        label: 'Meta',
        tooltip: 'The metadata about the resource. This is content that is maintained by the infrastructure. Changes to the content might not always be associated with version changes to the resource.'
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
      title: 'Assigning IDs',
      subTitle: 'Configure ID assignment for Concepts and Mappings',
      conceptID: {
        label: 'Concept IDs',
        tooltip: 'This determines if an ID is automatically assigned to new concepts.'
      },
      conceptExternalID: {
        label: 'External Concept IDs',
        tooltip: 'This determines if an external ID is automatically assigned to new concepts. External IDs are optional but can be useful for IDs from other systems.'
      },
      mappingID: {
        label: 'Mapping IDs',
        tooltip: 'This determines if an ID is automatically assigned to new mappings.'
      },
      mappingExternalID: {
        label: 'External Mapping IDs',
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
      title: 'About Page',
      subTitle: 'Add a page containing rich text information about your Source'
    },
    others: {
      title: 'Other Source Attributes',
      website: {
        label: 'Website',
        tooltip: 'Link to a user-friendly website associated with this Source',
      },
      externalID: {
        label: 'External ID',
        tooltip: 'An identifier for the Source that is external to OCL'
      },
      collectionReference: {
        label: 'Collection Reference'
      }
    }
  }
}

const TYPES = orderBy(map(SOURCE_TYPES, t => ({id: t, name: t})), 'name');

class SourceForm extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      owner: props.owner
    }
  }

  onChange = (changes, replace) => {
    let newState;

    if(replace)
      newState = {[replace]: changes[replace]}
    else
      newState = merge({...this.state}, changes)

    this.setState(newState)
  }

  onSubmit = event => {
    event.preventDefault();
    event.stopPropagation();

    const { edit, source } = this.props
    const form = document.getElementsByTagName('form')[0];
    form.reportValidity()
    const isFormValid = form.checkValidity()
    if(isFormValid) {
      const payload = this.getPayload()
      const service = APIService.new().overrideURL(this.state.owner.url + 'sources/')
      if(edit)
        service.appendToUrl(`${source.id}/`).put(payload).then(response => this.handleSubmitResponse(response))
      else
        service.post(payload).then(response => this.handleSubmitResponse(response))
    }
  }

  handleSubmitResponse(response) {
    const { edit, reloadOnSuccess, onCancel, resourceType, onSuccess } = this.props
    if(response.status === 201 || response.status === 200) { // success
      const verb = edit ? 'updated' : 'created'
      const successMsg = `Successfully ${verb} ${resourceType}`;
      const message = reloadOnSuccess ? successMsg + '. Reloading..' : successMsg;
      onCancel();
      alertifyjs.success(message, 1, () => {
        if(reloadOnSuccess)
          window.location.reload()
        if(onSuccess)
          onSuccess(response.data)
      })
    } else { // error
      const genericError = get(response, '__all__')
      if(genericError) {
        alertifyjs.error(genericError.join('<br />'))
      } else {
        this.setState(
          {fieldErrors: response || {}},
          () => alertifyjs.error('Please fill mandatory fields.')
        )
      }
    }
  }


  getPayload = () => {
    let fields = cloneDeep(this.state)
    delete fields.owner;
    delete fields.fieldErrors;
    [
      'autoid_concept_mnemonic', 'autoid_concept_external_id',
      'autoid_mapping_mnemonic', 'autoid_mapping_external_id',
    ].forEach(field => {
      if(fields[field] !== 'sequential')
        delete fields[`${field}_start_from`]
    })
    const sourceType = fields.type || get(this.props.source, 'source_type')
    if(sourceType)
      fields.source_type = sourceType

    return fields
  }

  render () {
    const { edit, owner, source } = this.props
    return (
      <form>
        <div className='col-xs-12 no-side-padding' style={{marginBottom: '30px', overflowX: 'hidden'}}>
          <FormHeader {...CONFIG} edit={edit} />
          <div className='col-xs-12'>
            <NameAndDescription {...CONFIG} edit={edit} owner={owner} onChange={this.onChange} repo={source} />
            <Divider style={{width: '100%'}} />
            <ConfigurationForm {...CONFIG} edit={edit} owner={owner} types={TYPES} onChange={this.onChange} repo={source} />
            <Divider style={{width: '100%'}} />
            {
              ((edit && !isEmpty(source)) || !edit) &&
                <AdvanceSettings {...CONFIG} edit={edit} owner={owner} onChange={this.onChange} repo={source} />
            }
          </div>
          <div className='col-xs-12' style={{position: 'fixed', background: WHITE, bottom: 0, zIndex: 1999}}>
            <Button variant='contained' type='submit' onClick={this.onSubmit} style={{margin: '10px 0'}}>
              {edit ? 'Update Source' : 'Create Source'}
            </Button>
          </div>
        </div>
      </form>
    )
  }
}

export default SourceForm;
