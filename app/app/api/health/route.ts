import {health} from '../../../lib/server/faucet';

/**
 * 200 while the faucet can do its job, 503 with the reasons when it cannot. The
 * scheduled workflow in `.github/workflows/health.yml` asks once a day, and a
 * failed run is what reaches a human.
 *
 * Cached for a minute at the edge: it is a CDP call and three reads, and nothing
 * here changes faster than that.
 */
export const GET = async () => {
  const headers = {'cache-control': 'public, s-maxage=60'};

  try {
    const report = await health();

    return Response.json(report, {status: report.ok ? 200 : 503, headers});
  } catch (error) {
    console.error('health check failed', error);
    return Response.json({ok: false, problems: [(error as Error).message]}, {status: 503, headers});
  }
};
