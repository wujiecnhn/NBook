<template>
  <div id="app-div">{{hello}}
    <input type="text"  v-model="hello"/>
    <input type="text"  v-model="hello"/>
  </div>

</template>

<style></style>

<script>
  export default{
    data(){
      return {
        msg: 'hello vue',
        hello: '而威尔'
      }
    },
    components: {}
  }
</script>
