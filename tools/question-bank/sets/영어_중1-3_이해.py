"""영어 · 중1-3 · 이해 — 자동 생성 래퍼"""
import os, sys, math
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, os.path.dirname(__file__))
from common import Bank
from kit_ko import KoBank, report
from svgkit import svg, text, line, table, bar_graph, hbar_graph, line_graph, BLUE, ORANGE, C, _n

bank = Bank("영어", "중", "영어", "중1-3", "이해", "bank_영어_중1-3_이해.json")
b = KoBank(bank)


def Q(S, lv, body, ok, bad, why, p=None, svg=None):
    kw = dict(options=[ok] + list(bad), answer=ok, why=why, passage=p)
    if svg:
        kw["svg"] = svg
    b.q(S, lv, body, **kw)


def SH(S, lv, body, answers, why, p=None, svg=None):
    kw = dict(answers=answers, why=why, passage=p)
    if svg:
        kw["svg"] = svg
    b.q(S, lv, body, **kw)

P1 = b.passage("p1", "School Library Notice",
    "Greenfield Middle School Library Notice. The library is open from 8:30 a.m. to 4:30 p.m. on Monday, Tuesday, Wednesday, and Thursday. On Friday, it closes early at 2:00 p.m. You can borrow up to three books for seven days. If you need more time, you can ask the librarian to extend it for another week. Please keep the library quiet. Eating and drinking are not allowed, but you can bring a water bottle with a lid. Next Wednesday, we will have a special book fair in the library. Students who bring a library card can get a free bookmark.", "직접 지음")
P2 = b.passage("p2", "Summer Camp Schedule",
    "Sunny Valley Summer Camp, Day 1 Schedule. 9:00 Welcome and team games. 10:30 Swimming lessons. Please bring a swimsuit and a towel. 12:00 Lunch in the dining hall. 1:00 Art class. We will paint pictures of the mountains. 3:00 Snack time. 3:30 Hiking along the river. Wear comfortable shoes. 5:00 Campfire songs and stories. 6:30 Parents pick up their children. If it rains, the hiking will be replaced by an indoor movie in the main hall.", "직접 지음")
P3 = b.passage("p3", "A Beach Clean-up Day",
    "Last Saturday, my class went to a beach near our town, but we did not go swimming. We went there to clean it. Each student got a bag and gloves. At first, I thought picking up trash would be boring. But when I saw plastic bottles, cans, and even old fishing nets on the sand, I felt worried about the sea animals. We worked for two hours and filled forty bags. A man walking his dog said, \"Thank you. The beach looks beautiful again!\" Now I always carry a small bag when I visit the beach. One person cannot clean the whole sea, but every small action helps.", "직접 지음")
P4 = b.passage("p4", "Why Sleep Matters",
    "Many students stay up late to study or play games, but sleep is as important as food. During sleep, your body rests and grows, and your brain stores what you learned during the day. Teenagers need about eight to ten hours of sleep every night. Students who sleep well can focus better in class and feel less stressed. On the other hand, students who sleep too little often feel tired and forget things easily. To sleep better, try to go to bed at the same time every night, and turn off your phone one hour before bed. A good night's sleep is the best way to start a great day.", "직접 지음")
P5 = b.passage("p5", "How a Plant Grows",
    "A plant begins its life as a seed. First, the seed needs water and warm soil. After a few days, a small root grows down into the soil, and then a tiny stem grows up toward the light. Next, the first leaves open, and they use sunlight to make food for the plant. As the plant gets bigger, it grows more leaves and strong roots. Finally, the plant makes flowers. When the flowers die, they leave new seeds, and the cycle begins again. This is how one small seed can become a whole garden over time.", "직접 지음")
P6 = b.passage("p6", "A Bad Morning",
    "Eun-woo woke up late this morning because his alarm clock did not ring. He had no time for breakfast and ran to the bus stop, but the bus had already left. He felt upset and called his mother, but she was in a meeting. So he decided to take the subway. On the way, it started to rain hard, and he did not have an umbrella. When he finally got to school, his clothes were wet and the first class had already started. His teacher gave him a towel and said, \"Don't worry. It happens to everyone.\" After that day, Eun-woo checked his alarm every night.", "직접 지음")
