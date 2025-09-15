import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart, LineElement, PointElement, CategoryScale, LinearScale } from 'chart.js';

Chart.register(LineElement, PointElement, CategoryScale, LinearScale);

const ProgressChart = ({ uploads }) => {
  const labels = uploads.map((entry, idx) => `Upload ${idx + 1}`);
  const data = {
    labels,
    datasets: [
      {
        label: 'Aspiration Coverage (%)',
        data: uploads.map(entry => entry.aspirationCoverage),
        borderColor: '#007bff',
        backgroundColor: 'rgba(0, 123, 255, 0.2)',
        fill: true,
        tension: 0.3,
      },
    ],
  };

  return (
    <div style={{ marginTop: '30px' }}>
      <h4>📈 Progress Over Time</h4>
      <Line data={data} />
    </div>
  );
};

export default ProgressChart;