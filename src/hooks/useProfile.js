import { useState, useCallback } from 'react';

/**
 * Default profile structure
 */
const defaultProfile = {
    name: '',
    email: '',
    bio: '',
    avatar: '👤',
    theme: 'dark',
    showGreeting: true
};

/**
 * Custom hook for user profile management
 * Handles profile state, editing, saving, and localStorage persistence
 */
export const useProfile = (showToast) => {
    // Load profile from localStorage
    const [userProfile, setUserProfile] = useState(() => {
        const savedProfile = localStorage.getItem('userProfile');
        return savedProfile ? JSON.parse(savedProfile) : defaultProfile;
    });

    // User name state (for backward compatibility)
    const [userName, setUserName] = useState(() => {
        return localStorage.getItem('userName') || '';
    });

    // Editing states
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [tempProfile, setTempProfile] = useState(userProfile);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    // Simple name editing states
    const [isEditingName, setIsEditingName] = useState(false);
    const [tempUserName, setTempUserName] = useState('');

    // Start editing profile
    const startEditingProfile = useCallback(() => {
        setTempProfile({ ...userProfile });
        setIsEditingProfile(true);
    }, [userProfile]);

    // Cancel editing profile
    const cancelEditingProfile = useCallback(() => {
        setTempProfile({ ...userProfile });
        setIsEditingProfile(false);
        setShowEmojiPicker(false);
    }, [userProfile]);

    // Save profile
    const saveProfile = useCallback(() => {
        // Save to state
        setUserProfile(tempProfile);
        // Save to localStorage
        localStorage.setItem('userProfile', JSON.stringify(tempProfile));
        // Update userName for backward compatibility
        setUserName(tempProfile.name);
        localStorage.setItem('userName', tempProfile.name);
        // Close editing mode
        setIsEditingProfile(false);
        setShowEmojiPicker(false);
        // Show success toast
        if (showToast) showToast('Profile updated successfully! ✅', 'success');
    }, [tempProfile, showToast]);

    // Reset profile
    const resetProfile = useCallback(() => {
        // Show confirmation dialog
        const confirmed = window.confirm(
            '⚠️ Are you sure you want to reset your profile?\n\n' +
            'This will reset:\n' +
            '• Your name to "User"\n' +
            '• Your avatar to default\n' +
            '• Your bio/status to empty\n\n' +
            'Your tasks, lists, and preferences will NOT be affected.\n\n' +
            'This action cannot be undone.'
        );

        if (!confirmed) return;

        // Create default profile preserving email, theme, and showGreeting
        const resetProfileData = {
            name: 'User',
            email: userProfile.email,
            bio: '',
            avatar: '👤',
            theme: userProfile.theme,
            showGreeting: userProfile.showGreeting
        };

        setTempProfile(resetProfileData);
        setUserProfile(resetProfileData);
        localStorage.setItem('userProfile', JSON.stringify(resetProfileData));
        setUserName('User');
        localStorage.setItem('userName', 'User');
        setIsEditingProfile(false);
        if (showToast) showToast('✔ Profile reset successfully', 'success');
    }, [userProfile, showToast]);

    // Save user name (simple mode)
    const saveUserName = useCallback(() => {
        const trimmedName = tempUserName.trim();
        if (trimmedName) {
            setUserName(trimmedName);
            localStorage.setItem('userName', trimmedName);
        }
        setIsEditingName(false);
    }, [tempUserName]);

    // Start editing name (simple mode)
    const startEditingName = useCallback(() => {
        setTempUserName(userName);
        setIsEditingName(true);
    }, [userName]);

    return {
        // Profile state
        userProfile,
        setUserProfile,
        userName,
        setUserName,

        // Editing state
        isEditingProfile,
        tempProfile,
        setTempProfile,
        showEmojiPicker,
        setShowEmojiPicker,

        // Simple name editing
        isEditingName,
        tempUserName,
        setTempUserName,

        // Actions
        startEditingProfile,
        cancelEditingProfile,
        saveProfile,
        resetProfile,
        saveUserName,
        startEditingName,
        setIsEditingName
    };
};

export default useProfile;