P7 = b.passage("p7", "Jiho's Speech",
    "Jiho had to give a speech in English class today. All week, he practiced in front of the mirror, but this morning his hands were shaking and his heart was beating fast. When the teacher called his name, he took a deep breath and walked to the front. At first, his voice was quiet. Then he saw his friend Sora smiling at him, and he felt a little better. He finished the speech without stopping. The class clapped loudly, and the teacher said, \"Excellent work!\" Jiho smiled from ear to ear and thought, \"I did it! I'm so happy with myself.\"", "직접 지음")
P8 = b.passage("p8", "Mia and Coco",
    "Mia's dog, Coco, ran out of the gate yesterday afternoon. Mia looked for him in the park, near the school, and along the river, but she could not find him. When it got dark, she went home with tears in her eyes. She did not eat dinner and could not sleep. This morning, a neighbor knocked on the door. He was holding Coco in his arms. \"I found him near my garden,\" he said. Mia hugged Coco tightly and laughed. Then she said \"thank you\" many times. Now Coco has a new name tag with Mia's phone number on it.", "직접 지음")
P9 = b.passage("p9", "An Email to the Principal",
    "Dear Principal Kim, My name is Hajun, and I am a second-year student. I am writing about the bike racks in front of our school. At the moment, there are only ten racks, but more than forty students ride bikes every day. Many of us have to leave our bikes on the grass, and some bikes fall down and break. I think a few more racks would solve this problem. I would also be happy to help the school choose a good place for them. Thank you for reading my email. I hope to hear from you soon. Sincerely, Hajun Lee", "직접 지음")
P10 = b.passage("p10", "Reading Rabbits Book Club",
    "Do you love stories? Do you want to make new friends? Join the Reading Rabbits Book Club! We meet every Tuesday at lunch in Room 204. Each month, we choose one book and talk about our favorite parts. Last month, we read a funny adventure book, and everybody shared ideas and snacks. You do not need to be a fast reader. You only need a little time and a lot of curiosity. Sign up by this Friday at the library desk, and get a free bookmark. Come and discover how fun reading can be!", "직접 지음")
P11 = b.passage("p11", "After the Math Test",
    "Amy: How was your math test, Ben? Ben: It was a piece of cake! I finished early. Amy: Wow, you must have studied hard. Ben: Yes, I did. But Mina was under the weather today, so she missed the test. Amy: Oh no, is she okay? Ben: I think she has a cold. She said she will take a make-up test next week. Amy: I hope she feels better soon. By the way, our science test is next Monday. Ben: Don't worry. Let's study together this weekend. Two heads are better than one. Amy: Great idea! I'll bring some snacks.", "직접 지음")
P12 = b.passage("p12", "Dara's First Concert",
    "Dara was nervous about her first piano concert. Her teacher whispered, \"Break a leg!\" before she walked onto the stage. Dara smiled because she knew it meant \"Good luck!\" When she sat down, the room was so quiet that you could hear a pin drop. She took a deep breath and began to play. Her fingers danced across the keys, and the music filled the hall. After the last note, the audience stood up and cheered. Dara's heart was full. Her teacher later said, \"You really are the apple of your parents' eyes.\" Dara blushed, but she was happy.", "직접 지음")

