/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,jsx}'],
  theme: {
    extend: {
      colors: {
        // 아보카도 팀 브랜드 컬러 정의
        primary: '#4CAF50',
        avocado: {
          50: '#ffffff', // 페이지/카드 옅은 배경
          100: '#ECF3E9', // 선택된 탭 배경 (pill)
          300: '#CFE8A9', // 보조 강조
          600: '#78B159', // 브랜드 메인 그린 — 버튼, 활성 탭, 강조 텍스트, 프로그레스 바
          900: '#000000' // 가장 진한 텍스트 (필요시)
        },
        muted: '#6b7280' // 비활성 아이콘/텍스트용 회색
      }
    }
  },
  plugins: []
}
