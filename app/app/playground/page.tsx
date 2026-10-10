import type {Metadata} from 'next';

import {PlaygroundPage} from '../../components/sandbox/PlaygroundPage';
import '../landing.css';

export const metadata: Metadata = {
  title: 'Playground',
  description: 'Open and close a real Pinkwhale loan on Base Sepolia, with test assets.'
};

export default function Playground() {
  return <PlaygroundPage />;
}