# ───────── 9영01-01 연음·축약 ─────────
S = "9영01-01"
Q(S, "C", "빠르게 말할 때 \"I'm\"으로 줄어드는 두 단어는 무엇인가요?", "I am", ["I will", "I have", "it is"], "I'm은 I am을 줄인 말입니다.")
SH(S, "C", "\"don't\"는 어떤 두 단어를 줄인 말인가요? (영어로 쓰세요)", ["do not", "Do not"], "don't = do not 입니다.")
Q(S, "B", "대화에서 \"I'm gonna see a movie.\"라고 들렸습니다. gonna가 뜻하는 말은 무엇인가요?", "going to", ["want to", "got to", "have to"], "gonna는 going to가 줄어든 소리입니다.")
Q(S, "B", "\"Check it out.\"을 빠르게 말하면 \"체키라웃\"처럼 들립니다. 이렇게 앞 단어의 끝자음이 뒤 단어의 모음과 이어져 들리는 현상을 무엇이라고 하나요?", "연음(linking)", ["묵음", "강세 이동", "억양 상승"], "자음으로 끝난 단어와 모음으로 시작하는 단어가 이어져 소리 납니다.")
Q(S, "A", "\"She's gone home.\"에서 's가 줄이기 전에 나타내는 말은 무엇인가요?", "has", ["is", "was", "does"], "gone은 과거분사이므로 's는 has(현재완료)입니다.")
Q(S, "A", "\"I woulda called you.\"에서 woulda가 뜻하는 말은 무엇인가요?", "would have", ["would of", "will have", "was going"], "woulda는 would have가 줄어든 소리입니다.")

# ───────── 9영01-02 세부 정보 ─────────
S = "9영01-02"
Q(S, "C", "금요일에 도서관은 몇 시에 문을 닫나요?", "2:00 p.m.", ["4:30 p.m.", "8:30 a.m.", "3:00 p.m."], "Friday, it closes early at 2:00 p.m.", p=P1)
Q(S, "B", "도서관 안에서 허용되는 것은 무엇인가요?", "뚜껑이 있는 물병", ["샌드위치", "뜨거운 커피", "큰 소리의 음악"], "water bottle with a lid만 허용됩니다.", p=P1)
SH(S, "A", "Maria는 책 3권을 빌린 뒤 사서에게 한 번 연장을 요청했습니다. 모두 며칠 동안 책을 가지고 있을 수 있나요? (숫자만)", ["14", "fourteen", "14일"], "7일 + 연장 1주(7일) = 14일입니다.", p=P1)
SH(S, "C", "캠프 첫째 날 점심시간은 몇 시인가요? (예: 3:00)", ["12:00", "12", "12시"], "12:00 Lunch in the dining hall.", p=P2)
Q(S, "B", "하이킹을 할 때 캠프 참가자가 신어야 하는 것은 무엇인가요?", "편한 신발", ["수영복", "슬리퍼", "비옷"], "Hiking: Wear comfortable shoes.", p=P2)
Q(S, "A", "첫째 날 오후 내내 비가 옵니다. 3시 30분에 아이들은 무엇을 하게 되나요?", "실내에서 영화를 본다", ["강을 따라 걷는다", "수영 수업을 받는다", "캠프파이어를 한다"], "비가 오면 하이킹이 실내 영화로 바뀝니다.", p=P2)

# ───────── 9영01-03 중심 내용 ─────────
S = "9영01-03"
Q(S, "C", "이 글의 제목으로 가장 알맞은 것은 무엇인가요?", "A Beach Clean-up Day", ["A Swimming Contest", "My Dog at the Beach", "Fishing with My Dad"], "해변을 청소한 날의 이야기입니다.", p=P3)
Q(S, "B", "이 글에서 학급 학생들이 해변에서 한 일은 무엇인가요?", "쓰레기를 주웠다", ["수영을 했다", "낚시를 했다", "모래성을 쌓았다"], "Each student got a bag and gloves to clean it.", p=P3)
Q(S, "A", "글쓴이가 마지막 문장으로 전하려는 요지는 무엇인가요?", "작은 행동도 바다를 지키는 데 도움이 된다", ["혼자서 바다를 모두 청소해야 한다", "해변에는 가지 않는 것이 좋다", "청소는 지루한 일이다"], "every small action helps가 요지입니다.", p=P3)
SH(S, "C", "글쓴이는 무엇이 음식만큼 중요하다고 하나요? (한 단어, 영어로)", ["sleep", "Sleep"], "sleep is as important as food.", p=P4)
Q(S, "B", "이 글은 주로 무엇에 관한 것인가요?", "잠이 몸과 공부에 주는 도움", ["게임을 하는 방법", "간식을 고르는 방법", "휴대 전화 만드는 방법"], "수면의 중요성과 좋은 수면 습관을 다룹니다.", p=P4)
Q(S, "A", "글쓴이가 가장 동의할 만한 말은 무엇인가요?", "충분히 자는 것도 좋은 공부 습관이다", ["늦게까지 깨어 있어야 더 많이 배운다", "잠은 시간 낭비이다", "휴대 전화는 자기 직전에 보는 것이 좋다"], "잘 자면 집중이 잘 되고 덜 피곤합니다.", p=P4)

