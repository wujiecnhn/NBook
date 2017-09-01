<template>
  <div id="app-div">{{hello}}
    <input type="text"  v-model="hello"/>
    <input type="text"  v-model="msg"/>
  </div>

</template>

<style></style>

<script>
  export default{
    data(){
      return {
        msg: 'Hell ...',
        hello: 'Login Page'
      }
    },
    components: {}
  }
</script>
