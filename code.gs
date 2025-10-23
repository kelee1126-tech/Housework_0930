/**
 * 집안일매니저 Google Apps Script 백엔드
 * 구글시트를 데이터베이스로 활용하는 웹앱
 */

// 구글시트 ID 설정
const SPREADSHEET_ID = '1lXY4KHdoRgydOs8xAnOeoD196NZQxGnGt4epnxLe2oo';

// 시트명 정의
const SHEET_NAMES = {
    USERS: 'Users',                    // 사용자 정보
    FAMILY: 'Family',                  // 가족 그룹 정보
    FAMILY_MEMBERS: 'Family members',  // 가족 구성원 정보
    ITEM: 'Item',                      // 가전제품 정보
    CHORE: 'Chore',                    // 할 일 정보
    CHORE_MAIN: 'Chore_main',          // 기본 집안일 템플릿
    CHORE_FAMILY: 'Chore_family',      // 가족별 집안일 주기 테이블 (prefix)
    LOGS: 'Logs'                       // 활동 로그
};

/**
 * 웹앱 메인 함수 - API 서버로만 작동
 */
function doGet(e) {
    // GET 요청에 대한 응답
    return ContentService
        .createTextOutput(JSON.stringify({
            status: 'ok',
            message: '집안일매니저 API가 정상 작동 중입니다.',
            timestamp: new Date().toISOString()
        }))
        .setMimeType(ContentService.MimeType.JSON);
}

/**
 * POST 요청 처리 함수
 */
function doPost(e) {
    try {
        const action = e.parameter.action;
        const data = JSON.parse(e.parameter.data || '{}');
        
        switch(action) {
            case 'getTasks':
                return createResponse(getTasks(data.userId));
            case 'addTask':
                return createResponse(addTask(data));
            case 'updateTask':
                return createResponse(updateTask(data));
            case 'deleteTask':
                return createResponse(deleteTask(data.taskId));
            case 'getFamilyMembers':
                return createResponse(getFamilyMembers(data.familyId));
            case 'addFamilyMember':
                return createResponse(addFamilyMember(data));
            case 'getUserInfo':
                return createResponse(getUserInfo(data.userId));
            case 'updateUserInfo':
                return createResponse(updateUserInfo(data));
            case 'getActivityLogs':
                return createResponse(getActivityLogs(data.userId));
            case 'addActivityLog':
                return createResponse(addActivityLog(data));
            case 'getCategories':
                return createResponse(getCategories());
            case 'oauthLogin':
                return createResponse(oauthLogin(data));
            case 'googleOAuthCallback':
                return createResponse(googleOAuthCallback(data));
            case 'appleOAuthCallback':
                return createResponse(appleOAuthCallback(data));
            case 'checkFamilyName':
                return createResponse(checkFamilyName(data));
            case 'createFamily':
                return createResponse(createFamily(data));
            case 'joinFamily':
                return createResponse(joinFamily(data));
            case 'getFamilyChores':
                return createResponse(getFamilyChores(data.familyId));
            case 'getAllFamilyChoresForSetup':
                return createResponse(getAllFamilyChoresForSetup(data.familyId));
            case 'getAllItems':
                return createResponse(getAllItems());
            case 'setFamilyItems':
                return createResponse(setFamilyItems(data));
            case 'getAllFamiliesByUserId':
                return createResponse(getAllFamiliesByUserId(data.userId));
            case 'assignChoreToMember':
                return createResponse(assignChoreToMember(data));
            case 'unassignChoreFromMember':
                return createResponse(unassignChoreFromMember(data));
            case 'completeChore':
                return createResponse(completeChore(data));
            case 'getTemplateChores':
                return createResponse(getTemplateChores());
            case 'setupFamilyChores':
                return createResponse(setupFamilyChores(data));
            case 'addCustomChore':
                return createResponse(addCustomChore(data));
            case 'getCustomChoreCount':
                return createResponse(getCustomChoreCount(data));
            default:
                throw new Error('알 수 없는 액션입니다: ' + action);
        }
    } catch (error) {
        Logger.log('Error in doPost: ' + error.toString());
        return createResponse(null, false, error.toString());
    }
}

/**
 * 응답 객체 생성
 */
function createResponse(data, success = true, message = '') {
    const response = {
        success: success,
        data: data,
        message: message,
        timestamp: new Date().toISOString()
    };
    
    return ContentService
        .createTextOutput(JSON.stringify(response))
        .setMimeType(ContentService.MimeType.JSON);
}

/**
 * 구글시트 접근 함수
 */
function getSheet(sheetName) {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = spreadsheet.getSheetByName(sheetName);
    
    // 시트가 없으면 생성
    if (!sheet) {
        sheet = spreadsheet.insertSheet(sheetName);
        initializeSheet(sheet, sheetName);
    }
    
    return sheet;
}

/**
 * 시트 초기화 (헤더 설정)
 */
function initializeSheet(sheet, sheetName) {
    let headers = [];
    
    switch(sheetName) {
        case SHEET_NAMES.USERS:
            headers = [
                'user_id', 'name', 'phone', 'email', 'shell_person', 
                'register_at', 'updated_at', 'alarm', 'picture', 'provider'
            ];
            break;
            
        case SHEET_NAMES.FAMILY:
            headers = [
                'family_id', 'family_name', 'created_by', 'member_count',
                'created_at', 'updated_at'
            ];
            break;
            
        case SHEET_NAMES.FAMILY_MEMBERS:
            headers = [
                'id_infamily', 'family_id', 'user_id', 'nick_infamily', 
                'role', 'created_at', 'updated_at'
            ];
            break;
            
        case SHEET_NAMES.ITEM:
            headers = [
                'item_id', 'item_name', 'item_at'
            ];
            break;
            
        case SHEET_NAMES.CHORE:
            headers = [
                'chore_id', 'chore_name', 'choregroup_name', 'cycle', 'chore_at', 'item_id'
            ];
            break;
            
        case SHEET_NAMES.CHORE_MAIN:
            headers = [
                'chore_id', 'chore_name', 'choregroup_name', 'freq_type', 'freq_value', 
                'item_id', 'template', 'use'
            ];
            break;
            
        case SHEET_NAMES.CHORE_FAMILY:
            headers = [
                'chore_id', 'chore_name', 'choregroup_name', 'freq_type', 'freq_value', 
                'item_id', 'template', 'use', 'last_date', 'due_date', 'assignee', 
                'status', 'color', 'created_at', 'updated_at'
            ];
            break;
            
        case SHEET_NAMES.LOGS:
            headers = [
                'log_id', 'user_id', 'task_id', 'action', 'details',
                'timestamp'
            ];
            break;
    }
    
    if (headers.length > 0) {
        sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
        sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    }
}

/**
 * 사용자 정보 관련 함수들
 */

// 사용자 정보 조회
function getUserInfo(userId) {
    const sheet = getSheet(SHEET_NAMES.USERS);
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
        if (data[i][0] === userId) {
            return {
                user_id: data[i][0],
                name: data[i][1],
                phone: data[i][2],
                email: data[i][3],
                shell_person: data[i][4] || 0,
                register_at: data[i][5],
                updated_at: data[i][6],
                alarm: data[i][7]
            };
        }
    }
    
    return null;
}

// 사용자 정보 업데이트
function updateUserInfo(userData) {
    const sheet = getSheet(SHEET_NAMES.USERS);
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
        if (data[i][0] === userData.user_id) {
            const updatedRow = [
                userData.user_id,
                userData.name || data[i][1],
                userData.phone || data[i][2],
                userData.email || data[i][3],
                userData.shell_person !== undefined ? userData.shell_person : data[i][4],
                data[i][5], // register_at 유지
                new Date().toISOString(),
                userData.alarm || data[i][7],
                userData.picture || data[i][8] || '',
                userData.provider || data[i][9] || ''
            ];
            
            sheet.getRange(i + 1, 1, 1, updatedRow.length).setValues([updatedRow]);
            return updatedRow;
        }
    }
    
    // 새 사용자 추가
    const newRow = [
        userData.user_id || generateId('USER'),
        userData.name,
        userData.phone,
        userData.email,
        userData.shell_person || 0,
        new Date().toISOString(),
        new Date().toISOString(),
        userData.alarm || '00:00:00Z',
        userData.picture || '',
        userData.provider || ''
    ];
    
    sheet.appendRow(newRow);
    return newRow;
}

