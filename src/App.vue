<template>
	<div v-if="data">
		<details>
			<summary>Before</summary>
			<pre>{{ JSON.stringify(data.allPosts[0].text, null, 2) }}</pre>
		</details>
		<details>
			<summary>After splitting</summary>
			<pre>{{ JSON.stringify(splitStructuredField(data.allPosts[0].text), null, 2) }}</pre>
		</details>
	</div>
	<div v-else>
		<p>No data ...</p>
	</div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { splitStructuredField } from './lib/StructuredFieldSplitter';
import { useHead } from '@vueuse/head';

import { request } from './lib/datocms';
import { toHead } from 'vue-datocms';

const nightMode = ref(window.matchMedia('(prefers-color-scheme: dark)').matches);

const data = ref<any>(null);

const toggleDayNight = () => {
	nightMode.value = !nightMode.value;
};

const computedMeta = computed(() => {
	if (!data.value) {
		return {};
	}

	return toHead(data.value.profile.seo, data.value.site.favicon);
});

useHead(computedMeta);

onMounted(async () => {
	data.value = await request({
		query: `
      {
        allPosts {
          slug
          text {
            value
            links {
              __typename
              ...on PostRecord { id, slug }
              ...on ProfileRecord { id }
            }
            blocks {
              __typename
              ...on TableRecord { id, title }
              ...on ImageRecord { id, image { url }}
            }
          }
        }
         site: _site {
          favicon: faviconMetaTags {
            ...metaTagsFragment
          }
        }
       profile {
          seo: _seoMetaTags {
            ...metaTagsFragment
          }
          name
          description
          profession
          location
          email
          coordinates {
            latitude
            longitude
          }
          photo {
            desktopImage: responsiveImage(imgixParams: { w: 360, h: 540, fit: crop, crop: faces, auto: format }) {
              ...imageFields
            }
            mobileImage: responsiveImage(imgixParams: { w: 192, h: 192, fit: crop, crop: faces, auto: format }) {
              ...imageFields
            }
          }
        }
        theme {
          color
          backgroundImage {
            url(imgixParams: { w: 1440, auto: format })
            responsiveImage(imgixParams: { w: 1440, auto: format }) {
              base64
            }
          }
        }
        socials: allSocials {
          social
          url
        }
      }

      fragment metaTagsFragment on Tag {
        attributes
        content
        tag
      }
      fragment imageFields on ResponsiveImage {
        srcSet
        sizes
        src
        width
        height
        alt
        title
        base64
      }
    `,
		variables: {},
		preview: false,
	});
});
</script>
