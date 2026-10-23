// Data Models & Initial State Persistence
const DEFAULT_GOALS = { steps: 10000, calories: 2200, minutes: 60, water: 2500 };

// Sample initial data if LocalStorage is empty
const INITIAL_ACTIVITIES = [
  { id: '1', title: 'Morning Jog', category: 'Cardio', duration: 30, calories: 310, date: new Date().toISOString() },
  { id: '2', title: 'Chest & Triceps', category: 'Strength', duration: 45, calories: 220, date: new Date().toISOString() },
  { id: '3', title: 'Daily Steps Track', category: 'Steps', duration: 0, calories: 280, steps: 6500, date: new Date().toISOString() },
  { id: '4', title: 'Hydration Intake', category: 'Hydration', duration: 0, calories: 0, water: 1500, date: new Date().toISOString() }
];

let appState = {
  goals: JSON.parse(localStorage.getItem('pulsefit_goals')) || DEFAULT_GOALS,
  activities: JSON.parse(localStorage.getItem('pulsefit_activities')) || INITIAL_ACTIVITIES,
  activeTab: 'dashboard',
  chartMetric: 'calories'
};

let weeklyChartInstance = null;
let doughnutChartInstance = null;

// Initialize Web Application
document.addEventListener('DOMContentLoaded', () => {
  setupNavigation();
  setupModalEvents();
  setupQuickActionBtns();
  setupFormHandlers();
  setupFilterEvents();
  
  // Set default datetime input to current time formatted for input
  const dateInput = document.getElementById('activityDate');
  if (dateInput) {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    dateInput.value = now.toISOString().slice(0, 16);
  }

  // Initial Render Steps
  renderApp();
});

// Save Application State to LocalStorage
function saveState() {
  localStorage.setItem('pulsefit_goals', JSON.stringify(appState.goals));
  localStorage.setItem('pulsefit_activities', JSON.stringify(appState.activities));
  renderApp();
}

// Full Render Pipeline
function renderApp() {
  renderDashboard();
  renderHistoryTable();
  renderAnalytics();
  renderGoalsAndBadges();
}

// Navigation Tab Switcher
function setupNavigation() {
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');
      
      navLinks.forEach(l => l.classList.remove('active'));
      btn.classList.add('active');

      document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
      });

      const activeContent = document.getElementById(`${targetTab}Tab`);
      if (activeContent) activeContent.classList.add('active');

      // Update Top Header Title
      const titles = {
        dashboard: 'Dashboard Overview',
        history: 'Activity Log & History',
        analytics: 'Analytics & Distribution',
        goals: 'Goals & Badges'
      };
      document.getElementById('pageTitle').innerText = titles[targetTab] || 'Dashboard Overview';
      
      appState.activeTab = targetTab;

      // Re-render charts on tab switch to resolve size animation issues
      if (targetTab === 'dashboard') renderWeeklyChart();
      if (targetTab === 'analytics') renderDoughnutChart();
    });
  });
}

