export const SERVER_CONFIGS = [
  {
    id: 1,
    name: 'OCL Local',
    type: 'ocl',
    url: 'http://127.0.0.1:8000'
  },
  {
    id: 2,
    name: 'OCL QA',
    type: 'ocl',
    url: 'https://api.qa.aws.openconceptlab.org'
  },
  {
    id: 3,
    name: 'OCL DEMO',
    type: 'ocl',
    url: 'https://api.demo.aws.openconceptlab.org'
  },
  {
    id: 4,
    name: 'OCL Staging',
    type: 'ocl',
    url: 'https://api.staging.aws.openconceptlab.org'
  },
  // {
  //   id: 5,
  //   name: 'OCL Bad Server',
  //   type: 'ocl',
  //   url: 'https://api.foo.aws.openconceptlab.org'
  // },
  {
    id: 6,
    name: 'FHIR QA',
    type: 'fhir',
    url: 'https://fhir.qa.aws.openconceptlab.org',
    info: {
      type: 'HAPI FHIR 5.0.0 REST Server (FHIR Server; FHIR 4.0.1/R4)',
      org: {
        id: 'PEPFAR',
        name: "The United States President's Emergency Plan for AIDS Relief",
        logo_url: '/fhir.svg'
      }
    }
  },
  {
    id: 7,
    name: 'FHIR Staging',
    type: 'fhir',
    url: 'https://fhir.staging.aws.openconceptlab.org',
    info: {
      type: 'HAPI FHIR 5.0.0 REST Server (FHIR Server; FHIR 4.0.1/R4)',
      org: {
        id: 'PEPFAR',
        name: "The United States President's Emergency Plan for AIDS Relief",
        logo_url: '/fhir.svg'
      }
    }
  },
]
