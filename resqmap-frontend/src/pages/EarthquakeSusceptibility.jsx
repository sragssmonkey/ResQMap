import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  MapContainer,
  TileLayer,
  GeoJSON,
  useMap
} from 'react-leaflet';
import L from 'leaflet';

import 'leaflet/dist/leaflet.css';
import './EarthquakeSusceptibility.css';

import api from '../services/api';

const API_ENDPOINT = '/ai/earthquake-susceptibility/';

function getCellColor(percentile) {
  if (percentile >= 80) return '#b91c1c';
  if (percentile >= 60) return '#ea580c';
  if (percentile >= 40) return '#eab308';
  if (percentile >= 20) return '#65a30d';
  return '#15803d';
}

function MapBounds({ data }) {
  const map = useMap();

  useEffect(() => {
    if (!data?.features?.length) return;

    const bounds = L.geoJSON(data).getBounds();

    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [data, map]);

  return null;
}

function createPopup(feature, layer) {
  const properties = feature.properties || {};

  const cellId = properties.cell_id ?? 'N/A';
  const score = Number(properties.model_score);
  const percentile = Number(properties.susceptibility_percentile);

  const scoreText = Number.isFinite(score)
    ? score.toFixed(4)
    : 'N/A';

  const percentileText = Number.isFinite(percentile)
    ? `${percentile.toFixed(1)}th percentile`
    : 'N/A';

  layer.bindPopup(`
    <div class="earthquake-popup">
      <h3>Earthquake Susceptibility</h3>
      <p><strong>Grid cell:</strong> ${cellId}</p>
      <p><strong>Model score:</strong> ${scoreText}</p>
      <p><strong>Relative percentile:</strong> ${percentileText}</p>
    </div>
  `);
}

export default function EarthquakeSusceptibility() {
  const [geoData, setGeoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function fetchEarthquakeData() {
      try {
        setLoading(true);
        setError('');

        const response = await api.get(API_ENDPOINT);

        if (isMounted) {
          setGeoData(response.data);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err.response?.data?.detail ||
            'Unable to load earthquake susceptibility data. Please try again.'
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchEarthquakeData();

    return () => {
      isMounted = false;
    };
  }, []);

  const cellStyle = (feature) => {
    const percentile = Number(
      feature.properties?.susceptibility_percentile ?? 0
    );

    return {
      fillColor: getCellColor(percentile),
      fillOpacity: 0.65,
      color: '#334155',
      weight: 0.5
    };
  };

  return (
    <div className="earthquake-page">
      <header className="earthquake-header">
        <div>
          <p className="earthquake-eyebrow">RESQMAP / RISK INTELLIGENCE</p>
          <h1>Earthquake Susceptibility Map</h1>
          <p className="earthquake-subtitle">
            Explore geographical patterns of historical earthquake
            activity using our experimental machine learning model.
          </p>
        </div>

        <Link to="/" className="earthquake-back-link">
          Back to Home
        </Link>
      </header>

      <section className="earthquake-info">
        <div>
          <span className="info-label">Mapped grid cells</span>
          <strong>{geoData?.features?.length ?? '—'}</strong>
        </div>

        <div>
          <span className="info-label">Prediction year</span>
          <strong>2025</strong>
        </div>

        <div>
          <span className="info-label">Grid resolution</span>
          <strong>0.5° × 0.5°</strong>
        </div>
      </section>

      <section className="earthquake-map-section">
        <div className="map-heading">
          <div>
            <h2>India — Earthquake Susceptibility</h2>
            <p>Click a grid cell to inspect its model score.</p>
          </div>

          <span className="map-status">
            {loading ? 'Loading map...' : error ? 'Unavailable' : 'Map data loaded'}
          </span>
        </div>

        {loading && (
          <div className="earthquake-message">
            Loading earthquake susceptibility data...
          </div>
        )}

        {error && (
          <div className="earthquake-error">
            {error}
          </div>
        )}

        {!loading && !error && geoData && (
          <MapContainer
            center={[22.5, 79]}
            zoom={5}
            scrollWheelZoom={true}
            className="earthquake-leaflet-map"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <MapBounds data={geoData} />

            <GeoJSON
              key="earthquake-susceptibility-layer"
              data={geoData}
              style={cellStyle}
              onEachFeature={createPopup}
            />
          </MapContainer>
        )}

        <div className="earthquake-legend">
          <h3>Relative susceptibility percentile</h3>

          {[
            ['#15803d', '0–20', 'Very low relative ranking'],
            ['#65a30d', '20–40', 'Low relative ranking'],
            ['#eab308', '40–60', 'Moderate relative ranking'],
            ['#ea580c', '60–80', 'High relative ranking'],
            ['#b91c1c', '80–100', 'Very high relative ranking']
          ].map(([color, range, label]) => (
            <div className="legend-item" key={range}>
              <span
                className="legend-color"
                style={{ backgroundColor: color }}
              />
              <strong>{range}</strong>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="earthquake-disclaimer">
        <h3>Important model limitations</h3>
        <p>
          These scores represent experimental relative susceptibility
          rankings based on historical earthquake catalogue patterns.
          They are not probabilities of an earthquake occurring and
          cannot predict the exact location or time of a future earthquake.
          This layer does not yet incorporate population exposure or
          infrastructure vulnerability.
        </p>
      </section>
    </div>
  );
}