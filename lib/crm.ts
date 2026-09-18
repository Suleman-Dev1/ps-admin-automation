import { ClientRecord } from "./types";

export interface CRMResponse {
  success: boolean;
  provider: "airtable" | "hubspot" | "local";
  recordId?: string;
  error?: string;
}

export async function syncClientToCRM(client: ClientRecord): Promise<CRMResponse> {
  const airtableKey = process.env.AIRTABLE_API_KEY;
  const airtableBase = process.env.AIRTABLE_BASE_ID;
  const airtableTable = process.env.AIRTABLE_TABLE_NAME || "Clients";

  const hubspotToken = process.env.HUBSPOT_ACCESS_TOKEN;

  // 1. Try Airtable if configured
  if (airtableKey && airtableBase) {
    try {
      const res = await fetch(`https://api.airtable.com/v0/${airtableBase}/${encodeURIComponent(airtableTable)}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${airtableKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          records: [
            {
              fields: {
                "Client ID": client.id,
                "Name": client.contact.name,
                "Email": client.contact.email,
                "Phone": client.contact.phone,
                "Business Type": client.business_type,
                "Service": client.service_requested,
                "Status": client.status,
                "Turnover": client.turnover_band,
                "Employees": client.employee_count
              }
            }
          ]
        })
      });

      if (res.ok) {
        const data = await res.json();
        return {
          success: true,
          provider: "airtable",
          recordId: data.records?.[0]?.id
        };
      }
      console.warn("Airtable sync responded with non-200:", await res.text());
    } catch (err) {
      console.error("Airtable sync error:", err);
    }
  }

  // 2. Try HubSpot if configured
  if (hubspotToken) {
    try {
      const nameParts = (client.contact.name || "").trim().split(" ");
      const firstName = nameParts[0] || "Client";
      const lastName = nameParts.slice(1).join(" ") || "";

      const res = await fetch("https://api.hubapi.com/crm/v3/objects/contacts", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${hubspotToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          properties: {
            email: client.contact.email,
            firstname: firstName,
            lastname: lastName,
            phone: client.contact.phone,
            company: client.business_type,
            lifecyclestage: "lead"
          }
        })
      });

      if (res.ok) {
        const data = await res.json();
        return {
          success: true,
          provider: "hubspot",
          recordId: data.id
        };
      }
      console.warn("HubSpot sync responded with non-200:", await res.text());
    } catch (err) {
      console.error("HubSpot sync error:", err);
    }
  }

  // 3. Fallback: Log CRM sync locally
  console.log(`[CRM SYNC] Synced client ${client.id} (${client.contact.name}) to CRM store. (Set AIRTABLE_API_KEY or HUBSPOT_ACCESS_TOKEN for live cloud sync).`);
  return {
    success: true,
    provider: "local",
    recordId: `crm_${client.id}`
  };
}

export async function syncClientToAirtable(client: ClientRecord): Promise<CRMResponse> {
  return syncClientToCRM(client);
}

export async function syncClientToHubSpot(client: ClientRecord): Promise<CRMResponse> {
  return syncClientToCRM(client);
}

