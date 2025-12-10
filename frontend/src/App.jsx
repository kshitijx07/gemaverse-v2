import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Matchmaking from './pages/Matchmaking';
import Leaderboard from './pages/Leaderboard';
import GameReviews from './pages/GameReviews';
import MyStats from './pages/MyStats';
import ChatPage from './pages/ChatPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/matchmaking" element={<Matchmaking />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/reviews" element={<GameReviews />} />
        <Route path="/stats" element={<MyStats />} />
        <Route path="/chat" element={<ChatPage />} />
      </Routes>
    </Router>
  );
}

export default App;
