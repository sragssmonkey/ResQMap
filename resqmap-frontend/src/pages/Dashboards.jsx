import React, { useCallback, useEffect, useState } from 'react';

import { Link } from 'react-router-dom';

import DashboardLayout from '../components/DashboardLayout';

import { getSavedUser } from '../services/api';

import api from '../services/api';



import * as L from 'leaflet';

import {

  MapContainer,

  TileLayer,

  Marker,

  useMapEvents,

  useMap,

} from 'react-leaflet';

import 'leaflet/dist/leaflet.css';



// ---------- Shared dashboard components ----------



function PageHeading({ eyebrow, title, description, action }) {

  return (

    <div className="page-heading">

      <div>

        <div className="eyebrow">{eyebrow}</div>

        <h1>{title}</h1>

        <p>{description}</p>

      </div>

      {action}

    </div>

  );

}



function Stat({ label, value, detail, icon }) {

  return (

    <div className="stat-card">

      <div className="stat-top">

        <span>{label}</span>

        <b>{icon}</b>

      </div>

      <strong>{value}</strong>

      <small>{detail}</small>

    </div>

  );

}



function EmptyState({ icon, title, description }) {

  return (

    <div className="empty-state">

      <div>{icon}</div>

      <strong>{title}</strong>

      <p>{description}</p>

    </div>

  );

}



function StatusBadge({ status }) {

  const colors = {

    PENDING: '#a16207',

    VERIFIED: '#15803d',

    REJECTED: '#b91c1c',

    RESOLVED: '#2563eb',

  };



  return (

    <span

      style={{

        display: 'inline-block',

        padding: '5px 10px',

        borderRadius: 20,

        fontSize: 12,

        fontWeight: 700,

        color: colors[status] || '#475569',

        background: '#f1f5f9',

      }}

    >

      {status || 'UNKNOWN'}

    </span>

  );

}



function ReportCard({ report, actions }) {

  return (

    <article className="report-card">

      <div className="report-card-top">

        <div>

          <strong>#{report.id} · {(report.incident_type || '').replaceAll('_', ' ')}</strong>

          <p>{report.reported_by_name || 'Community member'}</p>

        </div>

        <StatusBadge status={report.status} />

      </div>



      <p>{report.description}</p>



      <div className="report-details">

        <span>Severity: <strong>{report.severity}</strong></span>

        {report.location_address && <span>Location: {report.location_address}</span>}

        {report.latitude != null && report.longitude != null && (

          <span>Coordinates: {Number(report.latitude).toFixed(5)}, {Number(report.longitude).toFixed(5)}</span>

        )}

        <span>Submitted: {new Date(report.created_at).toLocaleString()}</span>

      </div>



      {actions}

    </article>

  );

}




