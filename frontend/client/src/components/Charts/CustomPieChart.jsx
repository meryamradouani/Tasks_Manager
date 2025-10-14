import React from 'react';

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const CustomPieChart = ({ data, colors }) => {
  return (
    <ResponsiveContainer>
      <PieChart>
        <Pie 
          data={data} 
          cx="50%" 
          cy="50%" 
          dataKey="count" 
          nameKey="status" 
          innerRadius="40%" 
          outerRadius="60%" 
          fill="#8884d8" 
          paddingAngle={5}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};



export default CustomPieChart;