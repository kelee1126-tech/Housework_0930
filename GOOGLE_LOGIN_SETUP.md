# Google 로그인 설정 가이드

집안일매니저에서 Google 로그인을 활성화하기 위한 단계별 가이드입니다.

## 1. Google Cloud Console 설정

### 1.1 프로젝트 생성
1. [Google Cloud Console](https://console.cloud.google.com/)에 접속
2. 새 프로젝트 생성 또는 기존 프로젝트 선택
3. 프로젝트 이름: "집안일매니저" (또는 원하는 이름)

### 1.2 OAuth 동의 화면 구성
1. 좌측 메뉴에서 **API 및 서비스** > **OAuth 동의 화면** 선택
2. 사용자 유형: **외부** 선택 (일반 사용자용)
3. 앱 정보 입력:
   - **앱 이름**: 집안일매니저
   - **사용자 지원 이메일**: 본인 이메일
   - **앱 로고**: (선택사항) 앱 로고 업로드
   - **승인된 도메인**: 배포할 도메인 추가
   - **개발자 연락처 정보**: 본인 이메일
4. 범위 추가:
   - `userinfo.email`
   - `userinfo.profile`
   - `openid`
5. 저장 및 계속

### 1.3 OAuth 클라이언트 ID 만들기
1. 좌측 메뉴에서 **사용자 인증 정보** 선택
2. **+ 사용자 인증 정보 만들기** > **OAuth 클라이언트 ID** 선택
3. 애플리케이션 유형: **웹 애플리케이션**
4. 이름: "집안일매니저 웹 클라이언트"
5. **승인된 JavaScript 원본** 추가:
   ```
   http://localhost:8000
   https://yourdomain.com
   https://script.google.com
   ```
6. **승인된 리디렉션 URI** 추가:
   ```
   http://localhost:8000
   https://yourdomain.com
   https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
   ```
7. **만들기** 클릭
8. 생성된 **클라이언트 ID** 복사 (예: `123456789-abcdefg.apps.googleusercontent.com`)

## 2. 코드 설정

### 2.1 index.html 수정
`index.html` 파일에서 다음 부분을 찾아 실제 클라이언트 ID로 교체:

```javascript
// 1975번째 줄 근처
const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com';
```

**변경 예시:**
```javascript
const GOOGLE_CLIENT_ID = '123456789-abcdefg.apps.googleusercontent.com';
```

### 2.2 code.gs 수정 (선택사항)
`code.gs` 파일의 OAuth 관련 함수는 이미 구현되어 있으므로 추가 수정이 필요하지 않습니다.

## 3. Google Apps Script 배포

### 3.1 웹앱으로 배포
1. Google Apps Script 편집기에서 **배포** > **새 배포** 선택
2. 유형: **웹 앱**
3. 설정:
   - **실행 계정**: 나
   - **액세스 권한**: 모든 사용자
4. **배포** 클릭
5. 웹앱 URL 복사 (예: `https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec`)

### 3.2 index.html에 웹앱 URL 설정
`index.html` 파일에서 다음 부분을 찾아 실제 웹앱 URL로 교체:

```javascript
// 1001번째 줄 근처
const GAS_WEB_APP_URL = 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec';
```

## 4. 테스트

### 4.1 로컬 테스트
1. `index.html` 파일을 로컬 서버에서 실행
2. "Google로 계속하기" 버튼 클릭
3. Google 계정 선택 및 권한 승인
4. 로그인 성공 확인

### 4.2 문제 해결

#### 오류: "Google Sign-In API가 로드되지 않았습니다"
- 페이지를 새로고침하고 1-2초 대기 후 다시 시도
- 브라우저 개발자 도구(F12) > Console 탭에서 오류 확인

#### 오류: "redirect_uri_mismatch"
- Google Cloud Console에서 리디렉션 URI가 정확히 등록되었는지 확인
- 프로토콜(http/https), 도메인, 포트가 정확히 일치해야 함

#### 오류: "Invalid client ID"
- `GOOGLE_CLIENT_ID`가 정확히 복사되었는지 확인
- 클라이언트 ID 끝에 `.apps.googleusercontent.com`이 포함되어야 함

## 5. 보안 고려사항

### 5.1 프로덕션 환경
- HTTPS 필수 (HTTP는 로컬 테스트용만)
- 도메인 검증 완료
- OAuth 동의 화면을 "프로덕션" 상태로 변경

### 5.2 클라이언트 ID 보호
- 클라이언트 ID는 공개되어도 안전 (프론트엔드에서 사용)
- 클라이언트 시크릿은 절대 프론트엔드에 노출하지 말 것 (사용하지 않음)

## 6. 사용자 경험

### 로그인 플로우
1. 사용자가 "Google로 계속하기" 클릭
2. Google One Tap 또는 팝업 표시
3. Google 계정 선택
4. 권한 승인 (이메일, 프로필)
5. 자동으로 계정 생성 또는 로그인
6. 메인 앱 화면으로 이동

### 자동 로그인
- 로그인 정보는 브라우저 localStorage에 저장
- 다음 방문 시 자동으로 로그인 상태 유지
- 로그아웃 시 localStorage 정리

## 7. 추가 기능

### 7.1 프로필 사진 표시
사용자의 Google 프로필 사진이 자동으로 가져와집니다:
- `currentUser.picture`에 URL 저장
- 헤더나 프로필 페이지에서 표시 가능

### 7.2 다중 로그인 지원
- Google과 Apple 로그인 모두 지원
- 동일 이메일로 두 방식 모두 사용 가능
- 이메일 기반으로 계정 통합

## 문의 및 지원

문제가 발생하면 다음을 확인하세요:
1. 브라우저 개발자 도구(F12) Console 탭
2. Google Cloud Console의 OAuth 동의 화면 상태
3. 승인된 도메인 및 리디렉션 URI 설정

---

© 2024 집안일매니저 - 가족과 함께하는 스마트한 집안일 관리


