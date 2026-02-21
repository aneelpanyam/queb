import type { SetupConfiguration } from './setup-config-types'
import type { Product } from './product-types'
import { CROSSWORD_SEED_CONFIG } from './seed-crossword-config'
import { WORKBOOK_SEED_CONFIG } from './seed-workbook-config'

const SEED_FLAG_KEY = 'queb-seed-data-installed'
const CROSSWORD_SEED_FLAG = 'queb-crossword-seed-installed'
const WORKBOOK_SEED_FLAG = 'queb-workbook-seed-installed'
const SEED_TS = '2025-06-01T00:00:00.000Z'

const CTX = {
  industry: 'Manufacturing',
  role: 'Chief Information Security Officer (CISO)',
  orgSize: 'SMB, Enterprises',
  activity: 'Cyber Incident Response Planning & Practice',
  situation: 'Building and testing incident response capabilities for manufacturing operations across US-based SMB and enterprise organizations',
}

const LEGACY = {
  industry: CTX.industry,
  service: '',
  role: CTX.role,
  activity: CTX.activity,
  situation: CTX.situation,
  targetAudience: '',
  additionalContext: [{ label: 'Organization Size', value: CTX.orgSize }],
}

const BRANDING = { accentColor: '#1e40af', authorName: 'Queb Reference Kit', authorBio: '' }

function seedProduct(
  id: string,
  outputType: string,
  name: string,
  description: string,
  sections: Product['sections'],
): Product {
  return {
    id: `seed-prod-${id}`,
    createdAt: SEED_TS,
    updatedAt: SEED_TS,
    name,
    description,
    status: 'published',
    configurationId: 'seed-config-reference-kit',
    outputType,
    contextFields: { ...CTX },
    ...LEGACY,
    sections,
    annotations: {},
    branding: BRANDING,
  }
}

// ============================================================
// Reference Configuration
// ============================================================

const SEED_CONFIG: SetupConfiguration = {
  id: 'seed-config-reference-kit',
  name: 'Cyber Incident Response — Reference Kit',
  description:
    'A reference configuration demonstrating all product types. Context: Manufacturing CISO focused on cyber incident response planning across US-based SMB and enterprise organizations.',
  steps: [
    {
      id: 'step-org',
      name: 'Organization Profile',
      description: 'Define the industry, role, and organization size',
      fields: [
        { fieldId: 'industry', required: true },
        { fieldId: 'role', required: true },
        {
          fieldId: 'empty-field',
          required: false,
          customName: 'orgSize',
          customLabel: 'Organization Size',
          customSelectionMode: 'multi',
          promptOverride:
            'List 6 common organization size categories for businesses. Include: Startup, SMB, Mid-Market, Enterprise, Large Enterprise, Government/Public Sector.',
        },
      ],
    },
    {
      id: 'step-focus',
      name: 'Focus Area',
      description: 'Define the specific activity and situation',
      fields: [
        { fieldId: 'activity', required: true },
        { fieldId: 'situation', required: false },
      ],
    },
  ],
  outputs: [
    { outputTypeId: 'questions' },
    { outputTypeId: 'checklist' },
    { outputTypeId: 'email-course' },
    { outputTypeId: 'prompts' },
    { outputTypeId: 'battle-cards' },
    { outputTypeId: 'decision-books' },
    { outputTypeId: 'dossier' },
    { outputTypeId: 'playbook' },
    { outputTypeId: 'cheat-sheets' },
    { outputTypeId: 'agent-book' },
    { outputTypeId: 'ebook' },
  ],
  createdAt: SEED_TS,
  updatedAt: SEED_TS,
}

// ============================================================
// 1. Question Book
// ============================================================

const questionsProduct = seedProduct(
  'questions',
  'questions',
  'Cyber Incident Response — Question Book',
  'Probing questions to stress-test your manufacturing organization\'s incident response readiness, from strategic alignment to technical controls.',
  [
    {
      name: 'Strategic Perspective',
      description: 'Alignment with long-term goals, vision, mission, and competitive positioning',
      elements: [
        {
          fields: {
            question: 'How does your incident response program align with the organization\'s broader operational resilience and business continuity strategy?',
            relevance: 'Manufacturing depends on uptime. If IR exists in a silo, recovery priorities may conflict with production schedules, causing longer downtime or unsafe restarts.',
            infoPrompt: 'Review the BCP/DR plan and compare its recovery priorities against the IR plan. Interview plant managers to verify alignment.',
            actionSteps: 'Map IR recovery objectives to business-critical production lines. Create a shared priority matrix signed off by both IT security and operations leadership.',
            redFlags: 'IR plan has no reference to OT systems. Recovery time objectives differ between IT and plant operations. No joint tabletop exercises with operations.',
            keyMetrics: 'Recovery Time Objective (RTO) alignment %, joint exercises per year',
          },
        },
        {
          fields: {
            question: 'What is the board-level risk appetite for cyber incidents that could halt manufacturing operations, and how is that appetite operationalized into IR investment decisions?',
            relevance: 'Without a clear risk appetite from the board, IR budgets are either inflated or dangerously thin. Manufacturing downtime costs $20K–$50K+ per hour in many sectors.',
            infoPrompt: 'Request the most recent board risk committee minutes. Check whether cyber risk appetite statements reference OT/manufacturing explicitly.',
            actionSteps: 'Quantify worst-case production downtime costs. Present scenarios to the board with investment tiers and expected risk reduction per tier.',
            redFlags: 'No documented risk appetite. Board materials treat cyber as "IT problem." IR budget has been flat for 3+ years despite growing OT exposure.',
            keyMetrics: 'Annual IR budget as % of revenue, board cyber briefings per year',
          },
        },
      ],
    },
    {
      name: 'Risk & Compliance Perspective',
      description: 'Regulatory compliance, risk assessment, mitigation strategies, and governance',
      elements: [
        {
          fields: {
            question: 'Are your incident response procedures compliant with NIST CSF, IEC 62443, and any sector-specific regulations (e.g., CMMC for defense supply chain manufacturers)?',
            relevance: 'Manufacturing firms face overlapping regulatory frameworks. Non-compliance can result in contract loss, fines, and liability amplification after a breach.',
            infoPrompt: 'Conduct a gap assessment against NIST CSF IR functions and IEC 62443 security levels. Review customer contracts for flow-down security requirements.',
            actionSteps: 'Build a compliance mapping matrix linking each IR procedure to its regulatory requirement. Prioritize gaps by contractual and financial exposure.',
            redFlags: 'No formal gap assessment in the past 24 months. IR plan does not reference IEC 62443. Compliance team and security team operate independently.',
            keyMetrics: 'Compliance gap count, time since last assessment, regulatory audit findings',
          },
        },
        {
          fields: {
            question: 'How quickly can your organization meet breach notification obligations across all applicable jurisdictions when a manufacturing system compromise exposes personal or controlled data?',
            relevance: 'Manufacturing firms with multi-state or international operations face varied notification timelines (24 hours under NIS2, 72 hours under GDPR, state-specific in the US). Slow notification invites penalties and reputational damage.',
            infoPrompt: 'Catalog all jurisdictions where the company operates. Map data types processed in manufacturing (employee PII, customer data, CUI) to notification triggers.',
            actionSteps: 'Create a notification decision tree by jurisdiction. Pre-draft notification templates. Establish a legal-IR communication protocol that can activate within 4 hours.',
            redFlags: 'No legal counsel on the IR team roster. Notification templates do not exist. No one has mapped state-by-state requirements.',
            keyMetrics: 'Time-to-notification readiness, jurisdictions mapped, template coverage %',
          },
        },
      ],
    },
    {
      name: 'Technology Perspective',
      description: 'Technical feasibility, digital transformation, tools, systems, and infrastructure',
      elements: [
        {
          fields: {
            question: 'Do you have network segmentation and visibility between IT and OT environments sufficient to detect lateral movement from a compromised corporate network into industrial control systems?',
            relevance: 'The IT-OT convergence in modern manufacturing creates pathways for attackers to pivot from email phishing to PLC manipulation. Without segmentation and monitoring, detection is nearly impossible.',
            infoPrompt: 'Request the network architecture diagram. Verify firewall rules between IT and OT zones. Check whether OT traffic is being ingested by the SIEM or a dedicated OT monitoring tool.',
            actionSteps: 'Deploy or validate a demilitarized zone (DMZ) between IT and OT. Ensure at least passive network monitoring on the OT side. Integrate OT alerts into the unified IR workflow.',
            redFlags: 'Flat network between corporate IT and plant floor. No OT-specific monitoring tool deployed. SIEM has zero OT data sources.',
            keyMetrics: 'IT-OT segmentation score, OT data sources in SIEM, mean time to detect OT anomalies',
          },
        },
        {
          fields: {
            question: 'Can your IR team remotely isolate a compromised manufacturing endpoint or HMI without physically accessing the plant floor, and have you tested this capability?',
            relevance: 'Manufacturing sites may be geographically dispersed. If isolation requires physical presence, response times extend from minutes to hours, letting attackers deepen their foothold.',
            infoPrompt: 'Interview the IR team about remote isolation capabilities. Review EDR/NAC coverage across OT-adjacent systems. Check the last time remote containment was tested.',
            actionSteps: 'Deploy endpoint detection and response (EDR) agents where safe on OT-adjacent systems. Implement network access control (NAC) policies that allow remote quarantine. Run a containment drill quarterly.',
            redFlags: 'No EDR on any OT-adjacent endpoints. Remote access to plant networks requires VPN that is shared with vendors. Containment has never been tested on a live system.',
            keyMetrics: 'Remote isolation capability coverage %, containment drill frequency, mean time to contain',
          },
        },
      ],
    },
  ],
)

// ============================================================
// 2. Checklist
// ============================================================

const checklistProduct = seedProduct(
  'checklist',
  'checklist',
  'Incident Response Readiness Checklist',
  'A structured checklist for manufacturing CISOs to verify incident response preparedness across preparation, execution, and risk management.',
  [
    {
      name: 'Preparation & Prerequisites',
      description: 'Everything needed before an incident — inputs, approvals, context gathering, and readiness checks',
      elements: [
        {
          fields: {
            item: 'Maintain an up-to-date asset inventory covering both IT and OT environments',
            description: 'Ensure every networked device — servers, workstations, PLCs, HMIs, sensors, and network equipment — is cataloged with owner, location, criticality tier, and last patched date.',
            priority: 'High',
            commonMistakes: 'Treating OT assets as out of scope. Relying on spreadsheets that go stale within weeks. Not including vendor-managed devices.',
            tips: 'Use automated discovery tools for IT and passive scanning for OT. Reconcile quarterly against procurement records and plant floor walkthroughs.',
            verificationMethod: 'Compare the asset inventory against a live network scan and flag unaccounted devices.',
          },
        },
        {
          fields: {
            item: 'Establish and test out-of-band communication channels for the IR team',
            description: 'Define backup communication methods (encrypted messaging app, satellite phone, pre-configured radio) that function even if corporate email and VoIP are compromised.',
            priority: 'High',
            commonMistakes: 'Assuming corporate email will be available during a ransomware event. Listing personal cell phones without verifying numbers. Not testing the channel under pressure.',
            tips: 'Issue pre-configured devices to key responders. Include physical contact cards in the IR go-bag. Test quarterly during tabletop exercises.',
            verificationMethod: 'Conduct an unannounced out-of-band communication drill and measure response time for all core team members.',
          },
        },
      ],
    },
    {
      name: 'Process & Execution',
      description: 'The core steps of doing the work — sequencing, methods, and execution standards',
      elements: [
        {
          fields: {
            item: 'Define clear escalation criteria and thresholds for each incident severity level',
            description: 'Document what conditions trigger escalation from Tier 1 to Tier 2, when to engage legal counsel, when to notify the CEO, and when to activate the crisis management team.',
            priority: 'High',
            commonMistakes: 'Vague criteria like "significant impact" without quantification. No distinction between IT-only and OT-impacting incidents. Escalation paths that skip plant operations leadership.',
            tips: 'Use concrete thresholds: number of systems affected, production lines impacted, data types exposed. Create a one-page escalation quick-reference card.',
            verificationMethod: 'Walk through three recent incidents (or simulated ones) and verify the correct escalation path was followed at each decision point.',
          },
        },
        {
          fields: {
            item: 'Ensure forensic evidence preservation procedures are documented and practiced',
            description: 'IR team must know how to capture volatile memory, disk images, network logs, and OT historian data without contaminating evidence or disrupting ongoing production.',
            priority: 'Medium',
            commonMistakes: 'Reimaging machines before forensic capture. Not preserving OT historian logs. Using admin credentials that overwrite attacker artifacts.',
            tips: 'Pre-stage forensic toolkits (write blockers, USB boot drives) at each major site. Partner with an external forensics firm under retainer for complex cases.',
            verificationMethod: 'Review the last 3 incident reports to confirm evidence was collected according to the documented procedure.',
          },
        },
      ],
    },
    {
      name: 'Risk & Contingency',
      description: 'Potential failure points, risk mitigation steps, fallback plans, and early warning signs',
      elements: [
        {
          fields: {
            item: 'Maintain offline, immutable backups of critical OT configurations and safety system images',
            description: 'Ensure PLC programs, HMI configurations, safety instrumented system (SIS) logic, and historian databases are backed up to media that cannot be reached or encrypted by ransomware.',
            priority: 'High',
            commonMistakes: 'Backing up to network shares accessible from the corporate domain. Not testing restoration of OT backups. Forgetting safety system configurations.',
            tips: 'Use air-gapped media stored in a physically secure location. Test restoration to a lab environment semi-annually. Version-control PLC programs where possible.',
            verificationMethod: 'Attempt a full restore of one critical PLC program and one HMI configuration from the offline backup to a test environment.',
          },
        },
        {
          fields: {
            item: 'Pre-negotiate incident response retainer agreements with external forensics and legal firms',
            description: 'Having retainers in place eliminates procurement delays when a major incident hits. Ensure the retainer covers manufacturing/OT expertise, not just traditional IT forensics.',
            priority: 'Medium',
            commonMistakes: 'Selecting a firm with no OT/ICS forensics experience. Not verifying SLA response times in the retainer. Letting the retainer lapse without renewal.',
            tips: 'Include a clause for on-site response within 24 hours. Verify the firm has cleared personnel if you handle CUI or classified programs. Review retainer terms annually.',
            verificationMethod: 'Confirm active retainer status, verify last annual review date, and request a test activation to validate the contact and escalation process.',
          },
        },
      ],
    },
  ],
)

