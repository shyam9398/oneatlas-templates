export function initScript2() {

  
// ══════════════════════════════════════════════════
//  BUTTON FUNCTIONALITY — ALL WORKSPACE CONTROLS
// ══════════════════════════════════════════════════

// ── TOAST ──
function showOaToast(msg, duration=2400) {
  const t = document.getElementById('oa-global-toast');
  t.textContent = msg;
  t.style.opacity = '1';
  t.style.transform = 'translateX(-50%) translateY(0)';
  clearTimeout(t._timer);
  t._timer = setTimeout(() => {
    t.style.opacity = '0';
    t.style.transform = 'translateX(-50%) translateY(20px)';
  }, duration);
}

// ── MODAL HELPERS ──
// openModal / closeModal unified below (supports oa-overlay + modal-overlay)

// ── PREVIEW BUTTON ──
function openPreviewModal() {
  openModal('preview-modal');
}
function closePreviewModal() {
  closeModal('preview-modal');
}
let currentDevice = 'desktop';
function setPreviewDevice(device, btn) {
  currentDevice = device;
  document.querySelectorAll('.preview-device-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const frame = document.getElementById('preview-frame');
  const wrap = document.getElementById('preview-frame-wrap');
  const sizes = { desktop: { w: '100%', maxW: '1440px', h: '580px' }, tablet: { w: '768px', maxW: '768px', h: '520px' }, mobile: { w: '390px', maxW: '390px', h: '700px' } };
  const s = sizes[device];
  frame.style.width = s.w;
  frame.style.maxWidth = s.maxW;
  frame.style.height = s.h;
  document.getElementById('preview-url-bar').textContent = 'myapp.oneatlas.ai/preview — ' + device.charAt(0).toUpperCase() + device.slice(1);
}

// ── MANAGING DRAWER ──
function openManagingDrawer() {
  document.getElementById('managing-drawer').classList.add('open');
  document.getElementById('managing-backdrop').classList.add('open');
}
function closeManagingDrawer() {
  document.getElementById('managing-drawer').classList.remove('open');
  document.getElementById('managing-backdrop').classList.remove('open');
}
function switchMgmtTab(el, tabId) {
  document.querySelectorAll('.mgmt-nav-item').forEach(i => i.classList.remove('active'));
  el.classList.add('active');
  document.querySelectorAll('.mgmt-tab-content').forEach(t => t.style.display = 'none');
  const tab = document.getElementById(tabId);
  if (tab) tab.style.display = 'block';
}

// ── GITHUB MODAL ──
function openGitHubModal() { openModal('github-modal'); }
function closeGitHubModal() { closeModal('github-modal'); }
function githubOAuth() {
  showOaToast('Opening GitHub OAuth...');
  setTimeout(() => {
    document.getElementById('github-step-1').style.display = 'none';
    document.getElementById('github-step-2').style.display = 'block';
    showOaToast('GitHub connected successfully!');
  }, 1200);
}
function selectGitHubRepo(name) {
  showOaToast('Connecting to ' + name + '...');
  setTimeout(() => {
    document.getElementById('github-step-1').style.display = 'none';
    document.getElementById('github-step-2').style.display = 'block';
    showOaToast('Repository connected: ' + name);
  }, 900);
}
function createGitHubRepo() {
  const name = document.getElementById('gh-new-repo').value.trim();
  if (!name) { showOaToast('Enter a repository name'); return; }
  showOaToast('Creating ' + name + '...');
  setTimeout(() => {
    document.getElementById('github-step-1').style.display = 'none';
    document.getElementById('github-step-2').style.display = 'block';
    showOaToast('Repository created: ' + name);
  }, 900);
}

// ── INVITE MODAL ──
function openInviteModal() { openModal('invite-modal'); }
function sendInvite() {
  const email = document.getElementById('invite-email').value.trim();
  if (!email || !email.includes('@')) { showOaToast('Please enter a valid email'); return; }
  const role = document.getElementById('invite-role').value.split(' — ')[0];
  const history = document.getElementById('invite-history');
  const newEntry = document.createElement('div');
  newEntry.style.cssText = 'display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--border-2)';
  newEntry.innerHTML = `<div style="width:28px;height:28px;border-radius:7px;background:#FF6600;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:11px">${email[0].toUpperCase()}</div><div style="flex:1"><div style="font-size:12.5px;font-weight:600;color:var(--text)">${email}</div><div style="font-size:11px;color:var(--text-4)">${role}</div></div><span style="font-size:11px;padding:3px 9px;border-radius:20px;font-weight:700;background:#FEF3C7;color:#D97706">Pending</span>`;
  history.appendChild(newEntry);
  document.getElementById('invite-email').value = '';
  showOaToast('Invitation sent to ' + email);
}

// ── DEVICE MENU ──
let deviceMenuOpen = false;
let currentDeviceMode = 'desktop';
function openDeviceMenu(btn) {
  const existing = document.querySelector('.oa-device-menu');
  if (existing) existing.remove();
  const menu = document.createElement('div');
  menu.className = 'oa-device-menu';
  menu.innerHTML = [['desktop','🖥 Desktop','1440px'],['tablet','📱 Tablet','768px'],['mobile','📲 Mobile','390px']].map(([d,l,s]) => `<div class="device-opt${currentDeviceMode===d?' active':''}" onclick="setDeviceMode('${d}',event)">${l}<span class="device-opt-size">${s}</span></div>`).join('');
  btn.style.position = 'relative';
  btn.appendChild(menu);
  setTimeout(() => menu.classList.add('open'), 10);
  const close = (e) => { if (!btn.contains(e.target)) { menu.classList.remove('open'); setTimeout(() => menu.remove(), 180); document.removeEventListener('click', close); } };
  setTimeout(() => document.addEventListener('click', close), 100);
}
function setDeviceMode(device, e) {
  if (e) e.stopPropagation();
  currentDeviceMode = device;
  const wsContent = document.getElementById('ws-content-area');
  const wsBody = document.querySelector('.ws-body');
  const sizes = { desktop: { w: '', maxW: '' }, tablet: { w: '768px', maxW: '768px' }, mobile: { w: '390px', maxW: '390px' } };
  const s = sizes[device];
  if (wsContent) {
    wsContent.style.transition = 'all 0.4s cubic-bezier(0.16,1,0.3,1)';
    wsContent.style.width = s.w;
    wsContent.style.maxWidth = s.maxW;
    wsContent.style.margin = s.w ? '0 auto' : '';
  }
  const labels = { desktop: '🖥 Desktop', tablet: '📱 Tablet', mobile: '📲 Mobile' };
  const deviceBtn = document.getElementById('ws-btn-device');
  if (deviceBtn) {
    const svgs = deviceBtn.querySelectorAll('svg');
    const firstSvg = svgs[0];
    deviceBtn.innerHTML = '';
    if (firstSvg) deviceBtn.appendChild(firstSvg);
    deviceBtn.append(' ' + labels[device]);
    deviceBtn.onclick = function() { openDeviceMenu(this); };
  }
  document.querySelectorAll('.device-opt').forEach(o => o.classList.remove('active'));
  showOaToast('Preview: ' + device.charAt(0).toUpperCase() + device.slice(1) + ' (' + { desktop:'1440px', tablet:'768px', mobile:'390px' }[device] + ')');
  const menu = document.querySelector('.oa-device-menu');
  if (menu) { menu.classList.remove('open'); setTimeout(() => menu.remove(), 180); }
}

// ── PUBLISH MODAL ──
function openPublishModal() { openModal('publish-modal'); document.getElementById('publish-form').style.display='block'; document.getElementById('publish-success').style.display='none'; }
function selectPlatform(el) {
  document.querySelectorAll('.oa-radio-opt').forEach(o => o.classList.remove('selected'));
  el.classList.add('selected');
}
function doPublish() {
  const url = document.getElementById('publish-url').value || 'myapp.oneatlas.ai';
  const vis = document.getElementById('publish-visibility').value.split(' — ')[0];
  document.getElementById('publish-form').style.display = 'none';
  document.getElementById('publish-success').style.display = 'block';
  document.getElementById('publish-live-url').textContent = 'https://' + url;
  showOaToast('🎉 App published successfully!', 3000);
}
function copyPublishUrl() {
  const url = document.getElementById('publish-live-url').textContent;
  navigator.clipboard.writeText(url).catch(() => {});
  showOaToast('URL copied to clipboard!');
}

// ── ATTACH MENU ──
function wsAttachFile() {
  const btn = document.querySelector('.ws-chat-icon-btn[title="Attach file or image"]');
  const menu = document.getElementById('attach-menu');
  const inputWrap = document.querySelector('.ws-chat-input-wrap');
  if (menu.classList.contains('open')) { closeAttachMenu(); return; }
  if (inputWrap) {
    inputWrap.style.position = 'relative';
    inputWrap.appendChild(menu);
  }
  menu.classList.add('open');
  const close = (e) => { if (!menu.contains(e.target) && e.target !== btn) { closeAttachMenu(); document.removeEventListener('click', close); } };
  setTimeout(() => document.addEventListener('click', close), 100);
}
function closeAttachMenu() {
  document.getElementById('attach-menu').classList.remove('open');
}
function triggerFileAttach(accept) {
  const fi = document.getElementById('ws-file-input');
  fi.accept = accept;
  fi.click();
}
function wsHandleFileAttach(input) {
  if (input.files.length > 0) {
    const names = Array.from(input.files).map(f => f.name).join(', ');
    addChatMsg('📎 Attached: ' + names, 'user');
    setTimeout(() => addChatMsg('Got it! I can see the attached file(s). How would you like me to use them in your project?', 'ai'), 800);
  }
}

// ── VOICE RECORDING (Real SpeechRecognition) ──
let wsRecognition = null;
let wsVoiceRecorder = null; // kept for compat
let wsVoiceChunks = [];
function wsToggleVoice(btn) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    showOaToast('Speech recognition not supported in this browser');
    return;
  }
  if (wsRecognition && btn.classList.contains('ws-voice-active')) {
    wsRecognition.stop();
    btn.classList.remove('ws-voice-active');
    btn.style.background = 'none';
    btn.style.color = 'var(--text-4)';
    btn.querySelector('svg').style.animation = '';
    showOaToast('Stopped recording');
    return;
  }
  wsRecognition = new SpeechRecognition();
  wsRecognition.continuous = true;
  wsRecognition.interimResults = true;
  wsRecognition.lang = 'en-US';
  wsRecognition.onstart = () => {
    btn.classList.add('ws-voice-active');
    btn.style.background = 'rgba(255,89,150,0.1)';
    btn.style.color = 'var(--coral)';
    btn.querySelector('svg').style.animation = 'voicePulse 1s ease-in-out infinite';
    showOaToast('🎙 Listening... Click again to stop');
  };
  wsRecognition.onresult = (event) => {
    let transcript = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      transcript += event.results[i][0].transcript;
    }
    const input = document.getElementById('ws-chat-input');
    if (input) {
      input.value = transcript;
      input.style.height = 'auto';
      input.style.height = Math.min(input.scrollHeight, 80) + 'px';
    }
  };
  wsRecognition.onend = () => {
    btn.classList.remove('ws-voice-active');
    btn.style.background = 'none';
    btn.style.color = 'var(--text-4)';
    btn.querySelector('svg').style.animation = '';
    const input = document.getElementById('ws-chat-input');
    if (input && input.value.trim()) showOaToast('Voice transcribed!');
  };
  wsRecognition.onerror = (event) => {
    btn.classList.remove('ws-voice-active');
    btn.style.background = 'none';
    btn.style.color = 'var(--text-4)';
    btn.querySelector('svg').style.animation = '';
    if (event.error === 'not-allowed') {
      showOaToast('Microphone access denied. Please allow mic permissions.');
    } else if (event.error === 'no-speech') {
      showOaToast('No speech detected. Try again.');
    } else {
      showOaToast('Voice recognition error: ' + event.error);
    }
  };
  try {
    wsRecognition.start();
  } catch(e) {
    showOaToast('Could not start voice recognition');
  }
}

