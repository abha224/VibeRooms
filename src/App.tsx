import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import EntryPrompt from './components/EntryPrompt';
import Room from './components/Room';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<EntryPrompt />} />
        <Route path="/rooms/:slug" element={<Room />} />
      </Routes>
    </Router>
  );
}