function AIAnalysisPanel({ report }) {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function runAnalysis() {
    setLoading(true);
    setError('');
    setAnalysis(null);

    try {
      const response = await api.post('/ai/analyse/', {
        description: report.description,
      });
      setAnalysis(response.data);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        err.response?.data?.error ||
        'AI analysis could not be completed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }

  const incident = analysis?.incident_analysis;
  const severity = analysis?.severity_analysis;

  return (
    <section
      className="ai-analysis-panel"
      style={{
        marginTop: 14,
        padding: 14,
        border: '1px solid #cbdedb',
        borderRadius: 10,
        background: '#f5faf9',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <div>
          <strong>ResQ AI analysis</strong>
          <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: 12 }}>
            Prototype recommendations — responder must verify.
          </p>
        </div>
        <button
          type="button"
          className="btn"
          onClick={runAnalysis}
          disabled={loading}
        >
          {loading ? 'Analysing…' : analysis ? 'Run again' : 'Analyse report'}
        </button>
      </div>

      {error && (
        <p role="alert" style={{ color: '#b91c1c', marginBottom: 0 }}>
          {error}
        </p>
      )}

      {analysis && (
        <div style={{ marginTop: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10 }}>
            <div style={{ background: '#fff', borderRadius: 8, padding: 10 }}>
              <small style={{ color: '#64748b' }}>Predicted incident</small>
              <div style={{ fontWeight: 800, marginTop: 4 }}>
                {incident?.predicted_category || 'Unavailable'}
              </div>
              <small style={{ color: '#64748b' }}>
                Confidence: {incident?.confidence_percentage ?? '—'}%
              </small>
            </div>
            <div style={{ background: '#fff', borderRadius: 8, padding: 10 }}>
              <small style={{ color: '#64748b' }}>Suggested severity</small>
              <div style={{ fontWeight: 800, marginTop: 4, color: severity?.suggested_severity === 'CRITICAL' ? '#b91c1c' : '#334155' }}>
                {severity?.suggested_severity || 'Requires review'}
              </div>
            </div>
          </div>

          {incident?.top_predictions?.length > 0 && (
            <div style={{ marginTop: 10 }}>
              <strong style={{ fontSize: 13 }}>Other category predictions</strong>
              <ul style={{ margin: '5px 0', paddingLeft: 20 }}>
                {incident.top_predictions.map((item) => (
                  <li key={item.category}>
                    {item.category}: {(item.confidence * 100).toFixed(1)}%
                  </li>
                ))}
              </ul>
            </div>
          )}

          {severity?.matched_indicators?.length > 0 && (
            <div style={{ marginTop: 8 }}>
              <strong style={{ fontSize: 13 }}>Detected risk indicators</strong>
              <p style={{ margin: '5px 0' }}>
                {severity.matched_indicators.join(', ')}
              </p>
            </div>
          )}

          <p style={{ margin: '10px 0 0', color: '#92400e', fontSize: 12, fontWeight: 600 }}>
            AI output is advisory only. Confirm the incident category and severity using the original report and operational procedures.
          </p>
        </div>
      )}
    </section>
  );
}

function useReports() {

  const [reports, setReports] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState('');



  const refreshReports = useCallback(async () => {

    setLoading(true);

    setError('');

    try {

      const response = await api.get('/reports/');

      setReports(Array.isArray(response.data) ? response.data : response.data.results || []);

    } catch (err) {

      setError(

        err.response?.data?.detail ||

        'Unable to load reports. Please try again.'

      );

    } finally {

      setLoading(false);

    }

  }, []);



  useEffect(() => {

    refreshReports();

  }, [refreshReports]);



  return { reports, loading, error, refreshReports };

}



// ---------- Survivor dashboard ----------



export function SurvivorDashboard() {

  const user = getSavedUser();

  const { reports, loading, error } = useReports();

  const pendingCount = reports.filter((report) => report.status === 'PENDING').length;

  const verifiedCount = reports.filter((report) => report.status === 'VERIFIED').length;



  return (

    <DashboardLayout type="survivor">

      <div className="dash-content">

        <PageHeading

          eyebrow="YOUR COMMUNITY SPACE"

          title={`Good to see you, ${(user?.full_name || user?.username || 'there').split(' ')[0]}.`}

          description="Find useful local information and let response teams know what is happening around you."

          action={<Link className="btn btn-primary" to="/survivor/report">＋ Send an emergency report</Link>}

        />



        <div className="notice-banner">

          <span>♥</span>

          <div>

            <strong>Your safety comes first.</strong>

            <p>If you are in immediate danger, contact local emergency services. ResQMap helps share information; it is not a replacement for emergency services.</p>

          </div>

        </div>



        <div className="stats-grid">

          <Stat label="MY SUBMITTED REPORTS" value={loading ? '…' : reports.length} detail="Reports submitted by you" icon="⌖" />

          <Stat label="AWAITING REVIEW" value={loading ? '…' : pendingCount} detail="Reports awaiting rescue team review" icon="◉" />

          <Stat label="VERIFIED REPORTS" value={loading ? '…' : verifiedCount} detail="Reports confirmed by responders" icon="✓" />

        </div>



        <section className="panel">

          <div className="panel-heading">

            <div><h3>My submitted reports</h3><p>Track the status of your emergency reports</p></div>

            <Link to="/survivor/report">＋ New report</Link>

          </div>

          {error && <p role="alert">{error}</p>}

          {loading ? <p>Loading your reports…</p> : reports.length === 0 ? (

            <EmptyState icon="⌖" title="No reports submitted yet" description="Your emergency reports and their review status will appear here." />

          ) : (

            <div className="report-list">

              {reports.map((report) => <ReportCard key={report.id} report={report} />)}

            </div>

          )}

        </section>



        <div className="content-grid">

          <section className="panel">

            <div className="panel-heading">

              <div><h3>What is happening nearby?</h3><p>Community reports and authorised response updates</p></div>

              <Link to="/survivor/updates">See updates →</Link>

            </div>

            <EmptyState icon="◉" title="Local updates coming next" description="We'll connect this section to verified disaster updates." />

          </section>



          <section className="panel quick-panel">

            <div className="panel-heading"><div><h3>How can we help?</h3><p>Choose what you need to do</p></div></div>

            <Link className="quick-action" to="/survivor/report"><span>＋</span><div><strong>Tell us about an incident</strong><small>Report flooding, blocked roads or urgent needs</small></div><b>→</b></Link>

            <Link className="quick-action" to="/survivor/camps"><span>⌂</span><div><strong>Find help and relief</strong><small>Look for published relief camp information</small></div><b>→</b></Link>

            <Link className="quick-action" to="/survivor/updates"><span>◉</span><div><strong>Read safety updates</strong><small>Check community and rescue announcements</small></div><b>→</b></Link>

          </section>

        </div>

      </div>

    </DashboardLayout>

  );

}



// ---------- Map picker ----------



function MapClickHandler({ position, onLocationSelect }) {

  const markerIcon = L.divIcon({

    className: 'resqmap-marker',

    html: '<div style="width:22px;height:22px;background:#e45b3b;border:4px solid white;border-radius:50%;box-shadow:0 2px 8px #333"></div>',

    iconSize: [22, 22],

    iconAnchor: [11, 11],

  });



  useMapEvents({

    click(event) {

      onLocationSelect({

        latitude: event.latlng.lat,

        longitude: event.latlng.lng,

      });

    },

  });



  return position ? (

    <Marker position={[position.latitude, position.longitude]} icon={markerIcon} />

  ) : null;

}



function MapRecenter({ position }) {

  const map = useMap();



  useEffect(() => {

    if (position) {

      map.flyTo([position.latitude, position.longitude], 16);

    }

  }, [position, map]);



  return null;

}



function MapPicker({ position, onLocationSelect }) {

  const [locationError, setLocationError] = useState('');

  const [locating, setLocating] = useState(false);



  function handleUseLocation() {

    setLocationError('');



    if (!navigator.geolocation) {

      setLocationError('Your browser does not support GPS location.');

      return;

    }



    setLocating(true);

    navigator.geolocation.getCurrentPosition(

      (result) => {

        onLocationSelect({

          latitude: result.coords.latitude,

          longitude: result.coords.longitude,

        });

        setLocating(false);

      },

      (error) => {

        const messages = {

          1: 'Location permission denied. Allow location access for localhost in Chrome site settings.',

          2: 'Your device could not determine your location. Check device location services.',

          3: 'Location request timed out. Please try again.',

        };

        setLocationError(messages[error.code] || 'Unable to retrieve your location.');

        setLocating(false);

      },

      { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }

    );

  }



  return (

    <div style={{ marginTop: 12 }}>

      <strong>Select incident location</strong>

      <p style={{ color: '#64748b', fontSize: 13, marginTop: 5 }}>

        Use GPS to find your location, or click anywhere on the map to select the incident location.

      </p>



      

      <button

        type="button"

        onClick={handleUseLocation}

        disabled={locating}

        style={{

          padding: '11px 18px',

          marginBottom: 12,

          background: '#167b70',

          color: '#fff',

          border: 0,

          borderRadius: 8,

          cursor: locating ? 'wait' : 'pointer',

          fontWeight: 600,

        }}

      >

        {locating ? 'Finding location...' : 'Use my current location'}

      </button>



      {locationError && <p role="alert" style={{ color: '#b91c1c', fontSize: 13 }}>{locationError}</p>}



      <div style={{ height: 360, width: '100%', borderRadius: 12, overflow: 'hidden', border: '1px solid #dbe3e8' }}>

        <MapContainer

          center={[19.033, 73.0297]}

          zoom={11}

          scrollWheelZoom

          style={{ height: '100%', width: '100%' }}

        >

          <TileLayer

            attribution="&copy; OpenStreetMap contributors"

            url="https\://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"

          />

          <MapClickHandler position={position} onLocationSelect={onLocationSelect} />

          <MapRecenter position={position} />

        </MapContainer>

      </div>



      <div style={{ marginTop: 12, padding: 12, background: '#f0f7f6', borderRadius: 8, fontSize: 13 }}>

        {position ? (

          <>

            <strong style={{ color: '#167b70' }}>✓ Location selected</strong>

            <p>Latitude: {position.latitude.toFixed(6)}</p>

            <p>Longitude: {position.longitude.toFixed(6)}</p>

            <button type="button" onClick={() => onLocationSelect(null)}>Remove selected location</button>

          </>

        ) : (

          <span style={{ color: '#64748b' }}>No location selected. Click the map or use GPS.</span>

        )}

      </div>

    </div>

  );

}



// ---------- Survivor report submission ----------



export function SurvivorReport() {

  const [form, setForm] = useState({

    incident_type: 'FLOOD',

    description: '',

    severity: 'MEDIUM',

  });

  const [position, setPosition] = useState(null);

  const [submitting, setSubmitting] = useState(false);

  const [message, setMessage] = useState('');

  const [error, setError] = useState('');



  function handleChange(event) {

    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  }



  async function handleSubmit(event) {

    event.preventDefault();

    setMessage('');

    setError('');



    if (!position) {

      setError('Please select the incident location on the map.');

      return;

    }



    setSubmitting(true);

    try {

      const payload = {

        ...form,

        latitude: position.latitude,

        longitude: position.longitude,

      };

      const response = await api.post('/reports/', payload);



      setMessage(`Emergency report #${response.data.id} submitted successfully!`);

      setForm({ incident_type: 'FLOOD', description: '', severity: 'MEDIUM' });

      setPosition(null);

    } catch (err) {

      const data = err.response?.data;

      setError(data?.detail || (data ? JSON.stringify(data) : 'Could not submit your report.'));

    } finally {

      setSubmitting(false);

    }

  }



  return (

    <DashboardLayout type="survivor">

      <div className="dash-content">

        <PageHeading eyebrow="COMMUNITY REPORTING" title="Report an incident" description="Share accurate information and pinpoint where help is needed." />

        <section className="panel" style={{ maxWidth: 950, margin: '0 auto', padding: 28 }}>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>

            <div><h3 style={{ marginBottom: 6 }}>Incident information</h3><p style={{ color: '#64748b', fontSize: 13 }}>Tell response teams what is happening.</p></div>



            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 18 }}>

              <label className="report-field">

                Incident type

                <select name="incident_type" value={form.incident_type} onChange={handleChange} required>

                  <option value="FLOOD">Flood</option>

                  <option value="ROAD_BLOCKAGE">Road blockage</option>

                  <option value="FIRE">Fire</option>

                  <option value="MEDICAL">Medical emergency</option>

                  <option value="BUILDING_COLLAPSE">Building collapse</option>

                  <option value="LANDSLIDE">Landslide</option>

                  <option value="OTHER">Other</option>

                </select>

              </label>



              <label className="report-field">

                Severity

                <select name="severity" value={form.severity} onChange={handleChange} required>

                  <option value="LOW">Low</option>

                  <option value="MEDIUM">Medium</option>

                  <option value="HIGH">High</option>

                  <option value="CRITICAL">Critical</option>

                </select>

              </label>

            </div>



            <label className="report-field">

              Incident description

              <textarea

                name="description"

                value={form.description}

                onChange={handleChange}

                placeholder="Describe what happened, how many people may be affected, and what assistance is needed..."

                rows={5}

                required

                minLength={10}

              />

            </label>



            <MapPicker position={position} onLocationSelect={setPosition} />



            {message && <div role="status" className="report-success">{message}</div>}

            {error && <div role="alert" className="report-error">{error}</div>}



            <button type="submit" className="btn btn-primary" disabled={submitting} style={{ alignSelf: 'flex-start', padding: '13px 24px', cursor: submitting ? 'wait' : 'pointer' }}>

              {submitting ? 'Submitting report...' : 'Submit emergency report'}

            </button>

          </form>

        </section>

      </div>

    </DashboardLayout>

  );

}



