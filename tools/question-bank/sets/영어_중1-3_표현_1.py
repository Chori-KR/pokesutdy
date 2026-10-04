"""영어 · 중1-3 · 표현 — 자동 생성 래퍼"""
import os, sys, math
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, os.path.dirname(__file__))
from common import Bank
from kit_ko import KoBank, report
from svgkit import svg, text, line, table, bar_graph, hbar_graph, line_graph, BLUE, ORANGE, C, _n

bank = Bank("영어", "중", "영어", "중1-3", "표현", "bank_영어_중1-3_표현_1.json")
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

P1 = b.passage("p1", "My Winter Vacation Plan",
    "This winter vacation, I have a big plan. First, I'm going to visit my grandparents in the countryside. I (1) there last year, and it was wonderful. We made rice cakes together, and I played in the snow all day. This year, I want to learn how to ski. After that, I am going to read at least five books. I also plan to (2) my room by myself before school starts. I hope this vacation will be fun and useful for me.", "직접 지음")
P2 = b.passage("p2", "A Rainy Picnic",
    "We planned a picnic in the park on Sunday. (1) it rained all morning, we had the picnic in the living room instead. First, we spread a blanket on the floor. (2), we ate sandwiches and fruit together. (3) lunch, we played board games for two hours. It was not the picnic we planned, but we had a really good time. Next time, we will check the weather forecast before we make a plan. My mother also said that we can have another picnic in the park when the weather gets better, and we are all looking forward to it.", "직접 지음")
P3 = b.passage("p3", "Why I Was Late",
    "I was late for school this morning because my bike had a flat tire. I tried to fix it, but I did not have the right tools. So I left the bike at home and ran to the bus stop. Unfortunately, I missed the bus, and I had to walk the rest of the way. As a result, I got to school twenty minutes late and felt very tired in the first class. This afternoon, my dad and I fixed the tire together. Now my bike is ready again.", "직접 지음")
P4 = b.passage("p4", "Honeybees at Work",
    "Honeybees live together in a group called a colony. Each bee has its own job. Some bees clean the hive, and some take care of baby bees. Older bees fly out to find flowers. When they find a good flower, they return to the hive and dance to tell the other bees where it is. Bees drink nectar from flowers and turn it into honey. While they move from flower to flower, they also carry pollen, which helps plants make seeds. Without bees, we would have fewer fruits and vegetables.", "직접 지음")
P5 = b.passage("p5", "Our Class Garden",
    "In March, our class started a small garden behind the school. At first, the ground was hard and full of stones, so we worked together to dig it and add soft soil. Each team planted a different vegetable, such as lettuce, tomatoes, and carrots. We took turns watering the plants every morning. In June, we picked the vegetables and made a big salad for lunch. Everyone said it was the tastiest salad ever. Now we know that patience and teamwork can turn a hard field into a garden.", "직접 지음")
P6 = b.passage("p6", "An Email to a Friend",
    "(1) Mina, How are you? I'm writing to tell you about my school trip. Last Friday, my class went to the science museum. We saw a real dinosaur skeleton and made small robots. I took many photos, and I will send them to you this weekend. I hope you can visit me during the vacation. We can go to the museum together, and my mother will cook your favorite noodles for dinner. Please write back soon and tell me about your new school, too. I really miss talking with you every day. (2), Jisu", "직접 지음")
P7 = b.passage("p7", "Diary: A Special Day",
    "Monday, May 5. Today was Children's Day. In the morning, my family went to an amusement park. I ride a roller coaster three times, and my little brother cried a little. In the afternoon, we ate ice cream and took a family photo. I was tired but very happy. I want to go there again with my friends. Tomorrow I have to go back to school, so I will go to bed early tonight and sleep well. I think I will write about this wonderful day in my English homework, too.", "직접 지음")
