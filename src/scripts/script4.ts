// @ts-nocheck
export function initScript4() {


// ── Clone Counter ──────────────────────────────────────────
(function() {
  const STORE_KEY = 'oa_clone_counts';

  function loadCounts() {
    try {
      return JSON.parse(localStorage.getItem(STORE_KEY) || '{}');
    } catch(e) { return {}; }
  }

  function saveCounts(counts) {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(counts)); } catch(e) {}
  }

  function safeId(name) {
    return name.replace(/[^a-zA-Z0-9]/g, '_');
  }

  function refreshUI(name, count) {
    const id = safeId(name);
    const valEl = document.getElementById('cloneval-' + id);
    if (valEl) {
      valEl.textContent = count.toLocaleString();
      valEl.classList.add('bumped');
      setTimeout(() => valEl.classList.remove('bumped'), 1200);
    }
    // Also update va-grid cards if visible
    const vaCards = document.querySelectorAll('.va-card');
    vaCards.forEach(card => {
      const nameEl = card.querySelector('div[style*="font-weight:700"]');
      if (nameEl && nameEl.textContent.trim() === name) {
        let ctr = card.querySelector('.va-clone-ctr');
        if (ctr) ctr.textContent = count.toLocaleString() + ' Clones';
      }
    });
  }

  window.incrementClone = function(name) {
    const counts = loadCounts();
    counts[name] = (counts[name] || 0) + 1;
    saveCounts(counts);
    refreshUI(name, counts[name]);
  };

  // Load saved counts and populate all visible counters on page load
  function initCounters() {
    const counts = loadCounts();
    document.querySelectorAll('[id^="cloneval-"]').forEach(el => {
      const id = el.id.replace('cloneval-', '');
      // Reverse safeId to find name — try matching from counts keys
      const matchedName = Object.keys(counts).find(n => safeId(n) === id);
      if (matchedName && counts[matchedName]) {
        el.textContent = counts[matchedName].toLocaleString();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCounters);
  } else {
    initCounters();
  }
})();
// ── HELPERS ──────────────────────────────────────────────────────────
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const el = document.getElementById('screen-' + id);
  if (el) el.classList.add('active');
  event && event.currentTarget && event.currentTarget.classList.add('active');

  const titles = {
    executive: ['Executive Overview', 'Real-time business intelligence'],
    revenue: ['Revenue Analytics', 'Subscription revenue performance'],
    acquisition: ['Acquisition Analytics', 'Channel performance & campaign ROI'],
    retention: ['Retention & Churn', 'Cohort analysis & churn prediction'],
    product: ['Product Analytics', 'Feature adoption & user journeys'],
    health: ['Customer Health', 'Health scores & engagement indicators'],
    subscription: ['Subscription Analytics', 'Lifecycle tracking & renewals'],
    forecasting: ['Forecasting', 'AI-powered revenue projections'],
    alerts: ['Alerts & Anomaly Detection', 'Real-time monitoring'],
    reports: ['Reports', 'Scheduled & stakeholder reporting'],
    ai: ['AI Insights Center', 'Intelligent business recommendations'],
    admin: ['Administration', 'Users, permissions & integrations'],
  };
  if (titles[id]) {
    document.getElementById('topbar-title').textContent = titles[id][0];
    document.getElementById('topbar-sub').textContent = titles[id][1];
  }

  // Update nav active state manually
  document.querySelectorAll('.nav-item').forEach(n => {
    if (n.getAttribute('onclick') && n.getAttribute('onclick').includes("'"+id+"'")) n.classList.add('active');
  });
}

function openModal(id) {
  const el = document.getElementById(id);
  if (!el) { console.warn('Modal not found:', id); return; }
  if (el.classList.contains('oa-overlay')) {
    el.classList.add('open');
  } else {
    el.classList.add('show');
    if (id === 'modal-heatmap' && typeof buildHeatmap === 'function') buildHeatmap();
    if (id === 'modal-user-journey' && typeof buildJourney === 'function') buildJourney();
  }
  document.body.style.overflow = 'hidden';
}
function closeModal(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.remove('open', 'show');
  if (!document.querySelector('.oa-overlay.open, .modal-overlay.show')) {
    document.body.style.overflow = '';
  }
}
window.openModal = openModal;
window.closeModal = closeModal;
document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(overlay.id); });
});

