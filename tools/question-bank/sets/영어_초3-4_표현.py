"""영어 · 초3-4 · 표현 (4영02-01 ~ 10) — 60문제"""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, os.path.dirname(__file__))
from common import Bank
from svgkit import svg, text, line, table, BLUE, ORANGE, C
from kit_ko import KoBank, report
from kit_soc import compare_table
from kit34 import hold
from kit12 import clock
from kit_en import letters, syllables, weather, face, icon, icons_row, in_box

bank = Bank("영어", "초", "영어", "초3-4", "표현", "bank_영어_초3-4_표현.json")
b = KoBank(bank)

PA = b.passage("p1", "Self-Introduction",
               "Hello! (①) name is Sora. I (②) nine years old. I (③) a little brother. His name is Jun. He is five. We live in a small house. My favorite color is blue. I am in Class 3. I like pizza and soccer. Nice to meet you!", "직접 지음")
PB = b.passage("p2", "Making a New Friend",
               "A: Hello! I am Mina. B: Hello, Mina! A: Hi! What's your name? B: (①) A: Nice to meet you. How old are you? B: (②) A: Me, too! (③) B: I like soccer. A: Wow! Let's play together. B: Great! A: See you tomorrow! B: Bye!", "직접 지음")
PC = b.passage("p3", "Classroom Rules",
               "Rule 1: Raise your hand. Rule 2: Listen to your teacher. Rule 3: Don't run in the classroom. Rule 4: Be quiet in the library. Rule 5: Clean up your desk. Follow the rules and have a good day at school!", "직접 지음")
PD = b.passage("p4", "My Diary",
               "Dear Diary, I am very (①) today because I did not sleep well. At lunch, I am (②) and I want to eat pizza. But my friend gave me a gold star, so I am (③) now. It was a long day, but I will sleep well tonight. Good night!", "직접 지음")
PE = b.passage("p5", "Our Animal Poster",
               "Our group is making a poster about animals. We do not know the English word for ‘giraffe’, so we draw a picture of it. We use a tablet to find photos. We write short sentences like ‘It is tall.’ Then we show our poster and act like a giraffe in front of the class.", "직접 지음")
PF = b.passage("p6", "Borrowing a Pencil",
               "Tom: Excuse me, Ann. Can I borrow your pencil? Ann: Sure. Here you are. Tom: Thank you. Ann: You're welcome. Tom: Oh, sorry! I dropped it. Ann: It's OK. Tom: Thanks for waiting for me. Ann: No problem!", "직접 지음")

# ───────── 4영02-01 강세·리듬·억양에 맞게 따라 말하기 ─────────
S = "4영02-01"
b.q(S, "C", "선생님이 ‘Hello!’ 하고 인사해요. 따라 말하는 방법으로 가장 알맞은 것은 무엇인가요?",
    options=["선생님의 소리를 잘 듣고 같은 억양으로 또박또박 말한다", "아주 작은 소리로 다른 말을 한다", "말하지 않고 웃기만 한다", "빠르게 아무 소리나 낸다"], answer="선생님의 소리를 잘 듣고 같은 억양으로 또박또박 말한다",
    why="듣고 같은 강세와 억양으로 따라 말하는 것이 알맞습니다.")
b.q(S, "C", "apple을 따라 말할 때 강하게 읽는 부분은 첫 번째와 두 번째 중 몇 번째인가요? (숫자로 쓰세요)",
    answers=["1", "첫", "첫 번째", "첫번째", "1번째"],
    why="apple은 첫 번째 부분 ap을 강하게 읽습니다.")
b.q(S, "B", "I like apples. 를 자연스럽게 말할 때 가장 강하게 읽는 낱말 두 개는 무엇인가요?",
    options=["like, apples", "I, like", "I, apples", "I, like, apples 모두 똑같이"], answer="like, apples",
    why="의미를 전하는 낱말(like, apples)을 강하게 읽고 I는 약하게 읽습니다.")
b.q(S, "B", "Can you swim? 을 따라 말할 때 끝억양은 어떻게 하나요?",
    options=["끝을 올린다", "끝을 내린다", "끝을 길게 끈다", "끝을 말하지 않는다"], answer="끝을 올린다",
    why="‘예/아니요’로 답하는 질문은 끝을 올려 말합니다.")
b.q(S, "A", "What's your name? 처럼 what으로 시작하는 질문을 따라 말할 때 알맞은 끝억양은 무엇인가요?",
    options=["끝을 내려서 말한다", "끝을 계속 올린다", "끝을 말하지 않는다", "끝을 높고 길게 끈다"], answer="끝을 내려서 말한다",
    why="what, where 등으로 시작하는 질문은 보통 끝을 내려서 말합니다.")
