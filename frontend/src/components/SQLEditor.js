import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { Button, Container, Card } from 'react-bootstrap';

export default function SQLEditor({ onSubmit }) {
  const [code, setCode] = useState('// Write your C++ solution here\n#include <iostream>\nusing namespace std;\n\nint main() {\n    // Your code here\n    return 0;\n}');

  const handleSubmit = () => {
    onSubmit(code);
  };

  return (
    <Container className="my-4">
      <Card>
        <Card.Header>
          <h4>Problem: Two Sum</h4>
        </Card.Header>
        <Card.Body>
          <p><strong>Description:</strong> Given an array of integers <code>nums</code> and an integer <code>target</code>, return indices of the two numbers such that they add up to target.</p>
          <p><strong>Example:</strong> Input: nums = [2,7,11,15], target = 9<br/>Output: [0,1]</p>
          
          <Editor
            height="400px"
            defaultLanguage="cpp"
            value={code}
            onChange={(value) => setCode(value)}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: 'on',
              scrollBeyondLastLine: false,
            }}
          />
          <Button variant="primary" className="mt-3" onClick={handleSubmit}>
            Submit Code
          </Button>
        </Card.Body>
      </Card>
    </Container>
  );
}
