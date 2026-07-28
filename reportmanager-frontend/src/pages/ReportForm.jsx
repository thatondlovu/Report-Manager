import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { reportService } from '../services/api';
import './ReportForm.css';

const isDayInRange = (dayName, startDateStr, endDateStr) => {
  if (!startDateStr || !endDateStr) return false;

  const start = new Date(startDateStr);
  const end = new Date(endDateStr);

  if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) return false;

  const dayMap = { monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5 };
  const targetDay = dayMap[dayName.toLowerCase()];

  let current = new Date(start);
  while (current <= end) {
    if (current.getDay() === targetDay) {
      return true;
    }
    current.setDate(current.getDate() + 1);
  }
  return false;
};

const getTodayString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};


const isDateRangeOverlapping = (newStart, newEnd, existingStart, existingEnd) => {
  if (!newStart || !newEnd || !existingStart || !existingEnd) return false;
  
  const startA = new Date(newStart);
  const endA = new Date(newEnd);
  const startB = new Date(existingStart);
  const endB = new Date(existingEnd);

  return startA <= endB && endA >= startB;
};

const ReportForm = ({ user }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const reportId = id;

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
  const [errors, setErrors] = useState({});

  const fieldRefs = useRef({});

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
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const scrollToFirstError = (newErrors) => {
    const firstErrorKey = Object.keys(newErrors)[0];
    if (firstErrorKey && fieldRefs.current[firstErrorKey]) {
      fieldRefs.current[firstErrorKey].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleSave = async (statusType) => {
    setMsg('');
    const newErrors = {};
    const todayStr = getTodayString();

    if (!formData.weekNumber) newErrors.weekNumber = 'Week Number is required.';
    if (!formData.startDate) newErrors.startDate = 'Start Date is required.';
    if (!formData.endDate) newErrors.endDate = 'End Date is required.';

    if (formData.startDate && formData.startDate > todayStr) {
      newErrors.startDate = 'Start Date cannot be in the future.';
    }

    if (formData.startDate && formData.endDate && new Date(formData.startDate) > new Date(formData.endDate)) {
      newErrors.endDate = 'End Date cannot be earlier than Start Date.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      scrollToFirstError(newErrors);
      return;
    }

    setLoading(true);

    try {

      const existingReports = await reportService.getReportsByUser(user.id);
      
      const duplicateRangeReport = existingReports.find((rep) => {
        const isDifferentReport = reportId ? String(rep.id) !== String(reportId) : true;
        if (!isDifferentReport) return false;

        return isDateRangeOverlapping(
          formData.startDate,
          formData.endDate,
          rep.startDate,
          rep.endDate
        );
      });

      if (duplicateRangeReport) {
        newErrors.startDate = `You have already filled in a report for the selected date/(s).`;
        newErrors.endDate = 'Please choose a date range outside existing reports.';
        setErrors(newErrors);
        scrollToFirstError(newErrors);
        setLoading(false);
        return;
      }

      const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];

      if (statusType === 'SUBMITTED') {
        for (const day of days) {
          const isEnabled = isDayInRange(day, formData.startDate, formData.endDate);
          const textValue = formData[`${day}Text`]?.trim();

          if (isEnabled && !textValue) {
            newErrors[`${day}Text`] = `Please write an activity log for ${day.toUpperCase()} before submitting.`;
          }
        }

        if (Object.keys(newErrors).length > 0) {
          setErrors(newErrors);
          scrollToFirstError(newErrors);
          setLoading(false);
          return;
        }
      }

      const cleanedFormData = { ...formData };
      days.forEach((day) => {
        if (!isDayInRange(day, formData.startDate, formData.endDate)) {
          cleanedFormData[`${day}Text`] = '';
        }
      });

      const payload = { ...cleanedFormData, status: statusType, user: { id: user.id } };

      await reportService.saveReport(payload);
      setMsg(`Successfully saved as ${statusType === 'DRAFT' ? 'Draft' : 'Submitted'}`);
      setTimeout(() => navigate('/dashboard'), 1000);
    } catch (err) {
      setMsg('Save failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="report-form-container">
      <button className="back-btn" onClick={() => navigate('/dashboard')}>
        ⬅ Back
      </button>

      <h2 className="report-form-title">{reportId ? 'Edit Weekly Report' : 'Create Weekly Report'}</h2>

      {msg && (
        <div className={`alert-msg ${msg.includes('Successfully') ? 'success' : 'error'}`}>
          {msg}
        </div>
      )}

      <form onSubmit={(e) => e.preventDefault()}>
        <div className="form-section-dates">
          <div className="form-group" ref={(el) => (fieldRefs.current.weekNumber = el)}>
            <label>Week Number</label>
            <input
              type="number"
              name="weekNumber"
              value={formData.weekNumber}
              onChange={handleChange}
              placeholder="e.g. 1"
              className={errors.weekNumber ? 'input-error' : ''}
            />
            {errors.weekNumber && <span className="inline-error">{errors.weekNumber}</span>}
          </div>

          <div className="form-group" ref={(el) => (fieldRefs.current.startDate = el)}>
            <label>Start Date</label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              max={getTodayString()}
              className={errors.startDate ? 'input-error' : ''}
            />
            {errors.startDate && <span className="inline-error">{errors.startDate}</span>}
          </div>

          <div className="form-group" ref={(el) => (fieldRefs.current.endDate = el)}>
            <label>End Date</label>
            <input
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              className={errors.endDate ? 'input-error' : ''}
            />
            {errors.endDate && <span className="inline-error">{errors.endDate}</span>}
          </div>
        </div>

        <h3 className="logs-header">Daily Activity Logs</h3>

        {['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].map((day) => {
          const enabled = isDayInRange(day, formData.startDate, formData.endDate);
          const fieldName = `${day}Text`;
          const hasError = !!errors[fieldName];

          return (
            <div
              key={day}
              ref={(el) => (fieldRefs.current[fieldName] = el)}
              className={`day-log-box ${enabled ? 'enabled' : 'disabled'} ${hasError ? 'box-error' : ''}`}
            >
              <div className="day-label">
                <span>{day.toUpperCase()} LOG</span>
                {enabled ? (
                  <span className="badge-required">Required for submit</span>
                ) : (
                  <span className="badge-disabled">(Outside selected date range)</span>
                )}
              </div>
              <textarea
                className={`form-textarea ${hasError ? 'input-error' : ''}`}
                name={fieldName}
                value={enabled ? formData[fieldName] || '' : ''}
                onChange={handleChange}
                disabled={!enabled}
                rows="3"
                placeholder={enabled ? `Enter activities for ${day}` : `Disabled (${day.toUpperCase()} is not a selected date)`}
              />
              {hasError && <span className="inline-error">{errors[fieldName]}</span>}
            </div>
          );
        })}

        <div className="challenges-box form-group">
          <label>Challenges Faced</label>
          <textarea
            className="form-textarea"
            name="challenges"
            value={formData.challenges}
            onChange={handleChange}
            placeholder="Describe any challenges faced this week"
            rows="3"
          />
        </div>

        <div className="form-actions">
          <button type="button" className="btn-draft" onClick={() => handleSave('DRAFT')} disabled={loading}>
            Save Draft
          </button>
          <button type="button" className="btn-submit" onClick={() => handleSave('SUBMITTED')} disabled={loading}>
            Final Submit
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReportForm;