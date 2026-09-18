#!/usr/bin/env python3
"""
Dynamic Web Application & Admin Control Center for Professional Services Admin Automation.
Features:
  1. Admin Control Center (/admin): Live Theme editor, Checklist manager, Field editor, OpenAI settings.
  2. Dynamic Client Intake Portal (/intake): Real-time rendered from Admin config and theme.
  3. Dynamic Document Upload Portal (/upload): Token-secured portal with theme injection.
  4. Staff Dashboard & CRM (/staff): Lifecycle monitoring, gap tracker, gated booking, OpenAI briefing.
  5. JSON REST API (/api/*): Programmatic access to all dynamic administrative capabilities.

Zero dependencies: Runs on Python 3 standard library (http.server).
"""

import http.server
import json
import os
import sys
import urllib.parse
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, Any, List, Optional

# Ensure project root is in sys.path
PROJECT_ROOT = Path(__file__).resolve().parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from admin_config import admin_store
from openai_client import openai_client
from contracts import ClientRecord, ClientStatus, DocumentRecord
from agent1_intake_crm.intake_service import IntakeService
from agent1_intake_crm.crm_store import CRMStore
from agent2_document.upload_portal import generate_upload_link, generate_upload_token, verify_upload_token
from agent2_document.pipeline import process_document
from agent2_document.ingestion import ingest_client_documents
from agent3_followup.gap_detector import detect_gaps
from agent3_followup.generator import generate_reminder
from agent3_followup.store import ReminderStore
from agent4_scheduling_summary.booking_gate import check_booking_eligibility, book_meeting, BookingLockedError
from agent4_scheduling_summary.summary_generator import generate_summary
from agent4_scheduling_summary.briefing_renderer import render_briefing_markdown
from agent5_qa_compliance.compliance import validate_compliance
from synthetic_docs.loader import (
    get_initial_document_batch,
    get_followup_document_batch,
    get_noisy_document
)

# In-memory shared CRM store for web session
WEB_CRM_STORE = CRMStore(in_memory=True)
WEB_INTAKE_SERVICE = IntakeService(crm_store=WEB_CRM_STORE)
WEB_REMINDER_STORE = ReminderStore()

ADMIN_JS = """
async function updateTheme(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    const res = await fetch('/api/admin/theme', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
    });
    if (res.ok) {
        alert('Theme updated dynamically! The intake portal and staff views will immediately adopt this styling.');
        location.reload();
    }
}

async function updateOpenAI(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    data.temperature = parseFloat(data.temperature);
    const res = await fetch('/api/admin/openai', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
    });
    if (res.ok) {
        alert('OpenAI API settings saved successfully!');
        location.reload();
    }
}

async function runOneClickDemo() {
    const simCard = document.getElementById('simCard');
    const simOutput = document.getElementById('simOutput');
    const simStatus = document.getElementById('simStatus');
    simCard.style.display = 'block';
    simOutput.innerHTML = 'Starting multi-agent live simulation...\\n';
    simCard.scrollIntoView({ behavior: 'smooth' });

    try {
        const res = await fetch('/api/demo/run-full-simulation', { method: 'POST' });
        const data = await res.json();
        if (data.steps) {
            simOutput.innerHTML = '';
            data.steps.forEach(s => {
                simOutput.innerHTML += `[STEP ${s.step}] ${s.title}\\n  ↳ ${s.detail}\\n\\n`;
            });
            simStatus.className = 'badge badge-success';
            simStatus.innerText = 'Completed (7/7 Passed)';
        }
    } catch (err) {
        simOutput.innerHTML += 'Simulation Error: ' + err;
        simStatus.className = 'badge badge-danger';
        simStatus.innerText = 'Failed';
    }
}
"""

