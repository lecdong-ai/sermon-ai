import { SermonResultData } from '@/types'

const MOCK_SUMMARY = {
  central_topic: '\uc131\ub839 \uac15\ub9bc \u2014 \ud558\ub098\ub2d8\uc758 \uc57d\uc18d\uc758 \uc131\ucde8\uc774\uc790 \uad50\ud68c\uc758 \uc2dc\uc791\uc774\uba70, \uc131\ub3c4\uc5d0\uac8c \ub2a5\ub825\uacfc \uc5f0\ud569\uc744 \uc8fc\uc2dc\ub294 \uc131\ub839\uc758 \uc5ed\uc0ac',
  intro: '\ubcf8\ubb38 \ub9d0\uc528: \uc0ac\ub3c4\ud589\uc804 2:1~13. \uc624\ub298 \ubcf8\ubb38\uc740 \uc624\uc21c\uc808 \uc131\ub839 \uac15\ub9bc \uc0ac\uac74\uc744 \uae30\ub85d\ud569\ub2c8\ub2e4. \uc774 \uc0ac\uac74\uc740 \ub2e8\uc21c\ud55c \uc5ed\uc0ac\uc801 \uc0ac\uac74\uc774 \uc544\ub2c8\ub77c, \uad6c\uc57d \uc694\uc5d8 \uc120\uc9c0\uc790\uc758 \uc608\uc5b8(\uc5d4 2:28~32)\uc758 \uc131\ucde8\uc774\uba70 \uad50\ud68c\uc758 \ud0c4\uc0dd\uc744 \uc54c\ub9ac\ub294 \uc911\ub300\ud55c \uc804\ud658\uc810\uc785\ub2c8\ub2e4. \uc800\uc790\ub294 \ub204\uac00\ub85c\uc11c, \uc778\uac04\uc758 \ub450\ub824\uc6c0\uacfc \uc5f0\uc57d\ud568\uc774\ub77c\ub294 \ubb38\uc81c \uc55e\uc5d0 \ud558\ub098\ub2d8\uaed8\uc11c \uc131\ub839\uc744 \ubd80\uc5b4\uc8fc\uc2ec\uc73c\ub85c\uc528 \ub2f4\ub300\ud55c \uc99d\uc778\uc73c\ub85c \uc138\uc6b0\uc2dc\ub294 \ubcf5\uc74c\uc758 \ub300\ub2f5\uc744 \uc81c\uc2dc\ud569\ub2c8\ub2e4. \uc624\uc21c\uc808\uc740 \uc720\ub300\uc778\uc758 \uce60\uce60\uc808\ub85c \uac01\uad6d\uc5d0\uc11c \ud754\uc5b4\uc9c4 \uc720\ub300\uc778\ub4e4\uc774 \uc608\ub8e8\uc0b4\ub818\uc5d0 \ubaa8\uc778 \ub54c\uc600\uc73c\uba70, \ubc14\ub85c \uc774\ub54c \ud558\ub098\ub2d8\uc740 \uc131\ub839\uc744 \ubaa8\ub4e0 \uc721\uccb4\uc5d0 \ubd80\uc5b4\uc8fc\uc2dc\uae30 \uc2dc\uc791\ud558\uc168\uc2b5\ub2c8\ub2e4.',
  body: '1. \uc57d\uc18d\uc758 \uc131\ucde8\ub85c\uc11c\uc758 \uc131\ub839 \u2014 \uc608\uc218\ub2d8\uaed8\uc11c \uc2b9\ucc9c \uc804 \uc81c\uc790\ub4e4\uc5d0\uac8c "\ub108\ud76c\ub294 \uba87 \ub0a0\uc774 \ubabb\ub418\uc5b4 \uc131\ub839\uc73c\ub85c \uc138\ub840\ub97c \ubc1b\uc73c\ub9ac\ub77c"\uace0 \uc57d\uc18d\ud558\uc168\uc2b5\ub2c8\ub2e4(\ud589 1:5). \uadf8\ub9ac\uace0 \uc624\uc21c\uc808, \uadf8 \uc57d\uc18d\uc774 \uc131\ucde8\ub418\uc5c8\uc2b5\ub2c8\ub2e4. \uc774\ub294 \ub2e8\uc21c\ud55c \uc0ac\uac74\uc774 \uc544\ub2c8\ub77c \uad6c\uc57d \uc131\uacbd \uc804\uccb4\ub97c \uad00\ud1b5\ud558\ub294 \ud558\ub098\ub2d8\uc758 \uad6c\uc6d0 \uc5ed\uc0ac\uc758 \uc808\uc815\uc785\ub2c8\ub2e4. \ud558\ub098\ub2d8\uc740 \uc544\ube0c\ub77c\ud568\uc5d0\uac8c \uc57d\uc18d\ud558\uc2e0 \uac83\uc744 \ubaa8\uc138\ub97c \ud1b5\ud574, \uc120\uc9c0\uc790\ub4e4\uc744 \ud1b5\ud574 \uc774\ub8e8\uc5b4 \uc624\uc2dc\ub2e4\uac00 \ub9c8\uce68\ub0b4 \uc131\ub839\uc744 \ubd80\uc5b4\uc8fc\uc2ec\uc73c\ub85c \uc2e0\uc57d \uad50\ud68c \uc2dc\ub300\ub97c \uc5ec\uc2e0 \uac83\uc785\ub2c8\ub2e4.\\\\n2. \ub2a5\ub825\uc758 \ubd80\uc5ec\ub85c\uc11c\uc758 \uc131\ub839 \u2014 \ub450\ub824\uc6cc \uc228\uc5b4 \uc788\ub358 \uc81c\uc790\ub4e4\uc774 \uc131\ub839\uc744 \ubc1b\uc790 \uc644\uc804\ud788 \ub2e4\ub978 \uc0ac\ub78c\uc774 \ub418\uc5c8\uc2b5\ub2c8\ub2e4. \ubca0\ub4dc\ub85c\ub294 \uc804\uc5d0 \ud558\ub140\uc758 \ub9d0\uc5d0\ub3c4 \uc608\uc218\ub97c \ubd80\uc778\ud558\ub358 \uc790\uc600\uc73c\ub098, \uc131\ub839\uc774 \uc784\ud558\uc2dc\uc790 \ub2f4\ub300\ud788 \uc77c\uc5b4\ub098 \uc124\uad50\ud558\uc5ec \uc0bc\ucc9c \uba85\uc774 \ud68c\uc2ec\ud558\ub294 \uc5ed\uc0ac\uac00 \uc77c\uc5b4\ub0ac\uc2b5\ub2c8\ub2e4(\ud589 2:41). \uc774\ub294 \uc778\uac04\uc758 \ud6c8\ub828\uc774\ub098 \ub178\ub825\uc774 \uc544\ub2cc, \uc131\ub839\uc758 \ucd08\uc790\uc5f0\uc801\uc778 \uc5ed\uc0ac\uc785\ub2c8\ub2e4. \uc131\ub839\uc740 \uc6b0\ub9ac\uc758 \uc5f0\uc57d\ud568\uc744 \ub2a5\ub825\uc73c\ub85c \ubc14\uafd0\uc2dc\ub294 \ubd84\uc774\uc2ed\ub2c8\ub2e4.\\\\n3. \uc5f0\ud569\uc758 \ud68c\ubcf5\uc73c\ub85c\uc11c\uc758 \uc131\ub839 \u2014 \uac01\uad6d\uc5d0\uc11c \uc628 \uc720\ub300\uc778\ub4e4\uc774 \uac01\uae30 \uc790\uae30\uc758 \ubc29\uc5b8\uc73c\ub85c \ubcf5\uc74c\uc744 \ub4e3\uace0 \ub180\ub77c\uc6cc\ud588\uc2b5\ub2c8\ub2e4. \uc774\ub294 \ubc14\ubca8\ud0d1 \uc0ac\uac74(\ucc3d 11\uc7a5)\uc5d0\uc11c \uc778\ub958\uac00 \uc5b8\uc5b4\uc758 \ud63c\ub780\uc73c\ub85c \ud754\uc5b4\uc84c\ub358 \uc800\uc8fc\uac00, \uc624\uc21c\uc808 \uc131\ub839 \uc548\uc5d0\uc11c \ucd95\ubcf5\uc73c\ub85c \uc5ed\uc804\ub418\ub294 \uc0ac\uac74\uc774\uc5c8\uc2b5\ub2c8\ub2e4. \uc778\uc885\uacfc \ubb38\ud654\uc640 \uc5b8\uc5b4\uc758 \uc7a5\ubcbd\uc774 \uc131\ub839 \uc548\uc5d0\uc11c \ubb34\ub108\uc9c0\uace0, \ud558\ub098\ub2d8\uc758 \ubc31\uc131\uc774 \ud558\ub098 \ub418\ub294 \ub180\ub77c\uc6b4 \uc5ed\uc0ac\uac00 \uc77c\uc5b4\ub09c \uac83\uc785\ub2c8\ub2e4.',
  conclusion: '\uc624\ub298\ub0a0 \uc6b0\ub9ac\uc5d0\uac8c\ub3c4 \ub3d9\uc77c\ud55c \uc131\ub839\uc758 \uc5ed\uc0ac\uac00 \ud544\uc694\ud569\ub2c8\ub2e4. \uad50\ud68c\ub294 \uc778\uac04\uc758 \uc804\ub7b5\uacfc \ub2a5\ub825\uc774 \uc544\ub2cc, \uc624\uc9c1 \uc131\ub839\uc758 \ub2a5\ub825\uc73c\ub85c \uc138\uc6cc\uc9c0\uace0 \ubd80\ud765\ud569\ub2c8\ub2e4. \uc6b0\ub9ac\uac00 \uc5f0\uc57d\ud558\uace0 \ubd80\uc871\ud560\uc9c0\ub77c\ub3c4, \uc131\ub839\uaed8\uc11c \uc6b0\ub9ac\ub97c \ud1b5\ud574 \uc77c\ud558\uc2e0\ub2e4\uba74 \ub180\ub77c\uc6b4 \uc5f4\ub9e4\ub97c \ub9bf\uc744 \uc218 \uc788\uc2b5\ub2c8\ub2e4. \uc774 \uc624\uc21c\uc808\uc758 \uc131\ub839\uc774 \uc624\ub298 \uc6b0\ub9ac \uad50\ud68c\uc640 \uac01 \uc131\ub3c4 \uc704\uc5d0 \ucda9\ub9cc\ud788 \uc784\ud558\uc2dc\uae30\ub97c \uac04\ucca0\ud788 \uc18c\ub9dd\ud569\ub2c8\ub2e4. \uc57d\uc18d\uc758 \uc131\ucde8\uc774\uc2e0 \uc131\ub839\ub2d8, \ub2a5\ub825\uc758 \uadfc\uc6d0\uc774\uc2e0 \uc131\ub839\ub2d8, \uc5f0\ud569\uc744 \uc774\ub8e8\uc2dc\ub294 \uc131\ub839\ub2d8\uaed8\uc11c \uc6b0\ub9ac\uc640 \uc601\uc6d0\ud788 \ud568\uaed8\ud558\uc2ed\ub2c8\ub2e4.',
  application: '[\uac1c\uc778 \uc801\uc6a9] \uccab\uc9f8, \ub9e4\uc77c \uc544\uce68 \uc131\ub839 \ucda9\ub9cc\uc744 \uad6c\ud558\ub294 \uae30\ub3c4\ub85c \ud558\ub8e8\ub97c \uc2dc\uc791\ud558\uc2ed\uc2dc\uc624. "\uc131\ub839\ub2d8, \uc624\ub298 \uc800\ub97c \ucc44\uc6cc\uc8fc\uc18c\uc11c"\ub77c\ub294 \uc9e7\uc740 \uae30\ub3c4\ub85c \ucda9\ubd84\ud569\ub2c8\ub2e4. \ub458\uc9f8, \ub450\ub824\uc6b4 \uc0c1\ud669 \uc55e\uc5d0\uc11c "\ub0b4 \uc548\uc5d0 \uacc4\uc2e0 \uc131\ub839\ub2d8\uc774 \ub098\uc640 \ud568\uaed8\ud558\uc2e0\ub2e4"\uace0 \uc120\ud3ec\ud558\uba70 \ub2f4\ub300\ud788 \ub098\uc544\uac00\uc2ed\uc2dc\uc624. \uc14b\uc9f8, \uc131\uacbd\uc744 \uc77d\uc744 \ub54c\ub9c8\ub2e4 \uc131\ub839\uaed8\uc11c \uae68\ub2ec\uc74c\uc744 \uc8fc\uc2dc\ub3c4\ub85d \uac04\uad6c\ud558\uc2ed\uc2dc\uc624.\\\\n\\\\n[\uacf5\ub3d9\uccb4 \uc801\uc6a9] \uccab\uc9f8, \uad50\ud68c \uacf5\ub3d9\uccb4\ub294 \uc131\ub839\uc758 \ud558\ub098 \ub418\uac8c \ud558\uc2ec\uc744 \ub530\ub77c \uc778\uc885\uacfc \uacc4\uce35\uacfc \uc138\ub300\ub97c \ucd08\uc6d4\ud55c \uc5f0\ud569\uc744 \uc774\ub8e8\ub3c4\ub85d \ud798\uc4f0\uc2ed\uc2dc\uc624. \ub458\uc9f8, \uc18c\uadf8\ub8f9 \ubaa8\uc784\uc5d0\uc11c \uc11c\ub85c\uc758 \uc740\uc0ac\ub97c \ubc1c\uacac\ud558\uace0 \uaca9\ub824\ud558\ub294 \uc2dc\uac04\uc744 \uac00\uc9c0\uc2ed\uc2dc\uc624. \uc14b\uc9f8, \uc131\ub839\uc758 \uc5ed\uc0ac\ub97c \uacbd\ud5d8\ud55c \uac04\uc99d\uc744 \ub098\ub204\ub294 \uc790\ub9ac\ub97c \ub9c8\ub828\ud558\uc5ec \uacf5\ub3d9\uccb4\uc758 \uc2e0\uc559\uc744 \uc131\uc7a5\uc2dc\ud0a4\uc2ed\uc2dc\uc624.',
  passage_text: '\uc624\uc21c\uc808 \ub0a0\uc774 \uc774\ubbf8 \uc774\ub974\ub9e4 \uadf8\ub4e4\uc774 \ub2e4 \uac19\uc774 \ud55c \uac73\uc5d0 \ubaa8\uc600\ub354\ub2c8 \ud640\uc5f0\ud788 \ud558\ub298\ub85c\ubd80\ud130 \uae09\ud558\uace0 \uac15\ud55c \ubc14\ub78c \uac19\uc740 \uc18c\ub9ac\uac00 \uc788\uc5b4 \uadf8\ub4e4\uc774 \uc559\uc740 \uc628 \uc9d1\uc5d0 \uac00\ub4dd\ud558\uba70 \ubd88\uc758 \ud61c \uac19\uc774 \uac08\ub77c\uc9c0\ub294 \uac83\uc774 \uadf8\ub4e4\uc5d0\uac8c \ub098\ud0c0\ub098 \uac01 \uc0ac\ub78c \uc704\uc5d0 \uc784\ud558\uc5ec \uc788\ub354\ub2c8 \uadf8\ub4e4\uc774 \ub2e4 \uc131\ub839\uc758 \ucda9\ub9cc\ud568\uc744 \ubc1b\uace0 \uc131\ub839\uc774 \ub9d0\ud558\uac8c \ud558\uc2ec\uc744 \ub530\ub77c \ub2e4\ub978 \uc5b8\uc5b4\ub4e4\ub85c \ub9d0\ud558\uae30\ub97c \uc2dc\uc791\ud558\ub2c8\ub77c (\uc0ac\ub3c4\ud589\uc804 2:1-4)',
}
const MOCK_GROUP_DISCUSSION = {
  title: '성령이 오셨다',
  passage: '사도행전 2:1~13',
  topic: '성령의 능력과 교회의 탄생',
  summary: '오순절 날, 예수님의 약속대로 성령님이 강림하셨습니다. 두려움에 떨던 제자들이 성령으로 충만해져 담대히 복음을 전하기 시작했습니다. 베드로의 설교를 통해 삼천 명이 회심하는 역사가 일어났고, 이것이 교회의 시작이 되었습니다. 성령은 오늘날 우리에게도 동일한 능력과 담대함을 주십니다.',
  directionPoints: [
    '성령 강림은 구약 요엘서 예언의 성취이며 교회 탄생의 시작이다',
    '성령은 두려움을 담대함으로 바꾸는 능력의 원천이다',
    '성령 안에서 언어와 문화의 장벽이 무너지고 하나 됨이 회복된다',
    '오늘날 우리도 동일한 성령의 능력으로 복음의 증인으로 살아가야 한다',
  ],
  teens: {
    goal: '청소년이 성령님의 도우심으로 두려움을 극복하고 담대해질 수 있음을 깨닫도록 한다',
    coreMessage: '하나님은 우리를 혼자 두지 않으시고 성령님을 보내주셨어요. 성령님이 함께하시면 우리도 두려움을 이기고 담대해질 수 있어요.',
    icebreakers: ['요즘 학교나 학원에서 가장 두려운 순간은 언제인가요?', '내가 가장 용기 내서 했던 일은 무엇인가요?'],
    observationQuestions: ['오순절 날 제자들에게 어떤 일이 일어났나요?', '성령을 받은 후 베드로의 모습은 어떻게 변했나요?'],
    interpretationQuestions: ['왜 하나님은 성령님을 보내주셨을까요?', '불의 혀같은 모양과 바람 같은 소리는 무엇을 의미할까요?'],
    applicationQuestions: ['내가 두려움을 느낄 때 성령님께 도움을 구해본 적이 있나요?', '이번 주에 성령님의 도움으로 용기 내서 해보고 싶은 일은 무엇인가요?', '친구 중에 힘들어하는 사람에게 이번 주에 어떻게 말씀의 위로를 전해줄 수 있을까요?'],
    prayerTopics: ['두려움을 극복하고 담대함을 주시도록', '학교에서 복음을 전할 용기를 주시도록', '성령님의 도우심을 날마다 경험하도록'],
  },
  twentiesThirties: {
    goal: '20~30대가 일상의 압박 속에서 성령의 능력으로 정체성을 회복하고 담대히 살아가도록 돕는다',
    coreMessage: '바쁜 일상과 사회적 압박 속에서도 성령님은 우리와 함께하십니다. 우리의 정체는 성령이 함께하는 하나님의 자녀입니다.',
    icebreakers: ['요즘 가장 나를 압박하는 것은 무엇인가요? (직장/진로/관계)', '내가 가장 결정하기 어려웠던 순간은 언제인가요?'],
    observationQuestions: ['제자들은 성령을 받기 전과 후에 어떻게 달라졌나요?', '각국에서 온 사람들이 각기 자기 언어로 복음을 들은 것은 어떤 의미가 있나요?'],
    interpretationQuestions: ['성령은 왜 다양한 언어로 말하게 하셨을까요? 이 사건이 우리에게 주는 메시지는 무엇인가요?', '바벨탑 사건과 오순절 사건은 어떻게 대조되나요?'],
    applicationQuestions: ['일터나 일상에서 성령의 인도하심을 경험한 적이 있나요?', '사회 속에서 신앙 정체성을 유지하기 위해 어떤 노력을 하고 있나요?', '이번 주에 성령의 능력으로 도전해보고 싶은 한 가지는 무엇인가요?'],
    prayerTopics: ['일과 신앙의 균형을 잡는 지혜를 주시도록', '관계 속에서 성령의 열매를 맺도록', '진로와 방향을 성령께 맡기고 인도받도록'],
  },
  forties: {
    goal: '40대가 중년의 책임감과 통제 불안 속에서도 성령의 능력을 의지하며 평안을 누리도록 한다',
    coreMessage: '모든 것을 통제하려는 욕심을 내려놓고 성령님께 맡길 때 진정한 평안이 찾아옵니다. 성령님은 우리의 연약함을 도우시는 분입니다.',
    icebreakers: ['요즘 내 삶에서 가장 통제하기 어려운 영역은 무엇인가요?', '자녀나 가족에게 신앙을 전수할 때 가장 어려운 점은 무엇인가요?'],
    observationQuestions: ['제자들은 마가의 다락방에서 무엇을 하며 기다렸나요?', '베드로의 변화를 보고 주변 사람들은 어떻게 반응했나요?'],
    interpretationQuestions: ['왜 하나님은 제자들이 기도하며 기다리게 하셨을까요?', '성령을 받은 제자들의 담대함은 어디서 나온 것일까요?'],
    applicationQuestions: ['내 힘으로 감당하기 어려운 영역을 성령님께 맡기고 있나요?', '가정과 교회에서 내 역할을 감당할 때 성령의 도우심을 구하고 있나요?', '중년의 위기 앞에서 성령님은 어떤 위로와 방향을 주시나요?'],
    prayerTopics: ['모든 염려와 통제욕을 내려놓고 맡기는 법을 배우도록', '자녀와 다음 세대에게 신앙을 바르게 전수하도록', '중년의 삶 속에서 성령의 인도하심을 날마다 경험하도록'],
  },
  fiftiesSixties: {
    goal: '50~60대가 인생의 경험을 통해 깨달은 신앙의 지혜를 나누고, 남은 삶의 방향을 성령 안에서 발견하도록 한다',
    coreMessage: '인생의 경험이 쌓일수록 성령의 인도하심이 얼마나 정확하신지 깨닫게 됩니다. 우리의 인생 이야기는 다음 세대에게 가장 귀한 신앙의 유산입니다.',
    icebreakers: ['지금까지 살아오면서 성령의 인도하심을 가장 뚜렷하게 느꼈던 순간은 언제인가요?', '만약 인생을 다시 산다면 무엇을 다르게 하고 싶나요?'],
    observationQuestions: ['오순절 사건은 구약의 어떤 예언과 연결되나요?', '성령을 받은 제자들의 공동체는 어떤 특징이 있었나요?'],
    interpretationQuestions: ['하나님은 왜 오순절이라는 특별한 때에 성령을 보내셨을까요?', '베드로의 변화를 통해 우리는 무엇을 배울 수 있나요?'],
    applicationQuestions: ['인생의 경험을 통해 깨달은 신앙의 지혜를 누구와 나누고 싶나요?', '남은 인생을 어떻게 성령의 인도하심을 따라 살아가고 싶나요?', '다음 세대에게 전해주고 싶은 신앙의 유산은 무엇인가요?'],
    prayerTopics: ['인생의 지혜를 다음 세대와 나누는 통로가 되도록', '은퇴 이후의 삶을 성령의 인도하심에 맡기도록', '연약함 속에서도 영적 풍요로움을 누리도록'],
  },
  seventiesPlus: {
    goal: '70대 이상이 평생의 신앙을 돌아보며 감사와 소망을 나누고, 믿음의 유산을 후손에게 전하도록 한다',
    coreMessage: '평생을 인도하신 성령님은 오늘도 함께하십니다. 우리의 연약함 속에서 더욱 선명하게 역사하시는 하나님의 은혜가 가장 귀한 유산입니다.',
    icebreakers: ['평생 신앙생활 중 가장 감사했던 순간은 언제인가요?', '손주들에게 해주고 싶은 신앙의 이야기가 있다면 무엇인가요?'],
    observationQuestions: ['제자들은 성령을 받기 전에 어떻게 준비했나요?', '베드로의 설교 후 사람들은 어떻게 반응했나요?'],
    interpretationQuestions: ['성령 강림으로 시작된 교회가 오늘날 우리 교회와 어떻게 이어져 있다고 생각하시나요?', '베드로처럼 우리도 후반기 삶에서 담대함을 어떻게 회복할 수 있을까요?'],
    applicationQuestions: ['평생 신앙생활 중 가장 큰 은혜였던 순간을 나눠주세요.', '후손들에게 꼭 전하고 싶은 신앙의 유산은 무엇인가요?', '연약함과 한계 속에서도 성령님이 주시는 평안과 기쁨을 어떻게 경험하고 계신가요?'],
    prayerTopics: ['남은 삶이 하나님 앞에 귀하게 쓰임 받도록', '후손들이 신앙을 이어가도록', '연약함 속에서도 영적 기쁨과 소망을 누리도록'],
  },
  closingQuestions: [
    '오늘 나눔을 통해 가장 마음에 와닿은 것은 무엇인가요?',
    '성령님의 도우심이 필요하다고 느끼는 나의 두려움은 무엇인가요?',
    '우리 교회와 소그룹이 성령 안에서 더 하나 되기 위해 무엇을 할 수 있을까요?',
    '이번 주에 꼭 실천해보고 싶은 한 가지는 무엇인가요?',
  ],
  representativePrayer: '사랑의 하나님, 오늘 말씀을 통해 성령님의 놀라운 역사를 다시 한번 깨닫게 하시니 감사합니다. 두려움 앞에 서 있는 우리에게 성령의 담대함을 부어주시고, 일상의 자리에서 복음의 증인으로 살아가게 하여 주옵소서. 우리 교회와 소그룹이 성령 안에서 진정한 하나 됨을 이루게 하시고, 다음 세대에게 믿음의 유산을 전하는 통로가 되게 하여 주옵소서. 예수님의 이름으로 기도합니다. 아멘.',
}

