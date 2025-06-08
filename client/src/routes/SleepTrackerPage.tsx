import React from 'react';
import { SleepTracker } from '../components/sleep-tracker';

const SleepTrackerPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <SleepTracker />
    </div>
  );
};

export default SleepTrackerPage;