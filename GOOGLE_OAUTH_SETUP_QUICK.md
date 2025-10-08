# Google OAuth 클라이언트 ID 빠른 설정 가이드

현재 문제: API 키(`AIzaSy...`)를 사용 중이지만, OAuth 2.0 클라이언트 ID가 필요합니다.

## 🚀 빠른 설정 (5분)

### 1단계: Google Cloud Console 접속
👉 https://console.cloud.google.com/

### 2단계: OAuth 동의 화면 설정
1. 왼쪽 메뉴 **API 및 서비스** → **OAuth 동의 화면**
2. **외부** 선택 → **만들기**
3. 필수 정보만 입력:
   - 앱 이름: `집안일매니저`
   - 사용자 지원 이메일: (본인 이메일)
   - 개발자 연락처: (본인 이메일)
4. **저장 후 계속** 클릭
5. 범위(Scopes)는 **건너뛰기**
6. 테스트 사용자 → **저장 후 계속**
7. 완료!

### 3단계: OAuth 클라이언트 ID 만들기
1. 왼쪽 메뉴 **사용자 인증 정보**
2. **+ 사용자 인증 정보 만들기** → **OAuth 클라이언트 ID**
3. 애플리케이션 유형: **웹 애플리케이션**
4. 이름: `집안일매니저 웹`
5. **승인된 JavaScript 원본** 추가:
   ```
   http://localhost:8000
   http://localhost:3000
   http://127.0.0.1:8000
   ```
6. **승인된 리디렉션 URI**는 **비워두기**
7. **만들기** 클릭
8. ✅ **클라이언트 ID 복사** (예: `123456789-abc.apps.googleusercontent.com`)

### 4단계: 코드에 적용
`index.html` 파일 1969번째 줄:

```javascript
// 변경 전
const GOOGLE_CLIENT_ID = 'AIzaSyDcQGogT_sy1NjaOeaSXHsUl5Hx4rwAT2g';

// 변경 후 (위에서 복사한 클라이언트 ID)
const GOOGLE_CLIENT_ID = '123456789-abc.apps.googleusercontent.com';
```

### 5단계: 테스트
1. 웹 서버 실행 (예: Live Server, http-server 등)
2. 브라우저에서 접속
3. "Google로 계속하기" 버튼 클릭
4. 로그인 성공! 🎉

## ⚠️ 자주 발생하는 오류

### 오류 1: "popup_closed_by_user"
- **원인**: 팝업이 차단되었거나 사용자가 닫음
- **해결**: 팝업 차단 해제

### 오류 2: "idpiframe_initialization_failed"
- **원인**: 쿠키가 차단됨
- **해결**: 
  1. Chrome 설정 → 개인정보 및 보안 → 쿠키 및 기타 사이트 데이터
  2. "타사 쿠키 허용" 체크

### 오류 3: "invalid_client"
- **원인**: 잘못된 클라이언트 ID
- **해결**: 클라이언트 ID를 정확히 복사했는지 확인

### 오류 4: "redirect_uri_mismatch"
- **원인**: 현재 URL이 승인된 JavaScript 원본에 없음
- **해결**: Google Cloud Console에서 현재 URL 추가

## 🧪 로컬 테스트용 간단한 서버 실행

### Python이 설치된 경우:
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

### Node.js가 설치된 경우:
```bash
# http-server 설치
npm install -g http-server

# 서버 실행
http-server -p 8000
```

### VS Code 사용:
1. Live Server 확장 설치
2. index.html 우클릭
3. "Open with Live Server" 선택

## 📋 체크리스트

- [ ] Google Cloud Console에서 OAuth 동의 화면 설정
- [ ] OAuth 클라이언트 ID 생성
- [ ] 클라이언트 ID가 `.apps.googleusercontent.com`으로 끝나는지 확인
- [ ] index.html의 GOOGLE_CLIENT_ID 교체
- [ ] 로컬 웹 서버 실행 (http://localhost:8000)
- [ ] 브라우저에서 테스트

## 💡 팁

### API 키 vs OAuth 클라이언트 ID

**API 키** (`AIzaSy...`):
- Maps, YouTube, Translate 등의 API 호출용
- 서버에서 사용
- 로그인에는 사용 불가 ❌

**OAuth 클라이언트 ID** (`123-abc.apps.googleusercontent.com`):
- 사용자 로그인 및 인증용
- 브라우저에서 사용
- Google Sign-In에 필요 ✅

### 보안 주의사항
- **API 키**: GitHub에 올리지 않는 것이 좋음 (하지만 이미 공개됨)
- **OAuth 클라이언트 ID**: 공개되어도 안전 (프론트엔드에서 사용)
- **클라이언트 시크릿**: 절대 공개하지 말 것 (우리는 사용하지 않음)

## 🆘 여전히 안 될 때

### 브라우저 개발자 도구 확인
1. F12 또는 우클릭 → 검사
2. Console 탭 확인
3. 오류 메시지 복사
4. 해당 오류로 검색

### 일반적인 해결책
1. 브라우저 캐시 삭제
2. 시크릿 모드에서 테스트
3. 다른 브라우저에서 테스트
4. 쿠키 설정 확인

---

문제가 계속되면 브라우저 Console의 오류 메시지를 확인해주세요!

