<script lang="ts">

	import Sidebar from "./Sidebar.svelte";




	
	

</script>
<div class="lg:grid lg:grid-cols-5">
    <Sidebar class="" />
    <div class="lg:col-span-4 border-t lg:border-l p-3">
        <slot/>
    </div>
</div>
