<script lang="ts">

	import Sidebar from "./Sidebar.svelte";




	
	

</script>
<div class="grid lg:grid-cols-5">
    <Sidebar  class="hidden lg:block" />
    <div class="col-span-3 lg:col-span-4 lg:border-l p-3">
        <slot/>
    </div>
</div>
