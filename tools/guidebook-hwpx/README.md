# 교사 가이드북 HWPX(부록용) 만들기

- `build_guide.py` — `public/guide.html`(앱 안 가이드북)의 9개 장과 그림을 HWPX로 옮기고, 최근 기능
  (엑셀로 내려받기, 문제 1,000개 이상, 학생 출제 영역 선택, 구글 시트 연동·대시보드, 레이드 기록)을 끼워 넣는다.
  필요: `pip install python-hwpx beautifulsoup4 pillow`. guide.html의 그림은 실행 전에 `gimg/gNN.png`로 풀어 둔다.
- `guide_shots.mjs` — 새 기능 스크린샷(`shots/`)을 메인 빌드 + 가짜 API로 찍는다.
- `preview_hwpx.py` — HWPX를 대략적인 A4 HTML로 그려 쪽 배치를 확인한다(한글 프로그램과 줄바꿈은 조금 다름).