b.q(S, "A", "I have a pen. 을 리듬에 맞게 읽을 때 약하고 빠르게 읽는 낱말 두 개는 무엇인가요?",
    options=["I, a", "have, pen", "I, pen", "have, a"], answer="I, a",
    why="의미가 큰 낱말(have, pen)을 강하게 읽고 I, a 같은 낱말은 약하게 읽습니다.")

# ───────── 4영02-02 대소문자 구별하여 쓰기 ─────────
S = "4영02-02"
b.q(S, "C", "내 친구의 이름이 tom입니다. 이름을 바르게 쓴 것은 무엇인가요?",
    options=["Tom", "tom", "TOm", "tOm"], answer="Tom",
    why="이름은 첫 글자를 대문자로 쓰고 나머지는 소문자로 씁니다.")
b.q(S, "C", "소문자 p의 대문자는 무엇인가요?",
    svg=letters(["p"]),
    options=["P", "B", "D", "Q"], answer="P",
    why="p의 대문자는 P입니다.")
b.q(S, "B", "문장을 바르게 쓴 것은 무엇인가요?",
    options=["I am nine.", "i am nine.", "I Am nine.", "i AM nine."], answer="I am nine.",
    why="문장의 첫 글자와 I는 항상 대문자로 씁니다.")
b.q(S, "B", "요일 monday를 바르게 고쳐 쓰세요.",
    answers=["Monday"],
    why="요일 이름은 첫 글자를 대문자로 씁니다.")
b.q(S, "A", "대소문자를 모두 바르게 쓴 문장은 무엇인가요?",
    options=["My name is Jun.", "my name is jun.", "My Name Is Jun.", "my name is Jun."], answer="My name is Jun.",
    why="문장의 첫 글자와 사람 이름의 첫 글자만 대문자로 씁니다.")
b.q(S, "A", "‘korea is my country.’에서 대문자로 고쳐야 하는 낱말을 바르게 고쳐 쓰세요.",
    answers=["Korea"],
    why="나라 이름이자 문장의 첫 낱말이므로 Korea로 씁니다.")

# ───────── 4영02-03 소리와 철자로 단어 쓰기 ─────────
S = "4영02-03"
b.q(S, "C", "/k/ /æ/ /p/ 소리를 철자로 바르게 쓴 단어는 무엇인가요?",
    options=["cap", "cab", "cup", "kap"], answer="cap",
    why="/k/는 c, /æ/는 a, /p/는 p로 써서 cap입니다.")
b.q(S, "C", "/p/ /ɪ/ /g/ 소리를 이어서 만든 단어를 쓰세요.",
    answers=["pig", "Pig"],
    why="/p/ /ɪ/ /g/ 소리를 철자로 쓰면 pig입니다.")
b.q(S, "B", "fish의 끝소리 /ʃ/ 를 나타내는 철자는 무엇인가요?",
    options=["sh", "ch", "th", "ph"], answer="sh",
    why="fish의 끝소리 /ʃ/는 sh로 씁니다.")
b.q(S, "B", "ship의 빈칸에 알맞은 모음 철자를 쓰세요: sh_p",
    answers=["i", "I"],
    why="ship은 sh-i-p로 씁니다.")
b.q(S, "A", "/keɪk/ 소리를 철자로 바르게 쓴 것은 무엇인가요?",
    options=["cake", "kake", "caik", "cak"], answer="cake",
    why="a_e 형태로 /eɪ/ 소리를 나타내며 cake로 씁니다.")
b.q(S, "A", "g, d, o 세 글자를 한 번씩 써서 만들 수 있는 동물 이름을 쓰세요.",
    answers=["dog", "Dog"],
    why="d-o-g를 이으면 dog입니다.")

# ───────── 4영02-04 그림을 보고 말하거나 쓰기 ─────────
S = "4영02-04"
b.q(S, "C", "그림에 알맞은 단어는 무엇인가요?",
    svg=icons_row([("apple", 1)]),
    options=["apple", "ball", "book", "star"], answer="apple",
    why="그림은 사과이므로 apple입니다.")
b.q(S, "C", "그림을 보고 알맞은 영어 단어를 쓰세요.",
    svg=icons_row([("book", 1)]),
    answers=["book", "Book"],
    why="그림은 책이므로 book입니다.")
b.q(S, "B", "그림을 보고 How many apples? 에 알맞게 답한 것은 무엇인가요?",
    svg=icons_row([("apple", 3)]),
    options=["Three apples.", "Two apples.", "Four apples.", "One apple."], answer="Three apples.",
    why="사과가 3개이므로 Three apples.입니다.")
