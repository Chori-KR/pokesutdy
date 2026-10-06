"""영어 · 초5-6 · 이해 (6영01-01 ~ 10) — 60문제"""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, os.path.dirname(__file__))
from common import Bank
from svgkit import svg, text, line, table, BLUE, ORANGE, C
from kit_ko import KoBank, report
from kit_soc import compare_table
from kit_en import letters, syllables, weather, face, icon, icons_row, in_box

bank = Bank("영어", "초", "영어", "초5-6", "이해", "bank_영어_초5-6_이해.json")
b = KoBank(bank)

# ───────── 지문 ─────────
P1 = b.passage("p1", "My Weekend",
    "Last weekend was great! On Saturday morning, I went to the library with my sister. I borrowed two books about space. In the afternoon, we played badminton in the park. It was sunny, but a little windy. On Sunday, my grandmother visited us. She brought strawberries, and we made strawberry juice together. I went to bed at nine o'clock. I was tired but happy.", "직접 지음")
P2 = b.passage("p2", "An Email from Tom",
    "Hi Yuna, How are you? I'm in Canada now. I live with my uncle in Toronto. It is very cold here in December, and we have lots of snow. Yesterday, I made a snowman with my cousin. I want to visit Korea next summer. I miss you and our school. Please write back soon! Your friend, Tom", "직접 지음")
P3 = b.passage("p3", "School Festival Poster",
    "SCHOOL FESTIVAL! Come and have fun with us! Date: October 20 (Friday). Time: 1 p.m. to 5 p.m. Place: School playground. You can enjoy music shows, a magic show, and a food market. Entrance is free. Please bring your family and friends. If it rains, the festival will be in the gym.", "직접 지음")
P4 = b.passage("p4", "Text Messages",
    "Hana: Hi, Joon! Are you free this Sunday? Joon: Yes, I am. What's up? Hana: I want to see a movie. Do you want to come? Joon: Sure! What time? Hana: How about 2 o'clock? The movie starts at 2:30. Joon: Sounds good. Let's meet in front of the theater. Hana: Great! I'll bring some snacks. Joon: Thanks! See you on Sunday.", "직접 지음")
P5 = b.passage("p5", "How to Make a Sandwich",
    "Today I will show you how to make a cheese sandwich. It is easy and delicious. First, wash your hands. Second, put two slices of bread on a plate. Then, put cheese, tomato, and lettuce on one slice. Next, cover it with the other slice. Finally, cut the sandwich in half. Now you can enjoy your sandwich with a glass of milk!", "직접 지음")
P6 = b.passage("p6", "Tea Around the World",
    "In England, many people drink tea with milk in the afternoon. In Japan, people often enjoy green tea after meals. In Morocco, mint tea is a sign of friendship, and people pour it from a high place. In Korea, many families drink barley tea at home. People enjoy different kinds of tea, but they all share it with friends and family.", "직접 지음")
P7 = b.passage("p7", "Rainy Day",
    "Rain, rain, falling down, On the roof and on the town. I stay inside and watch the rain, Drops are dancing on the window pane. Mom makes cocoa, warm and sweet, I sit on the sofa and tap my feet. I feel so cozy and so glad, This rainy day is not so bad.", "직접 지음")
P8 = b.passage("p8", "Mina and the Lost Ribbon",
    "Mina had a blue ribbon from her grandmother. One day, she lost it on the way home. She looked everywhere, but she could not find it. She sat on a bench and cried. A boy named Leo saw her. \"Why are you crying?\" he asked. \"I lost my ribbon,\" said Mina. Leo helped her look for it. Soon, they found it under a bench. Mina smiled and said, \"Thank you, Leo!\"", "직접 지음")
P9 = b.passage("p9", "Why I Love Reading",
    "I love reading books. Books take me to new places. When I read a fantasy book, I can fly with dragons. When I read a science book, I learn about stars and animals. Reading also makes me calm after a busy day. Every night, I read for twenty minutes before bed. Do you like reading, too? Let's read together!", "직접 지음")
P10 = b.passage("p10", "My New Puppy",
    "I have a new puppy. He is very energetic. He runs around the house all day, jumps on the sofa, and plays with his toys. He also loves to chew my shoes! By evening, he is so tired that he falls asleep right away. Then my house becomes quiet, and I can finally do my homework.", "직접 지음")
