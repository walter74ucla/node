// Flags: --experimental-report --report-on-signal
'use strict';
// Test producing a report via signal.
const common = require('../common');
common.skipIfReportDisabled();
if (common.isWindows)
  return common.skip('Unsupported on Windows.');

if (!common.isMainThread)
  common.skip('Signal reporting is only supported in the main thread');

const assert = require('assert');
const helper = require('../common/report');
const tmpdir = require('../common/tmpdir');

common.expectWarning('ExperimentalWarning',
                     'report is an experimental feature. This feature could ' +
                     'change at any time');
tmpdir.refresh();
process.report.directory = tmpdir.path;

assert.strictEqual(process.listenerCount('SIGUSR2'), 1);
process.kill(process.pid, 'SIGUSR2');

// Asynchronously wait for the report. In development, a single setImmediate()
// appears to be enough. Use an async loop to be a bit more robust in case
// platform or machine differences throw off the timing.
(function validate() {
  const reports = helper.findReports(process.pid, tmpdir.path);

  if (reports.length === 0)
    return setImmediate(validate);

  assert.strictEqual(reports.length, 1);
  helper.validate(reports[0]);
})();
 // Test by walter74ucla on how to use GitHub