// ── CHAT TOGGLE (CLOSE/REOPEN) ──
let wsChatVisible = true;
function wsToggleChat(btn) {
  const panel = document.querySelector('.ws-chat-panel');
  if (!panel) return;
  if (wsChatVisible) {
    panel.style.display = 'none';
    wsChatVisible = false;
    // Show reopen button
    let reopenBtn = document.getElementById('ws-chat-reopen');
    if (!reopenBtn) {
      reopenBtn = document.createElement('button');
      reopenBtn.id = 'ws-chat-reopen';
      reopenBtn.title = 'Open AI Chat';
      reopenBtn.style.cssText = 'position:absolute;right:16px;bottom:80px;width:44px;height:44px;border-radius:50%;background:#FF6600;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 16px rgba(99,91,255,0.4);z-index:100;transition:transform 0.2s';
      reopenBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" style="width:20px;height:20px"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>';
      reopenBtn.onclick = () => wsReopenChat();
      panel.parentNode.style.position = 'relative';
      panel.parentNode.appendChild(reopenBtn);
    } else {
      reopenBtn.style.display = 'flex';
    }
  }
}
function wsReopenChat() {
  const panel = document.querySelector('.ws-chat-panel');
  if (panel) panel.style.display = 'flex';
  const reopenBtn = document.getElementById('ws-chat-reopen');
  if (reopenBtn) reopenBtn.style.display = 'none';
  wsChatVisible = true;
}

// ── CHATBOT SESSION ISOLATION ──
const chatSessions = {};
let currentChatTemplateId = null;

function getChatSessionKey(templateName) {
  return 'chat_' + (templateName || 'default').toLowerCase().replace(/[^a-z0-9]+/g, '_');
}

function loadChatSession(templateName) {
  const key = getChatSessionKey(templateName);
  if (currentChatTemplateId === key) return; // already loaded
  currentChatTemplateId = key;
  const msgs = document.getElementById('ws-chat-msgs');
  if (!msgs) return;
  // Save current session if different
  if (chatSessions[key]) {
    msgs.innerHTML = chatSessions[key];
  } else {
    // Fresh chat for this template
    msgs.innerHTML = `<div class="ws-msg ws-msg-ai">
      <div class="ws-msg-bubble">Hi! I'm Atlas AI. I can customize any aspect of <strong>${templateName}</strong> — colors, layouts, screens, content, and more. What would you like to change?</div>
      <div class="ws-msg-time">Just now</div>
    </div>`;
    chatSessions[key] = msgs.innerHTML;
  }
  scrollChat();
}

function saveChatSession() {
  if (!currentChatTemplateId) return;
  const msgs = document.getElementById('ws-chat-msgs');
  if (msgs) chatSessions[currentChatTemplateId] = msgs.innerHTML;
}

