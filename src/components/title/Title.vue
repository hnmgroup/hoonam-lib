<script setup lang="ts">
import {watch} from "vue";
import {resolve} from "@/bind";
import {Title} from "@/title";
import {isUndefined} from "lodash-es";

const props = defineProps<{
  mainTitle?: string;
  subTitle?: string;
  title?: string;
}>();

const title = resolve(Title);

if (!isUndefined(props.mainTitle)) title.setMainTitle(props.mainTitle);
if (!isUndefined(props.subTitle)) title.setSubTitle(props.subTitle);
if (!isUndefined(props.title)) title.setTitle(props.title);

watch(
  () => props.mainTitle,
  (newTitle) => title.setMainTitle(newTitle),
);
watch(
  () => props.subTitle,
  (newTitle) => title.setSubTitle(newTitle),
);
watch(
  () => props.title,
  (newTitle) => title.setTitle(newTitle),
);

</script>
