export const COMPLIANCES = [
  {
    "dept": "cs",
    "sNo": 1,
    "description": "Board meetings: min 4/year, max 120 days gap",
    "frequency": "Quarterly",
    "dueDates": "Within 120 days of last meeting"
  },
  {
    "dept": "cs",
    "sNo": 2,
    "description": "Annual General Meeting (AGM)",
    "frequency": "Annual",
    "dueDates": "Within 6 months of FY close (30 Sep typically)"
  },
  {
    "dept": "cs",
    "sNo": 3,
    "description": "AOC-4 filing (Financial Statements)",
    "frequency": "Annual",
    "dueDates": "Within 30 days of AGM"
  },
  {
    "dept": "cs",
    "sNo": 4,
    "description": "MGT-7 / MGT-7A filing (Annual Return)",
    "frequency": "Annual",
    "dueDates": "Within 60 days of AGM"
  },
  {
    "dept": "cs",
    "sNo": 5,
    "description": "DIR-3 KYC for all directors",
    "frequency": "Annual",
    "dueDates": "30 September"
  },
  {
    "dept": "cs",
    "sNo": 6,
    "description": "ADT-1: Statutory Auditor appointment intimation",
    "frequency": "Annual",
    "dueDates": "Within 15 days of AGM"
  },
  {
    "dept": "cs",
    "sNo": 7,
    "description": "Minutes book maintenance: board & general meetings",
    "frequency": "Event-based",
    "dueDates": "Within 30 days of meeting"
  },
  {
    "dept": "cs",
    "sNo": 8,
    "description": "DIR-12: Change in directors / KMP",
    "frequency": "Event-based",
    "dueDates": "Within 30 days of change"
  },
  {
    "dept": "cs",
    "sNo": 9,
    "description": "Statutory registers maintenance (members, debenture holders, etc.)",
    "frequency": "Annual",
    "dueDates": "Updated within 7 days of changes"
  },
  {
    "dept": "cs",
    "sNo": 10,
    "description": "Quarterly compliance certification for management review",
    "frequency": "Quarterly",
    "dueDates": "Within 30 days of quarter close"
  },
  {
    "dept": "legal",
    "sNo": 1,
    "description": "Trademark renewal (every 10 years)",
    "frequency": "Event-based",
    "dueDates": "Before expiry of 10-year period"
  },
  {
    "dept": "legal",
    "sNo": 2,
    "description": "Litigation tracking & disclosure",
    "frequency": "Quarterly",
    "dueDates": "Per board meeting"
  },
  {
    "dept": "legal",
    "sNo": 3,
    "description": "Compliance with sector-specific licenses",
    "frequency": "Annual",
    "dueDates": "Per license renewal date"
  },
  {
    "dept": "legal",
    "sNo": 4,
    "description": "Vendor contract reviews",
    "frequency": "Event-based",
    "dueDates": "Before contract signing"
  },
  {
    "dept": "legal",
    "sNo": 5,
    "description": "Customer / B2B contract reviews",
    "frequency": "Event-based",
    "dueDates": "Before contract signing"
  },
  {
    "dept": "legal",
    "sNo": 6,
    "description": "NDA template review & execution tracking",
    "frequency": "Event-based",
    "dueDates": "Before info sharing"
  },
  {
    "dept": "hr",
    "sNo": 1,
    "description": "Provident Fund (PF) returns & deposit",
    "frequency": "Monthly",
    "dueDates": "15th of every month"
  },
  {
    "dept": "hr",
    "sNo": 2,
    "description": "ESI returns & deposit (1+ employee in manufacturing)",
    "frequency": "Monthly",
    "dueDates": "15th of every month"
  },
  {
    "dept": "hr",
    "sNo": 3,
    "description": "Karnataka Professional Tax (PT): gross > ₹25K/mo",
    "frequency": "Monthly",
    "dueDates": "20th of every month"
  },
  {
    "dept": "hr",
    "sNo": 4,
    "description": "Karnataka Labour Welfare Fund (LWF): 10+ employees",
    "frequency": "Annual",
    "dueDates": "31 December"
  },
  {
    "dept": "hr",
    "sNo": 5,
    "description": "POSH committee: Annual Report to District Officer",
    "frequency": "Annual",
    "dueDates": "31 January"
  },
  {
    "dept": "hr",
    "sNo": 6,
    "description": "Karnataka Shops & Establishments Registration / Renewal",
    "frequency": "Event-based",
    "dueDates": "Per registration cycle"
  },
  {
    "dept": "hr",
    "sNo": 7,
    "description": "Gratuity: payable after 1 yr for FTC (new Labour Codes 2026)",
    "frequency": "Event-based",
    "dueDates": "Within 30 days of cessation"
  },
  {
    "dept": "hr",
    "sNo": 8,
    "description": "Minimum Wage compliance (Karnataka revision May 2026)",
    "frequency": "Annual",
    "dueDates": "On effective date"
  },
  {
    "dept": "hr",
    "sNo": 9,
    "description": "Bonus Act compliance: wage threshold ₹21K, payment by Nov",
    "frequency": "Annual",
    "dueDates": "Within 8 months of FY close"
  },
  {
    "dept": "hr",
    "sNo": 10,
    "description": "50% Basic of CTC: new Labour Codes",
    "frequency": "Annual",
    "dueDates": "Continuous compliance"
  },
  {
    "dept": "hr",
    "sNo": 11,
    "description": "Maternity Benefit: 26 weeks paid leave",
    "frequency": "Event-based",
    "dueDates": "As per applicability"
  },
  {
    "dept": "hr",
    "sNo": 12,
    "description": "TDS on salaries (Form 24Q quarterly)",
    "frequency": "Quarterly",
    "dueDates": "31 July / 31 Oct / 31 Jan / 31 May"
  },
  {
    "dept": "hr",
    "sNo": 13,
    "description": "Appointment letters for all new hires",
    "frequency": "Event-based",
    "dueDates": "On joining day"
  },
  {
    "dept": "hr",
    "sNo": 14,
    "description": "Performance review documentation",
    "frequency": "Annual",
    "dueDates": "Per review calendar"
  },
  {
    "dept": "finance",
    "sNo": 1,
    "description": "GSTR-1 filing (Outward supplies)",
    "frequency": "Monthly",
    "dueDates": "11th of every month",
    "reminderStartDay": 1
  },
  {
    "dept": "finance",
    "sNo": 2,
    "description": "GSTR-3B filing (Summary return & tax payment)",
    "frequency": "Monthly",
    "dueDates": "20th of every month"
  },
  {
    "dept": "finance",
    "sNo": 3,
    "description": "GSTR-9 Annual Return",
    "frequency": "Annual",
    "dueDates": "31 December"
  },
  {
    "dept": "finance",
    "sNo": 4,
    "description": "TDS deduction & deposit",
    "frequency": "Monthly",
    "dueDates": "7th of every month",
    "reminderStartDay": 1
  },
  {
    "dept": "finance",
    "sNo": 5,
    "description": "Quarterly TDS returns (Form 24Q, 26Q)",
    "frequency": "Quarterly",
    "dueDates": "31 July / 31 Oct / 31 Jan / 31 May"
  },
  {
    "dept": "finance",
    "sNo": 6,
    "description": "Advance Tax (4 instalments)",
    "frequency": "Quarterly",
    "dueDates": "15 Jun (15%) · 15 Sep (45%) · 15 Dec (75%) · 15 Mar (100%)"
  },
  {
    "dept": "finance",
    "sNo": 7,
    "description": "Income Tax Return (ITR) filing",
    "frequency": "Annual",
    "dueDates": "31 Oct (non-audit) / 30 Nov (audit)"
  },
  {
    "dept": "finance",
    "sNo": 8,
    "description": "Tax Audit (Form 3CA/3CB + 3CD) if turnover > ₹1 cr / ₹10 cr",
    "frequency": "Annual",
    "dueDates": "30 September"
  },
  {
    "dept": "finance",
    "sNo": 9,
    "description": "Transfer Pricing Audit (Form 3CEB) if applicable",
    "frequency": "Annual",
    "dueDates": "31 October"
  },
  {
    "dept": "finance",
    "sNo": 10,
    "description": "Statutory Audit (Companies Act)",
    "frequency": "Annual",
    "dueDates": "Before AGM (30 Sep)"
  },
  {
    "dept": "finance",
    "sNo": 11,
    "description": "E-invoicing on B2B supplies (AATO > ₹5 cr)",
    "frequency": "Event-based",
    "dueDates": "Within 30 days of invoice"
  },
  {
    "dept": "finance",
    "sNo": 12,
    "description": "LUT renewal for export (Form RFD-11)",
    "frequency": "Annual",
    "dueDates": "31 March"
  },
  {
    "dept": "finance",
    "sNo": 13,
    "description": "TCS on sales > ₹50 lakh per buyer/yr",
    "frequency": "Event-based",
    "dueDates": "Per applicability"
  },
  {
    "dept": "finance",
    "sNo": 14,
    "description": "Monthly book closure & MIS",
    "frequency": "Monthly",
    "dueDates": "Within 10 working days"
  },
  {
    "dept": "finance",
    "sNo": 15,
    "description": "Bank reconciliations",
    "frequency": "Monthly",
    "dueDates": "Within 5 working days"
  },
  {
    "dept": "marketing",
    "sNo": 1,
    "description": "DPDP Act: Consent for personal data collection",
    "frequency": "Event-based",
    "dueDates": "Before collection"
  },
  {
    "dept": "marketing",
    "sNo": 2,
    "description": "DPDP Act: Data Fiduciary obligations (notice, security, breach reporting)",
    "frequency": "Annual",
    "dueDates": "Audit annually"
  },
  {
    "dept": "marketing",
    "sNo": 3,
    "description": "Influencer disclosure: #Ad / verbal disclosure",
    "frequency": "Event-based",
    "dueDates": "Before campaign go-live"
  },
  {
    "dept": "marketing",
    "sNo": 4,
    "description": "AI / Virtual influencer disclosure",
    "frequency": "Event-based",
    "dueDates": "On every post"
  },
  {
    "dept": "marketing",
    "sNo": 5,
    "description": "Trademark filings for new campaigns / logos",
    "frequency": "Event-based",
    "dueDates": "Before launch"
  },
  {
    "dept": "marketing",
    "sNo": 6,
    "description": "Copyright assignment for creative content",
    "frequency": "Event-based",
    "dueDates": "On content delivery"
  },
  {
    "dept": "marketing",
    "sNo": 7,
    "description": "ASCI Code self-regulation review",
    "frequency": "Event-based",
    "dueDates": "Pre-launch review"
  },
  {
    "dept": "marketing",
    "sNo": 8,
    "description": "Brand guidelines compliance for all collateral",
    "frequency": "Event-based",
    "dueDates": "Pre-publish review"
  },
  {
    "dept": "operations",
    "sNo": 1,
    "description": "Factory License renewal",
    "frequency": "Annual",
    "dueDates": "31 December"
  },
  {
    "dept": "operations",
    "sNo": 2,
    "description": "Consent to Operate (CTO): State Pollution Control Board",
    "frequency": "Annual",
    "dueDates": "As per CTO expiry"
  },
  {
    "dept": "operations",
    "sNo": 3,
    "description": "Consent to Establish (CTE): pre-expansion",
    "frequency": "Event-based",
    "dueDates": "Before commissioning"
  },
  {
    "dept": "operations",
    "sNo": 4,
    "description": "Fire Safety NOC renewal",
    "frequency": "Annual",
    "dueDates": "Per state notification"
  },
  {
    "dept": "operations",
    "sNo": 5,
    "description": "Hazardous Waste Management: annual return Form 4",
    "frequency": "Annual",
    "dueDates": "30 June"
  },
  {
    "dept": "operations",
    "sNo": 6,
    "description": "Plastic Waste Management: EPR target (30% recycled, rising to 60% by 2028-29)",
    "frequency": "Annual",
    "dueDates": "30 June (EPR portal)"
  },
  {
    "dept": "operations",
    "sNo": 7,
    "description": "Plastic Waste Management: QR code on all packaging",
    "frequency": "Event-based",
    "dueDates": "Before product launch"
  },
  {
    "dept": "operations",
    "sNo": 8,
    "description": "Air & Water quality monitoring & reporting",
    "frequency": "Quarterly",
    "dueDates": "Per SPCB schedule"
  },
  {
    "dept": "operations",
    "sNo": 9,
    "description": "Annual Environmental Statement (Form V)",
    "frequency": "Annual",
    "dueDates": "30 September"
  },
  {
    "dept": "operations",
    "sNo": 10,
    "description": "Internal safety audits & near-miss reporting",
    "frequency": "Quarterly",
    "dueDates": "Per audit calendar"
  },
  {
    "dept": "operations",
    "sNo": 11,
    "description": "Equipment preventive maintenance schedule",
    "frequency": "Monthly",
    "dueDates": "Per maintenance calendar"
  },
  {
    "dept": "supply",
    "sNo": 1,
    "description": "Customs documentation: Bill of Entry / Shipping Bill",
    "frequency": "Event-based",
    "dueDates": "Per shipment"
  },
  {
    "dept": "supply",
    "sNo": 2,
    "description": "E-way Bill: mandatory if value > ₹50K",
    "frequency": "Event-based",
    "dueDates": "Before goods movement"
  },
  {
    "dept": "supply",
    "sNo": 3,
    "description": "E-Invoicing for B2B (AATO > ₹10 cr → IRP within 30 days)",
    "frequency": "Event-based",
    "dueDates": "Within 30 days"
  },
  {
    "dept": "supply",
    "sNo": 4,
    "description": "2FA for e-invoice / e-way bill generation",
    "frequency": "Annual",
    "dueDates": "Always-on requirement"
  },
  {
    "dept": "supply",
    "sNo": 5,
    "description": "Vendor compliance audits (PF/ESI of contractors)",
    "frequency": "Quarterly",
    "dueDates": "Quarterly audit"
  },
  {
    "dept": "supply",
    "sNo": 6,
    "description": "Vendor risk assessment & onboarding",
    "frequency": "Event-based",
    "dueDates": "Before first PO"
  },
  {
    "dept": "supply",
    "sNo": 7,
    "description": "Supplier code of conduct sign-off",
    "frequency": "Annual",
    "dueDates": "Annual reaffirmation"
  },
  {
    "dept": "supply",
    "sNo": 8,
    "description": "Inventory turnover & stockout reporting",
    "frequency": "Monthly",
    "dueDates": "Within 10 working days"
  },
  {
    "dept": "design",
    "sNo": 1,
    "description": "Design IP filings for new product designs",
    "frequency": "Event-based",
    "dueDates": "Before product launch"
  },
  {
    "dept": "design",
    "sNo": 2,
    "description": "Copyright on design artworks (packaging, logos)",
    "frequency": "Event-based",
    "dueDates": "On creation"
  },
  {
    "dept": "design",
    "sNo": 3,
    "description": "Design version control & repository management",
    "frequency": "Event-based",
    "dueDates": "Continuous"
  },
  {
    "dept": "design",
    "sNo": 4,
    "description": "Pre-launch design review (regulatory marks, MRP, BIS marks, QR code)",
    "frequency": "Event-based",
    "dueDates": "Pre-launch sign-off"
  },
  {
    "dept": "rnd",
    "sNo": 1,
    "description": "Patent filings: provisional / complete",
    "frequency": "Event-based",
    "dueDates": "Within 12 months of provisional"
  },
  {
    "dept": "rnd",
    "sNo": 2,
    "description": "DSIR Recognition renewal (3-year cycle; biotech startups waived)",
    "frequency": "Event-based",
    "dueDates": "Before expiry"
  },
  {
    "dept": "rnd",
    "sNo": 3,
    "description": "Section 35(2AB): Form 3CL submission to DSIR",
    "frequency": "Annual",
    "dueDates": "31 October"
  },
  {
    "dept": "rnd",
    "sNo": 4,
    "description": "Form 3CK: In-house R&D agreement with DSIR",
    "frequency": "Event-based",
    "dueDates": "On registration / renewal"
  },
  {
    "dept": "rnd",
    "sNo": 5,
    "description": "Patent strategy review",
    "frequency": "Quarterly",
    "dueDates": "Quarterly IP committee"
  },
  {
    "dept": "rnd",
    "sNo": 6,
    "description": "Grant utilization certificates (if BIRAC/DST grants received)",
    "frequency": "Annual",
    "dueDates": "Per grant calendar"
  },
  {
    "dept": "sales",
    "sNo": 1,
    "description": "GST tax invoicing on all sales",
    "frequency": "Event-based",
    "dueDates": "At time of supply"
  },
  {
    "dept": "sales",
    "sNo": 2,
    "description": "E-Invoicing on B2B if AATO > ₹5 cr",
    "frequency": "Event-based",
    "dueDates": "Within 30 days"
  },
  {
    "dept": "sales",
    "sNo": 3,
    "description": "TCS on sales > ₹50 lakh per buyer/year",
    "frequency": "Event-based",
    "dueDates": "On invoice"
  },
  {
    "dept": "sales",
    "sNo": 4,
    "description": "Customer contract reviews & T&C compliance",
    "frequency": "Event-based",
    "dueDates": "Before signing"
  },
  {
    "dept": "sales",
    "sNo": 5,
    "description": "Sales credit policy adherence: collection cycles",
    "frequency": "Monthly",
    "dueDates": "Monthly aging review"
  },
  {
    "dept": "operations",
    "sNo": 12,
    "description": "CPCB Compostable Plastic Certificate (IS/ISO 17088:2021): per product/grade",
    "frequency": "Event-based",
    "dueDates": "Before commercial sale; fresh application on any change"
  },
  {
    "dept": "operations",
    "sNo": 13,
    "description": "State Pollution Control Board manufacturer registration for compostable plastics",
    "frequency": "Event-based",
    "dueDates": "Before CPCB application"
  },
  {
    "dept": "operations",
    "sNo": 14,
    "description": "Compostability test reports: seed germination + heavy metal + 180-day biodegradation",
    "frequency": "Event-based",
    "dueDates": "Per CPCB certification cycle"
  },
  {
    "dept": "operations",
    "sNo": 15,
    "description": "6-monthly reporting on CPCB \"Compostable Plastics E-Certification\" portal",
    "frequency": "Quarterly",
    "dueDates": "Twice a year (per CPCB portal schedule)"
  },
  {
    "dept": "operations",
    "sNo": 16,
    "description": "EPR registration on CPCB Centralized Portal (Producer/Importer/Brand Owner)",
    "frequency": "Annual",
    "dueDates": "Annual renewal on EPR portal"
  },
  {
    "dept": "operations",
    "sNo": 17,
    "description": "EPR category-wise tonnage declaration (no aggregate accepted from 2026)",
    "frequency": "Annual",
    "dueDates": "30 June (EPR portal)"
  },
  {
    "dept": "operations",
    "sNo": 18,
    "description": "Recycled content disclosure for rigid plastic packaging (30% → 60% by 2028-29)",
    "frequency": "Annual",
    "dueDates": "30 June (EPR portal)"
  },
  {
    "dept": "operations",
    "sNo": 19,
    "description": "CPCB certificate number + QR code + \"COMPOSTABLE\" label on packaging",
    "frequency": "Event-based",
    "dueDates": "Before product launch; continuous on all packs"
  },
  {
    "dept": "operations",
    "sNo": 20,
    "description": "Brand-owner labeling: PIBO name + EPR registration number on all packs",
    "frequency": "Event-based",
    "dueDates": "Continuous on all packs sold in India"
  },
  {
    "dept": "operations",
    "sNo": 21,
    "description": "Single-Use Plastic Ban: exemption verification for IS 17088 compostable products",
    "frequency": "Annual",
    "dueDates": "Continuous compliance"
  },
  {
    "dept": "operations",
    "sNo": 22,
    "description": "Hazardous Waste: Form 4 annual return",
    "frequency": "Annual",
    "dueDates": "30 June"
  },
  {
    "dept": "supply",
    "sNo": 9,
    "description": "Import Export Code (IEC) annual update on DGFT portal",
    "frequency": "Annual",
    "dueDates": "April–June every year (else IEC deactivated)"
  },
  {
    "dept": "supply",
    "sNo": 10,
    "description": "PLEXCONCIL RCMC (Registration-cum-Membership Certificate) for plastic exports",
    "frequency": "Annual",
    "dueDates": "Per RCMC renewal date"
  },
  {
    "dept": "supply",
    "sNo": 11,
    "description": "Customs duty assessment + Bill of Entry for biopolymer raw material imports (PBAT, PLA)",
    "frequency": "Event-based",
    "dueDates": "On import clearance"
  },
  {
    "dept": "supply",
    "sNo": 12,
    "description": "EPR registration as Importer (if importing finished plastic products)",
    "frequency": "Annual",
    "dueDates": "Annual renewal on EPR portal"
  },
  {
    "dept": "marketing",
    "sNo": 9,
    "description": "FSSAI food-contact migration testing: 60 mg/kg or 10 mg/dm² limit",
    "frequency": "Event-based",
    "dueDates": "Before launch; per NABL-approved lab"
  },
  {
    "dept": "marketing",
    "sNo": 10,
    "description": "FSSAI compliance for all food-contact packaging SKUs",
    "frequency": "Annual",
    "dueDates": "Per product launch + annual audit"
  },
  {
    "dept": "marketing",
    "sNo": 11,
    "description": "Sustainability claims substantiation: no greenwashing on packaging or ads",
    "frequency": "Event-based",
    "dueDates": "Pre-launch review of all green claims"
  },
  {
    "dept": "finance",
    "sNo": 16,
    "description": "CSR Section 135 applicability assessment (threshold: NW ≥ ₹500cr · Turnover ≥ ₹1000cr · NP ≥ ₹5cr [proposed ₹10cr])",
    "frequency": "Annual",
    "dueDates": "On finalisation of preceding FY accounts"
  },
  {
    "dept": "finance",
    "sNo": 17,
    "description": "CSR spend: 2% of avg net profits of preceding 3 FYs (if applicable)",
    "frequency": "Annual",
    "dueDates": "Within FY · unspent → CSR Unspent Account"
  },
  {
    "dept": "cs",
    "sNo": 11,
    "description": "Udyam Registration (MSME) renewal: annual update",
    "frequency": "Annual",
    "dueDates": "Annual on Udyam portal"
  },
  {
    "dept": "cs",
    "sNo": 12,
    "description": "INC-22A (ACTIVE): registered office address verification",
    "frequency": "Event-based",
    "dueDates": "Within 30 days of address change"
  },
  {
    "dept": "cs",
    "sNo": 13,
    "description": "BRSR readiness preparation (voluntary; mandatory if Bambrew goes public)",
    "frequency": "Annual",
    "dueDates": "Voluntary annual disclosure"
  },
  {
    "dept": "operations",
    "sNo": 23,
    "description": "FSSAI License (FBO: Food Business Operator) for food packaging manufacturing",
    "frequency": "Annual",
    "dueDates": "Per license renewal date (1, 3 or 5 yr validity)"
  },
  {
    "dept": "operations",
    "sNo": 24,
    "description": "IS 9845: Overall Migration test (≤ 60 mg/kg or 10 mg/dm²)",
    "frequency": "Event-based",
    "dueDates": "Per product launch; NABL-accredited lab"
  },
  {
    "dept": "operations",
    "sNo": 25,
    "description": "IS 9835: Specific Migration Limit (SML) testing for individual substances",
    "frequency": "Event-based",
    "dueDates": "Per product launch; NABL-accredited lab"
  },
  {
    "dept": "operations",
    "sNo": 26,
    "description": "IS 9833: Pigments & colorants list compliance for food-contact plastics",
    "frequency": "Event-based",
    "dueDates": "Per pigment/colorant approval before launch"
  },
  {
    "dept": "operations",
    "sNo": 27,
    "description": "NABL-accredited Certificate of Conformity for food-contact packaging",
    "frequency": "Event-based",
    "dueDates": "Per product launch + on raw material change"
  },
  {
    "dept": "operations",
    "sNo": 28,
    "description": "Heavy metal limits per FSS (Contaminants, Toxins & Residues) Regulation 2011: lead, cadmium, arsenic, mercury",
    "frequency": "Event-based",
    "dueDates": "Per product launch; NABL lab test"
  },
  {
    "dept": "operations",
    "sNo": 29,
    "description": "IS 14534:2016: Plastic recycling guidelines (identification + marking)",
    "frequency": "Event-based",
    "dueDates": "Per product launch"
  },
  {
    "dept": "operations",
    "sNo": 30,
    "description": "IS/ISO 17088 + BIS certification for sugarcane bagasse / molded fibre food containers",
    "frequency": "Event-based",
    "dueDates": "Per product launch"
  },
  {
    "dept": "operations",
    "sNo": 31,
    "description": "FSSAI April 2025 \"Critical\" food-grade packaging inspection readiness",
    "frequency": "Quarterly",
    "dueDates": "Surprise inspections; quarterly internal audit"
  },
  {
    "dept": "marketing",
    "sNo": 12,
    "description": "Restriction on printing inks for food-contact packaging: no lead/cadmium migration",
    "frequency": "Event-based",
    "dueDates": "Pre-launch ink approval per SKU"
  },
  {
    "dept": "operations",
    "sNo": 32,
    "description": "Minimum 40 micron thickness for compostable carry bags / films",
    "frequency": "Annual",
    "dueDates": "Continuous compliance per SKU spec"
  },
  {
    "dept": "operations",
    "sNo": 33,
    "description": "Multi-Layer Plastic (MLP): explicit EPR coverage (composite films)",
    "frequency": "Annual",
    "dueDates": "30 June (EPR portal declaration)"
  },
  {
    "dept": "operations",
    "sNo": 34,
    "description": "EPR recycling target: 70% by FY 2026-27 → 100% by FY 2028-29",
    "frequency": "Annual",
    "dueDates": "30 June (EPR portal)"
  },
  {
    "dept": "operations",
    "sNo": 35,
    "description": "Effluent Treatment Plant (ETP) operational clearance: biopolymer manufacturing",
    "frequency": "Annual",
    "dueDates": "Per SPCB consent renewal"
  },
  {
    "dept": "operations",
    "sNo": 36,
    "description": "Air Pollution Control Equipment compliance: biopolymer extrusion lines",
    "frequency": "Quarterly",
    "dueDates": "Per SPCB monitoring schedule"
  },
  {
    "dept": "supply",
    "sNo": 13,
    "description": "EPR registration MANDATORY before customs clearance for plastic raw material imports",
    "frequency": "Annual",
    "dueDates": "Annual EPR registration must be valid pre-shipment"
  },
  {
    "dept": "supply",
    "sNo": 14,
    "description": "BPI Certification (ASTM D6400 / D6868): for US / Canada exports",
    "frequency": "Annual",
    "dueDates": "Per certification cycle (typically 1-yr)"
  },
  {
    "dept": "supply",
    "sNo": 15,
    "description": "TÜV Austria OK Compost INDUSTRIAL (EN 13432): for EU exports",
    "frequency": "Annual",
    "dueDates": "Per certification cycle"
  },
  {
    "dept": "supply",
    "sNo": 16,
    "description": "TÜV Austria OK Compost HOME: for premium EU / US home-compost claims",
    "frequency": "Annual",
    "dueDates": "Per certification cycle"
  },
  {
    "dept": "supply",
    "sNo": 17,
    "description": "EU PPWR (Packaging & Packaging Waste Regulation) 2026: PFAS-free, multi-layer restrictions",
    "frequency": "Annual",
    "dueDates": "Continuous compliance for EU exports"
  },
  {
    "dept": "supply",
    "sNo": 18,
    "description": "REACH compliance: chemicals/substances in plastic products sold in EU",
    "frequency": "Annual",
    "dueDates": "Per substance registration & SVHC list updates"
  },
  {
    "dept": "finance",
    "sNo": 18,
    "description": "GST @ 18% on biodegradable / compostable plastics (no special exemption)",
    "frequency": "Monthly",
    "dueDates": "Continuous compliance per GSTR-1/3B"
  },
  {
    "dept": "operations",
    "sNo": 37,
    "description": "National Building Code (NBC) fire & life safety compliance",
    "frequency": "Annual",
    "dueDates": "Annual audit per NBC"
  },
  {
    "dept": "operations",
    "sNo": 38,
    "description": "Karnataka Fire Services Act, Sec. 13: building fire safety precautions",
    "frequency": "Annual",
    "dueDates": "Per state notification + inspection"
  },
  {
    "dept": "operations",
    "sNo": 39,
    "description": "Fire extinguishers: quarterly inspection + annual refilling",
    "frequency": "Quarterly",
    "dueDates": "Quarterly inspection; annual refill"
  },
  {
    "dept": "operations",
    "sNo": 40,
    "description": "Fire alarm + sprinkler + hydrant system testing",
    "frequency": "Quarterly",
    "dueDates": "Quarterly system test"
  },
  {
    "dept": "operations",
    "sNo": 41,
    "description": "Emergency exits: marking, illumination, accessibility audit",
    "frequency": "Annual",
    "dueDates": "Annual safety audit"
  },
  {
    "dept": "operations",
    "sNo": 42,
    "description": "Electrical safety certification: annual electrical inspection",
    "frequency": "Annual",
    "dueDates": "Annual electrical inspector audit"
  },
  {
    "dept": "operations",
    "sNo": 43,
    "description": "On-site Emergency Response Plan (ERP): preparation & mock drills",
    "frequency": "Annual",
    "dueDates": "Annual ERP review + 2 mock drills/year"
  },
  {
    "dept": "operations",
    "sNo": 44,
    "description": "PPE issuance + register maintenance for all workers",
    "frequency": "Monthly",
    "dueDates": "Continuous; monthly audit"
  },
  {
    "dept": "operations",
    "sNo": 45,
    "description": "First-aid stations + trained First Aid personnel (1 per 150 workers)",
    "frequency": "Annual",
    "dueDates": "Maintained always; annual training refresh"
  },
  {
    "dept": "operations",
    "sNo": 46,
    "description": "Safety training records: induction + annual refresher for all workers",
    "frequency": "Annual",
    "dueDates": "Induction on joining; annual refresher"
  },
  {
    "dept": "operations",
    "sNo": 47,
    "description": "IBR: Indian Boiler Regulations: boiler inspection & certification (> 22.5L steam)",
    "frequency": "Annual",
    "dueDates": "Annual inspection by IBR-approved inspector"
  },
  {
    "dept": "operations",
    "sNo": 48,
    "description": "Pressure vessel inspection & registration",
    "frequency": "Annual",
    "dueDates": "Annual hydrostatic + ultrasonic test"
  },
  {
    "dept": "operations",
    "sNo": 49,
    "description": "DG (Diesel Generator) Set: CPCB emission norms + noise limit compliance",
    "frequency": "Annual",
    "dueDates": "Annual emission test; one-time acoustic enclosure cert"
  },
  {
    "dept": "operations",
    "sNo": 50,
    "description": "Air compressor inspection (Static & Mobile Pressure Vessels Rules)",
    "frequency": "Annual",
    "dueDates": "Annual statutory inspection"
  },
  {
    "dept": "operations",
    "sNo": 51,
    "description": "KSPCB Consent for Establishment (CFE): Karnataka State Pollution Control Board",
    "frequency": "Event-based",
    "dueDates": "Before commissioning new units"
  },
  {
    "dept": "operations",
    "sNo": 52,
    "description": "KSPCB Consent for Operation (CFO): Karnataka, renewal cycle",
    "frequency": "Annual",
    "dueDates": "Per CFO expiry date"
  },
  {
    "dept": "operations",
    "sNo": 53,
    "description": "IS 17899T:2022: Biodegradable plastic certification (ambient conditions, separate from IS 17088)",
    "frequency": "Event-based",
    "dueDates": "Per CPCB certification cycle"
  },
  {
    "dept": "operations",
    "sNo": 54,
    "description": "MSDS / SDS maintenance for all chemicals, adhesives, coatings, inks, solvents",
    "frequency": "Annual",
    "dueDates": "Updated every 3-5 yrs or on formula change"
  },
  {
    "dept": "sales",
    "sNo": 6,
    "description": "Vendor registration KYC pack to customers (PAN, GST, audited financials, MSME cert)",
    "frequency": "Event-based",
    "dueDates": "Before first PO"
  },
  {
    "dept": "sales",
    "sNo": 7,
    "description": "Customer audit checklist responses (e.g. retail, FMCG, e-commerce audits)",
    "frequency": "Event-based",
    "dueDates": "Per customer audit schedule"
  },
  {
    "dept": "sales",
    "sNo": 8,
    "description": "Customer-specific compliance certifications (SEDEX, BSCI, ISO 9001/14001 if required)",
    "frequency": "Annual",
    "dueDates": "Per certification renewal cycle"
  },
  {
    "dept": "operations",
    "sNo": 55,
    "description": "Product Specification Sheet (PSS / TDS) for each SKU",
    "frequency": "Event-based",
    "dueDates": "On product launch + on any change"
  },
  {
    "dept": "operations",
    "sNo": 56,
    "description": "Test certificates pack to customers (CPCB cert, IS 17088, FSSAI, NABL test reports)",
    "frequency": "Event-based",
    "dueDates": "Per customer onboarding + cert refresh"
  },
  {
    "dept": "operations",
    "sNo": 57,
    "description": "Traceability documents: raw material → finished product per batch",
    "frequency": "Event-based",
    "dueDates": "Continuous batch records"
  },
  {
    "dept": "marketing",
    "sNo": 13,
    "description": "ESG / Sustainability declarations to customers (carbon, water, recycled content)",
    "frequency": "Annual",
    "dueDates": "Annual disclosure per customer"
  },
  {
    "dept": "marketing",
    "sNo": 14,
    "description": "Packaging safety declarations to customers (food-contact, migration, no PFAS)",
    "frequency": "Event-based",
    "dueDates": "On customer onboarding + product launch"
  },
  {
    "dept": "legal",
    "sNo": 7,
    "description": "NDA execution tracking: log per customer / vendor engagement",
    "frequency": "Event-based",
    "dueDates": "Before any info sharing; tracked in NDA log"
  }
];

