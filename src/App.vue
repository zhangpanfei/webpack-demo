<template>
  <div class="title" @click="click">{{ title }}
    <span id="show"></span>  
  </div>
</template>

<script>
import $ from 'jquery'
export default {
  data() {
    return {
      title: "Hello Word",
    };
  },
  methods: {
    click(){
      console.log(this.title)
      alert(this.title)
      $('#show').html(Math.random())
    }
  }
};
</script>

<style scoped>
.title {
  color: red;
}
</style>