// ============================================================
// 3. Email Course
// ============================================================

const emailCourseProduct = seedProduct(
  'email-course',
  'email-course',
  'CISO Incident Response Mastery Course',
  'A structured email course to help manufacturing CISOs build, test, and mature their incident response programs from foundations through advanced techniques.',
  [
    {
      name: 'Foundation & Context',
      description: 'Set the stage — why this topic matters, what\'s at stake, and how this course will help',
      elements: [
        {
          fields: {
            subject: 'Why Manufacturing Is the #1 Target for Ransomware — And What Your IR Plan Is Missing',
            body: 'Welcome to this course on building a battle-ready incident response program for manufacturing.\n\nManufacturing has been the most-attacked sector globally for three consecutive years. The reason is straightforward: downtime is devastating. When production stops, revenue stops — and attackers know you are more likely to pay.\n\nBut most manufacturing IR plans were written for IT environments. They assume you can isolate endpoints freely, that all systems can be patched on schedule, and that forensic tools work on every device. In a plant with 15-year-old PLCs, air-gapped historians, and shared HMI credentials, those assumptions collapse.\n\nOver the coming emails, we will rebuild your IR approach from the ground up — tailored specifically for the realities of manufacturing operations.',
            callToAction: 'Audit your current IR plan and flag every section that references only IT systems.',
            keyTakeaway: 'IR plans designed for IT environments fail in manufacturing because OT constraints fundamentally change what is possible during response.',
            subjectLineVariants: '• "Your IR Plan Has a Manufacturing Blind Spot"\n• "The $260K/Hour Problem: Manufacturing Downtime After a Cyber Attack"\n• "Day 1: Why Generic IR Plans Fail on the Plant Floor"',
            sendTiming: 'Day 1 — Monday morning',
          },
        },
        {
          fields: {
            subject: 'The Real Cost of an OT Cyber Incident — Beyond the Ransom',
            body: 'When we talk about the cost of a cyber incident in manufacturing, most people jump to the ransom demand. But that is rarely the largest number.\n\nConsider the full picture: production downtime ($20K–$250K per hour depending on your sector), expedited shipping to meet delayed orders, regulatory fines and notification costs, customer penalties for missed SLAs, overtime labor for manual operations during recovery, and long-term brand damage.\n\nA mid-size auto parts manufacturer lost $45M in a single ransomware event — and they never paid the ransom. The cost was pure operational disruption.\n\nThe takeaway: your IR program\'s value should be measured against total incident cost, not just the probability of paying a ransom. This reframing is essential when presenting to the board.',
            callToAction: 'Calculate your organization\'s estimated hourly downtime cost for the top 3 production lines.',
            keyTakeaway: 'Total incident cost in manufacturing is dominated by operational disruption, not ransom payments. Quantifying this is your best tool for securing IR investment.',
            subjectLineVariants: '• "The Hidden $45M: What a Ransomware Attack Really Costs a Manufacturer"\n• "Beyond the Ransom: Calculating Your True Cyber Incident Exposure"\n• "Why Your Board Underestimates Cyber Risk by 10x"',
            sendTiming: 'Day 3 — Wednesday morning',
          },
        },
      ],
    },
    {
      name: 'Core Frameworks',
      description: 'Introduce the key mental models, frameworks, and principles that underpin success',
      elements: [
        {
          fields: {
            subject: 'The IR Framework That Actually Works for Manufacturing: NIST + IEC 62443',
            body: 'Most CISOs know NIST CSF and the NIST SP 800-61 Incident Handling Guide. These are solid foundations. But they were designed with IT environments in mind.\n\nFor manufacturing, you need to layer in IEC 62443 — the international standard for industrial automation and control system security. Where NIST tells you to "contain the incident," IEC 62443 helps you understand what containment means when the affected system is a safety controller running a chemical process.\n\nHere is the practical synthesis:\n\n1. Use NIST SP 800-61 as your process backbone (Preparation → Detection → Containment → Eradication → Recovery → Lessons Learned)\n2. Apply IEC 62443 security levels to classify assets and define acceptable response actions per zone\n3. Add Purdue Model zoning to your containment playbooks — know which levels you can isolate without triggering safety shutdowns\n\nThis hybrid approach gives you regulatory credibility and operational reality in one framework.',
            callToAction: 'Map your top 10 OT assets to IEC 62443 security levels and Purdue Model zones.',
            keyTakeaway: 'Combine NIST SP 800-61 for process rigor with IEC 62443 for OT-specific constraints to build an IR framework that works on the plant floor.',
            subjectLineVariants: '• "NIST Alone Is Not Enough: The Manufacturing IR Framework"\n• "How to Merge NIST and IEC 62443 Into One IR Program"\n• "The 3-Layer Framework for OT Incident Response"',
            sendTiming: 'Day 5 — Friday morning',
          },
        },
        {
          fields: {
            subject: 'Severity Classification for Manufacturing: When "Critical" Means Lives, Not Just Data',
            body: 'In IT, a critical incident means sensitive data may be exposed or a key application is down. In manufacturing, a critical incident can mean a safety system is compromised, toxic materials could be released, or heavy machinery could behave unpredictably.\n\nYour severity classification must account for:\n\n• Safety Impact — Is there any risk to human life or physical safety?\n• Environmental Impact — Could the incident cause chemical release, emissions, or contamination?\n• Production Impact — How many lines are affected and what is the hourly revenue loss?\n• Data Impact — Is intellectual property, CUI, or personal data at risk?\n• Regulatory Impact — Does this trigger mandatory reporting?\n\nBuild a 4-level severity matrix (Low, Medium, High, Critical) that weights safety and environmental factors above production and data. This is the single most important calibration for manufacturing IR.',
            callToAction: 'Draft a 4-level severity matrix using the five impact dimensions above and share it with your plant operations leader for feedback.',
            keyTakeaway: 'Manufacturing severity classification must prioritize safety and environmental impact above data and revenue. This fundamentally changes escalation paths and response actions.',
            subjectLineVariants: '• "When \'Critical\' Means Safety, Not Just Servers"\n• "The 5-Dimension Severity Matrix Every Manufacturing CISO Needs"\n• "Stop Classifying OT Incidents Like IT Incidents"',
            sendTiming: 'Day 8 — Monday morning',
          },
        },
      ],
    },
    {
      name: 'Practical Implementation',
      description: 'Step-by-step guidance on execution — what to do on Day 1, Week 1, Month 1',
      elements: [
        {
          fields: {
            subject: 'Your First 30 Days: Building the IR Foundation Without Disrupting Production',
            body: 'You do not need to boil the ocean. Here is a practical 30-day plan to establish IR fundamentals without disrupting manufacturing operations.\n\nWeek 1 — Inventory & Stakeholders\n• Compile your IT and OT asset inventory (even if incomplete)\n• Identify your IR core team: security analyst, OT engineer, plant ops lead, legal, communications\n• Secure executive sponsor sign-off\n\nWeek 2 — Communication & Escalation\n• Set up out-of-band communication (encrypted group chat, emergency contact cards)\n• Document escalation criteria using the 4-level severity matrix\n• Brief the core team on their roles\n\nWeek 3 — Detection & Containment Basics\n• Verify SIEM is ingesting IT logs; identify what OT visibility exists today\n• Document manual containment procedures for the top 5 OT systems by criticality\n• Pre-stage forensic go-bags at primary manufacturing sites\n\nWeek 4 — First Tabletop Exercise\n• Run a 90-minute tabletop scenario: ransomware spreading from corporate email to an HMI on the plant floor\n• Capture gaps, assign owners, set 60-day improvement targets',
            callToAction: 'Block 2 hours this week to complete the Week 1 tasks: asset inventory snapshot and core team identification.',
            keyTakeaway: 'A focused 30-day plan builds meaningful IR capability without requiring production downtime or large budgets. Start with people and process, not tools.',
            subjectLineVariants: '• "The 30-Day Manufacturing IR Jumpstart Plan"\n• "Week-by-Week: Standing Up Your IR Program Without Halting Production"\n• "Day 1 Starts Now: Your IR Quick-Start Checklist"',
            sendTiming: 'Day 10 — Wednesday morning',
          },
        },
        {
          fields: {
            subject: 'Running Your First OT-Focused Tabletop Exercise: A Step-by-Step Guide',
            body: 'Tabletop exercises are the highest-ROI activity in your IR program. They expose gaps, build muscle memory, and create cross-functional relationships — all without touching a production system.\n\nHere is how to run your first one:\n\nBefore the Exercise:\n• Pick a realistic scenario (ransomware hitting an HMI is a good first choice)\n• Invite: CISO, SOC lead, OT engineer, plant manager, legal counsel, communications lead\n• Prepare 4-5 "injects" — escalating developments revealed every 15 minutes\n• Print the current IR plan and escalation matrix for reference\n\nDuring the Exercise (90 minutes):\n• Facilitator reads the scenario and first inject\n• Each participant describes what they would do, who they would call, what tools they would use\n• Facilitator probes: "What if email is down?" "What if the OT engineer is on vacation?"\n• Record every gap, assumption, and disagreement\n\nAfter the Exercise:\n• Debrief immediately while it is fresh (30 minutes)\n• Categorize findings: Quick Wins (fix this week), Short-Term (30 days), Strategic (90 days)\n• Assign owners and deadlines. Publish the after-action report within 5 business days.',
            callToAction: 'Schedule your first tabletop exercise within the next 2 weeks. Use the ransomware-to-HMI scenario as your starting point.',
            keyTakeaway: 'A well-facilitated tabletop exercise delivers more IR improvement per dollar than any tool purchase. Do one before you buy anything.',
            subjectLineVariants: '• "The 90-Minute Exercise That Will Transform Your IR Program"\n• "How to Run a Tabletop That Plant Managers Actually Want to Attend"\n• "Stop Buying Tools — Start Running Tabletops"',
            sendTiming: 'Day 12 — Friday morning',
          },
        },
      ],
    },
  ],
)

// ============================================================
// 4. Prompt Pack
// ============================================================

