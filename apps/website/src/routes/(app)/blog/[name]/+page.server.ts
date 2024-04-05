import db from '$lib/server/db';
import schema from '@repo/db/schema';
import { eq } from '@repo/db';
import type { PageServerLoad } from './$types';
import { compile } from 'mdsvex';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params }) => {
	const blogPost = await db.query.blog.findFirst({
		where: eq(schema.blog.name, params.name)
	});

	await db.insert(schema.blog).values({
		name: 'jonze-launch',
		content: `
---
title: Welcome to Jonze — Streamlining Management for School Organizations
shortTitle: Jonze Announcement
description: Launch of organization management tool called Jonze. It has attendance tracking, form surveys and membership plans
author: Pelumi Adegoke
date: 2024-04-05T21:57:12+0000
---
		
		
		![OG Image Jonze](https://ucarecdn.com/b49dfb27-3d2b-4b3f-a556-e0022c76d2fb/-/preview/1000x525/)
		
		  
		
		For the past 2 months, I've been working on something, **Jonze** – a practical tool designed to assist in the management of school organizations. Developed from firsthand experience as the Technical Director of the African Student Union at UTD, Jonze addresses common administrative challenges, making organization management more straightforward and efficient.
		
		  
		
		## Background of Jonze
		
		  
		
		The idea for Jonze emerged from the everyday administrative tasks involved in running a student organization. Traditional methods like collecting information through Google Forms and manually updating spreadsheets were time-consuming and prone to error. Thus, I worked on a custom solution for the African Student Union. However, I quickly realized for officers to gain value, an admin dashboard was needed. This made me see how many more orgs could benefit from such a tool. Jonze offers a solution that simplifies these processes, allowing organizational leaders to focus on their core activities.
		
		  
		
		![Jonze Dashboard](https://ucarecdn.com/12a20115-07cd-423f-b533-923ea79c40eb/-/preview/1000x506/)
		
		  
		  
		
		### Attendance Tracking
		
		  
		
		Track event attendance easily with Jonze, ensuring that member's participation is recorded. No need for your members to put in their details every time they fill your form.
		
		  
		
		![Attendance Tracking](https://ucarecdn.com/b7c926fe-ad98-438f-9465-f69a2252de0c/-/preview/1000x505/)
		
		  
		
		### Surveys & Feedback
		
		  
		
		Collect and analyze member feedback with Jonze's survey tools to inform decisions and improve the organization's offerings. Of course you can do this with Google Forms but why ask your members for their email every time you need to survey something? This also brings up the issue of cross referencing the survey response to a member. Is this response from an **active member** or someone who came to only **one meeting**?
		
		
		  
		
		![Surveys and Feedback](https://ucarecdn.com/5d5d1629-42d5-4902-88d8-01ef286b6705/-/preview/1000x505/)
		
		  (HINT: If you add \`?callbackUrl=<YOUR_WEBSITE>\` to the link, it redirects to your website on form completion) Like [this](https://dev.jonze.co/form/form_M4nwfCDanpsKjWwc?callbackUrl=https://shattereddisk.github.io/rickroll/rickroll.mp4)
		
		### Membership Status Management
		
		  
		
		Manage the status of members, from freshman to alumni, keeping your organization's data organized and accessible. Different orgs have different membership tiering structures. Maybe you have a $2/mo tier or you have $25 dues paid upfront. You as an org admin (e.g. the treasurer) can go update users' payment plans. This opens up the possibility of member only events, newsletters and discounts on upcoming integrations to services like ([Kazala](https://kazala.co) and Eventbrite)
		
		  
		
		![Membership Status](https://ucarecdn.com/e2b7cf25-0684-4d87-aa0a-f39dba44af84/-/preview/1000x505/)
		
		  
		
		## Jonze API for Website Integration
		
		  
		
		Jonze also offers an API, allowing for the integration of its features into your organization's website. This can help in embedding membership forms, showcasing events, and displaying achievements directly on your site.
		
		  
		
		### API Capabilities:
		
		  
		
		- **Event Display:** List upcoming events and track attendance through your organization's site.
		
		- **Form Response Embeds:** Use form responses API endpoints to add domain specific info to your website
		
		  
		  
		  
		
		The Jonze API is user-friendly, equipped with documentation to assist in your integration efforts. You could also just send a DM if you have some special use-case.
		
		  
		
		![API Integration](https://ucarecdn.com/71a498cb-8391-452d-972b-dcf44ba93d6f/-/preview/1000x504/)
		
		  
		
		## Looking Ahead
		
		  
		
		I'm working on adding more features to Jonze, including member newsletters, a well managed membership dues & donation system, custom org colors. Maybe Wix and SquareSpace integrations 😉.
		![Managed Memberships](https://ucarecdn.com/60557ea4-aff8-4a75-87c2-ad3f86188d5d/-/preview/1000x505/)
		  
		
		## Join the Community
		
		  
		
		As an open-source project, Jonze welcomes contributions. Connect on [Discord](https://discord.gg/UCvyBgbspE) for updates and community discussions.
		
		  
		
		## Getting Started
		
		  
		
		Enhance your organization's management with Jonze. Visit our [Home page](https://jonze.co) to begin, and don't hesitate to get in touch with any questions or feedback.
		
		  
		
		Jonze aims to make the management of school organizations simpler and more organized, supporting the activities and growth of your community.`
	});
	if (!blogPost) error(404, 'Blog Not Found');
	const sourceTwo = blogPost.content;

	const transformed_code = await compile(sourceTwo);
	console.log(transformed_code);

	return { content: transformed_code, raw: sourceTwo };
};
