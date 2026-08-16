const http = require('http');

/**
 * Eventopia API Latency Benchmark Tool
 * Measures performance difference between MongoDB database queries (Cache Miss)
 * and Redis in-memory cache retrievals (Cache Hit).
 */

const request = (path) => {
  return new Promise((resolve, reject) => {
    const start = performance.now();
    const options = {
      hostname: 'localhost',
      port: process.env.PORT || 5000,
      path: path,
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const duration = performance.now() - start;
        const cacheStatus = res.headers['x-cache-status'] || 'NONE';
        resolve({ duration, status: res.statusCode, cacheStatus });
      });
    });

    req.on('error', (err) => {
      reject(new Error(`Failed to connect to backend server on port ${options.port}. Is it running? (${err.message})`));
    });
    req.end();
  });
};

const runBenchmark = async () => {
  console.log('====================================================');
  console.log('         EVENTOPIA REDIS CACHING BENCHMARK          ');
  console.log('====================================================\n');

  try {
    // 1. Initial Request (Force Cache Miss / DB Read)
    console.log('Sending Initial Request (Cache Miss / Database query)...');
    const firstReq = await request('/api/events');
    console.log(`-> Status: ${firstReq.status} | X-Cache-Status: ${firstReq.cacheStatus} | Latency: ${firstReq.duration.toFixed(2)} ms\n`);

    // 2. Sequential Requests (Cache Hits / Redis Reads)
    console.log('Sending 5 Sequential Requests (Cache Hits / Redis Reads)...');
    const hitTimes = [];
    for (let i = 1; i <= 5; i++) {
      const res = await request('/api/events');
      hitTimes.push(res.duration);
      console.log(`   [Hit #${i}] Latency: ${res.duration.toFixed(2)} ms | X-Cache-Status: ${res.cacheStatus}`);
    }

    const avgHitTime = hitTimes.reduce((a, b) => a + b, 0) / hitTimes.length;
    const latencyReduction = ((firstReq.duration - avgHitTime) / firstReq.duration) * 100;

    console.log('\n=================== RESULTS ========================');
    console.log(`Database Query (Average):  ${firstReq.duration.toFixed(2)} ms`);
    console.log(`Redis Cache Hit (Average): ${avgHitTime.toFixed(2)} ms`);
    console.log(`Performance Improvement:   ${latencyReduction.toFixed(2)}% faster`);
    console.log('====================================================\n');

  } catch (err) {
    console.error(`\n[Benchmark Error] ${err.message}`);
    console.log('Please start your backend server first (e.g., node backend/server.js) and re-run.');
  }
};

runBenchmark();