/**
 * 헬퍼 함수들
 */

// 가족 구성원 정보 조회 (user_id로) - 첫 번째 가족만 반환
function getFamilyMemberByUserId(userId) {
    const sheet = getSheet(SHEET_NAMES.FAMILY_MEMBERS);
    const data = sheet.getDataRange().getValues();
    
    // Family_members 헤더: id_infamily, family_id, user_id, nick_infamily, role, created_at, updated_at
    for (let i = 1; i < data.length; i++) {
        if (data[i][2] === userId) { // user_id 컬럼 (인덱스 2)
            return {
                id_infamily: data[i][0],      // 인덱스 0
                family_id: data[i][1],        // 인덱스 1
                user_id: data[i][2],          // 인덱스 2
                nick_infamily: data[i][3],    // 인덱스 3
                role: data[i][4] || 'member', // 인덱스 4
                created_at: data[i][5],       // 인덱스 5
                updated_at: data[i][6]        // 인덱스 6
            };
        }
    }
    
    return null;
}

// 사용자의 모든 가족 구성원 정보 조회 (user_id로)
function getAllFamiliesByUserId(userId) {
    const sheet = getSheet(SHEET_NAMES.FAMILY_MEMBERS);
    const data = sheet.getDataRange().getValues();
    const families = [];
    
    // Family_members 헤더: id_infamily, family_id, user_id, nick_infamily, role, created_at, updated_at
    for (let i = 1; i < data.length; i++) {
        if (data[i][2] === userId) { // user_id 컬럼 (인덱스 2)
            // 가족 정보 조회
            const familySheet = getSheet(SHEET_NAMES.FAMILY);
            const familyData = familySheet.getDataRange().getValues();
            let familyName = '';
            
            for (let j = 1; j < familyData.length; j++) {
                if (familyData[j][0] === data[i][1]) { // family_id 매칭
                    familyName = familyData[j][1];
                    break;
                }
            }
            
            families.push({
                id_infamily: data[i][0],      // 가족 구성원 ID
                family_id: data[i][1],        // 가족 ID
                family_name: familyName,      // 가족 이름
                nick_infamily: data[i][3],    // 가족 내 닉네임
                role: data[i][4] || 'member', // 역할
                created_at: data[i][5],
                updated_at: data[i][6]
            });
        }
    }
    
    return families;
}

// 할 일 기본 정보 조회 (chore_id로)
function getChoreInfo(choreId) {
    const sheet = getSheet(SHEET_NAMES.CHORE);
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
        if (data[i][0] === choreId) {
            return {
                chore_id: data[i][0],
                chore_name: data[i][1],
                choregroup_name: data[i][2],
                cycle: data[i][3],
                chore_at: data[i][4],
                item_id: data[i][5]
            };
        }
    }
    
    return null;
}

/**
 * 할 일 관련 함수들
 */

// 할 일 목록 조회 (Chore_family 시트에서 조회)
function getTasks(userId) {
    const sheet = getSheet(SHEET_NAMES.CHORE_FAMILY);
    const data = sheet.getDataRange().getValues();
    const tasks = [];
    
    // 사용자의 가족 구성원 ID 조회
    const familyMember = getFamilyMemberByUserId(userId);
    if (!familyMember) return tasks;
    
    for (let i = 1; i < data.length; i++) {
        if (data[i][8] === familyMember.id_infamily) { // assignee로 필터링
            // Chore 시트에서 할 일 상세 정보 조회
            const choreInfo = getChoreInfo(data[i][1]); // chore_id
            if (choreInfo) {
                tasks.push({
                    task_id: data[i][1], // chore_id
                    task_name: choreInfo.chore_name,
                    category: choreInfo.choregroup_name,
                    cycle: choreInfo.cycle,
                    assignee_id: data[i][8], // assignee
                    last_date: data[i][5], // last_date
                    next_date: data[i][6], // due_date
                    status: data[i][9], // status
                    priority: data[i][10], // color
                    family_id: familyMember.family_id,
                    created_at: data[i][2], // created_at
                    updated_at: data[i][12] // updated_at
                });
            }
        }
    }
    
    return tasks;
}

// 할 일 추가 (Chore와 Chore_family 시트에 추가)
function addTask(taskData) {
    // 1. Chore 시트에 할 일 기본 정보 추가
    const choreSheet = getSheet(SHEET_NAMES.CHORE);
    const choreId = taskData.chore_id || generateId('CHORE');
    
    const newChore = [
        choreId,                                    // A열: chore_id
        taskData.task_name,                         // B열: chore_name
        taskData.choregroup_name || taskData.category, // C열: choregroup_name
        taskData.cycle,                             // D열: cycle
        new Date().toISOString(),                   // E열: chore_at
        taskData.item_id || ''                      // F열: item_id
    ];
    
    choreSheet.appendRow(newChore);
    
    // 2. Chore_family 시트에 가족별 할 일 정보 추가
    const choreFamilySheet = getSheet(SHEET_NAMES.CHORE_FAMILY);
    const today = new Date().toISOString().split('T')[0];
    const nextDate = calculateNextDate(taskData.cycle);
    
    const newChoreFamily = [
        today,                                      // A열: today
        choreId,                                    // B열: chore_id
        new Date().toISOString(),                   // C열: created_at
        taskData.freq_type || 'day',                // D열: freq_type
        taskData.freq_value || 1,                   // E열: freq_value
        taskData.last_date || today,                // F열: last_date
        nextDate,                                   // G열: due_date
        nextDate,                                   // H열: todo_date
        taskData.assignee_id,                       // I열: assignee
        taskData.status || 'todo',                  // J열: status
        taskData.priority || 'gray',                // K열: color
        '',                                         // L열: done_id
        new Date().toISOString()                    // M열: updated_at
    ];
    
    choreFamilySheet.appendRow(newChoreFamily);
    
    // 활동 로그 추가
    addActivityLog({
        user_id: taskData.assignee_id,
        task_id: choreId,
        action: 'create_task',
        details: `새로운 할 일 추가: ${taskData.task_name}`
    });
    
    return {
        chore_id: choreId,
        chore_name: taskData.task_name,
        status: taskData.status || 'todo'
    };
}

// 할 일 업데이트 (Chore_family 시트에서 업데이트)
function updateTask(taskData) {
    const sheet = getSheet(SHEET_NAMES.CHORE_FAMILY);
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
        if (data[i][1] === taskData.task_id) { // chore_id로 필터링
            const updatedRow = [
                data[i][0], // today 유지
                taskData.task_id, // chore_id
                data[i][2], // created_at 유지
                data[i][3], // freq_type 유지
                data[i][4], // freq_value 유지
                taskData.last_date || data[i][5], // last_date
                taskData.next_date || data[i][6], // due_date
                data[i][7], // todo_date 유지
                taskData.assignee_id || data[i][8], // assignee
                taskData.status || data[i][9], // status
                taskData.priority || data[i][10], // color
                taskData.done_id || data[i][11], // done_id
                new Date().toISOString() // updated_at
            ];
            
            sheet.getRange(i + 1, 1, 1, updatedRow.length).setValues([updatedRow]);
            
            // 할 일 완료 시 조개 증가
            if (taskData.status === 'completed' && data[i][9] !== 'completed') {
                // 가족 구성원 ID로 사용자 ID 조회
                const familyMember = getFamilyMemberByUserId(taskData.assignee_id);
                if (familyMember) {
                    updateUserShellCount(familyMember.user_id, 1);
                }
                
                // 활동 로그 추가
                addActivityLog({
                    user_id: familyMember ? familyMember.user_id : taskData.assignee_id,
                    task_id: taskData.task_id,
                    action: 'complete_task',
                    details: `할 일 완료: ${taskData.task_name || '알 수 없는 할 일'}`
                });
            }
            
            return updatedRow;
        }
    }
    
    return null;
}