P8 = b.passage("p8", "School Uniforms",
    "In my opinion, students should wear school uniforms. First, uniforms save time in the morning because we do not have to choose what to wear. Second, they make everyone look equal, so no one feels bad about expensive clothes. For example, in my class, some students used to worry about their brand-name shoes. Of course, some people say uniforms are uncomfortable. However, I think we can choose soft and light uniforms. For these reasons, I believe uniforms are good for our school.", "직접 지음")

# ───────── 9영02-01 연음·축약 ─────────
S = "9영02-01"
Q(S, "C", "\"I will\"를 줄여서 말한 것은 무엇인가요?", "I'll", ["I'm", "I'd", "I've"], "I will의 줄임말은 I'll입니다.")
SH(S, "C", "\"She does not like carrots.\"에서 does not을 줄여 쓰세요.", ["doesn't", "Doesn't"], "does not = doesn't")
Q(S, "B", "\"I want to play soccer.\"를 빠르게 말할 때 want to가 이어져 나는 소리를 글로 쓴 것은 무엇인가요?", "wanna", ["gonna", "gotta", "lemme"], "want to는 wanna로 소리 납니다.")
Q(S, "B", "\"I have to go now.\"를 구어체로 줄여 말한 것은 무엇인가요?", "I gotta go now.", ["I gonna go now.", "I wanna go now.", "I lemme go now."], "have to는 gotta로 줄여 말합니다.")
Q(S, "A", "축약형이 바르게 쓰인 문장은 무엇인가요?", "They're going to school.", ["Their going to school.", "They're' going to school.", "Theyre going to school."], "They are의 축약형은 They're입니다.")
Q(S, "A", "\"You should have told me.\"를 축약해 쓴 것으로 알맞은 것은 무엇인가요?", "You should've told me.", ["You should of told me.", "You shouldn't told me.", "You should'nt have told me."], "should have는 should've로 줄입니다.")

# ───────── 9영02-02 감정 묘사 ─────────
S = "9영02-02"
Q(S, "C", "Jenny는 반려 고양이가 아파서 울고 있습니다. Jenny의 기분을 알맞게 묘사한 것은 무엇인가요?", "Jenny is sad.", ["Jenny is excited.", "Jenny is proud.", "Jenny is sleepy."], "우는 이유가 아픈 고양이이므로 sad입니다.")
SH(S, "C", "\"I'm very ___. I have a big test tomorrow.\"에 알맞은 감정 낱말을 쓰세요. (n으로 시작)", ["nervous", "Nervous", "worried"], "시험을 앞두고 긴장하거나 걱정되는 기분입니다.")
Q(S, "B", "한 소년이 상을 받고 활짝 웃으며 팔을 번쩍 들었습니다. 이 소년을 가장 알맞게 묘사한 문장은 무엇인가요?", "He looks proud and happy.", ["He looks bored and tired.", "He looks scared and lonely.", "He looks angry and upset."], "웃음과 팔을 번쩍 든 모습은 자랑스럽고 기쁜 기분입니다.")
Q(S, "B", "\"I'm happy.\"보다 더 강한 기쁨을 나타내는 표현은 무엇인가요?", "I'm thrilled.", ["I'm fine.", "I'm okay.", "I'm calm."], "thrilled는 매우 신나고 기쁜 상태입니다.")
Q(S, "A", "친구들이 생일을 잊어 버려 속상한 Tom의 기분을 묘사한 문장은 무엇인가요?", "Tom feels disappointed because his friends forgot his birthday.", ["Tom feels excited because his friends forgot his birthday.", "Tom feels proud because his friends forgot his birthday.", "Tom feels relaxed because his friends forgot his birthday."], "기대했던 일이 이루어지지 않아 실망한 감정입니다.")
SH(S, "A", "\"My heart is pounding and my hands are cold before the show.\"는 어떤 감정을 나타내나요? (n으로 시작하는 영어 한 단어)", ["nervous", "Nervous"], "무대 전의 심장 두근거림은 긴장(nervous)입니다.")

