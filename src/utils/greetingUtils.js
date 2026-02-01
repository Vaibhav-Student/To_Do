// Greeting utility functions for the Todo app

/**
 * Get greeting based on time of day
 * Returns object with text, emoji, and period
 */
export const getGreeting = (currentTime = new Date()) => {
    const hour = currentTime.getHours();
    if (hour >= 5 && hour < 12) {
        return { text: 'Good Morning', emoji: '🌅', period: 'morning' };
    } else if (hour >= 12 && hour < 17) {
        return { text: 'Good Afternoon', emoji: '☀️', period: 'afternoon' };
    } else if (hour >= 17 && hour < 21) {
        return { text: 'Good Evening', emoji: '🌆', period: 'evening' };
    } else {
        return { text: 'Good Night', emoji: '🌙', period: 'night' };
    }
};

/**
 * Get motivational message based on time of day
 * Uses the day of month to pick a consistent message for the day
 */
export const getMotivationalMessage = (currentTime = new Date()) => {
    const messages = {
        morning: [
            "Let's make today productive! 💪",
            "A fresh start awaits you! ✨",
            "Ready to conquer your tasks? 🚀"
        ],
        afternoon: [
            "Keep up the great momentum! 🔥",
            "You're doing amazing! ⭐",
            "Stay focused, you got this! 💫"
        ],
        evening: [
            "Let's wrap up those tasks! 🎯",
            "Finish strong today! 💪",
            "Every task completed counts! ✅"
        ],
        night: [
            "Planning for tomorrow? 📝",
            "Rest well, achieve more! 🌟",
            "Great things await tomorrow! ✨"
        ]
    };

    const period = getGreeting(currentTime).period;
    const periodMessages = messages[period];
    // Use the day of the month to pick a consistent message for the day
    const index = currentTime.getDate() % periodMessages.length;
    return periodMessages[index];
};
