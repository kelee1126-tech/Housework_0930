# Google 로그인 문제 해결 가이드

Google 로그인이 작동하지 않을 때 확인해야 할 사항들입니다.

## 🔍 1단계: 브라우저 콘솔 확인

### 콘솔 열기
- **Windows/Linux**: `F12` 또는 `Ctrl + Shift + I`
- **Mac**: `Cmd + Option + I`
- 또는 우클릭 → **검사** → **Console** 탭

### 확인할 메시지
페이지를 새로고침하고 "Google로 계속하기" 버튼을 클릭했을 때:

```
✅ 정상 동작:
Google Sign-In 초기화 시도...
클라이언트 ID: 376793805883-8ub45glt9dd098ggkl3uhqjc14gn60k2.apps.googleusercontent.com
✅ Google Sign-In 초기화 완료
Google 로그인 버튼 클릭됨
Google API 로드됨, 로그인 시도 중...
```

```
❌ 문제 발생 시:
⚠️ Google API가 아직 로드되지 않음. 1초 후 재시도...
또는
❌ Google Sign-In 초기화 실패: [오류 메시지]
```

## 🛠️ 2단계: 일반적인 오류 해결

### 오류 1: "idpiframe_initialization_failed"

**원인**: 쿠키가 차단되었거나 타사 쿠키가 비활성화됨

**해결 방법**:

#### Chrome
1. 설정(⚙️) → **개인정보 및 보안**
2. **쿠키 및 기타 사이트 데이터**
3. **모든 쿠키 허용** 또는
4. **타사 쿠키 차단 중** → **사이트 추가** → `accounts.google.com` 추가

#### Firefox
1. 설정 → **개인정보 및 보안**
2. **향상된 추적 방지 기능** → **사용자 지정**
3. **쿠키** → **모든 타사 쿠키** 허용

#### Safari
1. 환경설정 → **개인정보**
2. **모든 쿠키 차단** 해제

### 오류 2: "popup_closed_by_user"

**원인**: 팝업 차단 또는 사용자가 팝업을 닫음

**해결 방법**:
1. 브라우저 주소창의 팝업 차단 아이콘(🚫) 클릭
2. 이 사이트의 팝업 허용
3. 페이지 새로고침

### 오류 3: "invalid_client"

**원인**: 잘못된 클라이언트 ID

**확인 사항**:
```javascript
// index.html의 1982번째 줄 확인
const GOOGLE_CLIENT_ID = '376793805883-8ub45glt9dd098ggkl3uhqjc14gn60k2.apps.googleusercontent.com';
```

**체크리스트**:
- [ ] `.apps.googleusercontent.com`으로 끝나는가?
- [ ] 복사할 때 공백이나 줄바꿈이 없는가?
- [ ] Google Cloud Console의 클라이언트 ID와 정확히 일치하는가?

### 오류 4: "redirect_uri_mismatch"

**원인**: 현재 URL이 승인된 JavaScript 원본에 없음

**해결 방법**:
1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. **API 및 서비스** → **사용자 인증 정보**
3. OAuth 2.0 클라이언트 ID 클릭
4. **승인된 JavaScript 원본**에 현재 URL 추가:
   ```
   http://localhost:8000
   http://localhost:3000
   http://127.0.0.1:8000
   [실제 배포 URL]
   ```
5. 저장 후 5-10분 대기 (전파 시간)

### 오류 5: "Google Sign-In API가 로드되지 않았습니다"

**원인**: Google API 스크립트가 로드되지 않음

**해결 방법**:

1. **인터넷 연결 확인**
2. **방화벽/광고 차단 확인**:
   - AdBlock, uBlock 등이 `accounts.google.com` 차단 중일 수 있음
   - 일시적으로 비활성화하고 테스트
3. **페이지 새로고침**: 
   - `Ctrl + F5` (강제 새로고침)
4. **HTML 확인**:
   ```html
   <!-- index.html 7-8번째 줄에 있어야 함 -->
   <script src="https://accounts.google.com/gsi/client" async defer></script>
   ```

### 오류 6: "Access blocked: 이 앱이 확인되지 않음"

**원인**: OAuth 동의 화면이 "프로덕션" 상태가 아님

**해결 방법**:
1. Google Cloud Console → **OAuth 동의 화면**
2. **테스트 사용자** 섹션에 본인 이메일 추가
3. 또는 **프로덕션으로 게시** 클릭 (검증 필요)

## 🧪 3단계: 로컬 서버 확인

### 로컬 서버 필수!
Google Sign-In은 `file://` 프로토콜에서 작동하지 않습니다.
반드시 로컬 웹 서버를 통해 접속해야 합니다.

### 로컬 서버 실행 방법