// 할 일 삭제 (Chore_family 시트에서 삭제)
function deleteTask(taskId) {
    const sheet = getSheet(SHEET_NAMES.CHORE_FAMILY);
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
        if (data[i][1] === taskId) { // chore_id로 필터링
            const assigneeId = data[i][8]; // assignee
            const familyMember = getFamilyMemberByUserId(assigneeId);
            
            sheet.deleteRow(i + 1);
            
            // 활동 로그 추가
            addActivityLog({
                user_id: familyMember ? familyMember.user_id : assigneeId,
                task_id: taskId,
                action: 'delete_task',
                details: `할 일 삭제: ${taskId}`
            });
            
            return true;
        }
    }
    
    return false;
}

/**
 * 가족 관리 관련 함수들
 */

// 가족 구성원 조회 (Family members 시트에서 조회)
function getFamilyMembers(familyId) {
    const sheet = getSheet(SHEET_NAMES.FAMILY_MEMBERS);
    const data = sheet.getDataRange().getValues();
    const members = [];
    
    // Family_members 헤더: id_infamily, family_id, user_id, nick_infamily, role, created_at, updated_at
    for (let i = 1; i < data.length; i++) {
        if (data[i][1] === familyId) { // family_id 컬럼 (인덱스 1)
            // 사용자 정보 조회
            const userInfo = getUserInfo(data[i][2]); // user_id (인덱스 2)
            if (userInfo) {
                members.push({
                    id_infamily: data[i][0],         // 가족 구성원 ID
                    user_id: data[i][2],             // 실제 사용자 ID
                    name: userInfo.name,             // 실명
                    phone: userInfo.phone,
                    nickname: data[i][3],            // 가족 내 닉네임 (인덱스 3)
                    role: data[i][4] || 'member',    // 역할
                    shell_count: userInfo.shell_person || 0
                });
            }
        }
    }
    
    return members;
}

// 가족 구성원 추가
function addFamilyMember(memberData) {
    // 초대 메시지 전송 로직 (실제로는 SMS API 등을 사용)
    const inviteMessage = `${memberData.inviter_name}님이 집안일매니저에 초대했습니다. 
앱 다운로드: [앱 다운로드 링크]
가족 그룹: ${memberData.family_name}`;
    
    // 실제 SMS 전송은 여기서 구현
    Logger.log(`초대 메시지 전송: ${memberData.phone} - ${inviteMessage}`);
    
    // 활동 로그 추가
    addActivityLog({
        user_id: memberData.inviter_id,
        task_id: '',
        action: 'invite_member',
        details: `가족 구성원 초대: ${memberData.nickname} (${memberData.phone})`
    });
    
    return {
        success: true,
        message: '초대 메시지가 전송되었습니다.'
    };
}

/**
 * 활동 로그 관련 함수들
 */

// 활동 로그 조회
function getActivityLogs(userId, limit = 50) {
    const sheet = getSheet(SHEET_NAMES.LOGS);
    const data = sheet.getDataRange().getValues();
    const logs = [];
    
    for (let i = data.length - 1; i >= 1 && logs.length < limit; i--) {
        if (data[i][1] === userId) {
            logs.push({
                log_id: data[i][0],
                user_id: data[i][1],
                task_id: data[i][2],
                action: data[i][3],
                details: data[i][4],
                timestamp: data[i][5]
            });
        }
    }
    
    return logs;
}

// 활동 로그 추가
function addActivityLog(logData) {
    const sheet = getSheet(SHEET_NAMES.LOGS);
    
    const newLog = [
        generateId('LOG'),
        logData.user_id,
        logData.task_id || '',
        logData.action,
        logData.details,
        new Date().toISOString()
    ];
    
    sheet.appendRow(newLog);
    return newLog;
}

/**
 * 카테고리 관련 함수들
 */

// 카테고리 목록 조회 (Chore 시트의 choregroup_name 기반)
function getCategories() {
    // 기본 카테고리 (fallback용)
    const predefinedCategories = [
        '주방', '거실', '안방', '다른방', '화장실', '베란다', '현관', '자동차', '강아지', '정원', '계절', '기타'
    ];
    
    try {
        const sheet = getSheet(SHEET_NAMES.CHORE);
        const data = sheet.getDataRange().getValues();
        
        if (data.length <= 1) {
            Logger.log('Chore 시트에 데이터가 없습니다. 기본 카테고리 반환.');
            return predefinedCategories;
        }
        
        const categories = new Set();
        
        // C열(인덱스 2)에서 choregroup_name 데이터 수집
        const choreGroupColumnIndex = 2; // C열 (0부터 시작하므로 2)
        
        Logger.log('Chore 시트의 C열에서 choregroup_name 데이터 수집 시작...');
        
        for (let i = 1; i < data.length; i++) {
            const choreGroup = data[i][choreGroupColumnIndex];
            if (choreGroup && typeof choreGroup === 'string' && choreGroup.trim() !== '') {
                categories.add(choreGroup.trim());
                Logger.log(`C열에서 발견된 카테고리: ${choreGroup.trim()}`);
            }
        }
        
        // 카테고리가 하나도 없으면 기본 카테고리 반환
        if (categories.size === 0) {
            Logger.log('C열에서 카테고리를 찾을 수 없습니다. 기본 카테고리 반환.');
            return predefinedCategories;
        }
        
        // Set을 배열로 변환하고 정렬
        const categoryList = Array.from(categories).sort();
        
        Logger.log('Chore 시트의 C열에서 가져온 카테고리: ' + categoryList.join(', '));
        return categoryList;
        
    } catch (error) {
        Logger.log('카테고리 로드 오류: ' + error.toString());
        // 오류 시 기본 카테고리 반환
        return predefinedCategories;
    }
}

/**
 * 유틸리티 함수들
 */

// 고유 ID 생성
function generateId(prefix = '') {
    const timestamp = new Date().getTime();
    const random = Math.floor(Math.random() * 1000);
    return `${prefix}${timestamp}${random}`;
}

// 다음 날짜 계산
function calculateNextDate(cycle, baseDate = null) {
    const base = baseDate ? new Date(baseDate) : new Date();
    let nextDate = new Date(base);
    
    switch(cycle) {
        case 'daily':
            nextDate.setDate(nextDate.getDate() + 1);
            break;
        case 'weekly':
            nextDate.setDate(nextDate.getDate() + 7);
            break;
        case 'monthly':
            nextDate.setMonth(nextDate.getMonth() + 1);
            break;
        case 'quarterly':
            nextDate.setMonth(nextDate.getMonth() + 3);
            break;
        case 'yearly':
            nextDate.setFullYear(nextDate.getFullYear() + 1);
            break;
        default:
            nextDate.setDate(nextDate.getDate() + 1);
    }
    
    return nextDate.toISOString().split('T')[0];
}

// 사용자 조개 개수 업데이트
function updateUserShellCount(userId, increment) {
    const userInfo = getUserInfo(userId);
    if (userInfo) {
        const newShellCount = (userInfo.shell_person || 0) + increment;
        updateUserInfo({
            user_id: userId,
            shell_person: Math.max(0, newShellCount)
        });
    }
}

// 우선순위 계산 (README 기능명세서 기준)
function calculateTaskPriority(task) {
    const today = new Date();
    const nextDate = new Date(task.next_date);
    const diffDays = Math.ceil((nextDate - today) / (1000 * 60 * 60 * 24));
    
    // 빨간색: 매일 해야하는 일, 2일 이하로 남은 일, 주간 할 일 중 5일 이상 지난 일, 2주 주기 할 일 중 12일 이상 지난 일
    if (task.cycle === 'daily' || 
        diffDays <= 2 || 
        (task.cycle === 'weekly' && diffDays >= 5) ||
        (task.cycle === 'custom_weeks_2' && diffDays >= 12)) {
        return 'red';
    }
    
    // 파란색: 내가 오늘이나 내일 할 일로 지정한 일
    if (diffDays <= 1) {
        return 'blue';
    }
    
    // 연두색: 다른 가족이 오늘이나 내일 할 일로 지정한 일
    // (이 로직은 실제 구현에서 더 복잡할 수 있음)
    if (diffDays <= 1) {
        return 'green';
    }
    
    // 회색: 완료한 할일
    if (task.status === 'done') {
        return 'gray';
    }
    
    // 검정색: 기본 설정 할 일
    return 'black';
}

