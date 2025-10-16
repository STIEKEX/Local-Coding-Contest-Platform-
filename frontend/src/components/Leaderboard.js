import React, { useEffect, useState } from 'react';
import { Table, Container, Card } from 'react-bootstrap';
import io from 'socket.io-client';

export default function Leaderboard() {
  const [board, setBoard] = useState([]);
  
  useEffect(() => {
    // Try to connect to backend socket
    const socket = io('http://192.168.27.128:5000');

    
    socket.on('connect', () => {
      console.log('Connected to backend socket');
    });

    socket.on('leaderboard', (data) => {
      console.log('Leaderboard update:', data);
      setBoard(data);
    });

    socket.on('connect_error', () => {
      console.log('Backend not running - leaderboard will update when backend starts');
    });

    return () => socket.disconnect();
  }, []);

  return (
    <Container className="my-4">
      <Card>
        <Card.Header>
          <h4>🏆 Live Leaderboard</h4>
        </Card.Header>
        <Card.Body>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Rank</th>
                <th>Name</th>
                <th>Score</th>
                <th>Time (s)</th>
              </tr>
            </thead>
            <tbody>
              {board.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center text-muted">
                    No submissions yet. Submit your code to see results!
                  </td>
                </tr>
              ) : (
                board.map((user, idx) => (
                  <tr key={idx}>
                    <td>{idx + 1}</td>
                    <td>{user.name}</td>
                    <td>{user.score}</td>
                    <td>{user.time}</td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </Container>
  );
}
