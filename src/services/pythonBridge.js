import { spawn } from 'child_process';

// Gunakan 'py' untuk Windows, dan 'python3' untuk OS lain
const pythonCmd = process.platform === 'win32' ? 'py' : 'python3';

export const executeAIModel = (modelName, payload) => {
    return new Promise((resolve, reject) => {
        const pythonProcess = spawn(pythonCmd, [
            'src/services/ai_engine.py',
            modelName,
            JSON.stringify(payload)
        ]);

        let result = '';
        pythonProcess.stdout.on('data', (data) => {
            result += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            console.error(`AI Engine Error: ${data}`);
        });

        pythonProcess.on('close', (code) => {
            if (code !== 0) return reject(new Error('Inference process failed'));
            try {
                resolve(JSON.parse(result));
            } catch (err) {
                reject(err);
            }
        });
    });
};