/**
 * 테스트 함수들 (개발용)
 */

// 샘플 데이터 생성
function createSampleData() {
    // 1. 샘플 사용자 생성
    const sampleUsers = [
        {
            user_id: 'USER001',
            name: '김철수',
            phone: '010-1234-5678',
            email: 'user1@example.com',
            shell_person: 15,
            alarm: '08:00:00Z'
        },
        {
            user_id: 'USER002',
            name: '김영희',
            phone: '010-2345-6789',
            email: 'user2@example.com',
            shell_person: 20,
            alarm: '09:00:00Z'
        }
    ];
    
    sampleUsers.forEach(user => updateUserInfo(user));
    
    // 2. 샘플 가족 그룹 생성
    const familySheet = getSheet(SHEET_NAMES.FAMILY);
    const familyData = [
        'FAMILY001', '우리가족', 'USER001', 2, 
        new Date().toISOString(), new Date().toISOString()
    ];
    familySheet.appendRow(familyData);
    
    // 3. 샘플 가족 구성원 생성
    const familyMemberSheet = getSheet(SHEET_NAMES.FAMILY_MEMBERS);
    const familyMembers = [
        ['IDF001-01', '아빠', 'FAMILY001', 'USER001'],
        ['IDF001-02', '엄마', 'FAMILY001', 'USER002']
    ];
    familyMembers.forEach(member => familyMemberSheet.appendRow(member));
    
    // 4. 샘플 가전제품 생성
    const itemSheet = getSheet(SHEET_NAMES.ITEM);
    const items = [
        ['I001', '식기세척기', new Date().toISOString()],
        ['I002', '세탁기', new Date().toISOString()],
        ['I003', '청소기', new Date().toISOString()]
    ];
    items.forEach(item => itemSheet.appendRow(item));
    
    // 5. 샘플 할 일 생성
    const sampleTasks = [
        {
            task_name: '설거지',
            choregroup_name: '주방',
            cycle: 'daily',
            assignee_id: 'IDF001-01',
            item_id: 'I001',
            priority: 'red'
        },
        {
            task_name: '바닥청소',
            choregroup_name: '거실',
            cycle: 'daily',
            assignee_id: 'IDF001-02',
            item_id: 'I003',
            priority: 'red'
        },
        {
            task_name: '화장실 청소',
            choregroup_name: '화장실',
            cycle: 'weekly',
            assignee_id: 'IDF001-01',
            priority: 'blue'
        },
        {
            task_name: '베란다 정리',
            choregroup_name: '베란다',
            cycle: 'weekly',
            assignee_id: 'IDF001-01',
            priority: 'blue'
        },
        {
            task_name: '차량 세차',
            choregroup_name: '차',
            cycle: 'custom_weeks_2',
            assignee_id: 'IDF001-02',
            priority: 'gray'
        }
    ];
    
    sampleTasks.forEach(task => addTask(task));
    
    Logger.log('샘플 데이터가 생성되었습니다.');
}

// 데이터 초기화 (주의: 모든 데이터 삭제)
function clearAllData() {
    const confirmation = Browser.msgBox('경고', '모든 데이터를 삭제하시겠습니까?', Browser.Buttons.YES_NO);
    
    if (confirmation === 'yes') {
        Object.values(SHEET_NAMES).forEach(sheetName => {
            const sheet = getSheet(sheetName);
            sheet.clear();
            initializeSheet(sheet, sheetName);
        });
        
        Logger.log('모든 데이터가 초기화되었습니다.');
    }
}

/**
 * 웹앱 배포를 위한 권한 설정 함수
 */
function onInstall() {
    onOpen();
}

function onOpen() {
    const ui = SpreadsheetApp.getUi();
    ui.createMenu('집안일매니저')
        .addItem('샘플 데이터 생성', 'createSampleData')
        .addItem('데이터 초기화', 'clearAllData')
        .addSeparator()
        .addItem('웹앱 열기', 'openWebApp')
        .addToUi();
}

function openWebApp() {
    const url = ScriptApp.getService().getUrl();
    const htmlOutput = HtmlService
        .createHtmlOutput(`<script>window.open('${url}', '_blank');</script>`)
        .setWidth(200)
        .setHeight(100);
    
    SpreadsheetApp.getUi().showModalDialog(htmlOutput, '웹앱 열기');
}

/**
 * OAuth 관련 함수들
 */

// OAuth 로그인 처리
function oauthLogin(data) {
    try {
        const { provider, email, name, picture, id_token } = data;
        
        // 기존 사용자 확인
        let user = getUserByEmail(email);
        
        if (!user) {
            // 새 사용자 생성 (가족 그룹은 나중에 등록)
            const userId = generateId('USER');
            
            // 사용자 정보 저장
            user = {
                user_id: userId,
                name: name,
                email: email,
                phone: '',
                shell_person: 0,
                register_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                alarm: '08:00:00Z',
                picture: picture || '',
                provider: provider
            };
            
            updateUserInfo(user);
            
            // 활동 로그 추가
            addActivityLog({
                user_id: userId,
                task_id: '',
                action: 'oauth_signup',
                details: `${provider}로 회원가입: ${name} (${email})`
            });
        } else {
            // 기존 사용자 정보 업데이트
            user.picture = picture || user.picture;
            user.provider = provider;
            user.updated_at = new Date().toISOString();
            updateUserInfo(user);
            
            // 활동 로그 추가
            addActivityLog({
                user_id: user.user_id,
                task_id: '',
                action: 'oauth_login',
                details: `${provider}로 로그인: ${name} (${email})`
            });
        }
        
        // 가족 구성원 정보 조회
        const familyMember = getFamilyMemberByUserId(user.user_id);
        
        // 가족 정보 조회
        let familyGroupName = null;
        let familyGroupId = null;
        
        if (familyMember && familyMember.family_id) {
            familyGroupId = familyMember.family_id;
            const familySheet = getSheet(SHEET_NAMES.FAMILY);
            const familyData = familySheet.getDataRange().getValues();
            for (let i = 1; i < familyData.length; i++) {
                if (familyData[i][0] === familyMember.family_id) {
                    familyGroupName = familyData[i][1];
                    break;
                }
            }
        }
        
        return {
            id: user.user_id,
            idInFamily: familyMember ? familyMember.id_infamily : null,  // 가족 구성원 ID
            name: user.name,
            nickname: familyMember ? familyMember.nick_infamily : null,
            familyGroup: familyGroupName,
            familyGroupId: familyGroupId,
            shellCount: user.shell_person || 0,
            email: user.email,
            picture: user.picture,
            provider: provider
        };
        
    } catch (error) {
        Logger.log('OAuth 로그인 오류: ' + error.toString());
        return {
            success: false,
            message: 'OAuth 로그인 처리 중 오류가 발생했습니다.'
        };
    }
}