# ───────── 9영01-04 논리적 관계 ─────────
S = "9영01-04"
Q(S, "C", "씨앗이 물과 따뜻한 흙을 얻은 뒤 가장 먼저 자라는 것은 무엇인가요?", "뿌리", ["줄기", "꽃", "씨앗"], "a small root grows down 이 먼저입니다.", p=P5)
Q(S, "B", "잎이 열린 뒤 잎이 하는 일은 무엇인가요?", "햇빛으로 식물의 양분을 만든다", ["꽃을 시들게 한다", "씨앗을 땅에 심는다", "뿌리를 끊는다"], "they use sunlight to make food for the plant.", p=P5)
Q(S, "A", "식물이 자라는 순서로 알맞은 것은 무엇인가요?", "씨앗 → 뿌리 → 줄기 → 잎 → 꽃", ["씨앗 → 줄기 → 뿌리 → 꽃 → 잎", "뿌리 → 씨앗 → 잎 → 줄기 → 꽃", "씨앗 → 잎 → 뿌리 → 줄기 → 꽃"], "글의 순서를 따라가면 알 수 있습니다.", p=P5)
Q(S, "C", "Eun-woo가 버스를 놓친 까닭은 무엇인가요?", "늦게 일어났기 때문이다", ["비가 왔기 때문이다", "어머니가 회의 중이었기 때문이다", "우산이 없었기 때문이다"], "알람이 울리지 않아 늦게 일어났습니다.", p=P6)
Q(S, "B", "버스를 놓친 직후 Eun-woo가 한 일은 무엇인가요?", "어머니에게 전화했다", ["지하철을 탔다", "수건을 받았다", "아침을 먹었다"], "버스가 떠난 뒤 어머니께 전화한 다음 지하철을 탔습니다.", p=P6)
SH(S, "A", "Eun-woo가 그날 이후 매일 밤 알람을 확인하는 까닭은 무엇인가요? (한국어로 한 문장)", ["늦지 않으려고", "다시 늦지 않기 위해", "알람이 울리지 않아서 늦었기 때문에"], "알람이 울리지 않아 하루가 꼬였기 때문에 다시 늦지 않으려는 것입니다.", p=P6)

# ───────── 9영01-05 인물의 감정 ─────────
S = "9영01-05"
Q(S, "C", "오늘 아침 발표를 앞둔 Jiho의 기분으로 알맞은 것은 무엇인가요?", "nervous (긴장한)", ["bored (지루한)", "angry (화난)", "sleepy (졸린)"], "손이 떨리고 심장이 빨리 뛰었습니다.", p=P7)
Q(S, "B", "Sora가 웃는 것을 본 뒤 Jiho의 기분으로 알맞은 것은 무엇인가요?", "encouraged (힘이 난)", ["embarrassed (창피한)", "jealous (질투하는)", "disappointed (실망한)"], "he felt a little better 이므로 힘을 얻었습니다.", p=P7)
Q(S, "A", "발표를 끝낸 뒤 Jiho의 감정을 가장 잘 나타낸 말은 무엇인가요?", "proud (자랑스러운)", ["lonely (외로운)", "afraid (두려운)", "confused (혼란스러운)"], "I did it! I'm so happy with myself.", p=P7)
SH(S, "C", "Coco가 사라진 날 밤, Mia의 기분은 어땠나요? (영어 한 단어: s로 시작하는 기분)", ["sad", "Sad"], "눈물을 흘리며 저녁도 먹지 못했습니다.", p=P8)
Q(S, "B", "Mia가 이웃에게 \"thank you\"를 여러 번 말한 까닭으로 알맞은 것은 무엇인가요?", "Coco를 찾아 주어 고마웠기 때문이다", ["이웃에게 화가 났기 때문이다", "새 이름표가 싫었기 때문이다", "이웃이 이사 갔기 때문이다"], "Coco를 안고 온 이웃에게 고마움을 표현했습니다.", p=P8)
Q(S, "A", "이 글에서 Mia의 감정 변화로 알맞은 것은 무엇인가요?", "worried → relieved (걱정 → 안도)", ["happy → sad (기쁨 → 슬픔)", "angry → bored (화 → 지루함)", "proud → ashamed (자랑 → 부끄러움)"], "잃어버린 뒤 걱정하다가 찾은 뒤 안도했습니다.", p=P8)