P11 = b.passage("p11", "Recycling Is Easy",
    "Recycling helps our Earth. We can recycle paper, plastic, and cans. We put paper in the paper box. We put cans and bottles in separate boxes. Recycling also saves energy and keeps our town clean. Small actions can make a big change. Let's recycle every day!", "직접 지음")
P12 = b.passage("p12", "A School Trip",
    "Yesterday, my class went on a trip to the zoo. We left school at nine o'clock by bus. When we arrived, we first saw the monkeys. Then we watched the elephants take a bath. After lunch, we visited the penguin house. Before we went home, we bought small gifts at the shop. We came back to school at four o'clock. It was a great day!", "직접 지음")

# ───────── 6영01-01 강세·리듬·억양 식별 ─────────
S = "6영01-01"
b.q(S, "C", "television을 읽을 때 가장 강하게 읽는 부분은 어느 것인가요?",
    svg=syllables(["te", "le", "vi", "sion"]), options=["te", "le", "vi", "sion"], answer="te",
    why="television은 첫 번째 음절을 강하게 읽습니다(TE-le-vi-sion).")
b.q(S, "C", "hen, hat, bed, dog 중에서 ten과 끝소리가 같은(라임이 되는) 단어를 쓰세요.",
    answers=["hen"],
    why="ten과 hen은 모두 -en으로 끝납니다.")
b.q(S, "B", "banana의 강세는 어느 음절에 있나요?",
    svg=syllables(["ba", "na", "na"]), options=["두 번째 음절", "첫 번째 음절", "세 번째 음절", "모두 같다"], answer="두 번째 음절",
    why="banana는 ba-NA-na처럼 두 번째 음절을 강하게 읽습니다.")
b.q(S, "B", "다음 중 문장 끝을 올려 읽는(↗) 것이 자연스러운 문장은 무엇인가요?",
    options=["Do you like pizza?", "I like pizza.", "What is your name?", "Close the door."], answer="Do you like pizza?",
    why="Yes/No로 답하는 의문문은 끝을 올려 읽습니다.")
b.q(S, "A", "다음 중 문장 끝을 내려 읽는(↘) 것이 자연스러운 의문문은 무엇인가요?",
    options=["What is your name?", "Is this your bag?", "Are you hungry?", "Can you swim?"], answer="What is your name?",
    why="What, Where 같은 의문사 의문문은 보통 끝을 내려 읽습니다.")
b.q(S, "A", "A: Do you want a green apple? B: No, I want a red apple. 에서 B가 가장 강하게 읽는 낱말은 무엇인가요?",
    answers=["red", "RED", "Red"],
    why="green이 아니라 red라는 것을 강조하기 위해 red를 강하게 읽습니다.")

# ───────── 6영01-02 강세·리듬·억양에 맞게 소리 내어 읽기 ─────────
S = "6영01-02"
b.q(S, "C", "knife를 읽을 때 소리 나지 않는 글자는 무엇인가요? (알파벳 한 글자)",
    answers=["k", "K"],
    why="knife는 k를 읽지 않고 /naɪf/로 읽습니다.")
b.q(S, "C", "night를 읽을 때 소리가 나지 않는 글자 묶음은 무엇인가요?",
    options=["gh", "n", "t", "ni"], answer="gh",
    why="night는 gh를 읽지 않고 /naɪt/로 읽습니다.")
b.q(S, "B", "thank의 처음 소리로 알맞은 것은 무엇인가요?",
    options=["/θ/ (혀를 살짝 내밀고 내는 소리)", "/s/", "/t/", "/d/"], answer="/θ/ (혀를 살짝 내밀고 내는 소리)",
    why="thank는 혀끝을 윗니와 아랫니 사이에 대고 /θ/ 소리를 냅니다.")
b.q(S, "B", "다음 문장을 자연스럽게 끊어 읽을 때 쉬는 곳으로 알맞은 것은 무엇인가요? ‘My brother and I went to the park after school.’",
    options=["My brother and I / went to the park / after school.", "My / brother and I went / to the park after / school.", "My brother / and I went to / the park after school.", "My brother and I went to the / park / after school."], answer="My brother and I / went to the park / after school.",
    why="누가(My brother and I) / 무엇을 했는지(went to the park) / 언제(after school)처럼 의미 덩어리로 끊어 읽으면 자연스럽습니다.")
