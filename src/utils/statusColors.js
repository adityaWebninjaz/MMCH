export const getStatusUnderReviewComplaintsColor = (status = '') => {
  switch (status.toLowerCase()) {
    case 'message-sent':
      return { backgroundColor: '#FDF2F8', color: '#BE185D' };
    case 'pending':
      return { backgroundColor: '#FEF9C3', color: '#CA8A04' };
    case 'rejected':
      return { backgroundColor: '#FEE2E2', color: '#DC2626' };
    case 'resolved':
      return { backgroundColor: '#DCFCE7', color: '#16A34A' };
    case 'in progress':
      return { backgroundColor: '#EDE9FE', color: '#7C3AED' };
    case 'reopen':
      return { backgroundColor: '#FEF3C7', color: '#D97706' };
    default:
      return { backgroundColor: '#F3F4F6', color: '#4B5563' };
  }
};