const MOCK_CARD_NEWS = {
  slides: [
    { title: '약속이 이루어지다', content: '오순절 날, 예수님의 약속대로 성령님이 강림하셨습니다. 두려움에 떨던 제자들이 담대한 증인으로 변화되는 놀라운 역사가 일어났습니다. 이것이 교회의 시작이었습니다. 우리도 오늘 이 약속 위에 서 있습니다.', imagePrompt: 'A peaceful upper room with soft golden light streaming through windows, gentle flames of fire hovering above people praying, warm and reverent atmosphere, oil painting style' },
    { title: '바람과 불의 성령', content: '홀연히 하늘로부터 급하고 강한 바람 같은 소리가 온 집에 가득했고, 불의 혀처럼 갈라지는 것이 제자들 위에 머물렀습니다. 바람은 보이지 않지만 능력을 증거하고, 불은 하나님의 임재와 정결을 상징합니다. 성령님은 오늘도 우리 가운데 이렇게 역사하십니다.', imagePrompt: 'Soft wind blowing through ancient windows into a room with gentle flames of fire hovering above people, warm golden light, people with peaceful expressions, reverent atmosphere' },
    { title: '각 나라 말로 듣는 복음', content: '각국에서 온 사람들이 자기 언어로 복음을 들었습니다. 바벨탑에서 흩어진 인류가 성령 안에서 다시 하나가 되는 역사가 일어났습니다. 하나님의 복음은 모든 민족을 위한 것이며, 언어와 문화의 장벽을 넘어 온 세상에 전해져야 합니다.', imagePrompt: 'Diverse group of people from different nations listening intently, each hearing in their own language, warm sunlight, expressions of wonder and joy, inclusive atmosphere' },
    { title: '담대히 선포하는 베드로', content: '두려워하던 베드로가 성령으로 충만하여 담대히 일어났습니다. 전에는 하녀의 말에도 예수를 부인했던 그가 이제 수천 명 앞에서 복음을 선포했습니다. 그날 베드로의 설교를 통해 삼천 명이 회심하는 역사가 일어났습니다. 성령은 우리를 두려움에서 용기로 변화시키십니다.', imagePrompt: 'A man standing and speaking with boldness to a large crowd, sunrise lighting his face, crowd listening attentively, inspirational and hopeful atmosphere' },
    { title: '성령의 열매와 기도의 공동체', content: '성령의 역사는 단순한 능력이 아니라 인격의 변화를 가져옵니다. 사랑과 희락, 화평과 인내는 성령이 우리 안에 거하실 때 맺히는 열매입니다. 제자들은 성령을 받기 전 마가의 다락방에 모여 기도에 전념했습니다. 기도는 성령 충만의 비결이며, 우리도 함께 모여 기도할 때 성령께서 새로운 역사를 이루십니다.', imagePrompt: 'A fruit tree with abundant fruits in a sunlit orchard, and early Christians gathered in a circle praying, candlelight illuminating their faces, warm golden hour light, peaceful atmosphere' },
    { title: '일상에서의 적용', content: '성령충만은 교회 안에서만 경험하는 것이 아닙니다. 가정에서, 직장에서, 일상의 모든 순간에 성령의 인도하심을 구하며 살아갈 때 우리의 삶 전체가 예배가 됩니다. 매일 아침 "성령님, 오늘 저를 채워주소서"라고 기도하며 하루를 시작해보세요.', imagePrompt: 'A person praying quietly at their desk by a window, morning sunlight streaming in, coffee cup beside them, peaceful and reflective moment' },
    { title: '교회의 사명', content: '성령으로 시작된 교회는 오늘도 동일한 사명을 가지고 있습니다. 복음을 전하고, 가난한 자를 돌보고, 정의를 세우는 일에 성령의 능력으로 나아가야 합니다. 우리 교회가 성령 안에서 하나 되어 이 사명을 감당할 때, 세상은 변화될 것입니다.', imagePrompt: 'A diverse church community serving together, helping people in need, bright daylight, sense of purpose and compassion, documentary style' },
    { title: '메시지 요약', content: '오순절 성령 강림은 단순한 역사적 사건이 아니라 오늘도 우리 가운데 살아 역사하는 하나님의 약속입니다. ① 성령님은 약속의 성취로 오셔서 우리에게 담대함을 주십니다. ② 성령님은 능력의 원천이 되어 두려움을 이겨 내게 하십니다. ③ 성령님은 모든 민족과 세대를 하나로 연합시키십니다. ④ 성령님은 우리를 진리 가운데 인도하시며 매일의 삶에서 동행하십니다. 이 네 가지 진리를 붙잡고 오늘도 성령 충만을 구하며 나아가십시오.', imagePrompt: 'Four candles burning brightly in a dimly lit room, warm golden light spreading outward, peaceful and reflective atmosphere' },
    { title: '오늘도 함께하시는 성령', content: '성령님은 오늘도 우리와 함께하십니다. 우리가 성령충만함을 구할 때, 교회는 다시 한번 부흥할 것입니다. "성령님, 오늘 저를 채워주소서"라고 기도하며 나아가세요. 두려움이 찾아올 때마다 "내 안에 계신 성령님이 나와 함께하신다"고 선포하십시오. #성령 #오순절 #교회부흥', imagePrompt: 'A modern church congregation worshipping together, hands raised in praise, warm morning light streaming through stained glass, hopeful and vibrant atmosphere' },
  ],
}

