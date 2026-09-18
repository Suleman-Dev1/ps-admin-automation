"""
Briefing Renderer Module - Agent 4 (Scheduling & Summary)
Renders a structured, professional Markdown briefing document for accountants and staff.
"""

from typing import Optional
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from contracts import SummaryRecord, ClientRecord


def render_briefing_markdown(
    summary: SummaryRecord,
    client_record: Optional[ClientRecord] = None
) -> str:
    """
    Renders a SummaryRecord into an accountant/professional-facing Markdown briefing document.
    Ensures prominent display of the mandatory administrative disclaimer,
    extracted facts, flagged quality items, and recommended discussion questions.
    """
    lines = []

    # Title & Metadata
    lines.append("# 📋 Pre-Meeting Staff Briefing")
    lines.append("")
    lines.append(f"**Client Profile:** {summary.business_profile}")
    lines.append("")

    # Mandatory Legal / Regulatory Disclaimer
    lines.append("> [!IMPORTANT]")
    lines.append(f"> **DISCLAIMER**: {summary.advice_disclaimer}")
    lines.append("")

    lines.append("---")
    lines.append("")

    # Section 1: Engagement & Client Overview
    lines.append("## 🏢 1. Engagement & Client Overview")
    lines.append("")
    lines.append(f"- **Client Reference ID:** `{summary.client_id}`")
    lines.append(f"- **Service Requested:** **{summary.service_requested}**")
    lines.append(f"- **Briefing Generated:** `{summary.generated_at}`")

    if client_record:
        lines.append(f"- **Lifecycle Status:** `{client_record.status}`")
        lines.append(f"- **Primary Contact:** {client_record.contact.name} ({client_record.contact.email} | {client_record.contact.phone})")
        lines.append(f"- **Business Entity:** {client_record.business_type}")
        lines.append(f"- **Turnover Band:** {client_record.turnover_band}")
        lines.append(f"- **Headcount:** {client_record.employee_count} employees")
        if hasattr(client_record, "booked_slot") and getattr(client_record, "booked_slot"):
            lines.append(f"- **Booked Meeting Slot:** `{getattr(client_record, 'booked_slot')}`")

    lines.append("")

    # Section 2: Intake & Documentation Verification
    lines.append("## 📁 2. Document Intake Status")
    lines.append("")
    if summary.documents_received:
        lines.append("| Received Document Type | Status | Review Required | Confidence |")
        lines.append("| :--- | :--- | :---: | :---: |")

        # If client_record with DocumentRecords is available, display enriched table
        if client_record and client_record.documents_received:
            for doc in client_record.documents_received:
                rev_mark = "⚠️ Yes" if doc.needs_human_review else "✅ No"
                conf_str = f"{doc.confidence * 100:.1f}%"
                lines.append(f"| `{doc.doc_type}` | Verified (`{doc.doc_id}`) | {rev_mark} | {conf_str} |")
        else:
            for doc_type in summary.documents_received:
                lines.append(f"| `{doc_type}` | Received | Standard | N/A |")
    else:
        lines.append("*No documents recorded on file.*")

    lines.append("")

    # Section 3: Extracted Financial Figures & Factual Insights
    lines.append("## 📊 3. Extracted Key Figures & Facts")
    lines.append("")
    if summary.key_figures_extracted:
        lines.append("| Fact / Metric | Extracted Value |")
        lines.append("| :--- | :--- |")
        for key, value in sorted(summary.key_figures_extracted.items()):
            # Format nicely
            label = key.replace("_", " ").title()
            if isinstance(value, float):
                formatted_val = f"£{value:,.2f}" if "balance" in key or "turnover" in key or "profit" in key or "debits" in key or "credits" in key else f"{value:,.2f}"
            else:
                formatted_val = str(value)
            lines.append(f"| **{label}** | `{formatted_val}` |")
    else:
        lines.append("*No numerical or key facts extracted.*")

    lines.append("")

    # Section 4: Flagged Items & Quality Exceptions
    lines.append("## ⚠️ 4. Flagged Items & Quality Checks")
    lines.append("")
    if summary.flagged_items:
        lines.append("> [!WARNING]")
        lines.append("> The following items require manual verification before or during the consultation:")
        for flag in summary.flagged_items:
            lines.append(f"> - {flag}")
    else:
        lines.append("✅ **All received documents passed automated OCR and validation thresholds without exceptions.**")

    lines.append("")

    # Section 5: Staff Actionable Open Questions
    lines.append("## ❓ 5. Recommended Discussion Points & Open Questions")
    lines.append("")
    if summary.open_questions:
        for idx, q in enumerate(summary.open_questions, start=1):
            lines.append(f"{idx}. {q}")
    else:
        lines.append("1. Confirm all factual figures provided with the client.")
        lines.append("2. Inquire whether there are any undisclosed group entities or subsidiaries.")

    lines.append("")
    lines.append("---")
    lines.append("*Automated administrative briefing compiled by PS Admin Automation — Agent 4.*")

    return "\n".join(lines)


# Convenient alias
render_staff_briefing = render_briefing_markdown
