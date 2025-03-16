// 시간표 초기화 함수
function initializeTimetable() {
    const timetable = document.getElementById('timetable');
    const tbody = timetable.querySelector('tbody');
    tbody.innerHTML = '';

    // 9시부터 18시까지 시간표 생성
    for (let hour = 9; hour <= 18; hour++) {
        const row = document.createElement('tr');

        // 시간 셀
        const timeCell = document.createElement('th');
        timeCell.textContent = `${hour}:00`;
        row.appendChild(timeCell);

        // 요일별 셀 (월~금)
        for (let day = 0; day < 5; day++) {
            const cell = document.createElement('td');
            cell.dataset.day = day;
            cell.dataset.hour = hour;
            cell.className = 'timetable-cell';
            row.appendChild(cell);
        }

        tbody.appendChild(row);
    }
}

// 시간표 생성 함수
function generateTimetable() {
    // 선택된 강의 가져오기
    const selectedCourses = getSelectedCourses();

    // 시간표 초기화
    clearTimetable();

    // 선택된 강의를 시간표에 표시
    displaySelectedCourses(selectedCourses);

    // 결과 표시
    document.getElementById('resultCount').textContent =
        `선택된 강의: ${selectedCourses.length}개`;
}

// 선택된 강의 가져오기
function getSelectedCourses() {
    const checkboxes = document.querySelectorAll('#courseList input[type="checkbox"]:checked');
    return Array.from(checkboxes).map(cb => {
        const index = parseInt(cb.value);
        return allCourses[index];
    });
}

// 시간표 초기화
function clearTimetable() {
    const cells = document.querySelectorAll('#timetable tbody td');
    cells.forEach(cell => {
        cell.innerHTML = '';
        cell.className = 'timetable-cell';
        cell.style.backgroundColor = '';
    });
}

// 선택된 강의를 시간표에 표시
function displaySelectedCourses(courses) {
    // 각 강의에 대해
    courses.forEach((course, index) => {
        // 강의 시간 파싱 (예: "월7-9(A602)" -> 요일: "월", 시작: 7, 끝: 9)
        const timeInfo = parseClassTime(course.time);

        if (!timeInfo) return; // 파싱 실패 시 건너뛰기

        // 색상 생성 (각 강의마다 다른 색상)
        const color = getRandomColor(index);

        // 시간표에 강의 추가
        addCourseToTimetable(course, timeInfo, color);
    });
}

// 강의 시간 문자열 파싱
function parseClassTime(timeString) {
    if (!timeString || timeString.trim() === '') return null;

    // 원격 강의 처리
    if (!timeString.includes('(')) return null;

    // 정규식으로 요일, 시작 시간, 종료 시간, 강의실 추출
    const regex = /([월화수목금토일])(\d+)-(\d+)\(([^)]+)\)/;
    const match = timeString.match(regex);

    if (!match) return null;

    return {
        day: match[1], // 요일
        start: parseInt(match[2]), // 시작 교시
        end: parseInt(match[3]), // 종료 교시
        room: match[4] // 강의실
    };
}

// 요일을 인덱스로 변환 (월=0, 화=1, ...)
function dayToIndex(day) {
    const days = { '월': 0, '화': 1, '수': 2, '목': 3, '금': 4, '토': 5, '일': 6 };
    return days[day] || 0;
}

// 시간표에 강의 추가
function addCourseToTimetable(course, timeInfo, color) {
    const table = document.getElementById('timetable');
    const dayIndex = dayToIndex(timeInfo.day) + 1; // +1은 첫 번째 열이 시간을 표시하기 때문

    // 각 교시에 대해
    for (let hour = timeInfo.start; hour <= timeInfo.end; hour++) {
        // 시간표 행 인덱스 계산 (9시가 첫 번째 행이라고 가정)
        const rowIndex = hour; // 9시가 1행, 10시가 2행, ...

        if (rowIndex < 1 || rowIndex >= table.rows.length) continue;

        // 해당 셀 가져오기
        const cell = table.rows[rowIndex].cells[dayIndex];

        // 셀에 강의 정보 추가
        cell.innerHTML = `
            <div class="course-info">
                <div class="course-name">${course.name}</div>
                <div class="course-details">${course.professor}</div>
                <div class="course-room">${timeInfo.room}</div>
            </div>
        `;
        cell.style.backgroundColor = color;
    }
}

// 랜덤 색상 생성 (파스텔 톤)
function getRandomColor(index) {
    const colors = [
        '#FFD8D8', '#FFEFD8', '#FFFBD8', '#E8FFD8',
        '#D8FFEF', '#D8F9FF', '#D8E4FF', '#EFD8FF',
        '#FFE4E1', '#E0FFFF', '#FAFAD2', '#D8BFD8'
    ];
    return colors[index % colors.length];
}




// 전역 변수로 강의 데이터 저장
let allCourses = [];
let filteredCourses = [];

// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', function() {
    loadCourses();
    initializeTimetable();

    // 필터 버튼에 이벤트 리스너 추가
    document.getElementById('applyFilter').addEventListener('click', applyFilters);
    document.getElementById('resetFilter').addEventListener('click', resetFilters);

    // 검색 입력란에 실시간 필터링 기능 추가
    document.getElementById('searchInput').addEventListener('input', function() {
        applyFilters();
    });
});

// 강의 데이터 로드 함수
function loadCourses() {
    fetch('courses/courses.json')
        .then(response => response.json())
        .then(data => {
            allCourses = data;
            filteredCourses = [...allCourses];
            console.log(allCourses); // 콘솔에 전체 데이터 출력
            displayCourseList(filteredCourses);
            populateFilterOptions();
        })
        .catch(error => console.error('강의 데이터를 불러오는 중 오류가 발생했습니다:', error));
}


// 필터 옵션 채우기
function populateFilterOptions() {
    // 학부(과) 필터 옵션 채우기
    const departments = [...new Set(allCourses.map(course => course.department))];
    const departmentFilter = document.getElementById('departmentFilter');
    departments.forEach(dept => {
        if (dept && dept !== '-') {  // 빈 값이나 '-' 제외
            const option = document.createElement('option');
            option.value = dept;
            option.textContent = dept;
            departmentFilter.appendChild(option);
        }
    });

    // 이수구분 필터 옵션 채우기
    const types = [...new Set(allCourses.map(course => course.type))];
    const categoryFilter = document.getElementById('categoryFilter');
    types.forEach(type => {
        if (type && type !== '-') {
            const option = document.createElement('option');
            option.value = type;
            option.textContent = type;
            categoryFilter.appendChild(option);
        }
    });

    const areas = [...new Set(allCourses.map(course => course.category))];
    const areasFilter = document.getElementById('areasFilter');
    areas.forEach(area => {
        if (area && area !== '-') {
            const option = document.createElement('option');
            option.value = area;
            option.textContent = area;
            areasFilter.appendChild(option);
        }
    });


    // 담당교수 필터 옵션 채우기
    const professors = [...new Set(allCourses.map(course => course.professor))];
    const professorFilter = document.getElementById('professorFilter');
    professors.forEach(professor => {
        if (professor && professor !== '미정' && professor !== '-') {
            const option = document.createElement('option');
            option.value = professor;
            option.textContent = professor;
            professorFilter.appendChild(option);
        }
    });


}
// 필터 적용 함수
function applyFilters() {
    const campus = document.getElementById('campusFilter').value;
    const department = document.getElementById('departmentFilter').value;
    const type = document.getElementById('categoryFilter').value;
    const professor = document.getElementById('professorFilter').value;
    const credit = document.getElementById('creditFilter').value;
    const areas = document.getElementById('areasFilter').value;
    const searchText = document.getElementById('searchInput').value.toLowerCase();

    filteredCourses = allCourses.filter(course => {
        return (campus === '' || course.campus === campus) &&
            (department === '' || course.department === department) &&
            (type === '' || course.type === type) &&
            (professor === '' || course.professor === professor) &&
            (credit === '' || course.credits.toString().includes(credit)) &&
            (areas === '' || course.areas === areas) &&
            (searchText === '' || course.name.toLowerCase().includes(searchText));
    });

    displayCourseList(filteredCourses);
    document.getElementById('resultCount').textContent = `검색 결과: ${filteredCourses.length}개 강의`;
}


// 필터 초기화 함수
function resetFilters() {
    document.getElementById('campusFilter').value = '';
    document.getElementById('departmentFilter').value = '';
    document.getElementById('categoryFilter').value = '';
    document.getElementById('professorFilter').value = '';
    document.getElementById('creditFilter').value = '';
    document.getElementById('areasFilter').value = '';
    document.getElementById('searchInput').value = '';


    filteredCourses = [...allCourses];
    displayCourseList(filteredCourses);
    document.getElementById('resultCount').textContent = '';
}

// 강의 목록 표시 함수 수정
function displayCourseList(courses) {
    const courseList = document.getElementById('courseList');
    courseList.innerHTML = '';

    courses.forEach((course, index) => {
        const courseElement = document.createElement('div');
        courseElement.className = 'course-item';

        // 고유한 ID 생성 (안전하게 이스케이프 처리)
        const safeCourseName = CSS.escape(course.name.replace(/\s+/g, ''));
        const checkboxId = `course-${index}-${safeCourseName}`;

        courseElement.innerHTML = `
            <input type="checkbox" id="${checkboxId}" value="${index}" class="course-checkbox">
            <label for="${checkboxId}">
                <span class="course-name">${course.name}</span>
                <span class="course-info">${course.professor} | ${course.credits} | ${course.time}</span>
            </label>
        `;
        courseList.appendChild(courseElement);

        // 체크박스에 직접 이벤트 리스너 추가 (querySelector에서도 이스케이프 필요)
        const checkbox = courseElement.querySelector(`#${CSS.escape(checkboxId)}`);
        checkbox.addEventListener('change', function (e) {
            // 이벤트 전파 중지
            e.stopPropagation();
        });
    });
}
