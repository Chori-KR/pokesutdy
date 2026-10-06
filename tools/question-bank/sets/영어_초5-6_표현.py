"""영어 · 초5-6 · 표현 (6영02-01 ~ 10) — 60문제"""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, os.path.dirname(__file__))
from common import Bank
from svgkit import svg, text, line, table, BLUE, ORANGE, C
from kit_ko import KoBank, report
from kit_soc import compare_table
from kit_en import letters, syllables, weather, face, icon, icons_row, in_box

bank = Bank("영어", "초", "영어", "초5-6", "표현", "bank_영어_초5-6_표현.json")
b = KoBank(bank)


def row_buildings(names, W=330):
    """한 줄로 늘어선 건물 이름 상자(왼쪽→오른쪽)"""
    n = len(names)
    bw = (W - 8 - (n - 1) * 8) / n
    out = []
    for i, nm in enumerate(names):
        x = 4 + i * (bw + 8)
        out.append(f'<rect x="{x:.1f}" y="6" width="{bw:.1f}" height="44" rx="5" fill="none" stroke="{C}" stroke-width="2.5"/>')
        out.append(text(x + bw / 2, 34, nm, 13, weight="bold"))
    out.append(line(4, 62, W - 4, 62, 3))
    out.append(text(W / 2, 80, "road", 12))
    return svg(W, 88, "".join(out))


PA = b.passage("p1", "My Best Friend",
    "(①) is my best friend. (②) name is Jisu. She is ten years old. She (③) long black hair and big eyes. She is tall and kind. She likes drawing and singing. She has a cute white dog. Its name is Bori. Jisu and I play with Bori in the park every weekend.", "직접 지음")
PB = b.passage("p2", "Asking the Way",
    "A: Excuse me. Where is the library? B: Go straight for two blocks. Then (①) right at the bank. A: Turn right at the bank? B: Yes. The library is (②) the bank and the park. A: Is it far from here? B: No, it is only five minutes on foot. It is a big white building, and you can see a clock on it. A: Thank you very much! B: You're welcome.", "직접 지음")
PC = b.passage("p3", "My Diary",
    "Dear Diary, Today was a (①) day. I was very (②) because I got a good score on my English test. After school, I played soccer with my friends. After dinner, I finished my homework and read a comic book. Tomorrow, I (③) go to the museum with my family. I am excited about it! Good night.", "직접 지음")
PD = b.passage("p4", "Talking About Pets",
    "A: Do you have a pet? B: Yes, I do. I have a rabbit. A: What is its name? B: Its name is Snow. A: How old is it? B: It is two years old. A: What does it eat? B: It eats carrots and grass. A: Does it like to play? B: Yes, it does. It likes to jump around the garden. A: That sounds cute! B: Thank you. Do you have a pet, too?", "직접 지음")
PE = b.passage("p5", "A Thank-You Letter",
    "Dear Grandma, How are you? I hope you are well. Thank you for the lovely scarf. It is warm and soft. I wear it every day on my way to school, and my friends say it is pretty. Last weekend, I showed it to my sister, and she wants one, too. I hope to see you soon. Please take care of your health. Love, Mina", "직접 지음")
PF = b.passage("p6", "Making a Poster",
    "Our class is making a poster about healthy food. We draw pictures of fruits and vegetables. We write short sentences like ‘Eat more vegetables!’ and ‘Drink water!’ We use bright colors, so people can see it easily. We also record a short video to share our poster with other classes.", "직접 지음")

# ───────── 6영02-01 강세·리듬·억양에 맞게 말하기 ─────────
S = "6영02-01"
b.q(S, "C", "다음 중 첫 번째 음절을 가장 세게 읽는 낱말은 무엇인가요?",
    options=["tiger", "guitar", "banana", "balloon"], answer="tiger",
    why="tiger는 TI-ger로 첫 음절을 세게 읽고, guitar(gui-TAR), banana(ba-NA-na), balloon(bal-LOON)은 두 번째 음절을 세게 읽습니다.")
b.q(S, "C", "today(to-day)를 말할 때 더 세게 읽는 음절은 몇 번째인가요? (숫자로 쓰세요)",
    answers=["2", "2번째", "두 번째", "두번째", "둘"],
    why="today는 to-DAY처럼 두 번째 음절을 세게 읽습니다.")
