// @ts-nocheck
export function initScript3() {

// ═══════════════════════════════════════════════════════════════
// ONEATLAS COMPREHENSIVE FIX — Injected patch script
// Fixes: Template workspace opening, Workflow Studio buttons,
//        Settings sidebar, chatbot send, voice, view-all templates
// ═══════════════════════════════════════════════════════════════

(function() {
  'use strict';

  // ─── 1. EXTEND WORKSPACE_TEMPLATES to include ALL templates ───
  // Ensure every template in ALL_TEMPLATES can open workspace
  const EXTRA_TEMPLATES = [
    'Job Marketplace','Freelancer Platform','Booking Platform',
    'Inventory Manager','Order Tracking System','Supplier Portal',
    'Retail Dashboard','Subscription Storefront',
    'Sprint Planner','Notes Workspace','Calendar Manager',
    'Team Collaboration Hub',
    'Employee Dashboard','Vendor Workspace','Member App','Partner Hub',
    'Vendor Marketplace','Service Directory','Community Marketplace',
    'KPI Dashboard','SaaS Analytics Dashboard','Revenue Tracker',
    'Marketing Analytics','Executive Reports','Live Monitoring Dashboard',
    'Lead Tracker','Client Management',
    'MedCore','Vision Hub','FocusFlow','TeamOS','TaskFlow Pro','AI Studio',
  ];
  if (window.WORKSPACE_TEMPLATES) {
    EXTRA_TEMPLATES.forEach(t => {
      if (!window.WORKSPACE_TEMPLATES.includes(t)) {
        window.WORKSPACE_TEMPLATES.push(t);
      }
    });
  }

  // ─── 2. TOAST HELPER (safe wrapper) ───
  function toast(msg, dur) {
    if (window.showOaToast) window.showOaToast(msg, dur || 2500);
  }

  // ─── 3. WORKFLOW STUDIO FULL INTERACTIVE PANEL ───
  // We intercept renderWCDashboard to inject real onclick logic.
  // Since the DOM is dynamic (innerHTML), we use event delegation on ws-content-area.

  document.addEventListener('click', function(e) {
    // Only act when inside workspace (skip NexusIQ SaaS dashboard shell)
    const area = document.getElementById('ws-content-area');
    if (!area || !area.contains(e.target) || e.target.closest('#saas-app')) return;

    // ── WORKFLOW STUDIO: Left sidebar tool buttons ──
    const btn = e.target.closest('button, [role="button"]');
    if (btn) {
      const txt = btn.textContent.trim();

      // Templates button → switch to templates panel
      if (txt === 'Templates') {
        e.stopPropagation();
        openWorkspaceToolPanel('templates');
        return;
      }
      if (txt === 'Triggers') {
        e.stopPropagation();
        openWorkspaceToolPanel('triggers');
        return;
      }
      if (txt === 'Integrations') {
        e.stopPropagation();
        openWorkspaceToolPanel('integrations');
        return;
      }
      if (txt === 'Actions') {
        e.stopPropagation();
        openWorkspaceToolPanel('actions');
        return;
      }
      if (txt === 'AI Tools') {
        e.stopPropagation();
        openWorkspaceToolPanel('aitools');
        return;
      }

      // ── WORKFLOW STUDIO: Save ──
      if (txt === 'Save' || btn.onclick && btn.onclick.toString().includes("Workflow saved")) {
        e.stopPropagation();
        wfSave(btn);
        return;
      }

      // ── WORKFLOW STUDIO: Add New Workflow ──
      if (txt === 'Add New Workflow') {
        e.stopPropagation();
        openAddWorkflowModal();
        return;
      }

      // ── SETTINGS SIDEBAR ITEMS (inside ws-content-area) ──
      const sidebarItem = e.target.closest('[data-settings-tab]');
      if (sidebarItem) {
        const tab = sidebarItem.getAttribute('data-settings-tab');
        switchSettingsTab(tab);
        return;
      }
    }
  });

  // ─── 4. SETTINGS SIDEBAR SWITCHING (global intercept) ───
  // Patch renderWCSettings and renderSettings so sidebar items switch content
  document.addEventListener('click', function(e) {
    const area = document.getElementById('ws-content-area');
    if (!area || !area.contains(e.target) || e.target.closest('#saas-app')) return;

    // Find click on settings sidebar item (divs with cursor:pointer inside grid 200px column)
    const item = e.target.closest('div[style*="cursor:pointer"]');
    if (!item) return;

    // Check if it's inside a settings sidebar (narrow left column)
    const parent = item.parentElement;
    if (!parent) return;

    const settingsLabels = ['General','AI Engine','Integrations','Notifications','Security','Billing','API Keys',
                            'Profile','Workspace','AI Preferences','Team & Permissions'];
    const labelText = item.textContent.trim();
    if (!settingsLabels.includes(labelText)) return;

    // Check it's in a sidebar-like container (the grid's left column)
    const grandparent = parent.closest('[style*="grid-template-columns"]');
    if (!grandparent) return;

    // It's a settings sidebar click — switch content
    switchSettingsPanel(labelText, grandparent);
  });

  function switchSettingsPanel(label, gridContainer) {
    // Highlight active item
    const sidebar = gridContainer.querySelector('div > div:first-child');
    if (sidebar) {
      sidebar.querySelectorAll('div[style*="cursor:pointer"]').forEach(el => {
        el.style.fontWeight = '500';
        el.style.background = 'transparent';
        el.style.color = 'var(--text-2)';
      });
      const activeEl = Array.from(sidebar.querySelectorAll('div[style*="cursor:pointer"]')).find(el => el.textContent.trim() === label);
      const c = window.getColor ? window.getColor(window.currentTemplateName || '') : '#635BFF';
      if (activeEl) {
        activeEl.style.fontWeight = '600';
        activeEl.style.background = c + '10';
        activeEl.style.color = c;
      }
    }

    // Render the right-hand content panel
    const contentPanel = gridContainer.querySelector('div:last-child');
    if (!contentPanel) return;
    const c = window.getColor ? window.getColor(window.currentTemplateName || '') : '#635BFF';

    const panels = {
      'General': renderSettingsPanelGeneral(c),
      'Profile': renderSettingsPanelGeneral(c),
      'AI Engine': renderSettingsPanelAI(c),
      'AI Preferences': renderSettingsPanelAI(c),
      'Integrations': renderSettingsPanelIntegrations(c),
      'Workspace': renderSettingsPanelGeneral(c),
      'Notifications': renderSettingsPanelNotifications(c),
      'Security': renderSettingsPanelSecurity(c),
      'Billing': renderSettingsPanelBilling(c),
      'API Keys': renderSettingsPanelAPIKeys(c),
      'Team & Permissions': renderSettingsPanelTeam(c),
    };

    contentPanel.innerHTML = panels[label] || panels['General'];
    toast('Switched to ' + label);
  }

  function renderSettingsPanelGeneral(c) {
    return `
      <div style="background:#fff;border:1.5px solid var(--border);border-radius:14px;padding:20px;margin-bottom:14px">
        <div style="font-size:14px;font-weight:700;color:var(--text);margin-bottom:16px">General Settings</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px">
          ${[['Workspace Name','My Workspace'],['Display Name','Your Name'],['Email','you@company.com'],['Timezone','Asia/Kolkata (UTC+5:30)']].map(([l,v])=>`
            <div>
              <div style="font-size:11px;font-weight:700;color:var(--text-4);margin-bottom:5px;text-transform:uppercase;letter-spacing:0.5px">${l}</div>
              <input style="width:100%;padding:9px 12px;background:var(--bg);border:1.5px solid var(--border);border-radius:9px;font-size:13px;color:var(--text);font-family:var(--font);outline:none" value="${v}" onfocus="this.style.borderColor='${c}'" onblur="this.style.borderColor='var(--border)'"/>
            </div>
          `).join('')}
        </div>
        <button onclick="window.showOaToast && window.showOaToast('General settings saved ✓')" style="padding:9px 22px;background:${c};color:#fff;border:none;border-radius:9px;font-size:13px;font-weight:600;cursor:pointer;font-family:var(--font)">Save Changes</button>
      </div>
      <div style="background:#fff;border:1.5px solid var(--border);border-radius:14px;padding:20px">
        <div style="font-size:14px;font-weight:700;color:var(--text);margin-bottom:14px">Preferences</div>
        ${[['Dark Mode','Switch workspace to dark theme',false],['Desktop Notifications','Get alerts on desktop',true],['Weekly Digest','Receive weekly summary email',true],['AI Suggestions','Atlas AI recommendations',true]].map(([l,d,on])=>`
          <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 0;border-bottom:1px solid var(--border)">
            <div><div style="font-size:13.5px;font-weight:600;color:var(--text)">${l}</div><div style="font-size:12px;color:var(--text-4);margin-top:2px">${d}</div></div>
            <div onclick="var on=this.classList.toggle('tog-on');this.style.background=on?'${c}':'var(--border-2)';this.querySelector('div').style.left=on?'21px':'3px'" style="width:42px;height:24px;border-radius:12px;background:${on?c:'var(--border-2)'};cursor:pointer;position:relative;transition:background 0.2s;flex-shrink:0" class="${on?'tog-on':''}">
              <div style="position:absolute;top:3px;${on?'left:21px':'left:3px'};width:18px;height:18px;border-radius:50%;background:#fff;transition:left 0.2s;box-shadow:0 1px 4px rgba(0,0,0,0.2)"></div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  function renderSettingsPanelAI(c) {
    return `
      <div style="background:#fff;border:1.5px solid var(--border);border-radius:14px;padding:20px;margin-bottom:14px">
        <div style="font-size:14px;font-weight:700;color:var(--text);margin-bottom:16px">AI Engine Configuration</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px">
          <div>
            <div style="font-size:11px;font-weight:700;color:var(--text-4);margin-bottom:5px;text-transform:uppercase;letter-spacing:0.5px">AI Model</div>
            <select style="width:100%;padding:9px 12px;background:var(--bg);border:1.5px solid var(--border);border-radius:9px;font-size:13px;color:var(--text);font-family:var(--font);outline:none">
              <option selected>Claude Sonnet 4</option>
              <option>GPT-4o</option>
              <option>Gemini 1.5 Pro</option>
              <option>Llama 3</option>
            </select>
          </div>
          <div>
            <div style="font-size:11px;font-weight:700;color:var(--text-4);margin-bottom:5px;text-transform:uppercase;letter-spacing:0.5px">Temperature: <span id="temp-val">0.3</span></div>
            <input type="range" min="0" max="1" step="0.1" value="0.3" oninput="document.getElementById('temp-val').textContent=this.value" style="width:100%;accent-color:${c};margin-top:8px"/>
            <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--text-4);margin-top:2px"><span>Precise</span><span>Creative</span></div>
          </div>
          <div>
            <div style="font-size:11px;font-weight:700;color:var(--text-4);margin-bottom:5px;text-transform:uppercase;letter-spacing:0.5px">Max Token Limit</div>
            <select style="width:100%;padding:9px 12px;background:var(--bg);border:1.5px solid var(--border);border-radius:9px;font-size:13px;color:var(--text);font-family:var(--font);outline:none">
              <option>1,024</option>
              <option>2,048</option>
              <option selected>4,096</option>
              <option>8,192</option>
              <option>16,384</option>
            </select>
          </div>
          <div>
            <div style="font-size:11px;font-weight:700;color:var(--text-4);margin-bottom:5px;text-transform:uppercase;letter-spacing:0.5px">AI Memory</div>
            <select style="width:100%;padding:9px 12px;background:var(--bg);border:1.5px solid var(--border);border-radius:9px;font-size:13px;color:var(--text);font-family:var(--font);outline:none">
              <option>Session only</option>
              <option selected>Session + persistent</option>
              <option>Long-term memory</option>
            </select>
          </div>
        </div>
        <button onclick="window.showOaToast && window.showOaToast('AI Engine settings saved ✓')" style="padding:9px 22px;background:${c};color:#fff;border:none;border-radius:9px;font-size:13px;font-weight:600;cursor:pointer;font-family:var(--font)">Save AI Config</button>
      </div>
      <div style="background:#fff;border:1.5px solid var(--border);border-radius:14px;padding:20px">
        <div style="font-size:14px;font-weight:700;color:var(--text);margin-bottom:14px">AI Behavior Settings</div>
        ${[['Stream responses','Show output as it generates',true],['Safe content filter','Block harmful outputs',true],['Auto-save prompts','Save prompts to library after run',false],['Usage analytics','Track token usage and costs',true]].map(([l,d,on])=>`
          <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 0;border-bottom:1px solid var(--border)">
            <div><div style="font-size:13.5px;font-weight:600;color:var(--text)">${l}</div><div style="font-size:12px;color:var(--text-4);margin-top:2px">${d}</div></div>
            <div onclick="var on=this.classList.toggle('tog-on');this.style.background=on?'${c}':'var(--border-2)';this.querySelector('div').style.left=on?'21px':'3px'" style="width:42px;height:24px;border-radius:12px;background:${on?c:'var(--border-2)'};cursor:pointer;position:relative;transition:background 0.2s;flex-shrink:0" class="${on?'tog-on':''}">
              <div style="position:absolute;top:3px;${on?'left:21px':'left:3px'};width:18px;height:18px;border-radius:50%;background:#fff;transition:left 0.2s;box-shadow:0 1px 4px rgba(0,0,0,0.2)"></div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  function renderSettingsPanelIntegrations(c) {
    const integrations = [
      {name:'Slack',icon:'💬',desc:'Alerts + notifications',status:'Connected',col:'#635BFF'},
      {name:'GitHub',icon:'🐙',desc:'Code sync & deploy',status:'Connected',col:'#1A1F36'},
      {name:'Google Workspace',icon:'🔷',desc:'Docs, Drive, Calendar',status:'Connected',col:'#0EA5E9'},
      {name:'Notion',icon:'📓',desc:'Knowledge base sync',status:'Not connected',col:'#697386'},
      {name:'Discord',icon:'🎮',desc:'Team alerts & bots',status:'Not connected',col:'#5865F2'},
      {name:'Zapier',icon:'⚡',desc:'Workflow automation hub',status:'Not connected',col:'#FF4A00'},
    ];
    return `
      <div style="background:#fff;border:1.5px solid var(--border);border-radius:14px;padding:20px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
          <div style="font-size:14px;font-weight:700;color:var(--text)">Connected Integrations</div>
          <button onclick="window.showOaToast && window.showOaToast('Integration marketplace opened')" style="padding:7px 14px;background:${c};color:#fff;border:none;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;font-family:var(--font)">+ Browse All</button>
        </div>
        ${integrations.map(int=>`
          <div style="display:flex;align-items:center;gap:14px;padding:14px 0;border-bottom:1px solid var(--border)">
            <div style="width:42px;height:42px;border-radius:12px;background:${int.col}15;display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0">${int.icon}</div>
            <div style="flex:1">
              <div style="font-size:13.5px;font-weight:700;color:var(--text)">${int.name}</div>
              <div style="font-size:12px;color:var(--text-4);margin-top:2px">${int.desc}</div>
            </div>
            <div style="display:flex;align-items:center;gap:8px">
              <div onclick="var c=this;var on=c.parentElement.querySelector('.int-toggle');var connected=(this.textContent==='Configure');this.textContent=connected?'Connect':'Configure';this.style.background=connected?'${c}15':'#DCFCE7';this.style.color=connected?'${c}':'#16A34A'" style="padding:6px 14px;background:${int.status==='Connected'?'#DCFCE7':c+'15'};color:${int.status==='Connected'?'#16A34A':c};border-radius:8px;font-size:12px;font-weight:600;cursor:pointer">${int.status==='Connected'?'Configure':'Connect'}</div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  function renderSettingsPanelNotifications(c) {
    return `
      <div style="background:#fff;border:1.5px solid var(--border);border-radius:14px;padding:20px;margin-bottom:14px">
        <div style="font-size:14px;font-weight:700;color:var(--text);margin-bottom:16px">Notification Channels</div>
        ${[
          ['Email Notifications','Receive alerts via email',true,'📧'],
          ['Push Notifications','Browser & mobile push alerts',true,'🔔'],
          ['Workflow Alerts','Get notified on workflow events',true,'⚡'],
          ['SMS Alerts','Receive critical alerts via SMS',false,'📱'],
          ['Slack Alerts','Post notifications to Slack',true,'💬'],
          ['Daily Digest','Daily summary of all activity',false,'📊'],
        ].map(([l,d,on,ico])=>`
          <div style="display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid var(--border)">
            <div style="width:36px;height:36px;border-radius:10px;background:${on?c+'15':'var(--bg)'};display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0">${ico}</div>
            <div style="flex:1"><div style="font-size:13.5px;font-weight:600;color:var(--text)">${l}</div><div style="font-size:12px;color:var(--text-4);margin-top:2px">${d}</div></div>
            <div onclick="var on=this.classList.toggle('tog-on');this.style.background=on?'${c}':'var(--border-2)';this.querySelector('div').style.left=on?'21px':'3px'" style="width:42px;height:24px;border-radius:12px;background:${on?c:'var(--border-2)'};cursor:pointer;position:relative;transition:background 0.2s;flex-shrink:0" class="${on?'tog-on':''}">
              <div style="position:absolute;top:3px;${on?'left:21px':'left:3px'};width:18px;height:18px;border-radius:50%;background:#fff;transition:left 0.2s;box-shadow:0 1px 4px rgba(0,0,0,0.2)"></div>
            </div>
          </div>
        `).join('')}
        <button onclick="window.showOaToast && window.showOaToast('Notification settings saved ✓')" style="margin-top:16px;padding:9px 22px;background:${c};color:#fff;border:none;border-radius:9px;font-size:13px;font-weight:600;cursor:pointer;font-family:var(--font)">Save Settings</button>
      </div>
    `;
  }

  function renderSettingsPanelSecurity(c) {
    return `
      <div style="background:#fff;border:1.5px solid var(--border);border-radius:14px;padding:20px;margin-bottom:14px">
        <div style="font-size:14px;font-weight:700;color:var(--text);margin-bottom:16px">Security Settings</div>
        <div style="display:flex;align-items:center;justify-content:space-between;padding:14px 0;border-bottom:1px solid var(--border)">
          <div>
            <div style="font-size:13.5px;font-weight:600;color:var(--text)">Two-Factor Authentication (2FA)</div>
            <div style="font-size:12px;color:var(--text-4);margin-top:2px">Add an extra layer of security with TOTP or SMS</div>
          </div>
          <button onclick="window.showOaToast && window.showOaToast('2FA setup initiated — check your email')" style="padding:7px 16px;background:${c};color:#fff;border:none;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;font-family:var(--font)">Enable 2FA</button>
        </div>
        <div style="padding:14px 0;border-bottom:1px solid var(--border)">
          <div style="font-size:13.5px;font-weight:600;color:var(--text);margin-bottom:8px">Session Timeout</div>
          <select style="padding:9px 12px;background:var(--bg);border:1.5px solid var(--border);border-radius:9px;font-size:13px;color:var(--text);font-family:var(--font);outline:none;width:100%;max-width:300px">
            <option>30 minutes</option>
            <option selected>1 hour</option>
            <option>4 hours</option>
            <option>8 hours</option>
            <option>Never</option>
          </select>
        </div>
        <div style="padding:14px 0;border-bottom:1px solid var(--border)">
          <div style="font-size:13.5px;font-weight:600;color:var(--text);margin-bottom:8px">Permissions</div>
          ${[['Admin','Full access to all features and settings'],['Editor','Can edit content and workflows'],['Viewer','Read-only access']].map(([role,desc])=>`
            <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 12px;background:var(--bg);border-radius:9px;margin-bottom:6px">
              <div><div style="font-size:13px;font-weight:600;color:var(--text)">${role}</div><div style="font-size:11px;color:var(--text-4)">${desc}</div></div>
              <button onclick="window.showOaToast && window.showOaToast('${role} permissions updated')" style="padding:5px 12px;background:${c}15;color:${c};border:none;border-radius:7px;font-size:11px;font-weight:600;cursor:pointer;font-family:var(--font)">Edit</button>
            </div>
          `).join('')}
        </div>
        <button onclick="window.showOaToast && window.showOaToast('Security settings saved ✓')" style="margin-top:14px;padding:9px 22px;background:${c};color:#fff;border:none;border-radius:9px;font-size:13px;font-weight:600;cursor:pointer;font-family:var(--font)">Save Security Settings</button>
      </div>
    `;
  }

  function renderSettingsPanelBilling(c) {
    return `
      <div style="background:#fff;border:1.5px solid var(--border);border-radius:14px;padding:20px;margin-bottom:14px">
        <div style="font-size:14px;font-weight:700;color:var(--text);margin-bottom:16px">Billing & Plan</div>
        <div style="background:linear-gradient(135deg,${c}15,#FF599615);border:1.5px solid ${c}30;border-radius:14px;padding:20px;margin-bottom:16px">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
            <div>
              <div style="font-size:11px;font-weight:700;color:${c};text-transform:uppercase;letter-spacing:0.8px">Current Plan</div>
              <div style="font-size:24px;font-weight:800;color:var(--text);margin-top:4px">Pro Plan</div>
              <div style="font-size:13px;color:var(--text-3);margin-top:3px">$49/month · Billed annually</div>
            </div>
            <button onclick="window.showOaToast && window.showOaToast('Plan upgrade page opened')" style="padding:9px 20px;background:${c};color:#fff;border:none;border-radius:9px;font-size:13px;font-weight:700;cursor:pointer;font-family:var(--font)">Upgrade</button>
          </div>
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px">
            ${[['Credits Used','8,240 / 10,000'],['Workflows','12 / 20'],['Team Members','5 / 10']].map(([l,v])=>`
              <div style="background:rgba(255,255,255,0.7);border-radius:10px;padding:12px">
                <div style="font-size:11px;font-weight:700;color:var(--text-4);margin-bottom:4px">${l}</div>
                <div style="font-size:14px;font-weight:700;color:${c}">${v}</div>
              </div>
            `).join('')}
          </div>
        </div>
        <div style="font-size:14px;font-weight:700;color:var(--text);margin-bottom:14px">Payment History</div>
        ${[['May 2026','Pro Plan','$49.00','Paid'],['Apr 2026','Pro Plan','$49.00','Paid'],['Mar 2026','Pro Plan','$49.00','Paid']].map(([date,desc,amt,status])=>`
          <div style="display:flex;align-items:center;justify-content:space-between;padding:11px 0;border-bottom:1px solid var(--border)">
            <div style="font-size:13px;font-weight:600;color:var(--text)">${date} — ${desc}</div>
            <div style="display:flex;align-items:center;gap:10px">
              <span style="font-size:13px;font-weight:700;color:var(--text)">${amt}</span>
              <span style="padding:3px 10px;background:#DCFCE7;color:#16A34A;border-radius:20px;font-size:11px;font-weight:700">${status}</span>
              <button onclick="window.showOaToast && window.showOaToast('Receipt downloaded')" style="padding:4px 10px;background:var(--bg);border:1.5px solid var(--border);border-radius:7px;font-size:11px;font-weight:600;cursor:pointer;color:var(--text-3);font-family:var(--font)">Receipt</button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  function renderSettingsPanelAPIKeys(c) {
    let apiKeys = [
      {id:'key1', name:'Production Key', key:'sk-oa-••••••••••••••••Xk7Q', created:'May 1, 2026', status:'Active'},
      {id:'key2', name:'Development Key', key:'sk-oa-••••••••••••••••pZm2', created:'Apr 15, 2026', status:'Active'},
      {id:'key3', name:'Test Key', key:'sk-oa-••••••••••••••••8fNc', created:'Mar 10, 2026', status:'Revoked'},
    ];

    function generateKey() {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let result = 'sk-oa-';
      for (let i = 0; i < 16; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
      return result;
    }

    return `
      <div style="background:#fff;border:1.5px solid var(--border);border-radius:14px;padding:20px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
          <div style="font-size:14px;font-weight:700;color:var(--text)">API Keys</div>
          <button id="create-api-key-btn" onclick="createAPIKeyInline(this,'${c}')" style="padding:8px 16px;background:${c};color:#fff;border:none;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;font-family:var(--font)">+ Create New Key</button>
        </div>
        <div id="api-keys-list">
          ${apiKeys.map(k=>`
            <div id="apirow-${k.id}" style="display:flex;align-items:center;gap:12px;padding:13px 0;border-bottom:1px solid var(--border)">
              <div style="flex:1">
                <div style="font-size:13px;font-weight:700;color:var(--text)">${k.name}</div>
                <div style="font-size:12px;color:var(--text-4);font-family:monospace;margin-top:2px" id="keyval-${k.id}">${k.key}</div>
                <div style="font-size:11px;color:var(--text-4);margin-top:2px">Created ${k.created}</div>
              </div>
              <span style="padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700;background:${k.status==='Active'?'#DCFCE7':'#FEE2E2'};color:${k.status==='Active'?'#16A34A':'#DC2626'}">${k.status}</span>
              <button onclick="copyAPIKey('keyval-${k.id}')" style="padding:5px 12px;background:#FFF4EE;border:none;border-radius:7px;font-size:11px;font-weight:600;cursor:pointer;color:#FF6600;font-family:var(--font)">Copy</button>
              <button onclick="document.getElementById('apirow-${k.id}').remove();window.showOaToast && window.showOaToast('Key deleted')" style="padding:5px 12px;background:#FEE2E2;border:none;border-radius:7px;font-size:11px;font-weight:600;cursor:pointer;color:#DC2626;font-family:var(--font)">Delete</button>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  function renderSettingsPanelTeam(c) {
    return `
      <div style="background:#fff;border:1.5px solid var(--border);border-radius:14px;padding:20px">
        <div style="font-size:14px;font-weight:700;color:var(--text);margin-bottom:16px">Team & Permissions</div>
        ${[['Priya Sharma','priya@co.io','Admin','Online','#635BFF'],['Alex Chen','alex@co.io','Editor','Away','#FF5996'],['Sam Wilson','sam@co.io','Viewer','Offline','#00D4B1']].map(([name,email,role,status,col])=>`
          <div style="display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid var(--border)">
            <div style="width:36px;height:36px;border-radius:10px;background:${col};display:flex;align-items:center;justify-content:center;font-weight:700;font-size:14px;color:#fff;flex-shrink:0">${name[0]}</div>
            <div style="flex:1"><div style="font-size:13px;font-weight:600;color:var(--text)">${name}</div><div style="font-size:12px;color:var(--text-4)">${email}</div></div>
            <select style="padding:5px 10px;border:1.5px solid var(--border);border-radius:8px;font-size:12px;color:var(--text);font-family:var(--font);outline:none">
              <option ${role==='Admin'?'selected':''}>Admin</option>
              <option ${role==='Editor'?'selected':''}>Editor</option>
              <option ${role==='Viewer'?'selected':''}>Viewer</option>
            </select>
            <span style="font-size:11px;font-weight:700;padding:3px 9px;border-radius:20px;background:${status==='Online'?'#DCFCE7':status==='Away'?'#FEF3C7':'#F1F5F9'};color:${status==='Online'?'#16A34A':status==='Away'?'#D97706':'#697386'}">${status}</span>
          </div>
        `).join('')}
        <button onclick="window.showOaToast && window.showOaToast('Team settings saved ✓')" style="margin-top:14px;padding:9px 22px;background:${c};color:#fff;border:none;border-radius:9px;font-size:13px;font-weight:600;cursor:pointer;font-family:var(--font)">Save Changes</button>
      </div>
    `;
  }

  // ─── 5. WORKFLOW STUDIO TOOL PANELS ───
  function openWorkspaceToolPanel(type) {
    const area = document.getElementById('ws-content-area');
    if (!area) return;
    const c = window.getColor ? window.getColor(window.currentTemplateName || '') : '#635BFF';

    const panels = {
      templates: renderWFToolTemplates(c),
      triggers: renderWFToolTriggers(c),
      integrations: renderWFToolIntegrations(c),
      actions: renderWFToolActions(c),
      aitools: renderWFToolAI(c),
    };

    // Inject panel as an overlay inside the center workspace area
    // Find the center div (2nd child of the 3-column grid)
    const grid = area.querySelector('[style*="grid-template-columns:180px"]');
    if (grid) {
      const center = grid.children[1];
      if (center) {
        // Create sliding panel
        const panel = document.createElement('div');
        panel.id = 'wf-tool-panel';
        panel.style.cssText = 'position:absolute;top:0;left:0;right:0;bottom:0;background:#fff;border-radius:16px;border:1.5px solid var(--border);z-index:50;padding:20px;overflow-y:auto;animation:slideInUp 0.25s ease';
        panel.innerHTML = `
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
            <div style="font-size:16px;font-weight:800;color:var(--text)">${type.charAt(0).toUpperCase()+type.slice(1).replace('aitools','AI Tools')}</div>
            <button onclick="document.getElementById('wf-tool-panel').remove()" style="padding:5px 12px;background:var(--bg);border:1.5px solid var(--border);border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;color:var(--text-3);font-family:var(--font)">✕ Close</button>
          </div>
          ${panels[type]}
        `;
        center.style.position = 'relative';
        center.appendChild(panel);
        return;
      }
    }
    // Fallback: replace area content
    area.innerHTML = `<div style="padding:20px">${panels[type]}</div>`;
  }

  function renderWFToolTemplates(c) {
    const templates = [
      {name:'Email Automation',icon:'✉️',desc:'Send automated emails based on triggers',color:'#635BFF'},
      {name:'AI Content Pipeline',icon:'🤖',desc:'Generate content using AI models',color:'#A855F7'},
      {name:'CRM Sync Flow',icon:'👥',desc:'Sync contacts between CRM and DB',color:'#00D4B1'},
      {name:'Data Processing',icon:'⚙️',desc:'Transform and clean incoming data',color:'#F59E0B'},
      {name:'Slack Notifier',icon:'💬',desc:'Send Slack messages on events',color:'#635BFF'},
      {name:'Webhook Router',icon:'⚡',desc:'Route webhooks to multiple services',color:'#00D4FF'},
    ];
    return `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
        ${templates.map(t=>`
          <div onclick="document.getElementById('wf-tool-panel').remove();window.showOaToast && window.showOaToast('Template \"${t.name}\" added to workspace ✓')" style="background:#fff;border:1.5px solid var(--border);border-radius:14px;padding:16px;cursor:pointer;transition:all 0.2s" onmouseover="this.style.borderColor='${t.color}';this.style.transform='translateY(-2px)'" onmouseout="this.style.borderColor='var(--border)';this.style.transform='none'">
            <div style="width:40px;height:40px;border-radius:12px;background:${t.color}20;display:flex;align-items:center;justify-content:center;font-size:20px;margin-bottom:10px">${t.icon}</div>
            <div style="font-size:13px;font-weight:700;color:var(--text);margin-bottom:4px">${t.name}</div>
            <div style="font-size:12px;color:var(--text-4);line-height:1.4">${t.desc}</div>
            <div style="margin-top:10px;padding:6px 12px;background:${t.color};color:#fff;border-radius:8px;font-size:11px;font-weight:600;text-align:center">Use Template</div>
          </div>
        `).join('')}
      </div>
    `;
  }

  function renderWFToolTriggers(c) {
    const triggers = [
      {name:'Webhook',type:'HTTP',icon:'⚡',desc:'Trigger on incoming HTTP request',color:'#00D4B1'},
      {name:'Schedule / Cron',type:'Time',icon:'🕐',desc:'Run on a schedule or interval',color:c},
      {name:'Email Trigger',type:'Email',icon:'📧',desc:'Trigger when email received',color:'#FF5996'},
      {name:'Database Trigger',type:'DB',icon:'🗄️',desc:'Fire on database row change',color:'#635BFF'},
      {name:'Form Submit',type:'UI',icon:'📋',desc:'Trigger on form submission',color:'#F59E0B'},
      {name:'API Polling',type:'API',icon:'🔄',desc:'Poll an API at intervals',color:'#00D4FF'},
    ];
    return `
      <div style="display:flex;flex-direction:column;gap:10px">
        ${triggers.map(t=>`
          <div onclick="document.getElementById('wf-tool-panel').remove();window.showOaToast && window.showOaToast('Trigger \"${t.name}\" added ✓')" style="display:flex;align-items:center;gap:14px;background:#fff;border:1.5px solid var(--border);border-radius:14px;padding:14px 16px;cursor:pointer;transition:all 0.15s" onmouseover="this.style.borderColor='${t.color}';this.style.background='${t.color}05'" onmouseout="this.style.borderColor='var(--border)';this.style.background='#fff'">
            <div style="width:40px;height:40px;border-radius:12px;background:${t.color}20;display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0">${t.icon}</div>
            <div style="flex:1">
              <div style="font-size:13.5px;font-weight:700;color:var(--text)">${t.name}</div>
              <div style="font-size:12px;color:var(--text-4);margin-top:2px">${t.desc}</div>
            </div>
            <span style="padding:3px 10px;background:${t.color}20;color:${t.color};border-radius:12px;font-size:11px;font-weight:700">${t.type}</span>
            <div style="padding:5px 14px;background:${c};color:#fff;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;flex-shrink:0">Add</div>
          </div>
        `).join('')}
      </div>
    `;
  }

  function renderWFToolIntegrations(c) {
    const integrations = [
      {name:'Slack',icon:'💬',desc:'Send messages and alerts',col:'#635BFF'},
      {name:'GitHub',icon:'🐙',desc:'Sync code, PRs, and releases',col:'#1A1F36'},
      {name:'Google Sheets',icon:'🔷',desc:'Read and write spreadsheet data',col:'#0EA5E9'},
      {name:'Notion',icon:'📓',desc:'Create and update Notion pages',col:'#697386'},
      {name:'Discord',icon:'🎮',desc:'Post to Discord channels',col:'#5865F2'},
      {name:'Airtable',icon:'📊',desc:'Sync records and tables',col:'#F59E0B'},
    ];
    return `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
        ${integrations.map(int=>`
          <div style="background:#fff;border:1.5px solid var(--border);border-radius:14px;padding:14px;display:flex;align-items:center;gap:12px;transition:all 0.15s;cursor:pointer" onmouseover="this.style.borderColor='${int.col}'" onmouseout="this.style.borderColor='var(--border)'">
            <div style="width:38px;height:38px;border-radius:11px;background:${int.col}15;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0">${int.icon}</div>
            <div style="flex:1"><div style="font-size:13px;font-weight:700;color:var(--text)">${int.name}</div><div style="font-size:11px;color:var(--text-4);margin-top:2px">${int.desc}</div></div>
            <button onclick="event.stopPropagation();this.textContent=this.textContent==='Connect'?'Connected ✓':'Connect';this.style.background=this.textContent==='Connected ✓'?'#DCFCE7':'${int.col}';this.style.color=this.textContent==='Connected ✓'?'#16A34A':'#fff';window.showOaToast && window.showOaToast('${int.name} connected ✓')" style="padding:5px 12px;background:${int.col};color:#fff;border:none;border-radius:8px;font-size:11px;font-weight:600;cursor:pointer;flex-shrink:0;font-family:var(--font)">Connect</button>
          </div>
        `).join('')}
      </div>
    `;
  }

  function renderWFToolActions(c) {
    const actions = [
      {name:'Send Email',icon:'📧',desc:'Send email to one or many recipients',col:'#635BFF'},
      {name:'Update Database',icon:'🗄️',desc:'Insert, update, or delete records',col:'#00D4B1'},
      {name:'Create Task',icon:'✅',desc:'Create a task in your task manager',col:c},
      {name:'Send Slack Message',icon:'💬',desc:'Post message to a Slack channel',col:'#A855F7'},
      {name:'Make HTTP Request',icon:'🌐',desc:'Call any REST API endpoint',col:'#00D4FF'},
      {name:'Generate AI Content',icon:'🤖',desc:'Use AI to generate text or data',col:'#FF5996'},
      {name:'Transform Data',icon:'⚙️',desc:'Map, filter, and reshape data',col:'#F59E0B'},
      {name:'Send Webhook',icon:'⚡',desc:'POST data to an external webhook URL',col:'#00D4B1'},
    ];
    return `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
        ${actions.map(a=>`
          <div onclick="document.getElementById('wf-tool-panel').remove();window.showOaToast && window.showOaToast('Action \"${a.name}\" added to flow ✓')" style="background:#fff;border:1.5px solid var(--border);border-radius:13px;padding:14px;cursor:pointer;transition:all 0.15s" onmouseover="this.style.borderColor='${a.col}';this.style.background='${a.col}05'" onmouseout="this.style.borderColor='var(--border)';this.style.background='#fff'">
            <div style="display:flex;align-items:center;gap:10px">
              <div style="width:34px;height:34px;border-radius:10px;background:${a.col}20;display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0">${a.icon}</div>
              <div style="flex:1"><div style="font-size:13px;font-weight:700;color:var(--text)">${a.name}</div><div style="font-size:11px;color:var(--text-4);margin-top:2px">${a.desc}</div></div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  function renderWFToolAI(c) {
    const tools = [
      {name:'Text Summarization',icon:'📄',desc:'Summarize long documents or content',col:'#635BFF'},
      {name:'Content Generation',icon:'✍️',desc:'Generate marketing or product copy',col:c},
      {name:'Classification',icon:'🏷️',desc:'Classify text into categories',col:'#00D4B1'},
      {name:'Sentiment Analysis',icon:'😊',desc:'Detect sentiment in customer feedback',col:'#FF5996'},
      {name:'Data Extraction',icon:'🔍',desc:'Extract entities from unstructured text',col:'#F59E0B'},
      {name:'Translation',icon:'🌐',desc:'Translate content to multiple languages',col:'#00D4FF'},
    ];
    const models = ['Claude Sonnet 4','GPT-4o','Gemini 1.5 Pro','Llama 3'];
    return `
      <div style="margin-bottom:16px">
        <div style="font-size:12px;font-weight:700;color:var(--text-4);text-transform:uppercase;letter-spacing:0.6px;margin-bottom:10px">Select AI Model</div>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          ${models.map((m,i)=>`<div onclick="document.querySelectorAll('.ai-model-chip').forEach(el=>el.style.background='var(--bg)');document.querySelectorAll('.ai-model-chip').forEach(el=>el.style.borderColor='var(--border)');this.style.background='${c}15';this.style.borderColor='${c}'" class="ai-model-chip" style="padding:7px 16px;border-radius:20px;font-size:12px;font-weight:600;cursor:pointer;border:1.5px solid ${i===0?c:'var(--border)'};background:${i===0?c+'15':'var(--bg)'};color:${i===0?c:'var(--text-3)'};">${m}</div>`).join('')}
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
        ${tools.map(t=>`
          <div onclick="document.getElementById('wf-tool-panel').remove();window.showOaToast && window.showOaToast('AI Tool \"${t.name}\" added ✓')" style="background:#fff;border:1.5px solid var(--border);border-radius:13px;padding:14px;cursor:pointer;transition:all 0.15s" onmouseover="this.style.borderColor='${t.col}'" onmouseout="this.style.borderColor='var(--border)'">
            <div style="font-size:22px;margin-bottom:8px">${t.icon}</div>
            <div style="font-size:13px;font-weight:700;color:var(--text)">${t.name}</div>
            <div style="font-size:11px;color:var(--text-4);margin-top:3px;line-height:1.4">${t.desc}</div>
          </div>
        `).join('')}
      </div>
    `;
  }

  // ─── 6. WORKFLOW STUDIO: SAVE with animation ───
  function wfSave(btn) {
    const orig = btn ? btn.innerHTML : '';
    if (btn) { btn.innerHTML = '⏳ Saving...'; btn.disabled = true; }
    setTimeout(() => {
      if (btn) { btn.innerHTML = '✓ Saved'; btn.style.background = '#DCFCE7'; btn.style.color = '#16A34A'; btn.style.borderColor = '#BBF7D0'; }
      toast('Workflow saved successfully!');
      setTimeout(() => {
        if (btn) { btn.innerHTML = orig; btn.style.background = ''; btn.style.color = ''; btn.style.borderColor = ''; btn.disabled = false; }
      }, 2000);
    }, 900);
  }

  // ─── 7. ADD NEW WORKFLOW MODAL ───
  function openAddWorkflowModal() {
    // Remove existing
    const existing = document.getElementById('add-wf-modal');
    if (existing) existing.remove();

    const c = window.getColor ? window.getColor(window.currentTemplateName || '') : '#635BFF';
    const modal = document.createElement('div');
    modal.id = 'add-wf-modal';
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(10,37,64,0.5);z-index:9999;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(4px)';
    modal.innerHTML = `
      <div style="background:#fff;border-radius:20px;padding:28px;width:440px;box-shadow:0 20px 60px rgba(0,0,0,0.2);animation:slideInUp 0.25s ease">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px">
          <div style="font-size:18px;font-weight:800;color:var(--text)">Add New Workflow</div>
          <button onclick="document.getElementById('add-wf-modal').remove()" style="background:none;border:none;font-size:20px;cursor:pointer;color:var(--text-3)">✕</button>
        </div>
        <div style="margin-bottom:14px">
          <div style="font-size:11px;font-weight:700;color:var(--text-4);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px">Workflow Name *</div>
          <input id="new-wf-name" style="width:100%;padding:10px 14px;border:1.5px solid var(--border);border-radius:10px;font-size:14px;font-family:var(--font);outline:none;color:var(--text)" placeholder="e.g. Lead Nurture Flow" onfocus="this.style.borderColor='${c}'" onblur="this.style.borderColor='var(--border)'"/>
        </div>
        <div style="margin-bottom:20px">
          <div style="font-size:11px;font-weight:700;color:var(--text-4);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px">Category</div>
          <select id="new-wf-cat" style="width:100%;padding:10px 14px;border:1.5px solid var(--border);border-radius:10px;font-size:14px;font-family:var(--font);outline:none;color:var(--text);background:#fff">
            <option>Automation</option>
            <option>AI / ML</option>
            <option>Data Sync</option>
            <option>Marketing</option>
            <option>Customer Support</option>
            <option>Reporting</option>
          </select>
        </div>
        <div style="display:flex;gap:10px">
          <button onclick="document.getElementById('add-wf-modal').remove()" style="flex:1;padding:11px;background:var(--bg);border:1.5px solid var(--border);border-radius:10px;font-size:14px;font-weight:600;cursor:pointer;color:var(--text-3);font-family:var(--font)">Cancel</button>
          <button onclick="submitAddWorkflow('${c}')" style="flex:2;padding:11px;background:${c};color:#fff;border:none;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;font-family:var(--font)">Create Workflow</button>
        </div>
      </div>
    `;
    modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
    document.body.appendChild(modal);
    setTimeout(() => { const inp = document.getElementById('new-wf-name'); if (inp) inp.focus(); }, 100);
  }
  window.openAddWorkflowModal = openAddWorkflowModal;

  window.submitAddWorkflow = function(c) {
    const name = (document.getElementById('new-wf-name') || {}).value?.trim();
    const cat = (document.getElementById('new-wf-cat') || {}).value || 'Automation';
    if (!name) { toast('Please enter a workflow name'); return; }

    const icons = {'Automation':'⚙️','AI / ML':'🤖','Data Sync':'🗄️','Marketing':'📢','Customer Support':'💬','Reporting':'📊'};
    const colors = ['#635BFF','#00D4B1','#FF5996','#F59E0B','#00D4FF','#A855F7'];
    const col = colors[Math.floor(Math.random() * colors.length)];
    const icon = icons[cat] || '⚡';
    const executions = Math.floor(Math.random() * 500) + 10;
    const pct = Math.floor(Math.random() * 60) + 30;

    // Add card to grid
    const grid = document.getElementById('wf-cards-grid');
    if (grid) {
      const wfId = 'wf' + Date.now();
      const card = document.createElement('div');
      card.id = 'card-' + wfId;
      card.style.cssText = `background:#fff;border:1.5px solid var(--border);border-radius:18px;padding:18px 20px;cursor:pointer;transition:all 0.2s;position:relative;overflow:hidden;animation:slideInUp 0.3s ease`;
      card.innerHTML = `
        <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:12px">
          <div style="display:flex;align-items:center;gap:10px">
            <div style="width:38px;height:38px;border-radius:11px;background:${col}18;display:flex;align-items:center;justify-content:center;font-size:18px">${icon}</div>
            <div>
              <div style="font-size:14px;font-weight:700;color:var(--text)">${name}</div>
              <div style="font-size:11px;color:var(--text-4);margin-top:1px">${executions} executions</div>
            </div>
          </div>
          <span style="padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700;background:#E8E7FF;color:#635BFF">Active</span>
        </div>
        <div style="margin-bottom:10px">
          <div style="display:flex;justify-content:space-between;margin-bottom:5px">
            <span style="font-size:11.5px;color:var(--text-4);font-weight:600">Progress</span>
            <span style="font-size:11.5px;font-weight:700;color:${col}">${pct}%</span>
          </div>
          <div style="height:5px;background:var(--cream2);border-radius:3px;overflow:hidden"><div style="height:100%;width:${pct}%;background:${col};border-radius:3px"></div></div>
        </div>
        <div style="display:flex;align-items:center;justify-content:space-between">
          <span style="font-size:11px;color:var(--text-4)">${cat}</span>
          <div style="display:flex;gap:6px">
            <button onclick="event.stopPropagation();window.showOaToast && window.showOaToast('${name} edited')" style="padding:5px 10px;background:var(--cream);border:1.5px solid var(--border);border-radius:8px;font-size:11px;font-weight:600;color:var(--text-3);cursor:pointer;font-family:var(--font)">Edit</button>
            <button onclick="event.stopPropagation();window.showOaToast && window.showOaToast('${name} running…')" style="padding:5px 10px;background:${col};border:none;border-radius:8px;font-size:11px;font-weight:700;color:#fff;cursor:pointer;font-family:var(--font)">▶ Run</button>
          </div>
        </div>
      `;
      card.onmouseover = () => { card.style.borderColor = col; card.style.boxShadow = `0 8px 32px ${col}22`; card.style.transform = 'translateY(-2px)'; };
      card.onmouseout = () => { card.style.borderColor = 'var(--border)'; card.style.boxShadow = 'none'; card.style.transform = 'none'; };
      grid.appendChild(card);
    }

    // Update count in header
    const countEl = document.querySelector('#ws-content-area [style*="Workflow Studio"]');
    if (countEl) {
      const sub = countEl.parentElement?.querySelector('[style*="active workflows"]');
      if (sub) {
        const match = sub.textContent.match(/(\d+)/);
        if (match) sub.textContent = sub.textContent.replace(/\d+ active workflows/, (parseInt(match[1])+1) + ' active workflows');
      }
    }

    document.getElementById('add-wf-modal')?.remove();
    toast(`Workflow "${name}" created! ✓`);
  };

  // ─── 8. API KEY HELPERS ───
  window.copyAPIKey = function(elemId) {
    const el = document.getElementById(elemId);
    if (!el) return;
    const text = el.textContent;
    navigator.clipboard.writeText(text).catch(() => {});
    toast('API key copied to clipboard!');
  };

  window.createAPIKeyInline = function(btn, c) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let key = 'sk-oa-';
    for (let i = 0; i < 16; i++) key += chars.charAt(Math.floor(Math.random() * chars.length));
    const id = 'apikey-' + Date.now();
    const list = document.getElementById('api-keys-list');
    if (!list) return;
    const row = document.createElement('div');
    row.id = 'apirow-' + id;
    row.style.cssText = 'display:flex;align-items:center;gap:12px;padding:13px 0;border-bottom:1px solid var(--border);animation:slideInUp 0.2s ease';
    row.innerHTML = `
      <div style="flex:1">
        <div style="font-size:13px;font-weight:700;color:var(--text)">New API Key</div>
        <div style="font-size:12px;color:var(--text-4);font-family:monospace;margin-top:2px" id="keyval-${id}">${key}</div>
        <div style="font-size:11px;color:var(--text-4);margin-top:2px">Created just now</div>
      </div>
      <span style="padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700;background:#DCFCE7;color:#16A34A">Active</span>
      <button onclick="window.copyAPIKey('keyval-${id}')" style="padding:5px 12px;background:#FFF4EE;border:none;border-radius:7px;font-size:11px;font-weight:600;cursor:pointer;color:#FF6600;font-family:var(--font)">Copy</button>
      <button onclick="document.getElementById('apirow-${id}').remove();window.showOaToast && window.showOaToast('Key deleted')" style="padding:5px 12px;background:#FEE2E2;border:none;border-radius:7px;font-size:11px;font-weight:600;cursor:pointer;color:#DC2626;font-family:var(--font)">Delete</button>
    `;
    list.insertBefore(row, list.firstChild);
    toast('New API key generated: ' + key.substring(0, 14) + '…');
  };

  // ─── 9. WORKFLOW STUDIO SEARCH (live filter) ───
  document.addEventListener('input', function(e) {
    if (e.target.id !== 'wf-search') return;
    const q = e.target.value.toLowerCase();
    const grid = document.getElementById('wf-cards-grid');
    if (!grid) return;
    grid.querySelectorAll('[id^="card-"]').forEach(card => {
      const text = card.textContent.toLowerCase();
      card.style.display = text.includes(q) ? '' : 'none';
    });
  });

  // ─── 10. CHATBOT SEND BUTTON FIX ───
  // Override sendChatMsg to ensure it always works
  const _origSend = window.sendChatMsg;
  window.sendChatMsg = function() {
    const input = document.getElementById('ws-chat-input');
    if (!input) return;
    const msg = input.value.trim();
    if (!msg) { toast('Please type a message first'); return; }
    if (_origSend) { _origSend(); return; }
    // Fallback if original wasn't set yet
    const msgs = document.getElementById('ws-chat-msgs');
    if (!msgs) return;
    const now = new Date().toLocaleTimeString('en',{hour:'2-digit',minute:'2-digit'});
    const userEl = document.createElement('div');
    userEl.className = 'ws-msg ws-msg-user';
    userEl.innerHTML = `<div class="ws-msg-bubble">${msg}</div><div class="ws-msg-time">${now}</div>`;
    msgs.appendChild(userEl);
    input.value = ''; input.style.height = 'auto';
    msgs.scrollTop = msgs.scrollHeight;
    const typing = document.createElement('div');
    typing.className = 'ws-chat-typing show';
    typing.innerHTML = '<div class="ws-typing-dot"></div><div class="ws-typing-dot"></div><div class="ws-typing-dot"></div>';
    msgs.appendChild(typing);
    msgs.scrollTop = msgs.scrollHeight;
    setTimeout(() => {
      typing.remove();
      const aiEl = document.createElement('div');
      aiEl.className = 'ws-msg ws-msg-ai';
      aiEl.innerHTML = `<div class="ws-msg-bubble">✅ Got it! Applied "${msg}" to your workspace. The changes are live.</div><div class="ws-msg-time">${new Date().toLocaleTimeString('en',{hour:'2-digit',minute:'2-digit'})}</div>`;
      msgs.appendChild(aiEl);
      msgs.scrollTop = msgs.scrollHeight;
    }, 1200);
  };

  // ─── 11. VIEW ALL PAGE — fix template cards opening workspace ───
  const _origRenderViewAll = window.renderViewAll;
  window.renderViewAll = function(activeCat) {
    if (_origRenderViewAll) _origRenderViewAll(activeCat);
    // Patch WORKSPACE_TEMPLATES to include all templates
    setTimeout(() => {
      const grid = document.getElementById('va-grid');
      if (!grid) return;
      grid.querySelectorAll('.va-card').forEach(card => {
        // Find template name from the card content
        const nameEl = card.querySelector('div[style*="font-weight:700"]');
        if (!nameEl) return;
        const name = nameEl.textContent.trim();
        // Find the use/preview button in the card
        const useBtn = card.querySelector('div[style*="text-align:center"]');
        if (!useBtn) return;
        const isWorkspace = window.WORKSPACE_TEMPLATES && window.WORKSPACE_TEMPLATES.includes(name);
        if (!isWorkspace) {
          // Add to WORKSPACE_TEMPLATES and fix the button + onclick
          if (window.WORKSPACE_TEMPLATES) window.WORKSPACE_TEMPLATES.push(name);
          const tpl = window.ALL_TEMPLATES && window.ALL_TEMPLATES.find(t => t.name === name);
          const col = tpl ? tpl.color : '#635BFF';
          useBtn.style.background = col;
          useBtn.style.color = '#fff';
          useBtn.textContent = 'Use Template';
          card.onclick = function() {
            if (window.closeViewAll) window.closeViewAll();
            if (window.openWorkspace) window.openWorkspace(name, '');
          };
        }
      });
    }, 50);
  };

  // ─── 12. EXPORT BUTTON — multiple formats ───
  document.addEventListener('click', function(e) {
    const btn = e.target.closest('button');
    if (!btn) return;
    const txt = btn.textContent.trim();
    if (txt === 'Export' && btn.closest('#ws-content-area') && !btn.closest('#saas-app')) {
      e.stopPropagation();
      openExportMenu(btn);
    }
  });

  function openExportMenu(btn) {
    const existing = document.getElementById('export-menu');
    if (existing) { existing.remove(); return; }
    const menu = document.createElement('div');
    menu.id = 'export-menu';
    const rect = btn.getBoundingClientRect();
    menu.style.cssText = `position:fixed;top:${rect.bottom + 6}px;left:${rect.left}px;background:#fff;border:1.5px solid var(--border);border-radius:12px;box-shadow:var(--shadow-lg);z-index:9999;padding:6px;min-width:160px;animation:fadeInUp 0.15s ease`;
    menu.innerHTML = [
      ['📄','Export as JSON',()=>downloadBlob('workflow-export.json',JSON.stringify({name:'Workflow',exported:new Date().toISOString()},null,2),'application/json')],
      ['📊','Export as CSV',()=>downloadBlob('workflow-export.csv','Name,Status,Executions\nEmail Automation,Active,1240\nAI Content Process,Active,3812','text/csv')],
      ['📋','Export as PDF',()=>toast('PDF export prepared — downloading...')],
    ].map(([ico,label,fn])=>`<div onclick="document.getElementById('export-menu').remove();(${fn.toString()})()" style="display:flex;align-items:center;gap:10px;padding:9px 12px;border-radius:8px;font-size:13px;font-weight:500;color:var(--text-2);cursor:pointer;transition:background 0.12s" onmouseover="this.style.background='var(--lilac)'" onmouseout="this.style.background=''">${ico} ${label}</div>`).join('');
    document.body.appendChild(menu);
    const close = e => { if (!menu.contains(e.target) && e.target !== btn) { menu.remove(); document.removeEventListener('click', close); } };
    setTimeout(() => document.addEventListener('click', close), 100);
  }

  function downloadBlob(filename, content, type) {
    const blob = new Blob([content], {type});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click();
    document.body.removeChild(a); URL.revokeObjectURL(url);
    toast(`${filename} downloaded ✓`);
  }

  // ─── 13. DUPLICATE button ───
  document.addEventListener('click', function(e) {
    const btn = e.target.closest('button');
    if (!btn || btn.textContent.trim() !== 'Duplicate') return;
    const area = document.getElementById('ws-content-area');
    if (!area || !area.contains(btn) || btn.closest('#saas-app')) return;
    e.stopPropagation();
    const grid = document.getElementById('wf-cards-grid');
    if (!grid) { toast('Workflow duplicated ✓'); return; }
    const cards = grid.querySelectorAll('[id^="card-"]');
    if (!cards.length) { toast('No workflow to duplicate'); return; }
    const lastCard = cards[cards.length - 1];
    const clone = lastCard.cloneNode(true);
    clone.id = 'card-dup-' + Date.now();
    // Update name
    const nameEl = clone.querySelector('[style*="font-weight:700"]');
    if (nameEl) nameEl.textContent = nameEl.textContent + ' (Copy)';
    clone.style.animation = 'slideInUp 0.3s ease';
    grid.appendChild(clone);
    toast('Workflow duplicated ✓');
  });

  // ─── 14. CSS Animations injection ───
  if (!document.getElementById('oa-fix-styles')) {
    const style = document.createElement('style');
    style.id = 'oa-fix-styles';
    style.textContent = `
      @keyframes slideInUp {
        from { opacity: 0; transform: translateY(16px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes fadeInDown {
        from { opacity: 0; transform: translateY(-8px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `;
    document.head.appendChild(style);
  }

  console.log('[OneAtlas Fix] All patches applied successfully ✓');

})(); // end IIFE


}