# ───────── 9영02-03 사실 정보 설명 ─────────
S = "9영02-03"
Q(S, "C", "해가 뜨는 방향을 바르게 설명한 문장은 무엇인가요?", "The sun rises in the east.", ["The sun rises in the west.", "The sun rise in the east.", "The sun rises on the east at night."], "해는 동쪽에서 뜹니다.")
SH(S, "C", "\"Seoul is the ___ of Korea.\"에 알맞은 낱말을 쓰세요. (수도)", ["capital", "Capital"], "수도는 capital입니다.")
Q(S, "B", "\"물은 섭씨 100도에서 끓는다\"를 영어로 알맞게 나타낸 문장은 무엇인가요?", "Water boils at 100 degrees Celsius.", ["Water boil at 100 degrees Celsius.", "Water boils in 100 degrees Celsius.", "Water is boiled at 100 degrees Celsius every day."], "일반적인 사실은 현재 시제로 표현합니다.")
Q(S, "B", "박쥐에 관한 사실을 설명한 문장으로 알맞은 것은 무엇인가요?", "Bats are the only mammals that can fly.", ["Bats is the only mammals that can fly.", "Bats are the only mammal that flies fly.", "Bats be the only mammals that can fly."], "복수 주어에는 are를 씁니다.")
Q(S, "A", "\"Mt. Halla is ___ than Mt. Namsan.\" 높이를 비교하는 문장에 알맞은 말은 무엇인가요?", "higher", ["high", "highest", "more high"], "비교급은 higher입니다.")
Q(S, "A", "\"치타는 시속 100킬로미터까지 달릴 수 있다\"를 알맞게 표현한 것은 무엇인가요?", "Cheetahs can run as fast as 100 km/h.", ["Cheetahs can runs fast than 100 km/h.", "Cheetahs can running as fast 100 km/h.", "Cheetah can run as fast as 100 km/h each."], "as fast as로 속도를 비교합니다.")

# ───────── 9영02-04 경험·계획 ─────────
S = "9영02-04"
Q(S, "C", "\"How was your weekend?\"에 대한 대답으로 알맞은 것은 무엇인가요?", "I went to the zoo with my family.", ["I will go to the zoo tomorrow.", "I am going to the zoo now.", "I go to the zoo every day."], "주말 경험을 묻는 질문에는 과거형으로 답합니다.")
SH(S, "B", "\"I ___ to Busan last summer.\"에 알맞은 go의 과거형을 쓰세요.", ["went", "Went"], "go의 과거형은 went입니다.")
Q(S, "A", "\"Have you ever been to Jeju Island?\"에 대한 대답으로 알맞은 것은 무엇인가요?", "Yes, I have. I visited there last year.", ["Yes, I will. I visited there last year.", "Yes, I am. I visit there last year.", "No, I do. I never visited there."], "경험을 묻는 현재완료 질문에는 have로 답합니다.")
Q(S, "C", "겨울 방학 계획 글의 (1)에 알맞은 말은 무엇인가요?", "went", ["go", "will go", "am going"], "last year가 있으므로 과거형 went입니다.", p=P1)
Q(S, "B", "겨울 방학 계획 글의 (2)에 알맞은 말은 무엇인가요?", "clean", ["cleaned", "cleans", "cleaning"], "plan to 뒤에는 동사원형이 옵니다.", p=P1)
Q(S, "A", "이 글의 내용과 일치하는 것은 무엇인가요?", "글쓴이는 올해 스키를 배울 계획이다", ["글쓴이는 작년에 스키를 배웠다", "글쓴이는 책을 한 권만 읽을 것이다", "글쓴이는 시골에 가지 않을 것이다"], "This year, I want to learn how to ski.", p=P1)

