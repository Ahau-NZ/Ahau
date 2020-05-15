<template>
<v-card width="50" height="50">
    <v-container>
      <v-row>
        <v-col cols="auto">
          <div>
            <video v-if="file.type === 'video'" class="video"  ref="video" controls>
              <source :src="file.url" :type="file.fileType">
            </video>
            <v-img v-if="file.type === 'photo'" :src="file.url" :alt="file.name"/>
            <audio v-if="file.type === 'audio'" controls>
              <source :src="file.uri" :type="file.fileType">
            </audio>
          </div>
        </v-col>
      </v-row>
    </v-container>
  </v-card>
</template>

<script>
export default {
  name: 'MediaCard',
  props: ['file']
}
</script>