b.q(S, "B", "그림을 보고 빈칸에 알맞은 단어를 쓰세요: It is a ____.",
    svg=icons_row([("fish", 1)]),
    answers=["fish", "Fish"],
    why="그림은 물고기이므로 fish입니다.")
b.q(S, "A", "그림에 알맞은 문장은 무엇인가요?",
    svg=icons_row([("ball", 1), ("star", 1), ("heart", 1)]),
    options=["I see a ball, a star, and a heart.", "I see a book, a star, and a heart.", "I see two balls and a heart.", "I see a ball and a house."], answer="I see a ball, a star, and a heart.",
    why="그림에는 공, 별, 하트가 하나씩 있습니다.")
b.q(S, "A", "그림과 맞는 문장은 무엇인가요?",
    svg=icons_row([("flower", 2), ("tree", 1)]),
    options=["There are two flowers and a tree.", "There is one flower and two trees.", "There are three flowers.", "There are two trees and a flower."], answer="There are two flowers and a tree.",
    why="꽃 2송이와 나무 1그루가 있습니다.")

# ───────── 4영02-05 소개·묘사하기 ─────────
S = "4영02-05"
b.q(S, "C", "Self-Introduction의 빈칸 ①에 알맞은 낱말은 무엇인가요?",
    options=["My", "Me", "I", "Is"], answer="My", passage=PA,
    why="‘나의 이름’은 My name입니다.")
b.q(S, "C", "자기 이름을 소개하는 문장은 무엇인가요?",
    options=["My name is Jun.", "I am Jun's.", "Jun is my.", "Name my Jun."], answer="My name is Jun.",
    why="이름은 My name is ~.로 소개합니다.")
b.q(S, "B", "빈칸 ②에 알맞은 낱말은 무엇인가요?",
    options=["am", "is", "are", "be"], answer="am", passage=PA,
    why="I 다음에는 am을 씁니다.")
b.q(S, "B", "My cat is small and white. 에서 ‘작은’에 해당하는 영어 낱말을 쓰세요.",
    answers=["small", "Small"],
    why="small은 ‘작은’이라는 뜻입니다.")
b.q(S, "A", "빈칸 ③에 알맞은 낱말은 무엇인가요?",
    options=["have", "has", "am", "is"], answer="have", passage=PA,
    why="I 다음에 ‘가지고 있다’는 have를 씁니다.")
b.q(S, "A", "다음 중 사람을 묘사하는 문장이 아닌 것은 무엇인가요?",
    options=["It is a pencil.", "She has long hair.", "He is tall.", "She is kind."], answer="It is a pencil.",
    why="It is a pencil.은 사물을 소개하는 문장입니다.")

# ───────── 4영02-06 행동 지시하기 ─────────
S = "4영02-06"
b.q(S, "C", "Classroom Rules에서 ‘Raise your hand.’의 뜻으로 알맞은 것은 무엇인가요?",
    options=["손을 드세요.", "손을 씻으세요.", "손을 흔드세요.", "손을 잡으세요."], answer="손을 드세요.", passage=PC,
    why="Raise your hand.는 ‘손을 드세요.’라는 뜻입니다.")
b.q(S, "C", "친구에게 ‘앉으세요.’라고 말하려고 합니다. 빈칸에 알맞은 낱말을 쓰세요: Sit ____.",
    answers=["down", "Down"],
    why="Sit down.은 ‘앉으세요.’입니다.")
b.q(S, "B", "도서관에서 지켜야 하는 말은 무엇인가요?",
    options=["Be quiet.", "Run fast.", "Shout loud.", "Play ball."], answer="Be quiet.", passage=PC,
    why="Rule 4에서 도서관에서는 Be quiet.라고 했습니다.")
b.q(S, "B", "친구에게 문을 열어 달라고 하는 지시 문장은 무엇인가요?",
    options=["Open the door.", "Close the book.", "Sit down.", "Stand up."], answer="Open the door.",
    why="Open the door.는 ‘문을 여세요.’라는 지시입니다.")
b.q(S, "A", "Don't run in the classroom. 의 뜻으로 알맞은 것은 무엇인가요?",
    options=["교실에서 뛰지 마세요.", "교실에서 뛰세요.", "교실에서 노래하세요.", "교실에서 청소하세요."], answer="교실에서 뛰지 마세요.", passage=PC,
    why="Don't + 동사는 ‘~하지 마세요’라는 뜻입니다.")