function toast(msg, type = 'success') {
  const t = document.getElementById('toast');
  if (!t) return;
  const el = document.createElement('div');
  el.className = 'toast-item ' + type;
  const icons = {success:'✓ ', error:'✕ ', info:'ℹ '};
  el.textContent = (icons[type]||'') + msg;
  t.appendChild(el);
  setTimeout(() => el.remove(), 3500);
}
window.toast = toast;

function selectDatePreset(btn, label) {
  document.querySelectorAll('.date-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  toast('Date range: ' + label, 'info');
}
function applyDateRange() {
  closeModal('modal-date-range');
  toast('Dashboard refreshed with selected date range', 'success');
}
function runForecast() {
  toast('Generating AI forecast model…', 'info');
  setTimeout(() => toast('Forecast complete — Base Case: $12.5M ARR', 'success'), 1200);
}
function selectScenario(card, name) {
  document.querySelectorAll('.scenario-card').forEach(c => c.classList.remove('active'));
  card.classList.add('active');
  toast('Scenario switched to: ' + name, 'info');
}
function generateInsights() {
  toast('Running AI analysis across all metrics…', 'info');
  setTimeout(() => toast('12 new insights generated', 'success'), 1500);
}

function filterHealth(type, btn) {
  const scope = btn.closest('#saas-app') || document;
  scope.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  buildHealthList(type);
}

function showAdminTab(tab, btn) {
  const scope = btn.closest('#saas-app') || document;
  ['users','teams','security','integrations-tab'].forEach(t => {
    const el = document.getElementById('admin-' + t);
    if (el) el.style.display = 'none';
  });
  const panel = document.getElementById('admin-' + tab);
  if (panel) panel.style.display = 'block';
  scope.querySelectorAll('.tabs .tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
}

function sendAIMessage() {
  const inp = document.getElementById('ai-chat-input');
  const out = document.getElementById('ai-chat-output');
  const q = inp.value.trim();
  if (!q) return;
  const answers = {
    default: "Based on your current data: MRR is $847K (+18.4%), churn is 2.4% (improving). Your strongest growth lever is enterprise expansion — NRR of 128% means existing accounts are growing faster than they churn. Recommend increasing QBR cadence for top 50 accounts."
  };
  out.innerHTML = '<strong style="color:var(--text)">You: ' + q + '</strong><br><br>🤖 <em>Analyzing your metrics…</em>';
  setTimeout(() => {
    out.innerHTML = '<strong style="color:var(--text)">You: ' + q + '</strong><br><br>' + answers.default;
  }, 800);
  inp.value = '';
}

// ── COHORT TABLE ──
const cohortData = [
  {m:'Jan 2025',u:312,r:[100,94,88,82,78,74]},
  {m:'Feb 2025',u:298,r:[100,92,86,79,74,null]},
  {m:'Mar 2025',u:334,r:[100,91,84,77,null,null]},
  {m:'Apr 2025',u:318,r:[100,93,87,null,null,null]},
  {m:'May 2025',u:342,r:[100,95,null,null,null,null]},
  {m:'Jun 2025',u:312,r:[100,null,null,null,null,null]},
];
function buildCohort() {
  const tb = document.getElementById('cohort-body');

  if (!tb) {
    console.log('cohort-body not found');
    return;
  }

  tb.innerHTML = cohortData.map(row => {
    const cells = row.r.map(v => {
      if (v === null) return '<td></td>';
      const bg = v > 90 ? '#dcfce7' : v > 80 ? '#dbeafe' : v > 70 ? '#fef9c3' : '#fee2e2';
      const col = v > 90 ? '#166534' : v > 80 ? '#1e40af' : v > 70 ? '#854d0e' : '#991b1b';
      return `<td style="background:${bg};color:${col}">${v}%</td>`;
    }).join('');

    return `<tr><td>${row.m}</td><td>${row.u}</td>${cells}</tr>`;
  }).join('');
}

// ── HEALTH LIST ──
const healthData = [
  {n:'Acme Corp',co:'Enterprise',s:94,c:'#7c3aed',st:'healthy'},
  {n:'TechFlow Inc',co:'Growth',s:88,c:'#2563eb',st:'healthy'},
  {n:'DataSpark',co:'Enterprise',s:71,c:'#7c3aed',st:'atrisk'},
  {n:'CloudBridge',co:'Growth',s:52,c:'#2563eb',st:'critical'},
  {n:'Vertex Labs',co:'Starter',s:91,c:'#059669',st:'healthy'},
  {n:'NovaTech Ltd',co:'Enterprise',s:79,c:'#7c3aed',st:'atrisk'},
  {n:'DataMesh Co',co:'Growth',s:61,c:'#2563eb',st:'critical'},
  {n:'SwiftAPI',co:'Professional',s:58,c:'#0891b2',st:'critical'},
];
function buildHealthList(filter='all') {
  const list = document.getElementById('health-list');

  if (!list) {
    console.log('health-list not found');
    return;
  }

  const filtered = filter === 'all'
    ? healthData
    : healthData.filter(h => h.st === filter);

  list.innerHTML = filtered.map(h => {
    const barCol = h.s >= 80 ? 'var(--green)' : h.s >= 65 ? 'var(--amber)' : 'var(--red)';
    return `<div class="health-row">
      <div class="health-avatar" style="background:${h.c}">${h.n.charAt(0)}</div>
      <div style="flex:1;min-width:0"><div class="health-name">${h.n}</div><div class="health-company">${h.co}</div></div>
      <div class="health-score-bar"><div class="progress"><div class="progress-fill" style="width:${h.s}%;background:${barCol}"></div></div></div>
      <div class="health-score-val" style="color:${barCol}">${h.s}</div>
      <div style="display:flex;gap:6px">
        ${h.s < 65 ? '<button class="btn btn-danger btn-sm" onclick="openModal(\'modal-escalate\')">Escalate</button>' : ''}
        <button class="btn btn-secondary btn-sm" onclick="openModal('modal-trigger-outreach')">Outreach</button>
      </div>
    </div>`;
  }).join('');
}

// ── USER LIST ──
const users = [
  {n:'Arjun Kumar',e:'arjun@nexusiq.io',r:'Admin',c:'#7c3aed',last:'Now'},
  {n:'Sarah Chen',e:'sarah@nexusiq.io',r:'Manager',c:'#2563eb',last:'2h ago'},
  {n:'Mike Ross',e:'mike@nexusiq.io',r:'Manager',c:'#0891b2',last:'5h ago'},
  {n:'Priya Sharma',e:'priya@nexusiq.io',r:'Analyst',c:'#059669',last:'Yesterday'},
  {n:'David Lee',e:'david@nexusiq.io',r:'Viewer',c:'#d97706',last:'3 days ago'},
];
function buildUserList() {
  const list = document.getElementById('user-list');

  if (!list) {
    console.log('user-list not found');
    return;
  }

  list.innerHTML = users.map(u => {
    const roleBadge =
      u.r === 'Admin' ? 'badge-purple' :
      u.r === 'Manager' ? 'badge-blue' :
      u.r === 'Analyst' ? 'badge-green' :
      'badge-gray';

    return `<div class="user-row">
      <div class="user-row-avatar" style="background:${u.c}">${u.n.charAt(0)}</div>
      <div class="user-row-info">
        <div class="user-row-name">${u.n}</div>
        <div class="user-row-email">${u.e} · Last seen: ${u.last}</div>
      </div>
      <span class="badge ${roleBadge}">${u.r}</span>
      <div class="user-row-actions">
        <button class="btn btn-secondary btn-sm" onclick="openModal('modal-edit-role')">Edit Role</button>
        <button class="btn btn-danger btn-sm" onclick="toast('User removed','error')">Remove</button>
      </div>
    </div>`;
  }).join('');
}
// ── ALERTS LIST ──
const alertsData = [
  {icon:'🔴',col:'var(--red-light)',title:'SMB Churn Spike Detected',desc:'7 accounts churned in last 48h vs avg 1.2 · AI root cause identified',sev:'critical'},
  {icon:'🔴',col:'var(--red-light)',title:'MRR Growth Rate Below Target',desc:'MoM growth dropped to 14.2% vs 18% target · 3 consecutive weeks',sev:'critical'},
  {icon:'🟡',col:'var(--amber-light)',title:'CloudBridge Health Score Critical',desc:'Score dropped from 71 to 52 in 7 days · No CSM activity in 14 days',sev:'warning'},
  {icon:'🟡',col:'var(--amber-light)',title:'Trial Conversion Rate Declining',desc:'Down from 32% to 28.4% this month · Product activation drop detected',sev:'warning'},
  {icon:'🔵',col:'var(--blue-light)',title:'LinkedIn CAC Rising',desc:'CAC increased $498 vs $380 target · Recommend budget reallocation',sev:'info'},
  {icon:'🟡',col:'var(--amber-light)',title:'API Integration Adoption Low',desc:'34% adoption for highest-impact retention feature · Action needed',sev:'warning'},
  {icon:'🔵',col:'var(--blue-light)',title:'Renewal Forecast Variance',desc:'60-day renewals tracking 3% below model prediction',sev:'info'},
];
function buildAlerts() {
  const list = document.getElementById('alerts-list');

  if (!list) {
    console.log('alerts-list not found');
    return;
  }

  list.innerHTML = alertsData.map(a => `<div class="alert-item">
    <div class="alert-icon" style="background:${a.col};font-size:18px">${a.icon}</div>
    <div class="alert-info">
      <div class="alert-title">${a.title}</div>
      <div class="alert-meta">${a.desc}</div>
    </div>
    <div class="alert-actions">
      <button class="btn btn-secondary btn-sm" onclick="openModal('modal-ai-root-cause')">Root Cause</button>
      <button class="btn btn-secondary btn-sm" onclick="toast('Alert threshold updated','success')">Edit</button>
      <button class="btn btn-secondary btn-sm" onclick="toast('Alert paused for 24h','info')">Pause</button>
      <button class="btn btn-green btn-sm" onclick="this.closest('.alert-item').remove();toast('Alert resolved','success')">Resolve</button>
    </div>
  </div>`).join('');
}

// ── AI INSIGHTS LIST ──
const insightData = [
  {type:'growth',color:'var(--green)',icon:'🚀',title:'Enterprise Expansion Opportunity',body:'48 enterprise accounts averaging 128% NRR. Increasing enterprise quota by 20% + targeted upsell campaigns could add $2.1M ARR in 12 months.',impact:'High',effort:'Medium'},
  {type:'churn',color:'var(--red)',icon:'⚠',title:'SMB Churn Risk Cluster Identified',body:'47 SMB accounts show declining engagement patterns. 3 have gone 14+ days without login. Estimated $3.2M ARR at risk without intervention.',impact:'Critical',effort:'Low'},
  {type:'product',color:'var(--blue)',icon:'⚡',title:'Analytics v2 Drives 2.3× Retention',body:'Accounts using Analytics v2 feature show 2.3× better retention. Only 62% adoption. A targeted onboarding campaign could protect $4.8M ARR.',impact:'High',effort:'Low'},
  {type:'growth',color:'var(--purple)',icon:'🔗',title:'Referral Program ROI is 9.3× vs SEM',body:'Referral CAC at $89 vs SEM $312. Doubling referral investment and launching a structured incentive program could add 400+ customers/quarter.',impact:'High',effort:'Medium'},
  {type:'product',color:'var(--teal)',icon:'🔌',title:'Integration Adoption = 41% Lower Churn',body:'Accounts with 2+ integrations churn at 1.4% vs 5.2% for those with none. Creating a 7-day integration onboarding checklist is a high-impact quick win.',impact:'Medium',effort:'Low'},
];
function buildAIInsights() {
  const list = document.getElementById('ai-insights-list');

  if (!list) {
    console.log('ai-insights-list not found');
    return;
  }

  list.innerHTML = insightData.map(i => `
    <div class="chart-card" style="margin-bottom:12px">
      <div class="chart-header">
        <div style="display:flex;align-items:center;gap:10px">
          <div style="width:36px;height:36px;border-radius:9px;background:${i.color}20;display:flex;align-items:center;justify-content:center;font-size:18px">${i.icon}</div>
          <div>
            <div class="chart-title">${i.title}</div>
            <div style="display:flex;gap:6px;margin-top:4px">
              <span class="badge badge-${i.impact==='Critical'?'red':i.impact==='High'?'blue':'amber'}">Impact: ${i.impact}</span>
              <span class="badge badge-green">Effort: ${i.effort}</span>
            </div>
          </div>
        </div>

        <div style="display:flex;gap:6px;flex-shrink:0">
          <button class="btn btn-secondary btn-sm" onclick="toast('Insight saved','success')">💾 Save</button>
          <button class="btn btn-secondary btn-sm" onclick="openModal('modal-share-insight')">📤 Share</button>
          <button class="btn btn-primary btn-sm" onclick="openModal('modal-create-action')">📋 Action Plan</button>
          <button class="btn btn-green btn-sm" onclick="this.closest('.chart-card').style.opacity='0.4';toast('Marked as implemented ✓','success')">✓ Implemented</button>
        </div>
      </div>

      <div style="font-size:13px;color:var(--text2);margin-top:8px">
        ${i.body}
      </div>
    </div>
  `).join('');
}

// ── HEATMAP ──
function buildHeatmap() {
  const grid = document.getElementById('heatmap-grid');
  const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  grid.innerHTML = days.map(d => {
    const intensity = Math.random() * 0.8 + 0.2;
    const bg = `rgba(37,99,235,${intensity.toFixed(2)})`;
    return `<div style="background:${bg};border-radius:4px;height:32px;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:600;color:white">${d}</div>`;
  }).join('') + Array.from({length:56},(_,i)=>{
    const v = Math.random();
    const bg = `rgba(37,99,235,${(v*0.9+0.05).toFixed(2)})`;
    return `<div style="background:${bg};border-radius:3px;height:28px;cursor:pointer" title="${Math.round(v*100)} interactions"></div>`;
  }).join('');
}

// ── USER JOURNEY ──
function buildJourney() {
  const steps = ['Sign Up','Email Verified','Onboarding','Core Feature','Integration','Invite Team','Paid'];
  const pcts = [100,84,72,65,48,31,29];
  const el = document.getElementById('journey-steps');
  el.innerHTML = steps.map((s,i) => `
    <div style="display:flex;align-items:center">
      <div style="text-align:center;min-width:80px">
        <div style="width:44px;height:44px;border-radius:50%;background:hsl(${220-i*20},80%,${55+i*4}%);color:white;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;margin:0 auto">${pcts[i]}%</div>
        <div style="font-size:10px;font-weight:600;color:var(--text2);margin-top:5px;line-height:1.2">${s}</div>
      </div>
      ${i < steps.length-1 ? '<div style="width:30px;height:2px;background:var(--border2);flex-shrink:0"></div>' : ''}
    </div>
  `).join('');
}

// ── CHARTS ──────────────────────────────────────────────────────────
const months = ['Jul','Aug','Sep','Oct','Nov','Dec','Jan','Feb','Mar','Apr','May','Jun'];
const chartDefaults = {
  responsive: true, maintainAspectRatio: false,
  plugins: {legend:{display:false}, tooltip:{backgroundColor:'#fff',titleColor:'#0f1324',bodyColor:'#4a5068',borderColor:'#e8eaf0',borderWidth:1,padding:10}},
  scales: {x:{grid:{display:false},ticks:{color:'#8b90a7',font:{size:10}}}, y:{grid:{color:'#f0f1f5'},ticks:{color:'#8b90a7',font:{size:10}}}}
};

function mkChart(id,type,labels,datasets,extraOptions={}) {
  const el = document.getElementById(id);
  if (!el) return;
  const existing = Chart.getChart(el);
  if (existing) existing.destroy();
  const ctx = el.getContext('2d');
  new Chart(ctx, { type, data:{labels,datasets}, options:{...chartDefaults,...extraOptions} });
}

function initSaaSCharts() {
  if (typeof Chart === 'undefined') return;

// MRR chart
mkChart('chart-mrr','line',months,[{
  data:[420,468,512,548,584,623,661,698,734,768,804,847],
  borderColor:'#2563eb',backgroundColor:'rgba(37,99,235,0.08)',fill:true,tension:0.4,pointRadius:3,pointBackgroundColor:'#2563eb',borderWidth:2.5
}]);

// Acquisition chart
mkChart('chart-acq','bar',months,[
  {data:[82,94,108,112,124,138,152,168,182,204,218,312],label:'New',backgroundColor:'rgba(37,99,235,0.85)',borderRadius:4},
  {data:[28,32,34,38,36,42,48,44,52,48,56,54],label:'Churned',backgroundColor:'rgba(220,38,38,0.7)',borderRadius:4}
],{plugins:{...chartDefaults.plugins,legend:{display:true,position:'top',labels:{font:{size:11},color:'#4a5068'}}}});

// Plan pie
const planCtx = document.getElementById('chart-plan');
if (planCtx) {
  const existingPlan = Chart.getChart(planCtx);
  if (existingPlan) existingPlan.destroy();
  new Chart(planCtx.getContext('2d'), {type:'doughnut',data:{labels:['Enterprise','Growth','Professional','Starter'],datasets:[{data:[412,298,108,29],backgroundColor:['#7c3aed','#2563eb','#059669','#8b90a7'],borderWidth:0,hoverOffset:6}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'right',labels:{font:{size:11},color:'#4a5068',padding:14}},tooltip:{backgroundColor:'#fff',titleColor:'#0f1324',bodyColor:'#4a5068',borderColor:'#e8eaf0',borderWidth:1}}}});
}

// Cohort line
mkChart('chart-cohort-exec','line',['M1','M2','M3','M4','M5','M6'],[
  {data:[100,94,88,82,78,74],label:'Jan 2025',borderColor:'#2563eb',backgroundColor:'transparent',tension:0.4,pointRadius:3,borderWidth:2},
  {data:[100,89,79,71,64,58],label:'Nov 2024',borderColor:'#dc2626',backgroundColor:'transparent',tension:0.4,pointRadius:3,borderWidth:2,borderDash:[5,4]}
],{plugins:{...chartDefaults.plugins,legend:{display:true,position:'top',labels:{font:{size:11},color:'#4a5068'}}}});

// Waterfall (revenue screen)
mkChart('chart-waterfall','bar',['New Biz','Expansion','Reactivation','Contraction','Churn','Net MRR'],[{
  data:[312,124,18,-18,-20,847],
  backgroundColor:['#2563eb','#059669','#0891b2','#f59e0b','#dc2626','#7c3aed'].map((c,i)=>c),
  borderRadius:5
}]);

// Rev breakdown
const rbCtx = document.getElementById('chart-rev-breakdown');
if (rbCtx) {
  const existingRb = Chart.getChart(rbCtx);
  if (existingRb) existingRb.destroy();
  new Chart(rbCtx.getContext('2d'), {type:'doughnut',data:{labels:['New Business','Expansion','Renewal','Reactivation'],datasets:[{data:[37,15,44,4],backgroundColor:['#2563eb','#059669','#7c3aed','#0891b2'],borderWidth:0}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'right',labels:{font:{size:11},color:'#4a5068',padding:12}},tooltip:{backgroundColor:'#fff',titleColor:'#0f1324',bodyColor:'#4a5068',borderColor:'#e8eaf0',borderWidth:1}}}});
}

// Churn by plan
mkChart('chart-churn-plan','bar',['Enterprise','Growth','Professional','Starter'],[{
  data:[0.8,1.9,3.2,5.1],
  backgroundColor:['#7c3aed','#2563eb','#059669','#8b90a7'],
  borderRadius:5
}],{plugins:{...chartDefaults.plugins},scales:{...chartDefaults.scales,y:{...chartDefaults.scales.y,max:7}}});

// Churn reasons
const crCtx = document.getElementById('chart-churn-reason');
if (crCtx) {
  const existingCr = Chart.getChart(crCtx);
  if (existingCr) existingCr.destroy();
  new Chart(crCtx.getContext('2d'), {type:'doughnut',data:{labels:['Pricing','Lack of features','Low usage','Competition','Support issues'],datasets:[{data:[34,28,18,12,8],backgroundColor:['#dc2626','#f59e0b','#2563eb','#7c3aed','#0891b2'],borderWidth:0}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'right',labels:{font:{size:11},color:'#4a5068',padding:10}},tooltip:{backgroundColor:'#fff',titleColor:'#0f1324',bodyColor:'#4a5068',borderColor:'#e8eaf0',borderWidth:1}}}});
}