# ───────── 9영02-05 논리적 관계 ─────────
S = "9영02-05"
Q(S, "C", "소풍 글의 (1)에 알맞은 연결어는 무엇인가요?", "Because", ["But", "Or", "Before"], "비가 와서 안에서 했다는 원인을 나타냅니다.", p=P2)
Q(S, "B", "소풍 글의 (2)에 알맞은 연결어는 무엇인가요?", "Then", ["Because", "However", "Although"], "First 다음의 순서를 나타냅니다.", p=P2)
Q(S, "A", "소풍 글의 (3)에 알맞은 연결어는 무엇인가요?", "After", ["Before", "Until", "Because"], "점심 후에 보드게임을 했습니다.", p=P2)
Q(S, "C", "\"I tried to fix it, but I did not have the right tools.\"에서 but이 연결하는 관계는 무엇인가요?", "고치려고 했지만 안 된 대조 관계", ["원인과 결과", "순서", "예시"], "but은 반대되는 내용을 이어 줍니다.", p=P3)
Q(S, "B", "\"I got to school late. ___, I felt very tired.\"처럼 결과를 나타내는 연결어로 글에 쓰인 것은 무엇인가요?", "As a result", ["For example", "In the end", "At first"], "결과를 나타내는 표현은 As a result입니다.", p=P3)
SH(S, "A", "\"I missed the bus. I had to walk.\"를 because로 연결하면 \"I had to walk ___ I missed the bus.\"가 됩니다. 빈칸에 알맞은 낱말을 쓰세요.", ["because", "Because"], "원인을 나타내는 접속사 because를 씁니다.", p=P3)

# ───────── 9영02-06 의견 주장 ─────────
S = "9영02-06"
Q(S, "C", "자신의 의견을 말할 때 문장을 시작하는 표현으로 알맞은 것은 무엇인가요?", "In my opinion,", ["By the way,", "At last,", "Good night,"], "의견을 말할 때는 In my opinion을 씁니다.")
Q(S, "B", "\"I agree with you.\"의 뜻으로 알맞은 것은 무엇인가요?", "나는 너의 의견에 동의해", ["나는 너의 의견에 반대해", "나는 너를 모른다", "나는 너에게 질문한다"], "agree with는 동의한다는 뜻입니다.")
SH(S, "A", "\"I think we need more trees. ___, trees give us shade.\" 이유를 덧붙이는 연결어로 알맞은 낱말을 쓰세요. (F로 시작: F___, ...)", ["First", "first", "Second", "second", "Also", "also", "Besides", "besides"], "이유를 덧붙일 때 First, Second, Also 등을 씁니다.")
Q(S, "C", "글쓴이의 의견은 무엇인가요?", "학생들은 교복을 입어야 한다", ["학생들은 교복을 입지 말아야 한다", "교복은 비싸야 한다", "학교에 가지 않아야 한다"], "In my opinion, students should wear school uniforms.", p=P8)
Q(S, "B", "글쓴이가 제시한 이유로 알맞은 것은 무엇인가요?", "아침에 입을 옷을 고르는 시간이 줄어든다", ["교복이 항상 편안하다", "교복이 값비싸다", "교복을 입으면 숙제가 없다"], "uniforms save time in the morning", p=P8)
Q(S, "A", "마지막 문장 \"For these reasons, ...\"의 역할로 알맞은 것은 무엇인가요?", "앞의 이유를 정리하며 의견을 다시 강조한다", ["새로운 반대 의견을 소개한다", "질문을 던진다", "글을 시작한다"], "For these reasons는 결론에 쓰는 표현입니다.", p=P8)