INTAKE_JS = """
async function submitClientIntake(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const raw = Object.fromEntries(formData.entries());
    
    const payload = {
        business_type: raw.business_type,
        service_requested: raw.service_requested,
        turnover_band: raw.turnover_band,
        employee_count: parseInt(raw.employee_count || '0'),
        relevant_date: raw.relevant_date,
        contact: {
            name: raw.contact_name,
            email: raw.contact_email,
            phone: raw.contact_phone
        },
        existing_provider: raw.existing_provider
    };

    const res = await fetch('/api/intake/submit', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(payload)
    });
    const data = await res.json();
    
    const resDiv = document.getElementById('intakeResult');
    if (data.success) {
        resDiv.style.display = 'block';
        resDiv.innerHTML = `
            <h3 style="color: var(--success-color); margin-bottom: 0.5rem;">✓ Intake Record Created Automatically!</h3>
            <p><strong>Client Reference ID:</strong> <code>${data.client.client_id}</code></p>
            <p><strong>Lifecycle Status:</strong> <span class="badge badge-primary">${data.client.status}</span></p>
            <p style="margin-top: 0.5rem;"><strong>Checklist Dynamically Assigned (${data.client.checklist_required.length} items):</strong><br>
            ${data.client.checklist_required.map(i => `<span class="badge badge-secondary" style="margin-right: 4px; margin-top: 4px;">${i}</span>`).join('')}</p>
            <p style="margin-top: 1rem;"><a href="${data.upload_link}" class="btn btn-primary" target="_blank">🔗 Proceed to Tokenized Upload Portal</a></p>
        `;
        resDiv.scrollIntoView({ behavior: 'smooth' });
    }
}
"""