# ───────── 9영01-06 의도·목적 ─────────
S = "9영01-06"
Q(S, "C", "Hajun이 이메일을 쓴 목적은 무엇인가요?", "자전거 거치대를 더 설치해 달라고 요청하려고", ["자전거를 빌리려고", "학교 행사를 소개하려고", "자신의 생일을 알리려고"], "bike racks를 늘려 달라는 요청입니다.", p=P9)
Q(S, "B", "Hajun이 거치대가 더 필요하다고 한 이유로 알맞은 것은 무엇인가요?", "거치대는 10개인데 자전거를 타는 학생은 40명이 넘는다", ["거치대가 너무 비싸다", "자전거가 고장 났다", "학교가 문을 닫는다"], "ten racks, but more than forty students.", p=P9)
Q(S, "A", "\"I would also be happy to help the school choose a good place for them.\"에서 드러나는 Hajun의 태도는 무엇인가요?", "문제 해결에 기꺼이 도우려는 태도", ["책임을 다른 학생에게 미루는 태도", "불평만 하는 태도", "관심이 없는 태도"], "도와주겠다는 말에서 협조적인 태도를 알 수 있습니다.", p=P9)
Q(S, "C", "이 글의 목적으로 가장 알맞은 것은 무엇인가요?", "독서 동아리 가입을 권유하려고", ["책을 팔려고", "시험 일정을 알리려고", "도서관 규칙을 설명하려고"], "Join the Reading Rabbits Book Club!", p=P10)
Q(S, "B", "\"You do not need to be a fast reader.\"라고 쓴 의도는 무엇인가요?", "책 읽는 속도가 느려도 부담 없이 가입하라고 격려하려고", ["빨리 읽는 사람만 뽑으려고", "독서 대회를 홍보하려고", "책 읽기가 쉽다고 놀리려고"], "참여의 문턱을 낮추려는 문장입니다.", p=P10)
Q(S, "A", "글쓴이가 독자에게 바라는 다음 행동은 무엇인가요?", "금요일까지 도서관 데스크에서 신청한다", ["화요일 점심에 교실을 청소한다", "책을 한 권 사 온다", "지난달 책 내용을 발표한다"], "Sign up by this Friday at the library desk.", p=P10)

