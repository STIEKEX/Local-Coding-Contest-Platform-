const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Create temp folder for code files if it doesn't exist
const tempDir = path.join(__dirname, 'temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir);
}

async function runCode(code, testCases) {
  const timestamp = Date.now();
  const fileName = `solution_${timestamp}`;
  const cppFile = path.join(tempDir, `${fileName}.cpp`);
  const exeFile = path.join(tempDir, `${fileName}.exe`);

  try {
    // Write C++ code to file
    fs.writeFileSync(cppFile, code);

    // Compile C++ code
    const compileCommand = `g++ "${cppFile}" -o "${exeFile}"`;
    
    await new Promise((resolve, reject) => {
      exec(compileCommand, (error, stdout, stderr) => {
        if (error) {
          reject({ error: 'Compilation Error', details: stderr });
        } else {
          resolve();
        }
      });
    });

    // Run test cases
    let passedTests = 0;
    const results = [];

    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];
      const runCommand = `echo ${testCase.input} | "${exeFile}"`;

      try {
        const output = await new Promise((resolve, reject) => {
          exec(runCommand, { timeout: 5000 }, (error, stdout, stderr) => {
            if (error) {
              reject({ error: 'Runtime Error', details: stderr });
            } else {
              resolve(stdout.trim());
            }
          });
        });

        const passed = output === testCase.output.trim();
        if (passed) passedTests++;

        results.push({
          testCase: i + 1,
          input: testCase.input,
          expectedOutput: testCase.output,
          actualOutput: output,
          passed: passed
        });
      } catch (err) {
        results.push({
          testCase: i + 1,
          input: testCase.input,
          expectedOutput: testCase.output,
          actualOutput: err.error,
          passed: false
        });
      }
    }

    // Clean up files
    if (fs.existsSync(cppFile)) fs.unlinkSync(cppFile);
    if (fs.existsSync(exeFile)) fs.unlinkSync(exeFile);

    const totalTests = testCases.length;
    const score = Math.round((passedTests / totalTests) * 100);

    return {
      success: true,
      passedTests: passedTests,
      totalTests: totalTests,
      score: score,
      results: results
    };

  } catch (error) {
    // Clean up files on error
    if (fs.existsSync(cppFile)) fs.unlinkSync(cppFile);
    if (fs.existsSync(exeFile)) fs.unlinkSync(exeFile);

    return {
      success: false,
      error: error.error || 'Unknown Error',
      details: error.details || error.message
    };
  }
}

module.exports = { runCode };