// Google OAuth 콜백 처리
function googleOAuthCallback(data) {
    try {
        const { code, redirect_uri } = data;
        
        // Google OAuth 2.0 설정 (실제 환경에서는 환경변수나 설정에서 가져와야 함)
        const clientId = 'YOUR_GOOGLE_CLIENT_ID';
        const clientSecret = 'YOUR_GOOGLE_CLIENT_SECRET';
        
        // 액세스 토큰 요청
        const tokenResponse = UrlFetchApp.fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            payload: {
                client_id: clientId,
                client_secret: clientSecret,
                code: code,
                grant_type: 'authorization_code',
                redirect_uri: redirect_uri
            }
        });
        
        const tokenData = JSON.parse(tokenResponse.getContentText());
        
        if (tokenData.error) {
            throw new Error(tokenData.error_description || tokenData.error);
        }
        
        // 사용자 정보 요청
        const userInfoResponse = UrlFetchApp.fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: {
                'Authorization': 'Bearer ' + tokenData.access_token
            }
        });
        
        const userInfo = JSON.parse(userInfoResponse.getContentText());
        
        // OAuth 로그인 처리
        return oauthLogin({
            provider: 'google',
            email: userInfo.email,
            name: userInfo.name,
            picture: userInfo.picture,
            id_token: tokenData.id_token
        });
        
    } catch (error) {
        Logger.log('Google OAuth 콜백 오류: ' + error.toString());
        return {
            success: false,
            message: 'Google 로그인 처리 중 오류가 발생했습니다: ' + error.toString()
        };
    }
}

// Apple OAuth 콜백 처리
function appleOAuthCallback(data) {
    try {
        const { code, state } = data;
        
        // Apple Sign In 설정 (실제 환경에서는 환경변수나 설정에서 가져와야 함)
        const clientId = 'YOUR_APPLE_CLIENT_ID';
        const clientSecret = 'YOUR_APPLE_CLIENT_SECRET';
        
        // 액세스 토큰 요청
        const tokenResponse = UrlFetchApp.fetch('https://appleid.apple.com/auth/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            payload: {
                client_id: clientId,
                client_secret: clientSecret,
                code: code,
                grant_type: 'authorization_code',
                redirect_uri: data.redirect_uri
            }
        });
        
        const tokenData = JSON.parse(tokenResponse.getContentText());
        
        if (tokenData.error) {
            throw new Error(tokenData.error_description || tokenData.error);
        }
        
        // Apple ID 토큰에서 사용자 정보 추출
        const idToken = tokenData.id_token;
        const payload = JSON.parse(Utilities.base64Decode(idToken.split('.')[1]));
        
        // OAuth 로그인 처리
        return oauthLogin({
            provider: 'apple',
            email: payload.email,
            name: payload.name || 'Apple 사용자',
            picture: '',
            id_token: idToken
        });
        
    } catch (error) {
        Logger.log('Apple OAuth 콜백 오류: ' + error.toString());
        return {
            success: false,
            message: 'Apple 로그인 처리 중 오류가 발생했습니다: ' + error.toString()
        };
    }
}

// 이메일로 사용자 조회
function getUserByEmail(email) {
    const sheet = getSheet(SHEET_NAMES.USERS);
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
        if (data[i][3] === email) { // email 컬럼
            return {
                user_id: data[i][0],
                name: data[i][1],
                phone: data[i][2],
                email: data[i][3],
                shell_person: data[i][4] || 0,
                register_at: data[i][5],
                updated_at: data[i][6],
                alarm: data[i][7],
                picture: data[i][8] || '',
                provider: data[i][9] || ''
            };
        }
    }
    
    return null;
}

/**
 * 가족 이름 중복 확인
 */
function checkFamilyName(data) {
    try {
        const familyName = data.familyName;
        
        if (!familyName) {
            return {
                exists: false,
                message: '가족 이름을 입력해주세요.'
            };
        }
        
        const sheet = getSheet(SHEET_NAMES.FAMILY);
        const familyData = sheet.getDataRange().getValues();
        
        // 헤더만 있는 경우 (데이터가 없는 경우)
        if (familyData.length <= 1) {
            return {
                exists: false,
                similarFamilies: []
            };
        }
        
        const membersSheet = getSheet(SHEET_NAMES.FAMILY_MEMBERS);
        const membersData = membersSheet.getDataRange().getValues();
        
        // 정확히 일치하는 가족 검색
        for (let i = 1; i < familyData.length; i++) {
            if (familyData[i][1] === familyName) { // family_name 컬럼
                let memberCount = 0;
                for (let j = 1; j < membersData.length; j++) {
                    if (membersData[j][1] === familyData[i][0]) {  // family_id 매칭
                        memberCount++;
                    }
                }
                
                return {
                    exists: true,
                    exactMatch: true,
                    family: {
                        id: familyData[i][0],
                        name: familyData[i][1],
                        created_at: familyData[i][4] || new Date().toISOString(),
                        memberCount: memberCount
                    }
                };
            }
        }
        
        // 정확히 일치하는 가족이 없으면 비슷한 이름 검색
        const similarFamilies = [];
        const searchLower = familyName.toLowerCase();
        
        for (let i = 1; i < familyData.length; i++) {
            const currentName = familyData[i][1];
            if (!currentName) continue;
            
            const currentLower = currentName.toLowerCase();
            
            // 부분 일치 또는 유사도 검사
            if (currentLower.includes(searchLower) || 
                searchLower.includes(currentLower) ||
                calculateSimilarity(searchLower, currentLower) > 0.6) {
                
                let memberCount = 0;
                for (let j = 1; j < membersData.length; j++) {
                    if (membersData[j][1] === familyData[i][0]) {
                        memberCount++;
                    }
                }
                
                similarFamilies.push({
                    id: familyData[i][0],
                    name: currentName,
                    created_at: familyData[i][4] || new Date().toISOString(),
                    memberCount: memberCount
                });
            }
        }
        
        // 가족이 없으면
        return {
            exists: false,
            exactMatch: false,
            similarFamilies: similarFamilies
        };
    } catch (error) {
        Logger.log('가족 이름 확인 오류: ' + error.toString());
        return {
            exists: false,
            error: true,
            message: '가족 이름 확인 중 오류가 발생했습니다: ' + error.toString()
        };
    }
}

/**
 * 두 문자열의 유사도 계산 (Levenshtein distance 기반)
 */
function calculateSimilarity(str1, str2) {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) {
        return 1.0;
    }
    
    const editDistance = getEditDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
}

/**
 * Edit distance 계산
 */
function getEditDistance(str1, str2) {
    const costs = [];
    for (let i = 0; i <= str1.length; i++) {
        let lastValue = i;
        for (let j = 0; j <= str2.length; j++) {
            if (i === 0) {
                costs[j] = j;
            } else if (j > 0) {
                let newValue = costs[j - 1];
                if (str1.charAt(i - 1) !== str2.charAt(j - 1)) {
                    newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
                }
                costs[j - 1] = lastValue;
                lastValue = newValue;
            }
        }
        if (i > 0) {
            costs[str2.length] = lastValue;
        }
    }
    return costs[str2.length];
}

/**
 * 새 가족 생성
 */
function createFamily(data) {
    try {
        const userId = data.userId;
        const familyName = data.familyName;
        const nickname = data.nickname;
        
        // 가족 그룹 생성
        const familySheet = getSheet(SHEET_NAMES.FAMILY);
        const familyId = 'F' + new Date().getTime();
        const now = new Date().toISOString();
        
        familySheet.appendRow([
            familyId,
            familyName,
            userId,  // created_by
            1,       // member_count
            now,
            now
        ]);
        
        // 가족 구성원에 추가 (첫 번째 구성원이므로 _1)
        const membersSheet = getSheet(SHEET_NAMES.FAMILY_MEMBERS);
        const idInFamily = familyId + '_1';
        
        membersSheet.appendRow([
            idInFamily,      // id_infamily (family_id + _1)
            familyId,        // family_id
            userId,          // user_id
            nickname,        // nick_infamily
            'owner',         // role
            now,             // created_at
            now              // updated_at
        ]);
        
        // 가족별 집안일 시트 생성 (Chore_main 템플릿 복사)
        createFamilyChoreSheet(familyId);
        
        Logger.log(`새 가족 생성: ${familyId}, ${familyName}, 구성원ID: ${idInFamily}`);
        
        return {
            success: true,
            familyId: familyId,
            familyName: familyName,
            idInFamily: idInFamily,  // 가족 구성원 ID 반환
            joinDate: now.split('T')[0],  // 가족 가입일 (YYYY-MM-DD 형식)
            message: '가족이 생성되었습니다.'
        };
    } catch (error) {
        Logger.log('가족 생성 오류: ' + error.toString());
        return {
            success: false,
            message: '가족 생성 중 오류가 발생했습니다: ' + error.toString()
        };
    }
}