const promptsProduct = seedProduct(
  'prompts',
  'prompts',
  'Incident Response AI Prompt Pack',
  'Ready-to-use AI prompts for manufacturing CISOs to accelerate incident response planning, analysis, and communication tasks.',
  [
    {
      name: 'Research & Discovery',
      description: 'Gathering information, market intelligence, competitive analysis, and landscape mapping',
      elements: [
        {
          fields: {
            prompt: 'You are a cybersecurity threat intelligence analyst specializing in manufacturing and industrial control systems. Research and summarize the top 10 cyber threat actors and campaigns that have targeted the manufacturing sector in the past 18 months. For each, provide: threat actor name, attack vector, targeted subsystems (IT vs. OT), impact type, and recommended detection signatures or indicators of compromise.',
            context: 'Use when preparing threat briefings for the board, updating your threat model, or onboarding new SOC analysts who need manufacturing-specific context.',
            expectedOutput: 'A structured table of 10 threat actors with columns for name, attack vector, target (IT/OT), impact, and IOCs. Each entry should include 2-3 sentences of context.',
            variations: '• Narrow to ransomware-only threats\n• Focus on supply chain attack vectors\n• Filter to threats relevant to a specific manufacturing sub-sector (e.g., automotive, pharma, food & beverage)',
            tips: 'Provide your specific manufacturing sub-sector for more targeted results. Mention any threat intelligence feeds you already subscribe to so the output avoids duplication.',
            exampleOutput: '| # | Threat Actor | Vector | Target | Impact | Key IOC |\n|---|---|---|---|---|---|\n| 1 | LockBit 3.0 | Phishing → RDP | IT → OT lateral | Ransomware + data exfil | C2 domain: ...',
          },
        },
        {
          fields: {
            prompt: 'Act as a regulatory compliance researcher. For a manufacturing company operating in [STATES/COUNTRIES], compile all cyber incident notification and reporting requirements. For each jurisdiction, provide: the regulation name, notification trigger (what constitutes a reportable incident), notification timeline, required recipients, penalties for non-compliance, and any manufacturing-specific carve-outs.',
            context: 'Use when building your notification decision tree, preparing for regulatory audits, or expanding manufacturing operations to new jurisdictions.',
            expectedOutput: 'A jurisdiction-by-jurisdiction compliance matrix with clear timelines and triggers, organized by strictest-first.',
            variations: '• Focus on US state-level breach notification laws\n• Focus on EU/NIS2 requirements for essential entities\n• Add CMMC/DFARS requirements for defense supply chain manufacturers',
            tips: 'Specify your exact operating jurisdictions for precise results. Mention whether you process personal data, controlled unclassified information (CUI), or health data.',
            exampleOutput: '**California (CCPA/CPRA)**\n- Trigger: Breach of unencrypted personal information\n- Timeline: "Without unreasonable delay" (interpreted as <45 days)\n- Recipients: Affected individuals, CA Attorney General if >500 residents\n- Penalty: $100–$750 per consumer per incident (statutory damages)...',
          },
        },
      ],
    },
    {
      name: 'Analysis & Diagnosis',
      description: 'Breaking down complex problems, root cause analysis, pattern recognition, and data interpretation',
      elements: [
        {
          fields: {
            prompt: 'You are an OT cybersecurity incident analyst. I will provide you with a sequence of network events and alerts from our manufacturing environment. Analyze the timeline and determine: (1) the likely attack vector, (2) the current stage in the kill chain, (3) which OT systems are at risk of lateral movement, (4) recommended immediate containment actions that will NOT trigger safety system shutdowns, and (5) evidence to preserve. Here are the events:\n\n[PASTE ALERT TIMELINE]',
            context: 'Use during an active incident or post-incident analysis when you need rapid triage of alert data from your SIEM/OT monitoring tools.',
            expectedOutput: 'A structured incident analysis with kill chain stage assessment, risk map of threatened OT systems, safe containment recommendations, and evidence preservation checklist.',
            variations: '• Focus only on containment recommendations with safety constraints\n• Analyze for insider threat indicators vs. external attacker patterns\n• Generate a timeline visualization suitable for an incident report',
            tips: 'Include timestamps, source/destination IPs, and alert severity in your event data. The more structured your input, the more precise the analysis.',
            exampleOutput: '**Kill Chain Stage:** Lateral Movement (Stage 5)\n**Attack Vector:** Compromised VPN credentials → RDP to engineering workstation\n**At-Risk OT Systems:** HMI-03 (Painting Line), PLC-07 (Assembly Controller)\n**Safe Containment:** Block RDP from engineering VLAN to OT DMZ at firewall. Do NOT disable HMI-03 — it manages active safety interlocks...',
          },
        },
        {
          fields: {
            prompt: 'Act as a root cause analysis facilitator for a post-incident review. Given the following incident summary, conduct a structured "5 Whys" analysis to identify the root cause. Then provide: (1) the root cause statement, (2) contributing factors, (3) recommended corrective actions with owners and timelines, and (4) metrics to verify the fix is effective.\n\nIncident Summary:\n[PASTE INCIDENT SUMMARY]',
            context: 'Use during the lessons-learned phase of incident response, typically 5-10 business days after incident closure.',
            expectedOutput: 'A 5 Whys chain from symptom to root cause, plus a corrective action plan with SMART objectives.',
            variations: '• Use the Ishikawa (fishbone) method instead of 5 Whys\n• Focus specifically on process failures vs. technical failures\n• Generate the analysis in a format suitable for board presentation',
            tips: 'Provide the incident timeline, who was involved, and what actions were taken. Include both what went wrong and what went right.',
            exampleOutput: '**Why 1:** Ransomware encrypted the HMI server. → **Why 2:** The HMI server was reachable from the corporate network. → **Why 3:** Firewall rules allowed RDP from the engineering VLAN to OT. → **Why 4:** The rule was added as a "temporary" exception 18 months ago. → **Why 5:** No process exists to review and expire temporary firewall exceptions.\n\n**Root Cause:** Absence of a firewall exception lifecycle management process...',
          },
        },
      ],
    },
    {
      name: 'Communication & Writing',
      description: 'Drafting emails, reports, proposals, presentations, and stakeholder communications',
      elements: [
        {
          fields: {
            prompt: 'You are a crisis communications advisor for a manufacturing company. Draft an internal communication to all employees about a cyber incident that has affected [DESCRIBE IMPACT]. The message should: (1) acknowledge the situation without causing panic, (2) explain what is known and unknown, (3) provide clear instructions on what employees should do and avoid, (4) establish the next communication cadence, and (5) reinforce that the situation is being handled. Tone: calm, authoritative, transparent.',
            context: 'Use within the first 2-4 hours of a confirmed incident that affects employees (e.g., email down, production paused, building access affected).',
            expectedOutput: 'A 300-400 word employee communication suitable for email or intranet posting, with clear action items.',
            variations: '• Draft for external customer notification\n• Draft for board/executive briefing\n• Draft for regulatory notification (e.g., state attorney general)',
            tips: 'Specify what you CAN share (timeline of next update, support contact) rather than only what you cannot share. Employees respond better to transparency than silence.',
            exampleOutput: '**Subject: Important Update — IT Systems Disruption**\n\nTeam,\n\nThis morning at approximately 6:15 AM ET, our security team detected unusual activity on our corporate network. As a precaution, we have temporarily taken several systems offline, including corporate email and some production-support applications...',
          },
        },
        {
          fields: {
            prompt: 'Act as a cybersecurity executive advisor. Write a board-ready incident report for a cyber incident at a manufacturing company. Structure the report as: (1) Executive Summary (5 sentences), (2) Incident Timeline, (3) Business Impact (production, financial, regulatory, reputational), (4) Root Cause, (5) Response Actions Taken, (6) Lessons Learned, (7) Recommended Investments. Use the following incident details:\n\n[PASTE INCIDENT DETAILS]',
            context: 'Use when preparing post-incident board reports, typically 2-4 weeks after incident closure when full analysis is available.',
            expectedOutput: 'A 2-3 page executive report with clear sections, quantified impact, and actionable investment recommendations.',
            variations: '• Condense to a 1-page executive summary\n• Expand to include technical appendix for the security committee\n• Frame as a "near miss" report for incidents that were caught early',
            tips: 'Lead with business impact in dollars and production hours, not technical jargon. Boards respond to financial exposure and risk reduction ROI.',
            exampleOutput: '**EXECUTIVE SUMMARY**\nOn [DATE], a ransomware incident disrupted manufacturing operations at our [LOCATION] facility for approximately 72 hours. The attack originated from a phishing email and progressed to OT systems via an unmonitored engineering workstation. Total business impact is estimated at $2.1M...',
          },
        },
      ],
    },
  ],
)

// ============================================================
// 5. Battle Cards
// ============================================================

const battleCardsProduct = seedProduct(
  'battle-cards',
  'battle-cards',
  'Cyber Incident Response Battle Cards',
  'Strategic analysis cards for manufacturing CISOs evaluating their incident response posture — strengths, weaknesses, emerging threats, and strategic responses.',
  [
    {
      name: 'Current Landscape',
      description: 'The state of play today — key players, dominant approaches, and the baseline the reader operates from',
      elements: [
        {
          fields: {
            title: 'Manufacturing Ransomware Threat Landscape',
            strengths: 'Increasing board awareness of cyber risk in manufacturing. Growing ecosystem of OT-specific security vendors (Dragos, Claroty, Nozomi). CISA provides free manufacturing-specific resources and advisories.',
            weaknesses: 'Most manufacturing IR plans are IT-centric and untested against OT scenarios. Legacy OT systems cannot run modern endpoint protection. Chronic shortage of personnel with both cybersecurity and OT expertise.',
            talkingPoints: 'Manufacturing has been the #1 targeted sector for 3 consecutive years. Average ransomware downtime in manufacturing is 12.4 days. 68% of manufacturers lack OT-specific monitoring tools.',
            objectionHandling: '"We have never been attacked" — The average dwell time is 21 days; you may not know you are compromised. "Our OT is air-gapped" — True air gaps are rare; most have at least one undocumented connection.',
            winStrategy: 'Position IR readiness as operational insurance, not IT overhead. Quantify downtime cost per hour to make the ROI case undeniable.',
            pricingIntel: 'Average ransomware demand for mid-size manufacturers: $1.2M–$5M. External IR retainer: $15K–$50K/year. OT monitoring platform: $100K–$300K for a mid-size plant.',
          },
        },
        {
          fields: {
            title: 'Regulatory and Compliance Pressure Points',
            strengths: 'Clear frameworks exist (NIST CSF, IEC 62443, CMMC). Regulatory pressure creates budget justification. Insurance carriers now require IR plans, creating external accountability.',
            weaknesses: 'Overlapping and sometimes conflicting requirements across jurisdictions. Compliance ≠ security — checking boxes does not stop attackers. Audit fatigue reduces the quality of compliance activities over time.',
            talkingPoints: 'NIS2 (EU) now classifies manufacturing as an essential entity with 24-hour initial notification requirements. SEC cyber disclosure rules affect public manufacturers. Cyber insurance applications now require evidence of OT IR planning.',
            objectionHandling: '"Compliance is just paperwork" — Reframe: compliance requirements reflect real threats. Use them as a minimum baseline, then exceed them where business risk warrants it.',
            winStrategy: 'Consolidate compliance activities into a unified security program rather than treating each regulation separately. This reduces cost and increases actual security.',
            pricingIntel: 'NIS2 non-compliance fines: up to €10M or 2% of global turnover. CMMC assessment: $50K–$150K. Cyber insurance premium reduction for documented IR program: 10-25%.',
          },
        },
      ],
    },
    {
      name: 'Strengths & Advantages',
      description: 'What the reader (or their approach) does well — capabilities, differentiators, and leverage points',
      elements: [
        {
          fields: {
            title: 'Manufacturing\'s Unique IR Advantages',
            strengths: 'Physical security infrastructure (cameras, badge access) provides additional forensic evidence. Plant engineers understand their systems deeply — they notice anomalies that IT-trained analysts miss. Safety culture in manufacturing creates a foundation for security awareness.',
            weaknesses: 'These advantages are often underutilized because security and operations teams do not collaborate. Physical security data is rarely integrated with cyber investigations.',
            talkingPoints: 'Your plant engineers are your best anomaly detectors — they know when a PLC is behaving strangely. Leverage your existing safety reporting culture to add cyber incident reporting. Physical access logs can corroborate or rule out insider threats.',
            objectionHandling: '"Security is the security team\'s job" — In manufacturing, security is everyone\'s job, just like safety. Frame it as an extension of the safety culture that already exists.',
            winStrategy: 'Build a "security champion" program on the plant floor, modeled on your existing safety champion program. These are your early warning system.',
            pricingIntel: 'Security champion program cost: minimal ($5K–$10K for training and recognition). Value: dramatically faster anomaly detection and reporting from the plant floor.',
          },
        },
        {
          fields: {
            title: 'Operational Technology Monitoring as a Force Multiplier',
            strengths: 'OT monitoring tools provide deep visibility into industrial protocols (Modbus, EtherNet/IP, PROFINET) that traditional IT tools cannot parse. Baseline behavioral models can detect subtle process anomalies invisible to signature-based detection.',
            weaknesses: 'Requires specialized expertise to deploy and tune. Alert fatigue is common in early deployments. Integration with IT SIEM is often incomplete.',
            talkingPoints: 'OT monitoring detected the Triton/TRISIS attack that bypassed all traditional IT security controls. These tools see process-level changes that indicate compromise before IT systems show any sign.',
            objectionHandling: '"We cannot afford another monitoring platform" — The cost of 1 hour of undetected OT compromise exceeds the annual license cost of most OT monitoring tools.',
            winStrategy: 'Start with passive monitoring (network tap, no agent install) to demonstrate value without any risk to production systems. Expand scope based on findings.',
            pricingIntel: 'OT monitoring platforms: $80K–$250K/year for mid-size plant. Managed OT SOC service: $10K–$25K/month. ROI benchmark: detect incidents 90% faster on average.',
          },
        },
      ],
    },
    {
      name: 'Strategic Response',
      description: 'How to respond — positioning, actions, investments, and narrative to stay ahead',
      elements: [
        {
          fields: {
            title: '12-Month IR Maturity Roadmap for Manufacturing',
            strengths: 'A phased approach avoids disruption, builds organizational buy-in, and demonstrates progress to the board quarterly. Each phase delivers standalone value even if the program stalls.',
            weaknesses: 'Requires sustained executive sponsorship. Progress can stall if a real incident consumes all IR resources before maturity is achieved.',
            talkingPoints: 'Phase 1 (Q1): Foundations — asset inventory, IR plan, team formation, first tabletop. Phase 2 (Q2): Detection — OT monitoring pilot, SIEM integration, alert triage procedures. Phase 3 (Q3): Response — full playbooks, forensic capability, external retainers. Phase 4 (Q4): Optimization — metrics dashboard, purple team exercise, continuous improvement cycle.',
            objectionHandling: '"We do not have budget for a 12-month program" — Phase 1 costs less than $50K and delivers 80% of the risk reduction. Start there and use results to justify further investment.',
            winStrategy: 'Present the roadmap as a quarterly investment thesis with measurable risk reduction at each gate. This aligns with how boards evaluate capital allocation.',
            pricingIntel: 'Phase 1 estimated cost: $30K–$50K (mostly labor and tabletop facilitation). Phase 2: $150K–$300K (OT monitoring tool + integration). Full 12-month program: $400K–$800K for a mid-size manufacturer.',
          },
        },
        {
          fields: {
            title: 'Workforce Strategy: Closing the IT-OT Security Skills Gap',
            strengths: 'Cross-training existing IT security and OT engineering staff is faster and cheaper than hiring unicorn candidates. Partnerships with SANS ICS and ISA/IEC programs provide structured curricula.',
            weaknesses: 'True IT-OT security professionals are extremely scarce (estimated <5,000 globally). Training takes 6-12 months to produce proficiency. Retention is challenging as these skills command premium salaries.',
            talkingPoints: 'You do not need to hire 10 OT security experts. You need 2-3 cross-trained individuals plus a managed service partner. Invest in certifications: GICSP (SANS), ISA/IEC 62443 Cybersecurity Certificate.',
            objectionHandling: '"We will just outsource it" — You need internal expertise to manage the outsourced relationship effectively and to make real-time containment decisions during an OT incident.',
            winStrategy: 'Pair one IT security analyst with one OT engineer for cross-training. Fund GICSP certification for both. Within 12 months, you have two people who speak both languages.',
            pricingIntel: 'GICSP certification: $8,000–$9,500 per person (training + exam). OT security analyst salary: $120K–$180K. Managed OT security service: $120K–$300K/year.',
          },
        },
      ],
    },
  ],
)