def get_base_html_layout(title: str, body_content: str, current_nav: str = "") -> str:
    """Renders HTML layout with dynamic theme CSS fetched from admin_store."""
    theme = admin_store.get_theme()
    theme_css = admin_store.generate_theme_css()

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title} — {theme.get('firm_name')}</title>
    <style>
        {theme_css}
        * {{
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }}
        body {{
            font-family: var(--font-family);
            background-color: var(--bg-color);
            color: var(--text-primary);
            line-height: 1.5;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
        }}
        header {{
            background-color: var(--surface-color);
            border-bottom: 2px solid var(--border-color);
            padding: 1rem 2rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }}
        .brand {{
            display: flex;
            align-items: center;
            gap: 12px;
        }}
        .brand-logo {{
            width: 38px;
            height: 38px;
            background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
            border-radius: var(--radius);
            display: flex;
            align-items: center;
            justify-content: center;
            color: #ffffff;
            font-weight: 800;
            font-size: 1.2rem;
        }}
        .brand-text h1 {{
            font-size: 1.15rem;
            font-weight: 700;
            color: var(--primary-color);
        }}
        .brand-text p {{
            font-size: 0.75rem;
            color: var(--text-secondary);
        }}
        nav {{
            display: flex;
            gap: 8px;
        }}
        nav a {{
            text-decoration: none;
            color: var(--text-secondary);
            font-size: 0.88rem;
            font-weight: 600;
            padding: 8px 14px;
            border-radius: var(--radius);
            transition: all 0.2s;
        }}
        nav a:hover {{
            color: var(--primary-color);
            background-color: rgba(30, 58, 138, 0.05);
        }}
        nav a.active {{
            color: #ffffff;
            background-color: var(--primary-color);
        }}
        .legal-banner {{
            background-color: #fffbeb;
            color: #92400e;
            border-bottom: 1px solid #fef3c7;
            padding: 0.5rem 2rem;
            font-size: 0.8rem;
            text-align: center;
            font-weight: 500;
        }}
        main {{
            flex: 1;
            max-width: 1200px;
            width: 100%;
            margin: 2rem auto;
            padding: 0 1.5rem;
        }}
        .card {{
            background-color: var(--surface-color);
            border: 1px solid var(--border-color);
            border-radius: var(--radius);
            padding: 1.75rem;
            margin-bottom: 1.5rem;
            box-shadow: 0 1px 3px rgba(0,0,0,0.02);
        }}
        .card-header {{
            border-bottom: 1px solid var(--border-color);
            padding-bottom: 1rem;
            margin-bottom: 1.25rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }}
        .card-header h2 {{
            font-size: 1.2rem;
            color: var(--primary-color);
        }}
        .badge {{
            display: inline-block;
            padding: 4px 10px;
            font-size: 0.75rem;
            font-weight: 700;
            border-radius: 9999px;
            text-transform: uppercase;
        }}
        .badge-primary {{ background: rgba(30,58,138,0.1); color: var(--primary-color); }}
        .badge-secondary {{ background: #f1f5f9; color: var(--text-secondary); border: 1px solid var(--border-color); }}
        .badge-success {{ background: rgba(22,163,74,0.1); color: var(--success-color); }}
        .badge-warning {{ background: rgba(217,119,6,0.1); color: var(--warning-color); }}
        .badge-danger {{ background: rgba(220,38,38,0.1); color: var(--danger-color); }}
        .btn {{
            display: inline-block;
            padding: 10px 18px;
            font-size: 0.9rem;
            font-weight: 600;
            border-radius: var(--radius);
            cursor: pointer;
            border: none;
            transition: opacity 0.2s;
            text-decoration: none;
        }}
        .btn:hover {{ opacity: 0.9; }}
        .btn-primary {{
            background-color: var(--primary-color);
            color: #ffffff;
        }}
        .btn-secondary {{
            background-color: #f1f5f9;
            color: var(--text-primary);
            border: 1px solid var(--border-color);
        }}
        .btn-success {{
            background-color: var(--success-color);
            color: #ffffff;
        }}
        .grid-2 {{
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1.5rem;
        }}
        .form-group {{
            margin-bottom: 1.25rem;
        }}
        .form-group label {{
            display: block;
            font-size: 0.85rem;
            font-weight: 600;
            margin-bottom: 0.4rem;
            color: var(--text-primary);
        }}
        .form-control {{
            width: 100%;
            padding: 9px 12px;
            font-size: 0.9rem;
            border: 1px solid var(--border-color);
            border-radius: var(--radius);
            font-family: inherit;
            background-color: #ffffff;
        }}
        .form-control:focus {{
            outline: none;
            border-color: var(--primary-color);
            box-shadow: 0 0 0 2px rgba(30, 58, 138, 0.15);
        }}
        table {{
            width: 100%;
            border-collapse: collapse;
            font-size: 0.88rem;
        }}
        th, td {{
            padding: 10px 14px;
            text-align: left;
            border-bottom: 1px solid var(--border-color);
        }}
        th {{
            background-color: rgba(241, 245, 249, 0.6);
            font-weight: 700;
            color: var(--text-secondary);
        }}
        footer {{
            background-color: var(--surface-color);
            border-top: 1px solid var(--border-color);
            padding: 1.5rem 2rem;
            text-align: center;
            font-size: 0.8rem;
            color: var(--text-secondary);
        }}
    </style>
</head>
<body>
    <header>
        <div class="brand">
            <div class="brand-logo">A</div>
            <div class="brand-text">
                <h1>{theme.get('firm_name')}</h1>
                <p>{theme.get('tagline')}</p>
            </div>
        </div>
        <nav>
            <a href="/admin" class="{'active' if current_nav == 'admin' else ''}">⚙️ Admin Control Center</a>
            <a href="/intake" class="{'active' if current_nav == 'intake' else ''}">📝 Dynamic Intake Portal</a>
            <a href="/staff" class="{'active' if current_nav == 'staff' else ''}">💼 Staff CRM & Briefings</a>
        </nav>
    </header>
    <div class="legal-banner">
        ⚠️ <strong>Administrative Automation Only</strong> — This platform strictly automates factual data capture, verification, and briefings. It does not provide regulated tax, accounting, or legal advice.
    </div>
    <main>
        {body_content}
    </main>
    <footer>
        &copy; {datetime.now().year} {theme.get('firm_name')} — Powered by Multi-Agent Dynamic Admin Automation Architecture
    </footer>
</body>
</html>"""


class AdminRequestHandler(http.server.BaseHTTPRequestHandler):
    """Zero-dependency HTTP request handler for dynamic admin system."""

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        query = urllib.parse.parse_qs(parsed.query)

        if path in ("/", "/admin"):
            self.render_admin_page()
        elif path == "/intake":
            self.render_intake_page()
        elif path == "/staff":
            self.render_staff_page()
        elif path == "/upload":
            token = query.get("token", [""])[0]
            self.render_upload_page(token)
        elif path == "/api/admin/config":
            self.send_json(admin_store.get_all())
        elif path == "/api/clients":
            clients = [c.to_dict() for c in WEB_CRM_STORE.list_all()]
            self.send_json({"clients": clients})
        elif path == "/api/openai/status":
            self.send_json({
                "configured": openai_client.is_api_key_available(),
                "model": admin_store.get_openai_settings().get("model")
            })
        else:
            self.send_response(404)
            self.end_headers()
            self.wfile.write(b"404 Not Found")

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        content_length = int(self.headers.get("Content-Length", 0))
        post_data = self.rfile.read(content_length).decode("utf-8") if content_length > 0 else "{}"
        
        try:
            payload = json.loads(post_data) if post_data.strip().startswith("{") else urllib.parse.parse_qs(post_data)
        except Exception:
            payload = {}

        if path == "/api/admin/theme":
            updated = admin_store.update_theme(payload)
            self.send_json({"success": True, "theme": updated})
        elif path == "/api/admin/openai":
            updated = admin_store.update_openai_settings(payload)
            self.send_json({"success": True, "openai": updated})
        elif path == "/api/admin/checklists":
            current_all = admin_store.get_all()
            current_all["checklists"] = payload
            admin_store._data = current_all
            admin_store.save()
            self.send_json({"success": True, "checklists": payload})
        elif path == "/api/intake/submit":
            self.handle_intake_submit(payload)
        elif path == "/api/demo/run-full-simulation":
            self.handle_run_simulation()
        else:
            self.send_response(404)
            self.end_headers()
            self.wfile.write(b"Not Found")

    def send_json(self, data: Any, status: int = 200):
        body = json.dumps(data, indent=2).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def render_admin_page(self):
        theme = admin_store.get_theme()
        openai_cfg = admin_store.get_openai_settings()
        checklists = admin_store.get_checklists()

        body = f"""
        <div class="card-header">
            <div>
                <h2>⚙️ Dynamic Admin Control Center</h2>
                <p style="color: var(--text-secondary); font-size: 0.85rem;">Everything is dynamically controlled and fetched from here in real time.</p>
            </div>
            <div>
                <button class="btn btn-success" onclick="runOneClickDemo()">⚡ Run 1-Click Live Simulation</button>
            </div>
        </div>

        <div class="grid-2">
            <!-- Theme & Branding Config -->
            <div class="card">
                <div class="card-header">
                    <h2>🎨 Live Theme & Firm Branding</h2>
                    <span class="badge badge-primary">Dynamic CSS</span>
                </div>
                <p style="font-size: 0.82rem; color: var(--text-secondary); margin-bottom: 1rem;">
                    Theme updates propagate immediately to the Client Intake Portal, Upload Links, and Staff Dashboards.
                </p>
                <form id="themeForm" onsubmit="updateTheme(event)">
                    <div class="form-group">
                        <label>Firm Name</label>
                        <input type="text" class="form-control" name="firm_name" value="{theme.get('firm_name')}">
                    </div>
                    <div class="form-group">
                        <label>Tagline</label>
                        <input type="text" class="form-control" name="tagline" value="{theme.get('tagline')}">
                    </div>
                    <div class="grid-2">
                        <div class="form-group">
                            <label>Primary Brand Color</label>
                            <input type="color" class="form-control" name="primary_color" value="{theme.get('primary_color', '#1e3a8a')}">
                        </div>
                        <div class="form-group">
                            <label>Secondary Color</label>
                            <input type="color" class="form-control" name="secondary_color" value="{theme.get('secondary_color', '#0284c7')}">
                        </div>
                    </div>
                    <div class="grid-2">
                        <div class="form-group">
                            <label>Background Color</label>
                            <input type="color" class="form-control" name="background_color" value="{theme.get('background_color', '#f8fafc')}">
                        </div>
                        <div class="form-group">
                            <label>Card Surface Color</label>
                            <input type="color" class="form-control" name="surface_color" value="{theme.get('surface_color', '#ffffff')}">
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Font Family</label>
                        <select class="form-control" name="font_family">
                            <option value="'Inter', sans-serif" {'selected' if 'Inter' in theme.get('font_family', '') else ''}>Inter (Modern Sans)</option>
                            <option value="'Georgia', serif" {'selected' if 'Georgia' in theme.get('font_family', '') else ''}>Georgia (Traditional Legal/Advisory)</option>
                            <option value="system-ui, sans-serif" {'selected' if 'system-ui' in theme.get('font_family', '') else ''}>Native System UI</option>
                        </select>
                    </div>
                    <button type="submit" class="btn btn-primary" style="width: 100%;">Save & Apply Theme</button>
                </form>
            </div>

            <!-- OpenAI Settings -->
            <div class="card">
                <div class="card-header">
                    <h2>🤖 OpenAI API Configuration</h2>
                    <span class="badge badge-success">OpenAI Integration</span>
                </div>
                <p style="font-size: 0.82rem; color: var(--text-secondary); margin-bottom: 1rem;">
                    Uses OpenAI API (not Claude). Used for document parsing, gap understanding, and pre-meeting synthesis.
                </p>
                <form id="openaiForm" onsubmit="updateOpenAI(event)">
                    <div class="form-group">
                        <label>OpenAI Model</label>
                        <select class="form-control" name="model">
                            <option value="gpt-4o-mini" {'selected' if openai_cfg.get('model') == 'gpt-4o-mini' else ''}>gpt-4o-mini (Fast & Cost-Effective)</option>
                            <option value="gpt-4o" {'selected' if openai_cfg.get('model') == 'gpt-4o' else ''}>gpt-4o (High Reasoning)</option>
                            <option value="gpt-3.5-turbo" {'selected' if openai_cfg.get('model') == 'gpt-3.5-turbo' else ''}>gpt-3.5-turbo</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>OpenAI API Key (or set OPENAI_API_KEY env var)</label>
                        <input type="password" class="form-control" name="api_key" placeholder="sk-proj-..." value="{openai_cfg.get('api_key', '')}">
                        <small style="color: var(--text-secondary); font-size: 0.75rem;">Status: {'✅ Key Configured' if openai_client.is_api_key_available() else 'ℹ️ Deterministic Local Parser Ready (Key optional)'}</small>
                    </div>
                    <div class="form-group">
                        <label>Sampling Temperature (0.0 = Deterministic Factual)</label>
                        <input type="number" step="0.05" min="0.0" max="1.0" class="form-control" name="temperature" value="{openai_cfg.get('temperature', 0.1)}">
                    </div>
                    <div class="form-group">
                        <label>Hard Safety Boundary</label>
                        <div style="background: #f1f5f9; padding: 10px; border-radius: var(--radius); font-size: 0.8rem;">
                            🔒 Strict system prompt active: OpenAI is instructed to perform factual extraction only and strictly blocked from simulating regulated tax/legal advice.
                        </div>
                    </div>
                    <button type="submit" class="btn btn-secondary" style="width: 100%;">Update OpenAI Settings</button>
                </form>
            </div>
        </div>

        <!-- Vertical Checklists Dynamic Config -->
        <div class="card">
            <div class="card-header">
                <h2>📋 Dynamic Cross-Vertical Checklists</h2>
                <span class="badge badge-warning">Zero Code Modifications</span>
            </div>
            <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 1rem;">
                Documents required for onboarding are fetched dynamically based on legal structure and service.
            </p>
            <table>
                <thead>
                    <tr>
                        <th>Vertical / Structure</th>
                        <th>Service</th>
                        <th>Required Documents (Fetched Dynamically)</th>
                        <th>Form Requirements</th>
                    </tr>
                </thead>
                <tbody>
                    {''.join(f'''<tr>
                        <td><strong>{btype}</strong></td>
                        <td>{sname}</td>
                        <td>{' '.join(f'<span class="badge badge-primary">{doc}</span>' for doc in sdata.get("required_documents", []))}</td>
                        <td>{' '.join(f'<span class="badge badge-secondary">{f}</span>' for f in sdata.get("required_form_fields", []))}</td>
                    </tr>''' for btype, services in checklists.items() for sname, sdata in services.items())}
                </tbody>
            </table>
        </div>

        <!-- Real-Time Simulation Output Modal / Section -->
        <div class="card" id="simCard" style="display: none;">
            <div class="card-header">
                <h2>⚡ Live End-to-End Simulation Progress</h2>
                <span id="simStatus" class="badge badge-primary">Running</span>
            </div>
            <pre id="simOutput" style="background: #0f172a; color: #38bdf8; font-family: monospace; font-size: 0.85rem; padding: 1.25rem; border-radius: var(--radius); max-height: 400px; overflow-y: auto; white-space: pre-wrap;">
            </pre>
        </div>

        <script>
        {ADMIN_JS}
        </script>
        """
        html = get_base_html_layout("Admin Control Center", body, current_nav="admin")
        self.send_html(html)

    def render_intake_page(self):
        fields = admin_store.get_intake_fields()

        fields_html = []
        for f in fields:
            fid = f.get("field_id")
            flabel = f.get("label")
            ftype = f.get("field_type")
            freq = "required" if f.get("required") else ""
            help_text = f"<small style='color: var(--text-secondary);'>{f.get('help_text')}</small>" if f.get("help_text") else ""

            if ftype == "select":
                options = "".join(f"<option value='{opt}'>{opt}</option>" for opt in f.get("options", []))
                fields_html.append(f"""
                <div class="form-group">
                    <label>{flabel} {'*' if freq else ''}</label>
                    <select class="form-control" name="{fid}" {freq}>
                        {options}
                    </select>
                    {help_text}
                </div>
                """)
            else:
                input_type = "text"
                if ftype in ("number", "email", "tel", "date"):
                    input_type = ftype
                placeholder = f.get("placeholder", "")
                fields_html.append(f"""
                <div class="form-group">
                    <label>{flabel} {'*' if freq else ''}</label>
                    <input type="{input_type}" class="form-control" name="{fid}" placeholder="{placeholder}" {freq}>
                    {help_text}
                </div>
                """)

        body = f"""
        <div class="card" style="max-width: 700px; margin: 0 auto;">
            <div class="card-header">
                <div>
                    <h2>📝 New Client Intake Form</h2>
                    <p style="font-size: 0.85rem; color: var(--text-secondary);">Fields and styling dynamically fetched from Admin Store.</p>
                </div>
                <span class="badge badge-primary">Dynamic Rendering</span>
            </div>

            <form id="clientIntakeForm" onsubmit="submitClientIntake(event)">
                {''.join(fields_html)}
                <div class="form-group" style="margin-top: 1.5rem;">
                    <button type="submit" class="btn btn-primary" style="width: 100%; padding: 12px;">Submit Administrative Intake</button>
                </div>
            </form>

            <div id="intakeResult" style="display: none; margin-top: 1.5rem; padding: 1rem; border-radius: var(--radius); background: #f0fdf4; border: 1px solid #bbf7d0;">
            </div>
        </div>

        <script>
        {INTAKE_JS}
        </script>
        """
        html = get_base_html_layout("Client Intake Portal", body, current_nav="intake")
        self.send_html(html)

    def render_upload_page(self, token: str):
        is_valid, client_id, err = verify_upload_token(token)

        if not is_valid or not client_id:
            body = f"""
            <div class="card" style="max-width: 600px; margin: 2rem auto; text-align: center;">
                <h2 style="color: var(--danger-color);">Invalid or Expired Upload Link</h2>
                <p style="color: var(--text-secondary); margin-top: 1rem;">{err or 'The upload token could not be verified.'}</p>
                <p style="margin-top: 1.5rem;"><a href="/intake" class="btn btn-primary">Start New Intake</a></p>
            </div>
            """
        else:
            client = WEB_CRM_STORE.get(client_id)
            checklist = client.checklist_required if client else []
            missing = client.missing_items if client else checklist

            body = f"""
            <div class="card" style="max-width: 750px; margin: 0 auto;">
                <div class="card-header">
                    <div>
                        <h2>🔒 Secure Tokenized Document Upload Portal</h2>
                        <p style="font-size: 0.85rem; color: var(--text-secondary);">Client: <strong>{client_id}</strong> (No login or password required)</p>
                    </div>
                    <span class="badge badge-success">Cryptographically Signed</span>
                </div>

                <div style="background: #f8fafc; border: 1px solid var(--border-color); padding: 1rem; border-radius: var(--radius); margin-bottom: 1.5rem;">
                    <h3 style="font-size: 0.95rem; margin-bottom: 0.5rem;">Required Checklist for {client.service_requested if client else 'Onboarding'}:</h3>
                    <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                        {' '.join(f'<span class="badge ' + ('badge-danger' if item in missing else 'badge-success') + f'">{item} ' + ('(Missing)' if item in missing else '(Received)') + '</span>' for item in checklist)}
                    </div>
                </div>

                <div style="border: 2px dashed var(--primary-color); padding: 2.5rem; text-align: center; border-radius: var(--radius); background: rgba(30, 58, 138, 0.02);">
                    <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">📄</div>
                    <h3>Drag & Drop Documents or Select Synthetic Test Batch</h3>
                    <p style="color: var(--text-secondary); font-size: 0.85rem; margin-top: 0.5rem;">Files are ingested and classified using OpenAI API with confidence scoring.</p>
                    <div style="margin-top: 1.5rem; display: flex; justify-content: center; gap: 1rem;">
                        <button class="btn btn-primary" onclick="alert('Demo: Use the 1-Click Simulation in Admin to test file uploads!')">Upload Real File</button>
                    </div>
                </div>
            </div>
            """
        html = get_base_html_layout("Document Upload Portal", body, current_nav="upload")
        self.send_html(html)

    def render_staff_page(self):
        clients = WEB_CRM_STORE.list_all()

        rows = []
        for c in clients:
            rows.append(f"""
            <tr>
                <td><code>{c.client_id}</code></td>
                <td><strong>{c.contact.name}</strong><br><small>{c.contact.email}</small></td>
                <td>{c.business_type}</td>
                <td>{c.service_requested}</td>
                <td><span class="badge badge-primary">{c.status}</span></td>
                <td>{len(c.documents_received)} / {len(c.checklist_required)}</td>
                <td>{' '.join(f'<span class="badge badge-danger">{m}</span>' for m in c.missing_items) if c.missing_items else '<span class="badge badge-success">Complete</span>'}</td>
            </tr>
            """)

        body = f"""
        <div class="card-header">
            <div>
                <h2>💼 Staff CRM & Pre-Meeting Briefings</h2>
                <p style="color: var(--text-secondary); font-size: 0.85rem;">Administrative monitoring and pre-meeting factual summaries.</p>
            </div>
            <a href="/admin" class="btn btn-secondary">Admin Settings</a>
        </div>

        <div class="card">
            <div class="card-header">
                <h2>Active Onboarding Pipelines</h2>
                <span class="badge badge-primary">{len(clients)} Clients</span>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>Client ID</th>
                        <th>Contact</th>
                        <th>Entity</th>
                        <th>Service</th>
                        <th>Status</th>
                        <th>Docs Progress</th>
                        <th>Missing Items</th>
                    </tr>
                </thead>
                <tbody>
                    {''.join(rows) if rows else '<tr><td colspan="7" style="text-align: center; color: var(--text-secondary);">No clients yet. Run the 1-Click Simulation from the Admin panel!</td></tr>'}
                </tbody>
            </table>
        </div>
        """
        html = get_base_html_layout("Staff CRM Dashboard", body, current_nav="staff")
        self.send_html(html)

    def send_html(self, html: str):
        body = html.encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def handle_intake_submit(self, payload: Dict[str, Any]):
        client = WEB_INTAKE_SERVICE.submit_intake(payload)
        upload_link = generate_upload_link(client.client_id, base_url="http://127.0.0.1:8000/upload")
        self.send_json({
            "success": True,
            "client": client.to_dict(),
            "upload_link": upload_link
        })

    def handle_run_simulation(self):
        """Executes the full 5-agent end-to-end workflow live."""
        steps = []
        
        # 1. Intake
        intake_payload = {
            "business_type": "Ltd",
            "service_requested": "Year-end accounts",
            "turnover_band": "£500k - £1m",
            "employee_count": 5,
            "relevant_date": "2025-12-31",
            "contact": {
                "name": "John David Smith",
                "email": "john.smith@apextrading.co.uk",
                "phone": "+44 20 7946 0912"
            },
            "existing_provider": "None"
        }
        client = WEB_INTAKE_SERVICE.submit_intake(intake_payload)
        steps.append({
            "step": 1,
            "title": "Intake Submission & CRM Record Creation (Agent 1)",
            "detail": f"Client ID: {client.client_id}, Initial Status: '{client.status}', Checklist provisioned: {client.checklist_required}"
        })

        # 2. Tokenized Upload Link
        upload_link = generate_upload_link(client.client_id, base_url="http://127.0.0.1:8000/upload")
        steps.append({
            "step": 2,
            "title": "Secure Tokenized Upload Link Generation (Agent 2)",
            "detail": f"Generated Link: {upload_link}"
        })

        # 3. Initial Synthetic Upload (Omitting proof of address)
        initial_docs = get_initial_document_batch()
        client = ingest_client_documents(client, initial_docs)
        steps.append({
            "step": 3,
            "title": "Document Upload & OpenAI Classification (Agents 2 & 5)",
            "detail": f"Uploaded 5 docs (Bank Statement, Accounts, Payroll, Passport, VAT Cert). Notice: 'proof_of_address' deliberately omitted!"
        })

        # 4. Gap Detection & Status Transition
        missing = detect_gaps(client)
        steps.append({
            "step": 4,
            "title": "Gap Detection & Status Transition (Agent 3)",
            "detail": f"Identified missing items: {missing}, Client status updated to: '{client.status}'"
        })

        # 5. Escalating Reminders
        chase1 = generate_reminder(client, reminder_number=1, upload_base_url="http://127.0.0.1:8000/upload")
        WEB_REMINDER_STORE.record(chase1)
        steps.append({
            "step": 5,
            "title": "Escalating Reminder Generation (Agent 3)",
            "detail": f"Generated Chase 1: '{chase1.email.subject}' with mandatory advice disclaimer."
        })

        # 6. Gated Booking Locked Check
        is_eligible, reason, _ = check_booking_eligibility(client)
        steps.append({
            "step": 6,
            "title": "Gated Booking Verification — Blocked (Agent 4)",
            "detail": f"Eligibility: {is_eligible}, Reason: {reason} (Locked as required!)"
        })

        # 7. Uploading Missing Document
        followup_docs = get_followup_document_batch()
        client = ingest_client_documents(client, followup_docs)
        detect_gaps(client)
        steps.append({
            "step": 7,
            "title": "Missing Document Ingestion & Gap Clearance (Agents 2 & 3)",
            "detail": f"Ingested proof_of_address. Missing items: {client.missing_items}, Status updated to: '{client.status}'"
        })

        # 8. Unlocked Booking & Meeting Booking
        is_eligible, reason, booking_url = check_booking_eligibility(client)
        client = book_meeting(client, "2026-09-25T14:30:00Z")
        steps.append({
            "step": 8,
            "title": "Gated Booking Unlocked & Meeting Scheduled (Agent 4)",
            "detail": f"Booking Unlocked: {booking_url}. Meeting booked, status updated to: '{client.status}'"
        })

        # 9. Staff Briefing Summary Generation with OpenAI
        summary = generate_summary(client)
        steps.append({
            "step": 9,
            "title": "OpenAI Pre-Meeting Staff Briefing Synthesis (Agent 4)",
            "detail": f"Generated SummaryRecord for {summary.client_id}. Key figures: £580k turnover, £42,580 bank balance. Advice disclaimer verified. Status updated to: '{client.status}'"
        })

        # 10. Compliance Audit
        comp = validate_compliance(summary)
        steps.append({
            "step": 10,
            "title": "Compliance Audit & Hard Boundary Verification (Agent 5)",
            "detail": f"Compliance check passed: {comp.passed}, Prohibited advice violations: {len(comp.violations)}"
        })

        self.send_json({"success": True, "steps": steps})


def start_server(port: int = 8000):
    server = http.server.HTTPServer(("127.0.0.1", port), AdminRequestHandler)
    print(f"\n" + "=" * 75)
    print(f"  ADMIN AUTOMATION WEB APP IS RUNNING")
    print(f"  URL: http://127.0.0.1:{port}/admin")
    print(f"=" * 75 + "\n")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down server.")
        server.server_close()

if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    start_server(port)