# ───────── 9영01-07 함축적 의미 ─────────
S = "9영01-07"
Q(S, "C", "Ben이 \"It was a piece of cake!\"라고 말한 뜻은 무엇인가요?", "시험이 아주 쉬웠다", ["케이크를 먹었다", "시험이 아주 어려웠다", "생일 파티가 있었다"], "piece of cake는 '식은 죽 먹기'라는 뜻입니다.", p=P11)
Q(S, "B", "\"Mina was under the weather today\"에서 under the weather의 뜻은 무엇인가요?", "몸이 좋지 않은", ["비를 맞은", "날씨를 좋아하는", "하늘 아래에 있는"], "곧이어 감기에 걸렸다는 말이 나옵니다.", p=P11)
Q(S, "A", "\"Two heads are better than one.\"이 암시하는 뜻은 무엇인가요?", "함께 하면 혼자 할 때보다 더 잘할 수 있다", ["머리가 둘인 사람이 더 똑똑하다", "혼자 공부해야 한다", "머리를 맞대면 아프다"], "함께 공부하자는 제안의 이유입니다.", p=P11)
Q(S, "C", "\"Break a leg!\"에 담긴 뜻은 무엇인가요?", "행운을 빈다", ["다리를 조심해라", "무대에서 내려와라", "연주를 멈춰라"], "글에서 \"Good luck!\"이라고 풀이합니다.", p=P12)
Q(S, "B", "\"you could hear a pin drop\"이 나타내는 분위기는 무엇인가요?", "매우 조용하다", ["매우 시끄럽다", "매우 어둡다", "매우 춥다"], "핀 떨어지는 소리까지 들릴 만큼 조용하다는 표현입니다.", p=P12)
Q(S, "A", "\"the apple of your parents' eyes\"에 담긴 뜻은 무엇인가요?", "부모님이 아주 사랑하는 사람", ["사과를 좋아하는 사람", "눈이 나쁜 사람", "부모님께 꾸중 듣는 사람"], "apple of one's eye는 몹시 소중한 사람을 뜻합니다.", p=P12)

# ───────── 9영01-08 매체·전략 ─────────
S = "9영01-08"
Q(S, "C", "긴 영어 글을 읽기 전에 제목과 그림을 먼저 살펴보는 까닭은 무엇인가요?", "글의 내용을 미리 짐작하기 위해서이다", ["글을 읽지 않기 위해서이다", "글쓴이를 찾기 위해서이다", "글자 수를 세기 위해서이다"], "읽기 전 전략으로 내용을 예측합니다.")
SH(S, "C", "영어 영상에서 소리를 놓쳤을 때 화면 아래에 말을 글로 보여 주는 기능을 영어로 무엇이라고 하나요?", ["subtitles", "captions", "subtitle", "caption"], "자막은 subtitles 또는 captions라고 합니다.")
Q(S, "B", "기차 시간표에서 \"10:30 출발\"이라는 정보만 빨리 찾아 읽는 전략은 무엇인가요?", "scanning", ["skimming", "memorizing", "translating"], "필요한 정보만 찾아 읽는 것이 scanning입니다.")
Q(S, "B", "모르는 단어가 나왔을 때 앞뒤 문장을 보고 뜻을 짐작하는 전략은 무엇인가요?", "문맥 단서 활용", ["건너뛰기", "소리 내어 한 번에 읽기", "글자 수 세기"], "문맥 속 단서로 뜻을 추측합니다.")
Q(S, "A", "영어 뉴스 영상을 이해하려는 학생이 한 행동 중 가장 효과적인 순서는 무엇인가요?", "제목 확인 → 자막과 함께 보기 → 핵심 낱말 메모", ["영상 끝까지 소리 끄기 → 바로 번역하기 → 잊어버리기", "댓글만 읽기 → 영상 보지 않기", "첫 장면만 보고 그만두기"], "읽기·듣기 전 중 후 전략을 함께 활용합니다.")
Q(S, "A", "한 달 동안의 기온 변화를 영어 설명과 함께 한눈에 보여 주기에 가장 알맞은 매체 자료는 무엇인가요?", "꺾은선그래프가 있는 웹 기사", ["글자만 있는 편지", "음악 파일", "그림이 없는 사전"], "그래프는 수치 변화를 한눈에 보여 줍니다.")