// Render Dashboard Values & Circular Progress SVG Rings
function renderDashboard() {
  const todayStr = new Date().toDateString();
  
  // Calculate today's totals
  const todayLogs = appState.activities.filter(a => new Date(a.date).toDateString() === todayStr);

  const totalSteps = todayLogs.reduce((acc, curr) => acc + (curr.steps || 0), 0);
  const totalCalories = todayLogs.reduce((acc, curr) => acc + (curr.calories || 0), 0);
  const totalMinutes = todayLogs.reduce((acc, curr) => acc + (curr.duration || 0), 0);
  const totalWater = todayLogs.reduce((acc, curr) => acc + (curr.water || 0), 0);

  // Text updates
  document.getElementById('valSteps').innerText = totalSteps.toLocaleString();
  document.getElementById('valCalories').innerText = totalCalories.toLocaleString();
  document.getElementById('valMinutes').childNodes[0].nodeValue = totalMinutes + " ";
  document.getElementById('valWater').childNodes[0].nodeValue = totalWater.toLocaleString() + " ";

  document.getElementById('subSteps').innerText = `Goal: ${appState.goals.steps.toLocaleString()}`;
  document.getElementById('subCalories').innerText = `Goal: ${appState.goals.calories.toLocaleString()} kcal`;
  document.getElementById('subMinutes').innerText = `Goal: ${appState.goals.minutes} mins`;
  document.getElementById('subWater').innerText = `Goal: ${appState.goals.water.toLocaleString()} ml`;

  // Circular Ring Animations (Stroke Offset calculation based on circumference 251.2)
  const CIRCUMFERENCE = 251.2;
  
  updateRing('ringSteps', totalSteps, appState.goals.steps, CIRCUMFERENCE);
  updateRing('ringCalories', totalCalories, appState.goals.calories, CIRCUMFERENCE);
  updateRing('ringMinutes', totalMinutes, appState.goals.minutes, CIRCUMFERENCE);
  updateRing('ringWater', totalWater, appState.goals.water, CIRCUMFERENCE);

  renderWeeklyChart();
}

function updateRing(elementId, current, goal, circumference) {
  const elem = document.getElementById(elementId);
  if (!elem) return;
  const percent = Math.min(current / goal, 1);
  const offset = circumference - (percent * circumference);
  elem.style.strokeDashoffset = offset;
}

// Modal Handlers
function setupModalEvents() {
  const modal = document.getElementById('activityModal');
  const openBtn = document.getElementById('openModalBtn');
  const closeBtn = document.getElementById('closeModalBtn');
  const typeSelect = document.getElementById('activityType');

  openBtn.addEventListener('click', () => modal.classList.add('open'));
  closeBtn.addEventListener('click', () => modal.classList.remove('open'));

  // Auto calculate estimated calories based on intensity & duration
  typeSelect.addEventListener('change', (e) => {
    const customGroup = document.getElementById('customTitleGroup');
    customGroup.style.display = e.target.value === 'Custom' ? 'block' : 'none';
    calculateEstimatedCalories();
  });

  document.getElementById('activityDuration').addEventListener('input', calculateEstimatedCalories);
}

function calculateEstimatedCalories() {
  const type = document.getElementById('activityType').value;
  const duration = parseFloat(document.getElementById('activityDuration').value) || 0;
  
  // Simple MET estimate mapping per minute
  const rates = {
    Running: 10.5,
    Cycling: 8.0,
    Swimming: 9.0,
    'Gym Workout': 6.0,
    Yoga: 3.5,
    'Brisk Walking': 4.5,
    Custom: 5.0
  };

  const estimated = Math.round(duration * (rates[type] || 5));
  document.getElementById('activityCalories').value = estimated;
}

// Quick Add Action Buttons
function setupQuickActionBtns() {
  document.getElementById('quickWaterBtn').addEventListener('click', () => {
    appState.activities.unshift({
      id: Date.now().toString(),
      title: 'Water Hydration',
      category: 'Hydration',
      duration: 0,
      calories: 0,
      water: 250,
      date: new Date().toISOString()
    });
    saveState();
  });

  document.getElementById('quickStepBtn').addEventListener('click', () => {
    // Adds steps and calculates approx 40 calories per 1000 steps
    appState.activities.unshift({
      id: Date.now().toString(),
      title: 'Step Walking',
      category: 'Steps',
      duration: 10,
      calories: 40,
      steps: 1000,
      date: new Date().toISOString()
    });
    saveState();
  });
}