// Patch addChatMsg to also save session
const _origAddChatMsg = addChatMsg;
function addChatMsg(text, type) {
  _origAddChatMsg(text, type);
  saveChatSession();
}

// ── MANAGING: Add User ──
function mgmtShowAddUser() {
  const form = document.getElementById('mgmt-add-user-form');
  if (form) form.style.display = form.style.display === 'none' ? 'block' : 'none';
}
function mgmtAddUser() {
  const name = (document.getElementById('new-user-name') || {}).value?.trim();
  const email = (document.getElementById('new-user-email') || {}).value?.trim();
  const role = (document.getElementById('new-user-role') || {}).value;
  if (!name) { showOaToast('Enter user name'); return; }
  if (!email || !email.includes('@')) { showOaToast('Enter valid email'); return; }
  const colors = ['linear-gradient(135deg,#635BFF,#FF5996)','linear-gradient(135deg,#00D4B1,#00D4FF)','linear-gradient(135deg,#F97316,#FFB17A)','linear-gradient(135deg,#8B5CF6,#EC4899)'];
  const col = colors[Math.floor(Math.random() * colors.length)];
  const roleColors = {Admin:['#EDE9FE','#7C3AED'],Editor:['#DBEAFE','#2563EB'],Viewer:['#F1F5F9','#475569']};
  const [rbg, rfc] = roleColors[role] || roleColors.Viewer;
  const row = document.createElement('div');
  row.className = 'mgmt-user-row';
  row.style.cssText = 'display:grid;grid-template-columns:2fr 2fr 1fr 1fr 1fr;padding:11px 14px;border-bottom:1px solid var(--border-2);align-items:center';
  row.innerHTML = `
    <div style="display:flex;align-items:center;gap:9px"><div style="width:30px;height:30px;border-radius:8px;background:${col};display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:12px;flex-shrink:0">${name[0].toUpperCase()}</div><div style="font-size:13px;font-weight:600;color:var(--text)">${name}</div></div>
    <div style="font-size:12px;color:var(--text-3)">${email}</div>
    <div><span style="font-size:11px;padding:3px 9px;border-radius:20px;font-weight:700;background:${rbg};color:${rfc}">${role}</span></div>
    <div><span style="font-size:11px;padding:3px 9px;border-radius:20px;background:#D1FAE5;color:#059669;font-weight:700">Online</span></div>
    <div style="display:flex;gap:4px">
      <button onclick="showOaToast('Editing ${name}')" style="padding:4px 8px;background:#FFF4EE;border:none;border-radius:6px;font-size:11px;font-weight:600;color:#FF6600;cursor:pointer">Edit</button>
      <button onclick="mgmtDeleteUser(this,'${name}')" style="padding:4px 8px;background:#FEE2E2;border:none;border-radius:6px;font-size:11px;font-weight:600;color:#DC2626;cursor:pointer">Delete</button>
    </div>`;
  const tbody = document.getElementById('mgmt-user-rows');
  if (tbody) tbody.appendChild(row);
  document.getElementById('new-user-name').value = '';
  document.getElementById('new-user-email').value = '';
  document.getElementById('mgmt-add-user-form').style.display = 'none';
  showOaToast('User ' + name + ' added successfully!');
}
function mgmtDeleteUser(btn, name) {
  const row = btn.closest('.mgmt-user-row');
  if (row) { row.style.opacity = '0'; row.style.transition = 'opacity 0.3s'; setTimeout(() => row.remove(), 300); }
  showOaToast(name + ' removed');
}
function mgmtFilterUsers(q) {
  document.querySelectorAll('.mgmt-user-row').forEach(row => {
    row.style.display = row.textContent.toLowerCase().includes(q.toLowerCase()) ? '' : 'none';
  });
}

