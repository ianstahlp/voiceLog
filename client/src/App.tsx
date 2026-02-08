import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { DailyLogPage } from './pages/DailyLogPage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/daily" element={<DailyLogPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
