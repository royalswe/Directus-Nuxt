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

		const visitedIds = new Set<string>([current.id]);

		while (current.parent?.id) {
			if (visitedIds.has(current.parent.id)) break;

			const parent = await directusServer.request(
				readItems('pages', {
					filter: { id: { _eq: current.parent.id }, status: { _eq: 'published' } },
					fields: ['id', 'title', 'permalink', 'parent.id'] as any,
					limit: 1,
				}),
			);
			const parentPage = Array.isArray(parent) ? parent[0] : parent;
			if (!parentPage) break;
			trail.unshift({ id: (parentPage as any).id, title: (parentPage as any).title, permalink: (parentPage as any).permalink });
			current = parentPage;
		}

		return trail;
	} catch {
		return [];
	}
});
