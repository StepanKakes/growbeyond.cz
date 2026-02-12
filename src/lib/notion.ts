import { Client } from '@notionhq/client';
import { Resource } from '@/types';

const notion = new Client({
    auth: process.env.NOTION_API_KEY,
});

const DATABASE_ID = process.env.NOTION_DATABASE_ID!;
let cachedDataSourceId: string | null = null;

async function getDataSourceId(): Promise<string | null> {
    if (cachedDataSourceId) return cachedDataSourceId;
    if (!DATABASE_ID) return null;

    try {
        const response = await notion.databases.retrieve({ database_id: DATABASE_ID });
        // @ts-ignore - The type definition might be missing data_sources
        if (response.data_sources && response.data_sources.length > 0) {
            // @ts-ignore
            cachedDataSourceId = response.data_sources[0].id;
            return cachedDataSourceId;
        }
    } catch (error) {
        console.error('Error retrieving database to look up Data Source ID:', error);
    }
    return null;
}

export async function getAllResourceSlugs(): Promise<string[]> {
    if (!DATABASE_ID) {
        console.error('NOTION_DATABASE_ID is not defined in environment variables');
        return [];
    }

    const dataSourceId = await getDataSourceId();
    if (!dataSourceId) {
        console.error('Could not find Data Source ID for database', DATABASE_ID);
        return [];
    }


    try {
        const response = await notion.dataSources.query({
            data_source_id: dataSourceId,
            filter: {
                property: 'Slug',
                rich_text: {
                    is_not_empty: true,
                },
            },
        });

        const slugs: string[] = [];

        for (const page of response.results) {
            if (!('properties' in page)) continue;

            const slugProperty = page.properties.Slug;
            // @ts-ignore
            if (slugProperty?.rich_text && slugProperty.rich_text.length > 0) {
                // @ts-ignore
                slugs.push(slugProperty.rich_text[0].plain_text);
            }
        }

        return slugs;
    } catch (error) {
        console.error('Error fetching resource slugs:', error);
        return [];
    }
}

export async function getResourceBySlug(slug: string): Promise<Resource | null> {
    if (!DATABASE_ID) {
        console.error('NOTION_DATABASE_ID is not defined in environment variables');
        return null;
    }

    const dataSourceId = await getDataSourceId();
    if (!dataSourceId) {
        console.error('Could not find Data Source ID for database', DATABASE_ID);
        return null;
    }


    try {
        const response = await notion.dataSources.query({
            data_source_id: dataSourceId,
            filter: {
                property: 'Slug',
                rich_text: {
                    equals: slug,
                },
            },
            page_size: 1,
        });

        if (response.results.length === 0) {
            return null;
        }

        const page = response.results[0];
        return mapPageToResource(page);
    } catch (error) {
        console.error(`Error fetching resource with slug "${slug}":`, error);
        return null;
    }
}

function mapPageToResource(page: any): Resource {
    const props = page.properties;

    const getText = (propName: string): string => {
        const prop = props[propName];
        if (!prop) return '';
        if (prop.type === 'title' && prop.title.length > 0) {
            return prop.title[0].plain_text;
        }
        if (prop.type === 'rich_text' && prop.rich_text.length > 0) {
            return prop.rich_text[0].plain_text;
        }
        return '';
    };

    return {
        id: page.id,
        name: getText('Name'),
        slug: getText('Slug'),
        publicTitle: getText('PublicTitle'),
        subtitle: getText('Subtitle'),
        buttonText: getText('ButtonText'),
        kitFormId: getText('KitFormId'),
        coverTitle: getText('CoverTitle'),
        coverSubtitle: getText('CoverSubtitle'),
    };
}