// Subscription movement
mkChart('chart-sub-movement','bar',['Jan','Feb','Mar','Apr','May','Jun'],[
  {data:[98,112,108,124,134,142],label:'Upgrades',backgroundColor:'rgba(5,150,105,0.85)',borderRadius:4},
  {data:[22,28,24,26,24,28],label:'Downgrades',backgroundColor:'rgba(220,38,38,0.7)',borderRadius:4}
],{plugins:{...chartDefaults.plugins,legend:{display:true,position:'top',labels:{font:{size:11},color:'#4a5068'}}}});

// Forecast chart
const fcCtx = document.getElementById('chart-forecast');
if (fcCtx) {
  const existingFc = Chart.getChart(fcCtx);
  if (existingFc) existingFc.destroy();
  const hist = [623,661,698,734,768,804,847];
  const proj = [null,null,null,null,null,null,847,894,943,996,1024,1042,1065];
  const labels = ['Dec','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  new Chart(fcCtx.getContext('2d'), {type:'line',data:{labels,datasets:[
    {data:hist.concat(Array(6).fill(null)),label:'Historical',borderColor:'#2563eb',backgroundColor:'rgba(37,99,235,0.08)',fill:true,tension:0.4,pointRadius:3,borderWidth:2.5},
    {data:Array(6).fill(null).concat(proj.slice(6)),label:'Projected',borderColor:'#7c3aed',backgroundColor:'rgba(124,58,237,0.06)',fill:true,tension:0.4,pointRadius:3,borderWidth:2.5,borderDash:[6,3]}
  ]},options:{...chartDefaults,plugins:{...chartDefaults.plugins,legend:{display:true,position:'top',labels:{font:{size:11},color:'#4a5068'}}}}});
}
}

