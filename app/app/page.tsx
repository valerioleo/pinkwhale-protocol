import type {Metadata} from 'next';

import {Landing} from '../components/sandbox/Landing';
import './sandbox/loan-story/lifecycle.css';
import './landing.css';

export const metadata: Metadata = {
  title: {absolute: 'Pinkwhale'},
  description:
    'A loan is just two trades that haven’t happened yet. NFT lending written as ordinary Seaport orders.'
};

export default function HomePage() {
  return <Landing />;
}