/**
 * 가족별 집안일 시트 생성 (Chore_main 템플릿 복사)
 */
function createFamilyChoreSheet(familyId) {
    try {
        const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
        const choreMainSheet = getSheet(SHEET_NAMES.CHORE_MAIN);
        
        // 새 시트 이름
        const newSheetName = SHEET_NAMES.CHORE_FAMILY + '_' + familyId;
        
        // 이미 존재하는지 확인
        let familyChoreSheet = spreadsheet.getSheetByName(newSheetName);
        if (familyChoreSheet) {
            Logger.log(`시트가 이미 존재합니다: ${newSheetName}`);
            return familyChoreSheet;
        }
        
        // Chore_main 시트 복사
        familyChoreSheet = choreMainSheet.copyTo(spreadsheet);
        familyChoreSheet.setName(newSheetName);
        
        // 복사된 시트의 모든 행 가져오기
        const dataRange = familyChoreSheet.getDataRange();
        const data = dataRange.getValues();
        
        // Chore_family 형식으로 헤더와 추가 컬럼 설정
        const familyHeaders = [
            'chore_id', 'chore_name', 'choregroup_name', 'freq_type', 'freq_value', 
            'item_id', 'template', 'use', 'last_date', 'due_date', 'assignee', 
            'status', 'color', 'created_at', 'updated_at'
        ];
        
        // 헤더 업데이트
        familyChoreSheet.getRange(1, 1, 1, familyHeaders.length).setValues([familyHeaders]);
        familyChoreSheet.getRange(1, 1, 1, familyHeaders.length).setFontWeight('bold');
        
        // 각 행에 추가 컬럼 데이터 설정 (헤더 제외)
        // 색상은 프론트엔드에서 동적으로 결정되므로 기본값은 빈 문자열
        for (let i = 1; i < data.length; i++) {
            // use 컬럼 기본값
            if (!data[i][7]) {
                familyChoreSheet.getRange(i + 1, 8).setValue('Y');
            }
            
            // 추가 컬럼들 설정 (last_date부터)
            familyChoreSheet.getRange(i + 1, 9).setValue('');   // last_date
            familyChoreSheet.getRange(i + 1, 10).setValue('');  // due_date
            familyChoreSheet.getRange(i + 1, 11).setValue('');  // assignee
            familyChoreSheet.getRange(i + 1, 12).setValue('');  // status
            familyChoreSheet.getRange(i + 1, 13).setValue('');  // color (프론트엔드에서 동적 결정)
            familyChoreSheet.getRange(i + 1, 14).setValue(new Date().toISOString());  // created_at
            familyChoreSheet.getRange(i + 1, 15).setValue(new Date().toISOString());  // updated_at
        }
        
        Logger.log(`가족 집안일 시트 생성 완료: ${newSheetName}`);
        return familyChoreSheet;
        
    } catch (error) {
        Logger.log('가족 집안일 시트 생성 오류: ' + error.toString());
        throw error;
    }
}

/**
 * 가족별 집안일 시트 가져오기
 */
function getFamilyChoreSheet(familyId) {
    try {
        const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
        const sheetName = SHEET_NAMES.CHORE_FAMILY + '_' + familyId;
        let sheet = spreadsheet.getSheetByName(sheetName);
        
        // 시트가 없으면 생성
        if (!sheet) {
            sheet = createFamilyChoreSheet(familyId);
        }
        
        return sheet;
    } catch (error) {
        Logger.log('가족 집안일 시트 가져오기 오류: ' + error.toString());
        throw error;
    }
}

/**
 * 가족별 집안일 목록 조회 (use='Y'인 것만)
 */
function getFamilyChores(familyId) {
    try {
        const sheet = getFamilyChoreSheet(familyId);
        const data = sheet.getDataRange().getValues();
        const headers = data[0];
        
        const chores = [];
        for (let i = 1; i < data.length; i++) {
            const row = data[i];
            // use 컬럼이 'Y'인 것만 반환
            if (row[7] === 'Y') {  // use 컬럼 인덱스
                chores.push({
                    chore_id: row[0],
                    chore_name: row[1],
                    choregroup_name: row[2],
                    freq_type: row[3],
                    freq_value: row[4],
                    item_id: row[5],
                    template: row[6],
                    use: row[7],
                    last_date: row[8] || null,
                    due_date: row[9] || null,
                    assignee: row[10] || null,
                    status: row[11] || 'todo',
                    color: row[12] || 'gray',
                    created_at: row[13] || new Date().toISOString(),
                    updated_at: row[14] || new Date().toISOString()
                });
            }
        }
        
        return chores;
    } catch (error) {
        Logger.log('가족 집안일 조회 오류: ' + error.toString());
        throw error;
    }
}

/**
 * 가족의 모든 집안일 목록 조회 (설정용 - use='Y', 'N' 모두 포함)
 */
function getAllFamilyChoresForSetup(familyId) {
    try {
        const sheet = getFamilyChoreSheet(familyId);
        const data = sheet.getDataRange().getValues();
        const headers = data[0];
        
        const chores = [];
        for (let i = 1; i < data.length; i++) {
            const row = data[i];
            // 모든 집안일 반환 (use 상태 무관)
            if (row[0]) {  // chore_id가 있는 경우만
                chores.push({
                    chore_id: row[0],
                    chore_name: row[1],
                    choregroup_name: row[2],
                    freq_type: row[3],
                    freq_value: row[4],
                    item_id: row[5],
                    template: row[6],
                    use: row[7],
                    last_date: row[8] || null,
                    due_date: row[9] || null,
                    assignee: row[10] || null,
                    status: row[11] || 'todo',
                    color: row[12] || '',
                    created_at: row[13] || new Date().toISOString(),
                    updated_at: row[14] || new Date().toISOString()
                });
            }
        }
        
        return chores;
    } catch (error) {
        Logger.log('가족 집안일 전체 조회 오류: ' + error.toString());
        throw error;
    }
}

/**
 * 모든 아이템 목록 조회
 */
function getAllItems() {
    try {
        const sheet = getSheet(SHEET_NAMES.ITEM);
        const data = sheet.getDataRange().getValues();
        
        const items = [];
        for (let i = 1; i < data.length; i++) {
            if (data[i][0]) {  // item_id가 있는 경우만
                items.push({
                    item_id: data[i][0],
                    item_name: data[i][1],
                    item_at: data[i][2] || ''
                });
            }
        }
        
        return items;
    } catch (error) {
        Logger.log('아이템 목록 조회 오류: ' + error.toString());
        throw error;
    }
}

/**
 * 가족 아이템 설정 및 집안일 use 업데이트
 */
function setFamilyItems(data) {
    try {
        const familyId = data.familyId;
        const selectedItemIds = data.itemIds || [];  // 선택된 아이템 ID 배열
        
        Logger.log(`가족 아이템 설정: ${familyId}, 선택된 아이템: ${selectedItemIds.join(', ')}`);
        
        // 가족별 집안일 시트 가져오기
        const choreFamilySheet = getFamilyChoreSheet(familyId);
        const choreData = choreFamilySheet.getDataRange().getValues();
        
        // 각 집안일의 item_id를 확인하여 use 컬럼 업데이트
        for (let i = 1; i < choreData.length; i++) {
            const choreItemId = choreData[i][5];  // item_id 컬럼 (인덱스 5)
            
            // item_id가 비어있거나, 선택된 아이템 목록에 포함되어 있으면 'Y', 아니면 'N'
            let useValue = 'Y';
            if (choreItemId && choreItemId !== '') {
                useValue = selectedItemIds.includes(choreItemId) ? 'Y' : 'N';
            }
            
            // use 컬럼 업데이트 (인덱스 7 -> 실제 컬럼 8)
            choreFamilySheet.getRange(i + 1, 8).setValue(useValue);
        }
        
        Logger.log(`가족 아이템 설정 완료: ${familyId}`);
        
        return {
            success: true,
            message: '아이템이 설정되었습니다.',
            itemCount: selectedItemIds.length
        };
        
    } catch (error) {
        Logger.log('가족 아이템 설정 오류: ' + error.toString());
        return {
            success: false,
            message: '아이템 설정 중 오류가 발생했습니다: ' + error.toString()
        };
    }
}