// Form Handlers
function setupFormHandlers() {
  // Activity Logging Form Submit
  document.getElementById('logActivityForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const type = document.getElementById('activityType').value;
    const customTitle = document.getElementById('customTitleInput').value;
    const duration = parseInt(document.getElementById('activityDuration').value) || 0;
    const calories = parseInt(document.getElementById('activityCalories').value) || 0;
    const category = document.getElementById('activityCategory').value;
    const date = document.getElementById('activityDate').value;

    const newLog = {
      id: Date.now().toString(),
      title: type === 'Custom' ? (customTitle || 'Custom Exercise') : type,
      category,
      duration,
      calories,
      date: new Date(date).toISOString()
    };

    appState.activities.unshift(newLog);
    saveState();

    document.getElementById('activityModal').classList.remove('open');
    document.getElementById('logActivityForm').reset();
  });

  // Goals Form Submit
  document.getElementById('goalsForm').addEventListener('submit', (e) => {
    e.preventDefault();
    appState.goals = {
      steps: parseInt(document.getElementById('goalStepsInput').value) || 10000,
      calories: parseInt(document.getElementById('goalCalInput').value) || 2200,
      minutes: parseInt(document.getElementById('goalMinInput').value) || 60,
      water: parseInt(document.getElementById('goalWaterInput').value) || 2500
    };
    saveState();
    alert('Goals successfully updated!');
  });

  // Reset Data Button
  document.getElementById('resetDataBtn').addEventListener('click', () => {
    if (confirm('Are you sure you want to reset all tracked records back to defaults?')) {
      localStorage.clear();
      appState.goals = DEFAULT_GOALS;
      appState.activities = INITIAL_ACTIVITIES;
      saveState();
    }
  });
}

// Render Activity Log Table with Search & Category Filter
function renderHistoryTable() {
  const tbody = document.getElementById('activityTableBody');
  const searchVal = (document.getElementById('searchInput').value || '').toLowerCase();
  const categoryVal = document.getElementById('filterCategory').value;

  tbody.innerHTML = '';

  const filtered = appState.activities.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchVal);
    const matchesCategory = categoryVal === 'ALL' || item.category === categoryVal;
    return matchesSearch && matchesCategory;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color: var(--text-muted); padding: 2rem;">No matching activity records found.</td></tr>`;
    return;
  }

  filtered.forEach(item => {
    const tr = document.createElement('tr');
    const d = new Date(item.date);
    const dateFormatted = `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    
    const catClass = `tag-${(item.category || 'cardio').toLowerCase()}`;

    tr.innerHTML = `
      <td style="color: var(--text-muted); font-size: 0.8rem;">${dateFormatted}</td>
      <td style="font-weight: 700;">${item.title} ${item.steps ? `<span style="font-size:0.75rem; color:var(--primary);">(+${item.steps} steps)</span>` : ''} ${item.water ? `<span style="font-size:0.75rem; color:var(--col-water);">(+${item.water} ml)</span>` : ''}</td>
      <td><span class="category-tag ${catClass}">${item.category || 'General'}</span></td>
      <td>${item.duration ? item.duration + ' mins' : '-'}</td>
      <td>${item.calories ? item.calories + ' kcal' : '-'}</td>
      <td style="text-align: right;">
        <button onclick="deleteActivity('${item.id}')" style="background:none; border:none; color: #ef4444; cursor:pointer;" title="Delete Record">
          <i class="fa-solid fa-trash-can"></i>
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function deleteActivity(id) {
  appState.activities = appState.activities.filter(a => a.id !== id);
  saveState();
}

function setupFilterEvents() {
  document.getElementById('searchInput').addEventListener('input', renderHistoryTable);
  document.getElementById('filterCategory').addEventListener('change', renderHistoryTable);

  document.getElementById('chartViewCal').addEventListener('click', (e) => {
    appState.chartMetric = 'calories';
    document.getElementById('chartViewCal').classList.add('active');
    document.getElementById('chartViewSteps').classList.remove('active');
    renderWeeklyChart();
  });

  document.getElementById('chartViewSteps').addEventListener('click', (e) => {
    appState.chartMetric = 'steps';
    document.getElementById('chartViewSteps').classList.add('active');
    document.getElementById('chartViewCal').classList.remove('active');
    renderWeeklyChart();
  });
}

// Chart 1: Render 7-Day Trend Line/Bar Chart (Chart.js)
function renderWeeklyChart() {
  const ctx = document.getElementById('weeklyChart');
  if (!ctx) return;

  // Generate last 7 days labels
  const days = [];
  const totals = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toDateString();
    days.push(d.toLocaleDateString('en-US', { weekday: 'short' }));

    const daySum = appState.activities
      .filter(a => new Date(a.date).toDateString() === dateStr)
      .reduce((sum, item) => {
        return sum + (appState.chartMetric === 'calories' ? (item.calories || 0) : (item.steps || 0));
      }, 0);

    totals.push(daySum);
  }

  if (weeklyChartInstance) {
    weeklyChartInstance.destroy();
  }

  const isCal = appState.chartMetric === 'calories';

  weeklyChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: days,
      datasets: [{
        label: isCal ? 'Calories Burned' : 'Steps Taken',
        data: totals,
        backgroundColor: isCal ? 'rgba(245, 158, 11, 0.4)' : 'rgba(16, 185, 129, 0.4)',
        borderColor: isCal ? '#f59e0b' : '#10b981',
        borderWidth: 2,
        borderRadius: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false }, ticks: { color: '#9ca3af' } },
        y: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#9ca3af' } }
      }
    }
  });
}

