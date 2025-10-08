# 이미지 관리 가이드

집안일매니저의 모든 이미지 및 아이콘 리소스를 관리하는 방법을 설명합니다.

## 📁 파일 구조

```
Housework_0930/
├── images.js          # 이미지 관리 중앙 파일
├── index.html         # 메인 HTML 파일
└── IMAGE_MANAGEMENT.md # 이 문서
```

## 🎨 이미지 관리 시스템

### 개요
모든 SVG 아이콘과 이미지는 `images.js` 파일에서 중앙 관리됩니다.
- 코드 재사용성 향상
- 유지보수 용이성
- 일관된 디자인 적용

### images.js 구조

```javascript
const AppImages = {
    // 로그인 아이콘
    google: '...',     // Google 로고 SVG
    apple: '...',      // Apple 로고 SVG
    
    // 기능 아이콘
    features: {
        schedule: '...', // 주기별 할일 아이콘
        family: '...',   // 가사 분담 아이콘
        reward: '...',   // 보상 시스템 아이콘
        alarm: '...'     // 알람 기능 아이콘
    },
    
    // 이모지
    emoji: {
        home: '🏠',
        calendar: '📋',
        // ...
    }
};
```

## 🔧 사용 방법

### 1. 아이콘 가져오기

```javascript
// 단일 아이콘
const googleIcon = getIcon('google');

// 카테고리의 특정 아이콘
const scheduleIcon = getIcon('features', 'schedule');

// 이모지
const homeEmoji = getEmoji('home');
```

### 2. HTML에 삽입

```html
<!-- 방법 1: JavaScript로 직접 삽입 -->
<span id="googleIcon"></span>
<script>
    document.getElementById('googleIcon').innerHTML = getIcon('google');
</script>

<!-- 방법 2: 초기화 함수에서 일괄 처리 -->
<script>
    function loadImages() {
        document.getElementById('googleIcon').innerHTML = getIcon('google');
        document.getElementById('appleIcon').innerHTML = getIcon('apple');
    }
</script>
```

### 3. 현재 사용 중인 아이콘

#### 로그인 버튼
- **Google 로고**: `getIcon('google')`
- **Apple 로고**: `getIcon('apple')`

#### 기능 소개 (랜딩페이지)
- **주기별 할일**: `getIcon('features', 'schedule')` - 달력 아이콘
- **가사 분담**: `getIcon('features', 'family')` - 사용자 그룹 아이콘
- **보상 시스템**: `getIcon('features', 'reward')` - 레이어 아이콘
- **알람 기능**: `getIcon('features', 'alarm')` - 시계 아이콘

#### 이모지 사용
- **앱 로고**: `getEmoji('home')` - 🏠
- **체크마크**: `getEmoji('checkmark')` - ✓
- **모래시계**: `getEmoji('hourglass')` - ⏳

## ➕ 새 아이콘 추가하기

### SVG 아이콘 추가

1. **images.js 파일 열기**
2. **AppImages 객체에 추가**:

```javascript
const AppImages = {
    // 기존 아이콘들...
    
    // 새 아이콘 추가
    newIcon: `
        <svg viewBox="0 0 24 24" width="24" height="24">
            <!-- SVG 경로 -->
        </svg>
    `,
    
    // 또는 카테고리에 추가
    features: {
        schedule: '...',
        newFeature: `
            <svg viewBox="0 0 24 24" width="48" height="48">
                <!-- SVG 경로 -->
            </svg>
        `
    }
};
```

3. **HTML에서 사용**:

```javascript
document.getElementById('myIcon').innerHTML = getIcon('newIcon');
// 또는
document.getElementById('myFeatureIcon').innerHTML = getIcon('features', 'newFeature');
```

### 이모지 추가

```javascript
const AppImages = {
    // ...
    emoji: {
        home: '🏠',
        newEmoji: '🎉'  // 새 이모지 추가
    }
};
```

## 🎯 모범 사례

### 1. SVG 최적화
- 불필요한 메타데이터 제거
- 경로 단순화
- viewBox 설정 확인

```svg
<!-- 좋은 예 -->
<svg viewBox="0 0 24 24" width="24" height="24">
    <path d="M12 2L2 7l10 5 10-5-10-5z"/>
</svg>

<!-- 나쁜 예 (불필요한 속성) -->
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="..." version="1.1" ...>
    <g id="layer1" transform="...">
        <path d="..."/>
    </g>
</svg>
```

### 2. 일관된 크기 사용
- 로그인 버튼 아이콘: 20x20px
- 기능 아이콘: 40x40px 또는 48x48px
- 큰 아이콘: 64x64px 이상

### 3. 색상 관리
- `currentColor` 사용으로 CSS에서 색상 제어 가능
- `stroke` 또는 `fill` 속성 활용

```javascript
// CSS에서 색상 제어 가능
features: {
    schedule: `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <rect x="3" y="4" width="18" height="18"/>
        </svg>
    `
}
```

### 4. 접근성
- 의미 있는 아이콘에는 aria-label 추가
- 장식용 아이콘은 aria-hidden="true"

```html
<span id="googleIcon" aria-label="Google 로그인"></span>
<span id="decorativeIcon" aria-hidden="true"></span>
```

## 🔄 아이콘 변경하기

### 기존 아이콘 교체

1. **images.js에서 해당 아이콘 찾기**
2. **SVG 코드 교체**:

```javascript
// 변경 전
google: `<svg>...</svg>`,

// 변경 후
google: `<svg viewBox="0 0 24 24">
    <!-- 새로운 SVG 경로 -->
</svg>`,
```

3. **페이지 새로고침으로 확인**

### 아이콘 제거

```javascript
// 1. images.js에서 해당 항목 삭제
// 2. HTML에서 사용하는 곳 찾아 제거
// 3. loadImages() 함수에서 호출 제거
```

## 📊 아이콘 출처 및 라이선스

### 현재 사용 중인 아이콘
- **Google 로고**: Google Brand Guidelines
- **Apple 로고**: Apple Design Resources
- **기능 아이콘**: Feather Icons (MIT License)

### 추가 아이콘 리소스
- [Feather Icons](https://feathericons.com/) - MIT License
- [Heroicons](https://heroicons.com/) - MIT License
- [Lucide](https://lucide.dev/) - ISC License
- [Material Icons](https://material.io/icons/) - Apache License 2.0

## 🐛 문제 해결

### 아이콘이 표시되지 않을 때

1. **images.js 로드 확인**:
```html
<script src="images.js"></script>
```

2. **브라우저 콘솔 확인**:
```javascript
console.log(AppImages); // 아이콘 객체 출력
console.log(getIcon('google')); // 특정 아이콘 확인
```

3. **HTML 요소 ID 확인**:
```javascript
const element = document.getElementById('googleIcon');
console.log(element); // null이 아닌지 확인
```

### SVG 스타일이 적용되지 않을 때

```css
/* CSS에서 SVG 스타일 제어 */
.feature-icon svg {
    width: 48px;
    height: 48px;
    color: #2563EB;
}
```

## 📝 체크리스트

새 아이콘 추가 시 확인사항:
- [ ] images.js에 아이콘 추가
- [ ] HTML에 표시할 요소 추가
- [ ] loadImages() 함수에 로드 코드 추가
- [ ] CSS 스타일 적용
- [ ] 브라우저에서 테스트
- [ ] 반응형 디자인 확인

---

© 2024 집안일매니저 - 이미지 관리 시스템


