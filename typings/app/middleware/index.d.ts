// This file is created by egg-ts-helper@1.25.8
// Do not modify this file!!!!!!!!!

import 'egg';
import ExportAccessLog from '../../../app/middleware/access_log';
import ExportAppendConfig from '../../../app/middleware/append_config';
import ExportMySession from '../../../app/middleware/my_session';

declare module 'egg' {
  interface IMiddleware {
    accessLog: typeof ExportAccessLog;
    appendConfig: typeof ExportAppendConfig;
    mySession: typeof ExportMySession;
  }
}