b.q(S, "B", "How are you? 를 말할 때 끝억양으로 알맞은 것은 무엇인가요?",
    options=["내려 읽는다(↘)", "올려 읽는다(↗)", "평평하게 읽는다", "억양이 없다"], answer="내려 읽는다(↘)",
    why="How, What 같은 의문사 의문문은 보통 끝을 내려 읽습니다.")
b.q(S, "B", "I have a dog and a cat. 을 리듬에 맞게 읽을 때 약하고 빠르게 읽는 낱말로 알맞은 것은 무엇인가요?",
    options=["a, and, a", "dog, cat", "I, dog", "cat, have"], answer="a, and, a",
    why="a, and 같은 기능어는 약하고 빠르게, dog, cat 같은 내용어는 세게 읽습니다.")
b.q(S, "A", "A: Is it a pen? B: No, it’s a pencil. B가 가장 강하게 읽는 낱말은 무엇인가요? (영어로 쓰세요)",
    answers=["pencil", "Pencil"],
    why="pen이 아니라 pencil이라는 것을 알리려고 pencil을 가장 강하게 읽습니다.")
b.q(S, "A", "What a nice day! 처럼 감탄을 나타내는 문장은 끝억양을 어떻게 하는 것이 자연스러운가요?",
    options=["내려 읽는다(↘)", "올려 읽는다(↗)", "매우 낮게 속삭인다", "읽지 않는다"], answer="내려 읽는다(↘)",
    why="감탄문은 보통 끝을 내려 읽습니다.")

# ───────── 6영02-02 실물·그림·동작을 보고 말하거나 쓰기 ─────────
S = "6영02-02"
b.q(S, "C", "그림을 보고 알맞은 영어 낱말을 쓰세요.",
    svg=icons_row([("star", 1)]), answers=["star", "a star"],
    why="별 그림이므로 star입니다.")
b.q(S, "C", "그림에 알맞은 낱말은 무엇인가요?",
    svg=icons_row([("heart", 1)]), options=["heart", "house", "book", "ball"], answer="heart",
    why="하트 그림이므로 heart입니다.")
b.q(S, "B", "그림을 보고 How many apples? 에 알맞게 영어로 답하세요. (예: Two apples.)",
    svg=icons_row([("apple", 3)]), answers=["Three apples.", "Three apples", "three apples", "three apples.", "3 apples", "3 apples."],
    why="사과가 세 개이므로 Three apples.입니다.")
b.q(S, "B", "그림을 보고 빈칸에 알맞은 낱말을 쓰세요: It is a ____.",
    svg=icons_row([("tree", 1)]), answers=["tree", "Tree"],
    why="나무 그림이므로 tree입니다.")
b.q(S, "A", "그림과 맞는 문장은 무엇인가요?",
    svg=icons_row([("fish", 2), ("ball", 1)]),
    options=["There are two fish and one ball.", "There is one fish and two balls.", "There are three fish.", "There are two balls and one fish."], answer="There are two fish and one ball.",
    why="그림에는 물고기가 두 마리, 공이 한 개 있습니다.")
b.q(S, "A", "그림을 보고 빈칸에 알맞은 낱말을 쓰세요: It is ____ today.",
    svg=weather("rainy"), answers=["rainy", "Rainy", "raining"],
    why="비 오는 날씨 그림이므로 rainy입니다.")

# ───────── 6영02-03 알파벳 대소문자와 문장 부호 ─────────
S = "6영02-03"
b.q(S, "C", "문장을 바르게 쓴 것은 무엇인가요?",
    options=["My name is Sam.", "my name is sam.", "My name is sam.", "my name is Sam"], answer="My name is Sam.",
    why="문장의 첫 글자와 사람 이름의 첫 글자는 대문자로 쓰고 마침표를 찍습니다.")
b.q(S, "C", "빈칸에 알맞은 문장 부호를 쓰세요: How old are you__",
    answers=["?", "？"],
    why="묻는 문장 끝에는 물음표(?)를 씁니다.")