// Priority map — mirrors STATIC_PRIORITIES in index.html
// very-important = Critical (30d fallback), important = High (Apr 30),
// medium = Medium (May 30), not-important = Low (Jun 29)
export const STATIC_PRIORITIES = {
  'cs-1':'important','cs-2':'important','cs-3':'important','cs-4':'important',
  'cs-5':'medium','cs-6':'medium','cs-7':'important','cs-8':'medium',
  'cs-9':'important','cs-10':'medium','cs-11':'not-important','cs-12':'medium','cs-13':'not-important',
  'legal-1':'important','legal-2':'medium','legal-3':'very-important',
  'legal-4':'medium','legal-5':'medium','legal-6':'not-important','legal-7':'not-important',
  'hr-1':'very-important','hr-2':'very-important','hr-3':'important','hr-4':'not-important',
  'hr-5':'important','hr-6':'important','hr-7':'important','hr-8':'very-important',
  'hr-9':'important','hr-10':'medium','hr-11':'important','hr-12':'very-important',
  'hr-13':'medium','hr-14':'not-important',
  'finance-1':'very-important','finance-2':'very-important','finance-3':'important',
  'finance-4':'very-important','finance-5':'important','finance-6':'medium',
  'finance-7':'important','finance-8':'important','finance-9':'important',
  'finance-10':'very-important','finance-11':'very-important','finance-12':'important',
  'finance-13':'important','finance-14':'medium','finance-15':'medium',
  'finance-16':'not-important','finance-17':'not-important','finance-18':'important',
  'marketing-1':'very-important','marketing-2':'very-important','marketing-3':'important',
  'marketing-4':'important','marketing-5':'medium','marketing-6':'medium',
  'marketing-7':'not-important','marketing-8':'not-important','marketing-9':'very-important',
  'marketing-10':'very-important','marketing-11':'important','marketing-12':'important',
  'marketing-13':'important','marketing-14':'very-important',
  'operations-1':'very-important','operations-2':'very-important','operations-3':'very-important',
  'operations-4':'important','operations-5':'important','operations-6':'very-important',
  'operations-7':'very-important','operations-8':'important','operations-9':'important',
  'operations-10':'medium','operations-11':'medium','operations-12':'very-important',
  'operations-13':'very-important','operations-14':'very-important','operations-15':'very-important',
  'operations-16':'very-important','operations-17':'very-important','operations-18':'important',
  'operations-19':'very-important','operations-20':'very-important','operations-21':'important',
  'operations-22':'important','operations-23':'very-important','operations-24':'very-important',
  'operations-25':'very-important','operations-26':'important','operations-27':'important',
  'operations-28':'very-important','operations-29':'medium','operations-30':'very-important',
  'operations-31':'very-important','operations-32':'very-important','operations-33':'very-important',
  'operations-34':'very-important','operations-35':'very-important','operations-36':'very-important',
  'operations-37':'important','operations-38':'important','operations-39':'important',
  'operations-40':'important','operations-41':'medium','operations-42':'important',
  'operations-43':'important','operations-44':'medium','operations-45':'medium',
  'operations-46':'medium','operations-47':'important','operations-48':'important',
  'operations-49':'important','operations-50':'medium','operations-51':'very-important',
  'operations-52':'very-important','operations-53':'important','operations-54':'important',
  'operations-55':'medium','operations-56':'important','operations-57':'medium',
  'supply-1':'very-important','supply-2':'very-important','supply-3':'very-important',
  'supply-4':'medium','supply-5':'important','supply-6':'not-important',
  'supply-7':'not-important','supply-8':'not-important','supply-9':'very-important',
  'supply-10':'medium','supply-11':'important','supply-12':'very-important',
  'supply-13':'very-important','supply-14':'important','supply-15':'important',
  'supply-16':'medium','supply-17':'important','supply-18':'very-important',
  'design-1':'medium','design-2':'medium','design-3':'not-important','design-4':'important',
  'rnd-1':'medium','rnd-2':'important','rnd-3':'important','rnd-4':'medium',
  'rnd-5':'not-important','rnd-6':'important',
  'sales-1':'very-important','sales-2':'very-important','sales-3':'important',
  'sales-4':'medium','sales-5':'medium','sales-6':'medium','sales-7':'medium','sales-8':'medium',
};
