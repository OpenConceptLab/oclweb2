import React from 'react';
import alertifyjs from 'alertifyjs';
import { Divider, Button } from '@mui/material';
import { orderBy, map, merge, cloneDeep, get, isEmpty } from 'lodash';
import APIService from '../../services/APIService';
import { COLLECTION_TYPES, WHITE } from '../../common/constants'
import FormHeader from '../common/conceptContainerFormComponents/FormHeader';
import NameAndDescription from '../common/conceptContainerFormComponents/NameAndDescription';
import ConfigurationForm from '../common/conceptContainerFormComponents/ConfigurationForm';
import AdvanceSettings from '../common/conceptContainerFormComponents/AdvanceSettings';

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
      tooltip: "Identifies the Collection. This is OCL's key identifier for the Collection, so keep it short and sweet but also unique and distinct. Alphanumeric characters plus @, hyphens, periods, and underscores are allowed."
    },
    shortName: {
      label: 'Short Name',
      tooltip: "Gives a shorter name for the Collection, such as a nickname or an abbreviation."
    },
    fullName: {
      label: 'Full Name',
      tooltip: "The fully spelled out name."
    },
    description: {
      label: 'Description',
      tooltip: "Descriptions are like a headline for your Collection. If you have lots of information, put it in the About page below."
    },
  },
  configuration: {
    title: 'Configuration',
    subTitle: 'Choose a default language',
    defaultLanguage: {
      label: 'Default Language',
      placeholder: 'Choose a default language',
      tooltip: 'Select one language that your Collection will use the most. Other languages can be added as Supported Languages.',
    },
    supportedLanguages: {
      label: 'Supported Languages',
      tooltip: 'Other languages that may appear in your Collection.',
    },
    type: {
      label: 'Select collection type',
      tooltip: 'Select collection type',
    },
    customValidationSchema: {
      label: 'Validation Schema',
      tooltip: 'Helps OCL format the dictionary according to a custom schema',
    },
    publicAccess: {
      label: 'Collection visibility - who can view your collection?',
      tooltip: "This determines who can see your Collection's content. Set it to Private if your content should only be shown to authorized users or organizations."
    },
    canonicalURL: {
      label: 'Canonical URL',
      tooltip: "This provides a unique identifier for your Collection. It will allow you to leverage OCL's powerful collection management features using this Collection.",
      helperText: 'Unique URL - formatted identifier for your Collection'
    },
    autoexpandHEAD: {
      label: 'Auto Expand HEAD',
      tooltip: 'If enabled, all collection versions will automatically get an expansion. If disabled, you must manually trigger all expansions.'
    },
  },
  advanceSettings: {
    title: 'Advance Settings',
    fhirSettings: {
      title: 'FHIR Settings',
      subTitle: 'Ensure your collection is FHIR compliant with these fields',
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
      meta: {
        label: 'Meta',
        tooltip: 'The metadata about the resource. This is content that is maintained by the infrastructure. Changes to the content might not always be associated with version changes to the resource.'
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
        tooltip: 'If this is set to ‘true’, then no new versions of the content logical definition can be created. Note: Other metadata might still change.'
      },
    },
    customAttributes: {
      title: 'Custom Attributes',
      subTitle: 'Manage your own Collection attributes',
    },
    about: {
      title: 'About Page',
      subTitle: 'Add a page containing rich text information about your Collection'
    },
    others: {
      title: 'Other Collection Attributes',
      website: {
        label: 'Website',
        tooltip: 'Link to a user-friendly website associated with this Collection',
      },
      externalID: {
        label: 'External ID',
        tooltip: 'An identifier for the Collection that is external to OCL'
      },
    }
  }
}

const TYPES = orderBy(map(COLLECTION_TYPES, t => ({id: t, name: t})), 'name');

class CollectionForm extends React.Component {
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

    const { edit, collection } = this.props
    const form = document.getElementsByTagName('form')[0];
    form.reportValidity()
    const isFormValid = form.checkValidity()
    if(isFormValid) {
      const payload = this.getPayload()
      const service = APIService.new().overrideURL(this.state.owner.url + 'collections/')
      if(edit)
        service.appendToUrl(`${collection.id}/`).put(payload).then(response => this.handleSubmitResponse(response))
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
    const collectionType = fields.type || get(this.props.source, 'collection_type')
    if(collectionType)
      fields.collection_type = collectionType

    return fields
  }

  render () {
    const { edit, owner, collection } = this.props
    return (
      <form>
        <div className='col-xs-12 no-side-padding' style={{marginBottom: '30px', overflowX: 'hidden'}}>
          <FormHeader {...CONFIG} edit={edit} />
          <div className='col-xs-12'>
            <NameAndDescription {...CONFIG} edit={edit} owner={owner} onChange={this.onChange} repo={collection} />
            <Divider style={{width: '100%'}} />
            <ConfigurationForm {...CONFIG} edit={edit} owner={owner} types={TYPES} onChange={this.onChange} repo={collection} />
            <Divider style={{width: '100%'}} />
            {
              ((edit && !isEmpty(collection)) || !edit) &&
                <AdvanceSettings {...CONFIG} edit={edit} owner={owner} onChange={this.onChange} repo={collection} />
            }
          </div>
          <div className='col-xs-12' style={{position: 'fixed', background: WHITE, bottom: 0, zIndex: 1999}}>
            <Button variant='contained' type='submit' onClick={this.onSubmit} style={{margin: '10px 0'}}>
              {edit ? 'Update Collection' : 'Create Collection'}
            </Button>
          </div>
        </div>
      </form>
    )
  }
}

export default CollectionForm;
