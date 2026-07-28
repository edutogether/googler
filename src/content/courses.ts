import type { Course, CourseLevel } from '../domain/course';

export const courses: Course[] = [
  {
    "id": "educator-level-1",
    "level": "L1",
    "title": "Level 1",
    "description": "하루 30분, 매일매일 미션을 깨고 랭킹 점수를 획득하세요!",
    "days": [
      {
        "id": "l1-day-01",
        "progressKey": "l1_1",
        "day": "월요일",
        "theme": "blue",
        "title": "크롬 & 구글 드라이브",
        "description": "크롬 동기화, 파일 업로드 및 폴더 공유하기",
        "resources": {
          "help": {
            "label": "official-help",
            "url": "https://support.google.com/drive/answer/2424368?hl=ko"
          },
          "youtube": {
            "label": "video-content",
            "url": "https://www.youtube.com/results?search_query=구글+공인+교육자+level+1+크롬+드라이브"
          },
          "education": {
            "label": "official-guide",
            "url": "https://skillshop.exceedlms.com/student/path/61209-google-workspace"
          }
        },
        "missions": [
          {
            "id": "l1-day-01-mission-01",
            "progressKey": "0",
            "text": "공식 도움말 살펴보기 완료 ! 💡"
          },
          {
            "id": "l1-day-01-mission-02",
            "progressKey": "1",
            "text": "유튜브 영상 콘텐츠 따라하기 완료 ! 📺"
          },
          {
            "id": "l1-day-01-mission-03",
            "progressKey": "2",
            "text": "공식 가이드 콘텐츠 실습하기 완료 ! 🖱️"
          }
        ]
      },
      {
        "id": "l1-day-02",
        "progressKey": "l1_2",
        "day": "화요일",
        "theme": "blue",
        "title": "구글 문서 (Docs)",
        "description": "문서 공동 편집, 댓글 및 제안 모드 활용",
        "resources": {
          "help": {
            "label": "official-help",
            "url": "https://support.google.com/docs/answer/7068618?hl=ko"
          },
          "youtube": {
            "label": "video-content",
            "url": "https://www.youtube.com/results?search_query=구글+공인+교육자+level+1+구글+문서"
          },
          "education": {
            "label": "official-guide",
            "url": "https://skillshop.exceedlms.com/student/path/61209-google-workspace"
          }
        },
        "missions": [
          {
            "id": "l1-day-02-mission-01",
            "progressKey": "0",
            "text": "공식 도움말 살펴보기 완료 ! 💡"
          },
          {
            "id": "l1-day-02-mission-02",
            "progressKey": "1",
            "text": "유튜브 영상 콘텐츠 따라하기 완료 ! 📺"
          },
          {
            "id": "l1-day-02-mission-03",
            "progressKey": "2",
            "text": "공식 가이드 콘텐츠 실습하기 완료 ! 🖱️"
          }
        ]
      },
      {
        "id": "l1-day-03",
        "progressKey": "l1_3",
        "day": "수요일",
        "theme": "yellow",
        "title": "구글 프레젠테이션",
        "description": "슬라이드 테마 적용, 애니메이션 및 동영상 삽입",
        "resources": {
          "help": {
            "label": "official-help",
            "url": "https://support.google.com/docs/answer/2720754?hl=ko"
          },
          "youtube": {
            "label": "video-content",
            "url": "https://www.youtube.com/results?search_query=구글+공인+교육자+level+1+프레젠테이션"
          },
          "education": {
            "label": "official-guide",
            "url": "https://skillshop.exceedlms.com/student/path/61209-google-workspace"
          }
        },
        "missions": [
          {
            "id": "l1-day-03-mission-01",
            "progressKey": "0",
            "text": "공식 도움말 살펴보기 완료 ! 💡"
          },
          {
            "id": "l1-day-03-mission-02",
            "progressKey": "1",
            "text": "유튜브 영상 콘텐츠 따라하기 완료 ! 📺"
          },
          {
            "id": "l1-day-03-mission-03",
            "progressKey": "2",
            "text": "공식 가이드 콘텐츠 실습하기 완료 ! 🖱️"
          }
        ]
      },
      {
        "id": "l1-day-04",
        "progressKey": "l1_4",
        "day": "목요일",
        "theme": "purple",
        "title": "구글 설문지 (Forms)",
        "description": "설문지 만들고 퀴즈로 설정하여 자동 채점하기",
        "resources": {
          "help": {
            "label": "official-help",
            "url": "https://support.google.com/docs/answer/6281888?hl=ko"
          },
          "youtube": {
            "label": "video-content",
            "url": "https://www.youtube.com/results?search_query=구글+공인+교육자+level+1+설문지"
          },
          "education": {
            "label": "official-guide",
            "url": "https://skillshop.exceedlms.com/student/path/61209-google-workspace"
          }
        },
        "missions": [
          {
            "id": "l1-day-04-mission-01",
            "progressKey": "0",
            "text": "공식 도움말 살펴보기 완료 ! 💡"
          },
          {
            "id": "l1-day-04-mission-02",
            "progressKey": "1",
            "text": "유튜브 영상 콘텐츠 따라하기 완료 ! 📺"
          },
          {
            "id": "l1-day-04-mission-03",
            "progressKey": "2",
            "text": "공식 가이드 콘텐츠 실습하기 완료 ! 🖱️"
          }
        ]
      },
      {
        "id": "l1-day-05",
        "progressKey": "l1_5",
        "day": "금요일",
        "theme": "green",
        "title": "구글 클래스룸",
        "description": "수업 개설, 학생 초대, 자료 및 과제 게시하기",
        "resources": {
          "help": {
            "label": "official-help",
            "url": "https://support.google.com/edu/classroom/answer/6020279?hl=ko"
          },
          "youtube": {
            "label": "video-content",
            "url": "https://www.youtube.com/results?search_query=구글+공인+교육자+level+1+클래스룸"
          },
          "education": {
            "label": "official-guide",
            "url": "https://skillshop.exceedlms.com/student/path/61209-google-workspace"
          }
        },
        "missions": [
          {
            "id": "l1-day-05-mission-01",
            "progressKey": "0",
            "text": "공식 도움말 살펴보기 완료 ! 💡"
          },
          {
            "id": "l1-day-05-mission-02",
            "progressKey": "1",
            "text": "유튜브 영상 콘텐츠 따라하기 완료 ! 📺"
          },
          {
            "id": "l1-day-05-mission-03",
            "progressKey": "2",
            "text": "공식 가이드 콘텐츠 실습하기 완료 ! 🖱️"
          }
        ]
      },
      {
        "id": "l1-day-06",
        "progressKey": "l1_6",
        "day": "월요일",
        "theme": "red",
        "title": "지메일 (Gmail)",
        "description": "라벨 관리, 중요 필터 설정, 내 서명 만들기",
        "resources": {
          "help": {
            "label": "official-help",
            "url": "https://support.google.com/mail/answer/8395?hl=ko"
          },
          "youtube": {
            "label": "video-content",
            "url": "https://www.youtube.com/results?search_query=구글+공인+교육자+level+1+지메일"
          },
          "education": {
            "label": "official-guide",
            "url": "https://skillshop.exceedlms.com/student/path/61209-google-workspace"
          }
        },
        "missions": [
          {
            "id": "l1-day-06-mission-01",
            "progressKey": "0",
            "text": "공식 도움말 살펴보기 완료 ! 💡"
          },
          {
            "id": "l1-day-06-mission-02",
            "progressKey": "1",
            "text": "유튜브 영상 콘텐츠 따라하기 완료 ! 📺"
          },
          {
            "id": "l1-day-06-mission-03",
            "progressKey": "2",
            "text": "공식 가이드 콘텐츠 실습하기 완료 ! 🖱️"
          }
        ]
      },
      {
        "id": "l1-day-07",
        "progressKey": "l1_7",
        "day": "화요일",
        "theme": "blue",
        "title": "구글 캘린더 & Tasks",
        "description": "일정 공유, 회의 예약, 할 일(Tasks) 연동",
        "resources": {
          "help": {
            "label": "official-help",
            "url": "https://support.google.com/calendar/answer/2465776?hl=ko"
          },
          "youtube": {
            "label": "video-content",
            "url": "https://www.youtube.com/results?search_query=구글+공인+교육자+level+1+캘린더"
          },
          "education": {
            "label": "official-guide",
            "url": "https://skillshop.exceedlms.com/student/path/61209-google-workspace"
          }
        },
        "missions": [
          {
            "id": "l1-day-07-mission-01",
            "progressKey": "0",
            "text": "공식 도움말 살펴보기 완료 ! 💡"
          },
          {
            "id": "l1-day-07-mission-02",
            "progressKey": "1",
            "text": "유튜브 영상 콘텐츠 따라하기 완료 ! 📺"
          },
          {
            "id": "l1-day-07-mission-03",
            "progressKey": "2",
            "text": "공식 가이드 콘텐츠 실습하기 완료 ! 🖱️"
          }
        ]
      },
      {
        "id": "l1-day-08",
        "progressKey": "l1_8",
        "day": "수요일",
        "theme": "green",
        "title": "구글 미트 (Meet)",
        "description": "화면 공유, 소모임 방 만들기",
        "resources": {
          "help": {
            "label": "official-help",
            "url": "https://support.google.com/meet/answer/9302870?hl=ko"
          },
          "youtube": {
            "label": "video-content",
            "url": "https://www.youtube.com/results?search_query=구글+공인+교육자+level+1+미트"
          },
          "education": {
            "label": "official-guide",
            "url": "https://skillshop.exceedlms.com/student/path/61209-google-workspace"
          }
        },
        "missions": [
          {
            "id": "l1-day-08-mission-01",
            "progressKey": "0",
            "text": "공식 도움말 살펴보기 완료 ! 💡"
          },
          {
            "id": "l1-day-08-mission-02",
            "progressKey": "1",
            "text": "유튜브 영상 콘텐츠 따라하기 완료 ! 📺"
          },
          {
            "id": "l1-day-08-mission-03",
            "progressKey": "2",
            "text": "공식 가이드 콘텐츠 실습하기 완료 ! 🖱️"
          }
        ]
      },
      {
        "id": "l1-day-09",
        "progressKey": "l1_9",
        "day": "목요일",
        "theme": "indigo",
        "title": "구글 사이트 도구",
        "description": "나만의 멋진 학급 포트폴리오 사이트 제작",
        "resources": {
          "help": {
            "label": "official-help",
            "url": "https://support.google.com/sites/answer/90569?hl=ko"
          },
          "youtube": {
            "label": "video-content",
            "url": "https://www.youtube.com/results?search_query=구글+공인+교육자+level+1+사이트도구"
          },
          "education": {
            "label": "official-guide",
            "url": "https://skillshop.exceedlms.com/student/path/61209-google-workspace"
          }
        },
        "missions": [
          {
            "id": "l1-day-09-mission-01",
            "progressKey": "0",
            "text": "공식 도움말 살펴보기 완료 ! 💡"
          },
          {
            "id": "l1-day-09-mission-02",
            "progressKey": "1",
            "text": "유튜브 영상 콘텐츠 따라하기 완료 ! 📺"
          },
          {
            "id": "l1-day-09-mission-03",
            "progressKey": "2",
            "text": "공식 가이드 콘텐츠 실습하기 완료 ! 🖱️"
          }
        ]
      },
      {
        "id": "l1-day-10",
        "progressKey": "l1_10",
        "day": "금요일",
        "theme": "yellow",
        "title": "구글 그룹스 & 킵",
        "description": "게시판형 그룹 만들기, 스마트하게 메모",
        "resources": {
          "help": {
            "label": "official-help",
            "url": "https://support.google.com/groups/answer/2464926?hl=ko"
          },
          "youtube": {
            "label": "video-content",
            "url": "https://www.youtube.com/results?search_query=구글+공인+교육자+level+1+그룹스+킵"
          },
          "education": {
            "label": "official-guide",
            "url": "https://skillshop.exceedlms.com/student/path/61209-google-workspace"
          }
        },
        "missions": [
          {
            "id": "l1-day-10-mission-01",
            "progressKey": "0",
            "text": "공식 도움말 살펴보기 완료 ! 💡"
          },
          {
            "id": "l1-day-10-mission-02",
            "progressKey": "1",
            "text": "유튜브 영상 콘텐츠 따라하기 완료 ! 📺"
          },
          {
            "id": "l1-day-10-mission-03",
            "progressKey": "2",
            "text": "공식 가이드 콘텐츠 실습하기 완료 ! 🖱️"
          }
        ]
      }
    ]
  },
  {
    "id": "educator-level-2",
    "level": "L2",
    "title": "Level 2",
    "description": "하루 30분, 매일매일 미션을 깨고 랭킹 점수를 획득하세요!",
    "days": [
      {
        "id": "l2-day-01",
        "progressKey": "l2_1",
        "day": "월요일",
        "theme": "blue",
        "title": "드라이브 & 문서 심화",
        "description": "공유 드라이브 관리, 고급 문서 서식 및 번역",
        "resources": {
          "help": {
            "label": "official-help",
            "url": "https://support.google.com/a/users/answer/9310156?hl=ko"
          },
          "youtube": {
            "label": "video-content",
            "url": "https://www.youtube.com/results?search_query=구글+공인+교육자+level+2+드라이브+문서"
          },
          "education": {
            "label": "official-guide",
            "url": "https://skillshop.exceedlms.com/student/path/61210-google-workspace-advanced"
          }
        },
        "missions": [
          {
            "id": "l2-day-01-mission-01",
            "progressKey": "0",
            "text": "공식 도움말 살펴보기 완료 ! 💡"
          },
          {
            "id": "l2-day-01-mission-02",
            "progressKey": "1",
            "text": "유튜브 영상 콘텐츠 따라하기 완료 ! 📺"
          },
          {
            "id": "l2-day-01-mission-03",
            "progressKey": "2",
            "text": "공식 가이드 콘텐츠 실습하기 완료 ! 🖱️"
          }
        ]
      },
      {
        "id": "l2-day-02",
        "progressKey": "l2_2",
        "day": "화요일",
        "theme": "green",
        "title": "스프레드시트 심화",
        "description": "피벗 테이블, VLOOKUP 함수 데이터 분석",
        "resources": {
          "help": {
            "label": "official-help",
            "url": "https://support.google.com/docs/answer/1272900?hl=ko"
          },
          "youtube": {
            "label": "video-content",
            "url": "https://www.youtube.com/results?search_query=구글+공인+교육자+level+2+스프레드시트"
          },
          "education": {
            "label": "official-guide",
            "url": "https://skillshop.exceedlms.com/student/path/61210-google-workspace-advanced"
          }
        },
        "missions": [
          {
            "id": "l2-day-02-mission-01",
            "progressKey": "0",
            "text": "공식 도움말 살펴보기 완료 ! 💡"
          },
          {
            "id": "l2-day-02-mission-02",
            "progressKey": "1",
            "text": "유튜브 영상 콘텐츠 따라하기 완료 ! 📺"
          },
          {
            "id": "l2-day-02-mission-03",
            "progressKey": "2",
            "text": "공식 가이드 콘텐츠 실습하기 완료 ! 🖱️"
          }
        ]
      },
      {
        "id": "l2-day-03",
        "progressKey": "l2_3",
        "day": "수요일",
        "theme": "purple",
        "title": "설문지 & 클래스룸 심화",
        "description": "답변 기준 섹션 이동, 클래스룸 성적 채점표",
        "resources": {
          "help": {
            "label": "official-help",
            "url": "https://support.google.com/docs/answer/141062?hl=ko"
          },
          "youtube": {
            "label": "video-content",
            "url": "https://www.youtube.com/results?search_query=구글+공인+교육자+level+2+설문지+클래스룸"
          },
          "education": {
            "label": "official-guide",
            "url": "https://skillshop.exceedlms.com/student/path/61210-google-workspace-advanced"
          }
        },
        "missions": [
          {
            "id": "l2-day-03-mission-01",
            "progressKey": "0",
            "text": "공식 도움말 살펴보기 완료 ! 💡"
          },
          {
            "id": "l2-day-03-mission-02",
            "progressKey": "1",
            "text": "유튜브 영상 콘텐츠 따라하기 완료 ! 📺"
          },
          {
            "id": "l2-day-03-mission-03",
            "progressKey": "2",
            "text": "공식 가이드 콘텐츠 실습하기 완료 ! 🖱️"
          }
        ]
      },
      {
        "id": "l2-day-04",
        "progressKey": "l2_4",
        "day": "목요일",
        "theme": "red",
        "title": "유튜브 (YouTube)",
        "description": "교육용 채널 관리, 재생목록, 제한 모드 설정",
        "resources": {
          "help": {
            "label": "official-help",
            "url": "https://support.google.com/youtube/answer/1646861?hl=ko"
          },
          "youtube": {
            "label": "video-content",
            "url": "https://www.youtube.com/results?search_query=구글+공인+교육자+level+2+유튜브"
          },
          "education": {
            "label": "official-guide",
            "url": "https://skillshop.exceedlms.com/student/path/61210-google-workspace-advanced"
          }
        },
        "missions": [
          {
            "id": "l2-day-04-mission-01",
            "progressKey": "0",
            "text": "공식 도움말 살펴보기 완료 ! 💡"
          },
          {
            "id": "l2-day-04-mission-02",
            "progressKey": "1",
            "text": "유튜브 영상 콘텐츠 따라하기 완료 ! 📺"
          },
          {
            "id": "l2-day-04-mission-03",
            "progressKey": "2",
            "text": "공식 가이드 콘텐츠 실습하기 완료 ! 🖱️"
          }
        ]
      },
      {
        "id": "l2-day-05",
        "progressKey": "l2_5",
        "day": "금요일",
        "theme": "indigo",
        "title": "사이트 & 블로거 심화",
        "description": "고급 사이트 레이아웃, 교육용 블로그 구성",
        "resources": {
          "help": {
            "label": "official-help",
            "url": "https://support.google.com/sites/answer/90569?hl=ko"
          },
          "youtube": {
            "label": "video-content",
            "url": "https://www.youtube.com/results?search_query=구글+공인+교육자+level+2+사이트도구"
          },
          "education": {
            "label": "official-guide",
            "url": "https://skillshop.exceedlms.com/student/path/61210-google-workspace-advanced"
          }
        },
        "missions": [
          {
            "id": "l2-day-05-mission-01",
            "progressKey": "0",
            "text": "공식 도움말 살펴보기 완료 ! 💡"
          },
          {
            "id": "l2-day-05-mission-02",
            "progressKey": "1",
            "text": "유튜브 영상 콘텐츠 따라하기 완료 ! 📺"
          },
          {
            "id": "l2-day-05-mission-03",
            "progressKey": "2",
            "text": "공식 가이드 콘텐츠 실습하기 완료 ! 🖱️"
          }
        ]
      },
      {
        "id": "l2-day-06",
        "progressKey": "l2_6",
        "day": "월요일",
        "theme": "green",
        "title": "구글 어스 & 지도",
        "description": "프로젝트 만들기, 스트리트 뷰 활용 수업 설계",
        "resources": {
          "help": {
            "label": "official-help",
            "url": "https://support.google.com/earth/answer/9398104?hl=ko"
          },
          "youtube": {
            "label": "video-content",
            "url": "https://www.youtube.com/results?search_query=구글+공인+교육자+level+2+구글어스"
          },
          "education": {
            "label": "official-guide",
            "url": "https://skillshop.exceedlms.com/student/path/61210-google-workspace-advanced"
          }
        },
        "missions": [
          {
            "id": "l2-day-06-mission-01",
            "progressKey": "0",
            "text": "공식 도움말 살펴보기 완료 ! 💡"
          },
          {
            "id": "l2-day-06-mission-02",
            "progressKey": "1",
            "text": "유튜브 영상 콘텐츠 따라하기 완료 ! 📺"
          },
          {
            "id": "l2-day-06-mission-03",
            "progressKey": "2",
            "text": "공식 가이드 콘텐츠 실습하기 완료 ! 🖱️"
          }
        ]
      },
      {
        "id": "l2-day-07",
        "progressKey": "l2_7",
        "day": "화요일",
        "theme": "blue",
        "title": "지메일 & 캘린더 심화",
        "description": "맞춤 레이아웃, 예약 일정 블록",
        "resources": {
          "help": {
            "label": "official-help",
            "url": "https://support.google.com/calendar/answer/10729749?hl=ko"
          },
          "youtube": {
            "label": "video-content",
            "url": "https://www.youtube.com/results?search_query=구글+공인+교육자+level+2+캘린더"
          },
          "education": {
            "label": "official-guide",
            "url": "https://skillshop.exceedlms.com/student/path/61210-google-workspace-advanced"
          }
        },
        "missions": [
          {
            "id": "l2-day-07-mission-01",
            "progressKey": "0",
            "text": "공식 도움말 살펴보기 완료 ! 💡"
          },
          {
            "id": "l2-day-07-mission-02",
            "progressKey": "1",
            "text": "유튜브 영상 콘텐츠 따라하기 완료 ! 📺"
          },
          {
            "id": "l2-day-07-mission-03",
            "progressKey": "2",
            "text": "공식 가이드 콘텐츠 실습하기 완료 ! 🖱️"
          }
        ]
      },
      {
        "id": "l2-day-08",
        "progressKey": "l2_8",
        "day": "수요일",
        "theme": "yellow",
        "title": "미트 & 챗 스페이스",
        "description": "출석부 자동생성, Q&A 기능, 스페이스 활용",
        "resources": {
          "help": {
            "label": "official-help",
            "url": "https://support.google.com/meet/answer/10091338?hl=ko"
          },
          "youtube": {
            "label": "video-content",
            "url": "https://www.youtube.com/results?search_query=구글+공인+교육자+level+2+미트"
          },
          "education": {
            "label": "official-guide",
            "url": "https://skillshop.exceedlms.com/student/path/61210-google-workspace-advanced"
          }
        },
        "missions": [
          {
            "id": "l2-day-08-mission-01",
            "progressKey": "0",
            "text": "공식 도움말 살펴보기 완료 ! 💡"
          },
          {
            "id": "l2-day-08-mission-02",
            "progressKey": "1",
            "text": "유튜브 영상 콘텐츠 따라하기 완료 ! 📺"
          },
          {
            "id": "l2-day-08-mission-03",
            "progressKey": "2",
            "text": "공식 가이드 콘텐츠 실습하기 완료 ! 🖱️"
          }
        ]
      },
      {
        "id": "l2-day-09",
        "progressKey": "l2_9",
        "day": "목요일",
        "theme": "indigo",
        "title": "구글 트렌드 & 학술검색",
        "description": "데이터 트렌드 시각화, 학술자료 알리미",
        "resources": {
          "help": {
            "label": "official-help",
            "url": "https://support.google.com/trends/?hl=ko"
          },
          "youtube": {
            "label": "video-content",
            "url": "https://www.youtube.com/results?search_query=구글+공인+교육자+level+2+트렌드"
          },
          "education": {
            "label": "official-guide",
            "url": "https://skillshop.exceedlms.com/student/path/61210-google-workspace-advanced"
          }
        },
        "missions": [
          {
            "id": "l2-day-09-mission-01",
            "progressKey": "0",
            "text": "공식 도움말 살펴보기 완료 ! 💡"
          },
          {
            "id": "l2-day-09-mission-02",
            "progressKey": "1",
            "text": "유튜브 영상 콘텐츠 따라하기 완료 ! 📺"
          },
          {
            "id": "l2-day-09-mission-03",
            "progressKey": "2",
            "text": "공식 가이드 콘텐츠 실습하기 완료 ! 🖱️"
          }
        ]
      },
      {
        "id": "l2-day-10",
        "progressKey": "l2_10",
        "day": "금요일",
        "theme": "red",
        "title": "최종 복습 & 모의고사",
        "description": "L2 전체 범위 정리 및 오답 노트 작성",
        "resources": {
          "help": {
            "label": "official-help",
            "url": "https://support.google.com/a/answer/1382206?hl=ko"
          },
          "youtube": {
            "label": "video-content",
            "url": "https://www.youtube.com/results?search_query=구글+공인+교육자+level+2+기출문제"
          },
          "education": {
            "label": "official-guide",
            "url": "https://skillshop.exceedlms.com/student/path/61210-google-workspace-advanced"
          }
        },
        "missions": [
          {
            "id": "l2-day-10-mission-01",
            "progressKey": "0",
            "text": "공식 도움말 살펴보기 완료 ! 💡"
          },
          {
            "id": "l2-day-10-mission-02",
            "progressKey": "1",
            "text": "유튜브 영상 콘텐츠 따라하기 완료 ! 📺"
          },
          {
            "id": "l2-day-10-mission-03",
            "progressKey": "2",
            "text": "공식 가이드 콘텐츠 실습하기 완료 ! 🖱️"
          }
        ]
      }
    ]
  }
];

export const coursesByLevel = Object.fromEntries(courses.map((course) => [course.level, course])) as Record<CourseLevel, Course>;
