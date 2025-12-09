# 목차
- [프로젝트 개요](#프로젝트-개요)
- [프로젝트 목표](#프로젝트-목표)
- [주요 기술 스택](#주요-기술-스택)
- [기술 선정 이유](#기술-선정-이유)
- [아키텍처 구성도](#아키텍처-구성도)
- [프로젝트 구조](#프로젝트-구조-feature-sliced-design)
- [주요 구현 기능 및 문제 해결](#주요-구현-기능-및-문제-해결)
  - [요약](#요약)
  - [메인페이지 - ISR + CSR 하이브리드 렌더링](#메인페이지---isr--csr-하이브리드-렌더링)
  - [게시글 상세 페이지 - 태그 기반 온디맨드 캐싱](#게시글-상세-페이지---태그-기반-on-demand-캐싱)
  - [Nginx 기반 Blue-Green 배포](#nginx-기반-blue-green-배포를-통한-단일-vcpu-환경에서의-다운타임-최소화)
  - [에러 중앙화](#에러-중앙화---api-요청응답-구조-단일화-및-ux-일관성-확보)
  - [Tiptap 기반 에디터](#tiptap-기반-에디터-구현)
  - [북마크 기능](#북마크---낙관적-업데이트-기반-ui-반응성-개선)
  - [댓글 페이지네이션](#댓글---페이지네이션-기반-데이터-일관성-유지)
  - [SSE 기반 실시간 알림](#실시간-알림---sse-기반-안정적-스트림-유지)


# 프로젝트 개요

사용자 후기 기반의 리뷰 커뮤니티로 베스트 후기·실시간 후기·검색 등 다양한 방식으로 후기를 탐색할 수 있는 플랫폼입니다. 게시글 작성, 이미지 업로드, 북마크, 댓글, 실시간 알림 등 커뮤니티 서비스에 필요한 기능을 제공합니다.

[서비스 바로가기](https://modu-review.com)

# 프로젝트 목표

여러 플랫폼에 흩어진 후기 정보를 한 곳에서 쉽게 탐색할 수 있는 공간을 만드는 것이 프로젝트의 가장 큰 목표였습니다.

사용자가 작성한 리뷰가 더 많은 사람에게 도달하려면 검색을 통한 유입이 중요하다고 판단해,  
주요 페이지와 게시글 본문이 검색 엔진에 제대로 노출될 수 있는 구조를 갖추는 데 집중했습니다.

또한 **조회 => 반응(댓글/북마크) => 알림 => 재참여**로 이어지는 흐름이 끊기지 않도록 사용자가 자연스럽게 계속 참여할 수 있는 경험을 만드는 것도 중요한 목표였습니다.

# 주요 기술 스택

## 프레임워크 및 언어

- Next.js 15
- Typescript

## 상태 관리

- Tanstack Query (서버 상태 관리)
- Zustand (클라이언트 상태 관리)

## UI 및 스타일링

- Tailwind CSS
- Radix UI, shadcn/ui
- lucide-react

## 에디터

- Tiptap

## 모니터링

- Sentry

## 배포 및 운영

- AWS EC2 (Ubuntu)
- Nginx
- PM2
- Github Actions + CodeDeploy (CI/CD 파이프라인)

# 기술 선정 이유

## Next.js

커뮤니티 서비스는 검색 유입이 중요해 게시글 본문이 검색 엔진이 바로 읽을 수 있는 형태로 제공돼야 했습니다.

CSR은 초기 HTML이 비어 있어 크롤러가 내용을 제대로 가져가지 못하므로 서버에서 컨텐츠를 먼저 그려주는 Next.js의 서버 컴포넌트 기반 렌더링과 동적 메타데이터 기능이 더 적합하다고 판단했습니다.

또 초기 로딩 성능이 중요해 리액트 단독 환경처럼 모든 자바스크립트 코드를 먼저 받는 구조보다 서버에서 필요한 컨텐츠만 먼저 내려주는 방식이 유리했습니다. 여기에 ISR, SSG 같은 페이지 단위 캐싱 전략과 확장된 fetch의 캐싱 옵션까지 활용할 수 있다는 점을 고려해 Next.js를 선택했습니다.

## Tanstack Query

커뮤니티 특성상 사용자마다 결과가 달라지는 데이터가 많아 변동이 잦은 영역은 서버 캐싱보다 클라이언트 캐싱이 더 적합했습니다.

검색은 키워드, 정렬 옵션 조합이 다양하고 마이페이지(작성글/저장글), 댓글, 북마크처럼 인증 기반 데이터도 사용자마다 다른 값을 가지기 때문에 서버 측 캐싱 효율이 낮았습니다.

Next.js의 서버 캐시가 요청 컨텍스트 기반이라는 점을 고려하면 이런 데이터를 서버에 쌓을수록 메모리 부담이 커집니다. 그래서 변동이 많고 개인화된 데이터는 Tanstack Query로 관리하는 구조가 현실적이었습니다.

추가로 Suspense 기반의 선언적 데이터 패칭과 전역 에러 핸들링으로 UI 코드가 간결해졌고 무한 스크롤, 페이지네이션 같은 게시판 서비스의 핵심 기능도 제공해 요구사항에 잘 맞았습니다.

## Zustand

초기에 컴포넌트 외부의 순수 함수에서 전역 상태를 업데이트해야 하는 요구사항이 있었습니다. Context API는 훅 규칙 때문에 컴포넌트나 커스텀 훅 내부에서만 상태 변경이 가능해 이 요구사항을 해결할 수 없었습니다.

Zustand는 전역 스토어가 리액트와 분리된 순수 자바스크립트 객체로 구성되어 있어 컴포넌트 바깥에서도 상태를 직접 제어 가능했고, 초기에 필요한 요구사항을 해결해줬습니다.

프로젝트가 진행되면서 로그인, 알림, 에러 등 클라이언트 상태가 여러 영역으로 확장되었고 Context 기반으로 Provider를 계속 늘려가는 구조보다 각 상태를 독립된 스토어로 관리할 수 있는 Zustand 쪽이 더 단순하고 관리하기 편했습니다.

## AWS EC2

서비스를 실제로 운영한다는 관점에서 비용 구조가 예측 가능한지가 중요했습니다. Vercel은 자동 배포와 관리 편의성 면에서 뛰어나지만 Pro 플랜부터 Data Transfer 비용이 급격히 올라가는 구조였습니다.

서울 리전 기준으로 1TB 이후부터 1GB당 0.35달러가 과금되는데, 커뮤니티 서비스처럼 이미지 업로드, 조회, 검색 트래픽이 많은 구조에서는 비용 리스크가 커질 수 있었습니다.

같은 상황에서 AWS는 100GB까지 무료이고 이후 1GB당 0.126달러 수준으로 동일 트래픽에서 비용이 절반 이하로 떨어집니다. 트래픽이 장기적으로 증가할수록 이 차이는 더 크게 벌어집니다.

EC2는 고정 리소스 기반이라 서버 사양을 조정하지 않는 한 예측 불가능한 추가 비용이 발생하지 않는다는 점도 운영 관점에서 안정적이라고 판단했습니다.

# 아키텍처 구성도

<img width="1628" height="987" alt="modu-arc" align="center" src="https://github.com/user-attachments/assets/db020641-46e9-4b0b-aa78-9283c8a43223" />

사용자가 서비스에 접근해 페이지를 렌더링 받기까지의 흐름과 깃허브에서 AWS로 이어지는 CI/CD 파이프라인을 나타낸 구성도입니다.

- 브라우저에서 modu-review.com으로 접근하면 DNS가 EC2 인스턴스를 가리키고, Nginx가 실행 중인 Next.js 서버(3000/3001)로 트래픽을 프록시합니다.
- 깃허브에 코드의 변경이 감지되면 깃허브 액션에 의해 빌드 후 압축된 파일이 S3에 업르도됩니다. 이후 코드 디플로이가 해당 파일을 EC2로 가져와 새로운 버전을 배포합니다.

EC2 내부에서는 PM2에 의해 Next.js 프로세스가 관리되며, Blue-Green 방식으로 포트를 전환해 배포 시 자동 롤백과 다운타임을 최소화하고 있습니다.

# 프로젝트 구조 (Feature-Sliced Design)

이 프로젝트는 기능 확장과 유지보수성을 높이기 위해 Feature-Sliced Design(FSD)을 기반으로 디렉터리를 구성했습니다.

UI, 상호작용 로직, 도메인 데이터 모델을 분리해 각 기능이 독립적으로 확장될 수 있도록 설계했습니다.

- app: 전역 초기화(프로바이더, 레이아웃, 글로벌 에러 처리)
- views: 페이지 단위 화면 구성 (Next.js 라우팅 엔트리)
- widgets: 공통 UI 블록(Header, Footer, Pagination, Error UI)
- features: 사용자 상호작용 중심의 기능 단위(검색, 북마크, 댓글 등)
- entities: 도메인 데이터 모델, API, 캐싱 규칙, 재사용 UI(Card 등)
- shared: fetch 래퍼, 전역 상수, 유틸, 공통 UI 컴포넌트

레이어 간 의존성은 위에서 아래로만 허용해 결합도를 낮추고 각 기능은 해당 도메인 폴더 안에서 완전히 모여 있어 수정 및 탐색 비용을 크게 줄였습니다.

이 구조를 선택한 배경과 주요 의사결정 과정은 [블로그](https://gojimin.com/posts/fsd-2)에 자세히 정리했습니다.

# 주요 구현 기능 및 문제 해결

## 요약

### 메인 페이지 - ISR + CSR 하이브리드 렌더링 - [이동하기](#메인페이지---isr--csr-하이브리드-렌더링)

SSR 병목으로 p99 9.4초, 실패율 50%가 발생하던 환경에서 ISR로 서버 렌더링 비용을 제거하고 실시간 후기 영역은 CSR + dynamic import로 분리해 서버 자원 사용량 최적화.

- p99 9.4s => 45ms (약 200배 개선)
- 요청 실패율 50% => 0%

### 게시글 상세 페이지 - 태그 기반 On-Demand 캐싱 - [이동하기](#게시글-상세-페이지---태그-기반-on-demand-캐싱)

클라이언트에서 서버 캐시를 무효화가 불가능한 문제를 해결하기 위해 쓰기 요청을 Next.js 서버로 우회시키는 프록시 패턴 적용.

- MISS 172ms => HIT 59ms로 약 3배 개선

### Nginx 기반 Blue-Green 배포를 통한 단일 vCPU 환경에서의 다운타임 최소화 - [이동하기](#nginx-기반-blue-green-배포를-통한-단일-vcpu-환경에서의-다운타임-최소화)

PM2 graceful reload 불가 및 단일 vCPU 환경에서 발생한 배포 다운타임 문제를 포트 스위칭 기반 Blue-Green 배포로 해결.

- Health Check 기반 자동 롤백
- 릴리즈 폴더 및 심볼릭 링크 기반 전환
- 기존 프로세스 graceful shutdown
- 다운타임 4 ~ 5초 => 1 ~ 2초 (약 2배 이상 개선)
- 77회 배포 중 8회 실패했지 서비스 중단 0회 유지

### 에러 중앙화 - API 요청/응답 구조 단일화 및 UX 일관성 확보 - [이동하기](#에러-중앙화---api-요청응답-구조-단일화-및-ux-일관성-확보)

흩어져 있던 try/catch를 단일 request 함수로 모아 예외 처리를 중앙화하고, 리액트 쿼리 + 전역 스토어로 에러 흐름을 통합해 화면마다 다르던 에러 UI를 일관된 규칙(대체 UI/토스트)으로 제공

- 에러 응답 구조 변경 등 수정 범위를 단일 지점으로 중앙화해 유지보수 범위 축소
- GET 요청 실패는 대체 UI, 쓰기 요청 실패는 토스트 등 에러 UX 규칙을 명확하게 정리
- API가 늘어나도 에러 처리 비용이 증가하지 않는 구조 확보

### Tiptap 기반 에디터 구현 - [이동하기](#tiptap-기반-에디터-구현)

shouldRerenderOnTransaction 제어와 에디터 영역 분리로 불필요한 리렌더링 제거 및 NodeView 기반 이미지 업로드(진행률, 취소, 에러 처리) 구현.

### 북마크 - 낙관적 업데이트 기반 UI 반응성 개선 - [이동하기](#북마크---낙관적-업데이트-기반-ui-반응성-개선)

단일 뮤테이션 구조로 bookmark/unbookmark를 통합하고 전송 즉시 캐시를 업데이트하는 낙관적 업데이트 적용.

### 댓글 - 페이지네이션 기반 데이터 일관성 유지 - [이동하기](#댓글---페이지네이션-기반-데이터-일관성-유지)

댓글은 최신 댓글이 항상 마지막 페이지에만 존재하는 특성을 반영해
- 마지막 페이지일 때만 낙관적 업데이트
- 페이지 내 댓글이 가득 찬 경우 새 페이지 생성
- 성공 시 전체 페이지 캐시 무효화
- 실패 시 새 페이지 생성 여부에 따라 분기 롤백

### 실시간 알림 - SSE 기반 안정적 스트림 유지 - [이동하기](#실시간-알림---sse-기반-안정적-스트림-유지)

preflight 인증 체크 => 토큰 재발행 => 단일 SSE 연결 유지 => 이벤트 처리 흐름으로 설계해 댓글/북마크 알림을 전역 상태와 토스트/뱃지로 실시간 표시.

## 메인페이지 - ISR + CSR 하이브리드 렌더링

<div align="center">
  <img src="https://github.com/user-attachments/assets/672b1c24-be4f-4274-a91f-2a877bd0041a" width="800px" />
</div>

### 문제 상황

<div align="center">
  <img width="708" height="382" alt="ISR 전 부하테스트" src="https://github.com/user-attachments/assets/0491a085-1365-4c25-a968-5eda56d34bf8" />
</div>

메인페이지는 댓글, 북마크, 조회수를 집계해 선정된 베스트 후기를 노출하는 핵심 페이지로 검색 유입을 위해 SSR이 필수였습니다. 하지만 단일 vCPU 환경에서 SSR로 인한 병목 현상으로 여러 사용자가 동시에 접속하는 환경(60초간 초당 20명)에서 **응답 지연(p99 9.4s)** 과 **요청 실패(약 50%)** 가 발생했습니다.

백엔드 API 병목의 가능성도 고려했으나 next.js의 fetch 캐싱으로 베스트 후기 데이터를 캐싱한 상태에서도 p99 응답 속도가 7.1s로 측정되어 SSR 렌더링 과정 자체가 병목의 주요 원인임을 확인했습니다.

### 해결 방안 1 (메인 페이지 ISR 적용)

```tsx
export const revalidate = 3600;

export {MainPage as default} from '@/views/main';
```

검색 유입이 필수적이었기 때문에 서버 렌더링을 유지하면서 서버 부하를 최소화할 수 있는 ISR(Incremental Static Regeneration)을 적용했습니다.

백엔드 집계 주기(3시간)를 고려해 1시간 간격으로 HTML 파일을 서버에서 정적으로 재생성해 최초 생성 후 캐싱된 HTML만 전달해 서버가 렌더링을 반복하지 않도록 구성했습니다.

### 해결 방안 2 (실시간 후기 영역 CSR 적용)

```tsx
const RecentReviewsCarousel = dynamic(() => import('./RecentReviewsCarousel'), {
  ssr: false,
  loading: () => <RecentReviewsCarouselLoading />,
});

export default function RecentReviewsClient() {
  return (
    <section>
      <RQProvider LoadingFallback={<RecentReviewsCarouselLoading />}>
        <RecentReviewsCarousel />
      </RQProvider>
    </section>
  );
}
```

SEO 우선순위가 낮은 실시간 후기 영역은 정적 구조만 서버 컴포넌트로 유지하고, 캐러셀 및 데이터 패칭 영역은 클라이언트 컴포넌트로 분리했습니다.

`next/dynamic`을 사용해 해당 컴포넌트의 SSR을 명시적으로 비활성화해 초기 렌더링 시 서버가 처리해야 할 자바스크립트 코드의 양을 줄여 서버 자원을 베스트 후기 영역으로 집중했습니다.

### 성과

<div align="center">
  <img width="706" height="383" alt="ISR 후 부하테스트" src="https://github.com/user-attachments/assets/2e0f2b21-475d-4db3-9e96-d9f82effdce9" />
</div>

적용 후 동일한 조건의 부하테스트 결과 p99 응답 속도 9.4s => 45ms (약 200배 개선), 요청 실패율 50% => 0%로 1200개의 요청이 모두 성공했습니다.

이후 60초간 초당 50명의 부하테스트에서도 요청 실패율 0%, p99 응답 속도 74ms를 확인해 단일 vCPU 환경 내에서도 안정적인 트래픽 처리가 가능해졌습니다.

보다 자세한 의사 결정 과정과 구현 배경을 [블로그](https://gojimin.com/posts/next-cache#1-%EB%A9%94%EC%9D%B8%ED%8E%98%EC%9D%B4%EC%A7%80---isr--csr)에 정리했습니다.

## 게시글 상세 페이지 - 태그 기반 On-Demand 캐싱

게시글 상세 페이지는 작성자가 수정하거나 삭제하기 전까지 모든 사용자에게 동리한 컨텐츠를 제공하는 전형적인 읽기 중심의 페이지입니다.

이 특성상 Next.js의 On-Demand 캐싱(fetch 캐시 + tag 기반 무효화)을 적용하기에 매우 적합했습니다. 다만 구조적으로 클라이언트에서 서버 캐시를 무효화할 방법이 없다는 문제가 있었습니다.

### 배경 및 원인 분석

프로젝트의 모든 쓰기 요청은 리액트 쿼리의 useMutation으로 클라이언트에서 직접 백엔드로 호출하고 있었습니다. 하지만 Next.js의 서버 캐시 무효화를 위한 `revalidateTag()`는 서버 환경(Server Action 또는 Route Handler)에서만 실행 가능합니다.

따라서 클라이언트에서 게시글을 수정하거나 삭제해도 백엔드 데이터는 갱신되지만 Next.js 서버가 유지하고 있는 캐시는 무효화할 방법이 전혀 없는 상태였습니다.

결국 캐시 무효화는 서버에서만 가능하지만, 모든 쓰기 요청은 브라우저에서 발생하는 구조적 문제가 발생한 것입니다.

### 해결 방안 - 쓰기 요청을 Next.js 서버로 우회시키는 프록시 패턴 적용

이 문제를 해결하기 위해 쓰기 요청의 흐름 자체 재설계했습니다.

<div align="center">
  <img src="https://github.com/user-attachments/assets/5d36974f-db94-4edc-baf9-153e00603ca9" width="800px" />
</div>

1. 클라이언트는 `/api/reviews/[id]` (Next.js Route Handler)로 요청
2. Next.js 서버가 클라이언트 쿠키에서 인증 정보 추출
3. Next.js 서버 => 백엔드로 실제 요청 전송
4. 백엔드 성공 응답 수신 후 `revalidateTag('${review-[id]}')`를 호출해 캐시 무효화

이렇게 쓰기 요청은 Next.js 서버가 처리하고 읽기 요청은 캐시가 처리하는 구조로 완전히 흐름을 재설계했습니다.

### 구현 1 - 상세 페이지 fetch 시 태그 부여

```ts
const res = await fetch(url, {
  method: 'GET',
  next: {
    revalidate: false,
    tags: ['review-13'],
  },
});
```

최초 요청만 백엔드에서 데이터를 가져오며 태그가 무효화될 때까지 모든 요청은 캐싱 중인 데이터를 반환합니다.

### 구현 2 - Route Handler에서 프록시 및 tag 무효화

```ts

export async function DELETE(_: NextRequest, {params}: {params: Promise<{reviewId: string}>}) {
  // 인증 정보 추출, 예외 처리 및 실제 요청

  revalidateTag(`review-${reviewId}`); // 캐시 무효화
}
```

Next.js 서버는 브라우저가 전달한 인증 정보를 활용해 백엔드 요청을 수행하고 성공 시 Next.js 서버 자체가 캐시 무효화를 실행합니다.

클라이언트는 서버 캐시를 직접 건드릴 필요 없이 정상적인 쓰기 요청만 보내도 캐시는 자동으로 최신 상태를 유지하게 됩니다.

### 구현 3 - 클라이언트는 클라이언트 캐시만 관리

```tsx
const {mutate, ...rest} = useMutation({
  mutationFn: ({reviewId}: MutationVariables) => deleteReview(reviewId),
  onSuccess: (_data, {category}) => {
    const invalidateKeys = [...];

    invalidateKeys.forEach(key => {
      queryClient.invalidateQueries({queryKey: key});
    });

    router.push('/search');
  },
});
```

Next.js 서버가 서버 캐시를 책임지기 때문에 클라이언트는 기존처럼 클라이언트 캐시만 관리합니다.

### 성과 - 작은 쓰기 비용으로 읽기 성능을 크게 향상

쓰기 요청이 Next.js 서버를 한 번 더 거치기 때문에 네트워크 홉이 늘어나는 단점은 존재합니다.

하지만 서비스 특성상 읽기 요청이 압도적으로 많았고 실제로 On-Demand 캐싱 적용 후 측정 결과 체감 성능이 크게 향상되었습니다.
- 첫 요청(MISS): 172ms
- 캐시 HIT: 59ms
약 3배 가까운 속도 향상을 확인했습니다.

읽기 성능의 이점과 백엔드 부하 감소를 고려했을 때 쓰기 요청의 작은 비용은 충분히 합리적이었습니다.

보다 자세한 구현 과정은 [블로그](https://gojimin.com/posts/next-cache#2-%EA%B2%8C%EC%8B%9C%EA%B8%80-%EC%83%81%EC%84%B8%EB%B3%B4%EA%B8%B0-%ED%8E%98%EC%9D%B4%EC%A7%80---nextjs%EC%9D%98-on-demand-%EB%B0%A9%EC%8B%9D-%ED%99%9C%EC%9A%A9%ED%95%98%EA%B8%B0)에 정리했습니다.

## Nginx 기반 Blue-Green 배포를 통한 단일 vCPU 환경에서의 다운타임 최소화

프로젝트는 AWS EC2 t2.micro(단일 vCPU) 환경에서 운영되고 있었습니다.

이 환경에서는 PM2의 graceful reload나 클러스터 모드를 사용할 수 없고, Next.js 기본 실행 방식도 PM2의 ready 신호를 지원하지 않아 일반적인 reload 기반 무중단 배포가 구조적으로 불가능했습니다.

배포 시 기존 프로세스를 종료한 뒤 새 프로세스를 실행해야 했고, 이 과정에서 약 4~5초의 다운타임이 반복적으로 발생하는 문제가 발생했습니.

### 원인 분석

- 단일 vCPU: PM2 클러스터 모드는 CPU 코어 수만큼 워커를 실행하는 구조로 단일 코어에서는 프로세스 병렬 실행이 불가능해 기존 프로세스를 종료해야만 새 버전이 실행 가능했습니다.
- Next.js 서버 런타임 특성: Next.js는 PM2의 realod 신호를 지원하지 않아 graceful reload를 사용할 수 없었습니다.

### 해결방안 - 포트 스위칭 기반 Blue-Green 배포

이 문제를 해결하기 위해 Nginx + PM2 + 포트 스위칭 기반 Blue-Green 배포 구조를 직접 설계했습니다.

배포 전체 흐름은 다음과 같습니다.
1. 서버는 3000 / 3001 두 포트 중 하나를 서비스 포트로 사용합니다.
2. 새 버전은 현재 사용 중이지 않은 포트에서 실행합니다.
3. 정상적으로 작동되는게 확인되면 Nginx `proxy_pass`를 새 포트로 전환합니다.
4. 새 버전이 실패하면 자동으로 롤백합니다.
5. 전체 배포 파이프라인(Github Actions => S3 => CodeDeploy => EC2)은 자동화되어 있습니다.

### 구현 1 - 현재 서비스 포트 확인 및 다음 포트 결정

```
location / {
          include /etc/nginx/conf.d/service-url.inc;
          proxy_pass $service_url;
    }
```

Nginx는 `service-url.inc`에 정의된 포트를 사용합니다.

```bash
CURRENT_PORT=$(sed -n "s/^set \$service_url http:\/\/$SERVER_IP:\([0-9]*\);/\1/p" /etc/nginx/conf.d/service-url.inc)

if [ $CURRENT_PORT -eq 3000 ]; then
    NEW_PORT=3001
    OLD_NAME="next-blue"
    NEW_NAME="next-green"
else
    NEW_PORT=3000
    OLD_NAME="next-green"
    NEW_NAME="next-blue"
fi
```

현재 연결된 포트를 기준으로 새 버전이 뜰 포트를 결정합니다.

### 구현 2 - 릴리즈 폴더 교체 및 의존성 설치

```bash
mv $DEPLOY_PATH $RELEASE_PATH
mkdir $DEPLOY_PATH
ln -sfn $RELEASE_PATH $SYMLINK_PATH

pnpm install
```

배포 시간 기반 디렉터리로 버전 이력을 남기고 심볼릭 링크(current)를 새 릴리즈로 전환합니다.

### 구현 3 - PM2로 새 버전 실행

```bash
$PM2_PATH start "node_modules/next/dist/bin/next" --name $NEW_NAME --no-autorestart -- start --port $NEW_PORT
```

Blue / Green 두 프로세스를 번갈아 사용해 충돌을 방지합니다.

### 구현 4 - Health Check 기반 정상 상태 판별

```bash
HEALTH_CHECK_SUCCESS=false
SUCCESS_COUNT=0

for i in {1..20}; do
    status_code=$(curl -s -o /dev/null -w "%{http_code}" http://$SERVER_IP:$NEW_PORT)
    
    if [ "$status_code" -eq 200 ]; then
        SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
        
        if [ "$SUCCESS_COUNT" -eq 2 ]; then
            HEALTH_CHECK_SUCCESS=true
            break
        fi
    else
        SUCCESS_COUNT=0
    fi
    
    sleep 5
done
```

새 서버를 5초 간격으로 최대 20회 확인 후 HTTP 200을 연속 2회 받으면 정상으로 판단하고 실패 시 자동으로 롤백합니다.

```bash
if [ $HEALTH_CHECK_SUCCESS = false ]; then
    $PM2_PATH delete $NEW_NAME >> $LOG_FILE 2>&1
    ln -sfn $PREVIOUS_RELEASE $SYMLINK_PATH

    FAIL_LOG=$(sed -n '/필요한 의존성을 설치합니다/,$p' $LOG_FILE | sed 's/"/\\"/g')

    if [ -x "$SLACK_SCRIPT" ]; then
        $SLACK_SCRIPT "배포 실패 (Rollback)" "Health Check 실패로 롤백되었습니다.\n\n*상세 로그:*\n\`\`\`$FAIL_LOG\`\`\`\n<@>" "fail"
    fi
    exit 1
fi

```

실패 시 새 프로세스를 제거하고 이전 릴리즈로 즉시 복구합니다. 추가로 실패 로그를 슬랙으로 전송합니다.

### 구현 5 - 정상 작동 시 Nginx 프록시 전환

```bash
echo "set \$service_url http://$SERVER_IP:${NEW_PORT};" | sudo tee /etc/nginx/conf.d/service-url.inc
sudo nginx -s reload
```

service_url만 새 포트로 변경해 트래픽을 전환합니다.
- Nginx의 graceful reload는 워커 프로세스를 CPU 수만큼만 늘릴 수 있어 재시작시 1~2초의 짧은 다운타임이 발생합니다. 하지만 서비스 중단을 막는 데에는 충분히 안정적인 방식이라고 판단했습니다.

### 구현 6 - 기존 서버 graceful shutdown

```bash
$PM2_PATH sendSignal SIGINT $OLD_NAME
sleep 90
$PM2_PATH delete $OLD_NAME
```

Next.js는 SIGINT 신호를 받으면 내부적으로 server.close()를 호출해 처리 중인 요청을 완료한 뒤 종료해 완전한 graceful shutdown을 보장합니다.

따라서 SIGINT 신호를 보내 기존 프로세스를 강제 종료하지 않고 90초의 킬타임 대기 후 프로세스를 종료합니다.

### 성과 - 단일 vCPU 환경에서도 안정적 배포 구현

1. 다운타임을 4~5초 => 1~2초 수준으로 약 2배 이상 개선했습니다.
2. 새 버전 실패 시 자동으로 롤백합니다.
3. 실제 운영 환경에서 77회 배포 중 8회 배포가 실패했으나 서비스 중단 0회를 유지했습니다.

보다 자세한 구현 과정은 [블로그](https://gojimin.com/posts/zero-downtime-deployment)에 정리했습니다.

## 에러 중앙화 - API 요청/응답 구조 단일화 및 UX 일관성 확보

### 배경

프로젝트 초기에는 각 API 요청 함수마다 개별적으로 try/catch를 작성해 예외를 처리했습니다. 하지만 엔드포인트가 늘어날수록 몇 가지 문제가 눈에 띄었습니다.

1. 화면마다 에러 UX가 달라 일관성이 없었다.
   - 어떤 곳은 상태 기반, 어떤 곳은 토스트, 또 어떤 곳은 에러 바운더리를 사용해 동일한 종류의 에러도 화면마다 다르게 제공됐습니다.
2. 백엔드의 에러 응답이 변경될 때 유지보수 비용이 커졌다.
   - 에러 구조가 바뀌면 요청 함수를 돌아다니며 모든 예외 처리문을 수정해야 했습니다.

API가 늘어날수록 예외 처리 비용이 점점 증가했고 개발 효율과 에러 UX 모두에 영향을 끼치는 구조였습니다. 이 문제를 해결하기 위해 에러를 중앙에서 관리하는 구조가 필요하다고 판단했습니다.

### 구현 1 - 모든 API 요청을 단일 진입점 request()로 통합

```ts
export async function request(url, options) {
  const response = await fetch(url, {...options});

  if (!response.ok) {
    const errorInfo = await response.json()
    const {status} = response;

    if (options.method === 'GET') {
      throw new RequestGetError({status, ...errorInfo});
    }

    throw new RequestError({status, ...errorInfo});
  }

  return response.json()
}
```

request 함수는 백엔드와의 통신에서 유일한 진입점으로 다음을 담당합니다.
1. 요청 실행
2. 성공/실패 판단
3. 요청 성격에 따라 에러 객체 생성 및 throw

API 요청 함수들은 request 함수만 호출하면 되고 에러 해석과 분기는 모두 request 함수에서 담당합니다.

이 구조가 중요한 이유는
- 어디에서 에러가 발생해도 동일한 구조의 에러 객체가 전달되고
- UI 레벨에서 GET/POST/토큰 만료 등을 직접 분기하지 않아도 되며
- 에러 처리의 제어권을 호출부가 아닌 request 함수가 갖게 됩니다.

#### GET 요청의 에러 생성자를 분리한 이유

GET 요청 실패는 페이지를 구성할 수 없는 경우가 많기 때문에 핸들링 지점에서 instanceof 연산자만으로 에러 처리 방식(대체 UI, 토스트 등)을 명확히 구분할 수 있도록 별도의 에러 클래스를 적용했습니다.

### 구현 2 - 리액트 쿼리를 사용한 전역 에러 구독

리액트 쿼리는 QueryCache와 MutationCache를 통해 각 요청의 에러를 가로챌 수 있습니다.

```ts
// 전역 에러 스토어
const globalErrorStore = create(set => ({
  error: null,
  updateError: error => set({error}),
}));

// 쿼리 프로바이더
throwOnError: (error: Error) => error instanceof RequestGetError && error.errorHandlingType === 'errorBoundary',

queryCache: new QueryCache({
  onError(error) {
    if (error instanceof RequestGetError && error.errorHandlingType === 'errorBoundary') return;
    if (error instanceof RequestError) updateError(error); // 전역 스토어 업데이트 함수
  },
}),
mutationCache: new MutationCache({
  onError(error) {
    if (error instanceof RequestGetError && error.errorHandlingType === 'errorBoundary') return;
    if (error instanceof RequestError) updateError(error);
  },
}),
```

request 함수가 에러 객체의 성격을 분리해주기 때문에
- GET 요청이면서 대체 UI 핸들링 대상은 throwOnError로 상위로 전파하고
- 그 외 요청 에러는 전역 스토어에 저장해 공통 처리합니다.

### 구현 3 - 전역 스토어의 에러 구독 + 공통 에러 처리리

```tsx
export default function GlobalErrorDetector({children}: Props) {
  const globalError = useGlobalError();

  useEffect(() => {
    if (!globalError) return;

    if (예측가능한서버에러인지(globalError)) {
      toast.error({
        title: '에러가 발생했어요.',
        description: SERVER_ERROR_MESSAGE[globalError.name],
      });
    }

    throw globalError;
  }, [globalError, router]);

  return children;
}
```

이 컴포넌트는 전역 에러 스토어를 구독해
- 예측 가능한 에러는 토스트를 표시
- 예측 불가능한 에러는 상위로 전파해 글로벌 에러 바운더리에서 처리
라는 규칙을 적용합니다.

이런 흐름으로 모든 화면은 동일한 에러 처리 전략을 따르게 되고 페이지마다 따로 에러를 처리할 필요가 없어지게 됩니다.

### 결과

이 구조를 적용해 얻은 효과입니다.
1. 에러 처리 로직이 request 함수로 모여 중복 코드가 사라졌다.
   - 실제로 중간에 백엔드 에러 응답 구조가 바뀌었으나 request 함수만 수정해도 전역에 반영 가능해 유지보수 비용이 줄었습니다.
2. 에러 UX 제공에 일관된 규칙이 적용된다.
   - 읽기 요청(GET) 실패 => 대체 UI
   - 쓰기 요청(POST/PUT/DELETE) 실패 => 토스트
   - 예측 가능한 에러 => 토스트
   - 예측 불가능한 에러 => 대체 UI
   - 이렇게 API 호출 위치와 상관 없이 규칙에 따라 동일한 UX를 제공합니다.
4. API가 늘어나도 에러 처리 비용이 증가하지 않는다.
   - 개발자는 비즈니스 로직에만 집중하고, 에러 처리는 자동으로 중앙화된 규칙을 따릅니다.
  
보다 자세한 구현 과정은 [블로그](https://gojimin.com/posts/frontend-error-2)에 정리했습니다.

## 검색 페이지 - 무한 스크롤, 정렬 옵션, 페이지네이션

<div align="center">
  <img src="https://github.com/user-attachments/assets/9ccb4bd6-640c-4286-8348-7ab4c5a46043" width="800px" />
</div>

### 배경

검색은 크게 두 가지 다른 탐색 의도를 가진다고 생각합니다.

1. 카테고리 기반 탐색
- 특정 키워드 없이 전체 리스트를 훑어보는 흐름으로 끈김 없는 경험이 중요합니다.
2. 키워드 기반 탐색
- 사용자가 특정 키워드를 입력해 원하는 결과를 좁혀가는 흐름으로 현재 위치 유지와 정확한 탐색을 위한 제어가 중요합니다.

이렇게 두 탐색 방식은 UX 요구사항이 완전히 다르기 때문에 동일한 UI/UX로 처리하는 것이 부적절하다고 판단했습니다.

### 카테고리 기반 탐색 - 무한스크롤 적용

전체 데이터를 훑어보는 흐름에서 스크롤 기반 탐색이 가장 자연스럽기 때문에 리액트 쿼리에서 제공하는 `useInfiniteQuery`를 사용해 무한스크롤을 구현했습니다.

```tsx
const rawSort = searchParams.get('sort');
const sort = isSortKey(rawSort) ? rawSort : 'recent';

const handleChange = (value: SortKey) => {
  const queryString = new URLSearchParams({
    ...options,
    sort: value,
  });

  router.push(`?${queryString}`);
};
```

추가로 최신순, 댓글순, 북마크순 정렬 옵션을 제공하는데 새로고침 시 상태를 유지하기 위해 URL 기반으로 구현했습니다.

### 키워드 기반 검색 - 페이지네이션

키워드 검색은 특정 페이지를 다시 찾는 행동이 많아 페이지네이션이 더 적합하다고 판단했습니다.

```tsx
const currentPage = Number(searchParams.get('page')) || 1;
const { results, total_pages } = useKeywordReviews(keyword, currentPage, sort);
```

현재 페이지 또한 useState 기반 상태 관리 방식이 아닌 URL 기반으로 관리해 새로고침 시 같은 페이지가 유지되며, 공유된 URL에서도 동일한 상태를 재현할 수 있습니다.

```tsx
<Pagination
  currentPage={currentPage}
  totalPages={total_pages}
  generateUrl={(page) => 
    `/search/${keyword}?page=${page}&sort=${sort}`
  }
/>
```

페이지네이션의 경우 직접 구현한 컴포넌트를 사용하며, 재사용을 위해 generateUrl 함수로 URL 생성 책임을 분리했습니다.

## Tiptap 기반 에디터 구현

리뷰 작성을 위해 Tiptap 기반 에디터를 직접 구현했습니다. 서식 지원, 이미지 업로드, 미리보기, 수정 등 다양한 기능을 사용자에게 제공하며 아래는 구현 과정에서 해결한 주요 문제들입니다.

### 1. 입력 시 전체 컴포넌트가 리렌더링되던 문제

<div align="center">
  <img src="https://github.com/user-attachments/assets/85582e4e-38d2-4ab2-a0b3-ec3ef920c738" width="800px" />
</div>

#### 배경

Tiptap은 기본 설정상 모든 트랜잭션마다 전체 에디터가 리렌더링됩니다. 데스크탑의 경우 큰 문제가 되지 않았지만, 모바일 환경에서 타이핑 시 프레임이 급격히 떨어졌습니다.

#### 해결 방안 1

에디터는 입력 중인 컨텐츠 자체가 상태로 취급되기 때문에 에디터 영역을 4개의 독립 컴포넌트로 분리했습니다.

```tsx
<section>
  <EditorMetaForm onSubmit={handleSubmit} initialTitle={title} initialCategory={category} />
  <EditorContainer onMount={handleSetContentGetter} initialContent={content} />
  <EditorFooter onPreview={handleSetActionPreview} onSave={handleSetActionSave} isPending={isPending} />
  {openModal && preview && (
    <Modal onClose={handleModalClose}>
      <ViewerModal>
        <Viewer {...preview} />
      </ViewerModal>
    </Modal>
  )}
  {isPending && (
    <div>
      <LoadingSpinner text="리뷰를 저장하고 있어요." />
    </div>
  )}
</section>
```

- EditorMetaForm: 제목, 카테고리 입력을 위한 영역
- EditorContainer: 실제 에디터 영역
- EditorFooter: 저장, 미리보기 버튼 표시 영역
- ViewerModal: 미리보기 모달

이렇게 각 영역은 서로 다른 상태를 담당해 불필요한 리렌더링이 발생하지 않습니다.

#### 해결 방안 2

```ts
const editor = useEditor({
  shouldRerenderOnTransaction: false,
});
```

다음으로 모든 트랜잭션에 대한 리렌더링을 비활성화했으며

```ts
const editorState = useEditorState({
  editor,
  selector: snapshot => {
    const {editor} = snapshot;
    return {
      isHeading1: editor.isActive('heading', {level: 1}),
      isHeading2: editor.isActive('heading', {level: 2}),
    }
  }
})
```

에디터의 상태가 변경될 때 변경되는 시점의 스냅샷에서 현재 문단 혹은 커서에 적용된 마크업 상태(boolean)를 외부로 반환하는 `useEditorState`를 사용했습니다.

```ts
const headingOptions: ToolbarConfig[] = [
  {
    icon: 'Heading1',
    action: editor => editor.chain().focus().toggleHeading({level: 1}).run(),
    stateKey: 'isHeading1',
    text: '제목1',
  },
  // ...
];

// Toolbar.tsx
<ToolbarGroup>
  {headingOptions.map(({icon, action, stateKey, text}) => (
    <ToolbarButton {...} active={editorState[stateKey]} />
  ))}
</ToolbarGroup>
```

상태 추적을 위해 editorState를 각 서식별 추적용 키 값과 비교해 활성화 상태를 조회해 필요한 상태만 리렌더링했습니다.

#### 결과

<div align="center">
  <img src="https://github.com/user-attachments/assets/2a2de7f7-9fb2-488c-acfe-f15f02aea7da" width="800px" />
</div>

입력 시 불필요한 리렌더링이 발생하지 않고 초당 수십 번의 입력에도 성능 저하가 없는 에디터를 구현했습니다.

### 2. 기본 Image 노드의 한계로 업로드 상태 표시와 취소가 불가능한 문제

#### 배경

Tiptap의 기본 Image 기능은 업로드 진행률, 실패, 취소 등의 상태를 UI로 표현할 수 없었습니다. 추가로 이미지가 에디터 내에 즉시 삽입되기 때문에 보안을 위한 요구사항인 presigned URL 기반 업로드를 적용할 수 없었습니다.

#### 해결 방안 1 - NodeView 기반 커스텀 이미지 업로드 노드 구현

```tsx
const ImageUploadNode = Node.create<ImageUploadNodeOptions>({
  addOptions() {
    // ...
  },
});

const editor = useEditor({
    ImageUploadNode.configure({
      accept: 'image/*',
      maxSize: 5 * 1024 * 1024,
      upload: handleImageUpload,
      onError: updateError,
    }),
})
```

리액트 컴포넌트만으로는 문서 모델과 업로드 상태를 동기화할 수 없어 NodeView 기반 커스텀 이미지 업로드 노드를 구현했습니다.

업로드 중인 노드와 최종 이미지 노드가 모두 문서 트리에 존재하도록 구현해 사용자의 드래그&드롭과 타이핑에 대응했습니다.

#### 해결 방안 2 - presigned URL 기반 업로드 핸들러 주입입

보안 요구사항을 위해 업로드에 사용되는 업로드 핸들러 함수를 외부로부터 주입받도록 구현했습니다.

```ts
async function handleImageUpload(file, onProgress, abortSignal) {
  const {presignedUrl, uuid: imageId} = await getPresigned(fileType);
  const url = await uploadImage({file, fileType, presignedUrl, imageId, onProgress, abortSignal});

  return url;
}
```

전달되는 외부 업로드 핸들러 함수는 서버로 이미지 타입을 검증 받아 임시 URL을 발급 받고 S3에 직접 업로드한 뒤 최종 이미지 URL을 반환하는 함수입니다.

```ts
  editor.chain().focus()
  .deleteRange({from: pos, to: pos + 1})
  .insertContentAt(pos, [
    {
      type: 'image',
      attrs: {
        src: url,
        alt: fileName,
        title: fileName,
      },
    },
  ])
```

이미지 업로드 노드는 반환된 url을 사용해 에디터 내에 진행률 표시 노드를 제거하고 실제 이미지 노드를 삽입합니다.

#### 해결 방안 3 - 업로드 취소(AbortController) 지원원

```ts
if (abortSignal) {
  abortSignal.addEventListener('abort', () => {
    xhr.abort();
    reject(createClientError('UPLOAD_CANCELLED'));
  });
}
```

사용자가 취소 버튼을 누르면 AbortController 신호를 통해 업로드가 즉시 중단됩니다.

#### 해결 방안 4 - 업로드 진행률 표시(XHR)

```ts
xhr.upload.onprogress = event => {
  if (event.lengthComputable) {
    const progress = Math.round((event.loaded / event.total) * 100);
    onProgress({progress});
  }
};
```

fetch API로는 진행률 추적이 불가능해 S3 업로드에 XHR 객체를 사용했습니다. xhr.upload.onprogress 이벤트를 활용해 업로드 상태를 업데이트하며 진행률은 NodeView UI에서 막대 형태로 표시합니다.

#### 해결 방안 5 - 예외 처리 통합을 위한 에러 핸들러 주입

이미지 업로드 간 발생하는 에러 핸들링을 프로젝트의 에러 처리 흐름에 통합하기 위해 에러 핸들러 함수도 외부로부터 주입 가능하게 구현했습니다.

```ts
catch (error) {
  if (abortController.signal.aborted) {
    return null;
  }

  if (error instanceof ClientError || error instanceof RequestError) {
    options.onError?.(error);
  } else {
    options.onError?.(createClientError('UPLOAD_FAILED'));
  }

  return null;
}
```

외부로부터 주입받은 에러 핸들러 함수는 이미지 업로드 중 에러가 발생할 경우 예외 처리에 사용됩니다.

#### 결과

<div align="center">

| 문서 모델 동기화로 드래그&드롭 및 타이핑 대응 |
| -- |
| <img src="https://github.com/user-attachments/assets/56e06735-d8ac-4317-9a77-52ca00cccbc7" width="800px" /> |

| 업로드 진행률 표시 및 취소 지원 |
| -- |
| <img src="https://github.com/user-attachments/assets/f908bca9-6160-43c0-8269-ad26a626a991" width="800px" /> |

| 예외 처리 통합 및 에러 UI 표시 |
| -- |
| <img src="https://github.com/user-attachments/assets/bde542d4-3e3e-43a5-b127-ad27f1aa7ef7" width="800px" /> |

</div>

### 3. 작성 및 수정 기능을 하나의 에디터를 재사용해야 하는 문제

#### 배경

작성 페이지와 수정 페이지 모두 동일한 UI를 사용해야 하지만 처리 로직(API, 초기값 주입)이 완전히 달라져 결합도가 높아질 위험이 있었습니다.

#### 해결 방안

```tsx
type Props = {
  onSave: (data: ReviewPayload) => void;
  isPending: boolean;
} & EditorInitialData;

export default function Editor({title, category, content, onSave, isPending}: Props) {
  ...
}
```

에디터 컴포넌트의 저장 버튼 클릭 시 실행되는 `onSave` 콜백과 초기값을 외부로부터 주입받을 수 있는 구조로 개선했습니다. 

```tsx
export default function 작성페이지() {
  const {postReview, isPending} = usePostReview();

  return (
    <Editor
      isPending={isPending}
      onSave={data => postReview(data)}
    />
  );
}

export default function 수정페이지({data, reviewId}: Props) {
  const {patchReview, isPending} = usePatchReview();

  return (
    <Editor
      title={data.title}
      category={data.category}
      content={data.content}
      onSave={updated => patchReview({data: updated, reviewId})}
      isPending={isPending}
    />
  );
}
```

사용하는 위치에서 각각 다른 함수(postReview, patchReview)를 전달해 에디터는 저장한다는 사실만 알고 정확히 어디로, 어떻게 저장되는지는 전혀 모르는 분리 구조로 설계했습니다.

수정 페이지의 경우 초기값을 함께 전달해 에디터 컴포넌트 내에서 각각 메타 데이터 영역과 에디터 영역으로 전달해 사용합니다.

#### 결과

<div align="center">
  <img src="https://github.com/user-attachments/assets/ada42ccf-902b-46e1-9e91-a2dcb9764ca7" width="800px" />
</div>

UI는 완전히 동일하게 유지되면서 저장 방식, API 호출, 초기값 등 로직은 모두 외부에서 제어 가능해졌습니다.

### 4. 작성자 본인만 리뷰 수정이 가능하도록 검증

#### 배경 및 해결 방안

게시글 수정은 작성자 본인만 가능해야 하는데, 클라이언트에서 HttpOnly 쿠키를 읽을 수 없으며 단순 클라이언트 상태 검증만으로는 보안이 불충분했습니다.

```tsx
export default async function getSessionUserNickname() {
  const cookieStore = await cookies();
  return cookieStore.get('userNickname')?.value ?? null;
}

export default async function 수정페이지({reviewId, sessionUserNickname}: Props) {
  const data = await getReviewDetail(reviewId);

  if (!data) notFound();
  if (data.author_nickname !== sessionUserNickname) {
    throw new Error('작성자만 리뷰를 수정할 수 있습니다.');
  }

  return <EditReviewClient data={data} reviewId={reviewId} />;
}

export default async function 상세보기페이지({params}: Props) {
  // ...

  const sessionUserNickname = await getSessionUserNickname();
  const isAuthor = sessionUserNickname === author_nickname;

  return (
    <section>
      {isAuthor && (
        <div>
          <Link href={`/reviews/${reviewId}/edit`}>
            수정
          </Link>
          <DeleteButton category={category} reviewId={parsedReviewId} />
        </div>
      )}
     // ...
   </section>
  )
}
```

Next.js 서버 컴포넌트에서 상세 데이터의 닉네임과 쿠키 닉네임을 비교해 1차 검증을 수행하며 클라이언트는 단순히 결과만 받아 UI를 표시합니다. 이후 실제 API 요청 시 백엔드에서 2차 검증을 통해 재확인합니다.

### 5. 기본적인 서식 지원 및 툴바 구성

<div align="center">
  <img src="https://github.com/user-attachments/assets/9929a0ea-ce2b-46b7-aa1a-809ea65fc4bc" width="800px" />
</div>

일반적인 글쓰기에 사용 가능한 모든 서식들과 이미지 업로드 등을 지원하며 각 툴바의 버튼은 툴팁을 표시합니다. 툴바는 기능을 종류별로 그룹화해 구성했습니다.

- headings (h1, h2, h3)
- marks (bole, italic, strike)
- structure (blockquote, bullet list, ordered list)
- align (left, center, right)
- media (image, link)

```ts
const headingOptions: ToolbarConfig[] = [
  {
    icon: 'Heading1',
    action: editor => editor.chain().focus().toggleHeading({level: 1}).run(),
    stateKey: 'isHeading1',
    text: '제목1',
  },
  ...
];

const markOptions: ToolbarConfig[] = [
  ...
];

const structureOptions: ToolbarConfig[] = [
  ...
];

const alignOptions: ToolbarConfig[] = [
  ...
];
```

각 옵션은 상수 파일 내에 그룹화해서 관리하며, 이런 구조 덕분에 새로운 서식을 추가할 때 옵션 배열에 한 줄만 추가하는 것으로 툴바에 반영이 가능합니다.

보다 자세한 구현 과정은 블로그에 [시리즈1](https://gojimin.com/posts/tiptap), [시리즈2](https://gojimin.com/posts/tiptap-2)로 정리했습니다.

## 북마크 - 낙관적 업데이트 기반 UI 반응성 개선

<div align="center">
  <img src="https://github.com/user-attachments/assets/c53b512e-eac2-4724-aeb5-9f9b9092e5ba" width="800px" />
</div>

북마크는 클릭 직후의 피드백이 중요하기 때문에 서버 응답 전 UI를 먼저 갱신하는 낙관적 업데이트를 적용했으며, 요청 실패 시 UX를 해치지 않도록 즉시 롤백 가능하게 구현했습니다.

### 1. 현재 북마크 상태 기반 토글

```ts
const {mutate, ...rest} = useMutation({
  mutationFn: ({reviewId, hasBookmarked}) => {
    if (hasBookmarked) {
      return unBookmarkReview({reviewId});
    } else {
      return bookmarkReview({reviewId});
    }
  },
});

const toggleBookmark = (payload: BookmarkPayload) => {
  const currentData = queryClient.getQueryData(...);
  const hasBookmarked = currentData ? currentData.hasBookmarked : false;

  mutate({...payload, hasBookmarked,});
};
```

뮤테이션은 bookmark/unbookmark를 하나의 훅으로 통합하고 현재 캐시에서 hasBookmarked 값을 읽어 반대 상태로 전송하는 구조입니다. (onMutate가 mutationFn보다 먼저 실행되기 때문에 이 동작이 필요합니다.)

### 2. 낙관적 업데이트

```ts
onMutate: async ({reviewId}) => {
  await queryClient.cancelQueries({queryKey: reviewQueryKeys.bookmarks(reviewId)});

  const previous = queryClient.getQueryData<ReviewBookmarks>(
    reviewQueryKeys.bookmarks(reviewId)
  );

  if (previous) {
    const updated: ReviewBookmarks = {
      bookmarks: previous.bookmarks + (previous.hasBookmarked ? -1 : 1),
      hasBookmarked: !previous.hasBookmarked,
    };

    queryClient.setQueryData(reviewQueryKeys.bookmarks(reviewId), updated);
  }

  return {previousBookmarks: previous};
},
```

요청 전 캐시를 즉시 업데이트해 북마크 수와 상태가 먼저 UI에 반영되도록 처리합니다.

### 실패 시 롤백

```ts
onError: (_, {reviewId}, context) => {
  if (context) {
    queryClient.setQueryData(
      reviewQueryKeys.bookmarks(reviewId), 
      context.previousBookmarks
    );
  }
};
```

서버 요청이 실패하면 `onMutate`가 반환한 이전 상태로 되돌립니다.

### 4. 성공 시 관련 캐시 무효화

북마크는 단일 데이터가 아닌 여러 화면에 영향을 미치는 요소입니다.
- 상세 페이지의 북마크 상태
- 마이페이지의 '저장한 게시글' 목록

```ts
onSuccess: (_, {reviewId}) => {
  const invalidateKeys = [
    reviewsQueryKeys.myBookmarks.all(),
    reviewQueryKeys.bookmarks(reviewId)
  ];

  invalidateKeys.forEach(key => {
    queryClient.invalidateQueries({queryKey: key});
  });
},
```

따라서 성공 시 두 캐시를 모두 무효화합니다.

## 댓글 - 페이지네이션 기반 데이터 일관성 유지

<div align="center">
  <img src="https://github.com/user-attachments/assets/e008933f-8c62-492a-8965-20bef97815a4" width="800px" />
</div>

댓글은 페이지네이션으로 제공되기 때문에 단순히 “목록에 댓글 하나 추가”로 처리하기 어려웠습니다. 신규 댓글은 항상 마지막 페이지에 들어가지만 사용자는 중간 페이지를 보고 있을 수도 있기 때문입니다.

또한 삭제 시에는 페이지가 한 칸씩 당겨지는 구조라 특정 페이지만 업데이트하면 데이터가 꼬일 위험이 있었습니다. 이 특성 때문에 댓글 기능은 일반적인 낙관적 업데이트보다 고려해야 할 분기 상황이 훨씬 많았습니다.

### 1. 최신 댓글은 마지막 페이지에만 존재한다는 규칙

댓글은 서버에서 다음과 같이 정렬됩니다.
- 페이지 1 => 오래된 댓글
- 페이지 N => 최신 댓글

따라서 새 댓글은 항상 마지막 페이지에 추가됩니다. 하지만 사용자가 보고 있는 페이지는 1, 2, 3... N 등 경우의 수가 많아 낙관적 업데이트는 사용자가 마지막 페이지를 보고 있을 때만 적용하도록 제한했습니다.

```ts
onMutate: async ({userNickname, reviewId, content}) => {
  const previousComments = queryClient.getQueryData(...);

  if (!previousComments || page !== previousComments.total_pages) {
    return {previousComments, wasNewPageCreated: false};
  }

  // ...
},
```

마지막 페이지를 보고 있을 때만 낙관적 업데이트를 적용하도록 구현했습니다.

### 2. 마지막 페이지일일 때만 낙관적 업데이트 적용

```ts
onMutate: async ({userNickname, reviewId, content}) => {
  // ...
  const newComment = {...};
  const wasNewPageCreated = previousComments.comments.length === 8;

  if (wasNewPageCreated) {
    const updatedComments = {...};

    queryClient.setQueryData(reviewQueryKeys.comments.page(reviewId, page + 1), updatedComments);
    router.push(`?page=${page + 1}`, {scroll: false});
  } else {
    await queryClient.cancelQueries(...);

    const updatedComments = {...};
    queryClient.setQueryData(reviewQueryKeys.comments.page(reviewId, page), updatedComments);
  }

  return {previousComments, wasNewPageCreated};
},
```

마지막 페이지가 꽉 차 있지 않다면 해당 페이지 뒤에 바로 삽입합니다.

반대로 이미 댓글이 가득 찬 경우에는 새로운 페이지가 생성될 수 있어 `(page + 1)`을 캐시키로 사용해 임시 페이지를 만들고, UI도 해당 페이지로 이동시킵니다

### 3. 요청 성공 시 모든 페이지 캐시 무효화

댓글은 앞 페이지에서 삭제된 경우 뒤 페이지의 댓글이 당겨지는 변화가 자주 발생합니다. 그래서 특정 페이지 캐시만 무효화하면 데이터 일관성이 무너집니다.

```ts
onSuccess: (_, {reviewId}) => {
  queryClient.invalidateQueries({
    queryKey: reviewQueryKeys.comments.all(reviewId),
  });
};
```

요청 성공 시 댓글 캐시 전체를 무효화해 현재 서버 상태로 다시 정렬합니다.

### 4. 요청 실패 시 상황에 따라 롤백 분기

댓글 실패 롤백은 북마크보다 복잡합니다. 이유는 위에서 구현한 '새 페이지가 생겼는가?' 여부에 따라 대응 방식이 달라지기 때문입니다.

```ts
onError: (_, {reviewId, page}, context) => {
  if (!context) return;

  const { previousComments, wasNewPageCreated } = context;

  if (wasNewPageCreated) {
    queryClient.removeQueries({
      queryKey: reviewQueryKeys.comments.page(reviewId, page + 1),
    });

    router.push(`?page=${page}`, { scroll: false });
  } else {
    queryClient.setQueryData(
      reviewQueryKeys.comments.page(reviewId, page),
      previousComments
    );
  }
};
```

이렇게 새로 생긴 페이지 여부를 기준으로 롤백을 처리해 댓글 목록의 페이지 구조가 꼬이지 않도록 안정적으로 복구합니다.

## 실시간 알림 - SSE 기반 안정적 스트림 유지

<div align="center">
  <img src="https://github.com/user-attachments/assets/5ffc78ee-6bee-4609-9c27-63014e35526a" width="800px" />
</div>

댓글과 북마크가 내 글에 달리면 사용자는 '반응'을 기대합니다. 이 기능을 위해 WebSocket 대신 Server-Sent Events(SSE)를 선택해 서버 => 클라이언트 단방향 스트림을 유지하도록 구현했습니다.

알림처럼 단순 푸시 구조에선 클라이언트가 서버로 이벤트를 전송할 필요가 없어 SSE가 더 적합했습니다.

구현 흐름은 아래와 같습니다.
- 연결 전 preflight 요청으로 인증 상태 확인
- 필요 시 액세스 토큰 자동 재발행
- SSE 연결 후 meta, notification 이벤트 수신
- 전역 알림 상태 업데이트
- 토스트 컴포넌트로 표시 및 알림 뱃지 표시

### 1. 안정적인 SSE 연결을 위한 사전 검증 및 단일 연결 유지 전략

SSE는 연결 실패 시 에러 정보를 이벤트로만 확인이 가능해 인증 오류 등 필요한 정보를 조회할 수 없었습니다. 따라서 연결 안정성을 위해 EventSource를 열기 전 아래 과정을 반드시 거치도록 구현했습니다.

1. preflight API로 현재 인증 상태 확인
2. 401일 경우 액세스 토큰 갱신
3. 정상 인증이 확보된 이후에만 SSE 연결
4. useRef 기반으로 단일 연결만 유지
5. 컴포넌트 언마운트 시 명시적으로 연결을 닫은 후 객체 삭제

```ts
const connectSSE = useCallback(async () => {
  if (eventSourceRef.current) return; // 중복 연결 방지

  try {
    const preflightResponse = await preflightNotifications();

    // 정상 인증
    if (preflightResponse.ok) {
      initializeEventSource();
      return;
    }

    // 인증 만료 시 토큰 재발행
    if (preflightResponse.status === 401) {
      const tokenRefreshResponse = await tokenRefresh();

      if (tokenRefreshResponse.ok) {
        initializeEventSource();
        return;
      }

      throw new RequestError({...});
    }

    // 그 외 에러 처리
    const errorInfo = await preflightResponse.json();
    throw new RequestError({...});
  } catch (error) {
    if (error instanceof RequestError) {
      updateGlobalError(error);
      return;
    }

    throw error;
  }
}, [initializeEventSource, updateGlobalError]);
```

이렇게 토큰 만료 대비, 에러 종류에 따른 분기, 중복 연결 방지로 전체 앱에서 한 번만 실행되는 고정된 스트림을 유지했습니다.

### 2. EventSource 초기화 및 이벤트 바인딩

```ts
const initializeEventSource = useCallback(() => {
  const newEventSource = new EventSource(`${process.env.NEXT_PUBLIC_API_URL}/notifications/stream`, {
    withCredentials: true,
  });

  newEventSource.addEventListener('meta', event => {
    const data: MetaEvent = JSON.parse(event.data);

    onMeta(data);
  });

  newEventSource.addEventListener('notification', event => {
    const data: NotificationEvent = JSON.parse(event.data);

    onNotification(data);
  });

  eventSourceRef.current = newEventSource;
}, [onMeta, onNotification]);
```

해당 함수에서 실제 스트림을 어떻게 읽는가에만 집중합니다.
- withCredentials를 true로 설정해 인증에 사용되는 쿠키를 연결 시 전송합니다.
- meta 이벤트는 연결 초기에 unread 여부를 전달하는 이벤트로 외부에서 전달된 핸들러 함수에 데이터를 전달합니다.
- notification 이벤트는 댓글, 북마크 생성 시 발생하는 실시간 이벤트로 외부에서 전달된 핸들러 함수에 데이터를 전달합니다.

```ts
useEffect(() => {
  if (isLoggedIn) {
    connectSSE();
  }

  return () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
  };
}, [isLoggedIn, connectSSE]);
```

- eventSourceRef에 만들어진 newEventSource를 할당해 중복 생성을 방지하고 cleanup 대상으로 사용합니다.

### 3. NotificationProvider을 이용한 전역 알림 상태 관리

SSE 스트림에서 전달되는 meta, notification 이벤트를 앱이 사용 가능한 전역 상태로 변환하는 계층입니다. 앱 전체를 한 번만 감싸면 모든 페이지에서 동일한 알림 UX가 유지됩니다.

```ts
export default function NotificationProvider({children}: Props) {
  const setHasNotification = useSetHasNotifications();

  const handleMeta = useCallback(
    (data: MetaEvent) => {
      setHasNotification(data.hasNotification);
    },
    [setHasNotification],
  );

  const handleNotification = useCallback(
    (data: NotificationEvent) => {
      setHasNotification(true);
      toast.notification({
        title: data.title,
        type: data.type,
        board_id: data.board_id,
      });
    },
    [setHasNotification],
  );

  useConnectSSE({
    onMeta: handleMeta,
    onNotification: handleNotification,
  });

  return children;
}
```

- meta 이벤트는 연결 직후 unread 여부를 전달합니다.
- notification 이벤트는 댓글, 북마크 발생 시 호출됩니다.
두 이벤트 모두 전역 스토어의 알림 여부(hasNotification) 값을 갱신하며 댓글, 북마크는 알림 발생 시 즉시 토스트 메세지를 표시합니다.

### 알림 토스트를 사용한 시각화

실시간으로 수신한 알림을 사용자가 바로 확인 가능하게 토스트 UI를 구현했습니다. 댓글, 북마크 유형에 따라 다른 아이콘, 타이틀, 메세지를 표시하며 토스트 클릭 시 해당 게시글 상세 페이지로 이동합니다.

```tsx
const NOTIFICATION_CONFIG = {
  comment: {
    icon: 'MessageCircle',
    title: '누군가 댓글을 남겼어요.',
    getMessage: title => `'${title}'에 댓글을 남겼어요!`,
    bgColor: 'bg-red-300',
  },
  bookmark: {
    icon: 'Bookmark',
    title: '누군가 게시글을 저장했어요.',
    getMessage: title => `'${title}'을 저장했어요!`,
    bgColor: 'bg-black',
  },
} as const;

function NotificationToast({id, board_id, title, type}: NotificationToastProps) {
  const config = NOTIFICATION_CONFIG[type];

  return (
    <Link
      href={`/reviews/${board_id}`}
      className="flex bg-white p-4 rounded-lg shadow-lg ring-1 ring-black/5"
      onClick={() => sonnerToast.dismiss(id)}
    >
      <div className={`${config.bgColor} p-2 rounded-lg mr-3`}>
        <LucideIcon name={config.icon} className="w-5 h-5 text-white" />
      </div>
      <div>
        <p className="font-medium">{config.title}</p>
        <p className="text-sm text-gray-500">{config.getMessage(title)}</p>
      </div>
    </Link>
  );
}
```

댓글과 북마크 알림을 시각적으로 구분하고 클릭 시 해당 게시글 상세로 이동합니다.

### 알림 뱃지를 사용한 읽지 않은 알림 상태 표시

읽지 않은 알림이 존재하면 헤더의 종 아이콘에 뱃지를 표시합니다. 이 값은 SSE 이벤트 수신 시 전역 상태 갱신을 통해 즉시 반영됩니다.

```tsx
export default function NotificationBell() {
  const hasNotifications = useHasNotifications();
  const setHasNotifications = useSetHasNotifications();

  const handleReadNotifications = () => {
    setHasNotifications(false);
  };

  return (
    <Link href="/notifications" className="relative" onClick={handleReadNotifications}>
      <LucideIcon name="Bell" className="w-6 h-6 hover:text-boldBlue md:hover:scale-105 transition-all" />
      {hasNotifications && <div className="absolute -top-0.5 right-0.5 bg-boldBlue w-3 h-3 rounded-full" />}
    </Link>
  );
}
```

unread 상태면 종 아이콘에 즉시 뱃지가 나타나며 알림 페이지 진입 시 읽음 처리합니다.
