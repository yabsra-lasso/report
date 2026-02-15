// Admin Dashboard Data Loader
document.addEventListener('DOMContentLoaded', function () {
    loadDashboardData();

    // Refresh every 5 seconds to catch new reports
    setInterval(loadDashboardData, 5000);
});

function loadDashboardData() {
    const stats = ReportsDB.getStats();
    const reports = ReportsDB.getAllReports();

    // Update stats cards
    updateStatsCards(stats);

    // Update recent reports table (if exists on page)
    updateReportsTable(reports);
}

function updateStatsCards(stats) {
    // Update total reports
    const totalEl = document.querySelector('.stat-card:nth-child(1) .stat-value');
    if (totalEl) {
        animateNumber(totalEl, stats.total);
    }

    // Update pending reports
    const pendingEl = document.querySelector('.stat-card:nth-child(2) .stat-value');
    if (pendingEl) {
        animateNumber(pendingEl, stats.pending);
    }

    // Update in progress
    const progressEl = document.querySelector('.stat-card:nth-child(3) .stat-value');
    if (progressEl) {
        animateNumber(progressEl, stats.inProgress);
    }

    // Update resolved
    const resolvedEl = document.querySelector('.stat-card:nth-child(4) .stat-value');
    if (resolvedEl) {
        animateNumber(resolvedEl, stats.resolved);
    }
}

function animateNumber(element, targetValue) {
    const currentValue = parseInt(element.textContent) || 0;
    if (currentValue === targetValue) return;

    const duration = 500;
    const steps = 20;
    const stepValue = (targetValue - currentValue) / steps;
    const stepDuration = duration / steps;

    let currentStep = 0;
    const interval = setInterval(() => {
        currentStep++;
        const newValue = Math.round(currentValue + (stepValue * currentStep));
        element.textContent = newValue;

        if (currentStep >= steps) {
            element.textContent = targetValue;
            clearInterval(interval);
        }
    }, stepDuration);
}

function updateReportsTable(reports) {
    const tableBody = document.querySelector('.reports-table tbody');
    if (!tableBody) return;

    // Clear existing rows
    tableBody.innerHTML = '';

    // Add recent reports (last 10)
    reports.slice(0, 10).forEach(report => {
        const row = createReportRow(report);
        tableBody.appendChild(row);
    });
}

function createReportRow(report) {
    const tr = document.createElement('tr');
    tr.className = 'fade-in';

    const statusBadge = getStatusBadge(report.status);
    const timeAgo = getTimeAgo(report.submittedAt);

    tr.innerHTML = `
        <td><strong>${report.id}</strong></td>
        <td>${report.category}</td>
        <td>${report.location}</td>
        <td>${statusBadge}</td>
        <td>${report.severity || 'N/A'}</td>
        <td>${timeAgo}</td>
    `;

    return tr;
}

function getStatusBadge(status) {
    const badges = {
        pending: '<span class="badge badge-warning">Pending</span>',
        progress: '<span class="badge badge-info">In Progress</span>',
        resolved: '<span class="badge badge-success">Resolved</span>'
    };
    return badges[status] || badges.pending;
}

function getTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    const diffWeeks = Math.floor(diffDays / 7);
    if (diffWeeks === 1) return '1 week ago';
    return `${diffWeeks} weeks ago`;
}
