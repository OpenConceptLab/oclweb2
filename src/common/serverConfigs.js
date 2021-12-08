export const SERVER_CONFIGS = [
  {
    id: 1,
    name: 'OCL Local',
    type: 'ocl',
    url: 'http://127.0.0.1:8000'
  },
  // {
  //   id: 13,
  //   name: 'My WHO',
  //   type: 'ocl',
  //   url: 'http://localhost:8000',
  //   info: {
  //     site: {
  //       title: 'WHO',
  //       noOpenMRS: true,
  //       logoText: 'WHO',
  //       noLeftMenu: true,
  //       footerText: 'Powered by Open Concept Lab'
  //     }
  //   }
  // },
  {
    id: 2,
    name: 'OCL QA',
    type: 'ocl',
    url: 'https://api.qa.openconceptlab.org'
  },
  {
    id: 3,
    name: 'OCL Demo',
    type: 'ocl',
    url: 'https://api.demo.openconceptlab.org'
  },
  {
    id: 4,
    name: 'OCL Staging',
    type: 'ocl',
    url: 'https://api.staging.openconceptlab.org'
  },
  {
    id: 10,
    name: 'WHO Staging',
    type: 'ocl',
    url: 'https://api.staging.who.openconceptlab.org',
    info: {
      site: {
        title: 'WHO',
        noOpenMRS: true,
        logoURL: 'https://www.who.int/images/default-source/infographics/who-emblem.png?sfvrsn=877bb56a_2',
        noLeftMenu: true,
        footerText: 'Powered by Open Concept Lab'
      }
    }
  },
  {
    id: 5,
    name: 'OCL Production',
    type: 'ocl',
    url: 'https://api.openconceptlab.org'
  },
  // {
  //   id: 5,
  //   name: 'OCL Bad Server',
  //   type: 'ocl',
  //   url: 'https://api.foo.openconceptlab.org'
  // },
  {
    id: 6,
    name: 'FHIR QA',
    type: 'fhir',
    url: 'https://fhir.qa.openconceptlab.org',
    hapi: false,
    info: {
      pageSize: 10,
      baseURI: '/fhir/',
      type: 'HAPI FHIR 5.0.0 REST Server (FHIR Server; FHIR 4.0.1/R4)',
      org: {
        id: 'FHIR',
        name: "Fast Healthcare Interoperability Resources",
        logo_url: '/fhir.svg'
      },
      site: {
        title: 'FHIR',
        noOpenMRS: true,
        logoURL: '/fhir.svg',
        noLeftMenu: true,
        footerText: 'FHIR Server Powered by Open Concept Lab'
      }
    }
  },
  {
    id: 7,
    name: 'FHIR Staging',
    type: 'fhir',
    url: 'https://fhir.staging.openconceptlab.org',
    hapi: false,
    info: {
      pageSize: 10,
      baseURI: '/fhir/',
      type: 'HAPI FHIR 5.0.0 REST Server (FHIR Server; FHIR 4.0.1/R4)',
      org: {
        id: 'FHIR',
        name: "Fast Healthcare Interoperability Resources",
        logo_url: '/fhir.svg'
      }
    }
  },
  {
    id: 8,
    name: 'HAPI FHIR',
    type: 'fhir',
    hapi: true,
    url: 'https://hapi.fhir.org',
    info: {
      baseURI: '/baseR4/',
      type: 'HAPI FHIR 5.0.0 REST Server (FHIR Server; FHIR 4.0.1/R4)',
      org: {
        id: 'FHIR',
        name: "Fast Healthcare Interoperability Resources",
        logo_url: '/fhir.svg'
      }
    }
  },
  {
    id: 9,
    name: 'PEPFAR’s test FHIR HAPI',
    type: 'fhir',
    hapi: true,
    url: 'https://test.ohie.datim.org/hapi-fhir-jpaserver',
    info: {
      baseURI: '/fhir/',
      type: 'HAPI FHIR 4.2.0 REST Server (FHIR Server; FHIR 4.0.1/R4)',
      org: {
        id: 'PEPFAR',
        name: "The United States President's Emergency Plan for AIDS Relief",
        logo_url: '/fhir.svg'
      }
    }
  },
  {
    id: 12,
    name: 'ICD 11',
    type: 'fhir',
    hapi: true,
    url: 'https://icdapitest2.azurewebsites.net',
    info: {
      baseURI: '/fhir/',
      type: 'HAPI FHIR 4.2.0 REST Server (FHIR Server; FHIR 4.0.1/R4)',
      org: {
        id: 'ICD-11 (v2.1.0)',
        name: "FHIR capability statement for ICD-API FHIR Extension",
        logo_url: '/fhir.svg'
      },
      paginationParams: {
        _getpagesoffset: 0,
        _count: 25,
        _sort: '_id'
      },
      searchMode: 'hapi',
      noConceptMap: true
    }
  },
]
