 /* eslint-disable */
<template>
  <svg
    viewBox="0 0 210 178.4"
    class="icon"
    :class="styleClasses"
  >
    <g id="Page-1">
      <g id="_x30_08---Family-Tree" transform="translate(0.000000, -1.000000)">
        <circle id="Oval_2_" class="st0" cx="105.2" cy="22.2" r="17"/>
        <path id="Shape_4_" class="st0" d="M120.5,46.4c-10.5,6.4-23.8,6.4-34.4,0C75.8,51,67.7,59.4,63.7,70c22.5,20.4,56.8,20.4,79.3,0
          C139,59.4,130.9,51,120.5,46.4z"/>
        <ellipse id="Oval_3_" class="st0" cx="167.6" cy="115" rx="17" ry="17"/>
        <path id="Shape_9_" class="st0" d="M184.8,138.8c-10.5,6.4-23.8,6.4-34.4,0c-10.3,4.6-18.4,13-22.5,23.6
          c22.5,20.4,56.8,20.4,79.3,0C203.2,151.8,195.1,143.3,184.8,138.8z"/>
        <circle id="Oval_5_" class="st0" cx="41.1" cy="113.2" r="17"/>
        <path id="Shape_11_" class="st0" d="M58.3,137.8c-10.5,6.4-23.8,6.4-34.4,0c-10.3,4.6-18.4,13-22.5,23.6
          c22.5,20.4,56.8,20.4,79.3,0C76.7,150.9,68.6,142.4,58.3,137.8z"/>
        <path id="Shape_2_" d="M214.1,179.4"/>
        <path id="Shape_3_" class="st0" d="M140.3,117.9c2.2-1.4,1.2-4.8-1.4-4.8h-17.4c-4.7,0-8.4-3.9-8.5-8.6c-0.1-5.1-4.9-9.2-10.2-8.1
          c-3.9,0.8-6.6,4.5-6.7,8.5c-0.1,4.6-3.9,8.3-8.5,8.3l-15.6,0.1l0,0c-3.3,0-4.6,4.5-1.8,6.2l17.2,10.8l0,0c6.3,0,12.4-2.4,17-6.6
          c0,0,0,0,0.1,0c4.6,4.2,10.4,6.5,16.5,6.6c0.3-0.1,0.5-0.2,0.7-0.2L140.3,117.9z"/>
      </g>
    </g>
  </svg>
</template>

<script>
export default {
  name: 'WhakapapaIcon',
  props: {
    size: String,
    color: String
  },
  computed: {
    styleClasses () {
      return [this.size, this.color].map(val => val && `is-${val}`)
    }
  }
}
</script>
<style>
/* default */
.icon {
  width: 1.2em;
  height: 1.2em;
  fill: black;
}

/* sizes */
.icon.is-x-large {
  width: 3em;
  height: 3em;
}
.icon.is-large {
  width: 2.5em;
  height: 2.5em;
}
.icon.is-medium {
  width: 2em;
  height: 2em;
}
.icon.is-normal {
  width: 1.6em;
  height: 1.6em;
}
.icon.is-small {
  width: 1.2em;
  height: 1.2m;
}
.icon.is-tiny {
  width: 0.8em;
  height: 0.8em;
}

/* colors */
.icon.is-primary,
.icon.is-blue {
  fill: #2196F3
}
.icon.is-success,
.icon.is-green {
  fill: #4CAF50
}
.icon.is-active,
.icon.is-red  {
  fill: #B02425
}

.icon.is-scroll,
.icon.is-white  {
  fill: #fff
}

.icon.is-disabled  {
  fill: rgba(0, 0, 0, 0.5)
}
</style>