#### Python이 있는 경우:
```bash
# 프로젝트 폴더에서
python -m http.server 8000

# 브라우저에서
http://localhost:8000
```

#### Node.js가 있는 경우:
```bash
# http-server 설치 (한 번만)
npm install -g http-server

# 서버 실행
http-server -p 8000

# 브라우저에서
http://localhost:8000
```

#### VS Code를 사용하는 경우:
1. **Live Server** 확장 설치
2. `index.html` 우클릭
3. **Open with Live Server** 선택
4. 자동으로 브라우저 열림

### ❌ 작동하지 않는 방법:
```
file:///C:/Users/yourname/project/index.html  ❌ 안됨!
```

### ✅ 작동하는 방법:
```
http://localhost:8000/index.html  ✅ 작동!
```

## 🔐 4단계: OAuth 설정 재확인

### Google Cloud Console 체크리스트

1. **OAuth 동의 화면**:
   - [ ] 앱 이름 설정됨
   - [ ] 사용자 지원 이메일 설정됨
   - [ ] 상태: "테스트 중" 또는 "프로덕션"
   - [ ] 테스트 사용자에 본인 이메일 추가됨

2. **OAuth 클라이언트 ID**:
   - [ ] 유형: 웹 애플리케이션
   - [ ] 승인된 JavaScript 원본: `http://localhost:8000` 추가됨
   - [ ] 클라이언트 ID 복사 완료

3. **API 활성화** (선택사항):
   - Google Identity Toolkit API (자동 활성화됨)

## 🧹 5단계: 캐시 및 쿠키 삭제

### Chrome
1. `Ctrl + Shift + Delete`
2. **캐시된 이미지 및 파일** 체크
3. **쿠키 및 기타 사이트 데이터** 체크
4. **인터넷 사용 기록 삭제**

### 또는 시크릿 모드 테스트
- `Ctrl + Shift + N` (Chrome)
- `Ctrl + Shift + P` (Firefox)
- 시크릿 모드에서 페이지 열고 테스트

## 📊 6단계: 단계별 테스트

### 테스트 1: Google API 로드 확인
브라우저 콘솔에서:
```javascript
console.log(typeof google);  // "object" 출력되어야 함
console.log(google.accounts); // object 출력되어야 함
```

### 테스트 2: 클라이언트 ID 확인
```javascript
console.log(GOOGLE_CLIENT_ID);
// "376793805883-8ub45glt9dd098ggkl3uhqjc14gn60k2.apps.googleusercontent.com" 출력
```

### 테스트 3: 초기화 상태 확인
페이지 로드 후 콘솔에서:
```javascript
initializeGoogleSignIn();
// ✅ Google Sign-In 초기화 완료
```

### 테스트 4: 수동 로그인 시도
콘솔에서:
```javascript
loginWithGoogle();
// 로그인 팝업 또는 One Tap이 나타나야 함
```

## 🌐 7단계: 네트워크 확인

### 브라우저 개발자 도구
1. **Network** 탭 열기
2. 페이지 새로고침
3. 확인할 요청:
   - `https://accounts.google.com/gsi/client` ✅ Status: 200
   - `https://accounts.google.com/gsi/style` ✅ Status: 200

### 차단된 경우:
- 회사/학교 방화벽이 Google 차단 중
- VPN 사용 시 일부 Google 서비스 차단
- 광고 차단기가 Google 스크립트 차단

## 📞 8단계: 추가 지원

### 여전히 작동하지 않는다면:

1. **브라우저 콘솔 오류 캡처**:
   - F12 → Console 탭
   - 빨간색 오류 메시지 복사

2. **Network 탭 확인**:
   - F12 → Network 탭
   - 실패한 요청 확인 (빨간색)

3. **설정 정보 확인**:
   - 사용 중인 브라우저 및 버전
   - 운영체제
   - 로컬 서버 실행 방법
   - 클라이언트 ID (마지막 4자리만)

## ✅ 정상 작동 시 콘솔 로그

```
페이지 로드:
Google Sign-In 초기화 시도...
클라이언트 ID: 376793805883-8ub45glt9dd098ggkl3uhqjc14gn60k2.apps.googleusercontent.com
✅ Google Sign-In 초기화 완료

버튼 클릭:
Google 로그인 버튼 클릭됨
클라이언트 ID: 376793805883-8ub45glt9dd098ggkl3uhqjc14gn60k2.apps.googleusercontent.com
Google API 로드됨, 로그인 시도 중...
One Tap notification: [object Object]

로그인 성공:
로그인 처리 중... {provider: "google", email: "...", ...}
환영합니다, [이름]님!
```

---

💡 **팁**: 대부분의 문제는 쿠키 차단, 로컬 서버 미사용, 또는 승인된 JavaScript 원본 미등록 때문입니다.

