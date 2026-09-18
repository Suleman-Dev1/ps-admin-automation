"""Email Templates & Content Generator for Escalating Administrative Follow-ups.

Strictly non-advisory, administrative communication adhering to the project's Hard Boundary:
"NOTICE: Information only — not professional tax, accounting, or legal advice."
"""

from typing import Dict, List, Tuple
import html

# Standard human-friendly document descriptions
DOCUMENT_DESCRIPTIONS: Dict[str, Tuple[str, str]] = {
    "proof_of_address": (
        "Proof of Address",
        "Recent utility bill, council tax statement, or bank statement dated within the last 3 months."
    ),
    "id": (
        "Government Photo Identification",
        "Valid passport or photocard driving licence for all key directors/officers."
    ),
    "bank_statement": (
        "Bank Statements",
        "Statements for the most recent 3-6 months for all primary business accounts."
    ),
    "prior_year_accounts": (
        "Prior Year Accounts / Financial Statements",
        "Complete year-end financial accounts submitted for the previous financial year."
    ),
    "vat_certificate": (
        "VAT Registration Certificate",
        "Official tax authority certificate confirming your business VAT registration."
    ),
    "payroll_summary": (
        "Payroll Summary Report",
        "Year-to-date payroll summary (P11, P60, or equivalent payroll ledger)."
    ),
    "incorporation_certificate": (
        "Certificate of Incorporation",
        "Official registrar certificate confirming statutory incorporation."
    ),
    "articles_of_association": (
        "Articles of Association",
        "Registered statutory constitutional articles / company bylaws."
    ),
    "tax_return": (
        "Previous Year Tax Return",
        "Signed corporation or partnership tax return (e.g. CT600) with tax computation."
    )
}

DISCLAIMER_NOTICE = (
    "NOTICE: Information only — not professional tax, accounting, or legal advice. "
    "This administrative communication requests factual documentation and information for review by licensed professionals."
)


def format_doc_item(doc_key: str) -> Tuple[str, str]:
    """Return (friendly_title, description) for a given document key."""
    if doc_key in DOCUMENT_DESCRIPTIONS:
        return DOCUMENT_DESCRIPTIONS[doc_key]
    title = doc_key.replace("_", " ").title()
    desc = f"Mandatory onboarding documentation for {title}."
    return title, desc