// ============================================================
// 6. Decision Book
// ============================================================

const decisionBookProduct = seedProduct(
  'decision-books',
  'decision-books',
  'Incident Response Decision Book',
  'Key decisions manufacturing CISOs face when building and operating an incident response program — with options, trade-offs, and recommended paths.',
  [
    {
      name: 'Strategic Direction',
      description: 'Decisions about vision, positioning, competitive strategy, and long-term direction',
      elements: [
        {
          fields: {
            decision: 'Should you build an in-house IR capability, fully outsource to an MSSP/MDR, or adopt a hybrid model?',
            context: 'This is the foundational decision that shapes your IR program\'s cost structure, response speed, and institutional knowledge retention. For manufacturing, the OT dimension adds complexity that many MSSPs cannot handle.',
            options: 'Option A: Fully in-house — Maximum control and institutional knowledge, but requires 4-6 FTEs and significant tooling investment. Feasible for large enterprises.\n\nOption B: Fully outsourced — Lowest headcount, but response time depends on provider SLA and you risk OT knowledge gaps. Works for SMBs with limited budgets.\n\nOption C: Hybrid — In-house Tier 1/2 for IT with OT cross-training, external retainer for Tier 3 forensics and surge capacity. Balances cost, speed, and expertise.',
            criteria: 'Evaluate against: (1) OT-specific response time requirements (<2 hours for critical production systems), (2) budget available for IR FTEs, (3) organization size and site count, (4) availability of OT security talent in your geography.',
            risks: 'In-house: talent retention risk and single points of failure. Outsourced: provider may lack manufacturing OT experience; contractual SLAs may not meet your actual response time needs. Hybrid: integration complexity between internal and external teams.',
            stakeholders: 'CISO (decision owner), CFO (budget approval), VP Operations (OT impact), CIO (IT integration), Legal (liability and data sharing with third parties), Board Risk Committee (risk appetite).',
            recommendation: 'For most mid-size manufacturers, the hybrid model offers the best risk-adjusted return. Build a core team of 2-3 cross-trained analysts, augment with an OT-experienced IR retainer, and use managed detection for 24/7 coverage.',
          },
        },
        {
          fields: {
            decision: 'How should you position your IR program relative to the broader operational resilience and safety programs?',
            context: 'Manufacturing organizations already have mature safety programs (OSHA, ISO 45001) and business continuity plans. A cyber IR program can either sit independently, integrate into existing resilience structures, or become a sub-function of safety.',
            options: 'Option A: Independent program — Clean ownership, dedicated budget, cyber-specific metrics. But risks being siloed from operational reality.\n\nOption B: Integrated into business continuity — Shared governance, unified exercising, natural alignment with recovery priorities. But may dilute cyber-specific focus.\n\nOption C: Nested under safety — Leverages manufacturing\'s strongest cultural muscle. But may be perceived as a demotion of cyber\'s strategic importance.',
            criteria: 'Evaluate: (1) organizational maturity of existing safety and BCP programs, (2) CISO reporting structure, (3) board risk committee expectations, (4) whether combined exercises would improve or complicate response.',
            risks: 'Independent: IR exists in a silo and recovery priorities conflict with plant operations. Integrated: Cyber competes with natural disasters and supply chain disruptions for attention. Nested under safety: May reduce investment if safety leadership does not understand cyber risk.',
            stakeholders: 'CISO, VP Operations, Chief Safety Officer, BCP Manager, General Counsel, Board Risk Committee.',
            recommendation: 'Pursue integration with business continuity while maintaining a distinct cyber IR plan and budget line. Run joint exercises quarterly, but keep separate playbooks for cyber-specific scenarios. This preserves focus while ensuring alignment.',
          },
        },
      ],
    },
    {
      name: 'Technology & Infrastructure',
      description: 'Decisions about platforms, build-vs-buy, architecture choices, and technical debt',
      elements: [
        {
          fields: {
            decision: 'Should you deploy a dedicated OT security monitoring platform or extend your existing IT SIEM to cover OT environments?',
            context: 'IT SIEMs (Splunk, Sentinel, etc.) are powerful but are designed for IT protocols and data formats. OT environments use industrial protocols (Modbus, EtherNet/IP, PROFINET) that require specialized parsing and baselining.',
            options: 'Option A: Dedicated OT platform (Dragos, Claroty, Nozomi) — Deep industrial protocol visibility, purpose-built anomaly detection, but adds another console and vendor relationship.\n\nOption B: Extend IT SIEM — Unified view and alerting, leverages existing analyst skills, but limited OT protocol parsing and higher tuning effort.\n\nOption C: Both — OT platform feeds enriched alerts into IT SIEM. Best visibility, but highest cost and integration effort.',
            criteria: 'Evaluate: (1) current OT protocol diversity, (2) SOC analyst OT expertise, (3) budget, (4) number of manufacturing sites, (5) regulatory requirements for OT monitoring.',
            risks: 'Dedicated OT: Siloed visibility if not integrated with IT SIEM; analysts must learn another tool. Extended SIEM: Missed detections due to shallow OT parsing; false positives from misunderstood OT traffic. Both: Integration delays, alert duplication, higher total cost.',
            stakeholders: 'CISO, SOC Manager, OT Engineering Lead, CIO, Procurement, Plant IT at each site.',
            recommendation: 'For manufacturing organizations with more than 2 sites: deploy a dedicated OT monitoring platform with SIEM integration (Option C). For single-site SMBs: start with a dedicated OT platform (Option A) and forward critical alerts to your SIEM or managed SOC.',
          },
        },
        {
          fields: {
            decision: 'What level of network segmentation between IT and OT is appropriate, and how aggressively should you pursue it?',
            context: 'The Purdue Model defines clear IT-OT zones, but reality is messier. Many manufacturers have shortcuts, undocumented connections, and vendor remote access that bypass intended segmentation.',
            options: 'Option A: Full Purdue Model implementation — Maximum security, clear zone boundaries, all traffic passes through DMZ firewalls. But disruptive to implement and may break existing integrations.\n\nOption B: Pragmatic segmentation — Segment the most critical OT zones (safety systems, critical production PLCs) while accepting managed risk on less critical connections.\n\nOption C: Micro-segmentation — Deploy software-defined networking within OT zones for granular control. Highest security but highest complexity and cost.',
            criteria: 'Evaluate: (1) current network architecture maturity, (2) number of IT-OT integration points, (3) vendor remote access dependencies, (4) downtime tolerance for network changes, (5) available network engineering resources.',
            risks: 'Full Purdue: Implementation may break production integrations; 12-18 month project for large environments. Pragmatic: Residual risk in unsegmented areas; "pragmatic" can become "perpetually deferred." Micro-segmentation: Complexity explosion; requires OT-aware SDN expertise that is very scarce.',
            stakeholders: 'CISO, Network Architecture team, OT Engineering, Plant Operations, Vendor Management (for remote access changes), CIO.',
            recommendation: 'Start with pragmatic segmentation (Option B): isolate safety systems and the most critical production PLCs behind dedicated firewalls within the first 6 months. Build a roadmap toward full Purdue Model implementation over 18-24 months, prioritized by asset criticality.',
          },
        },
      ],
    },
    {
      name: 'Risk & Trade-offs',
      description: 'Decisions about acceptable risk levels, speed-vs-quality trade-offs, and uncertainty tolerance',
      elements: [
        {
          fields: {
            decision: 'During an active incident, when should you shut down production to contain the threat vs. attempt containment while keeping production running?',
            context: 'This is the hardest real-time decision a manufacturing CISO will face. Shutting down production guarantees containment but causes immediate financial damage. Continuing production risks the threat spreading to safety systems or causing physical damage.',
            options: 'Option A: Immediate production shutdown — Zero risk of threat escalation to OT. But every hour of downtime costs $20K-$250K and the shutdown may be unnecessary if the threat is contained to IT.\n\nOption B: Surgical containment while running — Isolate affected network segments without stopping production. Faster recovery, but risk of missing a persistence mechanism or lateral movement path.\n\nOption C: Pre-defined decision matrix — Define threshold criteria (e.g., any evidence of OT lateral movement = automatic shutdown) and make the decision non-discretionary.',
            criteria: 'Decision must weight: (1) Is there any evidence the threat has reached or is moving toward OT networks? (2) Are safety systems potentially affected? (3) Can you isolate the affected segment without collateral production impact? (4) What is your forensic confidence level?',
            risks: 'Immediate shutdown: Unnecessary if threat is IT-only; restarts of some OT systems are complex and time-consuming. Surgical containment: Attackers may have persistence you have not found; OT damage could occur before you detect the spread. Pre-defined matrix: Edge cases may not fit the matrix; false sense of certainty.',
            stakeholders: 'CISO (recommendation), VP Operations (production impact), Plant Manager (execution), CEO (authority for full shutdown), Legal (liability), Safety Officer (safety system status).',
            recommendation: 'Implement a pre-defined decision matrix (Option C) as your primary framework, with an emergency override requiring CISO + VP Operations joint approval. Default to shutdown if safety system integrity cannot be confirmed within 30 minutes of threat detection in OT-adjacent networks.',
          },
        },
        {
          fields: {
            decision: 'Should you pay a ransomware demand if it is the fastest path to restoring manufacturing operations?',
            context: 'Official guidance (FBI, CISA) is to never pay. But when production is halted, customer orders are backing up, and your backups are encrypted, the pressure to pay is immense. This decision must be made in advance, not during the crisis.',
            options: 'Option A: Never pay — Principled stand, denies revenue to attackers, avoids OFAC sanctions risk. But if backups are compromised, recovery could take weeks.\n\nOption B: Pay as last resort — Pragmatic approach that acknowledges recovery from backups may not be feasible. Engages negotiation specialists, but no guarantee of decryption and may invite repeat attacks.\n\nOption C: Pre-establish decision criteria — Define specific conditions under which payment will be considered (e.g., safety systems affected, all backups confirmed destroyed, recovery estimate >30 days) and pre-authorize the decision chain.',
            criteria: 'Evaluate: (1) backup integrity and restoration time, (2) OFAC sanctions screening of the threat actor, (3) cyber insurance coverage for ransom payments, (4) business impact of extended downtime, (5) legal and ethical considerations.',
            risks: 'Never pay: Potential weeks of downtime; could threaten business viability for SMBs. Pay: No decryption guarantee (estimated 80% success rate); potential OFAC violations; may be targeted again. Pre-established criteria: Framework may not anticipate every scenario; still requires real-time judgment.',
            stakeholders: 'CEO (final authority), CISO, General Counsel, CFO, Board of Directors, Cyber Insurance Carrier, External Legal Counsel (sanctions screening), Law Enforcement liaison.',
            recommendation: 'Adopt Option C: pre-establish decision criteria and authorize the decision chain now, before you need it. Ensure your cyber insurance policy covers ransom payments. Engage a ransomware negotiation firm under retainer. Most importantly, invest in backup resilience so the decision never needs to be made.',
          },
        },
      ],
    },
  ],
)

// ============================================================
// 7. Dossier
// ============================================================

