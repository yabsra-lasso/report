// Opus API Configuration - Backend Proxy
const OPUS_CONFIG = {
    backendUrl: 'http://localhost:3000/api/opus',
    demoMode: true // Set to false to use live API
};

// Convert image file to base64
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

// Simulate Opus Workflow (Demo Mode)
function simulateOpusWorkflow(location, description, photoBase64, timestamp, contactInfo) {
    return new Promise((resolve) => {
        setTimeout(() => {
            // Generate realistic demo results
            const severityLevels = ['high', 'medium', 'low'];
            const departments = ['Roads & Infrastructure', 'Public Works', 'Emergency Services'];
            const randomSeverity = severityLevels[Math.floor(Math.random() * severityLevels.length)];
            const randomDept = departments[Math.floor(Math.random() * departments.length)];

            const hasPhoto = photoBase64 ? '✓ Photo analyzed' : '✗ No photo provided';

            resolve({
                ticket_id: `FMR-${Math.floor(Math.random() * 9000) + 1000}`,
                severity_score: randomSeverity === 'high' ? '8.5/10' : randomSeverity === 'medium' ? '5.2/10' : '2.8/10',
                severity_level: randomSeverity,
                assigned_department: randomDept,
                ai_message: `🤖 AI Analysis Complete!\n\nLocation: ${location}\nTimestamp: ${timestamp}\nContact: ${contactInfo}\n${hasPhoto}\n\nYour report has been analyzed and classified as ${randomSeverity} priority. Our team will address this issue shortly. You will receive updates via SMS/Email.`
            });
        }, 3000); // Simulate 3 second AI processing time
    });
}

// Trigger Opus Workflow via Backend Proxy (or Demo)
async function triggerOpusWorkflow(location, description, photoBase64, timestamp, contactInfo) {
    // Use demo mode if enabled
    if (OPUS_CONFIG.demoMode) {
        console.log('🎭 DEMO MODE: Simulating Opus workflow...');
        const results = await simulateOpusWorkflow(location, description, photoBase64, timestamp, contactInfo);
        return { demoResults: results }; // Return results directly in demo mode
    }

    console.log('🚀 Calling backend proxy to trigger Opus workflow...');

    const response = await fetch(`${OPUS_CONFIG.backendUrl}/trigger`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            location,
            description,
            photo: photoBase64,
            timestamp,
            contactInfo
        })
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to trigger Opus workflow');
    }

    const data = await response.json();
    console.log('✅ Backend returned:', data);
    return data;
}

// Poll for job completion via Backend Proxy
async function pollJobStatus(jobId) {
    return new Promise((resolve, reject) => {
        const pollInterval = setInterval(async () => {
            try {
                console.log(`📊 Polling job status: ${jobId}`);

                const response = await fetch(`${OPUS_CONFIG.backendUrl}/status/${jobId}`);

                if (!response.ok) {
                    clearInterval(pollInterval);
                    const errorData = await response.json();
                    reject(new Error(errorData.error || 'Failed to check job status'));
                    return;
                }

                const data = await response.json();
                console.log(`📈 Job ${jobId} status:`, data.status);

                if (data.status === 'completed') {
                    clearInterval(pollInterval);
                    console.log('✅ Job completed successfully');
                    resolve(data.outputs);
                } else if (data.status === 'failed') {
                    clearInterval(pollInterval);
                    reject(new Error('Job processing failed'));
                }
                // Continue polling if status is 'running' or 'pending'
            } catch (error) {
                clearInterval(pollInterval);
                reject(error);
            }
        }, 2000); // Poll every 2 seconds

        // Timeout after 60 seconds
        setTimeout(() => {
            clearInterval(pollInterval);
            reject(new Error('Job timeout - workflow took too long'));
        }, 60000);
    });
}

// Display AI Analysis Results
function displayOpusResults(outputs) {
    const resultHTML = `
        <div class="opus-results">
            <h3><i class="ph-fill ph-robot"></i> AI Analysis Complete</h3>
            <div class="result-grid">
                <div class="result-item">
                    <span class="result-label">Ticket ID:</span>
                    <span class="result-value">${outputs.ticket_id || 'N/A'}</span>
                </div>
                <div class="result-item">
                    <span class="result-label">Severity Score:</span>
                    <span class="result-value severity-${outputs.severity_level || 'medium'}">${outputs.severity_score || 'N/A'}</span>
                </div>
                <div class="result-item">
                    <span class="result-label">Assigned Department:</span>
                    <span class="result-value">${outputs.assigned_department || 'N/A'}</span>
                </div>
            </div>
            ${outputs.ai_message ? `<p class="ai-message">${outputs.ai_message}</p>` : ''}
        </div>
    `;

    // Insert results into the page
    const submitSection = document.querySelector('.submit-section');
    const existingResults = document.querySelector('.opus-results');
    if (existingResults) {
        existingResults.remove();
    }
    submitSection.insertAdjacentHTML('afterend', resultHTML);

    // Scroll to results
    document.querySelector('.opus-results').scrollIntoView({ behavior: 'smooth' });
}
