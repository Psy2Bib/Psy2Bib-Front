import React from 'react';
export default function Footer(){
  return (
    <footer className='py-4 text-center'>
      <small className='text-muted'>© {new Date().getFullYear()} Psy2Bib — Test local sans backend</small>
    </footer>
  );
}