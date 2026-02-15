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

// Camera/Modal Functions
const cameraModal = document.getElementById('cameraModal');
const submissionModal = document.getElementById('submissionModal');

function openCameraModal() {
    cameraModal.style.display = 'flex';
}

function closeCameraModal() {
    cameraModal.style.display = 'none';
}

function capturePhoto() {
    // Simulate photo capture delay
    setTimeout(() => {
        closeCameraModal();
        submissionModal.style.display = 'flex';
        // Simulate geolocation logic
        setTimeout(() => {
            const locEl = document.querySelector('.location-detect span');
            locEl.innerText = "Near 12, Main Bazaar, Jaipur";
        }, 1500);
    }, 300);
}

function closeSubmissionModal() {
    submissionModal.style.display = 'none';
}

function selectChip(chip) {
    // Deselect others
    document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
    // Select this one
    chip.classList.add('active');
}

function submitIssue() {
    const btn = document.querySelector('.submit-btn');
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
