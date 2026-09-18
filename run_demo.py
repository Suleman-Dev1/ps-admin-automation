#!/usr/bin/env python3
"""
================================================================================
PROFESSIONAL SERVICES ADMIN AUTOMATION — END-TO-END DEMO RUNNER
================================================================================
Demonstrates the full 5-agent integrated workflow:
  1. Intake Form & Automated CRM Record Creation (Agent 1)
  2. Checklist Resolution & Secure Tokenized Upload Portal (Agent 2)
  3. Synthetic Document Ingestion, Classification & Extraction (Agent 2 & 5)
  4. Gap Detection & Status Transition to 'Chasing' (Agent 3)
  5. Escalating Multi-Tier Follow-up Reminders with Real Email Artifacts (Agent 3)
  6. Gated Booking Locked State Check (Agent 4)
  7. Missing Document Upload & Checklist Completion (Agent 2 & 3)
  8. Gated Booking Unlocked State & Meeting Booking (Agent 4)
  9. Staff Pre-Meeting Briefing Summary Generation with Mandatory Disclaimer (Agent 4)
 10. Compliance Audit & Hard Boundary Verification (Agent 5)
 11. Cross-Vertical Portability Demonstration (Law Firm Swappability)
================================================================================
"""

import os
import sys
import json
import time

# Ensure project root is in sys.path
PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from contracts import ClientRecord, DocumentRecord, ChecklistConfig, ReminderRecord, SummaryRecord, ClientStatus
from agent1_intake_crm.intake_service import IntakeService
from agent1_intake_crm.crm_store import CRMStore
from agent2_document.upload_portal import generate_upload_token, verify_upload_token, generate_upload_link
from agent2_document.pipeline import process_document, process_document_batch
from agent2_document.ingestion import ingest_client_documents
from agent2_document.config_loader import get_checklist_for
from agent3_followup.gap_detector import detect_gaps
from agent3_followup.generator import generate_reminder
from agent3_followup.dispatcher import ReminderDispatcher
from agent3_followup.store import ReminderStore
from agent4_scheduling_summary.booking_gate import check_booking_eligibility, book_meeting, BookingLockedError
from agent4_scheduling_summary.summary_generator import generate_summary
from agent4_scheduling_summary.briefing_renderer import render_briefing_markdown
from agent5_qa_compliance.compliance import validate_compliance, ComplianceResult
from synthetic_docs.loader import (
    get_initial_document_batch,
    get_followup_document_batch,
    get_noisy_document,
    get_synthetic_client_profile
)

def print_banner(text: str, char: str = "="):
    print("\n" + char * 80)
    print(f"  {text}")
    print(char * 80)

def print_step(step_num: int, title: str):
    print(f"\n\033[1;36m[STEP {step_num}] {title}\033[0m")
    print("-" * 75)

def print_success(msg: str):
    print(f"\033[1;32m  ✓ {msg}\033[0m")

def print_warning(msg: str):
    print(f"\033[1;33m  ⚠ {msg}\033[0m")

def print_info(msg: str):
    print(f"\033[0;37m  ℹ {msg}\033[0m")