b.q(S, "A", "Can you help me? 를 읽을 때 문장 끝 억양으로 알맞은 것은 무엇인가요?",
    options=["올려 읽는다(↗)", "내려 읽는다(↘)", "낮고 평평하게 읽는다", "억양 없이 읽는다"], answer="올려 읽는다(↗)",
    why="Yes/No 의문문은 끝을 올려 읽습니다.")
b.q(S, "A", "I can’t go to the party. 를 읽을 때 not의 의미(can’t)를 분명히 전하기 위한 방법으로 알맞은 것은 무엇인가요?",
    options=["can’t를 분명하고 조금 강하게 읽는다", "can’t를 아주 작게 읽는다", "문장을 전부 같은 세기로 읽는다", "go를 빼고 읽는다"], answer="can’t를 분명하고 조금 강하게 읽는다",
    why="부정의 의미가 중요하므로 can’t를 분명하게 읽어야 의미가 전해집니다.")

# ───────── 6영01-03 단어·어구·문장의 의미 ─────────
S = "6영01-03"
b.q(S, "C", "그림을 보고 알맞은 낱말을 고르세요.",
    svg=icons_row([("apple", 1)]), options=["apple", "ball", "book", "fish"], answer="apple",
    why="그림은 사과이므로 apple입니다.")
b.q(S, "C", "그림이 나타내는 영어 낱말을 쓰세요.",
    svg=icons_row([("house", 1)]), answers=["house", "a house"],
    why="집 그림이므로 house입니다.")
b.q(S, "B", "‘a pair of shoes’의 뜻으로 알맞은 것은 무엇인가요?",
    options=["신발 한 켤레", "신발 한 짝", "신발 가게", "신발 세 켤레"], answer="신발 한 켤레",
    why="a pair of는 둘이 한 쌍을 이루는 것의 ‘한 켤레’를 뜻합니다.")
b.q(S, "B", "‘Don’t be late.’의 뜻으로 알맞은 것은 무엇인가요?",
    options=["늦지 마세요.", "일찍 오세요, 그리고 앉으세요.", "빨리 먹으세요.", "문을 닫으세요."], answer="늦지 마세요.",
    why="Don’t be late.는 ‘늦지 마세요’라는 뜻입니다.")
b.q(S, "A", "‘Would you like some tea?’의 의미로 가장 알맞은 것은 무엇인가요?",
    options=["차를 권하는 말이다", "차를 달라고 요구하는 말이다", "차가 싫다고 하는 말이다", "차 가게를 묻는 말이다"], answer="차를 권하는 말이다",
    why="Would you like ~?는 상대에게 무언가를 정중하게 권하는 표현입니다.")
b.q(S, "A", "‘I’m looking forward to the trip.’의 의미로 가장 알맞은 것은 무엇인가요?",
    options=["여행이 기대된다", "여행이 끝났다", "여행에 가기 싫다", "여행 계획을 취소했다"], answer="여행이 기대된다",
    why="look forward to는 ‘~을 기대하다, 기다리다’라는 뜻입니다.")

# ───────── 6영01-04 담화나 글의 세부 정보 ─────────
S = "6영01-04"
b.q(S, "C", "글쓴이는 토요일 오전에 어디에 갔나요? (영어로 쓰세요)",
    answers=["library", "the library", "Library", "to the library"], passage=P1,
    why="On Saturday morning, I went to the library 라고 했습니다.")
b.q(S, "C", "글쓴이가 도서관에서 빌린 책은 무엇에 관한 책인가요? (영어 낱말 하나로 쓰세요)",
    answers=["space", "Space"], passage=P1,
    why="I borrowed two books about space.라고 했습니다.")
b.q(S, "B", "토요일 오후의 날씨로 알맞은 것은 무엇인가요?",
    options=["맑고 바람이 조금 불었다", "비가 왔다", "눈이 왔다", "흐리고 추웠다"], answer="맑고 바람이 조금 불었다", passage=P1,
    why="It was sunny, but a little windy.라고 했습니다.")