def render_reminder_content(
    reminder_number: int,
    client_id: str,
    client_name: str,
    service_requested: str,
    missing_items: List[str],
    upload_url: str,
    firm_name: str = "PS Professional Services"
) -> Tuple[str, str, str]:
    """Generate (subject, body_text, body_html) based on reminder escalation tier.

    Tier 1 (Day 2): Polite, friendly intake check-in.
    Tier 2 (Day 5): Direct, structured follow-up reminding that review cannot proceed without missing items.
    Tier 3 (Day 9): Urgent final notice before file is marked inactive.
    """
    formatted_items = [format_doc_item(item) for item in missing_items]

    if reminder_number == 1:
        # Chase 1 - Day 2: Polite, friendly check-in
        subject = f"Action Required: Documents needed to complete your onboarding - {client_name}"
        tier_badge = "Onboarding Check-In (Day 2)"
        theme_color = "#1d4ed8"  # Blue
        headline = "Welcome! Let's get your onboarding documentation completed"
        intro_text = (
            f"Dear {client_name},\n\n"
            f"Thank you for choosing {firm_name} for your {service_requested}. "
            f"We are delighted to partner with you.\n\n"
            f"Our administrative team has initiated your file setup. To ensure we can complete your "
            f"intake smoothly and proceed to the next stage, we noticed a few items from your onboarding "
            f"checklist are still outstanding:"
        )
        intro_html = f"""
            <p>Dear <strong>{html.escape(client_name)}</strong>,</p>
            <p>Thank you for choosing <strong>{html.escape(firm_name)}</strong> for your <em>{html.escape(service_requested)}</em>. We are delighted to partner with you.</p>
            <p>Our administrative team has initiated your file setup. To ensure we can complete your intake smoothly and proceed to the next stage, we noticed a few items from your onboarding checklist are still outstanding:</p>
        """
        callout_text = (
            "Please upload these items through our secure client portal as soon as convenient. "
            "Once uploaded, our administrative team will verify the documents and prepare your file."
        )
        callout_html = f"""
            <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 12px 16px; margin: 18px 0; border-radius: 4px;">
                <p style="margin: 0; color: #1e40af; font-size: 14px;"><strong>Next Step:</strong> Please submit the requested items using the secure upload link below so we can complete your administrative intake.</p>
            </div>
        """

    elif reminder_number == 2:
        # Chase 2 - Day 5: Direct, structured follow-up
        subject = f"Reminder: File review on hold pending outstanding documents - {client_name}"
        tier_badge = "Important Follow-Up (Day 5)"
        theme_color = "#d97706"  # Amber
        headline = "File Review On Hold — Outstanding Documents Required"
        intro_text = (
            f"Dear {client_name},\n\n"
            f"We are following up on our previous correspondence regarding your {service_requested} onboarding.\n\n"
            f"Please be advised that your administrative file review is currently ON HOLD. Under our operating "
            f"procedure, our professional team cannot proceed with your case review or schedule preliminary "
            f"consultations until the following required documentation is received:"
        )
        intro_html = f"""
            <p>Dear <strong>{html.escape(client_name)}</strong>,</p>
            <p>We are following up on our previous correspondence regarding your <em>{html.escape(service_requested)}</em> onboarding.</p>
            <p><strong>Please note:</strong> Your administrative file review is currently <strong>ON HOLD</strong>. Under our operating procedure, our professional team cannot proceed with your case review or schedule consultations until the following required documentation is received:</p>
        """
        callout_text = (
            "Action Required: Submitting these documents promptly will allow us to reactivate your file review "
            "and prevent scheduling delays."
        )
        callout_html = f"""
            <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 12px 16px; margin: 18px 0; border-radius: 4px;">
                <p style="margin: 0; color: #92400e; font-size: 14px;"><strong>Operational Requirement:</strong> Case progression is paused until all mandatory documents are submitted. Please upload outstanding records at your earliest convenience.</p>
            </div>
        """

    else:
        # Chase 3 - Day 9: Urgent final notice before file is marked inactive
        subject = f"FINAL NOTICE: Inactive file warning for {client_name} - Action required"
        tier_badge = "FINAL NOTICE (Day 9)"
        theme_color = "#dc2626"  # Crimson Red
        headline = "Urgent: Final Notice Prior to Administrative File Closure"
        intro_text = (
            f"Dear {client_name},\n\n"
            f"This is a final administrative notice regarding the outstanding onboarding documentation for "
            f"your {service_requested}.\n\n"
            f"Despite previous reminders, we have not received the mandatory documents required to open your file. "
            f"If the missing items are not submitted within the next 48 hours, your onboarding case will be "
            f"marked INACTIVE and administrative processing will be terminated.\n\n"
            f"Outstanding documents required:"
        )
        intro_html = f"""
            <p>Dear <strong>{html.escape(client_name)}</strong>,</p>
            <p>This is a <strong>final administrative notice</strong> regarding outstanding onboarding documentation for your <em>{html.escape(service_requested)}</em>.</p>
            <p style="color: #991b1b;"><strong>Critical Deadline:</strong> Despite previous reminders, we have not received the mandatory documents required to open your file. If the missing items are not submitted within the next <strong>48 hours</strong>, your onboarding case will be marked <strong>INACTIVE</strong> and administrative processing will be suspended.</p>
        """
        callout_text = (
            "IMPORTANT: Once a file is marked inactive, reopening the intake process will require submitting a new application "
            "and may cause significant delays."
        )
        callout_html = f"""
            <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 12px 16px; margin: 18px 0; border-radius: 4px;">
                <p style="margin: 0; color: #991b1b; font-size: 14px;"><strong>Final Administrative Warning:</strong> File closure is scheduled within 48 hours. Please upload the requested documents immediately via the secure link below to maintain your active status.</p>
            </div>
        """

    # Build plain text body
    items_text_list = []
    for title, desc in formatted_items:
        items_text_list.append(f"  • {title}:\n    {desc}")
    items_block = "\n".join(items_text_list)

    body_text = f"""{intro_text}

{items_block}

{callout_text}

SECURE UPLOAD PORTAL:
{upload_url}
(Client Reference ID: {client_id})

If you need any guidance on locating or providing these records, please reply directly to this email or reach our administrative desk.

---
{DISCLAIMER_NOTICE}
{firm_name} Administrative Operations
"""

    # Build HTML list
    items_html_rows = []
    for title, desc in formatted_items:
        items_html_rows.append(f"""
            <li style="margin-bottom: 12px;">
                <strong style="color: #1f2937; font-size: 14px;">{html.escape(title)}</strong><br/>
                <span style="color: #4b5563; font-size: 13px;">{html.escape(desc)}</span>
            </li>
        """)
    items_html_block = "".join(items_html_rows)

    # Full responsive HTML body
    body_html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{html.escape(subject)}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #374151; line-height: 1.6;">
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed; background-color: #f3f4f6; padding: 30px 15px;">
        <tr>
            <td align="center">
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); border: 1px solid #e5e7eb;">
                    <!-- Header -->
                    <tr>
                        <td style="padding: 24px 30px; background-color: #111827; border-bottom: 3px solid {theme_color};">
                            <table width="100%" border="0" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td>
                                        <span style="font-size: 18px; font-weight: bold; color: #ffffff; letter-spacing: 0.5px;">{html.escape(firm_name)}</span>
                                    </td>
                                    <td align="right">
                                        <span style="display: inline-block; padding: 4px 10px; font-size: 11px; font-weight: bold; text-transform: uppercase; color: #ffffff; background-color: {theme_color}; border-radius: 12px; letter-spacing: 0.5px;">{tier_badge}</span>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <!-- Main Content -->
                    <tr>
                        <td style="padding: 30px;">
                            <h2 style="margin: 0 0 16px 0; color: #111827; font-size: 20px; font-weight: 700;">{headline}</h2>
                            {intro_html}
                            {callout_html}
                            <div style="margin: 24px 0;">
                                <h3 style="margin: 0 0 12px 0; color: #1f2937; font-size: 15px; text-transform: uppercase; letter-spacing: 0.5px;">Outstanding Checklist Items:</h3>
                                <ul style="margin: 0; padding-left: 20px; color: #374151;">
                                    {items_html_block}
                                </ul>
                            </div>
                            <!-- CTA Button -->
                            <div style="margin: 30px 0 20px 0; text-align: center;">
                                <a href="{html.escape(upload_url)}" style="background-color: {theme_color}; color: #ffffff; text-decoration: none; padding: 14px 28px; font-size: 15px; font-weight: 600; border-radius: 6px; display: inline-block; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">Upload Missing Documents Securely &rarr;</a>
                            </div>
                            <p style="font-size: 12px; color: #6b7280; text-align: center; margin: 10px 0 20px 0;">
                                Client Reference: <code>{html.escape(client_id)}</code> | Direct link: <a href="{html.escape(upload_url)}" style="color: {theme_color}; word-break: break-all;">{html.escape(upload_url)}</a>
                            </p>
                            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
                            <p style="margin: 0; font-size: 13px; color: #6b7280;">
                                If you require assistance or have already transmitted these records, please reply to this email or contact our administrative intake coordinator.
                            </p>
                        </td>
                    </tr>
                    <!-- Mandatory Disclaimer Footer -->
                    <tr>
                        <td style="padding: 20px 30px; background-color: #f9fafb; border-top: 1px solid #e5e7eb;">
                            <p style="margin: 0 0 8px 0; font-size: 11px; font-weight: bold; color: #4b5563; text-transform: uppercase; letter-spacing: 0.5px;">Administrative Notice</p>
                            <p style="margin: 0; font-size: 11px; color: #6b7280; line-height: 1.5;">
                                {html.escape(DISCLAIMER_NOTICE)}
                            </p>
                            <p style="margin: 8px 0 0 0; font-size: 11px; color: #9ca3af;">
                                &copy; {firm_name} Administrative Services. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
"""

    return subject, body_text, body_html
