# Google OAuth 정책 오류 해결 가이드

## 🚨 오류 메시지
```
You can't sign in to this app because it doesn't comply with Google's OAuth 2.0 policy for keeping apps secure.
```

## ✅ 해결 방법

### 1단계: Google Cloud Console 접속
👉 https://console.cloud.google.com/

### 2단계: 사용자 인증 정보로 이동
1. 왼쪽 메뉴에서 **API 및 서비스** 클릭
2. **사용자 인증 정보** 클릭
3. OAuth 2.0 클라이언트 ID 목록에서 사용 중인 클라이언트 찾기
4. 클라이언트 ID 이름 클릭 (예: "집안일매니저 웹")

### 3단계: 승인된 JavaScript 원본 추가

**중요**: 현재 어떤 URL로 접속하고 있는지 확인하세요!

#### 로컬 개발 환경
브라우저 주소창을 확인하고 다음 중 하나를 추가:

```
http://localhost:8000
http://localhost:3000
http://127.0.0.1:8000
http://127.0.0.1:3000
```

#### 추가 방법:
1. **승인된 JavaScript 원본** 섹션 찾기
2. **+ URI 추가** 버튼 클릭
3. 현재 사용 중인 URL 입력 (예: `http://localhost:8000`)
4. Enter 키 또는 다른 줄 클릭
5. **저장** 버튼 클릭 (화면 하단)

### 4단계: 승인된 리디렉션 URI (필요한 경우)

대부분의 경우 필요 없지만, 오류가 계속되면:

```
http://localhost:8000
http://localhost:3000
http://127.0.0.1:8000
```

**주의**: 끝에 슬래시(/) 없이 입력!

### 5단계: 변경사항 전파 대기
- ⏰ **5-10분** 대기 (Google 서버에 변경사항 전파 시간)
- 브라우저 캐시 삭제: `Ctrl + Shift + Delete`
- 페이지 새로고침: `Ctrl + F5`

## 🎯 현재 URL 확인 방법

### 방법 1: 브라우저 주소창
```
예시:
http://localhost:8000/index.html  ← localhost:8000 사용 중
http://127.0.0.1:3000/           ← 127.0.0.1:3000 사용 중
```

### 방법 2: 콘솔에서 확인
F12 → Console 탭에서:
```javascript
console.log(window.location.origin);
// 출력: "http://localhost:8000"
```

## 📋 체크리스트

### Google Cloud Console 설정
- [ ] OAuth 클라이언트 ID가 **웹 애플리케이션** 유형인가?
- [ ] **승인된 JavaScript 원본**에 현재 URL이 추가되어 있는가?
- [ ] URL이 정확한가? (http vs https, 포트 번호 확인)
- [ ] **저장** 버튼을 눌렀는가?
- [ ] 5-10분 대기했는가?

### 로컬 환경 설정
- [ ] 로컬 서버를 실행 중인가? (file:// 사용 불가)
- [ ] 올바른 포트로 접속했는가?
- [ ] 브라우저 캐시를 삭제했는가?

## 🔍 단계별 스크린샷 가이드

### 1. Google Cloud Console - 사용자 인증 정보
```
API 및 서비스 > 사용자 인증 정보 > OAuth 2.0 클라이언트 ID > [클라이언트 이름 클릭]
```

### 2. 승인된 JavaScript 원본 섹션
```
┌─────────────────────────────────────────┐
│ 승인된 JavaScript 원본                    │
├─────────────────────────────────────────┤
│ [+ URI 추가]                             │
│                                         │
│ URI 1  http://localhost:8000            │
│ URI 2  http://localhost:3000            │
│ URI 3  http://127.0.0.1:8000           │
└─────────────────────────────────────────┘
```

### 3. 저장 버튼
```
화면 하단에 [저장] 버튼이 있습니다. 꼭 클릭하세요!
```

## 🚀 빠른 해결 단계 (요약)

```bash
# 1. 현재 URL 확인
브라우저 주소창: http://localhost:8000

# 2. Google Cloud Console 접속
https://console.cloud.google.com/

# 3. 경로 이동
API 및 서비스 → 사용자 인증 정보 → OAuth 클라이언트 ID 클릭

# 4. URI 추가
승인된 JavaScript 원본 → + URI 추가 → http://localhost:8000 입력 → 저장

# 5. 대기 후 테스트
5분 대기 → 브라우저 캐시 삭제 → 페이지 새로고침 → 로그인 재시도
```

## ❌ 일반적인 실수

### 실수 1: 슬래시(/) 추가
```
❌ http://localhost:8000/         (마지막 슬래시)
✅ http://localhost:8000           (슬래시 없음)
```

### 실수 2: 잘못된 프로토콜
```
❌ https://localhost:8000          (로컬은 http)
✅ http://localhost:8000           (로컬 개발)
```

### 실수 3: 포트 번호 불일치
```
서버 실행: python -m http.server 3000
브라우저: http://localhost:8000    ❌ 포트 불일치!
올바름: http://localhost:3000      ✅ 포트 일치
```

### 실수 4: 승인된 리디렉션 URI만 추가
```
❌ 승인된 리디렉션 URI만 추가 (잘못됨)
✅ 승인된 JavaScript 원본에 추가 (올바름)
```

### 실수 5: 저장 안 함
```
URI를 추가했지만 화면 하단의 [저장] 버튼을 누르지 않음!
```

## 🔄 변경사항이 반영되지 않을 때

### 1. 브라우저 캐시 완전 삭제
```
Chrome:
Ctrl + Shift + Delete → 전체 기간 → 캐시된 이미지 및 파일 체크 → 데이터 삭제
```

### 2. 시크릿 모드에서 테스트
```
Ctrl + Shift + N (Chrome)
Ctrl + Shift + P (Firefox)
```

### 3. 다른 브라우저에서 테스트
```
Chrome, Firefox, Edge 등 다른 브라우저 사용
```

### 4. OAuth 클라이언트 ID 재생성 (최후의 수단)
```
1. 기존 클라이언트 ID 삭제
2. 새 OAuth 2.0 클라이언트 ID 생성
3. 승인된 JavaScript 원본 정확히 추가
4. 새 클라이언트 ID를 index.html에 적용
```

## 📞 여전히 안 될 때

### 확인할 정보:
1. **현재 접속 URL**: (예: http://localhost:8000)
2. **Google Cloud Console 스크린샷**: 승인된 JavaScript 원본 섹션
3. **브라우저 콘솔 오류**: F12 → Console 탭의 오류 메시지
4. **로컬 서버 실행 명령**: (예: python -m http.server 8000)

### 디버깅 명령:
```javascript
// 브라우저 콘솔(F12)에서 실행
console.log('현재 URL:', window.location.href);
console.log('Origin:', window.location.origin);
console.log('클라이언트 ID:', GOOGLE_CLIENT_ID);
```

## ✅ 성공 확인

설정이 올바르면:
1. "Google로 계속하기" 버튼 클릭
2. Google 계정 선택 팝업이 나타남
3. 권한 승인 화면 표시
4. 로그인 성공!

---

💡 **가장 흔한 원인**: 승인된 JavaScript 원본에 현재 URL이 없음
🎯 **가장 빠른 해결**: http://localhost:8000 (또는 사용 중인 포트) 추가 후 5분 대기

