import { UserProfile, TopicProgress } from '../types';

const USER_PROFILE_KEY = 'ncea-ace-user-profile';

/**
 * Retrieves the user's learning profile from local storage.
 * @returns The user profile object, or an empty object if none exists.
 */
export function getUserProfile(): UserProfile {
  try {
    const profileJson = localStorage.getItem(USER_PROFILE_KEY);
    return profileJson ? JSON.parse(profileJson) : {};
  } catch (error) {
    console.error("Failed to parse user profile from localStorage", error);
    return {};
  }
}

/**
 * Saves the entire user profile to local storage.
 * @param profile - The user profile object to save.
 */
function saveUserProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profile));
  } catch (error) {
    console.error("Failed to save user profile to localStorage", error);
  }
}

/**
 * Updates the user's progress for a specific topic after a session.
 * @param topicId - The ID of the topic that was completed.
 * @param summary - The performance summary from the session.
 */
export function updateProfileAfterSession(
  topicId: string,
  summary: { proficiency: number; areasForImprovement: string[] }
): void {
  const profile = getUserProfile();
  const currentProgress = profile[topicId] || {
    topicId,
    proficiency: 0,
    areasForImprovement: [],
    history: [],
  };

  // Use a moving average for proficiency to make it more stable
  const newProficiency = (currentProgress.proficiency * currentProgress.history.length + summary.proficiency) / (currentProgress.history.length + 1);

  const updatedProgress: TopicProgress = {
    ...currentProgress,
    proficiency: Math.max(0, Math.min(1, newProficiency)), // Clamp between 0 and 1
    // Overwrite with the latest areas for improvement
    areasForImprovement: summary.areasForImprovement,
    history: [
      ...currentProgress.history,
      {
        date: new Date().toISOString(),
        score: summary.proficiency,
      },
    ],
  };

  profile[topicId] = updatedProgress;
  saveUserProfile(profile);
}