b.q(S, "B", "Yes I can. 를 바르게 고친 것은 무엇인가요?",
    options=["Yes, I can.", "Yes. I can,", "yes I can.", "Yes I Can."], answer="Yes, I can.",
    why="Yes 뒤에는 쉼표(,)를 쓰고 문장 끝에는 마침표를 찍습니다.")
b.q(S, "B", "다음 중 대문자와 문장 부호를 바르게 쓴 문장은 무엇인가요?",
    options=["What is your name?", "what is your name.", "What is your name.", "what is your name?"], answer="What is your name?",
    why="의문문은 첫 글자를 대문자로 쓰고 끝에 물음표를 씁니다.")
b.q(S, "A", "i like tom and anna. 를 바르게 고친 문장을 쓰세요.",
    answers=["I like Tom and Anna.", "I like Tom and Anna"],
    why="I, Tom, Anna는 대문자로 쓰고 문장 끝에는 마침표를 찍습니다.")
b.q(S, "A", "감탄하는 문장을 바르게 쓴 것은 무엇인가요?",
    options=["What a nice day!", "what a nice day!", "What a nice day?", "What a nice day."], answer="What a nice day!",
    why="감탄문은 첫 글자를 대문자로 쓰고 끝에 느낌표를 씁니다.")

# ───────── 6영02-04 사람이나 사물 소개·묘사 ─────────
S = "6영02-04"
b.q(S, "C", "‘My Best Friend’의 빈칸 ①에 알맞은 낱말은 무엇인가요?",
    options=["This", "These", "Those", "They"], answer="This", passage=PA,
    why="한 명의 친구를 소개할 때 This is ~를 씁니다.")
b.q(S, "C", "그림을 보고 빈칸에 알맞은 낱말을 쓰세요: This is a ____.",
    svg=icons_row([("book", 1)]), answers=["book", "a book"],
    why="책 그림이므로 book입니다.")
b.q(S, "B", "‘My Best Friend’의 빈칸 ②에 알맞은 낱말은 무엇인가요?",
    options=["Her", "His", "She", "He"], answer="Her", passage=PA,
    why="여자 친구 Jisu의 이름이므로 Her name을 씁니다.")
b.q(S, "B", "코끼리를 묘사하는 문장으로 알맞은 것은 무엇인가요?",
    options=["It is big and gray.", "It is small and pink.", "It has wings.", "It lives in water."], answer="It is big and gray.",
    why="코끼리는 크고 회색입니다.")
b.q(S, "A", "‘My Best Friend’의 빈칸 ③에 알맞은 낱말은 무엇인가요?",
    options=["has", "have", "is", "are"], answer="has", passage=PA,
    why="주어가 She이므로 has를 씁니다.")
b.q(S, "A", "우리 형(오빠)이 키가 크다고 소개하는 문장을 바르게 쓴 것은 무엇인가요?",
    options=["My brother is tall.", "My brother tall is.", "My brother are tall.", "Tall my brother is."], answer="My brother is tall.",
    why="영어 문장은 주어 + be동사 + 형용사 순서로 씁니다.")

# ───────── 6영02-05 장소·위치·행동 순서와 방법 ─────────
S = "6영02-05"
b.q(S, "C", "‘Asking the Way’의 빈칸 ①에 알맞은 낱말은 무엇인가요?",
    options=["turn", "turns", "turned", "turning"], answer="turn", passage=PB,
    why="길을 안내할 때는 Turn right.처럼 동사원형으로 말합니다.")
b.q(S, "C", "그림에서 은행(bank)은 우체국(post office)의 어느 쪽에 있나요? 알맞게 말한 문장은 무엇인가요?",
    svg=row_buildings(["post office", "bank", "park"]),
    options=["The bank is next to the post office.", "The bank is under the post office.", "The bank is behind the park.", "The bank is on the post office."], answer="The bank is next to the post office.",
    why="은행은 우체국 옆에 있습니다.")
b.q(S, "B", "‘Asking the Way’의 빈칸 ②에 알맞은 낱말은 무엇인가요?",
    options=["between", "on", "under", "in"], answer="between", passage=PB,
    why="은행과 공원 사이에 있으므로 between입니다.")
b.q(S, "B", "그림에서 도서관의 위치를 바르게 설명한 문장은 무엇인가요?",
    svg=row_buildings(["bank", "library", "park"]),
    options=["The library is between the bank and the park.", "The library is behind the bank.", "The library is next to the post office.", "The library is on the park."], answer="The library is between the bank and the park.",
    why="도서관은 은행과 공원 사이에 있습니다.")
