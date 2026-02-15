// Support/Like Functionality
function toggleSupport(btn) {
    const countSpan = btn.querySelector('.count');
    let count = parseInt(countSpan.innerText);

    if (btn.classList.contains('active')) {
        btn.classList.remove('active');
        count--;
    } else {
        btn.classList.add('active');
        count++;
    }

    countSpan.innerText = count;
}

// Tab Switching for Submit Section
function showTab(tabName) {
    // Remove active class from all tabs and content
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

    // Add active class to selected tab and content
    if (tabName === 'photo') {
        document.querySelector('.tab-btn:first-child').classList.add('active');
        document.getElementById('photoTab').classList.add('active');
    } else if (tabName === 'location') {
        document.querySelector('.tab-btn:last-child').classList.add('active');
        document.getElementById('locationTab').classList.add('active');
    }
}

// Geolocation Functionality
function useCurrentLocation() {
    const locationInput = document.getElementById('locationInput');

    if (navigator.geolocation) {
        locationInput.value = 'Getting your location...';
        locationInput.disabled = true;

        navigator.geolocation.getCurrentPosition(
            async function (position) {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;

                try {
                    // Use OpenStreetMap's Nominatim API for reverse geocoding
                    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
                    const data = await response.json();

                    if (data && data.display_name) {
                        // Extract relevant parts of the address
                        const address = data.address;
                        let locationStr = '';

                        if (address.road) locationStr += address.road;
                        if (address.suburb) locationStr += (locationStr ? ', ' : '') + address.suburb;
                        if (address.city) locationStr += (locationStr ? ', ' : '') + address.city;
                        else if (address.town) locationStr += (locationStr ? ', ' : '') + address.town;
                        if (address.state) locationStr += (locationStr ? ', ' : '') + address.state;

                        locationInput.value = locationStr || data.display_name;
                    } else {
                        // Fallback to coordinates if reverse geocoding fails
                        locationInput.value = `${lat.toFixed(6)}, ${lon.toFixed(6)}`;
                    }
                } catch (error) {
                    console.error('Reverse geocoding error:', error);
                    // Use coordinates as fallback
                    locationInput.value = `${lat.toFixed(6)}, ${lon.toFixed(6)}`;
                }

                locationInput.disabled = false;
            },
            function (error) {
                locationInput.value = '';
                locationInput.disabled = false;
                alert('Unable to get your location. Please enter it manually.');
            }
        );
    } else {
        alert('Geolocation is not supported by your browser.');
    }
}

// Update File Name Display
function updateFileName(input) {
    const fileName = document.getElementById('fileName');
    if (input.files && input.files[0]) {
        fileName.textContent = input.files[0].name;
        fileName.style.color = '#2e7d32';
    } else {
        fileName.textContent = 'No file chosen';
        fileName.style.color = '#999';
    }
}

// Submit Report with Opus AI Integration
async function submitReport(event) {
    event.preventDefault();

    const location = document.getElementById('locationInput').value;
    const description = document.getElementById('issueDescription').value;
    const photoFile = document.getElementById('issuePhoto').files[0];

    if (!location || !description) {
        alert('Please fill in all required fields');
        return;
    }

    const submitBtn = document.querySelector('.btn-submit');
    const originalText = submitBtn.innerHTML;

    try {
        // Step 1: Initial submission
        submitBtn.innerHTML = '<i class="ph ph-spinner"></i> Submitting...';
        submitBtn.disabled = true;

        // Convert photo to base64 if provided
        let photoBase64 = null;
        if (photoFile) {
            submitBtn.innerHTML = '<i class="ph ph-spinner"></i> Processing photo...';
            photoBase64 = await fileToBase64(photoFile);
        }

        // Gather all report data
        const timestamp = new Date().toISOString();
        const contactInfo = 'citizen@fixmyroad.com'; // Default contact

        // Step 2: Trigger Opus AI Workflow
        submitBtn.innerHTML = '<i class="ph ph-spinner"></i> AI Analysis in progress...';
        console.log('🚀 Triggering Opus workflow...');

        const workflowResult = await triggerOpusWorkflow(location, description, photoBase64, timestamp, contactInfo);

        // Check for demo mode, jobExecutionId (live API), or direct results
        let results;
        if (workflowResult.demoResults) {
            // Demo mode - results returned directly
            console.log('🎭 Demo mode results:', workflowResult.demoResults);
            results = workflowResult.demoResults;
        } else if (workflowResult.jobExecutionId) {
            // Real API - poll for results
            console.log(`📊 Job ID: ${workflowResult.jobExecutionId} - Polling for results...`);
            submitBtn.innerHTML = '<i class="ph ph-spinner"></i> Waiting for AI analysis...';
            results = await pollJobStatus(workflowResult.jobExecutionId);
            console.log('✅ Job completed:', results);
        } else {
            // Fallback - results returned directly
            results = workflowResult;
        }

        // Step 3: Save to shared database
        const reportData = {
            category: 'Road Issue',
            location: location,
            description: description,
            photo: photoBase64,
            ticketId: results.ticket_id,
            severity: results.severity_score,
            department: results.assigned_department,
            severityLevel: results.severity_level
        };

        const savedReport = ReportsDB.saveReport(reportData);

        // Step 4: Success
        submitBtn.innerHTML = '<i class="ph ph-check-circle"></i> Analysis Complete!';

        // Display AI results
        displayOpusResults(results);

        // Show success message
        setTimeout(() => {
            alert(`Report submitted successfully!\n\nReport ID: ${savedReport.id}\nTicket ID: ${results.ticket_id}\nSeverity: ${results.severity_score}\nDepartment: ${results.assigned_department}\n\nYour report is now visible on the admin dashboard.\nYou will receive updates via SMS/Email.`);

            // Clear form
            document.getElementById('reportForm').reset();
            document.getElementById('fileName').textContent = 'No file chosen';
            document.getElementById('fileName').style.color = '#999';

            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;

            // Reload reports section to show new report
            if (typeof loadUserReports === 'function') {
                loadUserReports();
            }
        }, 1500);

    } catch (error) {
        console.error('❌ Opus AI Error:', error);
        submitBtn.innerHTML = '<i class="ph ph-x-circle"></i> Error';

        setTimeout(() => {
            alert(`An error occurred during AI analysis:\n${error.message}\n\nPlease check:\n1. Opus workflow is active\n2. API credentials are correct\n3. Network connection is stable\n\nTry again or contact support.`);
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }, 2000);
    }
}