window.openModal = openModal;
window.closeModal = closeModal;
window.toast = toast;
window.filterHealth = filterHealth;
window.buildHealthList = buildHealthList;
window.showAdminTab = showAdminTab;
window.switchSaaSScreen = switchSaaSScreen;
window.initSaaSCharts = initSaaSCharts;
window.afterSaaSScreenRender = afterSaaSScreenRender;

// ── PROFILE MENU ──

// ── SaaS Workspace pill dropdown ──
function toggleSaasWsMenu(e) {
  if (e) e.stopPropagation();
  const menu = document.getElementById('saas-ws-menu');
  if (!menu) return;
  const isOpen = menu.style.display === 'block';
  menu.style.display = isOpen ? 'none' : 'block';
  if (!isOpen) {
    const close = (ev) => { if (!document.getElementById('saas-ws-wrap')?.contains(ev.target)) { menu.style.display = 'none'; document.removeEventListener('click', close); } };
    setTimeout(() => document.addEventListener('click', close), 0);
  }
}
function closeSaasWsMenu() {
  const menu = document.getElementById('saas-ws-menu');
  if (menu) menu.style.display = 'none';
}
window.toggleSaasWsMenu = toggleSaasWsMenu;
window.closeSaasWsMenu = closeSaasWsMenu;
window.toggleSaaSProfileMenu = function(e) {
  if (e) e.stopPropagation();
  const menu = document.getElementById('saas-profile-menu');
  if (!menu) return;
  menu.classList.toggle('open');
};
window.closeSaaSProfileMenu = function() {
  const menu = document.getElementById('saas-profile-menu');
  if (menu) menu.classList.remove('open');
};
document.addEventListener('click', function(e) {
  const row = document.querySelector('#saas-app .saas-profile-row');
  if (row && !row.contains(e.target)) closeSaaSProfileMenu();
});