b.q(S, "A", "대화에서 길 안내 순서로 알맞은 것은 무엇인가요?",
    options=["두 블록 직진 → 은행에서 오른쪽으로 돌기", "은행에서 오른쪽으로 돌기 → 두 블록 직진", "두 블록 직진 → 은행에서 왼쪽으로 돌기", "한 블록 직진 → 은행에서 오른쪽으로 돌기"], answer="두 블록 직진 → 은행에서 오른쪽으로 돌기", passage=PB,
    why="Go straight for two blocks. Then turn right at the bank.라고 했습니다.")
b.q(S, "A", "아침에 하는 일을 순서대로 말한 문장으로 알맞은 것은 무엇인가요?",
    options=["First, I wash my face. Then, I eat breakfast.", "First, Then I wash my face I eat.", "I breakfast First eat wash.", "Wash first I my Then."], answer="First, I wash my face. Then, I eat breakfast.",
    why="First, Then 같은 순서 낱말로 행동의 순서를 말할 수 있습니다.")

# ───────── 6영02-06 감정·의견·경험·계획 ─────────
S = "6영02-06"
b.q(S, "C", "‘My Diary’의 빈칸 ②에 알맞은 낱말은 무엇인가요?",
    options=["happy", "sad", "angry", "hungry"], answer="happy", passage=PC,
    why="영어 시험을 잘 봐서 기분이 좋으므로 happy입니다.")
b.q(S, "C", "그림 속 표정에 알맞은 감정 낱말을 쓰세요: I am ____.",
    svg=face("sad"), answers=["sad"],
    why="슬픈 표정이므로 sad입니다.")
b.q(S, "B", "‘My Diary’의 빈칸 ①에 알맞은 낱말은 무엇인가요?",
    options=["good", "goods", "well", "gooder"], answer="good", passage=PC,
    why="day(명사)를 꾸미는 형용사는 good입니다.")
b.q(S, "B", "여름에 제주도에 갔던 경험을 말하는 문장을 완성하세요: I ____ to Jeju last summer.",
    answers=["went", "Went"],
    why="last summer는 지난 일이므로 과거형 went를 씁니다.")
b.q(S, "A", "‘My Diary’의 빈칸 ③에 알맞은 낱말은 무엇인가요?",
    options=["will", "was", "did", "went"], answer="will", passage=PC,
    why="Tomorrow는 미래이므로 will go를 씁니다.")
b.q(S, "A", "내 의견을 말할 때 알맞은 문장은 무엇인가요?",
    options=["I think English is fun.", "English fun think I.", "I am think English.", "Think I English fun."], answer="I think English is fun.",
    why="I think ~는 의견을 말하는 표현입니다.")

# ───────── 6영02-07 세부 정보 묻고 답하기 ─────────
S = "6영02-07"
b.q(S, "C", "토끼의 나이를 묻는 질문으로 알맞은 것은 무엇인가요?",
    options=["How old is it?", "What is it?", "Where is it?", "Who is it?"], answer="How old is it?",
    why="나이를 물을 때는 How old ~?를 씁니다.", passage=PD)
b.q(S, "C", "Where do you live? 에 알맞은 대답은 무엇인가요?",
    options=["I live in Busan.", "I am ten.", "It is red.", "Yes, I do."], answer="I live in Busan.",
    why="장소를 물을 때는 I live in ~. 로 답합니다.")
b.q(S, "B", "토끼가 먹는 것을 묻고 답한 부분에서 토끼가 먹는 것은 무엇인가요? (영어 낱말 하나로 쓰세요)",
    answers=["carrots", "carrot", "grass"], passage=PD,
    why="It eats carrots and grass.라고 했습니다.")
b.q(S, "B", "시각을 묻는 질문으로 알맞은 것은 무엇인가요?",
    options=["What time is it?", "What color is it?", "How many are there?", "Who is she?"], answer="What time is it?",
    why="시각은 What time is it?으로 묻습니다.")