# ───────── 9영02-07 요약 ─────────
S = "9영02-07"
Q(S, "C", "이 글을 한 문장으로 요약한 것은 무엇인가요?", "꿀벌은 집단 속에서 각자 일을 하며 꿀과 식물에 도움을 준다", ["꿀벌은 혼자 산다", "꿀벌은 꿀을 먹지 않는다", "꿀벌은 꽃을 싫어한다"], "벌의 역할과 도움을 요약합니다.", p=P4)
Q(S, "B", "요약에 반드시 들어가야 하는 내용은 무엇인가요?", "벌은 꿀을 만들고 꽃가루를 옮겨 식물에게 도움을 준다", ["벌집이 어디에 있는지", "벌의 크기가 얼마인지", "꿀의 값이 얼마인지"], "글의 핵심 내용입니다.", p=P4)
SH(S, "A", "\"Bees drink ___ from flowers and turn it into honey.\" 요약할 때 빠뜨리면 안 되는 낱말(꿀의 재료)을 쓰세요.", ["nectar", "Nectar"], "벌은 꽃의 nectar로 꿀을 만듭니다.", p=P4)
Q(S, "C", "이 글을 가장 알맞게 요약한 것은 무엇인가요?", "학급 친구들이 함께 정원을 가꾸고 채소를 수확했다", ["학급 친구들이 학교에서 시험을 보았다", "정원이 학교 앞에 있었다", "친구들이 채소를 사 왔다"], "정원 만들기와 수확이 핵심입니다.", p=P5)
Q(S, "B", "요약문에 넣기에 알맞은 문장은 무엇인가요?", "팀별로 다른 채소를 심고 차례로 물을 주었다", ["3월의 날씨는 따뜻했다", "상추는 비쌌다", "점심은 학교 식당에서 먹었다"], "과정의 핵심을 담은 문장입니다.", p=P5)
Q(S, "A", "이 글의 주제를 요약한 것으로 가장 알맞은 것은 무엇인가요?", "인내와 협동으로 딱딱한 땅도 정원이 될 수 있다", ["채소는 6월에만 자란다", "정원은 돈이 많이 든다", "샐러드는 만들기 어렵다"], "마지막 문장이 주제를 보여 줍니다.", p=P5)

# ───────── 9영02-08 일기·편지·이메일 ─────────
S = "9영02-08"
Q(S, "C", "이메일의 (1)에 알맞은 시작 인사는 무엇인가요?", "Dear", ["Good bye", "Thank", "Sorry"], "편지는 Dear로 시작합니다.", p=P6)
Q(S, "B", "이메일의 (2)에 알맞은 맺음말은 무엇인가요?", "Best wishes", ["Dear friend", "Good morning", "See you never"], "끝맺음 인사로 Best wishes를 씁니다.", p=P6)
SH(S, "A", "이메일에서 \"I took many photos, and I will send them to you this weekend.\"의 will send는 어느 때의 일을 나타내나요? (과거/미래 중 쓰기)", ["미래", "future"], "will + 동사원형은 미래를 나타냅니다.", p=P6)
Q(S, "C", "일기에서 가장 먼저 쓰는 것은 무엇인가요?", "날짜와 요일", ["친구 이름", "시험 점수", "주소"], "일기는 날짜와 요일로 시작합니다.", p=P7)
Q(S, "B", "일기의 \"I ride a roller coaster three times\"를 알맞게 고친 것은 무엇인가요?", "I rode a roller coaster three times.", ["I riding a roller coaster three times.", "I will ride a roller coaster three times.", "I rides a roller coaster three times."], "지난 일을 쓰는 일기는 과거형 rode를 씁니다.", p=P7)
Q(S, "A", "일기 마지막 부분에 덧붙이기에 가장 알맞은 문장은 무엇인가요?", "I will remember this day forever.", ["Dear Principal,", "Please send me an answer.", "Thank you for buying."], "하루의 느낌이나 다짐으로 일기를 마무리합니다.", p=P7)

