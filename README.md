# 집안일매니저 📱

가족 구성원 간의 집안일을 효율적으로 관리하는 Google Apps Script 기반 웹앱입니다.

## 🚀 주요 기능

### 📋 할 일 관리
- **오늘 할 일**: 당일 해야 할 집안일 목록 표시
- **내일 할 일 계획**: 우선순위별 정렬된 할 일 목록
- **상태 관리**: 할 일 → 진행중 → 완료 → 할 일 순환
- **주기별 반복**: 매일, 매주, 매달, 분기, 매년 설정

### 👨‍👩‍👧‍👦 가족 협업
- **가족 그룹**: 가족 구성원 초대 및 관리
- **역할 분담**: 할 일별 담당자 지정
- **실시간 동기화**: 가족 구성원 간 진행 상황 공유

### 🐚 보상 시스템
- **조개 획득**: 할 일 완료 시 조개 1개 획득
- **진행 통계**: 일/주/월별 완료 통계 확인
- **동기부여**: 시각적 보상으로 지속적인 참여 유도

### 🔔 스마트 알림
- **시간 설정**: 원하는 시간에 알림 수신
- **요일 선택**: 평일/주말 구분 알림
- **다중 채널**: 앱 푸시, 카카오톡 전송

## 📊 데이터베이스 구조

### 시트1: 사용자 정보 (Users)
| 필드명 | 타입 | 설명 | 예시 |
|--------|------|------|------|
| user_id | String | 사용자 고유 ID | USER001 |
| name | String | 실명 | 김철수 |
| phone | String | 핸드폰 번호 | 010-1234-5678 |
| email | String | 구글 이메일 | user@gmail.com |
| nickname | String | 가족 내 닉네임 | 아빠 |
| family_id | String | 가족 그룹 ID | FAMILY001 |
| shell_count | Number | 보유 조개 수 | 15 |
| created_at | DateTime | 생성일시 | 2024-09-30T00:00:00Z |
| updated_at | DateTime | 수정일시 | 2024-09-30T00:00:00Z |

### 시트2: 할 일 정보 (Tasks)
| 필드명 | 타입 | 설명 | 예시 |
|--------|------|------|------|
| task_id | String | 할 일 고유 ID | TASK001 |
| task_name | String | 할 일 이름 | 설거지 |
| category | String | 카테고리 | 주방, 거실, 화장실, 베란다, 방, 차, 창문, 계절, 기타 |
| cycle | String | 반복 주기 | daily, weekly, monthly, quarterly, yearly |
| assignee_id | String | 담당자 ID | USER001 |
| last_date | Date | 마지막 수행일 | 2024-09-29 |
| next_date | Date | 다음 수행일 | 2024-09-30 |
| status | String | 상태 | todo, in-progress, completed |
| priority | String | 우선순위 색상 | red, blue, green, gray |
| family_id | String | 가족 그룹 ID | FAMILY001 |
| created_at | DateTime | 생성일시 | 2024-09-30T00:00:00Z |
| updated_at | DateTime | 수정일시 | 2024-09-30T00:00:00Z |

### 시트3: 가족 그룹 정보 (Family)
| 필드명 | 타입 | 설명 | 예시 |
|--------|------|------|------|
| family_id | String | 가족 그룹 고유 ID | FAMILY001 |
| family_name | String | 가족 그룹명 | 우리가족 |
| created_by | String | 생성자 ID | USER001 |
| member_count | Number | 구성원 수 | 3 |
| created_at | DateTime | 생성일시 | 2024-09-30T00:00:00Z |
| updated_at | DateTime | 수정일시 | 2024-09-30T00:00:00Z |

### 시트4: 활동 로그 (Logs)
| 필드명 | 타입 | 설명 | 예시 |
|--------|------|------|------|
| log_id | String | 로그 고유 ID | LOG001 |
| user_id | String | 사용자 ID | USER001 |
| task_id | String | 할 일 ID | TASK001 |
| action | String | 액션 타입 | create_task, complete_task, invite_member |
| details | String | 상세 내용 | 할 일 완료: 설거지 |
| timestamp | DateTime | 발생일시 | 2024-09-30T12:00:00Z |

## 🎨 우선순위 색상 시스템

