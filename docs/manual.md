# TechRescue Platform Operations Manual

Comprehensive operating manual for **Clients**, **Remote IT Experts**, **On-Site Field Engineers**, and **Operations Administrators**.

---

## 1. Client User Guide

### 1.1 Raising an Incident (3-Step Wizard)
1. **Navigate to "Raise Query"** from the left navigation bar.
2. **Step 1 (Incident Categorization)**:
   - Provide an exact incident title (e.g. *Azure ExpressRoute Peering Packet Drop*).
   - Select primary category (*Cloud Infrastructure, Network & Firewall, Hardware & Servers, Security, DevOps*).
   - Define business impact (*ENTERPRISE, HIGH, MEDIUM, LOW*) and urgency (*EMERGENCY, HIGH, MEDIUM, LOW*).
   - The platform dynamically computes your SLA priority (P1–P4).
3. **Step 2 (Technical Scope)**:
   - Select environment target (*Azure, AWS, On-Premises DC, Corporate LAN*).
   - Paste configuration traces, syslog lines, or interface IDs.
   - Attach diagnostic packet captures (`.pcap`) or network diagrams.
4. **Step 3 (Escrow & SLA Review)**:
   - Review estimated escrow deposit (e.g. ₹4,500).
   - Agree to SLA terms and submit.

### 1.2 Interacting with Assigned Specialists
- Click **"Workspace"** from your dashboard or query history to enter the incident room.
- Use the **Messages** tab for real-time collaboration.
- Inspect diagnostic **Work Logs** as specialists troubleshoot your infrastructure.

### 1.3 Verifying Resolution & Releasing Escrow
- When the specialist finishes, the ticket transitions to `RESOLVED`.
- Navigate to the **Resolution & Closure** tab.
- Validate that your service is operating nominally.
- Enter a 1 to 5 star rating, provide optional feedback, and click **"Confirm Fix & Release Escrow Payment"**.
- Your escrow deposit is automatically disbursed to the specialist's ledger and an official GST tax invoice is generated.

---

## 2. Remote Expert Guide

### 2.1 Browsing & Claiming Incidents
- Navigate to **"Jobs & Tickets"**.
- Review open queries in the **"Open Pool to Claim"** tab.
- Click **"Accept & Lock Incident"**.
- **Atomic Concurrency Guarantee**: TechRescue secures a row-level transaction lock (`SELECT FOR UPDATE`). If another engineer clicked simultaneously, the system prevents double claims.

### 2.2 Logging Diagnostic Work
- Enter the incident workspace.
- Navigate to **"Work Logs"**.
- Record the hours spent and CLI diagnostics (e.g., *Reseated MTU clamp on virtual network gateway*).
- Work logs are immutably stored for post-incident audits.

### 2.3 Submitting Resolution
- In the **Resolution & Closure** tab, input the root cause analysis and recommended preventive measures.
- Click **"Submit for Client Verification"**.
- Once the client approves, 90% net payout is credited to your earnings balance.

---

## 3. Field Engineer Guide

### 3.1 Proximity Dispatch
- Field technicians receive alerts based on physical datacenter hub proximity (e.g. Bandra-Kurla Complex in Mumbai or DLF Cyber City in Gurgaon).
- Review hardware requirements (e.g., *Cisco StackWise cable replacement, Fluke Versiv tester needed*).

### 3.2 On-Site Workflow Progression
Follow the mandatory 4-step progression:
1. `ASSIGNED` -> Click **"Start Travel to Site"** (`TRAVELING`).
2. Upon arrival at the facility gate -> Click **"Check-In On Site"** (`ON_SITE`).
3. Entering rack / hot-aisle -> Click **"Begin Rack Hardware Work"** (`IN_PROGRESS`).
4. Physical replacement & cable certification complete -> Click **"Complete Physical Repair"** (`RESOLVED`).

---

## 4. Administrator Guide

### 4.1 Executive Console
- Real-time monitoring of active P1/P2/P3/P4 SLA timers.
- Overview of total platform GMV and held escrow funds.

### 4.2 Supervisory Override
- In **All Incidents**, admins can manually reassign tickets to emergency specialists, adjust severity, or force-close disputed tickets.

### 4.3 SOC 2 Audit Trail
- Every user login, status transition, and payment disbursement is permanently logged with actor details, timestamps, and payload signatures in **Audit Trail**.
