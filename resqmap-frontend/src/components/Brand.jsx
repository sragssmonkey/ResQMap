import React from 'react';
import { Link } from 'react-router-dom';

export default function Brand({ light = false }) {
  return <Link className={`brand ${light ? 'brand-light' : ''}`} to="/" aria-label="ResQMap home">
    <span className="brand-mark">R<span>Q</span></span>
    <span>ResQMap</span>
  </Link>;
}
