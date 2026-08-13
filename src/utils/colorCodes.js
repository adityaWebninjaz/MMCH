export const getStatusColors = (status = "") => {
  const STATUS_COLORS = {
    // Greens
    submitted: {
      background: "#DCFCE7",
      color: "#15803D",
      border: "#86EFAC",
    },

    success: {
      background: "#D1FAE5",
      color: "#047857",
      border: "#6EE7B7",
    },

    approved: {
      background: "#ECFCCB",
      color: "#4D7C0F",
      border: "#BEF264",
    },

    // Blues
    completed: {
      background: "#DBEAFE",
      color: "#1D4ED8",
      border: "#93C5FD",
    },

    "payment approval": {
      background: "#E0E7FF",
      color: "#4338CA",
      border: "#A5B4FC",
    },

    "pending approval": {
      background: "#E0F2FE",
      color: "#0369A1",
      border: "#7DD3FC",
    },

    // Yellow
    pending: {
      background: "#FEF3C7",
      color: "#B45309",
      border: "#FCD34D",
    },

    // Gray
    // draft: {
    //   background: "#F3F4F6",
    //   color: "#4B5563",
    //   border: "#D1D5DB",
    // },

    // Purple
    "not available": {
      background: "#F5F3FF",
      color: "#7C3AED",
      border: "#C4B5FD",
    },

    // Cyan
    incomplete: {
      background: "#CFFAFE",
      color: "#0E7490",
      border: "#67E8F9",
    },

    // Orange
    "skip payment": {
      background: "#FFF7ED",
      color: "#C2410C",
      border: "#FDBA74",
    },

    // Pink
    cancelled: {
      background: "#FCE7F3",
      color: "#BE185D",
      border: "#F9A8D4",
    },

    // Only Error Colors
    rejected: {
      background: "#FEE2E2",
      color: "#B91C1C",
      border: "#F87171",
    },

    failed: {
      background: "#FEE2E2",
      color: "#991B1B",
      border: "#EF4444",
    },

    draft: {
      background: "#FDF6EC",
      color: "#92400E",
      border: "#F6C98F",
    },

    documents: {
      background: "#FFF7ED",
      color: "#7A3D06",
      border: "#FDBA74",
    },

  };

  return (
    STATUS_COLORS[status.toLowerCase().trim()] || {
      background: "#F9FAFB",
      color: "#374151",
      border: "#E5E7EB",
    }
  );
};