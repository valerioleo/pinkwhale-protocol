import type {Metadata} from 'next';

import {Lifecycle} from '../../../components/sandbox/Lifecycle';
import './lifecycle.css';

export const metadata: Metadata = {
  title: 'Loan lifecycle',
  description: 'A sandbox for the figure: agree, exchange, resolve.',
  // A sandbox is for looking at, not for indexing.
  robots: {index: false, follow: false}
};

export default function LifecyclePage() {
  return <Lifecycle />;
}
