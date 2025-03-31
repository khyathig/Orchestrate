/**
 * DetailedEventReport component allows users to filter and generate detailed event reports
 * based on event name, team, and year. It displays the report data in a structured format, 
 * visualizes the event statistics using Pie and Bar charts, and enables downloading the report 
 * in PDF and Excel formats.
 * 
 * @component
 * @example
 * return (
 *   <DetailedEventReport />
 * )
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { Pie, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend } from 'chart.js';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import '../../styles/ComprehensiveReport.css';

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend);

/**
 * API base URL for fetching event report data.
 * 
 * @constant
 * @type {string}
 * @default
 */
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const DetailedEventReport = () => {
  const [eventName, setEventName] = useState('');
  const [team, setTeam] = useState('');
  const [year, setYear] = useState('');
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const reportRef = useRef();

/**
 * Handles the fetching of detailed event report based on applied filters (event name, team, year).
 * Uses Axios to send a GET request to the server and retrieves the detailed report data.
 * 
 * @function
 * @param {string} eventName - The name of the event to filter the report.
 * @param {string} team - The team name to filter the report.
 * @param {string} year - The year of the event to filter the report.
 * @throws {Error} If the data fetching fails or no data matches the criteria.
 */
  const fetchReport = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams();
      if (eventName) params.append('eventName', eventName);
      if (team) params.append('team', team);
      if (year) params.append('year', year);

      const response = await axios.get(`${API_BASE_URL}/api/events/detailedReport`, { params });

      if (!response.data.length) {
        setError("No data found for the given criteria.");
      }
      setReportData(response.data);
    } catch (err) {
      setError("Error fetching report.");
    }
    setLoading(false);
  }, [eventName, team, year]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);
/**
 * Initializes the chart options for Pie and Bar charts used in event report visualizations.
 * 
 * @constant
 * @type {object}
 * @default
 * @property {boolean} responsive - Ensures the charts are responsive and maintain aspect ratio.
 * @property {object} plugins - Includes chart legend configuration.
 */
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'top' } },
  };

/**
 * Downloads the detailed event report in PDF format.
 * Captures the report content and converts it into a downloadable PDF using html2canvas and jsPDF.
 * 
 * @function
 */
  const downloadPDF = () => {
    html2canvas(reportRef.current).then(canvas => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF();
      pdf.addImage(imgData, "PNG", 10, 10, 180, 150);
      pdf.save("Detailed_Event_Report.pdf");
    });
  };
/**
 * Downloads the detailed event report in Excel format.
 * Converts the event data into an Excel sheet and triggers a download.
 * 
 * @function
 */
  const downloadExcel = () => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Detailed Report");
    sheet.columns = [
      { header: "Event Name", key: "eventName", width: 30 },
      { header: "Year", key: "year", width: 10 },
      { header: "Total Attended", key: "totalAttended", width: 20 },
      { header: "Attendance %", key: "attendancePercentage", width: 15 },
      { header: "Total Tasks", key: "totalTasks", width: 15 },
      { header: "Completed Tasks", key: "completedTasks", width: 20 },
      { header: "In Progress Tasks", key: "inProgressTasks", width: 20 },
      { header: "Pending Tasks", key: "pendingTasks", width: 20 },
      { header: "Task Completion Rate %", key: "taskCompletionRate", width: 20 },
      { header: "Total Budget (₹)", key: "totalBudget", width: 20 },
    ];
    reportData.forEach(event => {
      sheet.addRow(event);
    });
    workbook.xlsx.writeBuffer().then(buffer => {
      saveAs(new Blob([buffer]), "Detailed_Event_Report.xlsx");
    });
  };
/**
 * Renders the detailed event report UI, allowing users to filter by event name, team, and year.
 * Displays the report results, including event details and visualizations such as Pie and Bar charts.
 * Provides options to download the report as a PDF or Excel file.
 * 
 * @component
 * @example
 * return (
 *   <DetailedEventReport />
 * )
 */
  return (
    <div>
      <div className="form-section">
        <h2>Filter Detailed Reports</h2>
        <input type="text" placeholder="Event Name" value={eventName} onChange={(e) => setEventName(e.target.value)} />
        <input type="text" placeholder="Team Name" value={team} onChange={(e) => setTeam(e.target.value)} />
        <input type="number" placeholder="Year" value={year} onChange={(e) => setYear(e.target.value)} />
        <button onClick={fetchReport}>Generate Report</button>
        {error && <p className="error-message">{error}</p>}
      </div>

      {loading && <p>Loading report...</p>}
      {!loading && reportData.length > 0 && (
        <div className="report-section" ref={reportRef}>
          <h2>Detailed Report Results</h2>
          <div className="event-container">
            {reportData.map((event, index) => (
              <div key={index} className="event-card">
                <div className="event-details">
                  <p><strong>Event Name:</strong> {event.eventName}</p>
                  <p><strong>Year:</strong> {event.year}</p>
                  <p><strong>Team:</strong> {event.team}</p>
                  <p><strong>Attendance %:</strong> {event.totalRSVP ? ((event.totalAttended / event.totalRSVP) * 100).toFixed(2) : 0}%</p>
                  <p><strong>Task Completion Rate:</strong> {event.taskCompletionRate}%</p>
                  <p><strong>Total Tasks:</strong> {event.totalTasks}</p>
                  <p><strong>Completed Tasks:</strong> {event.completedTasks}</p>
                  <p><strong>In Progress Tasks:</strong> {event.inProgressTasks}</p>
                  <p><strong>Pending Tasks:</strong> {event.pendingTasks}</p>
                </div>
                <div className="chart-container">
                  <Pie className="chart" data={{
                    labels: ['Attended', 'Not Attended'],
                    datasets: [{
                      data: [event.totalAttended, event.totalRSVP - event.totalAttended],
                      backgroundColor: ['#4caf50', '#f44336']
                    }]
                  }} options={chartOptions} />
                  <Bar className="chart" data={{
                    labels: ['Completed Tasks', 'In Progress Tasks', 'Pending Tasks'],
                    datasets: [{
                      data: [event.completedTasks, event.inProgressTasks, event.pendingTasks],
                      backgroundColor: ['#2196f3', '#ffc107', '#ff9800']
                    }]
                  }} options={chartOptions} />
                </div>
              </div>
            ))}
          </div>
          <button className="download-btn" onClick={downloadPDF}>Download PDF</button>
          <button className="download-btn" onClick={downloadExcel}>Download Excel</button>
        </div>
      )}
    </div>
  );
};

export default DetailedEventReport;
