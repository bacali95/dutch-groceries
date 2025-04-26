import { version } from '../../package.json';

export function loader() {
  return new Response(version, { status: 200 });
}