// ── MANAGING: Database ──
function mgmtShowAddTable() {
  const form = document.getElementById('mgmt-add-table-form');
  if (form) form.style.display = form.style.display === 'none' ? 'block' : 'none';
}
function mgmtAddTable() {
  const input = document.getElementById('new-table-name');
  const name = input ? input.value.trim() : '';
  if (!name) { showOaToast('Enter a table name'); return; }
  const safeName = name.toLowerCase().replace(/[^a-z0-9_]+/g, '_');
  const emojis = ['📋','🗂️','📊','🗃️','📝','🔖'];
  const emoji = emojis[Math.floor(Math.random() * emojis.length)];
  const records = Math.floor(Math.random() * 500) + 10;
  const row = document.createElement('div');
  row.className = 'mgmt-db-row';
  row.style.cssText = 'background:#fff;border:1.5px solid var(--border);border-radius:12px;padding:14px 16px;margin-bottom:10px;display:flex;align-items:center;gap:12px;cursor:pointer;transition:border-color 0.15s';
  row.onmouseover = () => row.style.borderColor = 'var(--purple-m)';
  row.onmouseout = () => row.style.borderColor = 'var(--border)';
  row.onclick = () => showOaToast('Opening ' + safeName + ' table...');
  row.innerHTML = `
    <div style="font-size:22px">${emoji}</div>
    <div style="flex:1">
      <div style="font-size:13px;font-weight:700;color:var(--text)">${safeName}</div>
      <div style="font-size:11px;color:var(--text-4)">${records} records · Just created</div>
    </div>
    <div style="display:flex;gap:6px">
      <button onclick="event.stopPropagation();showOaToast('Viewing '+${JSON.stringify(safeName)}+' records')" style="padding:4px 10px;background:#FFF4EE;border:none;border-radius:6px;font-size:11px;font-weight:600;color:#FF6600;cursor:pointer">View</button>
      <button onclick="event.stopPropagation();mgmtDeleteTable(this,${JSON.stringify(safeName)})" style="padding:4px 10px;background:#FEE2E2;border:none;border-radius:6px;font-size:11px;font-weight:600;color:#DC2626;cursor:pointer">Delete</button>
    </div>`;
  const container = document.getElementById('mgmt-db-tables');
  if (container) container.appendChild(row);
  if (input) input.value = '';
  document.getElementById('mgmt-add-table-form').style.display = 'none';
  showOaToast('Table "' + safeName + '" created!');
}
function mgmtDeleteTable(btn, name) {
  const row = btn.closest('.mgmt-db-row');
  if (row) { row.style.opacity = '0'; row.style.transition = 'opacity 0.3s'; setTimeout(() => row.remove(), 300); }
  showOaToast('Table "' + name + '" deleted');
}