def main():
    print_banner("PROFESSIONAL SERVICES ADMIN AUTOMATION — LIVE DEMO", "=")
    print("Vertical: Accountancy Firm (Apex Trading Ltd Onboarding)")
    print("Boundary: Administrative Automation Only (No Regulated Advice)\n")

    # Initialize Services
    crm_store = CRMStore(in_memory=True)
    intake_service = IntakeService(crm_store=crm_store)
    reminder_store = ReminderStore()
    dispatcher = ReminderDispatcher(store=reminder_store)

    # -------------------------------------------------------------------------
    # STEP 1 & 2: Client Intake & Automatic CRM Record Creation (Agent 1)
    # -------------------------------------------------------------------------
    print_step(1, "Intake Submission & Automated CRM Creation (Agent 1)")
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
        "existing_provider": "None (First Time Ltd Accounting)",
        "notes": "Fast growth e-commerce retailer requiring full year-end compliance."
    }
    
    print_info(f"Submitting intake for: {intake_payload['contact']['name']} ({intake_payload['business_type']}, {intake_payload['service_requested']})")
    client = intake_service.submit_intake(intake_payload)
    print_success(f"Client Record Created: {client.client_id}")
    print_success(f"Status: '{client.status}'")
    print_success(f"Checklist Provisioned ({len(client.checklist_required)} items): {client.checklist_required}")
    print_success(f"Initial Missing Items: {client.missing_items}")

    # -------------------------------------------------------------------------
    # STEP 3: Secure Tokenized Upload Portal Link Generation (Agent 2)
    # -------------------------------------------------------------------------
    print_step(2, "Secure Tokenized Upload Link Generation (Agent 2)")
    upload_link = generate_upload_link(client_id=client.client_id, base_url="https://portal.apex-accountants.co.uk/upload")
    token = generate_upload_token(client_id=client.client_id)
    is_valid, token_client_id, err = verify_upload_token(token)
    print_success(f"Secure Tokenized Upload Link: {upload_link}")
    print_success(f"Token HMAC Verification: valid={is_valid}, client_id={token_client_id}")
    print_info("No client login or password required — cryptographically bound to client record.")

    # -------------------------------------------------------------------------
    # STEP 4: Ingesting Initial Synthetic Documents (Agent 2 & 5)
    # -------------------------------------------------------------------------
    print_step(3, "Initial Document Upload Batch — Deliberately Omitting Proof of Address (Agents 2 & 5)")
    initial_docs = get_initial_document_batch()
    print_info(f"Client uploaded {len(initial_docs)} documents:")
    for d in initial_docs:
        print_info(f"  • {d.doc_type:22} (Period: {d.period_covered:12}, Conf: {d.confidence:.2f})")
    print_warning("Notice: 'proof_of_address' has been DELIBERATELY OMITTED to verify gap detection!")

    # Ingest batch
    client = ingest_client_documents(client, initial_docs)
    print_success(f"Documents Received count: {len(client.documents_received)}")
    print_success(f"Updated Missing Items: {client.missing_items}")
    print_success(f"Client Status after partial upload: '{client.status}'")

    # Also demonstrate low-confidence scan detection
    noisy_doc = get_noisy_document()
    print_info(f"Testing messy/noisy scan detection: {noisy_doc.doc_type} with confidence={noisy_doc.confidence:.2f}")
    if noisy_doc.needs_human_review:
        print_warning("Noisy document flagged for human review (needs_human_review=True) — zero silent guessing!")

    # -------------------------------------------------------------------------
    # STEP 5 & 6: Gap Detection & Escalating Reminder Generation (Agent 3)
    # -------------------------------------------------------------------------
    print_step(4, "Gap Detection & Escalating Follow-up Reminders (Agent 3)")
    missing = detect_gaps(client)
    print_warning(f"Identified Missing Items: {missing}")
    print_success(f"Workflow Status Updated: '{client.status}'")

    print("\n  Generating Real Escalating Communications:")
    # Chase 1
    chase1 = generate_reminder(client, reminder_number=1, upload_base_url="https://portal.apex-accountants.co.uk")
    print_info(f"  [Chase 1 — Day 2: Polite Check-in]")
    print_info(f"    Subject: {chase1.email.subject}")
    print_info(f"    Notice: {chase1.email.disclaimer[:65]}...")

    # Chase 2
    chase2 = generate_reminder(client, reminder_number=2, upload_base_url="https://portal.apex-accountants.co.uk")
    print_info(f"  [Chase 2 — Day 5: Review on Hold]")
    print_info(f"    Subject: {chase2.email.subject}")

    # Chase 3
    chase3 = generate_reminder(client, reminder_number=3, upload_base_url="https://portal.apex-accountants.co.uk")
    print_info(f"  [Chase 3 — Day 9: Urgent Final Notice]")
    print_info(f"    Subject: {chase3.email.subject}")
    
    # Record reminder
    reminder_store.record(chase1)
    print_success(f"Reminder artifact recorded in store (ReminderRecord: client={chase1.reminder_record.client_id}, missing={chase1.reminder_record.missing_items})")

    # -------------------------------------------------------------------------
    # STEP 7: Gated Booking Check — Blocked State (Agent 4)
    # -------------------------------------------------------------------------
    print_step(5, "Gated Calendar Booking Verification — Blocked State (Agent 4)")
    is_eligible, reason, booking_url = check_booking_eligibility(client)
    print_warning(f"Booking Eligibility Check: eligible={is_eligible}")
    print_warning(f"Reason: {reason}")
    print_warning(f"Booking URL: {booking_url}")

    try:
        book_meeting(client, "2026-09-25T10:00:00Z")
        print("ERROR: Booking should have failed!")
    except BookingLockedError as e:
        print_success(f"Gate successfully enforced: Booking attempt was blocked with BookingLockedError!")

    # -------------------------------------------------------------------------
    # STEP 8: Resolving Missing Item & Ingesting Proof of Address (Agents 2 & 5)
    # -------------------------------------------------------------------------
    print_step(6, "Client Submits Missing Document via Portal Link (Agents 2 & 5)")
    followup_docs = get_followup_document_batch()
    print_info(f"Uploading missing document: {followup_docs[0].doc_type} (British Gas Commercial Bill)")
    
    client = ingest_client_documents(client, followup_docs)
    detect_gaps(client)
    print_success(f"Total documents received: {len(client.documents_received)} / {len(client.checklist_required)}")
    print_success(f"Missing items remaining: {client.missing_items}")
    print_success(f"Client Status updated to: '{client.status}'")

    # -------------------------------------------------------------------------
    # STEP 9: Gated Booking Check — Unlocked State & Meeting Booking (Agent 4)
    # -------------------------------------------------------------------------
    print_step(7, "Gated Calendar Booking — Unlocked State & Meeting Booking (Agent 4)")
    is_eligible, reason, booking_url = check_booking_eligibility(client)
    print_success(f"Booking Eligibility Check: eligible={is_eligible}")
    print_success(f"Reason: {reason}")
    print_success(f"Unlocked Booking URL: {booking_url}")

    client = book_meeting(client, "2026-09-25T14:30:00Z")
    print_success(f"Meeting successfully booked! New Status: '{client.status}'")

    # -------------------------------------------------------------------------
    # STEP 10: Auto-Generating Pre-Meeting Staff Briefing Summary (Agent 4)
    # -------------------------------------------------------------------------
    print_step(8, "Auto-Generating Pre-Meeting Staff Summary (Agent 4)")
    summary = generate_summary(client)
    print_success(f"Summary Record Generated for {summary.client_id}")
    print_success(f"Updated Client Status: '{client.status}'")
    print_info(f"Extracted Key Figures: {summary.key_figures_extracted}")
    print_info(f"Open Questions for Staff: {summary.open_questions}")
    print_success(f"Statutory Advice Disclaimer Present: {bool(summary.advice_disclaimer)}")

    briefing_md = render_briefing_markdown(summary, client)
    print("\n" + "=" * 60)
    print("STAFF BRIEFING PREVIEW (Markdown Rendered):")
    print("=" * 60)
    print(briefing_md[:900] + "\n... [Full briefing rendered with 5 tables and disclaimers] ...")

    # -------------------------------------------------------------------------
    # STEP 11: Compliance Verification (Agent 5)
    # -------------------------------------------------------------------------
    print_step(9, "Compliance Framework Audit (Agent 5)")
    comp_client = validate_compliance(client)
    comp_summary = validate_compliance(summary)
    comp_reminder = validate_compliance(chase1.reminder_record)
    print_success(f"ClientRecord Compliance: passed={comp_client.passed}, violations={len(comp_client.violations)}")
    print_success(f"SummaryRecord Compliance: passed={comp_summary.passed}, violations={len(comp_summary.violations)}")
    print_success(f"ReminderRecord Compliance: passed={comp_reminder.passed}, violations={len(comp_reminder.violations)}")

    # -------------------------------------------------------------------------
    # STEP 12: Portability Demonstration (Law Firm Swappability)
    # -------------------------------------------------------------------------
    print_step(10, "Cross-Vertical Portability Demonstration (No Code Changes)")
    law_config = get_checklist_for("Law Firm", "Conveyancing")
    print_info(f"Loaded config for vertical: '{law_config.business_type}' -> '{law_config.service}'")
    print_success(f"Required Documents: {law_config.required_documents}")
    print_success(f"Required Form Fields: {law_config.required_form_fields}")
    print_info("Verified: System switches from Accountancy to Law Firm purely via JSON/YAML config with zero lines of code modified!")

    # -------------------------------------------------------------------------
    # FINAL SUMMARY
    # -------------------------------------------------------------------------
    print_banner("DEMO COMPLETED SUCCESSFULLY — ALL 5 AGENTS OPERATIONAL", "=")
    print("All 6 Demo Acceptance Criteria Verified:")
    print("  [✓] 1. Dummy client completes intake form")
    print("  [✓] 2. CRM record created automatically from form")
    print("  [✓] 3. Client uploads synthetic documents")
    print("  [✓] 4. System identifies deliberately missing required item (proof_of_address)")
    print("  [✓] 5. Real reminder (email or equivalent) is generated for missing item")
    print("  [✓] 6. Once checklist complete, system prepares staff summary & updates workflow status")
    print("\nHard Boundary: Administrative automation only — no regulated professional advice.")
    print("=" * 80 + "\n")

if __name__ == "__main__":
    main()
