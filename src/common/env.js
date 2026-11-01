// TBv2 is served from app[.<env>].openconceptlab.org and from app.v2[.<env>].openconceptlab.org, where it stays
// once TBv3 becomes the default Term Browser (OpenConceptLab/ocl_online#236); either host names the same environment.
export const toAppOrigin = origin => origin.replace('://app.v2.', '://app.')

export const getEnv = forURL => {
  const fqdn = toAppOrigin(window.location.origin);

  if(fqdn.match('app.staging.openconceptlab'))
    return 'staging';
  if(fqdn.match('app.qa.openconceptlab'))
    return 'qa';
  if(fqdn.match('app.demo.openconceptlab'))
    return 'demo';
  if(fqdn.match('app.dev.openconceptlab'))
    return 'dev';
  if(fqdn.match('app.staging.who.openconceptlab'))
    return forURL ? 'staging.who' : 'staging-who';
  if(fqdn.match('app.openconceptlab'))
    return forURL ? '' : 'production';

  return 'development';
}
