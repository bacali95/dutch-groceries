import type { FetcherWithComponents } from 'react-router';

export { CloudflareAuthentication } from './CloudflareAuthentication';
export { CredentialsAuthentication } from './CredentialsAuthentication';

export type AuthenticationProps = {
  form: FetcherWithComponents<any>['Form'];
  loading: boolean;
};
