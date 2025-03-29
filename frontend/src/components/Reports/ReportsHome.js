import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';

// Use API URL from environment variables
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const ReportsHome = () => {
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]=useState('');

  const [years, setYears] = useState([]);
  const [eventCounts, setEventCounts] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [eventTypeDistribution, setEventTypeDistribution] = useState([]);
  const [budgetByType, setBudgetByType] = useState([]);
  const [budgetByTeam, setBudgetByTeam] = useState([]);

  const fetchReport = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await axios.get(`${API_BASE_URL}/compiledReport`);
      
      if (!response.data || !Array.isArray(response.data)) {
        throw new Error('Invalid data format from API.');
      }

      console.log("Full API Response:", response.data);

      const aggregatedData = response.data.reduce((acc, cur) => {
        const key = `${cur.year}-${cur.eventType}`;

        if (!acc[key]) {
          acc[key] = {
            year: cur.year,
            team: cur.team || 'N/A',
            eventType: cur.eventType,
            eventCount: 0,
            eventNames: [],
            totalBudget: 0
          };
        }

        acc[key].eventCount += 1;
        acc[key].totalBudget += Number(cur.totalBudget) || 0;
        if (cur.eventName) acc[key].eventNames.push(cur.eventName);

        return acc;
      }, {});

      const finalData = Object.values(aggregatedData);
      setReportData(finalData);
      console.log("Processed Data for ReportsHome:", finalData);
    } catch (err) {
      console.error("Error fetching compiled report:", err);
      setError("No data found.");
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  useEffect(() => {
    if (reportData.length === 0) return;

    const eventsPerYear = {};
    const budgetPerYear = {};
    const eventTypeDist = {};
    const budgetByEventType = {};
    const budgetByTeams = {};

    reportData.forEach((cur) => {
      eventsPerYear[cur.year] = (eventsPerYear[cur.year] || 0) + cur.eventCount;
      budgetPerYear[cur.year] = (budgetPerYear[cur.year] || 0) + cur.totalBudget;
      eventTypeDist[cur.eventType] = (eventTypeDist[cur.eventType] || 0) + cur.eventCount;
      budgetByEventType[cur.eventType] = (budgetByEventType[cur.eventType] || 0) + cur.totalBudget;
      if (cur.team && cur.team !== "N/A") {
        budgetByTeams[cur.team] = (budgetByTeams[cur.team] || 0) + cur.totalBudget;
      }
    });

    setYears(Object.keys(eventsPerYear));
    setEventCounts(Object.values(eventsPerYear));
    setBudgets(Object.values(budgetPerYear));
    setEventTypeDistribution(Object.entries(eventTypeDist).map(([type, count]) => ({ type, count })));
    setBudgetByType(Object.entries(budgetByEventType).map(([type, budget]) => ({ type, budget })));
    setBudgetByTeam(Object.entries(budgetByTeams).map(([team, budget]) => ({ team, budget })));

    console.log("Events per Year:", eventsPerYear);
  console.log("Budget per Year:", budgetPerYear);
  console.log("Event Type Distribution:", eventTypeDist);
  console.log("Budget by Event Type:", budgetByEventType);
  console.log("Budget by Team:", budgetByTeams);
  }, [reportData]);

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
      },
      tooltip: {
        callbacks: {
          label: function (tooltipItem) {
            let dataset = tooltipItem.dataset;
            let dataIndex = tooltipItem.dataIndex;
            let value = dataset.data[dataIndex];
            return `${dataset.label}: ${value}`;
          },
        },
      },
    },
    pieChart: {
      cx: "50%",
      cy: "50%",
      outerRadius: 100,
      fill: "#8884d8",
      label: true,
      legendType: "circle",
      isAnimationActive: true,
      animationDuration: 800,
      animationEasing: "ease-out",
      stroke: "#fff",
      strokeWidth: 1,
      paddingAngle: 5,
    },
    colors: {
      "firm-wide": "#0088FE",
      "team-specific": "#00C49F",
      "limited-entry": "#FFBB28",
      "Other": "#FF8042",
    },
  };
  
  return (
    <div>
      <h2>Reports Dashboard</h2>
      {loading && <p>Loading report...</p>}
      {error && <p className="error-message">{error}</p>}

      {!loading && reportData.length > 0 ? (
        <div>
          <h3>Event Data Overview</h3>
          <div className="report-table-container">
          <table className="report-table">
            <thead>
              <tr>
                <th>Year</th>
                <th>Team</th>
                <th>Event Type</th>
                <th>Event Count</th>
                <th>Event Names</th>
                <th>Total Budget (₹)</th>
              </tr>
            </thead>
            <tbody>
              {reportData.map((row, index) => (
                <tr key={index}>
                  <td>{row.year}</td>
                  <td>{row.team}</td>
                  <td>{row.eventType}</td>
                  <td>{row.eventCount}</td>
                  <td>{row.eventNames.join(', ')}</td>
                  <td>₹{row.totalBudget}</td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
          
          <h3>Event Count per Year</h3>
          {console.log("Years:", years)} {/* Log to check years */}
          {console.log("Event Counts:", eventCounts)} {/* Log to check eventCounts */}
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={years.map((year, i) => ({ year, events: eventCounts[i] }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="events" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>

          {/* Budget per Year Graph */}
          <h3>Total Budget per Year (₹)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={years.map((year, i) => ({ year, budget: budgets[i] }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="budget" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
          {/* Budget Allocation by Event Type Graph */}
          <h3>Budget Allocation by Event Type</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={budgetByType}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="type" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="budget" fill="#FFBB28" />
            </BarChart>
          </ResponsiveContainer>

          <h3>Event Type Distribution</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={eventTypeDistribution.map(item => ({
                    ...item,
                    fill: pieOptions.colors[item.type] || pieOptions.colors["Other"]
                  }))}
                  dataKey="count"
                  nameKey="type"
                  cx={pieOptions.pieChart.cx}
                  cy={pieOptions.pieChart.cy}
                  outerRadius={pieOptions.pieChart.outerRadius}
                  label={pieOptions.pieChart.label}
                  legendType={pieOptions.pieChart.legendType}
                  isAnimationActive={pieOptions.pieChart.isAnimationActive}
                  animationDuration={pieOptions.pieChart.animationDuration}
                  animationEasing={pieOptions.pieChart.animationEasing}
                  stroke={pieOptions.pieChart.stroke}
                  strokeWidth={pieOptions.pieChart.strokeWidth}
                  paddingAngle={pieOptions.pieChart.paddingAngle}
                />
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Budget Allocation by Team Graph */}
          <h3>Budget Allocation by Team</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={budgetByTeam}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="team" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="budget">
                {budgetByTeam.map(({ team }, index) => {
                  const teamColors = {
                    Operations: '#ffc107',   // Yellow
                    Marketing: '#007bff',    // Blue
                    Finance: '#28a745',      // Green
                    HR: '#dc3545',           // Red
                    Sales: '#17a2b8',        // Cyan
                    Tech: '#6f42c1',         // Purple
                  };
                  return (
                    <Cell key={`cell-${index}`} fill={teamColors[team] || "#CCCCCC"} /> // Default gray if team not found
                  );
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

        </div>
      ) : !loading && <p>No data available.</p>}
    </div>
  );
};

export default ReportsHome;
