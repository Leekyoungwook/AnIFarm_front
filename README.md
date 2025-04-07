# 농산물 가격 정보 웹 서비스 프론트엔드

농산물 가격 정보 및 예측, 커뮤니티 기능을 제공하는 웹 서비스의 프론트엔드 프로젝트입니다.

## 프로젝트 구조

```
front/
├── src/               # 소스 코드
│   ├── components/    # 리액트 컴포넌트
│   ├── pages/        # 페이지 컴포넌트
│   ├── api/          # API 통신
│   ├── hooks/        # 커스텀 훅
│   ├── store/        # 상태 관리
│   ├── types/        # TypeScript 타입 정의
│   └── utils/        # 유틸리티 함수
├── public/           # 정적 파일
├── chartdata/        # 차트 데이터
└── node_modules/     # 의존성 패키지
```

## 기술 스택

- React.js
- TypeScript
- Tailwind CSS
- Chart.js (데이터 시각화)
- Axios (HTTP 클라이언트)

## 주요 기능

### 1. 농산물 정보

- 도시별 날씨 정보 조회
- 농산물 질병 예측 (이미지 업로드)
- 작물 가격 예측 차트
- 위성 이미지 뷰어
- 실시간 농산물 가격 정보
- 시장 정보 조회

### 2. 사용자 관리

- 회원가입
- 로그인/로그아웃
- 사용자 프로필 관리

### 3. 커뮤니티

- 게시글 작성/조회/수정/삭제
- 댓글 작성/조회
- 카테고리별 게시판
  - 텃밭 정보
  - 농산물 마켓
  - 자유게시판

## 시작하기

### 사전 요구사항

- Node.js 14.0.0 이상
- npm 6.0.0 이상

### 설치 및 실행

1. 의존성 설치

```bash
npm install
```

2. 개발 서버 실행

```bash
npm start
```

서버는 기본적으로 http://localhost:3000 에서 실행됩니다.

## 사용 가능한 스크립트

### `npm start`

- 개발 모드로 앱을 실행합니다.
- http://localhost:3000 으로 접속 가능합니다.
- 코드 수정 시 자동 새로고침됩니다.

### `npm test`

- 테스트 러너를 실행합니다.

### `npm run build`

- 프로덕션용 앱을 `build` 폴더에 빌드합니다.
- 최적화된 프로덕션 빌드를 생성합니다.

## 환경 변수 설정

`.env` 파일을 생성하고 다음 내용을 설정하세요:

```
REACT_APP_API_URL=https://backend.jjiwon.site
REACT_APP_BACKEND_URL=https://backend.jjiwon.site
```

## 주요 컴포넌트

### 페이지

- `/` - 메인 페이지
- `/weather` - 날씨 정보
- `/disease` - 농산물 질병 이미지 분석
- `/price` - 가격 정보
- `/market` - 시장 정보
- `/community` - 커뮤니티

### 공통 컴포넌트

- `Header` - 네비게이션 바
- `Footer` - 푸터
- `Chart` - 차트 컴포넌트
- `ImageUploader` - 이미지 업로드
- `Loading` - 로딩 스피너
- `Error` - 에러 메시지

## 브라우저 지원

- Chrome (최신 버전)
- Firefox (최신 버전)
- Safari (최신 버전)
- Edge (최신 버전)

## 백엔드 연동

이 프로젝트는 FastAPI 백엔드 서버와 연동됩니다. 백엔드 서버 설정에 대한 자세한 내용은 `back/README.md`를 참조하세요.

## 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다.
