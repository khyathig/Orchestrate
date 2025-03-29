import React, { useState, useRef, useEffect , useCallback} from 'react';
import axios from 'axios';
import { Bar, Pie } from 'react-chartjs-2';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import ExcelJS from 'exceljs';
import '../../styles/ComprehensiveReport.css';
import { saveAs } from 'file-saver';
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend
} from 'chart.js';


ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend
);

// Use API URL from environment variables
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const ComprehensiveReport = () => {
  const [eventName, setEventName] = useState('');
  const [team, setTeam] = useState('');
  const [year, setYear] = useState('');
  const [eventType, setEventType] = useState('');
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const reportRef = useRef();

  //  Fetch Report Function
  const fetchReport = useCallback(async (isInitialLoad = false) => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (eventName) params.eventName = eventName;
      if (team) params.team = team;
      if (year) {
        const numericYear = parseInt(year);
        if (isNaN(numericYear) || numericYear < 1900 || numericYear > new Date().getFullYear()) {
          throw new Error('Invalid year provided. Please enter a valid year between 1900 and the current year.');
        }
        params.year = numericYear;
      }
      if (eventType) params.eventType = eventType;
  
      const response = await axios.get(
        `${API_BASE_URL}/api/events/compiledReport`,
        { params }
      );
  
      if (!response.data || !Array.isArray(response.data)) {
        throw new Error('Invalid data format from API.');
      }
  
      // Aggregate events by year and type
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
        acc[key].eventCount += cur.eventCount || 1;
        acc[key].totalBudget += Number(cur.totalBudget) || 0;
        if (cur.eventName) acc[key].eventNames.push(cur.eventName);
        return acc;
      }, {});
  
      const finalData = Object.values(aggregatedData).map(item => ({
        ...item,
        eventNames: Array.isArray(item.eventNames)
          ? item.eventNames.join(', ')
          : 'N/A'
      }));
  
      setReportData(finalData);
      console.log('API Response:', finalData);
    } catch (err) {
      console.error('Error fetching compiled report:', err);
      setError(err.message || 'No data found for the given criteria.');
    }
    setLoading(false);
  }, [eventName, team, year, eventType]);
  

  // Call fetchReport once on initial load
  useEffect(() => {
    fetchReport(true);
  }, [fetchReport]);

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true } }
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' } }
  };

  // PDF download
  const downloadPDF = () => {
    html2canvas(reportRef.current).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF();
      pdf.addImage(imgData, 'PNG', 10, 10, 180, 150);
      pdf.save('Comprehensive_Event_Report.pdf');
    });
  };

  // Excel download
  const downloadExcel = () => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Comprehensive Report');
    sheet.columns = [
      { header: 'Year', key: 'year', width: 10 },
      { header: 'Team', key: 'team', width: 15 },
      { header: 'Event Type', key: 'eventType', width: 15 },
      { header: 'Event Count', key: 'eventCount', width: 15 },
      { header: 'Event Names', key: 'eventNames', width: 25 },
      { header: 'Total Budget', key: 'totalBudget', width: 20 }
    ];
    reportData.forEach(item => {
      sheet.addRow({
        year: item.year,
        team: item.team || 'N/A',
        eventType: item.eventType,
        eventCount: item.eventCount,
        eventName: item.eventNames || 'N/A',
        totalBudget: item.totalBudget
      });
    });
    workbook.xlsx.writeBuffer().then(buffer => {
      saveAs(new Blob([buffer]), 'Comprehensive_Event_Report.xlsx');
    });
  };

  /* Prepare data for aggregated charts */
 // Event Count by Year
const eventsPerYear = reportData.reduce((acc, cur) => {
  const yr = cur.year;
  acc[yr] = (acc[yr] || 0) + cur.eventCount;
  return acc;
}, {});
const years = Object.keys(eventsPerYear);
const eventCounts = Object.values(eventsPerYear);

// Budget by Year
const budgetPerYear = reportData.reduce((acc, cur) => {
  const yr = cur.year;
  acc[yr] = (acc[yr] || 0) + cur.totalBudget; // Correct budget summation
  return acc;
}, {});
const budgets = years.map(yr => budgetPerYear[yr]);