### 🔴 빨간색 (Red)
- 매일 해야 하는 일
- 2일 이하로 남은 일
- 주간 할 일 중 5일 이상 지난 일
- 2주 주기 할 일 중 12일 이상 지난 일

### 🔵 파란색 (Blue)
- 내가 오늘이나 내일 할 일로 지정한 일
- 사용자가 직접 계획한 할 일

### 🟢 연두색 (Green)
- 다른 가족이 오늘이나 내일 할 일로 지정한 일
- 가족 구성원의 계획된 할 일

### ⚫ 검정색 (Gray)
- 기본 설정 할 일
- 다른 색상에 해당하지 않는 일반적인 할 일

## 🛠️ 설치 및 배포

### 1. Google Apps Script 설정
1. [Google Apps Script](https://script.google.com) 접속
2. 새 프로젝트 생성
3. `code.gs` 파일 내용 복사/붙여넣기
4. 구글시트 ID 설정 (`SPREADSHEET_ID` 변수 수정)

### 2. HTML 파일 추가
1. Apps Script 편집기에서 `파일 > 새로 만들기 > HTML 파일`
2. 파일명을 `index`로 설정
3. `index.html` 내용 복사/붙여넣기

### 3. 웹앱 배포
1. Apps Script 편집기에서 `배포 > 새 배포`
2. 유형: 웹앱 선택
3. 실행 대상: 본인 계정
4. 액세스 권한: 모든 사용자
5. 배포 후 웹앱 URL 복사

### 4. 프론트엔드 연동
1. `index.html`의 `GAS_WEB_APP_URL` 변수를 배포된 URL로 수정
2. 웹앱 테스트 및 확인

## 📱 사용 방법

### 초기 설정
1. 웹앱 접속 후 회원가입
2. 가족 그룹 생성 또는 참여
3. 기본 할 일 목록 설정

### 일상 사용
1. **오늘 할 일** 탭에서 체크박스 클릭으로 상태 변경
2. **할 일 관리** 탭에서 새로운 할 일 추가/수정
3. **나의 조개** 탭에서 성과 확인
4. **가족 관리** 탭에서 구성원 초대 및 알림 설정

## 🔧 주요 기능 상세

### 할 일 상태 순환
```
할 일 (todo) → 진행중 (in-progress) → 완료 (completed) → 할 일 (todo)
```

### 주기별 할 일 예시
- **매일**: 설거지, 바닥청소, 침구정리, 빨래
- **매주**: 장보기, 화장실청소, 분리수거, 쓰레기버리기
- **매달**: 현관청소, 베란다정리, 가구먼지제거
- **분기**: 침구변경, 청소기관리, 식기세척기관리
- **매년**: 계절별 옷정리, 에어컨점검, 차량관리

## 🎯 개발 원칙

### 사용자 경험 (UX)
- 직관적이고 사용하기 쉬운 인터페이스
- 모바일 우선 반응형 디자인
- 빠른 로딩과 부드러운 애니메이션

### 데이터 관리
- 실시간 동기화로 가족 간 정보 공유
- 안전한 데이터 저장 및 백업
- 개인정보 보호 및 보안

### 성능 최적화
- 효율적인 API 호출 최소화
- 오프라인 모드 지원
- 캐싱을 통한 빠른 응답

## 🚀 향후 개발 계획

### Phase 1 (현재)
- ✅ 기본 할 일 관리 기능
- ✅ 가족 그룹 관리
- ✅ 보상 시스템 (조개)
- ✅ 모바일 반응형 UI

### Phase 2 (예정)
- 📱 PWA (Progressive Web App) 구현
- 🔔 실제 푸시 알림 연동
- 📊 상세 통계 및 분석
- 🎨 다크 모드 지원

### Phase 3 (계획)
- 🤖 AI 기반 할 일 추천
- 📈 가족 성과 대시보드
- 🏆 성취 배지 시스템
- 🌐 다국어 지원

## 📞 지원 및 문의

개발자: 집안일매니저 팀  
이메일: support@houseworkmanager.com  
GitHub: [https://github.com/housework-manager](https://github.com/housework-manager)

---

**집안일매니저**로 우리 가족의 집안일을 더 체계적이고 즐겁게 관리해보세요! 🏠✨