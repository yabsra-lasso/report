const express = require('express');
const router = express.Router();

// Opus API Configuration
const OPUS_CONFIG = {
    apiKey: process.env.OPUS_API_KEY,
    workflowId: process.env.OPUS_WORKFLOW_ID,
    baseUrl: 'https://operator.opus.com'
};

// Trigger Opus Workflow (Initiate + Execute)
router.post('/trigger', async (req, res) => {
    try {
        const { location, description, photo } = req.body;

        console.log('🚀 Step 1: Initiating Opus job...');

        // Step 1: Initiate Job
        const initiateResponse = await fetch(`${OPUS_CONFIG.baseUrl}/job/initiate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-service-key': OPUS_CONFIG.apiKey
            },
            body: JSON.stringify({
                workflowId: OPUS_CONFIG.workflowId
            })
        });

        if (!initiateResponse.ok) {
            const errorText = await initiateResponse.text();
            console.error('❌ Job initiation error:', errorText);
            return res.status(initiateResponse.status).json({
                error: 'Failed to initiate Opus job',
                details: errorText
            });
        }

        const { jobExecutionId } = await initiateResponse.json();
        console.log('✅ Job initiated, ID:', jobExecutionId);

        // Step 2: Execute Job with inputs
        console.log('🚀 Step 2: Executing job with inputs...');

        const executeResponse = await fetch(`${OPUS_CONFIG.baseUrl}/job/execute`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-service-key': OPUS_CONFIG.apiKey
            },
            body: JSON.stringify({
                jobExecutionId: jobExecutionId,
                jobPayloadSchemaInstance: {
                    location: {
                        value: location,
                        type: 'text'
                    },
                    description: {
                        value: description,
                        type: 'text'
                    },
                    photo: photo ? {
                        value: photo,
                        type: 'text'
                    } : undefined
                }
            })
        });

        if (!executeResponse.ok) {
            const errorText = await executeResponse.text();
            console.error('❌ Job execution error:', errorText);
            return res.status(executeResponse.status).json({
                error: 'Failed to execute Opus job',
                details: errorText
            });
        }

        console.log('✅ Job executing...');
        res.json({ jobExecutionId });

    } catch (error) {
        console.error('❌ Backend proxy error:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
});

// Poll Job Status
router.get('/status/:jobExecutionId', async (req, res) => {
    try {
        const { jobExecutionId } = req.params;

        console.log(`📊 Checking job status: ${jobExecutionId}`);

        const response = await fetch(`${OPUS_CONFIG.baseUrl}/job/${jobExecutionId}/status`, {
            headers: {
                'x-service-key': OPUS_CONFIG.apiKey
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Status check error:', errorText);
            return res.status(response.status).json({
                error: 'Failed to check job status',
                details: errorText
            });
        }

        const data = await response.json();
        console.log(`📈 Job ${jobExecutionId} status:`, data.status);
        res.json(data);

    } catch (error) {
        console.error('❌ Status check error:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
});

// Get Job Results
router.get('/results/:jobExecutionId', async (req, res) => {
    try {
        const { jobExecutionId } = req.params;

        console.log(`📥 Fetching job results: ${jobExecutionId}`);

        const response = await fetch(`${OPUS_CONFIG.baseUrl}/job/${jobExecutionId}/results`, {
            headers: {
                'x-service-key': OPUS_CONFIG.apiKey
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Results fetch error:', errorText);
            return res.status(response.status).json({
                error: 'Failed to fetch job results',
                details: errorText
            });
        }

        const data = await response.json();
        console.log(`✅ Job ${jobExecutionId} results retrieved`);
        res.json(data);

    } catch (error) {
        console.error('❌ Results fetch error:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
});

module.exports = router;
