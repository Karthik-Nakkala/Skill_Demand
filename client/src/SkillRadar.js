import React from 'react';
import { Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

const SkillRadar = ({ analysis }) => {
  if (!analysis || !analysis.domainScores) {
    console.log('⚠️ No domainScores found in analysis');
    return null;
  }

  const labels = Object.keys(analysis.domainScores);
  const values = Object.values(analysis.domainScores);

  console.log('📊 domainScores:', analysis.domainScores);

  const allZero = values.every(val => val === 0);
  if (allZero) {
    console.log('⚠️ All domain scores are zero, skipping radar chart');
    return null;
  }

  const data = {
    labels,
    datasets: [
      {
        label: 'Domain Coverage',
        data: values,
        backgroundColor: 'rgba(33, 150, 243, 0.2)',
        borderColor: 'rgba(33, 150, 243, 1)',
        borderWidth: 2
      }
    ]
  };

  const options = {
    scales: {
      r: {
        beginAtZero: true,
        ticks: { stepSize: 1 }
      }
    }
  };

  return (
    <div style={{ marginTop: '30px' }}>
      <h3>Skill Domain Radar</h3>
      <div style={{ maxWidth: '500px', margin: 'auto' }}>
        <Radar data={data} options={options} />
      </div>
    </div>
  );
};

export default SkillRadar;