# ───────── 9영01-09 관점 존중 ─────────
S = "9영01-09"
Q(S, "C", "친구가 \"I think summer is better than winter.\"라고 했는데 나는 겨울이 더 좋습니다. 상대를 존중하는 대답은 무엇인가요?", "I see. Why do you think so?", ["That's a silly idea.", "You are wrong.", "I don't want to listen."], "이유를 물으며 다른 의견을 듣는 태도입니다.")
SH(S, "C", "\"Everyone has different opinions. We should ___ them.\"에 들어갈 알맞은 영어 단어를 쓰세요. (r로 시작)", ["respect", "Respect"], "다른 의견을 존중해야 합니다.")
Q(S, "B", "토론에서 의견이 다를 때 알맞은 영어 표현은 무엇인가요?", "That's an interesting idea, but I see it differently.", ["Nobody agrees with you.", "Stop talking.", "That's boring."], "상대 의견을 인정하면서 내 생각을 말합니다.")
Q(S, "B", "글쓴이의 의견이 나와 다를 때 가장 알맞은 읽기 태도는 무엇인가요?", "근거를 살피며 다른 관점을 이해하려 한다", ["읽지 않고 덮는다", "글쓴이를 비웃는다", "내용을 모두 무시한다"], "다양한 관점을 존중하며 읽는 태도입니다.")
Q(S, "A", "Sam: \"I think school uniforms are good.\" 다음 중 Sam의 의견을 존중하면서 다른 의견을 말한 것은 무엇인가요?", "I understand your point, but I think free clothes help us show who we are.", ["That's the worst idea ever.", "Only a fool likes uniforms.", "I won't listen to you."], "존중하면서 자신의 의견을 표현합니다.")
Q(S, "A", "다음 중 상대방의 관점을 존중하지 않는 말은 무엇인가요?", "That's a silly idea. Nobody agrees with you.", ["Could you tell me more about that?", "I never thought of it that way.", "We can agree to disagree."], "상대를 깎아내리는 말입니다.")

# ───────── 9영01-10 관심사 ─────────
S = "9영01-10"
Q(S, "C", "축구를 좋아하는 학생이 영어로 읽기에 가장 알맞은 자료는 무엇인가요?", "축구 경기를 다룬 영어 스포츠 기사", ["요리 레시피 책", "우주 도감", "미술 전시 안내문"], "관심 분야의 글을 고르면 더 적극적으로 읽게 됩니다.")
SH(S, "C", "\"Cooking for Kids\"라는 책은 어떤 취미를 가진 학생에게 알맞은가요? (영어 한 단어)", ["cooking", "Cooking"], "제목처럼 요리에 관심 있는 학생에게 알맞습니다.")
Q(S, "B", "관심 있는 주제를 더 깊이 알고 싶을 때 알맞은 방법은 무엇인가요?", "주제와 관련된 낱말로 검색해 여러 자료를 비교해 읽는다", ["한 가지 자료만 읽는다", "읽지 않고 제목만 외운다", "친구가 읽은 것만 읽는다"], "스스로 자료를 찾아 비교하는 적극적인 태도입니다.")
Q(S, "B", "영어 노래를 좋아하는 학생이 영어 공부에 활용하기에 알맞은 자료는 무엇인가요?", "영어 가사를 보며 노래 듣기", ["가사 없는 연주곡만 듣기", "무음 영상 보기", "영어 사전 순서대로 읽기"], "좋아하는 노래의 가사로 자연스럽게 읽고 듣습니다.")
Q(S, "A", "Jina는 그림 그리기, Min은 로봇, Ari는 요리를 좋아합니다. Min에게 가장 알맞은 영어 도서 목록은 무엇인가요?", "\"Build Your Own Robot\", \"How Robots Move\"", ["\"Drawing Animals\", \"Colors of Art\"", "\"Easy Cakes\", \"Healthy Soup\"", "\"My Pet Dog\", \"A Day at the Zoo\""], "Min의 관심사는 로봇입니다.")
Q(S, "A", "관심 분야의 영어 글을 꾸준히 읽는 학생의 가장 적극적인 태도는 무엇인가요?", "스스로 자료를 고르고 읽은 내용을 기록해 친구와 나눈다", ["선생님이 정해 준 글만 읽는다", "한 번 읽고 잊는다", "친구 것을 베낀다"], "주도적으로 선택하고 활용하는 태도입니다.")

if __name__ == "__main__":
    report(bank, 6, lo=400, hi=900)
    bank.save(os.path.join(os.path.dirname(__file__), "..", "banks", bank.outfile))
