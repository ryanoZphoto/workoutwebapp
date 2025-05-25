import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import jsPDF from 'jspdf';

export default function ArchiveManager() {
  const { weeklyData, setWeeklyData } = useContext(AppContext);
  const [locked, setLocked] = useState(true);
  const archive = JSON.parse(localStorage.getItem('fitnessArchive')) || [];

  const handleExport = () => {
    const entry = {
      ...weeklyData,
      timestamp: new Date().toISOString(),
    };

    const updated = [...archive, entry];
    localStorage.setItem('fitnessArchive', JSON.stringify(updated));

    const cleared = { workouts: {}, meals: {}, hydration: 0 };
    setWeeklyData(cleared);
    localStorage.setItem('weeklyData', JSON.stringify(cleared));

    alert('Week exported and cleared.');
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    let y = 10;

    archive.forEach((entry, i) => {
      doc.setFontSize(12);
      doc.text(`Week ${i + 1} — ${new Date(entry.timestamp).toLocaleDateString()}`, 10, y);
      y += 7;

      doc.setFontSize(10);
      doc.text(`Hydration: ${entry.hydration || 0} cups`, 10, y);
      y += 6;

      doc.text('Meals:', 10, y);
      y += 6;
      Object.entries(entry.meals || {}).forEach(([key, val]) => {
        doc.text(`• ${key}: ${val}`, 12, y);
        y += 5;
      });

      doc.text('Workouts:', 10, y);
      y += 6;
      Object.entries(entry.workouts || {}).forEach(([group, items]) => {
        doc.text(` ${group}:`, 12, y);
        y += 5;
        items.forEach((ex) => {
          doc.text(
            `   • ${ex.name} – ${ex.sets}x${ex.reps} @ ${ex.weight}lbs${ex.duration ? ` (${ex.duration}min)` : ''}`,
            14,
            y
          );
          y += 5;
        });
      });

      y += 10;
      if (y > 270) {
        doc.addPage();
        y = 10;
      }
    });

    doc.save('fitness-archive.pdf');
  };

  const handleClear = () => {
    if (locked) return;
    const confirmed = window.confirm('Delete all archived weeks? This cannot be undone.');
    if (confirmed) {
      localStorage.removeItem('fitnessArchive');
      alert('Archive cleared.');
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Archive Manager</h2>

      {/* Compact Buttons */}
      <div className="flex flex-wrap gap-3 mb-6">
        <button
          onClick={handleExport}
          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
        >
          Export Week
        </button>

        <button
          onClick={handleDownloadPDF}
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
        >
          Download PDF
        </button>

        <button
          onClick={() => setLocked(!locked)}
          className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded text-sm"
        >
          {locked ? 'Unlock' : 'Lock'}
        </button>

        <button
          onClick={handleClear}
          disabled={locked}
          className={`text-white px-3 py-1 rounded text-sm ${
            locked ? 'bg-gray-700 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'
          }`}
        >
          Clear Archive
        </button>
      </div>

      {/* Archive Display */}
      <div className="mt-4">
        <h3 className="text-lg font-semibold mb-2">Archived Weeks</h3>

        {archive.length === 0 ? (
          <p className="text-sm text-gray-400">No archived data yet.</p>
        ) : (
          archive.map((entry, index) => (
            <div
              key={index}
              className="mb-4 border border-gray-700 rounded p-3 bg-gray-800 text-sm text-gray-200"
            >
              <p className="text-blue-300 font-semibold mb-1">
                Week {index + 1} — {new Date(entry.timestamp).toLocaleDateString()}
              </p>

              <p><strong>Hydration:</strong> {entry.hydration || 0} cups</p>

              <div className="mt-2">
                <p className="font-semibold">Meals:</p>
                <ul className="pl-4 list-disc text-gray-300">
                  {Object.entries(entry.meals || {}).map(([meal, item], i) => (
                    <li key={i}>{meal}: {item}</li>
                  ))}
                </ul>
              </div>

              <div className="mt-2">
                <p className="font-semibold">Workouts:</p>
                {Object.entries(entry.workouts || {}).map(([group, list], i) => (
                  <div key={i}>
                    <p className="text-blue-400">{group}:</p>
                    <ul className="pl-4 list-disc">
                      {list.map((ex, j) => (
                        <li key={j}>
                          {ex.name}, {ex.sets}x{ex.reps} @ {ex.weight}lbs
                          {ex.duration ? ` (${ex.duration}min)` : ''}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
