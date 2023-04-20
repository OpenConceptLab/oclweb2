export const SERVER_CONFIGS = [
  {
    id: 1,
    name: 'OCL Local',
    type: 'ocl',
    url: 'http://127.0.0.1:8000',
    local: true,
    operations: {
      source: [
        '$cascade',
        '$checksum'
      ],
      collection: [
        '$cascade',
        '$checksum'
      ],
    }
  },
  {
    id: 2,
    name: 'OCL QA',
    type: 'ocl',
    url: 'https://api.qa.openconceptlab.org',
    fhirServerId: 6,
    operations: {
      source: [
        '$cascade',
        '$checksum'
      ],
      collection: [
        '$cascade',
        '$checksum'
      ],
    }
  },
  {
    id: 10,
    name: 'OCL Dev',
    type: 'ocl',
    url: 'https://api.dev.openconceptlab.org',
    operations: {
      source: [
        '$cascade',
        '$checksum'
      ],
      collection: [
        '$cascade',
        '$checksum'
      ],
    }
  },
  {
    id: 3,
    name: 'OCL Demo',
    type: 'ocl',
    url: 'https://api.demo.openconceptlab.org',
    operations: {
      source: [
        '$cascade',
        '$checksum'
      ],
      collection: [
        '$cascade',
        '$checksum'
      ],
    }
  },
  {
    id: 4,
    name: 'OCL Staging',
    type: 'ocl',
    url: 'https://api.staging.openconceptlab.org',
    fhirServerId: 7,
    operations: {
      source: [
        '$cascade',
        '$checksum'
      ],
      collection: [
        '$cascade',
        '$checksum'
      ],
    }
  },
  {
    id: 11,
    name: 'WHO Staging',
    type: 'ocl',
    url: 'https://api.staging.who.openconceptlab.org',
    info: {
      site: {
        title: 'WHO',
        logoURL: 'https://www.who.int/images/default-source/infographics/who-emblem.png?sfvrsn=877bb56a_2',
        noLeftMenu: true,
        footerText: 'Powered by Open Concept Lab'
      }
    },
    operations: {
      source: [
        '$cascade',
        '$checksum'
      ],
      collection: [
        '$cascade',
        '$checksum'
      ],
    }
  },
  {
    id: 5,
    name: 'OCL Production',
    type: 'ocl',
    url: 'https://api.openconceptlab.org',
    operations: {
      source: [
        '$cascade',
        '$checksum'
      ],
      collection: [
        '$cascade',
        '$checksum'
      ],
    }
  },
  {
    id: 7,
    name: 'FHIR Staging',
    beta: true,
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
    },
    operations: {
      codeSystem: [
        '$lookup',
        '$validate-code',
      ],
      valueSet: [
        '$validate-code',
      ]
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
    },
    operations: {
      codeSystem: [
        '$lookup',
        '$validate-code',
      ],
      valueSet: [
        '$validate-code',
      ]
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
    },
    operations: {
      codeSystem: [
        '$lookup',
        '$validate-code',
      ],
      valueSet: [
        '$validate-code',
      ]
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
      noConceptMap: true,
      site: {
        title: 'WHO',
        logoURL: 'https://www.who.int/images/default-source/infographics/who-emblem.png?sfvrsn=877bb56a_2',
        noLeftMenu: true,
        footerText: 'Powered by Open Concept Lab'
      }
    },
    operations: {
      codeSystem: [
        '$lookup',
        '$validate-code',
      ],
      valueSet: [
        '$validate-code',
      ]
    }
  },
  {
    id: 13,
    name: 'FHIR QA',
    beta: true,
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
        logoURL: '/fhir.svg',
        noLeftMenu: true,
        footerText: 'FHIR Server Powered by Open Concept Lab'
      },
    },
    operations: {
      codeSystem: [
        '$lookup',
        '$validate-code',
      ],
      valueSet: [
        '$lookup',
        '$validate-code',
      ]
    }
  },
]
