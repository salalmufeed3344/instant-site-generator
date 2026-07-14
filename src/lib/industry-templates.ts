export type IndustryTemplate = {
  key: string;
  name: string;
  description: string;
  icon: string;
  departments: { name: string; description: string }[];
};

export const INDUSTRY_TEMPLATES: IndustryTemplate[] = [
  {
    key: "software",
    name: "Software Company",
    description: "Product, engineering, and go-to-market teams.",
    icon: "💻",
    departments: [
      { name: "Engineering", description: "Builds and maintains the product." },
      { name: "Product", description: "Owns roadmap and specifications." },
      { name: "HR", description: "People operations and hiring." },
      { name: "Sales", description: "Pipeline, deals, and revenue." },
      { name: "Marketing", description: "Positioning, content, and demand." },
      { name: "Support", description: "Customer success and helpdesk." },
      { name: "Finance", description: "Accounting, billing, and planning." },
    ],
  },
  {
    key: "marketing-agency",
    name: "Marketing Agency",
    description: "Client-facing creative and performance teams.",
    icon: "📣",
    departments: [
      { name: "Client Services", description: "Account management." },
      { name: "Creative", description: "Design and copy." },
      { name: "Media Buying", description: "Paid ads and analytics." },
      { name: "Content", description: "Editorial and production." },
      { name: "Finance", description: "Invoicing and reporting." },
    ],
  },
  {
    key: "law-firm",
    name: "Law Firm",
    description: "Legal practice and case operations.",
    icon: "⚖️",
    departments: [
      { name: "Litigation", description: "Court and dispute matters." },
      { name: "Corporate", description: "Contracts and transactions." },
      { name: "Paralegals", description: "Case preparation." },
      { name: "Billing", description: "Time entry and invoicing." },
      { name: "HR", description: "Recruitment and staffing." },
    ],
  },
  {
    key: "restaurant",
    name: "Restaurant",
    description: "Kitchen, front-of-house, and back-office.",
    icon: "🍽️",
    departments: [
      { name: "Kitchen", description: "Food preparation and menu." },
      { name: "Inventory", description: "Stock and suppliers." },
      { name: "Management", description: "Operations and scheduling." },
      { name: "Customer Service", description: "Guest experience." },
      { name: "Finance", description: "Cash, sales, and accounting." },
    ],
  },
  {
    key: "retail",
    name: "Retail Store",
    description: "Storefront, merchandising, and supply chain.",
    icon: "🛍️",
    departments: [
      { name: "Store Operations", description: "Daily store running." },
      { name: "Merchandising", description: "Product mix and displays." },
      { name: "Inventory", description: "Stock and warehouse." },
      { name: "Customer Service", description: "Returns and support." },
      { name: "Finance", description: "POS and accounting." },
    ],
  },
  {
    key: "hospital",
    name: "Hospital",
    description: "Clinical and administrative departments.",
    icon: "🏥",
    departments: [
      { name: "Clinical Care", description: "Physicians and nurses." },
      { name: "Nursing", description: "Ward and bedside care." },
      { name: "Admin", description: "Patient records and billing." },
      { name: "Pharmacy", description: "Medication management." },
      { name: "HR", description: "Staffing and compliance." },
    ],
  },
  {
    key: "school",
    name: "School",
    description: "Academics, administration, and student services.",
    icon: "🎓",
    departments: [
      { name: "Academics", description: "Teachers and curriculum." },
      { name: "Admissions", description: "Applications and enrollment." },
      { name: "Administration", description: "Principal's office." },
      { name: "Student Services", description: "Counseling and support." },
      { name: "Finance", description: "Fees and payroll." },
    ],
  },
  {
    key: "gym",
    name: "Gym",
    description: "Training, memberships, and facility operations.",
    icon: "🏋️",
    departments: [
      { name: "Training", description: "Coaches and programming." },
      { name: "Membership", description: "Sign-ups and retention." },
      { name: "Facilities", description: "Equipment and maintenance." },
      { name: "Marketing", description: "Promotion and events." },
      { name: "Finance", description: "Billing and reporting." },
    ],
  },
  {
    key: "construction",
    name: "Construction Company",
    description: "Field, procurement, and project delivery.",
    icon: "🏗️",
    departments: [
      { name: "Field Operations", description: "Crews and site work." },
      { name: "Project Management", description: "Schedules and delivery." },
      { name: "Procurement", description: "Materials and suppliers." },
      { name: "Safety", description: "Compliance and incidents." },
      { name: "Finance", description: "Contracts and invoicing." },
    ],
  },
  {
    key: "consultancy",
    name: "Consultancy",
    description: "Advisory practice with delivery teams.",
    icon: "📊",
    departments: [
      { name: "Advisory", description: "Client-facing consultants." },
      { name: "Research", description: "Analysis and insights." },
      { name: "Delivery", description: "Project execution." },
      { name: "Business Development", description: "New engagements." },
      { name: "Finance", description: "Billing and utilization." },
    ],
  },
];

export const INTERVIEW_QUESTIONS: { key: string; question: string; placeholder?: string }[] = [
  { key: "company_description", question: "Describe your company in a few sentences.", placeholder: "What do you do, and for whom?" },
  { key: "products", question: "What products do you offer?" },
  { key: "services", question: "What services do you provide?" },
  { key: "departments", question: "What are your main departments or teams?" },
  { key: "approval_process", question: "How does your approval process work?" },
  { key: "support_process", question: "How does your customer support process work?" },
  { key: "leave_policy", question: "What is your leave / time-off policy?" },
  { key: "expense_approvals", question: "How are expense approvals handled?" },
  { key: "hiring_process", question: "Describe your hiring process." },
  { key: "sales_process", question: "Describe your sales process." },
  { key: "business_hours", question: "What are your business hours?" },
  { key: "remote_policy", question: "What is your remote work policy?" },
  { key: "mission", question: "What is your company mission?" },
  { key: "vision", question: "What is your company vision?" },
  { key: "values", question: "What are your core values?" },
];