// ── ATLAS AI CHAT — same pattern as wsToggleChat / wsReopenChat ──
let saasChatOpen = true;
window.toggleSaaSAtlasChat = function() {
  const panel = document.getElementById('saas-atlas-chat');
  if (!panel) return;
  if (saasChatOpen) {
    panel.classList.add('collapsed');
    saasChatOpen = false;
    // Inject orange FAB reopen button — identical look to other dashboards
    let fab = document.getElementById('saas-chat-reopen');
    if (!fab) {
      fab = document.createElement('button');
      fab.id = 'saas-chat-reopen';
      fab.title = 'Open Atlas AI Chat';
      fab.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" style="width:20px;height:20px"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>';
      fab.onclick = () => saasChatReopen();
      const wrap = panel.parentNode;
      if (wrap) { wrap.style.position = 'relative'; wrap.appendChild(fab); }
    }
    fab.style.display = 'flex';
  }
};
function saasChatReopen() {
  const panel = document.getElementById('saas-atlas-chat');
  if (panel) panel.classList.remove('collapsed');
  const fab = document.getElementById('saas-chat-reopen');
  if (fab) fab.style.display = 'none';
  saasChatOpen = true;
}
window.saasChatHint = function(el) {
  const input = document.getElementById('saas-atlas-input');
  if (input) { input.value = el.textContent.trim(); input.focus(); }
  saasChatSend();
};
window.saasChatKeydown = function(e) {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); saasChatSend(); }
};
window.saasChatSend = function() {
  const input = document.getElementById('saas-atlas-input');
  const msgs = document.getElementById('saas-atlas-msgs');
  if (!input || !msgs) return;
  const text = input.value.trim();
  if (!text) return;
  input.value = '';
  msgs.innerHTML += `<div class="saas-msg saas-msg-user"><div class="saas-msg-bubble">${text}</div><div class="saas-msg-time">Just now</div></div>`;
  msgs.scrollTop = msgs.scrollHeight;
  const typing = document.createElement('div');
  typing.className = 'saas-msg saas-msg-ai';
  typing.innerHTML = `<div class="saas-msg-bubble" style="background:#FFF4EE;border:1px solid #FFD4B3;display:flex;gap:5px;align-items:center;padding:12px 14px"><span style="width:6px;height:6px;border-radius:50%;background:#FF6600;animation:typingDot 1.4s infinite;display:inline-block"></span><span style="width:6px;height:6px;border-radius:50%;background:#FF6600;animation:typingDot 1.4s 0.2s infinite;display:inline-block"></span><span style="width:6px;height:6px;border-radius:50%;background:#FF6600;animation:typingDot 1.4s 0.4s infinite;display:inline-block"></span></div>`;
  msgs.appendChild(typing);
  msgs.scrollTop = msgs.scrollHeight;
  const replies = [
    `Got it! Applying <strong>${text.split(' ').slice(0,3).join(' ')}</strong> to the KPI Dashboard now.`,
    `Sure! I've updated the layout based on your request.`,
    `Done! The dashboard reflects your changes. Anything else?`,
    `Great idea — applied to the KPI Dashboard. Want to tweak anything else?`
  ];
  setTimeout(() => {
    typing.remove();
    msgs.innerHTML += `<div class="saas-msg saas-msg-ai"><div class="saas-msg-bubble">${replies[Math.floor(Math.random()*replies.length)]}</div><div class="saas-msg-time">Just now</div></div>`;
    msgs.scrollTop = msgs.scrollHeight;
  }, 1200);
};
window.toggleSaaSHelp = function() {};
window.saasHelpSend = function() {};

}
