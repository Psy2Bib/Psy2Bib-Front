import React from 'react';
import AppRouter from './router';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
export default function App() {
  return (
    <>
      <Navbar />
      <AppRouter />
      <Footer />
    </>
  );
}