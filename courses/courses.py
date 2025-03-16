import csv
import json

def csv_to_json(csv_file_path, json_file_path):
    # CSV 파일 읽기
    with open(csv_file_path, mode='r', encoding='utf-8') as csv_file:
        csv_reader = csv.DictReader(csv_file)

        # 데이터를 리스트로 변환
        data = []
        for row in csv_reader:
            # 필요한 필드만 선택하거나 모든 필드를 포함
            course = {
                "grade": row["학년"],
                "class": row["반"],
                "campus": row["캠퍼스"],
                "department": row["학부(과)명"],
                "major": row["전공명"],
                "type": row["이수구분"],
                "name": row["강좌(과목)명"],
                "capacity": row["신청/제한"],
                "credits": row["학점"],
                "professor": row["담당교수"],
                "evaluation": row["강의평가"],
                "time": row["강의시간"],
                "category": row["영 역"],
                "syllabus": row["강의계획서"],
                "note": row["비 고"]
            }
            data.append(course)

    # JSON 파일로 저장
    with open(json_file_path, mode='w', encoding='utf-8') as json_file:
        json.dump(data, json_file, ensure_ascii=False, indent=4)

# 파일 경로 설정
csv_file_path = 'courses.csv'  # CSV 파일 경로
json_file_path = 'courses.json'  # 저장할 JSON 파일 경로

# 변환 실행
csv_to_json(csv_file_path, json_file_path)

print(f"CSV 파일이 JSON으로 변환되어 {json_file_path}에 저장되었습니다.")