b.q(S, "B", "Tom이 살고 있는 도시는 어디인가요? (영어로 쓰세요)",
    answers=["Toronto", "in Toronto", "Toronto, Canada"], passage=P2,
    why="I'm in Canada now. I live with my uncle in Toronto.라고 했습니다.")
b.q(S, "A", "Tom은 어제 누구와 눈사람을 만들었나요? (영어로 쓰세요)",
    answers=["cousin", "his cousin", "a cousin", "my cousin", "Cousin", "with his cousin", "with my cousin"], passage=P2,
    why="Yesterday, I made a snowman with my cousin.라고 했습니다.")
b.q(S, "A", "Tom이 앞으로 하고 싶은 일은 무엇인가요?",
    options=["다음 여름에 한국을 방문하는 것", "캐나다에서 학교에 다니는 것", "삼촌을 한국에 초대하는 것", "눈사람을 또 만드는 것"], answer="다음 여름에 한국을 방문하는 것", passage=P2,
    why="I want to visit Korea next summer.라고 했습니다.")

# ───────── 6영01-05 중심 내용 ─────────
S = "6영01-05"
b.q(S, "C", "이 글의 중심 내용으로 알맞은 것은 무엇인가요?",
    options=["글쓴이는 책 읽기를 좋아한다", "글쓴이는 용을 키운다", "글쓴이는 매일 늦게 잔다", "글쓴이는 과학을 싫어한다"], answer="글쓴이는 책 읽기를 좋아한다", passage=P9,
    why="I love reading books.로 시작하여 책 읽기의 즐거움을 이야기합니다.")
b.q(S, "C", "이 글의 제목으로 가장 알맞은 것은 무엇인가요?",
    options=["Why I Love Reading", "My Pet Dragon", "A Busy Day", "My Science Class"], answer="Why I Love Reading", passage=P9,
    why="책을 좋아하는 이유를 설명하는 글이므로 Why I Love Reading이 알맞습니다.")
b.q(S, "B", "글쓴이가 책을 읽으면서 좋다고 한 점으로 알맞지 않은 것은 무엇인가요?",
    options=["친구를 더 많이 사귈 수 있다", "새로운 곳에 가 볼 수 있다", "별과 동물에 대해 배울 수 있다", "바쁜 하루 뒤에 마음이 편안해진다"], answer="친구를 더 많이 사귈 수 있다", passage=P9,
    why="글에는 친구 이야기가 없습니다.")
b.q(S, "B", "이 글에서 가장 말하고 싶은 내용으로 알맞은 것은 무엇인가요?",
    options=["재활용을 하면 지구에 도움이 된다", "쓰레기를 많이 버려야 한다", "종이는 재활용할 수 없다", "작은 행동은 소용이 없다"], answer="재활용을 하면 지구에 도움이 된다", passage=P11,
    why="Recycling helps our Earth.가 중심 문장입니다.")
b.q(S, "A", "‘Small actions can make a big change.’는 무슨 뜻인가요?",
    options=["작은 행동이 큰 변화를 만들 수 있다", "큰 행동만 변화를 만든다", "변화는 필요 없다", "작은 행동은 힘들다"], answer="작은 행동이 큰 변화를 만들 수 있다", passage=P11,
    why="small actions는 작은 행동, big change는 큰 변화를 뜻합니다.")
b.q(S, "A", "글쓴이가 마지막에 ‘Let’s recycle every day!’라고 쓴 의도는 무엇인가요?",
    options=["독자에게 날마다 재활용을 실천하자고 권하려는 것이다", "재활용 상자를 판매하려는 것이다", "재활용을 그만두라고 하려는 것이다", "재활용 방법을 묻는 것이다"], answer="독자에게 날마다 재활용을 실천하자고 권하려는 것이다", passage=P11,
    why="Let’s ~는 함께 하자는 권유의 표현입니다.")

# ───────── 6영01-06 일이나 사건의 순서 ─────────
S = "6영01-06"
b.q(S, "C", "샌드위치를 만들 때 가장 먼저 해야 할 일은 무엇인가요? (영어로 쓰세요)",
    answers=["wash your hands", "Wash your hands", "wash your hands.", "Wash your hands.", "wash hands", "Wash hands", "wash my hands", "Wash my hands"], passage=P5,
    why="First, wash your hands.라고 했습니다.")