// ── CREDITS (workspace sidebar button) ──
function openCreditsModal() { openModal('credits-modal'); }

// ── PROFILE ──
function openProfileModal() { openModal('profile-modal'); }
function switchProfileTab(el, tabId) {
  document.querySelectorAll('.profile-tab').forEach(t => { t.style.color = 'var(--text-3)'; t.style.borderBottomColor = 'transparent'; });
  el.style.color = 'var(--indigo)';
  el.style.borderBottomColor = 'var(--indigo)';
  ['ptab-account','ptab-projects','ptab-activity','ptab-subscriptions'].forEach(t => { const el2 = document.getElementById(t); if(el2) el2.style.display='none'; });
  const tab = document.getElementById(tabId);
  if (tab) tab.style.display = 'block';
}

// ── TEMPLATE UPDATES (web/globe icon) ──
function openTemplateUpdatesModal() { openModal('template-updates-modal'); }
function switchTemplateTab(el, tabId) {
  document.querySelectorAll('.template-tab').forEach(t => { t.style.color = 'var(--text-3)'; t.style.borderBottomColor = 'transparent'; });
  el.style.color = 'var(--indigo)';
  el.style.borderBottomColor = 'var(--indigo)';
  ['ttab-new','ttab-updates','ttab-recent'].forEach(t => { const el2=document.getElementById(t); if(el2) el2.style.display='none'; });
  const tab = document.getElementById(tabId);
  if (tab) tab.style.display = 'block';
}

// ── NOTIFICATIONS (bell icon) ──
function openNotificationsModal() { openModal('notifications-modal'); }

