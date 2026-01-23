import React from 'react';
import { Analytics } from '@vercel/analytics/react';
import PostgreSQLMonitor from './PostgreSQLMonitor';

function App() {
  return (
    <>
      <PostgreSQLMonitor />
      <Analytics />
    </>
  );
}

export default App;
