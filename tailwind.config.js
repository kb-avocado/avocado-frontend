/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,jsx}'],
  theme: {
    extend: {
      colors: {
        // 아보카도 팀 브랜드 컬러 정의 (Figma 시안 나오면 교체)
        primary: '#4CAF50'
      }
    }
  },
  plugins: []
}
