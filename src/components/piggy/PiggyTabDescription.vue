<!--
  저금통 탭 아래에 놓이는 안내 문구.

  탭 이름만으로는 어떤 저금통이 모이는 곳인지, 여기서 무엇을 할 수 있는지
  알기 어려워 한 줄로 설명한다.
-->
<template>
  <div v-if="description" class="flex items-center gap-2 mb-4">
    <img :src="cadoseedImage" alt="아보카도 씨" class="w-9 h-9 object-contain shrink-0" />

    <p class="text-xs text-muted leading-relaxed" v-html="description" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import cadoseedImage from '@/assets/images/cadoseed.png'

const props = defineProps({
  /* IN_PROGRESS | BONUS_UNPAID | CLOSED */
  tab: {
    type: String,
    required: true
  },

  /* child | parent */
  audience: {
    type: String,
    default: 'child'
  }
})

const DESCRIPTIONS = {
  child: {
    IN_PROGRESS:
      '목표를 향해 <strong class="font-bold">모으는 중</strong>인 저금통이에요.<br />조금씩 넣다 보면 금방 채워져요.',

    BONUS_UNPAID:
      '목표를 다 채운 저금통이에요.<br />보호자가 약속한 <strong class="font-bold">보너스를 기다리는 중</strong>이에요.',

    CLOSED:
      '모은 돈을 <strong class="font-bold">모두 돌려받은</strong> 저금통이에요.<br />지금까지 이룬 목표를 여기서 다시 볼 수 있어요.'
  },

  parent: {
    IN_PROGRESS:
      '아이가 <strong class="font-bold">목표를 향해 저금하고 있어요.</strong><br />응원 메시지로 힘을 보태줄 수 있어요.',

    BONUS_UNPAID:
      '아이가 <strong class="font-bold">목표를 달성했어요.</strong><br />약속한 보너스를 보내주세요.',

    CLOSED:
      '<strong class="font-bold">환급과 보너스 지급이 모두 끝난</strong> 저금통이에요.<br />아이가 이룬 목표를 여기서 확인할 수 있어요.'
  }
}

const description = computed(() => DESCRIPTIONS[props.audience]?.[props.tab] ?? '')
</script>