/**
 * 템플릿 집안일 목록 조회 (template=1인 것만)
 */
function getTemplateChores() {
    try {
        const sheet = getSheet(SHEET_NAMES.CHORE_MAIN);
        const data = sheet.getDataRange().getValues();
        
        Logger.log('Chore_main 시트 데이터 행 수: ' + data.length);
        Logger.log('첫 번째 행 (헤더): ' + JSON.stringify(data[0]));
        
        const templateChores = [];
        for (let i = 1; i < data.length; i++) {
            Logger.log(`행 ${i}: template 값 = "${data[i][6]}" (타입: ${typeof data[i][6]})`);
            
            // template 컬럼이 1인 것만
            if (data[i][6] === 1 || data[i][6] === '1' || String(data[i][6]).trim() === '1') {
                templateChores.push({
                    chore_id: data[i][0],
                    chore_name: data[i][1],
                    choregroup_name: data[i][2],
                    freq_type: data[i][3],
                    freq_value: data[i][4],
                    item_id: data[i][5] || '',
                    template: data[i][6],
                    use: data[i][7] || 'Y'
                });
            }
        }
        
        Logger.log('템플릿 집안일 개수: ' + templateChores.length);
        return templateChores;
    } catch (error) {
        Logger.log('템플릿 집안일 조회 오류: ' + error.toString());
        throw error;
    }
}

/**
 * 가족 집안일 설정 (chore_family 시트에 반영)
 */
function setupFamilyChores(data) {
    try {
        const familyId = data.familyId;
        const choreSettings = data.choreSettings;  // [{ chore_id, use, freq_value, freq_type }, ...]
        
        Logger.log(`가족 집안일 설정: ${familyId}, 설정 개수: ${choreSettings.length}`);
        
        // 가족별 집안일 시트 가져오기
        const choreFamilySheet = getFamilyChoreSheet(familyId);
        const choreData = choreFamilySheet.getDataRange().getValues();
        
        let activeCount = 0;
        
        // 각 설정을 시트에 반영
        choreSettings.forEach(setting => {
            for (let i = 1; i < choreData.length; i++) {
                if (choreData[i][0] === setting.chore_id) {  // chore_id 매칭
                    const row = i + 1;
                    
                    // freq_value, freq_type, use 업데이트
                    choreFamilySheet.getRange(row, 4).setValue(setting.freq_type);   // freq_type
                    choreFamilySheet.getRange(row, 5).setValue(setting.freq_value);  // freq_value
                    choreFamilySheet.getRange(row, 8).setValue(setting.use);         // use
                    choreFamilySheet.getRange(row, 15).setValue(new Date().toISOString()); // updated_at
                    
                    if (setting.use === 'Y') {
                        activeCount++;
                    }
                    
                    break;
                }
            }
        });
        
        Logger.log(`가족 집안일 설정 완료: ${familyId}, 활성화: ${activeCount}개`);
        
        return {
            success: true,
            activeCount: activeCount,
            message: '집안일이 설정되었습니다.'
        };
        
    } catch (error) {
        Logger.log('가족 집안일 설정 오류: ' + error.toString());
        return {
            success: false,
            message: '집안일 설정 중 오류가 발생했습니다: ' + error.toString()
        };
    }
}

/**
 * 가족의 사용자 정의 집안일 개수 조회
 */
function getCustomChoreCount(data) {
    try {
        const familyId = data.familyId;
        const choreFamilySheet = getFamilyChoreSheet(familyId);
        const choreData = choreFamilySheet.getDataRange().getValues();
        
        let customCount = 0;
        
        // template=0인 것 개수 세기
        for (let i = 1; i < choreData.length; i++) {
            if (choreData[i][6] === 0 || choreData[i][6] === '0') {  // template 컬럼
                customCount++;
            }
        }
        
        return {
            count: customCount,
            limit: 30,
            remaining: 30 - customCount
        };
        
    } catch (error) {
        Logger.log('사용자 정의 집안일 개수 조회 오류: ' + error.toString());
        return {
            count: 0,
            limit: 30,
            remaining: 30
        };
    }
}

/**
 * 새로운 할 일 추가 (Chore_main + Chore_family 동시 추가)
 */
function addCustomChore(data) {
    try {
        const familyId = data.familyId;
        const choreName = data.choreName;
        const choreGroupName = data.choreGroupName;
        const freqType = data.freqType;
        const freqValue = data.freqValue;
        
        // 1. 가족의 사용자 정의 집안일 개수 확인
        const countInfo = getCustomChoreCount({ familyId: familyId });
        if (countInfo.count >= 30) {
            return {
                success: false,
                message: '가족당 최대 30개의 사용자 정의 집안일만 추가할 수 있습니다.'
            };
        }
        
        // 2. Chore_main 시트에서 마지막 chore_id 가져오기
        const choreMainSheet = getSheet(SHEET_NAMES.CHORE_MAIN);
        const choreMainData = choreMainSheet.getDataRange().getValues();
        
        let maxChoreNum = 0;
        for (let i = 1; i < choreMainData.length; i++) {
            const choreId = choreMainData[i][0];
            if (choreId && choreId.startsWith('C')) {
                const num = parseInt(choreId.substring(1));
                if (!isNaN(num) && num > maxChoreNum) {
                    maxChoreNum = num;
                }
            }
        }
        
        const newChoreId = 'C' + String(maxChoreNum + 1).padStart(3, '0');
        const now = new Date().toISOString();
        
        Logger.log(`새 집안일 생성: ${newChoreId} - ${choreName}`);
        
        // 3. Chore_main 시트에 추가 (template=0)
        choreMainSheet.appendRow([
            newChoreId,           // chore_id
            choreName,            // chore_name
            choreGroupName,       // choregroup_name
            freqType,             // freq_type
            freqValue,            // freq_value
            '',                   // item_id
            0,                    // template (사용자 정의)
            'Y'                   // use
        ]);
        
        // 4. Chore_family 시트에 추가 (use='Y')
        const choreFamilySheet = getFamilyChoreSheet(familyId);
        choreFamilySheet.appendRow([
            newChoreId,           // chore_id
            choreName,            // chore_name
            choreGroupName,       // choregroup_name
            freqType,             // freq_type
            freqValue,            // freq_value
            '',                   // item_id
            0,                    // template
            'Y',                  // use
            '',                   // last_date
            '',                   // due_date
            '',                   // assignee
            'todo',               // status
            '',                   // color (프론트엔드에서 동적 결정)
            now,                  // created_at
            now                   // updated_at
        ]);
        
        Logger.log(`새 집안일 추가 완료: ${newChoreId}`);
        
        return {
            success: true,
            chore_id: newChoreId,
            remaining: countInfo.remaining - 1,
            message: '새로운 집안일이 추가되었습니다.'
        };
        
    } catch (error) {
        Logger.log('새 집안일 추가 오류: ' + error.toString());
        return {
            success: false,
            message: '집안일 추가 중 오류가 발생했습니다: ' + error.toString()
        };
    }
}

/**
 * 집안일을 가족 구성원에게 할당
 */
