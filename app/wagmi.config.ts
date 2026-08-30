import {defineConfig} from '@wagmi/cli';
import {react} from '@wagmi/cli/plugins';
import {deployments} from '@deployoor/wagmi';

/**
 * Typed contracts straight out of the deployment records, so no address map or ABI
 * is ever transcribed into the frontend. `pnpm generate:wagmi` after a deploy.
 */
export default defineConfig({
  out: 'lib/generated.ts',
  plugins: [deployments({path: '../deployments'}), react()]
});
