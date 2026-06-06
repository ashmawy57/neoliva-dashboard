#!/usr/bin/env node
/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Neoliva Dashboard — Local Load Test Script
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * PURPOSE
 *   Verify that the Prisma connection pool (max:2) and the RLS transaction
 *   wrapper hold up under concurrent HTTP traffic without throwing:
 *     "Transaction API error: Unable to start a transaction"
 *   or exhausting the pg Pool.
 *
 * WHAT IT TESTS
 *   Scenario A — Patients list (paginated)   : GET /patients?page=1
 *   Scenario B — Patients search (DB filter) : GET /patients?search=a&page=1
 *   Scenario C — Dashboard                   : GET /
 *   Scenario D — Burst (many simultaneous)   : All of the above, fired at once
 *
 * USAGE
 *   node scripts/load-test.js [options]
 *
 * OPTIONS
 *   --url        Base URL of the running dev server  [default: http://localhost:3000]
 *   --concurrency  Simultaneous requests per wave    [default: 20]
 *   --waves        Number of waves to run            [default: 5]
 *   --delay        Ms between waves                  [default: 500]
 *   --scenario     A | B | C | D | all               [default: all]
 *   --cookie       Session cookie string (required for auth'd routes)
 *
 * EXAMPLE
 *   node scripts/load-test.js --concurrency 50 --waves 10 --cookie "__session=..."
 *
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use strict';

const http  = require('http');
const https = require('https');
const { performance } = require('perf_hooks');

// ─── CLI Arg Parsing ──────────────────────────────────────────────────────────

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = {
    url:         'http://localhost:3000',
    concurrency: 20,
    waves:       5,
    delay:       500,
    scenario:    'all',
    cookie:      '',
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--url':         opts.url         = args[++i]; break;
      case '--concurrency': opts.concurrency = parseInt(args[++i], 10); break;
      case '--waves':       opts.waves       = parseInt(args[++i], 10); break;
      case '--delay':       opts.delay       = parseInt(args[++i], 10); break;
      case '--scenario':    opts.scenario    = args[++i]; break;
      case '--cookie':      opts.cookie      = args[++i]; break;
      case '--help':
        printHelp();
        process.exit(0);
    }
  }
  return opts;
}

function printHelp() {
  console.log(`
  Usage: node scripts/load-test.js [options]

  Options:
    --url          Base URL              [default: http://localhost:3000]
    --concurrency  Requests per wave     [default: 20]
    --waves        Number of waves       [default: 5]
    --delay        Ms between waves      [default: 500]
    --scenario     A|B|C|D|all           [default: all]
    --cookie       Session cookie value

  Scenarios:
    A  GET /patients?page=1              (server-side paginated list)
    B  GET /patients?search=a&page=1     (server-side search)
    C  GET /                             (dashboard aggregations)
    D  Burst mix of A+B+C simultaneously

  Examples:
    node scripts/load-test.js
    node scripts/load-test.js --concurrency 50 --waves 10
    node scripts/load-test.js --scenario A --concurrency 100 --cookie "sb-xxx=yyy"
  `);
}

// ─── HTTP Fetcher ─────────────────────────────────────────────────────────────

/**
 * fire(url, cookie) → Promise<{ status, ms, error }>
 * Makes a single HTTP/HTTPS GET and records status + latency.
 */