b.q(S, "C", "샌드위치를 만드는 과정의 마지막 단계는 무엇인가요?",
    options=["샌드위치를 반으로 자른다", "빵 두 장을 접시에 놓는다", "손을 씻는다", "치즈를 올린다"], answer="샌드위치를 반으로 자른다", passage=P5,
    why="Finally, cut the sandwich in half.라고 했습니다.")
b.q(S, "B", "샌드위치를 만드는 순서로 알맞은 것은 무엇인가요?",
    options=["손 씻기 → 빵 놓기 → 재료 올리기 → 덮기 → 자르기", "손 씻기 → 재료 올리기 → 빵 놓기 → 덮기 → 자르기", "빵 놓기 → 손 씻기 → 재료 올리기 → 덮기 → 자르기", "손 씻기 → 빵 놓기 → 재료 올리기 → 자르기 → 덮기"], answer="손 씻기 → 빵 놓기 → 재료 올리기 → 덮기 → 자르기", passage=P5,
    why="First, Second, Then, Next, Finally의 순서입니다.")
b.q(S, "B", "동물원에서 원숭이를 본 다음에 한 일은 무엇인가요?",
    options=["코끼리가 목욕하는 것을 보았다", "펭귄 집을 방문했다", "선물을 샀다", "점심을 먹었다"], answer="코끼리가 목욕하는 것을 보았다", passage=P12,
    why="first saw the monkeys. Then we watched the elephants take a bath.라고 했습니다.")
b.q(S, "A", "이 글의 사건을 순서대로 나열한 것은 무엇인가요?",
    options=["원숭이 → 코끼리 → 점심 → 펭귄 집 → 선물 가게", "코끼리 → 원숭이 → 점심 → 펭귄 집 → 선물 가게", "원숭이 → 코끼리 → 펭귄 집 → 점심 → 선물 가게", "원숭이 → 점심 → 코끼리 → 선물 가게 → 펭귄 집"], answer="원숭이 → 코끼리 → 점심 → 펭귄 집 → 선물 가게", passage=P12,
    why="first, then, after lunch, before we went home의 순서입니다.")
b.q(S, "A", "집에 돌아가기 전에 학생들이 한 일은 무엇인가요?",
    options=["가게에서 작은 선물을 샀다", "원숭이를 보았다", "점심을 먹었다", "버스를 탔다"], answer="가게에서 작은 선물을 샀다", passage=P12,
    why="Before we went home, we bought small gifts at the shop.라고 했습니다.")

# ───────── 6영01-07 읽기·듣기 전략 활용 ─────────
S = "6영01-07"
b.q(S, "C", "글을 읽기 전에 제목과 그림을 먼저 살펴보는 까닭은 무엇인가요?",
    options=["글의 내용을 미리 짐작하며 읽을 수 있기 때문이다", "글을 읽지 않으려고", "틀린 글자를 찾으려고", "쉬는 시간을 늘리려고"], answer="글의 내용을 미리 짐작하며 읽을 수 있기 때문이다",
    why="제목과 그림은 글의 내용을 예상하는 데 도움이 됩니다.")
b.q(S, "C", "‘He is very energetic.’에서 energetic의 뜻을 앞뒤 문장으로 짐작해 보세요. (He runs around the house all day.)",
    options=["활동적인, 힘이 넘치는", "졸린", "배고픈", "조용한"], answer="활동적인, 힘이 넘치는", passage=P10,
    why="하루 종일 뛰어다닌다는 설명으로 ‘힘이 넘치는’이라는 뜻을 짐작할 수 있습니다.")
b.q(S, "B", "‘He is so tired that he falls asleep right away.’에서 falls asleep의 뜻으로 알맞은 것은 무엇인가요?",
    options=["잠들다", "달리다", "먹다", "일어나다"], answer="잠들다", passage=P10,
    why="너무 피곤해서 바로 ~한다는 흐름에서 ‘잠들다’가 알맞습니다.")
b.q(S, "B", "글에서 특정한 정보(시간, 장소)를 빨리 찾을 때 알맞은 읽기 전략은 무엇인가요?",
    options=["필요한 낱말이나 숫자를 찾아 훑어 읽는다", "한 낱말씩 사전에서 찾는다", "처음부터 끝까지 소리 내어 읽는다", "마지막 줄만 읽는다"], answer="필요한 낱말이나 숫자를 찾아 훑어 읽는다",
    why="필요한 정보를 찾을 때는 키워드를 찾아 훑어 읽는 것이 효율적입니다.")