// ---------- Rescue dashboard ----------




export function RescueDashboard() {
  const user = getSavedUser();

  const { reports, loading, error } = useReports();

  const [operations, setOperations] = useState([]);
  const [operationsLoading, setOperationsLoading] = useState(true);

  const pendingCount = reports.filter(
    report => report.status === 'PENDING'
  ).length;

  useEffect(() => {
    async function fetchOperations() {
      try {
        const response = await api.get('/rescue/operations/');
        setOperations(response.data);
      } catch (err) {
        console.error('Could not load rescue operations:', err);
      } finally {
        setOperationsLoading(false);
      }
    }

    fetchOperations();
  }, []);

  const activeOperations = operations.filter(
    operation => ['PLANNED', 'DISPATCHED', 'IN_PROGRESS'].includes(operation.status)
  );

  const completedOperations = operations.filter(
    operation => operation.status === 'COMPLETED'
  );

  return (
    <DashboardLayout type="rescue">
      <div className="dash-content">
        <PageHeading
          eyebrow="RESPONSE COMMAND WORKSPACE"
          title="Operations overview"
          description={`Welcome, ${user?.full_name || user?.username || 'responder'}. Review incoming information and coordinate field activity.`}
          action={
            <Link className="btn btn-primary" to="/rescue/reports">
              Open incident queue →
            </Link>
          }
        />

        <div className="notice-banner rescue-notice">
          <span>✚</span>
          <div>
            <strong>Operational information must be verified.</strong>
            <p>
              Review community-submitted reports before treating them as
              confirmed. Share only operational details approved for public release.
            </p>
          </div>
        </div>

        <div className="stats-grid">
          <Stat
            label="REPORTS AWAITING REVIEW"
            value={loading ? '…' : pendingCount}
            detail="Pending incident assessments"
            icon="⌖"
          />

          <Stat
            label="TOTAL REPORTS"
            value={loading ? '…' : reports.length}
            detail="Community reports received"
            icon="◉"
          />

          <Stat
            label="ACTIVE OPERATIONS"
            value={operationsLoading ? '…' : activeOperations.length}
            detail="Ongoing rescue missions"
            icon="✚"
          />

          <Stat
            label="COMPLETED OPERATIONS"
            value={operationsLoading ? '…' : completedOperations.length}
            detail="Completed rescue missions"
            icon="✓"
          />
        </div>

        {error && <p role="alert">{error}</p>}

        <div className="content-grid">
          <section className="panel">
            <div className="panel-heading">
              <div>
                <h3>Latest incoming reports</h3>
                <p>Review recent community submissions</p>
              </div>
              <Link to="/rescue/reports">View all →</Link>
            </div>

            {loading ? (
              <p>Loading reports…</p>
            ) : reports.length === 0 ? (
              <EmptyState
                icon="⌖"
                title="No reports received"
                description="New emergency reports will appear here."
              />
            ) : (
              <div className="report-list">
                {reports
                  .filter(report => report.status === 'PENDING')
                  .slice(0, 3)
                  .map(report => (
                    <ReportCard key={report.id} report={report} />
                  ))}
              </div>
            )}
          </section>

          <section className="panel quick-panel">
            <div className="panel-heading">
              <div>
                <h3>Operations control</h3>
                <p>Manage missions and public information</p>
              </div>
            </div>

            <Link className="quick-action" to="/rescue/reports">
              <span>⌖</span>
              <div>
                <strong>Review incident reports</strong>
                <small>Assess details and verification status</small>
              </div>
              <b>→</b>
            </Link>

            <Link className="quick-action" to="/rescue/camps">
              <span>⌂</span>
              <div>
                <strong>Manage relief locations</strong>
                <small>Publish capacity and resource availability</small>
              </div>
              <b>→</b>
            </Link>

            <Link className="quick-action" to="/rescue/movement">
              <span>✚</span>
              <div>
                <strong>Rescue operations</strong>
                <small>
                  Create missions and track response progress
                </small>
              </div>
              <b>→</b>
            </Link>
          </section>
        </div>

        <section className="panel">
          <div className="panel-heading">
            <div>
              <h3>Current rescue operations</h3>
              <p>Overview of active field missions</p>
            </div>
            <Link to="/rescue/movement">Manage operations →</Link>
          </div>

          {operationsLoading ? (
            <p>Loading operations…</p>
          ) : activeOperations.length === 0 ? (
            <EmptyState
              icon="✚"
              title="No active operations"
              description="Create a rescue operation when a response mission is ready to be coordinated."
            />
          ) : (
            <div className="report-list">
              {activeOperations.slice(0, 4).map(operation => (
                <div className="quick-action" key={operation.id}>
                  <span>✚</span>
                  <div>
                    <strong>{operation.title}</strong>
                    <small>
                      {operation.location_address} · {operation.priority} · {operation.status}
                    </small>
                  </div>
                  <b>#{operation.id}</b>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="panel">
          <div className="panel-heading">
            <div>
              <h3>Public relief communication</h3>
              <p>Keep survivors informed with verified updates</p>
            </div>
            <Link to="/rescue/movement">Publish update →</Link>
          </div>
          <p>
            Publish emergency alerts, relief availability, road information
            and safety advisories for survivors.
          </p>
        </section>
      </div>
    </DashboardLayout>
  );
}




// ---------- Rescue incident queue ----------



export function RescueReports() {

  const { reports, loading, error, refreshReports } = useReports();

  const [actionError, setActionError] = useState('');

  const [updatingId, setUpdatingId] = useState(null);



  async function reviewReport(id, status) {

    setUpdatingId(id);

    setActionError('');

    try {

      await api.patch(`/reports/${id}/review/`, { status });

      await refreshReports();

    } catch (err) {

      setActionError(err.response?.data?.detail || JSON.stringify(err.response?.data || 'Could not update report.'));

    } finally {

      setUpdatingId(null);

    }

  }



  return (

    <DashboardLayout type="rescue">

      <div className="dash-content">

        <PageHeading

          eyebrow="INCIDENT MANAGEMENT"

          title="Incident reports"

          description="Review community-submitted reports and their verification status."

          action={<button type="button" className="btn btn-primary" onClick={refreshReports}>Refresh queue</button>}

        />



        {error && <p role="alert">{error}</p>}

        {actionError && <p role="alert">{actionError}</p>}



        <section className="panel">

          <div className="panel-heading">

            <div><h3>Community incident reports</h3><p>{reports.length} report(s) received</p></div>

          </div>

          {loading ? <p>Loading reports…</p> : reports.length === 0 ? (

            <EmptyState icon="⌖" title="No reports received" description="Survivor-submitted emergency reports will appear here." />

          ) : (

            <div className="report-list">

              {reports.map((report) => (

                <ReportCard

                  key={report.id}

                  report={report}

                  actions={
                    <>
                      <AIAnalysisPanel report={report} />
                      {report.status === 'PENDING' ? (
                        <div className="report-actions">
                          <button type="button" className="btn btn-primary" disabled={updatingId === report.id} onClick={() => reviewReport(report.id, 'VERIFIED')}>
                            {updatingId === report.id ? 'Updating…' : 'Verify'}
                          </button>
                          <button type="button" className="btn" disabled={updatingId === report.id} onClick={() => reviewReport(report.id, 'REJECTED')}>Reject</button>
                        </div>
                      ) : report.status === 'VERIFIED' ? (
                        <div className="report-actions">
                          <button type="button" className="btn" disabled={updatingId === report.id} onClick={() => reviewReport(report.id, 'RESOLVED')}>Mark resolved</button>
                        </div>
                      ) : null}
                    </>
                  }
                />

              ))}

            </div>

          )}

        </section>

      </div>

    </DashboardLayout>

  );

}



// ---------- Other pages ----------




export function SurvivorUpdates() {
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [category, setCategory] = useState('ALL');

  async function fetchUpdates() {
    try {
      setLoading(true);
      setError('');

      const response = await api.get('/rescue/updates/');
      setUpdates(response.data);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        'Unable to load relief updates. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUpdates();
  }, []);

  const categories = [
    'ALL',
    'EMERGENCY',
    'RELIEF_CAMP',
    'FOOD_WATER',
    'ROAD',
    'WEATHER',
    'RESCUE',
    'GENERAL'
  ];

  const categoryLabels = {
    EMERGENCY: 'Emergency Alert',
    RELIEF_CAMP: 'Relief Camp',
    FOOD_WATER: 'Food and Water',
    ROAD: 'Road and Accessibility',
    WEATHER: 'Weather and Safety',
    RESCUE: 'Rescue Progress',
    GENERAL: 'General Update'
  };

  const filteredUpdates = category === 'ALL'
    ? updates
    : updates.filter(update => update.category === category);

  return (
    <DashboardLayout type="survivor">
      <div className="dash-content">
        <PageHeading
          eyebrow="SITUATIONAL AWARENESS"
          title="Disaster updates"
          description="Verified information and relief announcements published by authorised response teams."
          action={
            <button
              className="btn btn-primary"
              type="button"
              onClick={fetchUpdates}
              disabled={loading}
            >
              {loading ? 'Refreshing…' : 'Refresh updates'}
            </button>
          }
        />

        <div className="notice-banner">
          <span>✓</span>
          <div>
            <strong>Information from response teams</strong>
            <p>
              These updates are published by authorised rescue teams.
              Follow official instructions and seek emergency assistance
              when necessary.
            </p>
          </div>
        </div>

        <section className="panel">
          <div className="panel-heading">
            <div>
              <h3>Relief and safety announcements</h3>
              <p>{updates.length} published update(s)</p>
            </div>
          </div>

          <div className="update-filters">
            {categories.map(item => (
              <button
                key={item}
                type="button"
                className={`update-filter ${category === item ? 'active' : ''}`}
                onClick={() => setCategory(item)}
              >
                {item === 'ALL' ? 'All updates' : categoryLabels[item]}
              </button>
            ))}
          </div>

          {error && (
            <div className="notice-banner rescue-notice" role="alert">
              {error}
            </div>
          )}

          {loading ? (
            <p>Loading relief updates…</p>
          ) : filteredUpdates.length === 0 ? (
            <EmptyState
              icon="◉"
              title="No updates available"
              description={
                category === 'ALL'
                  ? 'New announcements from rescue teams will appear here.'
                  : 'There are currently no updates in this category.'
              }
            />
          ) : (
            <div className="relief-update-list">
              {filteredUpdates.map(update => (
                <article className="relief-update-card" key={update.id}>
                  <div className="relief-update-top">
                    <span className={`update-category category-${update.category?.toLowerCase()}`}>
                      {categoryLabels[update.category] || update.category}
                    </span>

                    <span className="update-published">
                      {update.published_at
                        ? new Date(update.published_at).toLocaleString()
                        : 'Published'}
                    </span>
                  </div>

                  <h3>{update.title}</h3>

                  <p className="relief-update-message">
                    {update.message}
                  </p>

                  {update.location_address && (
                    <p className="relief-update-location">
                      <strong>Location:</strong> {update.location_address}
                    </p>
                  )}

                  <div className="relief-update-footer">
                    <span>
                      Published by: {update.published_by_name || 'Rescue team'}
                    </span>

                    {update.operation && (
                      <span>Operation #{update.operation}</span>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </DashboardLayout>
  );
}



export function SurvivorCamps() {

  return (

    <DashboardLayout type="survivor">

      <div className="dash-content">

        <PageHeading eyebrow="ASSISTANCE LOCATIONS" title="Relief camps" description="Find information about relief and assistance locations." />

        <div className="panel">

          <EmptyState icon="⌂" title="No relief camp data yet" description="Published relief camp locations and availability will appear here when the rescue operations API is ready." />

        </div>

      </div>

    </DashboardLayout>

  );

}



export function RescueCamps() {

  return (

    <DashboardLayout type="rescue">

      <div className="dash-content">

        <PageHeading eyebrow="RESOURCE COORDINATION" title="Relief camps" description="Manage camp locations, capacity and resource availability." />

        <div className="panel">

          <EmptyState icon="⌂" title="Camp management is coming next" description="We'll connect this interface to the ReliefCamp model." />

        </div>

      </div>

    </DashboardLayout>

  );

}




export function RescueMovement() {
  const [operations, setOperations] = useState([]);
  const [verifiedReports, setVerifiedReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  const [operationForm, setOperationForm] = useState({
    title: '',
    description: '',
    related_report: '',
    priority: 'MEDIUM',
    location_address: '',
    latitude: '',
    longitude: '',
    team_remarks: ''
  });

  const [updateForm, setUpdateForm] = useState({
    title: '',
    message: '',
    category: 'GENERAL',
    location_address: '',
    operation: ''
  });

  const [remarks, setRemarks] = useState({});
  const [statusChanges, setStatusChanges] = useState({});

  async function loadData() {
    try {
      setLoading(true);
      setError('');

      const [operationResponse, reportResponse] = await Promise.all([
        api.get('/rescue/operations/'),
        api.get('/reports/')
      ]);

      setOperations(operationResponse.data);
      setVerifiedReports(
        reportResponse.data.filter(report => report.status === 'VERIFIED')
      );
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        'Could not load rescue operations. Please refresh the page.'
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const activeOperations = operations.filter(operation =>
    ['PLANNED', 'DISPATCHED', 'IN_PROGRESS'].includes(operation.status)
  );

  const completedOperations = operations.filter(
    operation => operation.status === 'COMPLETED'
  );

  function updateOperationField(event) {
    const { name, value } = event.target;

    setOperationForm(previous => ({
      ...previous,
      [name]: value
    }));
  }

  function updateReliefField(event) {
    const { name, value } = event.target;

    setUpdateForm(previous => ({
      ...previous,
      [name]: value
    }));
  }

  function handleReportSelection(event) {
    const reportId = event.target.value;

    const selectedReport = verifiedReports.find(
      report => String(report.id) === reportId
    );

    setOperationForm(previous => ({
      ...previous,
      related_report: reportId,
      location_address: selectedReport?.location_address || previous.location_address,
      latitude: selectedReport?.latitude ?? previous.latitude,
      longitude: selectedReport?.longitude ?? previous.longitude,
      title: previous.title || (
        selectedReport
          ? `${selectedReport.incident_type} response - Report #${selectedReport.id}`
          : ''
      )
    }));
  }

  async function createOperation(event) {
    event.preventDefault();

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const payload = {
        ...operationForm,
        related_report: operationForm.related_report || null,
        latitude: operationForm.latitude === '' ? null : operationForm.latitude,
        longitude: operationForm.longitude === '' ? null : operationForm.longitude
      };

      await api.post('/rescue/operations/', payload);

      setOperationForm({
        title: '',
        description: '',
        related_report: '',
        priority: 'MEDIUM',
        location_address: '',
        latitude: '',
        longitude: '',
        team_remarks: ''
      });

      setSuccess('Rescue operation created successfully.');
      await loadData();
    } catch (err) {
      setError(
        JSON.stringify(
          err.response?.data || 'Could not create rescue operation.'
        )
      );
    } finally {
      setSaving(false);
    }
  }

  async function updateOperation(operation) {
    const newStatus = statusChanges[operation.id] || operation.status;
    const newRemarks = remarks[operation.id] ?? operation.team_remarks;

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      await api.patch(`/rescue/operations/${operation.id}/`, {
        status: newStatus,
        team_remarks: newRemarks
      });

      setSuccess(`Operation #${operation.id} updated successfully.`);
      await loadData();
    } catch (err) {
      setError(
        JSON.stringify(
          err.response?.data || 'Could not update operation.'
        )
      );
    } finally {
      setSaving(false);
    }
  }

  async function publishReliefUpdate(event) {
    event.preventDefault();

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const payload = {
        ...updateForm,
        operation: updateForm.operation || null,
        is_published: true
      };

      await api.post('/rescue/updates/', payload);

      setUpdateForm({
        title: '',
        message: '',
        category: 'GENERAL',
        location_address: '',
        operation: ''
      });

      setSuccess(
        'Relief update published. Survivors can now see this announcement.'
      );
    } catch (err) {
      setError(
        JSON.stringify(
          err.response?.data || 'Could not publish relief update.'
        )
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <DashboardLayout type="rescue">
      <div className="dash-content">

        <PageHeading
          eyebrow="FIELD COORDINATION"
          title="Rescue operations"
          description="Create missions, coordinate field activity and publish verified public relief information."
          action={
            <button
              type="button"
              className="btn btn-primary"
              onClick={loadData}
              disabled={loading}
            >
              {loading ? 'Refreshing…' : 'Refresh operations'}
            </button>
          }
        />

        {error && (
          <div className="notice-banner rescue-notice" role="alert">
            <span>!</span>
            <div>{error}</div>
          </div>
        )}

        {success && (
          <div className="notice-banner" role="status">
            <span>✓</span>
            <div>{success}</div>
          </div>
        )}

        {/* OPERATION STATISTICS */}

        <div className="stats-grid">
          <Stat
            label="TOTAL OPERATIONS"
            value={loading ? '…' : operations.length}
            detail="All recorded missions"
            icon="✚"
          />

          <Stat
            label="ACTIVE OPERATIONS"
            value={loading ? '…' : activeOperations.length}
            detail="Planned and ongoing missions"
            icon="⇢"
          />

          <Stat
            label="COMPLETED"
            value={loading ? '…' : completedOperations.length}
            detail="Successfully completed missions"
            icon="✓"
          />

          <Stat
            label="VERIFIED REPORTS"
            value={verifiedReports.length}
            detail="Available to link to missions"
            icon="⌖"
          />
        </div>

        {/* CREATE OPERATION */}

        <section className="panel rescue-form-panel">
          <div className="panel-heading">
            <div>
              <h3>Create a rescue operation</h3>
              <p>
                Record a new field mission and assign its priority.
              </p>
            </div>
          </div>

          <form onSubmit={createOperation} className="rescue-form">

            <div className="rescue-form-grid">
              <label>
                Operation title *
                <input
                  name="title"
                  value={operationForm.title}
                  onChange={updateOperationField}
                  placeholder="e.g. Flood rescue - Panvel"
                  required
                />
              </label>

              <label>
                Link verified incident report
                <select
                  value={operationForm.related_report}
                  onChange={handleReportSelection}
                >
                  <option value="">No linked report</option>
                  {verifiedReports.map(report => (
                    <option key={report.id} value={report.id}>
                      Report #{report.id} - {report.incident_type}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Priority *
                <select
                  name="priority"
                  value={operationForm.priority}
                  onChange={updateOperationField}
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </label>

              <label>
                Location *
                <input
                  name="location_address"
                  value={operationForm.location_address}
                  onChange={updateOperationField}
                  placeholder="Enter incident location"
                  required
                />
              </label>

              <label>
                Latitude
                <input
                  type="number"
                  step="any"
                  name="latitude"
                  value={operationForm.latitude}
                  onChange={updateOperationField}
                  placeholder="Latitude"
                />
              </label>

              <label>
                Longitude
                <input
                  type="number"
                  step="any"
                  name="longitude"
                  value={operationForm.longitude}
                  onChange={updateOperationField}
                  placeholder="Longitude"
                />
              </label>
            </div>

            <label>
              Operation description *
              <textarea
                name="description"
                value={operationForm.description}
                onChange={updateOperationField}
                placeholder="Describe the mission, objectives and required response..."
                rows={4}
                required
              />
            </label>

            <label>
              Initial team remarks
              <textarea
                name="team_remarks"
                value={operationForm.team_remarks}
                onChange={updateOperationField}
                placeholder="Add initial deployment instructions or remarks..."
                rows={2}
              />
            </label>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
            >
              {saving ? 'Creating…' : '+ Create rescue operation'}
            </button>
          </form>
        </section>

        {/* ACTIVE OPERATIONS */}

        <section className="panel">
          <div className="panel-heading">
            <div>
              <h3>Active field operations</h3>
              <p>Monitor and update ongoing rescue missions.</p>
            </div>
          </div>

          {loading ? (
            <p>Loading operations…</p>
          ) : activeOperations.length === 0 ? (
            <EmptyState
              icon="⇢"
              title="No active operations"
              description="Create a rescue operation to start coordinating a field mission."
            />
          ) : (
            <div className="rescue-operation-list">
              {activeOperations.map(operation => (
                <article
                  className="rescue-operation-card"
                  key={operation.id}
                >
                  <div className="rescue-operation-header">
                    <div>
                      <span className="rescue-operation-id">
                        OPERATION #{operation.id}
                      </span>
                      <h3>{operation.title}</h3>
                    </div>

                    <span className={`operation-priority priority-${operation.priority.toLowerCase()}`}>
                      {operation.priority}
                    </span>
                  </div>

                  <p>{operation.description}</p>

                  <div className="operation-details">
                    <span>
                      <strong>Location:</strong> {operation.location_address}
                    </span>
                    <span>
                      <strong>Status:</strong> {operation.status.replace('_', ' ')}
                    </span>
                    {operation.related_report && (
                      <span>
                        <strong>Linked report:</strong> #{operation.related_report}
                      </span>
                    )}
                  </div>

                  <label>
                    Update operation status
                    <select
                      value={statusChanges[operation.id] || operation.status}
                      onChange={event =>
                        setStatusChanges(previous => ({
                          ...previous,
                          [operation.id]: event.target.value
                        }))
                      }
                    >
                      <option value="PLANNED">Planned</option>
                      <option value="DISPATCHED">Dispatched</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </label>

                  <label>
                    Field progress remarks
                    <textarea
                      rows={2}
                      value={
                        remarks[operation.id] ?? operation.team_remarks ?? ''
                      }
                      onChange={event =>
                        setRemarks(previous => ({
                          ...previous,
                          [operation.id]: event.target.value
                        }))
                      }
                      placeholder="Record current progress..."
                    />
                  </label>

                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={saving}
                    onClick={() => updateOperation(operation)}
                  >
                    Save operation update
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* COMPLETED OPERATIONS */}

        <section className="panel">
          <div className="panel-heading">
            <div>
              <h3>Completed operations</h3>
              <p>Previously completed rescue missions.</p>
            </div>
          </div>

          {completedOperations.length === 0 ? (
            <EmptyState
              icon="✓"
              title="No completed operations yet"
              description="Completed missions will appear here."
            />
          ) : (
            <div className="rescue-operation-list">
              {completedOperations.map(operation => (
                <article
                  className="rescue-operation-card"
                  key={operation.id}
                >
                  <div className="rescue-operation-header">
                    <h3>{operation.title}</h3>
                    <span className="operation-completed">
                      COMPLETED
                    </span>
                  </div>
                  <p>{operation.location_address}</p>
                  <small>
                    {operation.completed_at
                      ? new Date(operation.completed_at).toLocaleString()
                      : 'Completion time unavailable'}
                  </small>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* PUBLISH RELIEF UPDATE */}

        <section className="panel rescue-form-panel">
          <div className="panel-heading">
            <div>
              <h3>Publish a relief update</h3>
              <p>
                Send an announcement to the survivor disaster updates feed.
              </p>
            </div>
          </div>

          <form onSubmit={publishReliefUpdate} className="rescue-form">

            <label>
              Update title *
              <input
                name="title"
                value={updateForm.title}
                onChange={updateReliefField}
                placeholder="e.g. Relief camp opened in Panvel"
                required
              />
            </label>

            <label>
              Update category *
              <select
                name="category"
                value={updateForm.category}
                onChange={updateReliefField}
              >
                <option value="EMERGENCY">Emergency Alert</option>
                <option value="RELIEF_CAMP">Relief Camp</option>
                <option value="FOOD_WATER">Food and Water</option>
                <option value="ROAD">Road and Accessibility</option>
                <option value="WEATHER">Weather and Safety</option>
                <option value="RESCUE">Rescue Progress</option>
                <option value="GENERAL">General Update</option>
              </select>
            </label>

            <label>
              Link rescue operation (optional)
              <select
                name="operation"
                value={updateForm.operation}
                onChange={updateReliefField}
              >
                <option value="">No linked operation</option>
                {operations.map(operation => (
                  <option key={operation.id} value={operation.id}>
                    #{operation.id} - {operation.title}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Location
              <input
                name="location_address"
                value={updateForm.location_address}
                onChange={updateReliefField}
                placeholder="Enter relevant location"
              />
            </label>

            <label>
              Announcement message *
              <textarea
                name="message"
                rows={5}
                value={updateForm.message}
                onChange={updateReliefField}
                placeholder="Write the information that survivors need to know..."
                required
              />
            </label>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
            >
              {saving ? 'Publishing…' : 'Publish relief update →'}
            </button>
          </form>
        </section>

      </div>
    </DashboardLayout>
  );
}