function fire(targetUrl, cookie) {
  return new Promise((resolve) => {
    const start   = performance.now();
    const parsed  = new URL(targetUrl);
    const lib     = parsed.protocol === 'https:' ? https : http;

    const reqOpts = {
      hostname: parsed.hostname,
      port:     parsed.port || (parsed.protocol === 'https:' ? 443 : 80),
      path:     parsed.pathname + parsed.search,
      method:   'GET',
      headers: {
        'Accept':          'text/html,application/json',
        'Connection':      'keep-alive',
        ...(cookie ? { 'Cookie': cookie } : {}),
      },
      // Abort after 20 s to avoid hanging the test
      timeout: 20000,
    };

    const req = lib.request(reqOpts, (res) => {
      // Drain body to prevent socket leaks
      res.resume();
      res.on('end', () => {
        resolve({ status: res.statusCode, ms: Math.round(performance.now() - start), error: null });
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({ status: 0, ms: Math.round(performance.now() - start), error: 'TIMEOUT' });
    });

    req.on('error', (err) => {
      resolve({ status: 0, ms: Math.round(performance.now() - start), error: err.code || err.message });
    });

    req.end();
  });
}

// ─── Scenario Definitions ─────────────────────────────────────────────────────

function buildScenarios(baseUrl) {
  return {
    A: { name: 'Patients list (paginated)',      path: '/patients?page=1'              },
    B: { name: 'Patients search (DB filter)',    path: '/patients?search=a&page=1'     },
    C: { name: 'Dashboard (aggregations)',       path: '/'                             },
    D: { name: 'Burst mix (A+B+C combined)',     mixed: ['A', 'B', 'C']               },
  };
}

// ─── Stats Accumulator ────────────────────────────────────────────────────────

function createStats() {
  return { total: 0, ok: 0, errors: 0, timeouts: 0, latencies: [], statusCodes: {} };
}

function recordResult(stats, result) {
  stats.total++;
  const code = result.status;

  if (result.error === 'TIMEOUT') {
    stats.timeouts++;
    stats.errors++;
  } else if (result.error) {
    stats.errors++;
  } else if (code >= 200 && code < 400) {
    stats.ok++;
    stats.latencies.push(result.ms);
  } else {
    stats.errors++;
  }

  stats.statusCodes[code] = (stats.statusCodes[code] || 0) + 1;
}

function percentile(sorted, p) {
  if (sorted.length === 0) return 0;
  const idx = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, idx)];
}

function summarise(stats, label) {
  const sorted = [...stats.latencies].sort((a, b) => a - b);
  const avg    = sorted.length ? Math.round(sorted.reduce((s, v) => s + v, 0) / sorted.length) : 0;

  console.log(`\n  ┌─ ${label}`);
  console.log(`  │  Requests : ${stats.total}`);
  console.log(`  │  Success  : ${stats.ok}   (${((stats.ok / stats.total) * 100).toFixed(1)}%)`);
  console.log(`  │  Errors   : ${stats.errors} (timeouts: ${stats.timeouts})`);
  console.log(`  │  Status   : ${JSON.stringify(stats.statusCodes)}`);
  console.log(`  │  Latency  : avg=${avg}ms  p50=${percentile(sorted,50)}ms  p95=${percentile(sorted,95)}ms  p99=${percentile(sorted,99)}ms  max=${sorted[sorted.length-1]||0}ms`);
  console.log(`  └${'─'.repeat(60)}`);

  return { ok: stats.ok, errors: stats.errors, timeouts: stats.timeouts };
}

// ─── Wave Runner ──────────────────────────────────────────────────────────────

/**
 * runWave — fires `concurrency` requests simultaneously and awaits all.
 */
