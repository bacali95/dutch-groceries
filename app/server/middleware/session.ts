import type { Args } from 'typesafe-rpc';

import { assertAuthorized } from '../helpers';
import type { Context } from '../route';

export const hasSession = async <Params, ExtraParams>(args: Args<Params, Context, ExtraParams>) => {
  return { user: assertAuthorized(args.context.request) };
};