# ───────── 9영02-09 매체·정보 윤리 ─────────
S = "9영02-09"
Q(S, "C", "친구의 사진을 온라인에 올리기 전에 해야 할 일은 무엇인가요?", "친구에게 허락을 받는다", ["그냥 올린다", "다른 사람에게 보내지 않고 숨긴다", "친구 이름을 지운다"], "May I post this photo? 하고 묻습니다.")
SH(S, "C", "사진을 올리기 전에 친구에게 \"May I post this photo?\"라고 묻는 것은 무엇을 구하는 것인가요? (영어 한 단어, p로 시작)", ["permission", "Permission"], "permission은 허락을 뜻합니다.")
Q(S, "B", "반 친구 모두에게 생일 파티를 알리는 초대장을 보낼 때 알맞은 매체는 무엇인가요?", "단체 메신저에 초대 글 올리기", ["친구 한 명에게만 전화하기", "낙서가 있는 공책에 쓰기", "아무에게도 알리지 않기"], "여러 사람에게 한꺼번에 알리기 적합한 매체를 고릅니다.")
Q(S, "B", "인터넷의 영어 글을 인용해 숙제를 할 때 알맞은 행동은 무엇인가요?", "출처를 함께 적는다", ["그대로 베끼고 내 글이라고 쓴다", "출처를 지운다", "이름을 바꿔 쓴다"], "정보 윤리: 출처를 밝혀야 합니다.")
Q(S, "A", "발표 자료에 사진을 쓰려고 합니다. 가장 알맞은 행동은 무엇인가요?", "누구나 쓸 수 있도록 허용한 사진을 쓰고 출처를 적는다", ["검색에서 처음 나온 사진을 말없이 쓴다", "다른 사람이 만든 그림에 내 이름을 쓴다", "어디서 가져왔는지 숨긴다"], "저작권과 출처 표기를 지킵니다.")
Q(S, "A", "다음 중 정보 윤리에 어긋나는 행동은 무엇인가요?", "친구의 비밀 대화를 허락 없이 단체방에 올리는 것", ["친구의 허락을 받고 사진을 올리는 것", "출처를 밝히고 글을 인용하는 것", "정확한 정보를 확인하고 전달하는 것"], "다른 사람의 사생활을 허락 없이 공개하면 안 됩니다.")

# ───────── 9영02-10 상황·목적 전략 ─────────
S = "9영02-10"
Q(S, "C", "글을 쓰기 전에 아이디어를 마구 떠올려 적어 보는 활동은 무엇인가요?", "브레인스토밍", ["받아쓰기", "베껴 쓰기", "외우기"], "아이디어를 모으는 쓰기 전 전략입니다.")
SH(S, "C", "쓰기 전에 아이디어를 쏟아 내는 활동을 영어로 brain___ 이라고 합니다. 빈칸에 알맞은 낱말을 쓰세요.", ["storming", "Storming"], "brainstorming은 아이디어를 쏟아 내는 활동입니다.")
Q(S, "B", "선생님께 정중하게 도움을 청하는 말로 알맞은 것은 무엇인가요?", "Could you help me, please?", ["Help me now.", "You must help me.", "Hey, help."], "상황과 대상에 맞는 정중한 표현입니다.")
Q(S, "B", "말하다가 영어 단어가 생각나지 않을 때 알맞은 전략은 무엇인가요?", "다른 말로 풀어서 설명한다", ["말을 멈추고 가만히 있는다", "한국어로만 말한다", "상대를 쳐다보지 않는다"], "의사소통을 이어 가는 전략입니다.")
Q(S, "A", "교장 선생님께 보내는 공식적인 이메일에 알맞은 문장은 무엇인가요?", "I would like to ask about the school festival.", ["Yo! Tell me about the festival.", "Hey, what's up with the festival?", "Gimme the festival info."], "공식적인 상황에는 정중하고 격식 있는 표현을 씁니다.")
Q(S, "A", "친구를 생일 파티에 초대하는 글에 꼭 필요한 정보로 알맞은 것은 무엇인가요?", "날짜, 시간, 장소", ["친구의 몸무게", "숙제 답", "지난주 날씨"], "초대의 목적에 맞는 정보입니다.")

if __name__ == "__main__":
    report(bank, 6, lo=400, hi=900)
    bank.save(os.path.join(os.path.dirname(__file__), "..", "banks", bank.outfile))
