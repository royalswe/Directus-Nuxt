import { withoutTrailingSlash, withLeadingSlash } from 'ufo';
import { directusServer, readItems, readItem } from '@@/server/utils/directus-server';

interface BreadcrumbItem {
	id: string;
	title: string;
	permalink: string;
}

export default defineEventHandler(async (event) => {
	const { permalink: rawPermalink } = getQuery(event);

	if (!rawPermalink) return [];

	const permalink = withoutTrailingSlash(withLeadingSlash(String(rawPermalink)));

	try {
		const pages = await directusServer.request(
			readItems('pages', {
				filter: { permalink: { _eq: permalink }, status: { _eq: 'published' } },
				fields: ['id', 'title', 'permalink', 'parent.id'] as any,
				limit: 1,
			}),
		);

		if (!pages.length) return [];

		const trail: BreadcrumbItem[] = [];
		let current = pages[0] as any;

		trail.push({ id: current.id, title: current.title, permalink: current.permalink });

		while (current.parent?.id) {
			const parent = await directusServer.request(
				readItem('pages', current.parent.id, {
					fields: ['id', 'title', 'permalink', 'parent.id'] as any,
				}),
			);
			if (!parent) break;
			trail.unshift({ id: (parent as any).id, title: (parent as any).title, permalink: (parent as any).permalink });
			current = parent;
		}

		return trail;
	} catch {
		return [];
	}
});