b.q(S, "A", "모르는 단어를 만났을 때 전략으로 가장 알맞지 않은 것은 무엇인가요?",
    options=["읽기를 멈추고 포기한다", "앞뒤 문장에서 단서를 찾는다", "그림이나 제목에서 힌트를 얻는다", "아는 부분으로 전체 뜻을 짐작한다"], answer="읽기를 멈추고 포기한다",
    why="모르는 단어가 있어도 문맥, 그림, 제목을 활용하며 계속 읽습니다.")
b.q(S, "A", "이 글에서 puppy가 신발을 씹는 것을 말한 까닭으로 가장 알맞은 것은 무엇인가요?",
    options=["강아지가 장난을 좋아하는 힘 넘치는 성격임을 보여 주려고", "신발을 사고 싶어서", "강아지를 팔려고", "신발이 비싸서"], answer="강아지가 장난을 좋아하는 힘 넘치는 성격임을 보여 주려고", passage=P10,
    why="에너지가 넘치는 모습을 구체적인 예로 보여 줍니다.")

# ───────── 6영01-08 다양한 매체로 표현된 글 ─────────
S = "6영01-08"
b.q(S, "C", "포스터에서 축제가 열리는 날짜를 영어로 쓰세요. (예: May 3)",
    answers=["October 20", "October 20th", "Oct. 20", "Oct 20", "October 20 (Friday)", "Friday, October 20", "20 October", "october 20"], passage=P3,
    why="Date: October 20 (Friday).라고 적혀 있습니다.")
b.q(S, "C", "축제 입장료는 얼마인가요? (영어 낱말 하나로 쓰세요)",
    answers=["free", "Free"], passage=P3,
    why="Entrance is free.라고 했습니다.")
b.q(S, "B", "비가 오면 축제는 어디에서 열리나요?",
    options=["체육관", "운동장", "도서관", "교실"], answer="체육관", passage=P3,
    why="If it rains, the festival will be in the gym.이라고 했습니다.")
b.q(S, "B", "문자 메시지에서 영화가 시작하는 시각은 언제인가요?",
    options=["2시 30분", "2시", "3시", "1시 30분"], answer="2시 30분", passage=P4,
    why="The movie starts at 2:30.이라고 했습니다.")
b.q(S, "A", "Hana와 Joon이 만나기로 한 장소는 어디인가요?",
    options=["극장 앞", "학교 운동장", "Joon의 집", "버스 정류장"], answer="극장 앞", passage=P4,
    why="Let's meet in front of the theater.라고 했습니다.")
b.q(S, "A", "문자 메시지 형식의 글에서 알 수 있는 특징으로 가장 알맞은 것은 무엇인가요?",
    options=["짧고 친근한 말로 서로 주고받으며 약속을 정한다", "긴 설명문으로 정보를 전달한다", "한 사람이 일방적으로 말한다", "그림 없이 표만 사용한다"], answer="짧고 친근한 말로 서로 주고받으며 약속을 정한다", passage=P4,
    why="문자는 짧은 대화체로 약속을 주고받는 매체입니다.")

# ───────── 6영01-09 시, 노래, 이야기에 공감 ─────────
S = "6영01-09"
b.q(S, "C", "시 속 화자는 비 오는 날 어떤 기분인가요?",
    options=["편안하고 행복하다", "무섭고 슬프다", "화가 난다", "지루하고 외롭다"], answer="편안하고 행복하다", passage=P7,
    why="I feel so cozy and so glad(아늑하고 기쁘다)라고 했습니다.")
b.q(S, "C", "엄마가 만들어 주는 따뜻하고 달콤한 음료는 무엇인가요? (영어로 쓰세요)",
    answers=["cocoa", "Cocoa"], passage=P7,
    why="Mom makes cocoa, warm and sweet.라고 했습니다.")