const dossierProduct = seedProduct(
  'dossier',
  'dossier',
  'Cyber Threat Intelligence Dossier',
  'An intelligence briefing for manufacturing CISOs covering the current threat landscape, organizational vulnerabilities, and strategic opportunities in incident response.',
  [
    {
      name: 'Overview & Background',
      description: 'Foundational context — history, origins, mission, and the broader landscape',
      elements: [
        {
          fields: {
            title: 'The State of Cyber Threats to US Manufacturing',
            summary: 'US manufacturing faces an escalating cyber threat environment driven by nation-state actors, ransomware-as-a-service groups, and increasing IT-OT convergence that expands the attack surface. The sector has been the most-targeted globally since 2022.',
            keyFindings: '• Manufacturing accounted for 25.7% of all cyber incidents in 2024, more than any other sector.\n• Average ransomware dwell time in manufacturing: 11 days — longer than financial services (5 days) due to weaker detection capabilities.\n• 72% of manufacturing organizations have experienced at least one OT-impacting cyber event in the past 24 months.\n• Nation-state actors (particularly PRC-linked groups like Volt Typhoon) have pre-positioned in US manufacturing networks for potential future disruption.',
            strategicImplications: 'Manufacturing CISOs can no longer treat cyber as an IT-only concern. The convergence of IT and OT networks means incidents in the corporate environment directly threaten production operations. Pre-positioning by nation-state actors suggests the threat may escalate during geopolitical tension.',
            evidence: 'IBM X-Force Threat Intelligence Index 2024: Manufacturing most-attacked sector for 3rd consecutive year. CISA Advisory AA24-038A: Volt Typhoon compromise of US critical infrastructure. Dragos OT Cybersecurity Year in Review 2024: 72% OT impact statistic.',
            riskAssessment: 'HIGH — The combination of high attack frequency, long dwell times, weak OT visibility, and nation-state pre-positioning creates a threat level that exceeds most manufacturers\' current IR capabilities.',
            opportunities: 'Organizations that build OT-aware IR capabilities now will be significantly ahead of peers. This creates competitive advantage in winning defense contracts (CMMC), reducing insurance premiums, and maintaining customer trust.',
          },
        },
        {
          fields: {
            title: 'Manufacturing\'s IT-OT Convergence: Attack Surface Expansion',
            summary: 'The push toward Industry 4.0, smart manufacturing, and digital twins has connected previously isolated operational technology systems to corporate networks and the internet. This convergence creates new attack pathways that legacy security architectures were not designed to handle.',
            keyFindings: '• 88% of manufacturers report some level of IT-OT network connectivity.\n• Only 31% have formal policies governing IT-OT data exchange.\n• Cloud-connected OT (IIoT sensors, remote monitoring) grew 45% in 2023-2024.\n• The average manufacturing plant has 3.7 undocumented IT-OT connection points.',
            strategicImplications: 'Every new IT-OT connection is a potential incident response complication. IR plans must account for shared network paths, and containment procedures must avoid severing connections that safety systems depend on.',
            evidence: 'Fortinet 2024 State of OT Security Report: 88% connectivity figure. SANS ICS/OT Survey 2024: 31% policy figure. Palo Alto Unit 42 OT Threat Report: undocumented connections finding.',
            riskAssessment: 'MEDIUM-HIGH — Connectivity is increasing faster than security controls are being applied. The gap between connectedness and protection is widening at most manufacturers.',
            opportunities: 'Organizations that invest in IT-OT segmentation and monitoring now benefit disproportionately because the baseline is so low across the sector.',
          },
        },
      ],
    },
    {
      name: 'Strengths & Vulnerabilities',
      description: 'Core competencies, competitive advantages, known weaknesses, and areas of exposure',
      elements: [
        {
          fields: {
            title: 'Manufacturing CISO: Organizational Security Strengths',
            summary: 'Manufacturing organizations bring several underappreciated strengths to cybersecurity: a mature safety culture, deep operational knowledge, physical security infrastructure, and increasing board attention to cyber risk post-Colonial Pipeline.',
            keyFindings: '• 94% of manufacturers have a formal safety program — this cultural muscle can be extended to cybersecurity.\n• Plant engineers provide domain expertise that no external SOC analyst can replicate for OT anomaly detection.\n• Physical access controls (badge readers, cameras) provide corroborating evidence during insider threat investigations.\n• Board-level cyber risk discussions increased 300% in manufacturing since 2021.',
            strategicImplications: 'The CISO should position cybersecurity as an extension of existing safety and operational excellence programs rather than a standalone IT initiative. This alignment accelerates adoption and budget allocation.',
            evidence: 'NSC Safety Culture Survey 2024. Gartner Board of Directors Survey 2024: board cyber engagement increase. Internal observation: physical security integration potential.',
            riskAssessment: 'These strengths are available but underutilized in most organizations. The risk is not having them but failing to leverage them.',
            opportunities: 'Integrate cyber reporting into the existing safety reporting framework. Train plant engineers as "cyber safety champions." Use physical access logs in IR investigations.',
          },
        },
        {
          fields: {
            title: 'Critical Vulnerability Assessment: OT Security Gaps',
            summary: 'Despite growing awareness, most manufacturing organizations have significant gaps in OT security controls, incident response capabilities, and workforce readiness that leave them vulnerable to attacks targeting production systems.',
            keyFindings: '• 65% of manufacturing OT environments run at least one end-of-life operating system (Windows XP, Windows 7).\n• Only 23% of manufacturers have IR playbooks specific to OT scenarios.\n• Mean time to detect an OT compromise: 21 days (vs. 7 days for IT-only incidents).\n• 80% of manufacturers lack personnel with both cybersecurity and OT/ICS expertise.',
            strategicImplications: 'The detection and response gap in OT environments is the single largest exposure area. Attackers have a 3-week window of undetected access — ample time to understand the production process and position for maximum impact.',
            evidence: 'Dragos OT Cybersecurity Year in Review 2024. SANS ICS/OT Workforce Survey 2024: 80% skills gap figure. Mandiant M-Trends 2024: dwell time comparison.',
            riskAssessment: 'CRITICAL — The combination of legacy systems, absent OT-specific IR playbooks, long detection times, and workforce gaps creates a vulnerability chain that sophisticated attackers are actively exploiting.',
            opportunities: 'Any investment in OT-specific IR capability (monitoring, playbooks, cross-training) delivers outsized risk reduction because the current baseline is so low.',
          },
        },
      ],
    },
    {
      name: 'Risks & Threats',
      description: 'External threats, internal risks, market disruptions, and destabilizing scenarios',
      elements: [
        {
          fields: {
            title: 'Ransomware-as-a-Service: The Industrialized Threat',
            summary: 'Ransomware groups have industrialized their operations with affiliate programs, initial access brokers, and double/triple extortion models specifically calibrated for manufacturing\'s low downtime tolerance.',
            keyFindings: '• LockBit, BlackCat/ALPHV, and Cl0p remain the most active groups targeting manufacturing.\n• Initial access is increasingly purchased from brokers rather than obtained through direct attack — average price for manufacturing VPN credentials: $1,500-$5,000.\n• Double extortion (encrypt + exfiltrate) is now standard; triple extortion adds DDoS or customer notification threats.\n• Median ransom demand for manufacturers: $2.5M. Median payment: $1.1M.',
            strategicImplications: 'The industrialization of ransomware means any manufacturer is a potential target, not just large enterprises. SMBs are increasingly targeted because their defenses are weaker and they are more likely to pay.',
            evidence: 'Coveware Quarterly Ransomware Report Q4 2024. Group-IB Hi-Tech Crime Trends 2024: IAB pricing. Sophos State of Ransomware in Manufacturing 2024.',
            riskAssessment: 'CRITICAL — Ransomware is the most likely and most impactful cyber threat facing manufacturing today. The probability of a mid-size manufacturer experiencing a ransomware incident within 24 months is estimated at 25-35%.',
            opportunities: 'Manufacturers that can demonstrate ransomware resilience (tested backups, segmented OT, practiced IR) will attract lower insurance premiums, win risk-sensitive contracts, and recover faster than competitors.',
          },
        },
        {
          fields: {
            title: 'Nation-State Pre-Positioning in Manufacturing Infrastructure',
            summary: 'PRC-linked threat groups (Volt Typhoon, Salt Typhoon) have been discovered pre-positioned in US critical infrastructure including manufacturing, with the assessed intent of enabling disruptive operations during a potential geopolitical conflict.',
            keyFindings: '• CISA and FBI confirmed Volt Typhoon compromised critical infrastructure entities across water, energy, communications, and manufacturing.\n• Tactics focus on "living off the land" — using legitimate tools to avoid detection, making traditional signature-based detection ineffective.\n• Pre-positioned access may remain dormant for months or years before activation.\n• Manufacturing supply chains to defense and aerospace are high-priority targets.',
            strategicImplications: 'This threat changes the IR calculus: you may already be compromised and not know it. IR readiness must include threat hunting for living-off-the-land techniques, not just reactive incident response. Defense supply chain manufacturers face elevated risk.',
            evidence: 'CISA Advisory AA24-038A: PRC State-Sponsored Actors Compromise US Critical Infrastructure. FBI Director Wray Congressional Testimony, January 2024. NSA Cybersecurity Advisory on Volt Typhoon TTPs.',
            riskAssessment: 'HIGH — While the probability of activation may be tied to geopolitical events, the presence of pre-positioned access represents a latent risk that could be triggered at any time.',
            opportunities: 'Proactive threat hunting exercises focused on living-off-the-land techniques can uncover pre-positioned access. Demonstrating this capability strengthens CMMC posture and may be required for future defense contracts.',
          },
        },
      ],
    },
  ],
)

// ============================================================
// 8. Playbook
// ============================================================

const playbookProduct = seedProduct(
  'playbook',
  'playbook',
  'Incident Response Playbook',
  'Step-by-step operational execution guides for manufacturing CISOs — from preparation and detection through containment, eradication, and recovery.',
  [
    {
      name: 'Preparation & Prerequisites',
      description: 'Everything needed before starting — inputs, approvals, resources, and readiness checks',
      elements: [
        {
          fields: {
            title: 'IR Team Formation and Role Assignment',
            objective: 'Establish a cross-functional incident response team with clear roles, responsibilities, and authority levels covering both IT and OT environments.',
            instructions: '1. Identify core IR team members: IR Lead (CISO or delegate), SOC Analyst, OT Security Engineer, Network Engineer, Plant Operations Representative, Legal Counsel, Communications Lead.\n2. Document each role\'s responsibilities during each IR phase (Detection, Containment, Eradication, Recovery).\n3. Assign backup personnel for each role (minimum 2-deep for critical roles).\n4. Create an IR contact card with primary and backup contacts, including personal cell phones and out-of-band messaging handles.\n5. Distribute contact cards physically and digitally. Store a copy in the IR go-bag at each manufacturing site.\n6. Conduct an initial 30-minute role-briefing session with each team member.',
            decisionCriteria: 'The team is ready when: all roles have primary and backup assignees, every team member has acknowledged their role in writing, and contact cards have been verified through a test communication drill.',
            expectedOutcome: 'A fully staffed IR team with clear role definitions, verified contact information, and documented escalation authority. Each member understands their specific responsibilities for IT-only and OT-impacting incidents.',
            commonPitfalls: 'Excluding plant operations from the IR team. Assigning roles without verifying personnel availability during off-hours. Failing to account for vacation and travel schedules. Not testing contact information.',
            tips: 'Include the Plant Manager or a delegate — they control physical access and can authorize production shutdowns. Ensure at least one team member has OT protocol knowledge (Modbus, EtherNet/IP).',
            timeEstimate: '2-3 weeks for initial formation; ongoing quarterly verification',
          },
        },
        {
          fields: {
            title: 'IR Toolkit and Go-Bag Preparation',
            objective: 'Assemble and pre-stage incident response toolkits at each manufacturing site to enable rapid forensic collection and containment without depending on corporate network availability.',
            instructions: '1. Procure toolkit components: forensic laptop (pre-loaded with tools), write blockers, USB boot drives (Linux live environment), portable hard drives, network tap, spare Ethernet cables, evidence bags and chain-of-custody forms, printed IR procedures and contact cards.\n2. Load forensic laptop with: Velociraptor, FTK Imager, Wireshark, PLC backup tools relevant to your environment.\n3. Package toolkit in a sealed, tamper-evident bag with contents checklist.\n4. Store at a secure, physically accessible location at each primary manufacturing site (not in the server room — it may be inaccessible during an incident).\n5. Assign a toolkit custodian at each site responsible for quarterly integrity checks.\n6. Document location and access procedures in the IR plan.',
            decisionCriteria: 'Toolkit is deployment-ready when: all components are verified present and functional, forensic laptop boots successfully, tools are updated to current versions, and the custodian has confirmed location access.',
            expectedOutcome: 'Pre-staged, verified forensic toolkits at every primary manufacturing site, enabling evidence collection to begin within 30 minutes of IR team arrival on-site.',
            commonPitfalls: 'Storing the go-bag in the server room that may be locked down during an incident. Using consumer-grade drives that fail under stress. Not updating forensic tools after initial setup. Forgetting chain-of-custody forms.',
            tips: 'Include a laminated one-page quick-start guide in each go-bag. Run a quarterly "bag check" drill where the custodian verifies all contents and updates tools.',
            timeEstimate: '1-2 weeks to procure and assemble; quarterly maintenance',
          },
        },
      ],
    },
    {
      name: 'Core Execution',
      description: 'The primary work — step-by-step instructions for the main activities and deliverables',
      elements: [
        {
          fields: {
            title: 'Ransomware Containment: IT-OT Dual-Track Procedure',
            objective: 'Contain a ransomware outbreak that has been detected in the IT environment before it can spread to OT systems, while maintaining safety system integrity and minimizing production disruption.',
            instructions: '1. IMMEDIATE (0-15 min): IR Lead activates the IR team via out-of-band communication. Confirm the scope: which IT systems are affected? Any indicators of OT lateral movement?\n2. IT CONTAINMENT (15-30 min): SOC isolates affected IT endpoints (EDR quarantine or network block). Block known C2 IPs/domains at the perimeter firewall. Disable compromised accounts.\n3. OT ASSESSMENT (15-45 min): OT Engineer verifies IT-OT DMZ firewall is intact. Check OT monitoring platform for anomalous traffic. Verify safety system integrity. Report status to IR Lead.\n4. DECISION POINT: If OT is clean — maintain IT containment and proceed to IT eradication. If OT shows indicators — escalate to OT Containment Procedure (separate playbook).\n5. EVIDENCE PRESERVATION (concurrent): Begin forensic image capture of earliest-compromised IT system. Preserve firewall logs, SIEM data, and email gateway logs for the 72-hour window around initial compromise.\n6. COMMUNICATION: IR Lead briefs CISO. CISO briefs CEO if production impact exceeds 4 hours or if data exfiltration is confirmed.',
            decisionCriteria: 'Escalate to OT Containment if: (1) any OT monitoring alert fires, (2) DMZ firewall logs show unexpected IT→OT traffic, (3) compromise scope includes engineering workstations with OT network access, or (4) the affected malware variant is known to target ICS/SCADA.',
            expectedOutcome: 'Ransomware contained to IT environment. OT systems verified clean. Evidence preserved for forensic analysis. Decision chain documented. Total containment time target: <60 minutes for IT, <90 minutes for OT assessment.',
            commonPitfalls: 'Isolating systems before capturing volatile memory. Assuming OT is safe without verification. Communicating over compromised corporate channels. Rushing to rebuild without understanding the full scope.',
            tips: 'Have the OT Engineer physically verify safety system status if remote monitoring is unavailable. Never assume the DMZ is intact — verify with live traffic analysis.',
            timeEstimate: '1-3 hours for initial containment; 24-72 hours for full scope assessment',
          },
        },
        {
          fields: {
            title: 'Post-Incident Evidence Collection and Chain of Custody',
            objective: 'Collect, document, and preserve digital evidence from both IT and OT environments in a forensically sound manner that supports internal investigation, insurance claims, regulatory compliance, and potential law enforcement involvement.',
            instructions: '1. Deploy the IR go-bag to the affected site. Assign an Evidence Custodian.\n2. IT Evidence Collection: Full disk image of initial compromised system(s) using write blocker. Memory capture of running systems before shutdown. SIEM and firewall log export for T-7 days. Email gateway logs. VPN access logs.\n3. OT Evidence Collection: OT historian data export for T-7 days. Network capture from OT monitoring platform. PLC program comparison (current vs. known-good backup). HMI screenshot capture. Badge access logs for OT areas.\n4. For each evidence item: Record date/time, source, collector name, hash (SHA-256), and storage location on the chain-of-custody form.\n5. Store evidence on encrypted, dedicated media — never on production systems.\n6. Transfer custody to external forensics firm or legal hold as directed by General Counsel.',
            decisionCriteria: 'Evidence collection is complete when: all priority-1 sources (initial compromise system, SIEM, firewall, OT historian) are captured and hashed, chain-of-custody forms are signed, and General Counsel has confirmed the legal hold scope.',
            expectedOutcome: 'A forensically sound evidence package with documented chain of custody, ready for analysis by internal or external investigators and admissible for insurance claims or legal proceedings.',
            commonPitfalls: 'Reimaging compromised machines before forensic capture. Not capturing OT historian data (it is often overlooked but contains critical timeline information). Breaking chain of custody by transferring evidence without documentation.',
            tips: 'Always capture volatile data (memory, running processes) before powering down systems. PLC program comparison is invaluable — if an attacker modified ladder logic, this is how you find it.',
            timeEstimate: '24-72 hours for initial collection; 1-2 weeks for complete preservation',
          },
        },
      ],
    },
    {
      name: 'Exception Handling',
      description: 'When things go wrong — troubleshooting guides, fallback procedures, and recovery playbooks',
      elements: [
        {
          fields: {
            title: 'Scenario: Ransomware Reaches OT / Safety Systems',
            objective: 'Execute emergency containment when ransomware or destructive malware has breached the IT-OT boundary and is actively affecting operational technology systems, with potential safety implications.',
            instructions: '1. EMERGENCY ESCALATION (0-5 min): IR Lead declares OT compromise. Notify CISO, VP Operations, Plant Manager, and Safety Officer immediately. Activate crisis management team.\n2. SAFETY FIRST (0-10 min): Safety Officer assesses safety system (SIS) integrity. If SIS integrity is uncertain, initiate controlled production shutdown per plant safety procedures — this is non-negotiable.\n3. NETWORK ISOLATION (5-20 min): Network Engineer physically disconnects IT-OT DMZ connections. OT Engineer isolates affected OT zones using managed switches or physical cable pulls. Document every disconnection.\n4. OT TRIAGE (20-60 min): Identify which OT systems are affected (HMIs, PLCs, historians). Verify safety system status via direct hardware indicators (panel lights, analog gauges).\n5. EXTERNAL SUPPORT (concurrent): Activate external IR retainer with OT/ICS specialization. Engage OT vendor emergency support lines for affected control systems.\n6. RECOVERY PLANNING: Once containment is confirmed, assess restoration path: known-good PLC backups, clean HMI images, historian data recovery.',
            decisionCriteria: 'Trigger controlled shutdown if: (1) SIS integrity cannot be confirmed, (2) PLC programs may have been modified, (3) HMIs display unexpected commands or values, or (4) OT monitoring shows anomalous process control traffic.',
            expectedOutcome: 'Production safely halted if necessary. OT systems isolated from further compromise. Safety systems verified. External OT forensics team engaged. Recovery plan initiated.',
            commonPitfalls: 'Attempting to contain OT compromise without involving plant operations leadership. Restarting production before PLC programs are verified against known-good backups. Assuming the attacker\'s reach is limited to the first system detected.',
            tips: 'When in doubt, shut down. The cost of an unnecessary shutdown is always less than the cost of a safety incident. Verify PLC programs character-by-character against offline backups before restart.',
            timeEstimate: '2-8 hours for emergency containment; 3-14 days for verified recovery',
          },
        },
        {
          fields: {
            title: 'Scenario: IR During Active Production With No Maintenance Window',
            objective: 'Conduct incident response activities in an environment where production cannot be stopped and no maintenance window is available — requiring non-disruptive investigation and containment techniques.',
            instructions: '1. CONSTRAINT ACKNOWLEDGMENT: Document that production continuity is the constraint. Get VP Operations sign-off on acceptable risk level.\n2. PASSIVE INVESTIGATION: Use OT monitoring platform in passive mode only — no active scanning of OT devices. Analyze existing network captures and log data.\n3. NON-DISRUPTIVE CONTAINMENT: Apply firewall rules to restrict (not block) suspicious traffic flows. Increase monitoring sensitivity on suspected systems. Deploy honeypots in OT-adjacent network segments.\n4. PARALLEL PREPARATION: While production runs, prepare containment packages that can be deployed during the next available maintenance window. Stage PLC backup verification for offline comparison.\n5. COMMUNICATION: Brief plant operations every 4 hours on risk posture. Clearly communicate what will be done during the next maintenance window.\n6. MAINTENANCE WINDOW EXECUTION: When the window arrives, execute pre-planned containment: isolate affected segments, swap compromised endpoints, verify PLC integrity, restore clean HMI images.',
            decisionCriteria: 'Override the no-shutdown constraint and force containment if: safety system compromise is suspected, evidence of active PLC program modification is detected, or an active data exfiltration to an external C2 server is confirmed.',
            expectedOutcome: 'Threat investigated and characterized without production disruption. Pre-planned containment executed during the next maintenance window. Risk accepted and documented for the gap period.',
            commonPitfalls: 'Active scanning of OT devices during production (can crash PLCs). Deploying untested firewall rules that block legitimate OT traffic. Letting the "no maintenance window" constraint extend indefinitely without a deadline.',
            tips: 'Passive network monitoring is your best friend here. Set a hard deadline: if no maintenance window is available within 48 hours, escalate to VP Operations for an emergency window.',
            timeEstimate: 'Investigation: 24-48 hours. Containment execution: 2-8 hours during maintenance window.',
          },
        },
      ],
    },
  ],
)

