export const WHITE = '#FFF';
export const BLACK = '#000';
export const BLUE = 'rgb(51, 115, 170)';
export const DARKGRAY = 'rgb(119, 119, 119)';
export const HEADER_GRAY = '#f6f8fa';
export const DATE_FORMAT = 'MM/DD/YYYY';
export const DATETIME_FORMAT = DATE_FORMAT + ' hh:mm A';
export const DEFAULT_LIMIT = 25;
export const COLOR_SELECTED = 'rgb(170, 100, 123)';
export const COLOR_ROW_SELECTED = 'rgba(119, 119, 119, 0.16)';
export const GREEN = '#5cb85c';
export const RED = '#c33';
export const ERROR_RED = '#f44336';
export const ORANGE = 'rgb(253, 164, 41)';
export const EMPTY_VALUE = '-';
export const DIFF_BG_RED = '#ffeef0';
export const DIFF_HIGHLIGHT_RED = '#fdb8c0';
export const DIFF_BG_GREEN = '#e6ffed';
export const DIFF_HIGHLIGHT_GREEN = '#acf2bd';
export const SOURCE_TYPES = [
  'Dictionary',
  'Interface Terminology',
  'Indicator Registry',
  'External'
];
export const COLLECTION_TYPES = [
  'Dictionary',
  'Interface Terminology',
  'Indicator Registry',
  'Value Set',
  'Subset',
];
/*eslint no-useless-escape: 0*/
export const SOURCE_CHILD_URI_REGEX = /\/(orgs|users)\/([a-zA-Z0-9\-\.\_\@]+)\/(sources|collections)\/([a-zA-Z0-9\-\.\_\@]+)\/(concepts|mappings)\/([a-zA-Z0-9\-\.\_\@]+)?\/?([a-zA-Z0-9\-\.\_\@]+)?\/?/;
export const OCL_SERVERS_GROUP = 'ocl_servers';
export const OCL_FHIR_SERVERS_GROUP = 'ocl_fhir_servers';
export const HAPI_FHIR_SERVERS_GROUP = 'hapi_fhir_servers';
export const AUTH_GROUPS = [
  {id: OCL_SERVERS_GROUP, name: 'OCL Servers'},
  {id: OCL_FHIR_SERVERS_GROUP, name: 'OCL FHIR Servers'},
  {id: HAPI_FHIR_SERVERS_GROUP, name: 'HAPI FHIR Servers'}
];
export const CONCEPT_CODE_REGEX = "[^\s]+(\s[^\s]+)*";
export const ROUTE_ID_PATTERN = "[a-zA-Z0-9\-\.\_\@]+";
export const TABLE_LAYOUT_ID = 'table';
export const LIST_LAYOUT_ID = 'list';
export const SPLIT_LAYOUT_ID = 'split';
export const OPENMRS_URL = 'https://openmrs.openconceptlab.org';