b.q(S, "A", "친구에게 ‘이야기하지 마세요.’라고 지시하는 문장은 무엇인가요?",
    options=["Don't talk.", "Talk.", "Don't walk.", "Sit down."], answer="Don't talk.",
    why="Don't talk.은 ‘이야기하지 마세요.’입니다.")

# ───────── 4영02-07 감정 표현하기 ─────────
S = "4영02-07"
b.q(S, "C", "My Diary에서 친구가 gold star를 주어서 기분이 좋아진 감정 ③에 알맞은 낱말은 무엇인가요?",
    options=["happy", "sad", "angry", "tired"], answer="happy", passage=PD,
    why="gold star를 받아서 기분이 좋으므로 happy입니다.")
b.q(S, "C", "그림 속 얼굴의 감정을 나타내는 낱말을 쓰세요: I am ____.",
    svg=face("sad"),
    answers=["sad", "Sad"],
    why="슬픈 표정이므로 sad입니다.")
b.q(S, "B", "일기에서 잠을 잘 못 자서 느끼는 감정 ①에 알맞은 낱말은 무엇인가요?",
    options=["tired", "hungry", "angry", "happy"], answer="tired", passage=PD,
    why="잠을 잘 못 자서 피곤하므로 tired입니다.")
b.q(S, "B", "그림 속 얼굴에 알맞은 말은 무엇인가요?",
    svg=face("angry"),
    options=["I am angry.", "I am happy.", "I am sleepy.", "I am hungry."], answer="I am angry.",
    why="화난 표정이므로 I am angry.입니다.")
b.q(S, "A", "점심 시간에 피자를 먹고 싶은 감정 ②에 알맞은 낱말은 무엇인가요?",
    options=["hungry", "sleepy", "sad", "angry"], answer="hungry", passage=PD,
    why="먹고 싶다는 표현이므로 배고픈 hungry입니다.")
b.q(S, "A", "졸리고 눈이 감길 때 감정을 나타내는 말로 알맞은 것은 무엇인가요?",
    svg=face("sleepy"),
    options=["I am sleepy.", "I am angry.", "I am surprised.", "I am hungry."], answer="I am sleepy.",
    why="졸린 표정이므로 I am sleepy.입니다.")

# ───────── 4영02-08 담화의 주요 정보 묻고 답하기 ─────────
S = "4영02-08"
b.q(S, "C", "Making a New Friend에서 이름을 묻는 말에 대한 답 ①로 알맞은 것은 무엇인가요?",
    options=["My name is Ben.", "I am fine.", "I like soccer.", "It is a ball."], answer="My name is Ben.", passage=PB,
    why="What's your name?에는 My name is ~.로 답합니다.")
b.q(S, "C", "How are you? 에 알맞은 대답은 무엇인가요?",
    options=["I'm fine, thank you.", "My name is Mina.", "I'm nine.", "It's a cat."], answer="I'm fine, thank you.",
    why="How are you?에는 I'm fine, thank you.라고 답합니다.")
b.q(S, "B", "How old are you? 에 대한 답 ②로 알맞은 것은 무엇인가요?",
    options=["I am ten.", "I am Ben.", "I like pizza.", "I am fine."], answer="I am ten.", passage=PB,
    why="나이를 묻는 말에는 I am ten.처럼 숫자로 답합니다.")
b.q(S, "B", "A: How old are you? B: I am ____. 빈칸에 ‘아홉’을 영어로 쓰세요.",
    answers=["nine", "Nine"],
    why="9는 영어로 nine입니다.")
b.q(S, "A", "취미를 묻는 ③에 알맞은 질문은 무엇인가요?",
    options=["What do you like?", "How old are you?", "Where are you?", "What time is it?"], answer="What do you like?", passage=PB,
    why="뒤에서 I like soccer.라고 답했으므로 좋아하는 것을 묻는 What do you like?가 알맞습니다.")
b.q(S, "A", "공이 어디에 있는지 묻는 Where is the ball? 에 알맞게 답한 것은 무엇인가요?",
    svg=in_box(True),
    options=["It's in the box.", "It's on the box.", "It's under the box.", "It's a box."], answer="It's in the box.",
    why="그림에서 공은 상자 안에 있으므로 in the box입니다.")

# ───────── 4영02-09 매체·전략을 활용한 창의적 표현 ─────────
S = "4영02-09"
b.q(S, "C", "Our Animal Poster에서 모르는 영어 낱말 ‘giraffe’를 표현하기 위해 한 일은 무엇인가요?",
    options=["그림을 그렸다", "아무 말도 하지 않았다", "다른 친구에게 숙제를 넘겼다", "포스터를 버렸다"], answer="그림을 그렸다", passage=PE,
    why="we draw a picture of it이라고 했습니다.")