async function runWave(urls, cookie) {
  const promises = urls.map((u) => fire(u, cookie));
  return Promise.all(promises);
}

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const opts      = parseArgs();
  const scenarios = buildScenarios(opts.url);

  // Resolve which scenarios to run
  const toRun = opts.scenario === 'all'
    ? ['A', 'B', 'C', 'D']
    : opts.scenario.toUpperCase().split(',').map(s => s.trim());

  const unknowns = toRun.filter(k => !scenarios[k]);
  if (unknowns.length) {
    console.error(`Unknown scenario(s): ${unknowns.join(', ')}. Valid: A, B, C, D, all`);
    process.exit(1);
  }

  // ─── Header ──────────────────────────────────────────────────────────────

  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║        Neoliva Dashboard — Connection Pool Load Test         ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log(`\n  Target      : ${opts.url}`);
  console.log(`  Concurrency : ${opts.concurrency} simultaneous requests per wave`);
  console.log(`  Waves       : ${opts.waves}`);
  console.log(`  Inter-wave  : ${opts.delay}ms`);
  console.log(`  Scenarios   : ${toRun.join(', ')}`);
  console.log(`  Cookie      : ${opts.cookie ? '✓ provided' : '✗ none (unauthenticated — expect 307 redirects)'}`);
  const poolMax = process.env.DB_POOL_MAX || '15 (fallback)';
  console.log(`\n  ℹ  Pool size : DB_POOL_MAX=${poolMax}`);
  console.log(`  ⚠  Watch the dev server console for "Unable to start a transaction".\n`);

  // ─── Warm-up ─────────────────────────────────────────────────────────────

  process.stdout.write('  Warming up server (3 requests)... ');
  await Promise.all([
    fire(`${opts.url}/patients?page=1`, opts.cookie),
    fire(`${opts.url}/`, opts.cookie),
    fire(`${opts.url}/patients?page=1`, opts.cookie),
  ]);
  console.log('done.\n');

  // ─── Run Scenarios ────────────────────────────────────────────────────────

  const globalStats = createStats();
  const scenarioResults = {};

  for (const key of toRun) {
    const sc     = scenarios[key];
    const stats  = createStats();
    console.log(`\n▶ Scenario ${key}: ${sc.name}`);
    console.log(`  ${'─'.repeat(55)}`);

    for (let w = 1; w <= opts.waves; w++) {
      process.stdout.write(`  Wave ${String(w).padStart(2, '0')}/${opts.waves} ... `);
      const t0 = performance.now();

      // Build URL list for this wave
      let urls;
      if (sc.mixed) {
        // Scenario D: distribute concurrency across the mixed paths
        const paths = sc.mixed.map(k => scenarios[k].path);
        urls = Array.from({ length: opts.concurrency }, (_, i) =>
          `${opts.url}${paths[i % paths.length]}`
        );
      } else {
        urls = Array.from({ length: opts.concurrency }, () => `${opts.url}${sc.path}`);
      }

      const results = await runWave(urls, opts.cookie);
      const elapsed = Math.round(performance.now() - t0);

      let waveOk = 0, waveErr = 0;
      results.forEach(r => {
        recordResult(stats, r);
        recordResult(globalStats, r);
        if (r.error || r.status >= 400) waveErr++;
        else waveOk++;
      });

      const icon = waveErr === 0 ? '✓' : `✗ (${waveErr} failures)`;
      console.log(`${icon}  [${elapsed}ms total]`);

      if (w < opts.waves) await sleep(opts.delay);
    }

    scenarioResults[key] = summarise(stats, `Scenario ${key}: ${sc.name}`);
  }

  // ─── Global Summary ───────────────────────────────────────────────────────

  const allOk      = globalStats.ok;
  const allErrors  = globalStats.errors;
  const allTotal   = globalStats.total;
  const successPct = ((allOk / allTotal) * 100).toFixed(1);

  console.log('\n\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║                     FINAL REPORT                            ║');
  console.log('╠══════════════════════════════════════════════════════════════╣');
  console.log(`║  Total requests  : ${String(allTotal).padEnd(41)}║`);
  console.log(`║  Successful      : ${String(allOk).padEnd(41)}║`);
  console.log(`║  Failed          : ${String(allErrors).padEnd(41)}║`);
  console.log(`║  Success rate    : ${String(successPct + '%').padEnd(41)}║`);
  console.log('╠══════════════════════════════════════════════════════════════╣');

  // ─── Connection Pool Health Assessment ───────────────────────────────────

  const hasTimeouts   = globalStats.timeouts > 0;
  const highErrorRate = allErrors / allTotal > 0.05; // > 5% failure = concern

  console.log('║                   POOL HEALTH ASSESSMENT                    ║');
  if (!hasTimeouts && !highErrorRate) {
    console.log('║  ✅ PASS — No connection pool exhaustion detected.           ║');
    console.log('║     Pool held up. No transaction errors observed.           ║');
  } else if (hasTimeouts && !highErrorRate) {
    console.log('║  ⚠️  WARN — Some timeouts detected.                          ║');
    console.log(`║     Timeouts: ${String(globalStats.timeouts).padEnd(47)}║`);
    console.log('║     Pool max:2 is being saturated. Consider increasing it.  ║');
  } else {
    console.log('║  ❌ FAIL — High error rate detected.                         ║');
    console.log(`║     Errors: ${String(allErrors + '/' + allTotal).padEnd(49)}║`);
    console.log('║     Check dev server logs for "Unable to start a           ║');
    console.log('║     transaction" or Prisma pool exhaustion errors.          ║');
  }
  console.log('╠══════════════════════════════════════════════════════════════╣');
  console.log('║  NEXT STEPS                                                  ║');
  console.log('║  • If timeouts: raise pool max in src/lib/prisma.ts          ║');
  console.log('║    from max:2 → max:10 (or use DATABASE_URL pool params)     ║');
  console.log('║  • Check dev server terminal for Prisma error lines          ║');
  console.log('║  • Run with --concurrency 5 to establish a baseline first    ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');
}

main().catch((err) => {
  console.error('\n[load-test] Fatal error:', err);
  process.exit(1);
});
