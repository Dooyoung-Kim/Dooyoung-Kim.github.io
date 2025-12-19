# CORS 문제 해결 가이드

## 문제
Claude API는 브라우저에서 직접 호출할 수 없습니다 (CORS 정책). GitHub Pages는 정적 사이트이므로 서버 사이드 코드를 실행할 수 없습니다.

## 해결 방법: Vercel Functions 사용

Vercel은 무료로 서버리스 함수를 제공하며, GitHub와 쉽게 연동할 수 있습니다.

### 방법 1: Vercel 웹사이트를 통해 배포 (가장 간단)

1. **Vercel 계정 생성**
   - https://vercel.com 접속
   - GitHub 계정으로 로그인

2. **프로젝트 Import**
   - "Add New Project" 클릭
   - GitHub 저장소 선택
   - Root Directory: `/` (기본값)
   - Framework Preset: "Other"
   - Build Command: (비워두기)
   - Output Directory: `/` (기본값)
   - **중요**: Vercel은 `api/` 폴더의 파일을 자동으로 서버리스 함수로 인식합니다

3. **환경 변수 설정** (선택사항)
   - 필요 없음 (API 키는 클라이언트에서 전송)

4. **Deploy**
   - "Deploy" 클릭
   - 배포 완료 후 URL 확인 (예: `your-site.vercel.app`)

### 방법 2: Vercel CLI 사용

```bash
# Vercel CLI 설치
npm i -g vercel

# 프로젝트 디렉토리에서 실행
vercel

# 프로덕션 배포
vercel --prod
```

### 방법 3: GitHub Actions 자동 배포 (고급)

`.github/workflows/deploy.yml` 파일을 생성하여 자동 배포 설정 가능

## API 엔드포인트 사용

배포 후 프록시 엔드포인트가 자동으로 생성됩니다:
- `https://your-site.vercel.app/api/claude-proxy`

## 대안: Netlify Functions

Netlify도 유사한 기능을 제공합니다:

1. `netlify/functions/claude-proxy.js` 파일 생성
2. Netlify에 GitHub 저장소 연결
3. 자동 배포

## 대안: Cloudflare Workers

Cloudflare Workers도 무료 티어를 제공합니다.

## 현재 상태

현재 코드는 두 가지 모드를 지원합니다:

1. **FAQ 모드** (API 없이 작동)
   - 기본 질문에 대해 즉시 답변
   - XRMemory, 프로젝트, 수상 등

2. **API 모드** (프록시 서버 필요)
   - FAQ에 없는 질문에 대해 Claude API 호출
   - Vercel 배포 후 작동

## 문제 해결

### 에러: "Function Runtimes must have a valid version"

이 에러가 발생하면:
1. `vercel.json` 파일이 올바른 형식인지 확인 (`"version": 2`만 포함)
2. `api/claude-proxy.js` 파일이 CommonJS 형식(`module.exports`)을 사용하는지 확인
3. Vercel 대시보드에서 프로젝트를 다시 배포

### 함수가 작동하지 않는 경우

1. Vercel 대시보드에서 Functions 탭 확인
2. 배포 로그에서 에러 확인
3. `api/claude-proxy.js` 파일이 올바른 위치에 있는지 확인

## 테스트

로컬에서 테스트하려면:

```bash
# Vercel CLI로 로컬 서버 실행
vercel dev
```

이제 `http://localhost:3000`에서 테스트 가능합니다.