b.q(S, "B", "시에서 창문에서 춤을 추듯이 보이는 것은 무엇인가요? (영어로 쓰세요)",
    answers=["drops", "Drops", "raindrops", "Raindrops", "rain drops", "drop", "raindrop", "rain"], passage=P7,
    why="Drops are dancing on the window pane. 에서 raindrops를 춤추는 것처럼 표현했습니다.")
b.q(S, "B", "Mina가 리본을 잃어버렸을 때의 마음으로 알맞은 것은 무엇인가요?",
    options=["슬프고 속상했다", "화가 났다", "신이 났다", "졸렸다"], answer="슬프고 속상했다", passage=P8,
    why="She sat on a bench and cried.라고 했습니다.")
b.q(S, "A", "Leo가 Mina를 도와준 까닭으로 알맞은 것은 무엇인가요?",
    options=["Mina가 우는 모습을 보고 안쓰러운 마음이 들었기 때문이다", "리본을 갖고 싶었기 때문이다", "시간이 많았기 때문이다", "Mina를 놀리고 싶었기 때문이다"], answer="Mina가 우는 모습을 보고 안쓰러운 마음이 들었기 때문이다", passage=P8,
    why="Why are you crying?이라고 물으며 도와주었습니다.")
b.q(S, "A", "이 이야기에서 알 수 있는 교훈으로 가장 알맞은 것은 무엇인가요?",
    options=["어려움에 처한 친구를 도우면 서로 기쁜 일이 생긴다", "물건은 잃어버려도 된다", "혼자 해결해야 한다", "리본은 중요하지 않다"], answer="어려움에 처한 친구를 도우면 서로 기쁜 일이 생긴다", passage=P8,
    why="Leo의 도움으로 리본을 찾아 Mina가 웃게 되었습니다.")

# ───────── 6영01-10 문화에 대한 포용 ─────────
S = "6영01-10"
b.q(S, "C", "모로코에서 민트차는 무엇의 표시인가요? (영어로 쓰세요)",
    answers=["friendship", "Friendship"], passage=P6,
    why="In Morocco, mint tea is a sign of friendship.이라고 했습니다.")
b.q(S, "C", "일본 사람들이 식사 후에 즐겨 마시는 차는 무엇인가요? (영어로 쓰세요)",
    answers=["green tea", "Green tea"], passage=P6,
    why="In Japan, people often enjoy green tea after meals.라고 했습니다.")
b.q(S, "B", "이 글에서 나라마다 다른 차 문화의 공통점으로 알맞은 것은 무엇인가요?",
    options=["친구와 가족과 함께 나누어 마신다", "모두 같은 차를 마신다", "혼자서만 마신다", "아침에만 마신다"], answer="친구와 가족과 함께 나누어 마신다", passage=P6,
    why="they all share it with friends and family라고 했습니다.")
b.q(S, "B", "친구의 나라에서는 식사 전에 손을 모으고 인사한다고 합니다. 알맞은 태도는 무엇인가요?",
    options=["그 문화를 존중하고 궁금한 점을 물어본다", "이상하다고 놀린다", "우리 방식만 옳다고 말한다", "인사하지 않는다"], answer="그 문화를 존중하고 궁금한 점을 물어본다",
    why="다른 문화를 존중하고 이해하려는 포용의 태도가 필요합니다.")
b.q(S, "A", "다른 나라 친구가 우리와 다른 방식으로 인사할 때 가장 알맞은 반응은 무엇인가요?",
    options=["그 방식도 인사의 한 방법임을 인정하고 함께 해 본다", "우리 인사법만 가르친다", "어색하다고 피한다", "웃으며 흉내만 낸다"], answer="그 방식도 인사의 한 방법임을 인정하고 함께 해 본다",
    why="다양한 문화를 열린 마음으로 받아들이는 태도입니다.")
b.q(S, "A", "‘Every country has its own way to say hello.’의 뜻으로 알맞은 것은 무엇인가요?",
    options=["나라마다 인사하는 방법이 다르다", "모든 나라는 같은 방법으로 인사한다", "인사하는 나라는 없다", "한국에만 인사법이 있다"], answer="나라마다 인사하는 방법이 다르다",
    why="its own way는 ‘그 나라만의 방법’을 뜻합니다.")

if __name__ == "__main__":
    report(bank, 6, lo=250, hi=700)
    bank.save(os.path.join(os.path.dirname(__file__), "..", "banks", bank.outfile))
