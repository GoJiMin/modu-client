# 프로젝트 개요

사용자 후기 기반의 리뷰 커뮤니티로 베스트 후기·실시간 후기·검색 등 다양한 방식으로 후기를 탐색할 수 있는 플랫폼입니다. 게시글 작성, 이미지 업로드, 북마크, 댓글, 실시간 알림 등 커뮤니티 서비스에 필요한 기능을 제공합니다.

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

# 주요 구현 기능
프로젝트의 목표 달성을 위해 직접 설계하고 구현한 핵심 기능들입니다.

## 요약

- [메인페이지 - 하이브리드 렌더링](#메인페이지): SEO가 중요한 베스트 후기(ISR)와 실시간성이 중요한 실시간 후기(CSR + Dynamic Import) 영역을 분리해 서버 자원을 분배하고 초기 로딩 속도를 개선
- [검색 페이지 - 탐색 방식 분리](#검색-페이지---무한-스크롤-정렬-옵션-페이지네이션): 카테고리 탐색(무한스크롤)과 키워드 검색(페이지네이션)의 사용자 의도를 구분해 URL 기반 상태 관리로 구현 및 탐색 경험 최적화
- [Tiptap 기반 에디터 구현](#tiptap-기반-에디터-구현): `shouldRerenderOnTransaction` 제어 및 NodeView 커스터마이징을 통해 에디터의 불필요한 리렌더링을 최소화하고 Presigned URL을 활용한 이미지 업로드 진행률 표시 및 취소 로직 구현
- [북마크](#북마크): Tanstack Query의 `useMutation`을 활용해 즉각적인 UI 업데이트, 실패 시 롤백 및 관련 캐시 무효화 로직을 적용
- [댓글 작성](#댓글-작성): 페이지네이션 환경에서 마지막 페이지만 낙관적 업데이트 적용, 데이터 무결성을 위해 전체 페이지 캐시를 무효화
- [실시간 반응 알림 (SSE)](#실시간-반응-알림): Server-Sent-Events 연결 전 preflight 요청 및 토큰 재발행, 실시간 반응(댓글/북마크) 알림을 토스트 및 뱃지로 표시
- [게시글 상세 페이지 - On-Demand 캐싱](#게시글-상세-페이지---태그-기반-on-demand-캐싱): Next.js의 `fetch` 캐시와 `revalidateTag`를 활용해 읽기 성능 최적화, 쓰기 요청을 Next.js Route Handler를 프록시로 사용해 서버 캐시를 무효화하는 구조 설계
- [Nginx 기반 Blue-Green 배포](#nginx-기반-blue-green-배포): 단일 vCPU EC2 환경에서의 다운타임 최소화를 위해 Nginx 포트 스위칭, PM2, Health Check를 조합하여 자동 롤백 및 다운타임 없는 배포 파이프라인 구축

## 메인페이지

<div align="center">
  <img src="https://github.com/user-attachments/assets/672b1c24-be4f-4274-a91f-2a877bd0041a" width="800px" />
</div>

### 베스트 후기 섹션 (ISR 기반)

메인페이지 상단에는 댓글, 북마크, 조회수를 종합해 일정 주기로 선정한 베스트 후기를 노출합니다. 커뮤니티의 경쟁 심리를 자극하고 양질의 후기 노출을 극대화하는 핵심 영역입니다.

```tsx
export const revalidate = 3600;

export {MainPage as default} from '@/views/main';
```

해당 컨텐츠는 검색 엔진 노출 효과가 크다고 판단해 서버 렌더링을 이용했고, 백엔드 선정 주기(3시간)를 고려해 ISR(Incremental Static Regeneration)을 적용했습니다.

### 실시간 후기 섹션 (CSR + Dynamic Import)

가장 최근에 작성된 후기 6개를 캐러셀 형태로 노출하는 영역입니다. 커뮤니티의 활동성이 계속 유지되고 있다는 신호를 제공하기 위한 UI입니다.

SEO 우선 순위가 높은 영역이 아니기 때문에, 정적 구조는 서버 컴포넌트로 유지하고 캐러셀과 데이터 패칭이 필요한 부분만 클라이언트 컴포넌트로 분리했습니다.

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

SSR을 비활성화해 초기 로딩 시 서버가 처리해야 하는 비용을 줄였고 SEO가 중요한 베스트 후기 섹션에 서버 자원을 더 집중할 수 있도록 구성했습니다.

## 검색 페이지 - 무한 스크롤, 정렬 옵션, 페이지네이션

<div align="center">
  <img src="https://github.com/user-attachments/assets/9ccb4bd6-640c-4286-8348-7ab4c5a46043" width="800px" />
</div>

검색 기능은 '카테고리 기반 탐색'과 '키워드 기반 탐색'의 특성 차이에 따라 다른 탐색 방식을 제공하도록 설계했습니다.

### 카테고리 기반 탐색 - 무한스크롤

카테고리는 특정 키워드 없이 전체 데이터를 탐색하는 흐름이기 때문에 끊김 없는 탐색 경험을 제공하고자 무한스크롤을 적용했습니다.

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

정렬은 최신순 / 댓글순 / 북마크순 3가지 옵션을 제공하며 선택한 정렬 상태가 새로고침 시 유지되도록 URL 기반 상태 관리로 구현했습니다.

무한스크롤 영역은 리액트 쿼리의 `useInfiniteQuery`를 사용해 구현했으며, 카테고리 변경, 정렬 변경 시 자동으로 재요청되도록 구현했습니다.

### 키워드 기반 검색 - 페이지네이션

키워드 검색은 사용자가 정확한 결과를 찾기 위해 특정 위치를 기억해야 하는 구조라 무한스크롤보다 페이지네이션이 적합하다고 판단했습니다.

```tsx
const currentPage = Number(searchParams.get('page')) || 1;
const { results, total_pages } = useKeywordReviews(keyword, currentPage, sort);
```

현재 페이지 또한 useState 기반 상태 관리 방식이 아닌 URL 기반으로 관리해 새로고침 시 같은 페이지가 유지됩니다.

```tsx
<Pagination
  currentPage={currentPage}
  totalPages={total_pages}
  generateUrl={(page) => 
    `/search/${keyword}?page=${page}&sort=${sort}`
  }
/>
```

페이지네이션의 경우 직접 구현한 컴포넌트를 사용하며, 재사용을 위해 generateUrl 함수를 전달합니다. 함수는 page를 인자로 받아 이동하는 URL을 생성하는 구조입니다.

## Tiptap 기반 에디터 구현

### 기본적인 서식 지원

<div align="center">
  <img src="https://github.com/user-attachments/assets/9929a0ea-ce2b-46b7-aa1a-809ea65fc4bc" width="800px" />
</div>

리뷰 작성을 위해 Tiptap 기반 에디터를 직접 구현했습니다.

일반적인 글쓰기에 사용 가능한 모든 서식들과 이미지 업로드 등을 지원하며 각 툴바의 버튼은 툴팁을 표시합니다.

### 리렌더링 최소화를 위한 컴포넌트 분리

에디터는 입력 중인 컨텐츠 자체가 상태로 취급되기 때문에 구조를 잘못 설계하면 타이핑할 때마다 모든 영역이 다시 렌더링되는 문제가 발생합니다.

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

따라서 설계 시점에 에디터를 4개의 독립적인 영역으로 분리했습니다.

- EditorMetaForm: 제목, 카테고리 입력을 위한 영역
- EditorContainer: 실제 에디터 영역
- EditorFooter: 저장, 미리보기 버튼 표시 영역
- ViewerModal: 미리보기 모달

이렇게 각 영역은 서로 다른 상태를 담당해 불필요한 리렌더링이 발생하지 않습니다.

### 리렌더링 최적화 - shouldRerenderOnTransaction + useEditorState

<div align="center">
  <img src="https://github.com/user-attachments/assets/85582e4e-38d2-4ab2-a0b3-ec3ef920c738" width="800px" />
</div>

Tiptap은 기본적으로 모든 트랜잭션에 대해 리렌더링을 트리거하며 기본 설정대로 사용하면 입력마다 전체 에디터가 리렌더링됩니다.

이 동작을 최적화하고자 적용한 방법은 다음과 같습니다.

```ts
const editor = useEditor({
  shouldRerenderOnTransaction: false,
});
```

모든 트랜잭션에 대한 리렌더링을 비활성화합니다.

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

에디터의 상태가 변경될 때 변경되는 시점의 스냅샷에서 현재 문단 혹은 커서에 적용된 마크업 상태(boolean)를 외부로 반환합니다.

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

각 서식별 추적 가능한 키 값을 사용해 활성화 상태를 추적합니다.

<div align="center">
  <img src="https://github.com/user-attachments/assets/2a2de7f7-9fb2-488c-acfe-f15f02aea7da" width="800px" />
</div>

결과적으로 텍스트를 초당 수십 번 입력해도 리렌더링이 없으며, 툴바만 필요한 순간에 정확히 리렌더링되는 구조를 만들었습니다.

### 툴바 구성

툴바는 기능을 종류별로 그룹화해 구성했습니다.

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

### 이미지 업로드 기능

<div align="center">
  <img src="https://github.com/user-attachments/assets/f908bca9-6160-43c0-8269-ad26a626a991" width="800px" />
</div>

단순 input 태그를 이용한 업로드가 아니라 업로드 진행률, 취소, 에러 처리, 노드 교체까지 지원되는 이미지 업로드 노드를 직접 구현했습니다.

Tiptap의 기본 이미지 확장 기능은 입력 즉시 <img>만 삽입하기 때문에 업로드 상태를 UI로 보여줄 수 없습니다.

이를 해결하기 위해 NodeView 기반 커스텀 ImageUploadNode를 만들었고 문서 모델에 업로드 중인 이미지 노드를 그대로 두고 상태 변화를 반영하는 구조로 설계했습니다.

보안을 위해 S3에 직접 접근하지 않고 백엔드에서 Presgined URL을 발급받아 업로드하는 방식을 선택했습니다.

1. 클라이언트 => 백엔드: 이미지 타입 전송
2. 백엔드: 타입 검증 후 presigned URL + UUID 발급
3. 클라이언트: XHR로 S3 업로드
4. 업로드 성공 시: 업로드 노드를 제거하고 `<img src={cloudfront + uuid} />` 삽입

```ts
async function handleImageUpload(
  file: File,
  onProgress: (event: {progress: number}) => void,
  abortSignal: AbortSignal,
) {
  const fileType = file.type.split('/')[1];
  const {presignedUrl, uuid: imageId} = await getPresigned(fileType);

  const url = await uploadImage({file, fileType, presignedUrl, imageId, onProgress, abortSignal});

  return url;
}
```

반환되는 url을 에디터가 이미지 태그에 주입해 사용하는 구조입니다.

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

이미지 업로드 중 발생한 모든 에러는 파일 업로드에 사용되는 훅 내부에서 예외 처리하고 있습니다.

```ts
xhr.upload.onprogress = event => {
  if (event.lengthComputable) {
    const progress = Math.round((event.loaded / event.total) * 100);
    onProgress({progress});
  }
};
```

fetch API로는 진행률 추적이 불가능해 XHR 객체를 사용하고 xhr.upload.onprogress 이벤트를 활용해 업로드 상태를 업데이트하고 있습니다.

```ts
if (abortSignal) {
  abortSignal.addEventListener('abort', () => {
    xhr.abort();
    reject(createClientError('UPLOAD_CANCELLED'));
  });
}
```

또한 AbortController 인스턴스를 사용해 사용자가 언제든 요청을 중단할 수 있도록 비동기 요청 중단 로직을 구현했습니다.

```ts
{status === 'uploading' && (
  <div
    className={`absolute inset-0 bg-lightBlue`}
    style={{width: `${progress}%`, transition: 'all 300ms ease-out'}}
  />
)}
```

업로드 중일 때는 노드 뷰에서 진행률을 표시하며 완료 시 해당 노드 뷰를 제거하고 동일한 위치에 실제 이미지 노드를 삽입합니다.

### 저장 및 수정, 미리보기

<div align="center">
  <img src="https://github.com/user-attachments/assets/63e2045b-c580-4f1e-b70d-853ab573ce6c" width="800px" />
</div>

에디터는 저장과 수정 모두 동일한 Editor 컴포넌트를 사용하지만 저장 로직은 에디터 내부가 아닌 외부에서 주입받는 onSave 콜백으로 처리됩니다.

이 구조 덕분에 UI는 동일하게 유지 가능하면서도 신규 작성, 수정 기능에 모두 재사용하고 있습니다.

```tsx
type Props = {
  onSave: (data: ReviewPayload) => void;
  isPending: boolean;
} & EditorInitialData;

export default function Editor({title, category, content, onSave, isPending}: Props) {
  ...
}
```

이렇게 내부에서는 onSave를 호출할 뿐 저장 방식은 전혀 상관하지 않습니다.

```tsx
export default function NewReviewClient() {
  const {postReview, isPending} = usePostReview();

  return (
    <Editor
      isPending={isPending}
      onSave={data => postReview(data)}
    />
  );
}

export default function EditReviewClient({data, reviewId}: Props) {
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

사용하는 위치에서 신규 작성과 수정에 각각 다른 함수를 전달해 에디터는 저장한다는 사실만 알고 정확히 어디로, 어떻게 저장되는지는 전혀 모르는 분리 구조로 동작합니다.

```ts
export type EditorInitialData = {
  title?: string;
  category?: Category;
  content?: string;
};

const editor = useEditor({
  content: initialContent, // 초기 본문
});

const form = useForm({
  defaultValues: {
    title: initialTitle || '',
    category: initialCategory || undefined,
  },
});
```

다음으로 수정 페이지는 서버에서 캐싱된 게시글 상세 데이터를 그대로 받아 에디터의 초기 값으로 주입합니다. 각 값은 에디터의 초기 본문 값에 사용되거나 폼 객체 생성 시 초기 값에 사용됩니다.

글 작성 시에는 빈 값으로 시작되며 수정 시에는 이전 데이터를 그대로 채워서 시작하게 됩니다.

```tsx
export default async function getSessionUserNickname() {
  const cookieStore = await cookies();
  return cookieStore.get('userNickname')?.value ?? null;
}

export default async function EditReview({reviewId, sessionUserNickname}: Props) {
  const data = await getReviewDetail(reviewId);

  if (!data) notFound();
  if (data.author_nickname !== sessionUserNickname) {
    throw new Error('작성자만 리뷰를 수정할 수 있습니다.');
  }

  return <EditReviewClient data={data} reviewId={reviewId} />;
}
```

이 과정에서 작성자 본인만 수정 가능하게 Next.js 서버 컴포넌트 단에서 1차 검증을 수행합니다. 물론 백엔드에서도 동일한 검증을 통해 2차 검증을 수행합니다.

클라이언트는 HttpOnly 쿠키에 접근할 수 없어 조작이 불가능해 서버에서 상세 데이터의 닉네임과 쿠키 닉네임을 비교해 작성자 외 수정 불가능한 구조로 동작합니다.

## 북마크

<div align="center">
  <img src="https://github.com/user-attachments/assets/c53b512e-eac2-4724-aeb5-9f9b9092e5ba" width="800px" />
</div>

북마크 기능은 사용자 경험상 즉시 반응하는 느낌이 중요해 리액트 쿼리의 useMutation의 낙관적 업데이트 기능을 활용했습니다.

### 현재 북마크 상태 기반으로 bookmark/unbookmark 결정

```ts
const {mutate, ...rest} = useMutation({
  mutationFn: ({reviewId, hasBookmarked}: MutationVariables) => {
    if (hasBookmarked) {
      return unBookmarkReview({reviewId});
    } else {
      return bookmarkReview({reviewId});
    }
  },
});

const toggleBookmark = (payload: BookmarkPayload) => {
  const currentData = queryClient.getQueryData<ReviewBookmarks>(reviewQueryKeys.bookmarks(payload.reviewId));
  const hasBookmarked = currentData ? currentData.hasBookmarked : false;

  mutate({
    ...payload,
    hasBookmarked,
  });
};
```
하나의 뮤테이션 훅을 사용하며 현재 북마크 상태를 먼저 조회해 반대로 토글하는 방식으로 처리합니다. 이유는 onMutate 실행 시점이 mutationFn의 실행 시점보다 빠르기 때문입니다.

### 낙관적 업데이트

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

서버 요청 전 캐시를 업데이트해 북마크 상태와 수를 수정합니다. 실패 시 UI를 되돌리기 위해 이전 상태를 함께 반환합니다.

이 방식으로 사용자는 즉시 반영된 UI를 보게 되고 실제 서버 요청은 백그라운드에서 수행됩니다.

### 롤백

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

요청 실패 시 즉시 이전 상태로 되돌립니다.

### 요청 성공 시

북마크는 단일 데이터가 아닌 여러 화면에 영향을 미치는 요소입니다.
- 게시글 상세 페이지의 북마크 상태
- 마이페이지의 저장한 게시글 목록

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

## 댓글 작성

<div align="center">
  <img src="https://github.com/user-attachments/assets/e008933f-8c62-492a-8965-20bef97815a4" width="800px" />
</div>


댓글은 페이지네이션으로 제공하기 때문에 단순히 추가, 삭제가 아니라 페이지 단위로 데이터를 유지해야 하는 구조로 동작해 일반적인 낙관적 업데이트보다 까다로웠습니다.

특히 최신 댓글은 항상 마지막 페이지에 추가되기 때문에 현재 사용자가 보고 있는 페이지와 실제 댓글이 추가되는 페이지가 다를 수 있습니다.

### 마지막 페이지에만 낙관적 업데이트 적용

```ts
onMutate: async ({userNickname, reviewId, content}) => {
  const previous = queryClient.getQueryData<ReviewComments>(
    reviewQueryKeys.comments.page(reviewId, page)
  );

  if (!previous || page !== previous.total_pages) {
    return { previousComments: previous, wasNewPageCreated: false };
  }

  const newComment = {
    id: Dat가)

```ts
await queryClient.cancelQueries({queryKey: reviewQueryKeys.comments.page(reviewId, page)});

const updatedComments = {
  ...previousComments,
  comments_count: previousComments.comments_count + 1,
  comments: [...previousComments.comments, newComment],
};

queryClient.setQueryData(reviewQueryKeys.comments.page(reviewId, page), updatedComments);
```

페이지가 꽉 차지 않은 경우 현재 페이지에 즉시 추가합니다.

### 요청 성공 시

```ts
onSuccess: (_, {reviewId}) => {
  queryClient.invalidateQueries({
    queryKey: reviewQueryKeys.comments.all(reviewId),
  });
};
```

요청에 성공한 경우 모든 댓글 페이지 캐시를 무효화합니다. 이유는 2페이지가 마지막 댓글이 삭제되면 3페이지 첫 댓글이 2페이지로 당겨져야 합니다.

페이지 하나만 무효화하면 데이터가 뒤틀리기 때문에 모든 페이지를 무효화해 댓글 수, 페이지 수를 완전히 재계산합니다.

### 요청 실패 시

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

요청에 실패한 경우 새 페이지가 생성된 경우와 기존 페이지만 업데이트한 경우를 분리해 롤백을 시도합니다.

## 실시간 반응 알림

<div align="center">
  <img src="https://github.com/user-attachments/assets/5ffc78ee-6bee-4609-9c27-63014e35526a" width="800px" />
</div>

댓글, 북마크가 내 글에 달리면 사용자는 즉시 반응을 확인할 수 있어야 합니다. 이 기능을 위해 Server-Sent-Events(SSE)를 선택해 서버에서 클라이언트로 단방향 스트림을 유지하도록 구현했습니다.

기능 아래 흐름으로 구성되어 있습니다.
- 연결 전 preflight 요청으로 인증 상태 확인
- 필요 시 액세스 토큰 자동 재발행
- SSE 연결 후 meta, notification 이벤트 수신
- 전역 알림 상태 업데이트
- 토스트 컴포넌트로 표시 및 알림 뱃지 표시

### SSE 연결 훅

```ts
export function useConnectSSE({onMeta, onNotification}: Props) {
  const eventSourceRef = useRef<EventSource | null>(null);

  const isLoggedIn = useIsLoggedIn();
  const updateGlobalError = useUpdateGlobalError();

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

  const connectSSE = useCallback(async () => {
    if (eventSourceRef.current) return;

    try {
      const preflightResponse = await preflightNotifications();

      if (preflightResponse.ok) {
        initializeEventSource();
        return;
      }

      if (preflightResponse.status === 401) {
        const tokenRefreshResponse = await tokenRefresh();

        if (tokenRefreshResponse.ok) {
          initializeEventSource();
          return;
        }

        throw new RequestError({
           ...
        });
      }

      const {title, detail, status}: TErrorInfo = await preflightResponse.json();
      throw new RequestError({
         ...
      });
    } catch (error) {
      if (error instanceof RequestError) {
        updateGlobalError(error);
        return;
      }

      throw error;
    }
  }, [initializeEventSource, updateGlobalError]);

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
}
```

- SSE 연결 시 쿠키가 자동으로 전송 가능하게 withCredentials를 true로 설정했습니다.
- 액세스 토큰 만료 상태에서 바로 SSE 연결을 시도하면 실패하기 때문에 먼저 preflight 요청 후 필요 시 토큰을 재발행해 연결하고 있습니다.
  - 이유는 SSE 연결로 발생하는 에러 이벤트는 에러의 상태나 추가적인 정보를 얻는 데 제한적이기 때문에 API 요청을 별도로 구현했습니다.
- 이벤트 타입을 메타/알림으로 분리했습니다.
  - meta: 유저에게 이미 읽지 않은 알림이 있는지 전달되는 최초 발생 이벤트입니다.
  - notification: 댓글/북마크 생성 시 발생하는 이벤트입니다.

### NotificationProvider

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

앱 전체에서 한 번만 감싸주면 모든 컴포넌트에서 알림 기능이 동일하게 유지되는 프로바이더 컴포넌트입니다.

알림 발생 시 실행되는 handleNotification 함수는 내부에서 전달된 알림 데이터를 사용해 토스트 메세지를 표시합니다.

각 이벤트 모두 알림 전역 스토어에 알림 발생 여부를 업데이트합니다.

### 알림 토스트

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

알림 클릭 시 해당 게시글 상세 페이지로 이동 가능한 토스트 컴포넌트입니다.

토스트가 화면에 표시된 후 클릭 시 dismiss 함수로 토스트를 제거하며, 북마크/댓글 이벤트를 시각적으로 구분하고 있습니다.

### 알림 뱃지

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

알림 뱃지는 알림이 발생했을 때 전역 상태에서 즉시 반영 됩니다. 알림 페이지로 이동할 때 읽음 처리합니다.

## 게시글 상세 페이지 - 태그 기반 On-Demand 캐싱

게시글 상세 페이지는 작성자가 수정하거나 삭제하기 전까지 모든 사용자에게 동일한 컨텐츠를 보여주는 페이지입니다.

이런 특성상 Next.js의 On-Demand 방식(fetch 캐시 + tag 기반 무효화)을 적용하기에 매우 적합했고 최초 요청만 백엔드로 전달하고 이후 요청은 서버 캐시에서 바로 반환하는 구조로 설계했습니다.

### 캐싱 구조

```ts
const res = await fetch(url, {
  method: 'GET',
  next: {
    revalidate: false,
    tags: ['review-13'],
  },
});
```

직접 무효화 전까지 캐싱을 유지하며 tags에 지정한 태그를 revalidateTag로 무효화할 수 있습니다.

### Route Handler 프록시

Next.js의 revalidateTag는 Server Action 또는 Route Handler에서만 호출이 가능합니다. 하지만 프로젝트의 모든 쓰기 요청은 리액트 쿼리의 useMutation을 통해 호출하는 구조였기 때문에 클라이언트 환경에서 서버 캐시를 무효화할 권한이 없었습니다.

<div align="center">
  <img src="https://github.com/user-attachments/assets/5d36974f-db94-4edc-baf9-153e00603ca9" width="800px" />
</div>

따라서 쓰기 요청을 Next.js 서버로 우회시키는 방식을 선택했는데, 구체적인 흐름은 아래와 같습니다.

1. 클라이언트는 /api/reviews/[id]로 요청
2. Next.js 서버는 요청을 검증한 뒤 백엔드로 전달
3. 백엔드가 성공 응답을 보내면 Next.js 서버가 revalidateTag()를 호출해 서버 캐시 무효화

```ts

export async function DELETE(_: NextRequest, {params}: {params: Promise<{reviewId: string}>}) {
  const {reviewId} = await params;

  if (!reviewId) {
    return NextResponse.json(
      // 예외 처리
    );
  }

  const cookieStore = await cookies();

  const accessToken = cookieStore.get('accessToken');
  const userNicknameToken = cookieStore.get('userNickname');

  if (!accessToken || !userNicknameToken) {
    return NextResponse.json(
      // 예외 처리
    );
  }

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reviews/${reviewId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Cookie: `accessToken=${accessToken.value}; userNickname=${encodeURIComponent(userNicknameToken.value)}`,
    },
  });

  if (!res.ok) {
    const errorResponse = await res.json();
    return NextResponse.json(
       // 예외 처리
    );
  }

  revalidateTag(`review-${reviewId}`);
  return NextResponse.json(
    // ...
  );
}
```

이렇게 브라우저에서 Next.js 서버로 전송된 쿠키를 읽어 백엔드 요청에 직접 실어 보냅니다.

요청이 성공한 경우 On-Demand 캐시 무효화를 실행하고 태그 단위로 무효화됩니다.

```tsx
const {mutate, ...rest} = useMutation({
  mutationFn: ({reviewId}: MutationVariables) => deleteReview(reviewId),
  onSuccess: (_data, {category}) => {
    toast.success({
      title: '리뷰를 성공적으로 삭제했어요.',
    });

    const invalidateKeys = [
      reviewsQueryKeys.category.category('all'),
      reviewsQueryKeys.category.category(category),
      reviewsQueryKeys.keyword.all(),
    ];

    invalidateKeys.forEach(key => {
      queryClient.invalidateQueries({queryKey: key});
    });

    router.push('/search');
  },
});
```

클라이언트는 서버 캐시가 아닌 클라이언트 측 캐시만 관리하게 됩니다.

### 이 구조가 정답이었는가?

쓰기 요청이 Next.js 서버를 한 번 더 거치는 구조기 때문에 네트워크 홉이 하나 늘어난다는 단점이 분명히 존재합니다.

하지만 쓰기 요청의 빈도보다 읽기 요청의 빈도가 압도적으로 많으며 서버 캐싱을 활용했을 때 읽기 성능이 크게 향상된다는 점과 백엔드 서버의 부하도 동시에 감소한다는 점을 고려했습니다.

쓰기의 작은 비용과 읽기 성능의 향상의 교환이 충분히 합리적이라고 판단했습니다.

## Nginx 기반 Blue-Green 배포

프로젝트는 AWS EC2 t2.micro(단일 vCPU) 환경에서 운영되고 있어 PM2의 graceful reload나 클러스터 모드를 사용할 수 없었습니다.

Next.js 또한 기본 실행 방식에서는 ready 신호를 보낼 수 없어 PM2 reload 기반의 일반적인 무중단 배포가 불가능했습니다.

이 제약을 해결하기 위해 Nginx + PM2 + 포트 스위칭 기반 Blue-Green 배포를 직접 구축했습니다. 배포의 전체 흐름은 다음과 같습니다.
- 서버는 3000 / 3001 포트를 번갈아 사용합니다. 새 버전은 현재 사용 중이지 않은 포트에서 먼저 실행한 뒤 정상적으로 동작하면 Nginx의 `proxy_pass`를 새 포트로 전환합니다.
- 새 버전이 정상적으로 뜨지 않으면 자동으로 이전 버전으로 롤백합니다.
- 배포 과정은 **Github Actions => S3 => CodeDeploy => EC2** 파이프라인으로 자동화되어 있습니다.

### 1. 현재 서비스 포트 확인

```
location / {
          include /etc/nginx/conf.d/service-url.inc;
          proxy_pass $service_url;
    }
```

Nginx는 `service-url.inc`에 정의된 포트를 바라보도록 구성되어 있습니다.

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

현재 연결된 포트를 기준으로 새로운 서버가 구동될 포트를 결정합니다.

### 2. 릴리즈 폴더 교체 및 의존성 설치

```bash
mv $DEPLOY_PATH $RELEASE_PATH
mkdir $DEPLOY_PATH
ln -sfn $RELEASE_PATH $SYMLINK_PATH

pnpm install
```

새 릴리즈 폴더를 생성하고 심볼릭 링크(current)를 새 릴리즈로 변경한 뒤 필요한 의존성을 설치합니다.

릴리즈는 배포 시간 기반으로 디렉토리를 생성해 버전 이력을 남깁니다.

### 3. PM2로 새 버전 실행

```bash
$PM2_PATH start "node_modules/next/dist/bin/next" --name $NEW_NAME --no-autorestart -- start --port $NEW_PORT
```

Blue / Green 두 개의 프로세스를 번갈아 사용해 충돌을 방지합니다.

### 4. Health Check 기반 정상 상태 판별

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

실패하면 새 프로세스를 제거하고 이전 릴리즈로 즉시 복구합니다. 추가로 실패 로그를 슬랙으로 전송합니다.

### 5. 성공 시 Nginx 프록시 전환

```bash
echo "set \$service_url http://$SERVER_IP:${NEW_PORT};" | sudo tee /etc/nginx/conf.d/service-url.inc
sudo nginx -s reload
```

service_url만 새 포트로 변경해 트래픽을 전환합니다.
- Nginx의 graceful reload는 워커 프로세스를 CPU 수만큼만 늘릴 수 있어 재시작시 1~2초의 짧은 다운타임이 발생합니다. 하지만 서비스 중단을 막는 데에는 충분히 안정적인 방식이라고 판단했습니다.

### 6. 기존 서버 종료

```bash
$PM2_PATH sendSignal SIGINT $OLD_NAME
sleep 90
$PM2_PATH delete $OLD_NAME
```

Next.js는 SIGINT 수신 시 내부적으로 `server.close()`를 호출해 처리 중인 요청을 모두 종료한 뒤 프로세스를 종료합니다.

따라서 SIGINT 신호를 보내 기존 프로세스를 종료하지 않고 graceful shutdown을 유도하며 90초의 킬타임 대기 후 프로세스를 종료합니다.

### 이 구조가 의미 있었던 이유

1. 단일 코어 환경에서도 다운타임을 최소화해 배포가 가능했습니다.
2. 실패 시 자동으로 롤백이 가능했습니다.
3. 실제 운영 환경에서 77회 배포 중 8회 배포가 실패했으나 서비스 중단 0회를 유지했습니다.
