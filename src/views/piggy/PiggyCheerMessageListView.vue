<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { UserRound, Trash2 } from 'lucide-vue-next'

/* 뒤로가기 버튼 활성화를 위한 헤더와 NAV import */
import AppHeader from '@/components/layout/AppHeader.vue'
import BottomNavBar from '@/components/layout/BottomNavBar.vue'

import { deleteCheerMessage } from '@/api/piggy'
import { formatMessageTime } from '@/utils/format'

const route = useRoute()
const router = useRouter()

/* 테스트 데이터 */
const messages = ref([
    {
        id: 1,
        senderName: '엄마',
        message: '정말 대단해!!! 우리 아들 조금만 더 힘내자. 멋진 우주선이 곧 네 손에 있을 거야!',
        createdAt: new Date().toISOString()
    },
    {
        id: 2,
        senderName: '엄마',
        message: '너무 잘 하고 있어~ 오늘 저녁엔 네가 좋아하는 반찬 해줄게!',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    }
])

async function handleDelete(messageId) {
    // 추후 삭제 확인 공통 모달 제작 후 바꿔지기 예정
    if (!window.confirm('이 응원 메시지를 삭제할까요?')) return
    try {
        // piggy.js의 응원 삭제 api 호출
        await deleteCheerMessage(route.params.id, messageId)

        // db에서 삭제되면 화면에도 갱신
        messages.value = messages.value.filter((m) => m.id !== messageId)
    } catch (e) {
        alert('삭제에 실패했어요. 다시 시도해주세요.')
    }
}
</script>