b.q(S, "A", "질문과 대답이 알맞게 짝지어진 것은 무엇인가요?",
    options=["A: What does it eat? B: It eats carrots.", "A: How old is it? B: It eats carrots.", "A: What is its name? B: It is two years old.", "A: Do you have a pet? B: It is Snow."], answer="A: What does it eat? B: It eats carrots.", passage=PD,
    why="What does it eat?에는 먹는 것으로 답해야 합니다.")
b.q(S, "A", "How many pets do you have? 에 알맞은 대답은 무엇인가요?",
    options=["I have two cats.", "I have a good time.", "It is cute.", "I am fine."], answer="I have two cats.",
    why="How many ~?는 수를 묻는 질문이므로 개수로 답합니다.")

# ───────── 6영02-08 예시문을 참고하여 간단한 글쓰기 ─────────
S = "6영02-08"
b.q(S, "C", "예시문을 참고하여 빈칸에 알맞은 낱말을 쓰세요: Dear Grandma, Thank ____ for the lovely scarf.",
    answers=["you"], passage=PE,
    why="감사를 전하는 표현은 Thank you for ~입니다.")
b.q(S, "C", "생일 카드에 쓰는 인사말을 영어로 쓰세요. (두 낱말, 느낌표 포함)",
    answers=["Happy birthday!", "Happy Birthday!", "Happy birthday", "Happy Birthday", "happy birthday", "happy birthday!"],
    why="생일 카드의 인사말은 Happy birthday!입니다.")
b.q(S, "B", "예시문의 형식에 맞게 쓴 글은 무엇인가요? (친구 Tom에게 책 선물을 받고 감사하는 글)",
    options=["Dear Tom, Thank you for the book. It is fun. Love, Jina", "Thank Tom book fun Jina Love Dear.", "Dear Jina, Thank you for the book. Love, Tom", "Dear Tom, I am sorry. Good night."], answer="Dear Tom, Thank you for the book. It is fun. Love, Jina", passage=PE,
    why="Dear ~, 감사 인사, 이유나 느낌, Love, 이름 순으로 씁니다.")
b.q(S, "B", "편지의 끝인사로 알맞은 것은 무엇인가요?",
    options=["Love, Mina", "Dear Mina", "Hello Mina", "Mina Dear"], answer="Love, Mina",
    why="편지의 끝에는 Love, Your friend 같은 끝인사와 이름을 씁니다.", passage=PE)
b.q(S, "A", "편지의 구성 요소를 순서대로 나열한 것은 무엇인가요?",
    options=["첫인사(Dear ~) → 본문 → 끝인사 → 이름", "본문 → 첫인사(Dear ~) → 끝인사 → 이름", "첫인사(Dear ~) → 끝인사 → 본문 → 이름", "첫인사(Dear ~) → 본문 → 이름 → 끝인사"], answer="첫인사(Dear ~) → 본문 → 끝인사 → 이름", passage=PE,
    why="예시문처럼 Dear ~로 시작하고 본문 뒤 끝인사와 이름을 씁니다.")
b.q(S, "A", "초대하는 글을 쓸 때 알맞은 문장은 무엇인가요?",
    options=["Please come to my party on Saturday.", "Come party my Saturday please on.", "My party is not Saturday you.", "Party please Saturday come."], answer="Please come to my party on Saturday.",
    why="Please come to ~는 초대할 때 쓰는 문장입니다.")

# ───────── 6영02-09 매체와 전략으로 창의적으로 표현 ─────────
S = "6영02-09"
b.q(S, "C", "포스터를 다른 반과 나누기 위해 학생들이 한 일은 무엇인가요?",
    options=["짧은 영상을 녹화했다", "포스터를 버렸다", "글을 지웠다", "발표를 하지 않았다"], answer="짧은 영상을 녹화했다", passage=PF,
    why="We also record a short video to share our poster with other classes.라고 했습니다.")
b.q(S, "C", "영어로 말할 낱말이 생각나지 않을 때 쓸 수 있는 전략으로 알맞은 것은 무엇인가요?",
    options=["그림을 그리거나 몸짓으로 표현한다", "아무 말도 하지 않는다", "포기하고 자리에 앉는다", "다른 사람에게 화를 낸다"], answer="그림을 그리거나 몸짓으로 표현한다",
    why="그림이나 몸짓으로도 뜻을 전할 수 있습니다.")
