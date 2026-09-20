import type {Metadata} from 'next';

import {LoanStory} from '../../../components/sandbox/LoanStory';
import './loan-story.css';

export const metadata: Metadata = {
  title: 'Loan story',
  description: 'A sandbox for the scroll-driven view of the four orders a loan is made of.',
  // A sandbox is for looking at, not for indexing.
  robots: {index: false, follow: false}
};

export default function LoanStoryPage() {
  return <LoanStory />;
}