// Render Analytics Tab Summary & Doughnut Chart
function renderAnalytics() {
  const totalCount = appState.activities.length;
  const totalCal = appState.activities.reduce((sum, a) => sum + (a.calories || 0), 0);
  const totalMin = appState.activities.reduce((sum, a) => sum + (a.duration || 0), 0);

  document.getElementById('summaryTotalCount').innerText = totalCount;
  document.getElementById('summaryTotalCalories').innerText = totalCal.toLocaleString() + ' kcal';
  document.getElementById('summaryTotalTime').innerText = (totalMin / 60).toFixed(1) + ' hrs';

  renderDoughnutChart();
}

// Chart 2: Render Category Breakdown Doughnut Chart
function renderDoughnutChart() {
  const ctx = document.getElementById('categoryDoughnutChart');
  if (!ctx) return;

  const categories = ['Cardio', 'Strength', 'Flexibility', 'Steps', 'Hydration'];
  const counts = categories.map(cat => 
    appState.activities.filter(a => a.category === cat).length
  );

  if (doughnutChartInstance) {
    doughnutChartInstance.destroy();
  }

  doughnutChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: categories,
      datasets: [{
        data: counts,
        backgroundColor: ['#f59e0b', '#3b82f6', '#8b5cf6', '#10b981', '#06b6d4'],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom', labels: { color: '#f3f4f6' } }
      }
    }
  });
}

// Render Goals & Evaluate Unlocked Achievements / Badges
function renderGoalsAndBadges() {
  document.getElementById('goalStepsInput').value = appState.goals.steps;
  document.getElementById('goalCalInput').value = appState.goals.calories;
  document.getElementById('goalMinInput').value = appState.goals.minutes;
  document.getElementById('goalWaterInput').value = appState.goals.water;

  const todayStr = new Date().toDateString();
  const todayLogs = appState.activities.filter(a => new Date(a.date).toDateString() === todayStr);

  const totalSteps = todayLogs.reduce((acc, curr) => acc + (curr.steps || 0), 0);
  const totalWater = todayLogs.reduce((acc, curr) => acc + (curr.water || 0), 0);
  const maxSingleWorkoutCal = Math.max(...appState.activities.map(a => a.calories || 0), 0);

  // Badge Unlock Evaluator Rules
  toggleBadge('badgeStreak', appState.activities.length >= 3);
  toggleBadge('badgeStepMaster', totalSteps >= 10000);
  toggleBadge('badgeCalorieBurner', maxSingleWorkoutCal >= 500);
  toggleBadge('badgeHydrated', totalWater >= appState.goals.water);
}

function toggleBadge(elementId, condition) {
  const elem = document.getElementById(elementId);
  if (!elem) return;
  if (condition) {
    elem.classList.add('unlocked');
  } else {
    elem.classList.remove('unlocked');
  }
}