b.q(S, "B", "포스터에 쓸 문장으로 가장 알맞은 것은 무엇인가요?",
    options=["Eat more vegetables!", "vegetables eat the more", "Vegetables is bored", "Eat vegetable in not"], answer="Eat more vegetables!", passage=PF,
    why="짧고 분명한 명령문이 포스터에 알맞습니다.")
b.q(S, "B", "발표 자료를 만들 때 가장 알맞은 방법은 무엇인가요?",
    options=["그림과 짧은 문장으로 핵심 내용을 보여 준다", "아주 긴 글만 쓴다", "내용 없이 색칠만 한다", "친구의 자료를 그대로 쓴다"], answer="그림과 짧은 문장으로 핵심 내용을 보여 준다",
    why="그림과 짧은 문장은 핵심 내용을 전달하기 좋습니다.")
b.q(S, "A", "포스터에 밝은 색을 쓴 까닭은 무엇인가요?",
    options=["사람들이 쉽게 볼 수 있도록 하기 위해서이다", "색이 없어서이다", "글자를 감추려고", "시간이 남아서이다"], answer="사람들이 쉽게 볼 수 있도록 하기 위해서이다", passage=PF,
    why="we use bright colors, so people can see it easily라고 했습니다.")
b.q(S, "A", "친구들 앞에서 영어로 동물을 소개하려고 합니다. 창의적이고 효과적인 방법은 무엇인가요?",
    options=["동물 그림과 짧은 문장, 동작을 함께 사용한다", "동물 이름만 읽는다", "아무것도 준비하지 않는다", "다른 사람의 발표를 그대로 외운다"], answer="동물 그림과 짧은 문장, 동작을 함께 사용한다",
    why="여러 전략과 매체를 함께 쓰면 의미를 더 창의적으로 표현할 수 있습니다.")

# ───────── 6영02-10 의사소통 활동에 흥미·자신감, 협력 ─────────
S = "6영02-10"
b.q(S, "C", "Let’s do it together! 의 뜻으로 알맞은 것은 무엇인가요?",
    options=["함께 하자!", "혼자 해!", "그만하자!", "나는 싫어!"], answer="함께 하자!",
    why="Let’s ~는 ‘~하자’라는 권유의 표현입니다.")
b.q(S, "C", "친구가 도와주었을 때 하는 말을 영어로 쓰세요. (고맙다는 말, 두 낱말)",
    answers=["Thank you", "thank you", "Thank you.", "Thank you!", "thank you.", "Thanks", "thanks"],
    why="도움을 받은 뒤에는 Thank you.라고 말합니다.")
b.q(S, "B", "Can I join you? 에 알맞은 대답은 무엇인가요?",
    options=["Sure! Come on.", "No, I am ten.", "It is red.", "I like soccer."], answer="Sure! Come on.",
    why="함께하고 싶다는 말에는 Sure! 같은 말로 받아 줍니다.")
b.q(S, "B", "친구가 말하기 활동에서 실수했을 때 알맞은 말은 무엇인가요?",
    options=["That’s OK. Try again!", "You are bad.", "Be quiet!", "I don’t like you."], answer="That’s OK. Try again!",
    why="격려하는 말을 하면 서로 자신감을 가지고 활동할 수 있습니다.")
b.q(S, "A", "모둠 활동에서 역할을 나눌 때 가장 알맞은 말은 무엇인가요?",
    options=["You draw, and I will write. Let’s start!", "I do everything.", "You do it alone.", "I don’t want to work."], answer="You draw, and I will write. Let’s start!",
    why="역할을 나누고 함께 시작하자고 말하는 것이 협력하는 표현입니다.")
b.q(S, "A", "영어 말하기 시간에 자신 없는 친구에게 해 줄 수 있는 말로 가장 알맞은 것은 무엇인가요?",
    options=["Don’t worry. You can do it!", "Your English is bad.", "Don’t talk.", "Sit down."], answer="Don’t worry. You can do it!",
    why="용기를 북돋는 말은 친구가 자신감을 갖게 합니다.")

if __name__ == "__main__":
    report(bank, 6, lo=250, hi=700)
    bank.save(os.path.join(os.path.dirname(__file__), "..", "banks", bank.outfile))