// ── WIRE UP EXISTING LEFT SIDEBAR BUTTONS ──
document.addEventListener('DOMContentLoaded', () => {
  // Show GitHub and + buttons once workspace opens
  const origOpenWorkspace = window.openWorkspace;
  window.openWorkspace = function(name, screen) {
    if(origOpenWorkspace) origOpenWorkspace(name, screen);
    const ghBtn = document.getElementById('ws-btn-github');
    const addBtn = document.getElementById('ws-btn-add-connection');
    if(ghBtn) ghBtn.style.display = 'flex';
    if(addBtn) addBtn.style.display = 'flex';
  };

  // Wire left sidebar bottom icons (web + bell)
  document.querySelectorAll('.ws-sidebar-bottom-icon, [class*="sidebar"] svg, .ws-sb-icon').forEach(icon => {});

  // Find all sidebar bottom buttons by querying
  const wireBottomIcons = () => {
    document.querySelectorAll('.ws-sidebar button, .ws-sidebar [role="button"]').forEach(btn => {
      const svg = btn.querySelector('svg');
      if (!svg) return;
      const path = svg.innerHTML;
      if (path.includes('globe') || path.includes('M12 2a10') || btn.title?.toLowerCase().includes('web') || btn.getAttribute('onclick')?.includes('web')) {
        btn.addEventListener('click', openTemplateUpdatesModal);
      }
      if (path.includes('bell') || btn.title?.toLowerCase().includes('notif')) {
        btn.addEventListener('click', openNotificationsModal);
      }
    });
  };
  setTimeout(wireBottomIcons, 500);

  // Wire Workspace sidebar credit button
  document.querySelectorAll('.ws-sidebar-item, .ws-nav-item').forEach(item => {
    if (item.textContent.trim().toLowerCase().includes('workspace') || item.textContent.trim().toLowerCase().includes('credit')) {
      item.addEventListener('click', openCreditsModal);
    }
  });

  // Wire profile links
  document.querySelectorAll('a, button, [onclick]').forEach(el => {
    const txt = el.textContent.trim().toLowerCase();
    if ((txt === 'your profile' || txt === 'profile') && !el.getAttribute('onclick')) {
      el.addEventListener('click', (e) => { e.preventDefault(); openProfileModal(); });
    }
  });
});

// ── MAKE KEY FUNCTIONS GLOBAL ──
window.openPreviewModal = openPreviewModal;
window.openManagingDrawer = openManagingDrawer;
window.openGitHubModal = openGitHubModal;
window.openInviteModal = openInviteModal;
window.openPublishModal = openPublishModal;
window.openCreditsModal = openCreditsModal;
window.openProfileModal = openProfileModal;
window.openTemplateUpdatesModal = openTemplateUpdatesModal;
window.openNotificationsModal = openNotificationsModal;
window.openAddConnectionModal = openInviteModal; // alias

// ── NOTIFICATIONS: Initialize rendered list ──
function initNotifications() {
  const notifs = [
    {t:'Alex invited you to join TaskFlow',d:'You were invited as Editor',time:'10m',read:false,icon:'👥',col:'#635BFF'},
    {t:'Project update: AI Studio v2.0',d:'New features added to your template',time:'1h',read:false,icon:'🚀',col:'#00D4B1'},
    {t:'Sam mentioned you in a comment',d:'"@Alex can you review this?"',time:'3h',read:false,icon:'💬',col:'#FF5996'},
    {t:'Weekly analytics report ready',d:'Your app had 1,240 views this week',time:'1d',read:true,icon:'📊',col:'#F59E0B'},
    {t:'GitHub sync complete',d:'12 commits pushed successfully',time:'2d',read:true,icon:'🔗',col:'#697386'}
  ];
  const list = document.getElementById('notifications-list');
  if (!list) return;
  list.innerHTML = notifs.map(n => `
    <div class="oa-notif-item" style="${n.read?'opacity:0.65':''}">
      <div class="oa-notif-dot${n.read?' read':''}"></div>
      <div style="flex:1">
        <div style="font-size:13.5px;font-weight:700;color:var(--text)">${n.t}</div>
        <div style="font-size:12px;color:var(--text-3);margin-top:2px">${n.d}</div>
        <div style="font-size:11px;color:var(--text-4);margin-top:4px">${n.time} ago</div>
      </div>
    </div>`).join('');
}
function markAllNotifRead() {
  document.querySelectorAll('#notifications-list .oa-notif-dot').forEach(d => { d.classList.add('read'); });
  document.querySelectorAll('#notifications-list .oa-notif-item').forEach(i => { i.style.opacity='0.65'; });
  const badge = document.querySelector('#notifications-modal .oa-modal-title span');
  if (badge) badge.style.display = 'none';
  showOaToast('All notifications marked as read');
}
document.addEventListener('DOMContentLoaded', initNotifications);



}
