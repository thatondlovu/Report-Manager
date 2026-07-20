import React, { useState, useEffect } from 'react';
import { reportService } from '../services/api';
import './ReportForm.css';

const ReportForm = ({ user, reportId, onBack }) => {
  const [formData, setFormData] = useState({
    weekNumber: '',
    startDate: '',
    endDate: '',
    mondayText: '',
    tuesdayText: '',
    wednesdayText: '',
    thursdayText: '',
    fridayText: '',
    challenges: '',
    status: 'DRAFT',
  });

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (reportId) {
      const loadReport = async () => {
        try {
          const report = await reportService.getReportById(reportId);
          setFormData({
            ...report,
            weekNumber: report.weekNumber || '',
            startDate: report.startDate || '',
            endDate: report.endDate || '',
          });
        } catch (err) {
          console.error(err);
        }
      };
      loadReport();
    }
  }, [reportId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (statusType) => {
    if (!formData.weekNumber || !formData.startDate || !formData.endDate) {
      setMsg('Fill required fields.');
      return;
    }

    setLoading(true);
    const payload = { ...formData, status: statusType, user: { id: user.id } };

    try {
      await reportService.saveReport(payload);
      setMsg(`Saved as ${statusType}`);
      setTimeout(() => onBack(), 1000);
    } catch (err) {
      setMsg('Save failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={onBack}>← Back</button>
      <h2>{reportId ? 'Edit Report' : 'New Report'}</h2>
      
      {msg && <p>{msg}</p>}

      <form onSubmit={(e) => e.preventDefault()}>
        <div>
          <label>Week Number: </label>
          <input type="number" name="weekNumber" value={formData.weekNumber} onChange={handleChange} />
        </div>
        <div>
          <label>Start Date: </label>
          <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} />
        </div>
        <div>
          <label>End Date: </label>
          <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} />
        </div>

        {['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].map((day) => (
          <div key={day} style={{ marginTop: '10px' }}>
            <label>{day.toUpperCase()} Log:</label><br />
            <textarea name={`${day}Text`} value={formData[`${day}Text`]} onChange={handleChange} rows="3" cols="50" />
          </div>
        ))}

        <div style={{ marginTop: '10px' }}>
          <label>Challenges:</label><br />
          <textarea name="challenges" value={formData.challenges} onChange={handleChange} rows="3" cols="50" />
        </div>

        <div style={{ marginTop: '15px' }}>
          <button onClick={() => handleSave('DRAFT')} disabled={loading}>Save Draft</button>
          <button onClick={() => handleSave('SUBMITTED')} disabled={loading}>Final Submit</button>
        </div>
      </form>
    </div>
  );
};

export default ReportForm;