// ============================================================
// 9. Cheat Sheet
// ============================================================

const cheatSheetProduct = seedProduct(
  'cheat-sheets',
  'cheat-sheets',
  'Incident Response Quick Reference',
  'A concise quick-reference guide for manufacturing CISOs covering essential IR terminology, do\'s and don\'ts, and common mistakes.',
  [
    {
      name: 'Key Terminology & Definitions',
      description: 'Essential vocabulary, acronyms, and domain-specific terms',
      elements: [
        {
          fields: {
            term: 'Indicators of Compromise (IOC)',
            definition: 'Observable artifacts — such as IP addresses, domain names, file hashes, or registry key changes — that indicate a system has been compromised. In manufacturing, OT-specific IOCs include unexpected PLC program changes, anomalous process variable deviations, and unauthorized firmware updates.',
            example: 'IT IOC: Outbound connection to known C2 IP 185.x.x.x. OT IOC: PLC program checksum mismatch detected by OT monitoring platform — current hash differs from last verified backup.',
            relatedConcepts: 'Indicators of Attack (IOA), YARA rules, STIX/TAXII',
            commonMistakes: 'Treating IOCs as static lists instead of perishable intelligence. Ignoring OT-specific IOCs because they are not in traditional threat feeds. Searching only for known IOCs and missing novel indicators.',
            quickTip: 'Subscribe to OT-specific threat feeds (Dragos WorldView, CISA ICS-CERT) in addition to IT feeds.',
          },
        },
        {
          fields: {
            term: 'Purdue Model / Purdue Enterprise Reference Architecture',
            definition: 'A reference model that defines six levels of network segmentation in manufacturing environments, from Level 0 (physical process — sensors, actuators) through Level 5 (enterprise network — email, ERP). Used as the foundation for IT-OT network segmentation and IR zone-based containment strategies.',
            example: 'During containment, you might isolate Level 3 (site operations) from Level 4 (business planning/ERP) by shutting down the DMZ firewall between them, while keeping Levels 0-2 (the actual production process) running under local control.',
            relatedConcepts: 'IEC 62443 zones and conduits, ISA-95, DMZ architecture',
            commonMistakes: 'Assuming Purdue Model levels map cleanly to physical network segments — in practice, many manufacturers have shortcuts that span multiple levels. Not accounting for cloud-connected IIoT devices that bypass the model entirely.',
            quickTip: 'Draw YOUR Purdue Model diagram — not the textbook version. Document every actual connection between levels, including vendor VPNs and cloud gateways.',
          },
        },
      ],
    },
    {
      name: "Do's & Don'ts",
      description: 'Best practices to follow and anti-patterns to avoid',
      elements: [
        {
          fields: {
            term: 'DO: Verify safety system integrity before any containment action on OT systems',
            definition: 'Before isolating, shutting down, or modifying any system in the OT environment, confirm that Safety Instrumented Systems (SIS) are functioning correctly and will maintain safe process states. Safety systems are the last line of defense against physical harm.',
            example: 'Before pulling the network cable on an HMI that may be compromised, have the plant operator verify that the associated safety controllers are in run mode and that all safety interlocks are active via local panel indicators — not through the potentially compromised network.',
            relatedConcepts: 'Safety Instrumented Systems (SIS), safety integrity level (SIL), interlock verification',
            commonMistakes: 'Trusting software-based safety status displayed on a potentially compromised HMI. Assuming that isolating the HMI will not affect the safety controller (they may share a network).',
            quickTip: 'Safety status must be verified through an independent channel — physical panel lights, analog gauges, or a separate safety controller interface.',
          },
        },
        {
          fields: {
            term: "DON'T: Active-scan OT devices during production",
            definition: 'Never run vulnerability scanners, port scanners, or aggressive network discovery tools against live OT devices during production. Many PLCs, RTUs, and legacy HMIs will crash, reboot, or enter fault mode when they receive unexpected network traffic — potentially causing production disruption or safety hazards.',
            example: 'A Nessus scan of an OT subnet crashed 3 Allen-Bradley ControlLogix PLCs during production at a food manufacturer in 2023, halting a production line for 6 hours. The scan was initiated by an IT security team that did not understand OT fragility.',
            relatedConcepts: 'Passive monitoring, network tap, OT asset discovery',
            commonMistakes: 'Running IT vulnerability scans that accidentally sweep OT subnets. Using active discovery protocols (WMI, SNMP walks with write access) against OT devices. Scheduling "routine" scans without checking the OT team\'s production calendar.',
            quickTip: 'Use ONLY passive monitoring for OT asset discovery during production. Active scanning is for maintenance windows only, and only with OT engineering approval and oversight.',
          },
        },
      ],
    },
    {
      name: 'Common Mistakes & Fixes',
      description: 'Frequent errors, root causes, diagnostic steps, and proven solutions',
      elements: [
        {
          fields: {
            term: 'Mistake: Treating OT incident response the same as IT incident response',
            definition: 'Applying IT IR playbooks directly to OT environments leads to dangerous actions: aggressive containment that disrupts safety systems, scanning that crashes PLCs, and recovery approaches that do not account for production restart sequences.',
            example: 'An IT team contained a suspected OT breach by blocking all traffic at the OT firewall — including traffic to the safety controllers. The safety system lost communication and triggered an emergency shutdown of a chemical process, costing $800K in lost product and restart time.',
            relatedConcepts: 'IT-OT convergence, Purdue Model, defense-in-depth for OT',
            commonMistakes: 'Using the same containment procedures for IT and OT without adaptation. Not involving OT engineers in IR planning. Assuming "isolate and reimage" works for PLCs (it does not — they require program reload and commissioning).',
            quickTip: 'Create separate playbook appendices for OT scenarios. Every OT containment action must be reviewed by an OT engineer before execution.',
          },
        },
        {
          fields: {
            term: 'Mistake: No tested backups of PLC programs and OT configurations',
            definition: 'Many manufacturers have never backed up their PLC programs, HMI configurations, or historian databases — or have backups so old they are useless. After a destructive attack, rebuilding PLC programs from scratch can take weeks or months.',
            example: 'A steel manufacturer hit by ransomware discovered their PLC backups were 4 years old and did not reflect hundreds of production changes. Recovery required an OT integrator to reverse-engineer and reprogram 47 PLCs over 6 weeks at a cost of $2.3M.',
            relatedConcepts: 'Configuration management, version control for OT, golden image, disaster recovery',
            commonMistakes: 'Backing up PLC programs to network shares that are reachable by ransomware. Never testing restoration of OT backups. Relying on the OT integrator who installed the system to have copies (they may not).',
            quickTip: 'Schedule quarterly PLC backup verification: export current programs, compare hashes to stored backups, and test restoration to a lab PLC. Store backups on air-gapped media.',
          },
        },
      ],
    },
  ],
)

// ============================================================
// 10. Agent Book
// ============================================================

