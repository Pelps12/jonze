<script>
	import {
		Area,
		Axis,
		Chart,
		Highlight,
		Svg,
		Tooltip,
		TooltipItem,
		Bars,
		RectClipPath
	} from 'layerchart';
	import { scaleBand, scaleTime } from 'd3-scale';

	import appleStock from './apple-stock.json';
	import { format } from 'date-fns';

	const data = appleStock.map((d) => {
		return { date: new Date(d.date), value: d.value };
	});
</script>

<div class="h-[300px] p-4 border rounded group">
	<Chart
		{data}
		x="date"
		xScale={scaleBand().padding(0.4)}
		y="value"
		yDomain={[0, null]}
		yNice={4}
		padding={{ left: 16, bottom: 24 }}
		tooltip={{
			mode: 'band',
			onClick: ({ data }) => {
				alert('You clicked on:' + JSON.stringify(data, null, 2));
			}
		}}
	>
		<Svg>
			<Axis placement="left" grid rule />
			<Axis placement="bottom" format={(value) => format(value, 'MMMM dd')} rule />
			<Bars
				radius={4}
				strokeWidth={1}
				class="fill-foreground stroke-none group-hover:fill-foreground transition-colors"
			/>
			<Highlight area>
				<svelte:fragment slot="area" let:area>
					<RectClipPath x={area.x} y={area.y} width={area.width} height={area.height} spring>
						<Bars radius={4} strokeWidth={1} class="fill-primary" />
					</RectClipPath>
				</svelte:fragment>
			</Highlight>
		</Svg>
		<Tooltip header={(data) => format(data.date, 'MMMM')} let:data>
			<TooltipItem label="value" value={data.value} />
		</Tooltip>
	</Chart>
</div>
