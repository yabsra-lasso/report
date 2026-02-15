// Shared Data Storage for Admin-Citizen Connection
const ReportsDB = {
    // Get all reports from localStorage
    getAllReports() {
        const reports = localStorage.getItem('fixmyroad_reports');
        return reports ? JSON.parse(reports) : this.getSampleReports();
    },

    // Save a new report
    saveReport(report) {
        const reports = this.getAllReports();
        const newReport = {
            id: this.generateId(),
            ...report,
            status: 'pending',
            submittedAt: new Date().toISOString(),
            progress: ['Submitted']
        };
        reports.unshift(newReport); // Add to beginning
        localStorage.setItem('fixmyroad_reports', JSON.stringify(reports));
        this.updateStats();
        return newReport;
    },

    // Update report status
    updateReportStatus(reportId, status, progress) {
        const reports = this.getAllReports();
        const report = reports.find(r => r.id === reportId);
        if (report) {
            report.status = status;
            report.progress = progress;
            localStorage.setItem('fixmyroad_reports', JSON.stringify(reports));
            this.updateStats();
        }
    },

    // Generate unique ID
    generateId() {
        return '#' + (2400 + Math.floor(Math.random() * 100));
    },

    // Get sample reports (default data)
    getSampleReports() {
        return [
            {
                id: '#2401',
                category: 'Pothole',
                location: 'MG Road, near Central Square',
                description: 'Deep pothole (approx. 2ft diameter) causing traffic congestion and vehicle damage',
                status: 'pending',
                submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                progress: ['Submitted', 'Reviewed'],
                ticketId: 'FMR-2401',
                severity: '7.5/10',
                department: 'Roads & Infrastructure'
            },
            {
                id: '#2398',
                category: 'Road Cracks',
                location: 'Station Road, near Railway Crossing',
                description: 'Multiple longitudinal cracks across 50m stretch, causing water accumulation during monsoon',
                status: 'progress',
                submittedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                progress: ['Submitted', 'Reviewed', 'In Progress'],
                ticketId: 'FMR-2398',
                severity: '6.2/10',
                department: 'Public Works'
            },
            {
                id: '#2395',
                category: 'Road Resurfacing',
                location: 'Civil Lines, near District Hospital',
                description: 'Damaged road section (30m) has been completely resurfaced with new asphalt. Excellent work!',
                status: 'resolved',
                submittedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                progress: ['Submitted', 'Reviewed', 'In Progress', 'Resolved'],
                ticketId: 'FMR-2395',
                severity: '8.1/10',
                department: 'Roads & Infrastructure'
            }
        ];
    },

    // Update statistics
    updateStats() {
        const reports = this.getAllReports();
        const stats = {
            total: reports.length,
            pending: reports.filter(r => r.status === 'pending').length,
            inProgress: reports.filter(r => r.status === 'progress').length,
            resolved: reports.filter(r => r.status === 'resolved').length
        };
        localStorage.setItem('fixmyroad_stats', JSON.stringify(stats));
    },

    // Get statistics
    getStats() {
        const stats = localStorage.getItem('fixmyroad_stats');
        if (stats) return JSON.parse(stats);

        // Calculate from reports
        this.updateStats();
        return JSON.parse(localStorage.getItem('fixmyroad_stats'));
    }
};

// Initialize on page load
if (typeof window !== 'undefined') {
    window.ReportsDB = ReportsDB;
    // Ensure stats are updated
    ReportsDB.updateStats();
}
