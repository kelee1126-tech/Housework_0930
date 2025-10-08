/**
 * 집안일매니저 이미지 및 아이콘 관리 파일
 * SVG 아이콘과 이미지 리소스를 중앙 관리합니다.
 */

const AppImages = {
    // Google 로고 SVG
    google: `
        <svg class="btn-icon" viewBox="0 0 24 24" width="20" height="20">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
    `,

    // Apple 로고 SVG
    apple: `
        <svg class="btn-icon" viewBox="0 0 24 24" width="20" height="20">
            <path fill="#000" d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.11-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
        </svg>
    `,

    // 기능 아이콘들
    features: {
        // 주기별 할일 (달력 아이콘)
        schedule: `
            <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
        `,

        // 가사 분담 (사용자 그룹 아이콘)
        family: `
            <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
        `,

        // 보상 시스템 (레이어 아이콘)
        reward: `
            <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                <path d="M2 17l10 5 10-5"/>
                <path d="M2 12l10 5 10-5"/>
            </svg>
        `,

        // 알람 기능 (시계 아이콘)
        alarm: `
            <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
            </svg>
        `
    },

    // 앱 아이콘/로고
    appIcon: '🏠',

    // 기타 이모지 아이콘
    emoji: {
        home: '🏠',
        calendar: '📋',
        family: '👨‍👩‍👧‍👦',
        shell: '🐚',
        add: '➕',
        template: '📋',
        invite: '📱',
        bell: '🔔',
        key: '🔑',
        edit: '📝',
        checkmark: '✓',
        hourglass: '⏳'
    }
};

/**
 * 아이콘을 HTML 문자열로 반환
 * @param {string} category - 아이콘 카테고리 (google, apple, features 등)
 * @param {string} name - 아이콘 이름 (선택사항, features 카테고리에서 사용)
 * @returns {string} SVG HTML 문자열
 */
function getIcon(category, name = null) {
    if (name) {
        return AppImages[category]?.[name] || '';
    }
    return AppImages[category] || '';
}

/**
 * 이모지 아이콘 반환
 * @param {string} name - 이모지 이름
 * @returns {string} 이모지 문자
 */
function getEmoji(name) {
    return AppImages.emoji[name] || '';
}

// 전역으로 내보내기 (브라우저 환경)
if (typeof window !== 'undefined') {
    window.AppImages = AppImages;
    window.getIcon = getIcon;
    window.getEmoji = getEmoji;
}

// 모듈로 내보내기 (Node.js 환경)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AppImages, getIcon, getEmoji };
}

