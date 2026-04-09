import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit(),
		SvelteKitPWA({
			registerType: 'autoUpdate',
			workbox: {
				maximumFileSizeToCacheInBytes: 25 * 1024 * 1024
			},
			manifest: {
				id: 'jiho-arithmetic-journey-v6',
				name: '지호의 산수 여행',
				short_name: '산수 여행',
				description: '만 6세를 위한 즐거운 사칙연산 학습 게임',
				start_url: '/',
				display: 'fullscreen',
				display_override: ['fullscreen', 'standalone', 'minimal-ui'],
				orientation: 'landscape',
				background_color: '#13183D',
				theme_color: '#13183D',
				icons: [
					{
						src: 'icon-192.png',
						sizes: '192x192',
						type: 'image/png',
						purpose: 'any maskable'
					},
					{
						src: 'icon-512.png',
						sizes: '512x512',
						type: 'image/png',
						purpose: 'any maskable'
					}
				]
			}
		})
	]
});
