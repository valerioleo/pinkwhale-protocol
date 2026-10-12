import {REPO_URL} from '../lib/site';

export const SiteFooter = () => (
  <footer className="site-foot">
    <div className="site-foot-inner">
      <span>
        An experiment by <a href="https://valeriohq.com">Valerio Leo</a>. Built on Seaport 1.6.
      </span>
      <a href={REPO_URL}>
        Source <span aria-hidden="true">↗</span>
      </a>
    </div>
  </footer>
);
