interface KakaoShareContent {
  title: string
  description: string
  imageUrl?: string
  link: {
    mobileWebUrl: string
    webUrl: string
  }
}

interface KakaoShareDefault {
  objectType: 'feed'
  content: KakaoShareContent
}

interface KakaoStatic {
  init: (key: string) => void
  isInitialized: () => boolean
  Share: {
    sendDefault: (params: KakaoShareDefault) => void
  }
}

declare const Kakao: KakaoStatic
