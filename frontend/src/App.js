import React, { useState, useEffect } from 'react';
import SQLEditor from './components/SQLEditor';
import Leaderboard from './components/Leaderboard';
import Login from './components/Login';
import Register from './components/Register';
import { Navbar, Container, Tabs, Tab, Button } from 'react-bootstrap';

function App() {
  const [activeTab, setActiveTab] = useState('editor');
  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(true);

  // Check if user is already logged in
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleRegister = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setShowLogin(true);
  };

  const handleSubmit = async (code) => {
    if (!user) {
      alert('Please login first!');
      return;
    }

    try {
      const response = await fetch('http://192.168.27.128:5000/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          userName: user.username,
          problemId: 1,
          code: code,
          language: 'cpp'
        })
      });
      
      const result = await response.json();
      alert(result.message || 'Submission received!');
      setActiveTab('leaderboard');
    } catch (error) {
      alert('Failed to submit code. Please try again.');
    }
  };

  // Show login/register page if not authenticated
  if (!user) {
    if (showLogin) {
      return <Login onLogin={handleLogin} onSwitchToRegister={() => setShowLogin(false)} />;
    } else {
      return <Register onRegister={handleRegister} onSwitchToLogin={() => setShowLogin(true)} />;
    }
  }

  // Show main app if authenticated
  return (
    <>
      <Navbar bg="dark" variant="dark" className="mb-3">
        <Container fluid>
          <Navbar.Brand>🏆 Local Coding Contest Platform</Navbar.Brand>
          <Navbar.Text className="text-white">
            Welcome, <strong>{user.username}</strong>!
            <Button variant="outline-light" size="sm" className="ms-3" onClick={handleLogout}>
              Logout
            </Button>
          </Navbar.Text>
        </Container>
      </Navbar>
      
      <Container fluid>
        <Tabs
          activeKey={activeTab}
          onSelect={(k) => setActiveTab(k)}
          className="mb-3"
        >
          <Tab eventKey="editor" title="💻 Code Editor">
            <SQLEditor onSubmit={handleSubmit} />
          </Tab>
          
          <Tab eventKey="leaderboard" title="🏆 Leaderboard">
            <Leaderboard />
          </Tab>
        </Tabs>
      </Container>
    </>
  );
}

export default App;