const MOCK_SERMON_SCRIPT = `사랑하는 성도 여러분, 오늘은 사도행전 2장에 기록된 오순절 성령 강림 사건을 함께 살펴보겠습니다.

여러분, 인생을 살아가면서 가장 두려운 순간이 언제였나요? 첫 직장 면접을 보러 갈 때였나요? 중요한 시험을 앞두고 있었을 때였나요? 아니면 사랑하는 가족의 건강에 위기가 찾아왔을 때였나요? 우리 모두 인생의 다양한 순간들에서 두려움을 경험합니다.

그런데 오늘 본문에 등장하는 제자들의 모습을 한번 보겠습니다. 예수님께서 승천하신 후, 그들은 마가의 다락방에 모여 있었습니다. 그들은 두려움에 떨고 있었습니다. 스승을 잃었고, 앞으로 어떻게 해야 할지 막막했습니다. 하지만 그들은 예수님의 말씀을 기억했습니다. "너희는 예루살렘을 떠나지 말고 아버지의 약속하신 것을 기다리라."

그리고 오순절 날, 역사적인 사건이 일어났습니다.

첫째로, 성령님은 약속의 성취로 오셨습니다. 예수님은 승천하시기 전 제자들에게 "너희는 몇 날이 못되어 성령으로 세례를 받으리라"고 약속하셨습니다. 그리고 오늘 본문에서 그 약속이 성취되었습니다. 이것은 우리에게 중요한 교훈을 줍니다. 하나님의 약속은 반드시 이루어집니다. 때로는 우리가 기다리는 시간이 길게 느껴질 수 있습니다. 제자들도 열흘 동안 기도하며 기다렸습니다. 그러나 하나님의 때가 차매, 약속은 반드시 성취되었습니다. 여러분, 지금 기다리고 계신 하나님의 약속이 있나요? 낙심하지 마십시오. 하나님의 때가 가장 좋은 때입니다.

둘째로, 성령님은 능력의 원천으로 오셨습니다. 성령이 임하시자 제자들에게 놀라운 변화가 일어났습니다. 특히 베드로의 변화는 극적이었습니다. 전에는 하녀의 말에도 두려워 예수를 부인했던 베드로가 이제는 수천 명이 모인 자리에서 담대히 일어나 설교하고 있습니다. 무엇이 그를 바꾸었을까요? 그것은 오직 성령의 능력이었습니다. 여러분, 우리도 마찬가지입니다. 우리 힘과 의지로는 두려움을 이기기 어렵습니다. 그러나 성령님께서 우리와 함께하실 때, 우리는 어떤 두려움도 이길 수 있는 담대함을 얻게 됩니다.

셋째로, 성령님은 연합을 이루십니다. 각국에서 온 유대인들이 각기 자기의 방언으로 복음을 듣고 놀라워했습니다. 이것은 바벨탑 사건의 역전입니다. 바벨탑에서 언어가 혼잡해져 인류가 흩어졌다면, 오순절에는 성령으로 말미암아 언어의 장벽이 무너지고 하나 됨이 회복되었습니다. 오늘날 우리 교회도 성령 안에서 하나 되어야 합니다. 연령, 배경, 출신이 달라도 우리는 한 성령 안에서 한 몸이 되었습니다.

그렇다면 이 말씀을 어떻게 우리 삶에 적용할 수 있을까요?

첫째, 매일 아침 성령의 충만함을 구하는 기도로 하루를 시작해보십시오. "성령님, 오늘 저를 채워주소서"라는 짧은 기도로도 충분합니다. 이 기도가 습관이 될 때, 여러분의 하루는 달라질 것입니다.

둘째, 두려움이 찾아올 때마다 "내 안에 계신 성령님이 나와 함께하신다"고 선포하십시오. 두려움은 성령의 능력 앞에 물러갑니다.

셋째, 교회 공동체 안에서 성령의 하나 되게 하시는 역사에 동참하십시오. 서로 다른 점에 집중하기보다, 우리를 하나 되게 하시는 성령님께 집중할 때 진정한 연합이 이루어집니다.

기도하겠습니다. "성령님, 오늘도 우리를 채워주소서. 우리의 두려움을 물리치시고, 담대히 복음을 전하게 하소서. 또한 우리 교회가 성령 안에서 진정한 하나 됨을 이루게 하여 주옵소서. 예수님의 이름으로 기도합니다. 아멘."`

