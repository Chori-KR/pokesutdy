"""영어 · 초3-4 · 이해 (4영01-01 ~ 10) — 60문제"""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, os.path.dirname(__file__))
from common import Bank
from svgkit import svg, text, line, table, BLUE, ORANGE, C
from kit_ko import KoBank, report
from kit_soc import compare_table
from kit34 import hold
from kit12 import clock
from kit_en import letters, syllables, weather, face

def mini_clock(h, r=44):
    """작은 시계(정각): 테두리, 숫자 12개, 시곗바늘(굵게), 분침(12를 가리킴)"""
    import math
    cx = cy = r + 6
    out = [f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="none" stroke="{C}" stroke-width="3"/>']
    for k in range(1, 13):
        a = math.radians(k * 30)
        out.append(text(round(cx + r * 0.76 * math.sin(a), 1), round(cy - r * 0.76 * math.cos(a) + 5, 1), k, 12, weight="bold"))
    ha = math.radians((h % 12) * 30)
    out.append(line(cx, cy, round(cx + r * 0.42 * math.sin(ha), 1), round(cy - r * 0.42 * math.cos(ha), 1), 6))
    out.append(line(cx, cy, cx, round(cy - r * 0.63, 1), 3.5, color=BLUE))
    out.append(f'<circle cx="{cx}" cy="{cy}" r="4" fill="{C}"/>')
    return svg(2 * r + 12, 2 * r + 12, "".join(out))


bank = Bank("영어", "초", "영어", "초3-4", "이해", "bank_영어_초3-4_이해.json")
b = KoBank(bank)

# ───────── 지문 12개 ─────────
P1 = b.passage("p1", "My Name Is Mina",
               "Hello! My name is Mina. I am nine years old. I live in a small house with my mom, my dad, and my little brother. I like apples and bananas, but I don't like carrots. I have a white cat. Her name is Nabi. Nabi likes to sleep on my bed.", "직접 지음")
P2 = b.passage("p2", "Our Classroom",
               "This is our classroom. There is a big blackboard in front of the room. There are ten desks and ten chairs. Two clocks are on the wall. My bag is under my desk, and my pencil case is on the desk. In my pencil case, I have three pencils and one eraser. I like my classroom!", "직접 지음")
P3 = b.passage("p3", "My Dog Coco",
               "I have a pet dog. His name is Coco. He is small, but he is very fast. Coco has brown ears and a white tail. He is three years old. Every day at four o'clock, we go to the park and play with a red ball. Coco loves the ball!", "직접 지음")
P4 = b.passage("p4", "Birthday Invitation",
               "Hi, Jina! My birthday party is this Saturday. It is at my house. Please come at two o'clock. We will eat pizza and cake, and we will play games. It will be a lot of fun! Can you come? Please call me. See you! - Sam", "직접 지음")
P5 = b.passage("p5", "A Rainy Day",
               "Today is a rainy day. Minho looks out of the window. The sky is gray. He takes his yellow umbrella and puts on his blue boots. He walks to school in the rain. At school, his friends say, \"Minho, your boots are cool!\" Minho smiles.", "직접 지음")
P6 = b.passage("p6", "Our Weekly Plan",
               "Monday: English and art. Tuesday: music and P.E. Wednesday: math and science. Thursday: Korean and English. Friday: art and a class party. We have P.E. on Tuesday. We have English two times a week. I like Friday the best because of the party!", "직접 지음")
P7 = b.passage("p7", "Messages",
               "Anna: Hi, Ben! Do you want to play soccer today? Ben: Yes! I love soccer. Anna: Great! Let's meet at the playground at three o'clock. Ben: OK. I will bring my ball. Anna: Thanks! See you soon. Ben: Bye!", "직접 지음")
P8 = b.passage("p8", "Book Fair Poster",
               "BOOK FAIR! Come to our school library. Date: May 10 (Friday). Time: 10 a.m. to 3 p.m. You can read many fun books. You can also buy cheap books. Every student gets a free bookmark! Bring your friends!", "직접 지음")
P9 = b.passage("p9", "Happy Day",
               "I wake up in the morning. The sun is bright. The birds sing, tweet, tweet, tweet! I jump out of my bed. I eat my toast and drink my milk. I run to school with a big smile. I am happy, happy, happy! Today is a very good day!", "직접 지음")
P10 = b.passage("p10", "Little Bear's Ball",
                "Little Bear had a red ball. One day, he lost it. He sat under a tree and cried. His friend Rabbit came. \"Don't cry,\" said Rabbit. \"Let's find it together.\" They looked behind the rock and in the grass. At last, they found the ball under a bush. Little Bear smiled. \"Thank you, Rabbit!\"", "직접 지음")
P11 = b.passage("p11", "Hello Around the World",
                "In Korea, we bow to say hello. In America, people shake hands. In India, people put their hands together and say, \"Namaste.\" In Brazil, friends often give a hug. Every country has its own way to say hello. All of them are special, and we should respect each way.", "직접 지음")
P12 = b.passage("p12", "Lunch Time",
                "It is lunch time. Kenji has rice balls. Mia has a sandwich. Ravi has rice and curry. Jun has kimbap. Mia says, \"Wow, Ravi's lunch smells different!\" Ravi smiles and says, \"Try some!\" Mia tastes it. \"It's good!\" she says. They all share their food and enjoy lunch together.", "직접 지음")

# ───────── 4영01-01 알파벳·단어의 소리 식별 ─────────
S = "4영01-01"
b.q(S, "C", "다음 중 cat과 같은 소리로 시작하는 단어는 무엇인가요?",
    options=["cup", "bed", "dog", "fish"], answer="cup",
    why="cat과 cup은 둘 다 /k/ 소리로 시작합니다.")
b.q(S, "C", "dog는 어떤 알파벳 소리로 시작할까요? 알파벳 한 글자를 쓰세요.",
    answers=["d", "D"],
    why="dog는 /d/ 소리로 시작하므로 d입니다.")
b.q(S, "B", "cat과 끝소리가 같은(라임이 되는) 단어는 무엇인가요?",
    options=["hat", "cup", "dog", "bed"], answer="hat",
    why="cat과 hat은 모두 -at으로 끝나 끝소리가 같습니다.")
b.q(S, "B", "pen, ten, hen, pig 중 끝소리가 다른 하나는 무엇인가요?",
    options=["pig", "pen", "ten", "hen"], answer="pig",
    why="pen, ten, hen은 모두 -en으로 끝나고 pig는 -ig로 끝납니다.")
b.q(S, "A", "sheep과 같은 소리로 시작하는 단어는 무엇인가요?",
    options=["ship", "sun", "cheese", "seven"], answer="ship",
    why="sheep과 ship은 둘 다 /ʃ/ 소리로 시작합니다. sun과 seven은 /s/, cheese는 /tʃ/로 시작합니다.")
b.q(S, "A", "cap의 모음 소리와 같은 소리가 나는 단어는 무엇인가요?",
    options=["hat", "cake", "kite", "bike"], answer="hat",
    why="cap과 hat은 모두 짧은 /æ/ 소리가 납니다.")

# ───────── 4영01-02 알파벳 대소문자 식별 ─────────
S = "4영01-02"
b.q(S, "C", "대문자 A의 소문자는 무엇인가요?",
    svg=letters(["A"]),
    options=["a", "e", "o", "d"], answer="a",
    why="A의 소문자는 a입니다.")
b.q(S, "C", "소문자 g의 대문자를 쓰세요.",
    answers=["G"],
    why="g의 대문자는 G입니다.")
b.q(S, "B", "대문자와 소문자가 바르게 짝지어진 것은 무엇인가요?",
    options=["D – d", "B – p", "G – q", "M – n"], answer="D – d",
    why="D의 소문자는 d, B는 b, G는 g, M은 m입니다.")
b.q(S, "B", "그림에서 소문자 b를 고르세요.",
    svg=letters(["d", "b", "p", "q"]),
    options=["두 번째 카드", "첫 번째 카드", "세 번째 카드", "네 번째 카드"], answer="두 번째 카드",
    why="b는 막대가 왼쪽에 있고 동그라미가 오른쪽에 있는 모양입니다.")
b.q(S, "A", "알파벳 순서에서 M 바로 다음에 오는 글자의 소문자는 무엇인가요?",
    options=["n", "l", "m", "o"], answer="n",
    why="알파벳 순서는 L, M, N, O이므로 M 다음은 N이고 소문자는 n입니다.")
b.q(S, "A", "요일 이름을 바르게 쓴 것은 무엇인가요?",
    options=["Monday", "monday", "MONday", "mONday"], answer="Monday",
    why="요일 이름은 첫 글자를 대문자로 쓰고 나머지는 소문자로 씁니다.")

# ───────── 4영01-03 강세·리듬·억양 ─────────
S = "4영01-03"
b.q(S, "C", "그림은 watermelon을 네 부분으로 나누고, 강하게 읽는 부분을 굵은 글씨와 주황 테두리로 표시한 것입니다. 강하게 읽는 부분은 어느 것인가요?",
    svg=syllables(["wa", "ter", "mel", "on"], stress=0),
    options=["wa", "ter", "mel", "on"], answer="wa",
    why="watermelon은 첫 부분 wa를 강하게 읽습니다(WA-ter-mel-on).")
b.q(S, "C", "banana는 ba-NA-na로 읽습니다. 강하게 읽는 부분은 몇 번째 부분인가요? (숫자로 쓰세요)",
    answers=["2", "둘", "두 번째", "두번째", "2번째"],
    why="banana는 두 번째 부분 NA를 강하게 읽습니다.")
b.q(S, "B", "Is it a dog? 처럼 ‘예/아니요’로 답하는 의문문은 끝을 어떻게 읽나요?",
    options=["끝을 올려 읽는다", "끝을 내려 읽는다", "끝을 길게 끈다", "소리를 내지 않는다"], answer="끝을 올려 읽는다",
    why="‘예/아니요’로 답하는 의문문은 보통 끝을 올려 읽습니다.")
b.q(S, "B", "It is a cat. 처럼 평범하게 말하는 문장은 끝을 어떻게 읽나요?",
    options=["끝을 내려 읽는다", "끝을 올려 읽는다", "끝을 크게 외친다", "처음부터 속삭인다"], answer="끝을 내려 읽는다",
    why="평범한 설명 문장은 보통 끝을 내려 읽습니다.")
b.q(S, "A", "table, happy, guitar, monkey 중 두 번째 부분을 강하게 읽는 단어는 무엇인가요?",
    options=["guitar", "table", "happy", "monkey"], answer="guitar",
    why="table, happy, monkey는 첫 부분을, guitar는 gi-TAR로 두 번째 부분을 강하게 읽습니다.")
b.q(S, "A", "다음 중 끝을 올려 읽는 문장은 무엇인가요?",
    options=["Do you like pizza?", "I like pizza.", "This is my bag.", "She is my friend."], answer="Do you like pizza?",
    why="‘예/아니요’로 답하는 질문은 끝을 올려 읽고 나머지는 내려 읽습니다.")

# ───────── 4영01-04 소리와 철자의 관계, 소리 내어 읽기 ─────────
S = "4영01-04"
b.q(S, "C", "b-a-t을 이어서 읽으면 어떤 단어가 될까요?",
    options=["bat", "bit", "but", "bet"], answer="bat",
    why="b, a, t의 소리를 이으면 bat입니다.")
b.q(S, "C", "/d/ /ɔ/ /g/ 소리를 이어서 만든 단어를 쓰세요.",
    answers=["dog", "Dog"],
    why="/d/ /ɔ/ /g/ 소리를 이으면 dog입니다.")
b.q(S, "B", "cake의 a와 같은 소리(/eɪ/)가 나는 단어는 무엇인가요?",
    options=["name", "cat", "bag", "hat"], answer="name",
    why="cake와 name은 a_e 형태로 a가 알파벳 이름처럼 /eɪ/ 소리가 납니다.")
b.q(S, "B", "ch가 /tʃ/ 소리로 나는 단어는 무엇인가요?",
    options=["chair", "school", "chorus", "stomach"], answer="chair",
    why="chair의 ch는 /tʃ/ 소리가 납니다. school 등은 ch가 /k/ 소리로 납니다.")
b.q(S, "A", "knife를 읽을 때 소리가 나지 않는 글자는 무엇인가요?",
    options=["k", "n", "i", "f"], answer="k",
    why="knife는 첫 글자 k를 읽지 않고 /naɪf/로 읽습니다.")
b.q(S, "A", "oo가 긴 /uː/ 소리로 나는 단어는 무엇인가요?",
    options=["moon", "book", "foot", "cook"], answer="moon",
    why="moon의 oo는 긴 /uː/ 소리이고 book, foot, cook은 짧은 /ʊ/ 소리가 납니다.")

# ───────── 4영01-05 단어·어구·문장의 의미 ─────────
S = "4영01-05"
b.q(S, "C", "Mina의 고양이는 어떤 색인가요? 영어 한 단어로 쓰세요.",
    answers=["white", "White"], passage=P1,
    why="글에 I have a white cat.이라고 쓰여 있습니다.")
b.q(S, "B", "Mina가 좋아하지 않는 음식은 무엇인가요?",
    options=["carrots", "apples", "bananas", "milk"], answer="carrots", passage=P1,
    why="I like apples and bananas, but I don't like carrots.에서 carrots를 좋아하지 않는다고 했습니다.")
b.q(S, "A", "Mina의 집에 함께 사는 사람이 아닌 사람은 누구인가요?",
    options=["sister", "mom", "dad", "little brother"], answer="sister", passage=P1,
    why="Mina는 mom, dad, little brother와 함께 삽니다. sister는 나오지 않습니다.")
b.q(S, "C", "교실 벽에 시계는 몇 개 있나요? (숫자로 쓰세요)",
    answers=["2", "two", "Two", "두", "두 개"], passage=P2,
    why="Two clocks are on the wall.이라고 했습니다.")
b.q(S, "B", "가방은 어디에 있나요?",
    options=["책상 아래", "책상 위", "의자 위", "칠판 앞"], answer="책상 아래", passage=P2,
    why="My bag is under my desk.에서 under는 ‘~ 아래’라는 뜻입니다.")
b.q(S, "A", "글의 내용과 맞게 짝지은 것은 무엇인가요?",
    options=["pencil case – 책상 위 / bag – 책상 아래", "pencil case – 책상 아래 / bag – 책상 위", "pencil case – 칠판 앞 / bag – 벽", "pencil case – 의자 / bag – 칠판"], answer="pencil case – 책상 위 / bag – 책상 아래", passage=P2,
    why="My bag is under my desk, and my pencil case is on the desk.입니다.")

# ───────── 4영01-06 담화의 주요 정보 ─────────
S = "4영01-06"
b.q(S, "C", "Coco의 귀는 무슨 색인가요? 영어 한 단어로 쓰세요.",
    answers=["brown", "Brown"], passage=P3,
    why="Coco has brown ears and a white tail.에서 귀는 brown입니다.")
b.q(S, "B", "Coco와 주인은 매일 몇 시에 공원에 가나요?",
    options=["4시", "2시", "3시", "5시"], answer="4시", passage=P3,
    why="Every day at four o'clock이라고 했습니다.")
b.q(S, "A", "Coco에 대한 설명으로 맞는 것은 무엇인가요?",
    options=["작지만 매우 빠르고 세 살이다", "크고 느리고 다섯 살이다", "하얀 귀와 갈색 꼬리가 있다", "파란 공을 좋아한다"], answer="작지만 매우 빠르고 세 살이다", passage=P3,
    why="He is small, but he is very fast. He is three years old.입니다. 귀는 갈색, 꼬리는 하얀색, 공은 빨간색입니다.")
b.q(S, "C", "파티는 무슨 요일인가요? 영어로 쓰세요.",
    answers=["Saturday", "saturday"], passage=P4,
    why="My birthday party is this Saturday.라고 했습니다.")
b.q(S, "B", "파티가 시작하는 시각을 나타낸 시계는 무엇인가요?",
    svg=hold([(mini_clock(2), "가"), (mini_clock(4), "나"), (mini_clock(3), "다"), (mini_clock(5), "라")], gap=8, cols=2),
    options=["가", "나", "다", "라"], answer="가", passage=P4,
    why="Please come at two o'clock.이므로 2시를 나타낸 가입니다.")
b.q(S, "A", "Sam이 Jina에게 부탁한 것은 무엇인가요?",
    options=["파티에 올 수 있는지 전화로 알려 달라는 것", "피자를 가져오라는 것", "선물을 사 오라는 것", "집에서 기다리라는 것"], answer="파티에 올 수 있는지 전화로 알려 달라는 것", passage=P4,
    why="Can you come? Please call me.에서 올 수 있는지 전화해 달라고 했습니다.")

# ───────── 4영01-07 듣기·읽기 전략 ─────────
S = "4영01-07"
b.q(S, "C", "이 글의 내용을 가장 잘 나타내는 제목은 무엇인가요?",
    options=["A Rainy Day", "My Dog", "A Birthday Party", "Lunch Time"], answer="A Rainy Day", passage=P5,
    why="비 오는 날 학교에 가는 내용이므로 A Rainy Day가 알맞습니다.")
b.q(S, "B", "boots의 뜻을 몰라도 puts on his blue boots, walks to school in the rain에서 짐작할 수 있는 뜻은 무엇인가요?",
    options=["장화", "모자", "가방", "우산"], answer="장화", passage=P5,
    why="비 오는 날 신고 걸어가는 것이라는 앞뒤 내용으로 boots가 신발(장화)임을 짐작할 수 있습니다.")
b.q(S, "A", "모르는 단어가 있는 글을 읽을 때 쓸 수 있는 알맞은 전략은 무엇인가요?",
    options=["제목과 그림 보기, 앞뒤 내용으로 뜻 짐작하기", "모르는 단어가 나오면 읽기를 멈추기", "처음부터 끝까지 한 글자씩만 읽기", "내용을 보지 않고 답 찍기"], answer="제목과 그림 보기, 앞뒤 내용으로 뜻 짐작하기", passage=P5,
    why="제목·그림을 활용하고 앞뒤 문장으로 뜻을 짐작하는 것이 읽기 전략입니다.")
b.q(S, "C", "Our Weekly Plan에서 P.E. 수업이 있는 요일은 무슨 요일인가요? 영어로 쓰세요.",
    answers=["Tuesday", "tuesday"], passage=P6,
    why="We have P.E. on Tuesday.라고 했습니다.")
b.q(S, "B", "영어 수업이 있는 요일을 바르게 짝지은 것은 무엇인가요?",
    options=["Monday, Thursday", "Tuesday, Friday", "Wednesday, Friday", "Monday, Wednesday"], answer="Monday, Thursday", passage=P6,
    why="English가 쓰인 날은 Monday와 Thursday입니다.")
b.q(S, "A", "What do we have on Wednesday?의 답을 빨리 찾기 위해 글에서 가장 먼저 찾아야 하는 낱말은 무엇인가요?",
    options=["Wednesday", "Monday", "party", "week"], answer="Wednesday", passage=P6,
    why="묻는 내용의 핵심 낱말(Wednesday)을 찾아 그 뒤를 읽는 것이 빠른 읽기 전략입니다.")

# ───────── 4영01-08 다양한 매체의 담화 ─────────
S = "4영01-08"
b.q(S, "C", "Anna와 Ben은 어디에서 만나기로 했나요? 영어 한 단어로 쓰세요.",
    answers=["playground", "Playground", "the playground"], passage=P7,
    why="Let's meet at the playground at three o'clock.이라고 했습니다.")
b.q(S, "B", "Ben이 가져오겠다고 한 것은 무엇인가요?",
    options=["ball", "bag", "book", "pizza"], answer="ball", passage=P7,
    why="I will bring my ball.이라고 했습니다.")
b.q(S, "A", "이 글과 같은 형식의 글을 보내는 데 가장 알맞은 매체는 무엇인가요?",
    options=["휴대 전화 문자 메시지", "도서관 안내 포스터", "라디오 일기예보", "길 안내 표지판"], answer="휴대 전화 문자 메시지", passage=P7,
    why="서로 짧게 주고받은 대화 형식의 글은 문자 메시지 형식입니다.")
b.q(S, "C", "Book Fair에서 모든 학생이 무료로 받는 것은 무엇인가요? 영어 한 단어로 쓰세요.",
    answers=["bookmark", "Bookmark", "a bookmark"], passage=P8,
    why="Every student gets a free bookmark!라고 했습니다.")
b.q(S, "B", "책 박람회는 어디에서 열리나요?",
    options=["학교 도서관", "운동장", "공원", "서점"], answer="학교 도서관", passage=P8,
    why="Come to our school library.라고 했습니다.")
b.q(S, "A", "포스터에 쓰인 정보로 알맞은 것은 무엇인가요?",
    options=["5월 10일 금요일 오전 10시부터 오후 3시까지 열린다", "5월 10일 토요일 하루 종일 열린다", "5월 3일 금요일 오전에만 열린다", "5월 10일 금요일 저녁에 열린다"], answer="5월 10일 금요일 오전 10시부터 오후 3시까지 열린다", passage=P8,
    why="Date: May 10 (Friday). Time: 10 a.m. to 3 p.m.입니다.")

# ───────── 4영01-09 시·노래·이야기 공감 ─────────
S = "4영01-09"
b.q(S, "C", "Happy Day 시에서 말하는 사람의 기분은 어떤가요? 영어 한 단어로 쓰세요.",
    answers=["happy", "Happy"], passage=P9,
    why="I am happy, happy, happy!라고 했습니다.")
b.q(S, "B", "말하는 사람이 아침으로 먹은 것은 무엇인가요?",
    options=["토스트와 우유", "빵과 주스", "밥과 국", "과일과 차"], answer="토스트와 우유", passage=P9,
    why="I eat my toast and drink my milk.라고 했습니다.")
b.q(S, "A", "말하는 사람이 기분이 좋다는 것을 알 수 있는 행동은 무엇인가요?",
    options=["침대에서 뛰어내려 환한 미소로 학교로 달려간다", "침대에서 오래 누워 있는다", "학교에 가기 싫어서 운다", "아침을 먹지 않는다"], answer="침대에서 뛰어내려 환한 미소로 학교로 달려간다", passage=P9,
    why="I jump out of my bed. I run to school with a big smile.에서 기분 좋은 모습을 알 수 있습니다.")
b.q(S, "C", "공을 잃어버렸을 때 Little Bear의 기분은 어땠나요? 영어 한 단어로 쓰세요.",
    answers=["sad", "Sad"], passage=P10,
    why="He sat under a tree and cried.로 슬픈 기분을 알 수 있습니다.")
b.q(S, "B", "Rabbit이 Little Bear에게 한 말의 뜻으로 알맞은 것은 무엇인가요?",
    options=["울지 마. 같이 찾아보자.", "그 공은 내 거야.", "나는 집에 갈래.", "공을 사 줄게."], answer="울지 마. 같이 찾아보자.", passage=P10,
    why="Don't cry. Let's find it together.는 ‘울지 마. 같이 찾아보자.’라는 뜻입니다.")
b.q(S, "A", "Little Bear의 감정 변화를 순서대로 바르게 나타낸 것은 무엇인가요?",
    options=["슬픔 → 기쁨", "기쁨 → 슬픔", "화남 → 졸림", "무서움 → 화남"], answer="슬픔 → 기쁨", passage=P10,
    why="공을 잃어 슬퍼했지만 친구와 함께 찾은 뒤 웃었습니다.")

# ───────── 4영01-10 문화에 대한 존중 ─────────
S = "4영01-10"
b.q(S, "C", "한국에서는 인사할 때 어떻게 하나요? 영어 한 단어로 쓰세요.",
    answers=["bow", "Bow"], passage=P11,
    why="In Korea, we bow to say hello.라고 했습니다.")
b.q(S, "B", "‘Namaste’라고 말하며 손을 모으는 나라는 어디인가요?",
    options=["인도", "미국", "브라질", "한국"], answer="인도", passage=P11,
    why="In India, people put their hands together and say, \"Namaste.\"입니다.")
b.q(S, "A", "글쓴이가 말하고 싶은 것으로 알맞은 것은 무엇인가요?",
    options=["나라마다 인사 방법이 다르며 모두 존중해야 한다", "우리나라의 인사 방법이 가장 좋다", "미국식 인사만 배워야 한다", "인사는 하지 않아도 된다"], answer="나라마다 인사 방법이 다르며 모두 존중해야 한다", passage=P11,
    why="Every country has its own way to say hello... we should respect each way.입니다.")
b.q(S, "C", "샌드위치를 가져온 사람은 누구인가요?",
    options=["Mia", "Kenji", "Ravi", "Jun"], answer="Mia", passage=P12,
    why="Mia has a sandwich.라고 했습니다.")
b.q(S, "B", "Ravi의 점심 냄새가 다르다고 말한 뒤 Mia가 한 행동은 무엇인가요?",
    options=["Ravi의 음식을 맛보았다", "자리를 옮겼다", "음식을 버렸다", "친구를 놀렸다"], answer="Ravi의 음식을 맛보았다", passage=P12,
    why="Ravi가 Try some!이라고 하자 Mia tastes it.(Mia가 맛을 본다)이라고 했습니다.")
b.q(S, "A", "이 글에서 친구들이 보여 준 태도로 가장 알맞은 것은 무엇인가요?",
    options=["서로 다른 음식을 궁금해하고 존중하며 나누었다", "다른 음식은 먹지 않겠다고 했다", "서로의 음식을 놀렸다", "각자 따로 앉아 먹었다"], answer="서로 다른 음식을 궁금해하고 존중하며 나누었다", passage=P12,
    why="서로 다른 음식을 놀리지 않고 궁금해하며 함께 나누었습니다.")

if __name__ == "__main__":
    report(bank, 6, lo=200, hi=500)
    bank.save(os.path.join(os.path.dirname(__file__), "..", "banks", bank.outfile))