b.q(S, "C", "영어로 말하다가 낱말이 생각나지 않을 때 도움이 되는 방법은 무엇인가요?",
    options=["몸짓이나 그림으로 표현한다", "말을 멈추고 포기한다", "다른 나라 말로만 말한다", "소리를 지른다"], answer="몸짓이나 그림으로 표현한다",
    why="몸짓이나 그림을 활용하면 낱말을 몰라도 의미를 전달할 수 있습니다.")
b.q(S, "B", "모둠이 사진을 찾기 위해 사용한 매체는 무엇인가요?",
    options=["tablet", "radio", "map", "letter"], answer="tablet", passage=PE,
    why="We use a tablet to find photos.라고 했습니다.")
b.q(S, "B", "포스터에서 글 말고 의미를 전달하는 데 쓸 수 있는 것을 영어 한 단어로 쓰세요. (그림)",
    answers=["picture", "Picture", "pictures", "photo", "photos"],
    why="그림(picture)이나 사진(photo)으로도 의미를 전달할 수 있습니다.")
b.q(S, "A", "발표를 더 재미있고 창의적으로 만드는 방법으로 글에 나온 것은 무엇인가요?",
    options=["기린 흉내를 내며 포스터를 보여 준다", "작은 소리로 읽기만 한다", "아무 준비 없이 발표한다", "친구의 포스터를 가져온다"], answer="기린 흉내를 내며 포스터를 보여 준다", passage=PE,
    why="act like a giraffe in front of the class라고 했습니다.")
b.q(S, "A", "좋아하는 동물을 소개하는 카드를 창의적으로 만들 때 알맞은 방법은 무엇인가요?",
    options=["그림, 짧은 문장, 색을 함께 사용한다", "아무것도 쓰지 않는다", "친구 것을 그대로 베낀다", "글자를 작게 쓴다"], answer="그림, 짧은 문장, 색을 함께 사용한다",
    why="다양한 방법을 함께 쓰면 의미를 더 창의적으로 표현할 수 있습니다.")

# ───────── 4영02-10 대화 예절 ─────────
S = "4영02-10"
b.q(S, "C", "Thank you. 에 대한 대답으로 알맞은 말을 쓰세요.",
    answers=["You're welcome", "You're welcome.", "you're welcome", "You are welcome", "You are welcome."],
    why="Thank you.에는 You're welcome.이라고 답합니다.")
b.q(S, "C", "Borrowing a Pencil에서 Ann의 연필을 빌려 달라고 하기 전에 Tom이 한 말은 무엇인가요?",
    options=["Excuse me.", "Good night.", "Goodbye.", "Happy birthday."], answer="Excuse me.", passage=PF,
    why="Tom은 Excuse me, Ann.이라고 먼저 말했습니다.")
b.q(S, "B", "Tom이 Ann에게 연필을 빌려 받은 뒤에 해야 하는 말은 무엇인가요?",
    options=["Thank you.", "Sorry.", "Goodbye.", "Excuse me."], answer="Thank you.", passage=PF,
    why="받은 뒤 고마움을 표현하는 말은 Thank you.입니다.")
b.q(S, "B", "친구가 이야기할 때 올바른 태도는 무엇인가요?",
    options=["상대의 눈을 보며 끝까지 듣는다", "다른 곳을 보며 딴짓한다", "말을 끊고 내 이야기만 한다", "자리를 벗어난다"], answer="상대의 눈을 보며 끝까지 듣는다",
    why="대화 예절은 상대방을 바라보며 끝까지 들어 주는 것입니다.")
b.q(S, "A", "연필을 떨어뜨려 Tom이 Sorry라고 했을 때 Ann의 대답으로 알맞은 것은 무엇인가요?",
    options=["It's OK.", "Good morning.", "I'm hungry.", "See you."], answer="It's OK.", passage=PF,
    why="사과에는 It's OK.처럼 괜찮다고 답합니다.")
b.q(S, "A", "여럿이 대화할 때 차례를 지키는 방법으로 가장 알맞은 것은 무엇인가요?",
    options=["상대가 말을 끝낼 때까지 기다렸다가 내 차례에 말한다", "내 말이 먼저이므로 계속 끼어든다", "아무도 말하지 못하게 한다", "큰 소리로 소리친다"], answer="상대가 말을 끝낼 때까지 기다렸다가 내 차례에 말한다",
    why="차례를 지키며 서로 배려하는 것이 대화 예절입니다.")

if __name__ == "__main__":
    report(bank, 6, lo=200, hi=500)
    bank.save(os.path.join(os.path.dirname(__file__), "..", "banks", bank.outfile))