const MOCK_SHORTS_SCRIPT = '여러분, 지금 내 안에 누군가 함께하고 있다면 어떨까요? 오순절 날, 두려움에 떨던 제자들에게 성령님이 임재하셨습니다. 그리고 그들은 완전히 다른 사람이 되었습니다. 두려워하던 베드로가 담대히 일어나 설교했고, 그날 삼천 명이 회심했습니다. 이것이 성령의 능력입니다. 우리 힘으로 두려움을 이기려고 하지 마세요. 성령님께 맡기면 변화의 역사가 시작됩니다. 지금, 성령님을 구하세요. 당신의 삶이 달라집니다.'

const MOCK_PPT = {
  slides: [
    { title: '성령이 오셨다', content: '• 사도행전 2장에 기록된 오순절 성령 강림 사건\n• 예수님의 승천 후 제자들이 마가의 다락방에 모이다\n• 오순절은 유월절로부터 50일 후, 맥추절이자 추수 감사절\n• 각국에서 흩어진 유대인들이 예루살렘에 모인 날\n• 하나님의 때가 차매 놀라운 역사가 시작되다\n• 이 사건은 교회 탄생의 시작을 알리는 중대한 전환점' },
    { title: '오늘의 말씀', content: '"오순절 날이 이미 이르매 그들이 다 같이 한 곳에 모였더니 홀연히 하늘로부터 급하고 강한 바람 같은 소리가 있어 그들이 앉은 온 집에 가득하며 불의 혀 같이 갈라지는 것이 그들에게 나타나 각 사람 위에 임하여 있더니 그들이 다 성령의 충만함을 받고 성령이 말하게 하심을 따라 다른 언어들로 말하기를 시작하니라" (사도행전 2:1-4)' },
    { title: '설교 개요', content: '• 약속의 성취로서의 성령 — 하나님은 약속을 반드시 이루신다\n• 능력의 원천으로서의 성령 — 두려움이 담대로 바뀌다\n• 연합을 이루시는 성령 — 바벨탑의 역전, 하나 됨의 회복\n• 오늘날 우리의 적용 — 성령충만이 삶을 바꾼다\n• 각 포인트는 성경적 근거와 함께 실제 삶에 적용\n• 이 말씀을 통해 성령의 실제적 역사를 경험하라' },
    { title: '오순절의 배경', content: '• 유월절로부터 50일째 되는 날, 추수 감사절\n• 구약의 맥추절(초실절)이 오순절로 불리게 됨\n• 예수님 승천 후 제자들은 마가의 다락방에 모여 기도\n• 약 백이십 명의 제자들이 한마음으로 기도에 전념\n• 각국에서 온 디아스포라 유대인들이 예루살렘에 방문\n• 하나님이 정하신 때가 차매 성령께서 임하셨다' },
    { title: '약속의 성취', content: '• 예수님께서 승천 전 제자들에게 약속하신 성령 (행 1:5, 1:8)\n• "너희는 몇 날이 못되어 성령으로 세례를 받으리라"\n• 열흘 간의 간절한 기도와 기다림의 시간\n• 하나님의 때는 인간의 때와 다르지만 반드시 온다\n• 구약 요엘서의 예언 (욜 2:28-32)이 오늘 성취되다\n• 베드로는 오순절 설교에서 이 예언 성취를 선포' },
    { title: '약속의 신실하심', content: '• 아브라함에게 주신 약속을 400년 만에 이루신 하나님\n• 다윗에게 약속하신 영원한 왕국을 예수로 성취하심\n• 예수님이 약속하신 성령을 오순절에 부어주심\n• 하나님은 반드시 약속을 지키시는 신실한 아버지\n• 우리 인생의 기다림도 하나님의 때에 열매를 맺는다\n• 지금 기다리는 약속이 있다면 낙심하지 말라' },
    { title: '두려움에서 담대로', content: '• 성령 임하시기 전 제자들은 두려움에 떨며 숨어 있었음\n• 베드로는 하녀의 말에도 예수를 부인할 만큼 연약했음\n• 그러나 성령이 임하시자 완전히 다른 사람이 되었음\n• 두려워하던 베드로가 수천 명 앞에서 담대히 설교\n• 이것이 성령의 능력 — 인간의 한계를 뛰어넘는 역사\n• 우리도 동일한 성령으로 두려움을 이길 수 있다' },
    { title: '성령의 능력', content: '• 성령은 단순한 감정이나 기운이 아니라 하나님의 능력\n• 베드로의 오순절 설교로 삼천 명이 회심하는 역사\n• "하나님이 가라사대 내가 내 영을 모든 육체에 부어 주리라"\n• 성령은 우리의 연약함을 채우고 능력을 더하신다\n• 내 힘으로가 아니라 성령의 능력으로 살아갈 때 승리\n• 날마다 성령 충만을 구하는 것이 능력의 비결' },
    { title: '바벨탑의 역전', content: '• 창세기 바벨탑에서 언어가 혼잡해져 인류가 흩어짐\n• 그러나 오순절에는 각국 언어로 복음을 듣는 역사\n• 언어와 문화의 장벽이 성령 안에서 무너지다\n• 인종, 민족, 계층을 초월한 하나님 나라의 연합\n• 바벨탑의 저주가 오순절의 축복으로 역전되다\n• 성령은 분열을 치유하고 하나 되게 하신다' },
    { title: '성령 안의 연합', content: '• "각국에서 온 유대인들이 각기 자기의 방언으로 듣고 놀라"\n• 갈대아인, 메대인, 엘람인 등 15개 지역의 사람들\n• 인종, 언어, 문화의 차이를 초월한 놀라운 연합\n• 예수 그리스도의 복음은 모든 민족을 위한 것\n• 교회는 각자의 차이를 넘어 하나 되는 공동체\n• 우리 교회도 성령 안에서 진정한 연합을 이루라' },
    { title: '오늘날의 성령', content: '• 오순절의 성령은 오늘날 우리와도 동일하게 함께하심\n• 성령충만의 비결: 날마다 간절히 구하는 것\n• 두려움이 찾아올 때 "성령님이 나와 함께하신다"고 선포\n• 교회 부흥의 비밀은 인간의 전략이 아닌 성령의 역사\n• 성령의 열매: 사랑, 희락, 화평, 오래 참음, 자비, 양선\n• 날마다 성령의 인도하심을 구하는 삶이 승리의 삶' },
    { title: '삶의 적용', content: '• 첫째, 매일 아침 5분씩 성령 충만을 구하는 기도로 시작하라\n• 둘째, 두려운 상황 앞에서 "성령님이 나와 함께하신다"고 선포하라\n• 셋째, 교회 공동체 안에서 성령의 하나 되게 하심에 동참하라\n• 넷째, 이번 주에 성령의 인도하심을 경험한 일을 나눠보라\n• 다섯째, 가족과 함께 성령의 열매를 주제로 기도하는 시간을 가져라\n• 여섯째, 복음을 전할 기회가 왔을 때 담대히 말할 용기를 구하라' },
    { title: '결단과 도전', content: '• "오직 성령이 너희에게 임하시면 너희가 권능을 받으리라" (행 1:8)\n• 더 이상 두려움에 떨며 숨지 않겠습니다\n• 성령의 능력으로 담대히 복음을 전하겠습니다\n• 교회의 연합을 위해 내 역할을 감당하겠습니다\n• 매일 성령 충만을 구하는 삶을 살겠습니다\n• 지금 이 순간, 성령님을 구하며 나아가십시오!' },
    { title: '함께 드리는 기도', content: '• "성령님, 오늘 저를 채워주소서\n• 두려움을 이기고 담대히 복음을 전하게 하소서\n• 우리 교회가 성령 안에서 참된 하나 됨을 이루게 하소서\n• 매일 성령의 인도하심을 따라 살아가는 지혜를 주소서\n• 이 땅에 하나님의 나라가 임하게 하소서\n• 예수님의 이름으로 기도합니다. 아멘."' },
  ],
}

export function getMockResult(): SermonResultData {
  return {
    summary: MOCK_SUMMARY,
    groupDiscussion: MOCK_GROUP_DISCUSSION,
    cardNews: MOCK_CARD_NEWS,
    sermonScript: MOCK_SERMON_SCRIPT,
    shortsScript: MOCK_SHORTS_SCRIPT,
    pptData: MOCK_PPT,

    sermon_title: '성령이 오셨다',
    sermon_passage: '사도행전 2:1~13',
  }
}
