# 집안일매니저 배포 가이드

이 문서는 집안일매니저를 실제 서버에 배포하는 방법을 설명합니다.

## 📋 배포 전 체크리스트

### 1. 필요한 파일 확인
```
Housework_0930/
├── index.html          ✅ 메인 HTML 파일
├── images.js           ✅ 이미지 관리 파일
├── code.gs             ✅ Google Apps Script (별도 배포)
└── README.md           📄 문서
```

### 2. Google Apps Script 배포 필수!
`code.gs` 파일을 Google Apps Script로 먼저 배포해야 합니다.

### 3. 배포 후 설정 변경 필요
- Google OAuth 클라이언트 ID의 승인된 JavaScript 원본
- `index.html`의 `GAS_WEB_APP_URL` 설정

---

## 🚀 배포 방법 (추천 순서)

## 방법 1: GitHub Pages (무료, 가장 쉬움) ⭐

### 장점
- ✅ 완전 무료
- ✅ HTTPS 자동 제공
- ✅ 배포 자동화
- ✅ 도메인 제공 (`username.github.io`)

### 단계별 가이드

#### 1단계: GitHub 저장소 설정
```bash
# 이미 GitHub 저장소가 있다면
git add .
git commit -m "집안일매니저 배포 준비"
git push origin main
```

#### 2단계: GitHub Pages 활성화
1. GitHub 저장소 페이지 접속
2. **Settings** 탭 클릭
3. 왼쪽 메뉴에서 **Pages** 클릭
4. **Source** 섹션:
   - Branch: `main` 선택
   - Folder: `/ (root)` 선택
5. **Save** 클릭
6. 5분 대기

#### 3단계: 배포된 URL 확인
```
https://[username].github.io/Housework_0930/index.html
```

#### 4단계: Google OAuth 설정 업데이트
1. Google Cloud Console 접속
2. OAuth 클라이언트 ID 편집
3. **승인된 JavaScript 원본** 추가:
   ```
   https://[username].github.io
   ```
4. 저장

#### 5단계: 접속 테스트
```
https://[username].github.io/Housework_0930/index.html
```

---

## 방법 2: Netlify (무료, 매우 쉬움) 🌟

### 장점
- ✅ 무료
- ✅ 드래그 앤 드롭 배포
- ✅ HTTPS 자동
- ✅ 커스텀 도메인 지원
- ✅ 자동 빌드 및 배포

### 단계별 가이드

#### 1단계: Netlify 가입
1. https://www.netlify.com/ 접속
2. **Sign up** (GitHub 계정으로 로그인 가능)

#### 2단계: 배포 방법 A - 드래그 앤 드롭

1. Netlify 대시보드에서 **Sites** 탭
2. 화면 하단의 **드래그 앤 드롭 영역**에 파일 드래그:
   ```
   index.html
   images.js
   (다른 필요한 파일들)
   ```
3. 자동 배포 시작!

#### 3단계: 배포 방법 B - GitHub 연동 (추천)

1. **Add new site** → **Import an existing project**
2. **GitHub** 선택
3. 저장소 선택: `Housework_0930`
4. Build settings:
   - Build command: (비워둠)
   - Publish directory: `.` (root)
5. **Deploy site** 클릭

#### 4단계: 배포 URL 확인
```
https://[random-name].netlify.app
```

#### 5단계: 커스텀 도메인 설정 (선택사항)
1. Site settings → **Domain management**
2. **Add custom domain**
3. 도메인 입력 및 DNS 설정

#### 6단계: Google OAuth 설정
```
승인된 JavaScript 원본:
https://[your-site].netlify.app
```

---

## 방법 3: Vercel (무료, Next.js 최적화) 🚀

### 장점
- ✅ 무료
- ✅ 매우 빠른 배포
- ✅ GitHub 자동 연동
- ✅ HTTPS 자동

### 단계별 가이드

#### 1단계: Vercel 가입
1. https://vercel.com/ 접속
2. GitHub 계정으로 로그인

#### 2단계: 프로젝트 가져오기
1. **Add New** → **Project**
2. GitHub 저장소 선택
3. **Import** 클릭
4. Framework Preset: **Other** 선택
5. **Deploy** 클릭

#### 3단계: 배포 URL 확인
```
https://[project-name].vercel.app
```

#### 4단계: Google OAuth 설정
```
승인된 JavaScript 원본:
https://[project-name].vercel.app
```

---

## 방법 4: Google Apps Script Web App (서버리스)

### 장점
- ✅ 완전 무료
- ✅ Google 생태계 통합
- ✅ 서버 관리 불필요

### 단계별 가이드

#### 1단계: Google Apps Script 파일 생성
1. https://script.google.com/ 접속
2. **새 프로젝트**
3. `code.gs` 내용 복사 붙여넣기

#### 2단계: HTML 파일 추가
1. **파일** → **HTML** → 이름: `index`
2. `index.html` 내용 복사 붙여넣기
3. `images.js` 내용도 별도 HTML 파일로 추가

#### 3단계: 배포
1. **배포** → **새 배포**
2. 유형: **웹 앱**
3. 설정:
   - 실행 계정: **나**
   - 액세스 권한: **모든 사용자**
4. **배포** 클릭

#### 4단계: 웹앱 URL 복사
```
https://script.google.com/macros/s/[SCRIPT_ID]/exec
```

#### 5단계: 이 URL을 index.html의 GAS_WEB_APP_URL에 설정

---

## 🔧 배포 후 설정 (중요!)

### 1. Google Apps Script 배포

#### code.gs 배포하기
```
1. script.google.com 접속
2. 새 프로젝트 생성
3. code.gs 내용 복사
4. 배포 → 새 배포 → 웹앱
5. 실행 계정: 나
6. 액세스: 모든 사용자
7. 배포 URL 복사
```