// Camera/Modal Functions (legacy - can be removed if not used)
const cameraModal = document.getElementById('cameraModal');
const submissionModal = document.getElementById('submissionModal');

function openCameraModal() {
    if (cameraModal) cameraModal.style.display = 'flex';
}

function closeCameraModal() {
    if (cameraModal) cameraModal.style.display = 'none';
}

function capturePhoto() {
    // Simulate photo capture delay
    setTimeout(() => {
        closeCameraModal();
        if (submissionModal) submissionModal.style.display = 'flex';
        // Simulate geolocation logic
        setTimeout(() => {
            const locEl = document.querySelector('.location-detect span');
            if (locEl) locEl.innerText = "Near 12, Main Bazaar, Jaipur";
        }, 1500);
    }, 300);
}

function closeSubmissionModal() {
    if (submissionModal) submissionModal.style.display = 'none';
}

function selectChip(chip) {
    // Deselect others
    document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
    // Select this one
    chip.classList.add('active');
}

function submitIssue() {
    const btn = document.querySelector('.submit-btn');
    if (!btn) return;

    const originalText = btn.innerText;

    btn.innerText = "Posting...";
    btn.disabled = true;

    setTimeout(() => {
        btn.innerText = "Posted!";

        setTimeout(() => {
            // Add new post to feed
            addNewPost();

            // Reset and close
            closeSubmissionModal();
            btn.innerText = originalText;
            btn.disabled = false;
        }, 1000);
    }, 1500);
}

function addNewPost() {
    const feedContainer = document.getElementById('feedContainer');
    if (!feedContainer) return;

    const category = document.querySelector('.chip.active').innerText;
    const location = document.querySelector('.location-detect span').innerText;

    const newCard = document.createElement('div');
    newCard.className = 'feed-card';
    newCard.innerHTML = `
        <div class="card-header">
            <div class="user-avatar" style="background-color: #3f51b5;">ME</div>
            <div class="post-info">
                <span class="user-name">You</span>
                <span class="post-time">Just now &bull; ${location}</span>
            </div>
        </div>
        <div class="card-image">
            <div class="placeholder-img" style="background-color: #ddd; height: 250px; display: flex; align-items: center; justify-content: center; color: #666;">
                <i class="ph ph-image" style="font-size: 48px;"></i>
            </div>
        </div>
        <div class="card-actions">
            <button class="action-btn support-btn active" onclick="toggleSupport(this)">
                <i class="ph ph-thumbs-up"></i>
                <span class="count">1</span>
                <span class="label">People faced this</span>
            </button>
            <button class="action-btn share-btn">
                <i class="ph ph-whatsapp-logo"></i>
                <span class="label">Share</span>
            </button>
        </div>
        <div class="card-content">
            <p class="issue-desc">Reported issue: ${category} at ${location}</p>
            <div class="status-badge status-pending">
                <i class="ph-fill ph-clock"></i> Pending Action
            </div>
        </div>
    `;

    // Insert after the first post (or at top)
    feedContainer.insertBefore(newCard, feedContainer.children[0]);
}
