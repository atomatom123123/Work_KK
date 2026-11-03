document.addEventListener('DOMContentLoaded', () => {
    const rawData = typeof dashboardData !== 'undefined' ? dashboardData : (window.dashboardData || null);

    if (!rawData) {
        console.error('Data not found. Please check js/data.js');
        return;
    }

    let hourlyChartInstance = null;
    let funnelChartInstance = null;

    // 1. Render KPIs
    function renderKPIs(kpiObj) {
        const vEl = document.getElementById('kpiVisitors');
        const eEl = document.getElementById('kpiEvents');
        const tEl = document.getElementById('kpiTransactions');
        const cEl = document.getElementById('kpiConversion');

        if (vEl) vEl.innerText = Number(kpiObj.totalVisitors || 0).toLocaleString();
        if (eEl) eEl.innerText = Number(kpiObj.totalEvents || 0).toLocaleString();
        if (tEl) tEl.innerText = Number(kpiObj.totalTransactions || 0).toLocaleString();
        if (cEl) cEl.innerText = (kpiObj.conversionRate || 0) + '%';
    }

    // 2. Render Hourly Traffic Chart
    function renderHourlyChart(trafficData) {
        const hourlyCanvas = document.getElementById('hourlyChart');
        if (!hourlyCanvas) return;
        const hourlyCtx = hourlyCanvas.getContext('2d');
        if (hourlyChartInstance) hourlyChartInstance.destroy();

        const gradient = hourlyCtx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, 'rgba(56, 189, 248, 0.35)');
        gradient.addColorStop(1, 'rgba(15, 23, 42, 0.0)');

        hourlyChartInstance = new Chart(hourlyCtx, {
            type: 'line',
            data: {
                labels: trafficData.map(d => d.hour + ':00'),
                datasets: [{
                    label: 'Activity Count',
                    data: trafficData.map(d => d.count),
                    borderColor: '#60a5fa',
                    borderWidth: 3,
                    backgroundColor: gradient,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#38bdf8',
                    pointBorderColor: '#0f172a',
                    pointRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    x: { grid: { color: 'rgba(51, 65, 85, 0.4)' }, ticks: { color: '#94a3b8' } },
                    y: { grid: { color: 'rgba(51, 65, 85, 0.4)' }, ticks: { color: '#94a3b8' } }
                }
            }
        });
    }

    // 3. Render Funnel Chart
    function renderFunnelChart(funnelData) {
        const funnelCanvas = document.getElementById('funnelChart');
        if (!funnelCanvas) return;
        const funnelCtx = funnelCanvas.getContext('2d');
        if (funnelChartInstance) funnelChartInstance.destroy();

        funnelChartInstance = new Chart(funnelCtx, {
            type: 'bar',
            data: {
                labels: ['Views', 'Add to Cart', 'Transactions'],
                datasets: [{
                    label: 'Count',
                    data: [funnelData.views, funnelData.cart, funnelData.transactions],
                    backgroundColor: ['#3b82f6', '#f59e0b', '#10b981'],
                    borderRadius: 6
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    x: { grid: { color: 'rgba(51, 65, 85, 0.4)' }, ticks: { color: '#94a3b8' } },
                    y: { grid: { display: false }, ticks: { color: '#f8fafc', font: { weight: 'bold' } } }
                }
            }
        });
    }

    // 4. Render Insights
    function renderInsights(data) {
        const list = document.getElementById('insightsList');
        if (list && data.businessInsights && data.businessInsights.length > 0) {
            list.innerHTML = data.businessInsights
                .map(item => `<li><strong style="color: #38bdf8;">[${item.type}]</strong> ${item.insight} <br><small class="text-muted">👉 Action: ${item.action}</small></li>`)
                .join('');
        }
    }

    // 5. Render Detail Table
    function renderDetailTable(trafficData) {
        const tbody = document.getElementById('detailTableBody');
        if (!tbody) return;

        const total = trafficData.reduce((sum, d) => sum + d.count, 0);

        tbody.innerHTML = trafficData.map(row => {
            const pct = total > 0 ? ((row.count / total) * 100).toFixed(1) : 0;
            let badgeClass = 'badge-low';
            let badgeText = 'Low';

            if (row.count >= 150000) {
                badgeClass = 'badge-high';
                badgeText = 'Peak Traffic';
            } else if (row.count >= 80000) {
                badgeClass = 'badge-medium';
                badgeText = 'Normal';
            }

            return `
                <tr>
                    <td><strong>${row.hour}:00 - ${row.hour}:59 น.</strong></td>
                    <td style="text-align: right;">${row.count.toLocaleString()}</td>
                    <td style="text-align: right;">${pct}%</td>
                    <td><span class="${badgeClass}">${badgeText}</span></td>
                </tr>
            `;
        }).join('');
    }

    // Initial Load
    if (rawData.kpis) renderKPIs(rawData.kpis);
    if (rawData.hourlyTraffic) renderHourlyChart(rawData.hourlyTraffic);
    if (rawData.funnelData) renderFunnelChart(rawData.funnelData);
    renderInsights(rawData);
    if (rawData.hourlyTraffic) renderDetailTable(rawData.hourlyTraffic);

    // Filter Logic
    const timeFilter = document.getElementById('timeFilter');
    const resetBtn = document.getElementById('resetFilterBtn');

    function applyFilter(val) {
        let filteredTraffic = [...rawData.hourlyTraffic];

        if (val === 'peak') {
            filteredTraffic = rawData.hourlyTraffic.filter(d => d.hour >= 19 && d.hour <= 22);
        } else if (val === 'offpeak') {
            filteredTraffic = rawData.hourlyTraffic.filter(d => d.hour >= 0 && d.hour <= 8);
        }

        const totalFilteredEvents = filteredTraffic.reduce((sum, d) => sum + d.count, 0);
        const ratio = rawData.kpis.totalEvents > 0 ? (totalFilteredEvents / rawData.kpis.totalEvents) : 1;

        const updatedKPIs = {
            totalVisitors: Math.round(rawData.kpis.totalVisitors * ratio),
            totalEvents: totalFilteredEvents,
            totalTransactions: Math.round(rawData.kpis.totalTransactions * ratio),
            conversionRate: rawData.kpis.conversionRate
        };

        renderKPIs(updatedKPIs);
        renderHourlyChart(filteredTraffic);
        renderDetailTable(filteredTraffic);
    }

    if (timeFilter) timeFilter.addEventListener('change', (e) => applyFilter(e.target.value));
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            if (timeFilter) timeFilter.value = 'all';
            renderKPIs(rawData.kpis);
            renderHourlyChart(rawData.hourlyTraffic);
            renderDetailTable(rawData.hourlyTraffic);
        });
    }

    // Export & Print
    const exportBtn = document.getElementById('exportCsvBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            let csvContent = "data:text/csv;charset=utf-8,Hour,Activity_Count\n";
            rawData.hourlyTraffic.forEach(row => { csvContent += `${row.hour}:00,${row.count}\n`; });
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", "customer_behavior_report.csv");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    }

    const printPdfBtn = document.getElementById('printPdfBtn');
    if (printPdfBtn) printPdfBtn.addEventListener('click', () => window.print());

    // Modal
    const modal = document.getElementById('dictModal');
    const openBtn = document.getElementById('openDictBtn');
    const closeBtn = document.getElementById('closeDictBtn');
    if (openBtn && modal) openBtn.onclick = () => modal.classList.remove('hidden');
    if (closeBtn && modal) closeBtn.onclick = () => modal.classList.add('hidden');
    window.onclick = (e) => { if (e.target === modal) modal.classList.add('hidden'); };

    // Back to Top
    const backToTopBtn = document.getElementById('backToTopBtn');
    window.onscroll = () => {
        if (backToTopBtn) {
            if (window.scrollY > 300) {
                backToTopBtn.classList.remove('hidden');
            } else {
                backToTopBtn.classList.add('hidden');
            }
        }
    };
    if (backToTopBtn) {
        backToTopBtn.onclick = () => window.scrollTo({ top: 0, behavior: 'smooth' });
    }
});

// ฟังก์ชันสลับ Tab (ซ่อนเฉพาะ Dropdown ตัวเลือกเวลา เมื่ออยู่แท็บ funnel)
function switchTab(tabId) {
    const contents = document.querySelectorAll('.tab-content');
    const buttons = document.querySelectorAll('.tab-btn');
    const filterGroup = document.querySelector('.filter-group');

    contents.forEach(content => content.classList.remove('active'));
    buttons.forEach(btn => btn.classList.remove('active'));

    const targetContent = document.getElementById('tab-' + tabId);
    if (targetContent) {
        targetContent.classList.add('active');
    }

    if (window.event && window.event.currentTarget) {
        window.event.currentTarget.classList.add('active');
    }

    // ซ่อนเฉพาะปุ่มเลือกช่วงเวลาเมื่ออยู่แท็บ funnel
    if (filterGroup) {
        if (tabId === 'funnel') {
            filterGroup.style.display = 'none';
        } else {
            filterGroup.style.display = 'flex';
        }
    }

    window.dispatchEvent(new Event('resize'));
}