function assignChoreToMember(data) {
    try {
        const familyId = data.family_id;
        const choreId = data.chore_id;
        const assignee = data.assignee;  // id_infamily
        const dueDate = data.due_date;
        
        // 가족별 집안일 시트 가져오기
        const choreFamilySheet = getFamilyChoreSheet(familyId);
        const choreData = choreFamilySheet.getDataRange().getValues();
        
        // 해당 chore_id 찾아서 assignee, due_date, status 업데이트
        for (let i = 1; i < choreData.length; i++) {
            if (choreData[i][0] === choreId) {  // chore_id 컬럼
                const row = i + 1;
                
                // 컬럼 인덱스: chore_id(0), chore_name(1), choregroup_name(2), freq_type(3), 
                //             freq_value(4), item_id(5), template(6), use(7), 
                //             last_date(8), due_date(9), assignee(10), status(11), color(12)
                
                choreFamilySheet.getRange(row, 10).setValue(dueDate || '');      // due_date
                choreFamilySheet.getRange(row, 11).setValue(assignee || '');     // assignee
                choreFamilySheet.getRange(row, 12).setValue('todo');             // status
                choreFamilySheet.getRange(row, 15).setValue(new Date().toISOString()); // updated_at
                
                Logger.log(`집안일 할당: ${choreId} -> ${assignee}`);
                
                return {
                    success: true,
                    message: '집안일이 할당되었습니다.'
                };
            }
        }
        
        return {
            success: false,
            message: '해당 집안일을 찾을 수 없습니다.'
        };
        
    } catch (error) {
        Logger.log('집안일 할당 오류: ' + error.toString());
        return {
            success: false,
            message: '집안일 할당 중 오류가 발생했습니다: ' + error.toString()
        };
    }
}

/**
 * 집안일 할당 취소
 */
function unassignChoreFromMember(data) {
    try {
        const familyId = data.family_id;
        const choreId = data.chore_id;
        const assignee = data.assignee;  // id_infamily
        
        // 가족별 집안일 시트 가져오기
        const choreFamilySheet = getFamilyChoreSheet(familyId);
        const choreData = choreFamilySheet.getDataRange().getValues();
        
        // 해당 chore_id 찾아서 assignee, due_date, status 초기화
        for (let i = 1; i < choreData.length; i++) {
            if (choreData[i][0] === choreId && choreData[i][10] === assignee) {  // chore_id와 assignee 모두 일치
                const row = i + 1;
                
                // 컬럼 인덱스: chore_id(0), chore_name(1), choregroup_name(2), freq_type(3), 
                //             freq_value(4), item_id(5), template(6), use(7), 
                //             last_date(8), due_date(9), assignee(10), status(11), color(12)
                
                choreFamilySheet.getRange(row, 10).setValue('');      // due_date 초기화
                choreFamilySheet.getRange(row, 11).setValue('');      // assignee 초기화
                choreFamilySheet.getRange(row, 12).setValue('');      // status 초기화
                choreFamilySheet.getRange(row, 15).setValue(new Date().toISOString()); // updated_at
                
                Logger.log(`집안일 할당 취소: ${choreId} (${assignee})`);
                
                return {
                    success: true,
                    message: '집안일 할당이 취소되었습니다.'
                };
            }
        }
        
        return {
            success: false,
            message: '할당된 집안일을 찾을 수 없습니다.'
        };
        
    } catch (error) {
        Logger.log('집안일 할당 취소 오류: ' + error.toString());
        return {
            success: false,
            message: '집안일 할당 취소 중 오류가 발생했습니다: ' + error.toString()
        };
    }
}

/**
 * 집안일 완료 처리
 * - last_date를 오늘로 업데이트
 * - assignee, due_date, status 초기화
 */
function completeChore(data) {
    try {
        const familyId = data.familyId;
        const choreId = data.choreId;
        const completedDate = data.completedDate; // YYYY-MM-DD 형식
        const userId = data.userId; // 완료한 사용자 ID (추가)
        
        // 가족별 집안일 시트 가져오기
        const choreFamilySheet = getFamilyChoreSheet(familyId);
        const choreData = choreFamilySheet.getDataRange().getValues();
        
        // 해당 chore_id 찾아서 last_date 업데이트 및 할당 정보 초기화
        for (let i = 1; i < choreData.length; i++) {
            if (choreData[i][0] === choreId) {
                const row = i + 1;
                const assignee = choreData[i][10]; // 기존 assignee 저장 (조개 지급용)
                
                // 컬럼 인덱스: chore_id(0), chore_name(1), choregroup_name(2), freq_type(3), 
                //             freq_value(4), item_id(5), template(6), use(7), 
                //             last_date(8), due_date(9), assignee(10), status(11), color(12)
                
                choreFamilySheet.getRange(row, 9).setValue(completedDate);  // last_date = 완료 날짜
                choreFamilySheet.getRange(row, 10).setValue('');            // due_date 초기화
                choreFamilySheet.getRange(row, 11).setValue('');            // assignee 초기화
                choreFamilySheet.getRange(row, 12).setValue('완료');        // status = '완료'
                choreFamilySheet.getRange(row, 15).setValue(new Date().toISOString()); // updated_at
                
                Logger.log(`집안일 완료: ${choreId}, 완료일: ${completedDate}, 완료자: ${userId}`);
                
                // 조개 보상 지급 (집안일 완료 시 조개 1개 증가)
                if (userId) {
                    updateUserShellCount(userId, 1);
                    Logger.log(`조개 보상 지급: ${userId}에게 조개 +1`);
                }
                
                return {
                    success: true,
                    message: '집안일이 완료되었습니다. 조개 +1 🐚',
                    choreId: choreId,
                    completedDate: completedDate,
                    shellReward: 1
                };
            }
        }
        
        return {
            success: false,
            message: '해당 집안일을 찾을 수 없습니다.'
        };
        
    } catch (error) {
        Logger.log('집안일 완료 처리 오류: ' + error.toString());
        return {
            success: false,
            message: '집안일 완료 처리 중 오류가 발생했습니다: ' + error.toString()
        };
    }
}

/**
 * 기존 가족에 가입
 */
function joinFamily(data) {
    try {
        const userId = data.userId;
        const familyId = data.familyId;
        const nickname = data.nickname;
        
        // 이미 가입되어 있는지 확인 및 현재 구성원 수 계산
        const membersSheet = getSheet(SHEET_NAMES.FAMILY_MEMBERS);
        const membersData = membersSheet.getDataRange().getValues();
        
        let memberCount = 0;
        for (let i = 1; i < membersData.length; i++) {
            if (membersData[i][1] === familyId) {  // family_id 컬럼
                memberCount++;
                if (membersData[i][2] === userId) {  // user_id 컬럼
                    return {
                        success: false,
                        message: '이미 해당 가족에 가입되어 있습니다.'
                    };
                }
            }
        }
        
        // 가족 구성원에 추가 (memberCount + 1번째 구성원)
        const idInFamily = familyId + '_' + (memberCount + 1);
        const now = new Date().toISOString();
        
        membersSheet.appendRow([
            idInFamily,      // id_infamily (family_id + _2, _3, ...)
            familyId,        // family_id
            userId,          // user_id
            nickname,        // nick_infamily
            'member',        // role
            now,             // created_at
            now              // updated_at
        ]);
        
        // 가족 이름 및 member_count 업데이트
        const familySheet = getSheet(SHEET_NAMES.FAMILY);
        const familyData = familySheet.getDataRange().getValues();
        let familyName = '';
        
        for (let i = 1; i < familyData.length; i++) {
            if (familyData[i][0] === familyId) {
                familyName = familyData[i][1];
                // member_count 업데이트 (3번 인덱스)
                familySheet.getRange(i + 1, 4).setValue(memberCount + 1);
                break;
            }
        }
        
        // 가족별 집안일 시트가 없으면 생성
        const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
        const choreFamilySheetName = SHEET_NAMES.CHORE_FAMILY + '_' + familyId;
        if (!spreadsheet.getSheetByName(choreFamilySheetName)) {
            createFamilyChoreSheet(familyId);
        }
        
        Logger.log(`가족 가입: ${userId} -> ${familyId} (${idInFamily})`);
        
        return {
            success: true,
            familyId: familyId,
            familyName: familyName,
            idInFamily: idInFamily,  // 가족 구성원 ID 반환
            joinDate: now.split('T')[0],  // 가족 가입일 (YYYY-MM-DD 형식)
            message: '가족에 가입되었습니다.'
        };
    } catch (error) {
        Logger.log('가족 가입 오류: ' + error.toString());
        return {
            success: false,
            message: '가족 가입 중 오류가 발생했습니다: ' + error.toString()
        };
    }
}
