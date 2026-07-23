export const DASHBOARD_SECTIONS = ["tiles", "categoryChart", "toPay"] as const;
export type DashboardSectionId = (typeof DASHBOARD_SECTIONS)[number];

export const DASHBOARD_SECTION_ORDER_KEY = "dashboard_section_order";