// Event Type Distribution (if eventType not specified)
const eventTypeDistribution = reportData.reduce((acc, cur) => {
  const type = cur.eventType;
  acc[type] = (acc[type] || 0) + cur.eventCount;
  return acc;
}, {});
const eventTypes = Object.keys(eventTypeDistribution);
const eventTypeCounts = Object.values(eventTypeDistribution);

  return (
    <div>
      {/* Filter Form */}
      <div className="form-section">
        <h2>Comprehensive Reports</h2>
        <input
          type="text"
          placeholder="Event Name"
          value={eventName}
          onChange={e => setEventName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Team Name"
          value={team}
          onChange={e => setTeam(e.target.value)}
        />
        <input
          type="number"
          placeholder="Year"
          value={year}
          onChange={e => setYear(e.target.value)}
        />
        <select value={eventType} onChange={e => setEventType(e.target.value)}>
          <option value="">Select Event Type</option>
          <option value="firm-wide">Firm-wide</option>
          <option value="limited-entry">Limited-entry</option>
          <option value="team-specific">Team-specific</option>
        </select>
        <button onClick={fetchReport}>Generate Report</button>
        {error && <p className="error-message">{error}</p>}
      </div>

      {loading && <p>Loading report...</p>}

      {/* Aggregated Report Results */}
      {!loading && reportData.length > 0 && (
        <div className="report-section" ref={reportRef}>
          <h2>Comprehensive Report Results</h2>
          <table>
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
              {reportData.map((item, index) => (
                <tr key={index}>
                  <td>{item.year}</td>
                  <td>{item.team}</td>
                  <td>{item.eventType}</td>
                  <td>{item.eventCount}</td>
                  <td>{item.eventNames}</td>
                  <td>{item.totalBudget}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="download-buttons">
            <button onClick={downloadPDF}>Download PDF</button>
            <button onClick={downloadExcel}>Download Excel</button>
          </div>

          {/* Aggregated Charts */}
          <div className="charts">
          <h3>Events Count per Year</h3>
            <div className="chart-container">
              <Bar
                className="chart"
                data={{
                  labels: years,
                  datasets: [
                    {
                      label: 'Event Count',
                      data: eventCounts,
                      backgroundColor: '#007bff'
                    }
                  ]
                }}
                options={barOptions}
              />
            </div>

            <h3>Total Budget per Year (₹)</h3>
            <div className="chart-container">
              <Bar
                className="chart"
                data={{
                  labels: years,
                  datasets: [
                    {
                      label: 'Total Budget',
                      data: budgets,
                      backgroundColor: '#28a745'
                    }
                  ]
                }}
                options={barOptions}
              />
            </div>
            
            {/* Only show the pie chart if eventType filter is not specified */}
            {!eventType && (
              <>
                <h3>Event Type Distribution</h3>
                <div className="chart-container">
                  <Pie
                    className="chart"
                    data={{
                      labels: eventTypes,
                      datasets: [
                        {
                          label: 'Event Type Distribution',
                          data: eventTypeCounts,
                          backgroundColor: ['#007bff', '#28a745', '#ffc107', '#dc3545']
                        }
                      ]
                    }}
                    options={pieOptions}
                  />
                </div>
              </>
            )}

            {/* Show "Budget by Event Type" only if eventType is empty */}
            {!eventType && (() => {
              const budgetByType = reportData.reduce((acc, cur) => {
                const type = cur.eventType;
                if (!acc[type]) {
                  acc[type] = 0;
                }
                acc[type] += cur.totalBudget || 0; // Aggregate budget by type
                return acc;
              }, {});

              const typeLabels = Object.keys(budgetByType);
              const typeBudgets = Object.values(budgetByType);

              return (
                <div className="chart-group">
                  <h3>Budget Spent by Event Type</h3>
                  <div className="chart-container">
                    <Bar
                      className="chart"
                      data={{
                        labels: typeLabels,
                        datasets: [
                          {
                            label: 'Total Budget',
                            data: typeBudgets,
                            backgroundColor: ['#007bff', '#28a745', '#ffc107', '#dc3545']
                          }
                        ]
                      }}
                      options={{
                        ...barOptions,
                        plugins: { legend: { display: true } }
                      }}
                    />
                  </div>
                </div>
              );
            })()}

            {/* Show team-specific chart only if eventType === 'team-specific' */}
            {(eventType === 'team-specific'|| !eventType) && (() => {
              const teamSpecific = reportData.filter(item => item.eventType === 'team-specific');

              return teamSpecific.map((event, index) => {
                const teamColors = {
                  Operations: '#ffc107',
                  Marketing: '#007bff',
                  Finance: '#28a745',
                  HR: '#dc3545',
                  Sales: '#17a2b8',
                  Tech: '#6f42c1'
                };

                const defaultColor = '#343a40';
                const barColor = teamColors[event.team] || defaultColor;

                const eventNamesArray = event.eventNames?.split(',') || ['Unnamed Event'];
                const budgetsArray = eventNamesArray.map(() => event.totalBudget || 0);

                return (
                  <div key={index} className="chart-group">
                    <h3>{event.team || 'Unknown Team'} - {event.year || 'Unknown Year'}</h3>
                    <div className="chart-container">
                      <Bar
                        className="chart"
                        data={{
                          labels: eventNamesArray,
                          datasets: [
                            {
                              label: 'Budget (in Rupees)',
                              data: budgetsArray,
                              backgroundColor: barColor
                            }
                          ]
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: { legend: { display: true } },
                          scales: {
                            y: {
                              beginAtZero: true,
                              title: { display: true, text: 'Budget (Rupees)' }
                            },
                            x: {
                              title: { display: true, text: 'Event Names' }
                            }
                          }
                        }}
                      />
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

export default ComprehensiveReport;