#### 중요: 스프레드시트 ID 설정
`code.gs` 파일의 7번째 줄:
```javascript
const SPREADSHEET_ID = '1lXY4KHdoRgydOs8xAnOeoD196NZQxGnGt4epnxLe2oo';
```
이 ID를 본인의 Google Sheets ID로 변경!

### 2. index.html 설정 업데이트

#### GAS_WEB_APP_URL 설정 (1001번째 줄 근처)
```javascript
// 변경 전
const GAS_WEB_APP_URL = 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec';

// 변경 후
const GAS_WEB_APP_URL = 'https://script.google.com/macros/s/[실제_배포_ID]/exec';
```

### 3. Google OAuth 클라이언트 ID 설정

#### 승인된 JavaScript 원본 추가
```
로컬 개발:
http://localhost:8000

프로덕션:
https://yourusername.github.io
https://your-site.netlify.app
https://your-project.vercel.app
```

#### 승인된 리디렉션 URI (필요시)
대부분 필요 없지만, 오류 발생 시 추가:
```
https://yourusername.github.io/Housework_0930/
https://your-site.netlify.app/
```

---

## 📦 배포 파일 준비

### 최소 필요 파일
```
index.html    - 메인 HTML 파일
images.js     - 이미지 관리 파일
```

### 선택적 파일
```
README.md                       - 프로젝트 문서
.gitignore                      - Git 무시 파일
DEPLOYMENT_GUIDE.md             - 이 문서
GOOGLE_LOGIN_SETUP.md           - OAuth 설정 가이드
GOOGLE_LOGIN_TROUBLESHOOTING.md - 문제 해결 가이드
```

### 불필요한 파일 (배포 제외)
```
code.gs       - Google Apps Script로 별도 배포
.cursorrules  - 개발 설정 파일
node_modules/ - (만약 있다면)
```

---

## 🔒 보안 설정

### 1. API 키 관리
```javascript
// ⚠️ 주의: 클라이언트 ID는 공개되어도 안전
const GOOGLE_CLIENT_ID = '376793805883-8ub45glt9dd098ggkl3uhqjc14gn60k2.apps.googleusercontent.com';

// ❌ 절대 공개하지 말 것 (우리는 사용하지 않음)
// const CLIENT_SECRET = 'xxxx'; 
```

### 2. CORS 설정 (Google Apps Script)
```javascript
// code.gs에 이미 포함됨
function doGet(e) {
    return HtmlService.createFileFromTemplate('index')
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
```

### 3. HTTPS 필수
- 로컬 개발: `http://` 허용
- 프로덕션: `https://` 필수

---

## 🧪 배포 테스트

### 체크리스트
- [ ] 배포 URL에 접속 가능
- [ ] HTTPS 적용 확인
- [ ] Google 로그인 작동
- [ ] 할 일 추가/수정/삭제 작동
- [ ] 모바일에서 테스트
- [ ] 다른 브라우저에서 테스트

### 테스트 시나리오
```
1. 랜딩페이지 로드 확인
2. "Google로 계속하기" 클릭
3. Google 계정 선택 및 로그인
4. 메인 앱 화면 표시 확인
5. 할 일 추가 테스트
6. 로그아웃 테스트
7. 재로그인 테스트
```

---

## 🐛 배포 후 문제 해결

### 오류 1: "Failed to load resource: net::ERR_BLOCKED_BY_CLIENT"
**원인**: 광고 차단기
**해결**: 광고 차단기 비활성화 또는 사이트 허용

### 오류 2: "Mixed Content" 경고
**원인**: HTTPS 페이지에서 HTTP 리소스 로드
**해결**: 모든 리소스를 HTTPS로 변경

### 오류 3: CORS 오류
**원인**: Google Apps Script CORS 설정
**해결**: code.gs의 doPost 함수 확인

### 오류 4: 404 Not Found
**원인**: 파일 경로 오류
**해결**: 
```javascript
// 절대 경로 대신 상대 경로 사용
<script src="/images.js"></script>  // ❌
<script src="./images.js"></script> // ✅
<script src="images.js"></script>   // ✅
```

---

## 📊 배포 비교표

| 서비스 | 가격 | 난이도 | HTTPS | 속도 | 추천 |
|--------|------|--------|-------|------|------|
| GitHub Pages | 무료 | ⭐ 쉬움 | ✅ | 🚀 빠름 | ⭐⭐⭐⭐⭐ |
| Netlify | 무료 | ⭐ 쉬움 | ✅ | 🚀🚀 매우 빠름 | ⭐⭐⭐⭐⭐ |
| Vercel | 무료 | ⭐ 쉬움 | ✅ | 🚀🚀 매우 빠름 | ⭐⭐⭐⭐ |
| GAS Web App | 무료 | ⭐⭐ 중간 | ✅ | 🚀 빠름 | ⭐⭐⭐ |

---

## 🎯 추천 배포 전략

### 개인/소규모 사용
→ **GitHub Pages** 또는 **Netlify**

### 팀 사용
→ **Netlify** (자동 배포, 팀 협업)

### 빠른 프로토타입
→ **Netlify** (드래그 앤 드롭)

### Google 생태계 통합
→ **Google Apps Script Web App**

---

## 📞 배포 지원

### 필요한 정보
1. 배포한 URL
2. 브라우저 콘솔 오류
3. Google Cloud Console 설정 스크린샷

### 유용한 리소스
- GitHub Pages: https://pages.github.com/
- Netlify Docs: https://docs.netlify.com/
- Vercel Docs: https://vercel.com/docs
- Google Apps Script: https://developers.google.com/apps-script

---

© 2024 집안일매니저 - 배포 가이드