const agentBookProduct = seedProduct(
  'agent-book',
  'agent-book',
  'Incident Response AI Agent Book',
  'AI agent ideas for manufacturing CISOs to automate and accelerate incident response workflows — from threat intelligence gathering to automated containment.',
  [
    {
      name: 'Research & Intelligence Gathering',
      description: 'Agents that find, synthesize, and surface relevant information for better decisions',
      elements: [
        {
          fields: {
            agentName: 'Manufacturing Threat Intelligence Synthesizer',
            description: 'Continuously monitors threat feeds (CISA ICS-CERT, Dragos, vendor advisories, dark web forums) and synthesizes actionable intelligence specific to your manufacturing sub-sector, OT vendors, and technology stack.',
            howItWorks: '1. Ingests threat data from configured feeds (STIX/TAXII, RSS, API).\n2. Filters for relevance: matches against your asset inventory (OT vendor names, firmware versions, protocols in use).\n3. Enriches with context: maps threats to your Purdue Model zones and existing controls.\n4. Generates a daily briefing ranked by relevance and urgency.\n5. Pushes critical alerts immediately via Slack/Teams and email.',
            keyCapabilities: 'Multi-source threat feed aggregation, asset-inventory-aware filtering, relevance scoring based on your specific OT environment, automated daily briefing generation, critical alert push notification.',
            dataAndTools: 'Threat intelligence feeds (CISA ICS-CERT, Dragos WorldView, vendor advisories), asset inventory database, OT monitoring platform API, Slack/Teams webhook, LLM for summarization and context enrichment.',
            complexity: 'Medium',
            expectedImpact: 'Reduces threat intelligence processing from 4-6 hours/week of analyst time to 15 minutes of briefing review. Eliminates missed advisories relevant to your environment. Faster patch prioritization.',
            quickStart: 'Start with CISA ICS-CERT RSS feed + your OT asset list in a spreadsheet. Build a simple matching agent that flags advisories mentioning your vendors. Iterate from there.',
          },
        },
        {
          fields: {
            agentName: 'Regulatory Change Tracker for Manufacturing Cyber',
            description: 'Monitors evolving cyber regulations, standards, and compliance requirements across all jurisdictions where you operate and alerts when changes affect your incident response obligations.',
            howItWorks: '1. Monitors regulatory sources: Federal Register, EU Official Journal, state legislature websites, NIST publications, IEC standards updates.\n2. Analyzes changes for IR-specific implications: notification timelines, reporting requirements, mandatory controls.\n3. Compares against your current compliance posture (maintained in a structured profile).\n4. Generates gap alerts with specific action items and deadlines.\n5. Produces quarterly compliance posture reports.',
            keyCapabilities: 'Multi-jurisdictional regulatory monitoring, IR-specific change detection, gap analysis against current posture, deadline tracking, quarterly reporting.',
            dataAndTools: 'Regulatory data sources (Federal Register API, EUR-Lex), compliance posture profile (JSON), calendar/task management API for deadline tracking, LLM for regulatory text analysis.',
            complexity: 'Medium-High',
            expectedImpact: 'Eliminates the risk of missed regulatory changes affecting IR obligations. Reduces legal research time by 80%. Ensures notification procedures stay current across all jurisdictions.',
            quickStart: 'Begin with CISA advisories and your state breach notification laws. Create a simple profile of your current obligations and set up alerts for changes to those specific regulations.',
          },
        },
      ],
    },
    {
      name: 'Monitoring & Alerts',
      description: 'Agents that watch for signals and triggers and notify proactively',
      elements: [
        {
          fields: {
            agentName: 'OT Anomaly Correlation Agent',
            description: 'Correlates alerts from OT monitoring platforms, IT SIEM, and physical security systems to identify incidents that span IT-OT boundaries — detecting patterns that no single tool can see in isolation.',
            howItWorks: '1. Ingests alerts from: OT monitoring platform (Dragos/Claroty), IT SIEM (Splunk/Sentinel), physical access control system, VPN logs.\n2. Runs correlation rules: e.g., "VPN login from unusual location" + "OT monitoring anomaly on connected subnet" within 30-minute window.\n3. Scores correlated event clusters by severity, factoring in asset criticality and Purdue Model zone.\n4. Generates enriched incident tickets with full cross-domain context.\n5. Escalates critical correlations directly to the IR Lead via out-of-band channel.',
            keyCapabilities: 'Cross-domain alert correlation (IT + OT + physical), temporal pattern matching, asset-criticality-weighted scoring, automated incident ticket creation, out-of-band escalation.',
            dataAndTools: 'OT monitoring platform API, SIEM API, physical access control API, VPN log source, ticketing system API (ServiceNow/Jira), out-of-band messaging webhook.',
            complexity: 'High',
            expectedImpact: 'Detects IT-OT boundary breaches 10x faster than manual correlation. Reduces false positives by requiring multi-source confirmation. Provides responders with full context from the first alert.',
            quickStart: 'Start with 3-5 high-confidence correlation rules (e.g., failed VPN auth + OT alert within 1 hour). Use a simple script to query both SIEM and OT platform APIs. Expand rules based on findings.',
          },
        },
        {
          fields: {
            agentName: 'IR Readiness Decay Monitor',
            description: 'Continuously monitors the health and readiness of your incident response program — tracking whether playbooks are current, contact information is valid, tools are updated, and exercises are on schedule.',
            howItWorks: '1. Maintains a readiness checklist with expected update frequencies (e.g., contact cards: monthly, playbooks: quarterly, tabletop exercises: quarterly, go-bag inspection: quarterly).\n2. Checks status via automated queries: contact info validation (email bounce test), tool version checks, document last-modified dates.\n3. Calculates an IR Readiness Score (0-100) updated weekly.\n4. Sends decay alerts when items fall behind schedule.\n5. Generates a monthly readiness report for the CISO.',
            keyCapabilities: 'Automated readiness metric calculation, schedule compliance tracking, contact information validation, tool version monitoring, decay alerting, trend reporting.',
            dataAndTools: 'Document management system API (SharePoint/Confluence), email validation service, asset/tool inventory, calendar API for exercise scheduling, reporting dashboard.',
            complexity: 'Low-Medium',
            expectedImpact: 'Prevents the silent decay of IR readiness that occurs between incidents. Ensures the program is always audit-ready. Provides the CISO with a single metric to report to the board.',
            quickStart: 'Create a spreadsheet with your top 20 IR readiness items and their expected refresh dates. Set up calendar reminders. Automate one item at a time, starting with contact validation.',
          },
        },
      ],
    },
    {
      name: 'Process Automation & Workflows',
      description: 'Agents that orchestrate multi-step processes end-to-end',
      elements: [
        {
          fields: {
            agentName: 'Automated Incident Triage and Enrichment Agent',
            description: 'Automatically triages incoming security alerts, enriches them with asset context and threat intelligence, assigns severity based on your manufacturing-specific criteria, and routes to the appropriate responder.',
            howItWorks: '1. Receives alerts from SIEM, EDR, OT monitoring, and email gateway.\n2. Deduplicates and clusters related alerts into candidate incidents.\n3. Enriches each candidate: looks up affected asset in inventory (IT/OT classification, criticality tier, Purdue level), checks IOCs against threat intel feeds, checks if the asset has known vulnerabilities.\n4. Applies severity classification using your manufacturing-specific matrix (safety > environmental > production > data).\n5. Creates an incident ticket with all enrichment data pre-populated.\n6. Routes to the correct responder based on severity and IT/OT classification.',
            keyCapabilities: 'Multi-source alert ingestion, deduplication and clustering, asset-context enrichment, threat intelligence lookup, manufacturing-severity classification, automated ticket creation and routing.',
            dataAndTools: 'SIEM API, EDR API, OT monitoring API, asset inventory database, threat intelligence feeds, ticketing system API, severity classification matrix (configured rules).',
            complexity: 'Medium-High',
            expectedImpact: 'Reduces alert triage time from 15-30 minutes per alert to under 2 minutes. Ensures every alert is enriched with OT context before a human sees it. Eliminates misrouted incidents.',
            quickStart: 'Start with your highest-volume alert source (likely EDR). Build an enrichment pipeline that adds asset inventory data to each alert. Expand sources and enrichment steps iteratively.',
          },
        },
        {
          fields: {
            agentName: 'Post-Incident Reporting Automation Agent',
            description: 'Automatically assembles post-incident reports by collecting data from SIEM, ticketing system, communication logs, and forensic notes — producing draft reports for internal review, regulatory filing, and board presentation.',
            howItWorks: '1. Triggered when an incident ticket is marked "Closed" or "Lessons Learned" phase begins.\n2. Collects data: incident timeline from SIEM, actions taken from ticketing system, communication logs, forensic findings summary, cost data.\n3. Generates three report drafts: (a) Technical post-mortem for the security team, (b) Executive summary for the board, (c) Regulatory notification if required based on incident classification.\n4. Presents drafts for human review and approval.\n5. Tracks report distribution and acknowledgment.',
            keyCapabilities: 'Multi-source data collection, template-based report generation (technical, executive, regulatory), timeline reconstruction, cost calculation, distribution tracking.',
            dataAndTools: 'Ticketing system API, SIEM API, communication platform logs, report templates, cost calculation model, document management system, distribution tracking.',
            complexity: 'Medium',
            expectedImpact: 'Reduces post-incident reporting time from 2-3 weeks to 2-3 days. Ensures consistent report quality and completeness. Eliminates the risk of missed regulatory notification deadlines.',
            quickStart: 'Create report templates for your three audiences. After your next incident, manually fill them and note which data came from which system. Use that mapping to build the automation.',
          },
        },
      ],
    },
  ],
)

// ============================================================
// 11. e-Book
// ============================================================

