/**
 * Format a date string to a human-readable format
 * @param dateString - ISO date string
 * @returns Formatted date string (e.g., "Jan 1, 2023")
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

/**
 * Format a date and time string to a human-readable format
 * @param dateString - ISO date string
 * @returns Formatted date and time string (e.g., "Jan 1, 2023, 3:30 PM")
 */
export const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  });
};

/**
 * Get display name from full name
 * If the first name is just an initial (single letter), show the full name
 * Otherwise, show just the first name
 * @param fullName - Full name of the user
 * @returns Display name
 */
export const getDisplayName = (fullName: string): string => {
  if (!fullName) return '';
  
  const nameParts = fullName.trim().split(' ');
  const firstName = nameParts[0];
  
  // If the first name is just a single letter (initial), show the full name
  if (firstName.length === 1 && nameParts.length > 1) {
    return fullName;
  }
  
  // Otherwise, just show the first name
  return firstName;
}; 