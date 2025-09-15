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
  if (!analysis || !analysis.aspirationDomainScores) return null;

  const labels = Object.keys(analysis.aspirationDomainScores);
  const values = Object.values(analysis.aspirationDomainScores);

  const allZero = values.every(val => val === 0);
  if (allZero) return null;

  const data = {
    labels,
    datasets: [
      {
        label: 'Aspiration Domain Coverage',
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