const ebookProduct = seedProduct(
  'ebook',
  'ebook',
  "The CISO's Guide to Incident Response in Manufacturing",
  'A comprehensive guide for manufacturing CISOs covering the foundations of incident response, practical implementation, and advanced strategies for OT-aware security programs.',
  [
    {
      name: 'Foundations & Overview',
      description: 'Setting the stage: what this topic is, why it matters now, and how it fits into the reader\'s professional world',
      elements: [
        {
          fields: {
            title: 'Why Manufacturing Incident Response Is Different',
            content: 'If you have spent your career in IT security, your first day as a manufacturing CISO will feel like landing on another planet. The vocabulary is familiar — firewalls, endpoints, detection, containment — but the rules are different in ways that matter enormously.\n\nIn IT, when you detect a compromised server, you isolate it. You pull the network cable, quarantine it with your EDR tool, or block it at the firewall. The worst that happens is a service goes down and users complain. In manufacturing, that server might be controlling a furnace, a chemical mixing process, or a robotic assembly line. Isolating it could mean an uncontrolled shutdown that damages equipment worth millions, releases hazardous materials, or — in the worst case — injures someone.\n\nThis single difference — that cyber response actions can have physical consequences — changes everything about how incident response must be planned and executed in manufacturing environments.\n\nConsider the implications: your containment playbooks need safety reviews. Your incident severity classification must weight physical safety above data confidentiality. Your response team needs an OT engineer, not just SOC analysts. Your forensic tools must work on industrial protocols, not just Windows endpoints. And your recovery procedures must account for the fact that restarting a manufacturing process is not like rebooting a server — it can take hours or days and requires careful sequencing to avoid equipment damage.\n\nThis guide exists because generic IR frameworks — even excellent ones like NIST SP 800-61 — were not designed with these constraints in mind. They provide the skeleton, but manufacturing CISOs need the muscle and connective tissue that makes IR actually work on the plant floor.',
            keyInsight: 'The fundamental difference in manufacturing IR is that cyber response actions can have physical consequences — including safety hazards, environmental releases, and equipment damage. This single fact reshapes every phase of the IR lifecycle.',
            practicalExample: 'A food manufacturer\'s IT security team, responding to a network anomaly, disabled a switch port that happened to carry traffic for a freezer control system. The freezer lost its setpoint reference and began a defrost cycle, spoiling $400K of product. The "incident" they were responding to turned out to be a false positive.',
            actionItem: 'Before reading further, make a list of every OT system in your environment where isolating it from the network could have a physical consequence. This is your "do not touch without OT approval" list — and it should be page 1 of your IR plan.',
          },
        },
        {
          fields: {
            title: 'The Manufacturing Threat Landscape: What Every CISO Must Know',
            content: 'Manufacturing has earned a distinction no industry wants: it has been the most-targeted sector for cyberattacks globally since 2022. Understanding why this is the case — and what makes manufacturing an attractive target — is essential for building an effective defense.\n\nThe primary driver is economic. Manufacturing organizations have extremely low tolerance for downtime. When production stops, the meter starts running immediately: lost revenue, contractual penalties, spoiled materials, overtime labor costs, and expedited shipping to recover schedules. Attackers — particularly ransomware operators — understand this calculus. A manufacturer facing $100K per hour in downtime costs is far more likely to pay a $2M ransom than a software company that can operate in degraded mode.\n\nThe secondary driver is the expanding attack surface. The push toward Industry 4.0, smart manufacturing, and digital twins has connected operational technology systems that were previously isolated. Cloud-connected sensors, remote monitoring platforms, and ERP-to-MES integrations have created pathways from the internet to the production floor. Many of these connections were deployed for operational efficiency without adequate security review.\n\nThe third driver is the vulnerability of OT systems themselves. Programmable Logic Controllers (PLCs), Human-Machine Interfaces (HMIs), and Supervisory Control and Data Acquisition (SCADA) systems were designed for reliability and longevity, not security. Many run decades-old operating systems that cannot be patched. They lack basic security features like authentication and encryption. And they are fragile — a simple port scan can crash some industrial controllers.\n\nFor the manufacturing CISO, this landscape means that incident response cannot be an afterthought or a compliance checkbox. It must be a core operational capability, integrated with production management, safety programs, and business continuity planning.',
            keyInsight: 'Manufacturing is targeted primarily because of its low downtime tolerance (which increases ransom payment likelihood), its expanding IT-OT attack surface, and the inherent vulnerability of legacy OT systems.',
            practicalExample: 'In the Norsk Hydro ransomware attack (2019), the aluminum manufacturer lost an estimated $70M despite not paying the ransom. Production at 170 plants across 40 countries was disrupted for weeks. Some plants reverted to manual operations from the 1980s to maintain output.',
            actionItem: 'Calculate your organization\'s hourly downtime cost for each major production line. This number is the single most important input for every IR investment decision you will make.',
          },
        },
      ],
    },
    {
      name: 'Practical Applications',
      description: 'Concrete, real-world ways to apply incident response in daily work',
      elements: [
        {
          fields: {
            title: 'Building Your First OT-Aware IR Plan',
            content: 'An effective manufacturing IR plan is not a 200-page document that sits on a shelf. It is a concise, actionable guide that your team can use under pressure at 2 AM when the alerts are firing and the plant manager is calling.\n\nStart with what you have. If your organization has an existing IT IR plan, do not throw it away — extend it. Add an OT appendix that addresses the unique constraints of your manufacturing environment. Here is the structure that works:\n\nSection 1: Scope and Authority. Clearly define what systems are covered (IT, OT, or both), who has authority to make containment decisions for each zone, and who must be consulted before any action is taken on OT systems. This is not bureaucracy — it is the safety mechanism that prevents well-intentioned IT responders from crashing production systems.\n\nSection 2: Team Roster and Communication. List your IR team with primary and backup contacts. Include personal cell phones, not just corporate extensions. Define your out-of-band communication channel (encrypted messaging app, satellite phone) and test it regularly. In a ransomware event, your corporate phone system may be down.\n\nSection 3: Severity Classification. Build a manufacturing-specific severity matrix that weights safety and environmental impact above data and revenue. A compromised email server is not the same severity as a compromised safety controller, even if both are technically "critical assets."\n\nSection 4: Playbooks. Create scenario-specific playbooks for your most likely incidents: ransomware, phishing with credential compromise, unauthorized remote access, and insider threat. Each playbook should have an IT track and an OT track with clear decision points where the paths diverge.\n\nSection 5: Containment Decision Trees. For each OT zone, document what can be isolated safely, what requires OT engineer approval, and what must never be disconnected without a controlled production shutdown. These decision trees save critical minutes during an actual incident.',
            keyInsight: 'The most effective IR plans are short, scenario-specific, and designed for use under pressure. Separate IT and OT containment paths with clear decision points where OT engineer approval is required.',
            practicalExample: 'A pharmaceutical manufacturer created a one-page "Containment Quick Card" for each production area. Each card listed: systems in the zone, safe isolation points, do-not-touch systems, OT engineer contact, and maximum acceptable isolation duration. Laminated cards were posted in server rooms and control rooms. During their next incident, response time improved by 40%.',
            actionItem: 'Draft a one-page Containment Quick Card for your most critical production area this week. Include: zone name, systems, safe isolation points, prohibited actions, OT contact, and maximum isolation time.',
          },
        },
        {
          fields: {
            title: 'Integrating IR Into Your Safety Culture',
            content: 'Manufacturing organizations possess a superpower that most industries lack: a deeply ingrained safety culture. In mature manufacturing environments, every employee understands that safety is non-negotiable, that near-misses should be reported without fear of blame, and that stopping the line is not just acceptable but expected when safety is at risk.\n\nThis culture is your greatest asset for building cyber incident response capability — if you know how to leverage it.\n\nThe parallels are striking. Safety programs teach employees to recognize hazards and report them. Cyber programs need employees to recognize phishing and report it. Safety programs use near-miss reporting to improve before someone gets hurt. Cyber programs need the same culture of early reporting before a compromise becomes a crisis. Safety programs run drills and exercises. Cyber programs need tabletop exercises and simulations.\n\nHere is how to make the connection practical:\n\nFirst, add a "cyber" category to your existing safety reporting system. When a plant operator notices something strange on an HMI, they should report it through the same channel they use for safety concerns — because in manufacturing, a cyber anomaly on an HMI IS a potential safety concern.\n\nSecond, extend your safety champion program to include cyber. Your safety champions on the plant floor are your early warning system. Train them to recognize the signs of a compromised system: unusual HMI behavior, unexpected program changes, network connectivity issues on OT equipment. Give them a direct line to the SOC.\n\nThird, include cyber scenarios in your safety drills. Your next emergency drill should include a scenario where a cyber incident triggers a safety response. This builds the cross-functional coordination that is essential during a real event.\n\nThe beauty of this approach is that it does not require building a new culture from scratch. You are extending an existing, mature culture to cover a new category of risk. This is faster, cheaper, and more effective than any standalone cyber awareness program.',
            keyInsight: 'Manufacturing\'s existing safety culture — with its reporting systems, champion programs, and drill cadence — is the ideal foundation for building cyber incident response capability. Extend it rather than building from scratch.',
            practicalExample: 'A chemical manufacturer added a "Cyber/Digital Anomaly" category to their existing near-miss reporting system. In the first quarter, plant operators reported 23 anomalies — 3 of which turned out to be genuine security concerns that were caught weeks earlier than they would have been through traditional monitoring alone.',
            actionItem: 'Meet with your Safety Director this week and propose adding cyber anomaly reporting to the existing safety reporting system. Bring 3 specific examples of OT anomalies that should be reported.',
          },
        },
      ],
    },
    {
      name: 'Implementation Guide',
      description: 'Step-by-step guidance for getting started — tools, setup, and a clear path from zero to competent',
      elements: [
        {
          fields: {
            title: 'The 90-Day Implementation Roadmap',
            content: 'Building a manufacturing-grade IR capability does not require a million-dollar budget or a team of specialists. It requires a focused plan, executive support, and disciplined execution over 90 days. Here is the roadmap that has worked for organizations ranging from 200-person SMBs to 10,000-employee enterprises.\n\nDays 1-30: Foundation.\nThe goal of the first month is to establish the basic infrastructure that everything else builds on. You need four things: a team, a plan, communication channels, and an initial asset inventory.\n\nStart by identifying your core IR team. You need at minimum: yourself (CISO or security lead), one IT security analyst, one OT engineer or technician, the plant manager or operations lead, a legal contact, and a communications contact. These people do not need to be dedicated to IR — they need to be identified, briefed on their role, and reachable within 30 minutes.\n\nNext, write your initial IR plan. It does not need to be comprehensive — it needs to be usable. Start with the five sections outlined in the previous chapter. Focus on your most likely scenario (ransomware for most manufacturers) and write that playbook in detail. Other scenarios can come in month 2.\n\nSet up your out-of-band communication. Create a group in an encrypted messaging app (Signal or similar) with all IR team members. Test it. Print physical contact cards and distribute them. This takes 2 hours and may be the most valuable 2 hours you spend.\n\nFinally, create your initial asset inventory. You do not need a perfect inventory — you need a starting point. Focus on three categories: (1) internet-facing systems, (2) IT-OT boundary systems (DMZ, engineering workstations), and (3) critical OT systems (safety controllers, critical production PLCs). You can expand later.\n\nDays 31-60: Detection and Communication.\nWith the foundation in place, month 2 focuses on improving your ability to detect incidents and communicate during them. Review your current detection capabilities: what logs are you collecting? Is your SIEM receiving data from IT systems? Do you have any OT monitoring? Identify the biggest gaps and address the highest-impact ones first.\n\nRun your first tabletop exercise. A 90-minute ransomware scenario with your full IR team will reveal more gaps than any assessment document. Capture the findings and assign owners.\n\nDays 61-90: Hardening and Practice.\nMonth 3 is about closing the gaps identified in your tabletop, establishing relationships with external partners (forensics retainer, legal counsel), and running your second exercise to verify improvement. By day 90, you should have: a tested IR plan, a trained team, basic detection capability for IT and OT, external retainers in place, and two exercises completed.',
            keyInsight: 'A 90-day focused implementation plan can take a manufacturing organization from zero IR capability to a functional, tested program. The key is sequencing: people and process first (month 1), detection and communication second (month 2), hardening and practice third (month 3).',
            practicalExample: 'A 500-employee plastics manufacturer followed this 90-day roadmap with a total investment of $35,000 (mostly for a forensics retainer and a basic OT monitoring trial). Within 6 months, they detected and contained a phishing-to-credential-theft incident in 4 hours — their IR team estimated it would have gone undetected for weeks under their previous posture.',
            actionItem: 'Block 90 minutes on your calendar this week for "IR Foundation Planning." Use that time to identify your core IR team members and draft the one-page team roster with contact information.',
          },
        },
        {
          fields: {
            title: 'Selecting and Deploying OT Monitoring',
            content: 'If you can only make one technology investment in your manufacturing IR program, make it OT network monitoring. Without visibility into OT traffic, you are flying blind — and attackers know it. The average dwell time for OT compromises is 21 days, compared to 7 days for IT. That gap exists almost entirely because manufacturers lack monitoring on the production network.\n\nThe good news is that OT monitoring has matured significantly. Several vendors offer solutions designed specifically for industrial environments, and deployment can be accomplished without any risk to production systems.\n\nThe core options are:\n\nDedicated OT monitoring platforms (Dragos Platform, Claroty CTD, Nozomi Guardian, Microsoft Defender for IoT). These tools understand industrial protocols natively — they can parse Modbus, EtherNet/IP, PROFINET, OPC UA, and dozens of others. They build behavioral baselines of your OT environment and alert when something deviates. They also provide asset discovery, vulnerability identification, and threat detection specific to ICS environments.\n\nDeployment is passive — you install a network sensor (physical or virtual appliance) connected to a mirror port (SPAN) or network TAP on your OT network switches. No agents are installed on OT devices. No traffic is injected into the OT network. The sensor only listens. This means zero risk to production systems.\n\nWhen evaluating solutions, prioritize:\n\n1. Protocol coverage — does it parse the specific industrial protocols in your environment?\n2. Asset identification depth — can it identify device type, firmware version, and PLC program state?\n3. SIEM integration — can it forward enriched alerts to your IT SIEM for unified visibility?\n4. Manufacturing sector expertise — does the vendor have threat intelligence specific to manufacturing?\n5. Deployment simplicity — can it be deployed at a site in under a day without production impact?\n\nFor SMBs with 1-2 sites, a single-vendor solution with managed detection is often the best value. For enterprises with many sites, a platform that supports distributed deployment with centralized management is essential.',
            keyInsight: 'OT monitoring is the highest-ROI technology investment for manufacturing IR. Passive deployment means zero production risk. Prioritize protocol coverage, asset depth, and SIEM integration when evaluating solutions.',
            practicalExample: 'An automotive parts manufacturer deployed passive OT monitoring on a pilot line in 3 hours (one network TAP installation). Within the first week, the tool discovered 14 OT devices not in the asset inventory, identified 3 with critical vulnerabilities, and detected an unauthorized remote access connection from a vendor that had been active for 8 months.',
            actionItem: 'Request a proof-of-concept from two OT monitoring vendors. Most offer free 30-day pilots. Deployment on a single network segment takes hours, not weeks. Use the pilot to quantify your OT visibility gap.',
          },
        },
      ],
    },
  ],
)

// ============================================================
// All seed products
// ============================================================

const SEED_PRODUCTS: Product[] = [
  questionsProduct,
  checklistProduct,
  emailCourseProduct,
  promptsProduct,
  battleCardsProduct,
  decisionBookProduct,
  dossierProduct,
  playbookProduct,
  cheatSheetProduct,
  agentBookProduct,
  ebookProduct,
]

// ============================================================
// Install function
// ============================================================

export function installSeedData(): void {
  if (typeof window === 'undefined') return
  if (localStorage.getItem(SEED_FLAG_KEY)) return

  try {
    const configKey = 'queb-setup-configurations'
    const rawConfigs = localStorage.getItem(configKey)
    const configs: SetupConfiguration[] = rawConfigs ? JSON.parse(rawConfigs) : []
    if (!configs.find((c) => c.id === SEED_CONFIG.id)) {
      configs.unshift(SEED_CONFIG)
      localStorage.setItem(configKey, JSON.stringify(configs.slice(0, 200)))
    }

    const productKey = 'digicraft-products'
    const rawProducts = localStorage.getItem(productKey)
    const products: Product[] = rawProducts ? JSON.parse(rawProducts) : []
    const existingIds = new Set(products.map((p) => p.id))
    const newProducts = SEED_PRODUCTS.filter((p) => !existingIds.has(p.id))
    if (newProducts.length > 0) {
      products.unshift(...newProducts)
      localStorage.setItem(productKey, JSON.stringify(products.slice(0, 100)))
    }

    localStorage.setItem(SEED_FLAG_KEY, '1')
  } catch {
    // Silently fail — seed data is non-critical
  }

  try {
    if (!localStorage.getItem(CROSSWORD_SEED_FLAG)) {
      const configKey = 'queb-setup-configurations'
      const rawConfigs = localStorage.getItem(configKey)
      const configs: SetupConfiguration[] = rawConfigs ? JSON.parse(rawConfigs) : []
      if (!configs.find((c) => c.id === CROSSWORD_SEED_CONFIG.id)) {
        configs.unshift(CROSSWORD_SEED_CONFIG)
        localStorage.setItem(configKey, JSON.stringify(configs.slice(0, 200)))
      }
      localStorage.setItem(CROSSWORD_SEED_FLAG, '1')
    }
  } catch {
    // Silently fail
  }

  try {
    if (!localStorage.getItem(WORKBOOK_SEED_FLAG)) {
      const configKey = 'queb-setup-configurations'
      const rawConfigs = localStorage.getItem(configKey)
      const configs: SetupConfiguration[] = rawConfigs ? JSON.parse(rawConfigs) : []
      if (!configs.find((c) => c.id === WORKBOOK_SEED_CONFIG.id)) {
        configs.unshift(WORKBOOK_SEED_CONFIG)
        localStorage.setItem(configKey, JSON.stringify(configs.slice(0, 200)))
      }
      localStorage.setItem(WORKBOOK_SEED_FLAG, '1')
    }
  } catch {
    // Silently fail
  }
}
