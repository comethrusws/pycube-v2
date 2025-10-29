export const getAIAssistantPrompts = (pathname: string): string[] => {
  if (pathname.includes("/asset-utilization")) {
    return [
      "What is the average utilization rate across all assets?",
      "Which assets are most underutilized this week?",
      "Suggest reallocations for underutilized equipment.",
      "Show me the utilization trends for infusion pumps over the last 90 days.",
    ];
  }

  if (pathname.includes("/preventative-maintenance")) {
    return [
      "Which assets are due for maintenance in the next 30 days?",
      "What is the current status of maintenance requests?",
      "Show me the maintenance history for all ventilators.",
      "What are the predicted failure rates for our most critical assets?",
    ];
  }

  if (pathname.includes("/compliance")) {
    return [
      "Which assets are currently out of compliance?",
      "Generate a compliance report for the last quarter.",
      "What are the most common reasons for compliance failures?",
      "Show me the compliance status of all assets in the ICU.",
    ];
  }

  // Default prompts
  return [
    "Which assets are underutilized today?",
    "Recommend asset reallocations across departments",
    "Show equipment that can be transferred to ICU",
    "List assets nearing maintenance schedules",
  ];
};
