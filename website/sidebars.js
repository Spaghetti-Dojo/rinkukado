/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
	docs: [
		'index',
		'customize',
		{
			type: 'category',
			label: 'Client modules',
			items: [ 'modules/client/preview', 'modules/client/interactivity' ],
		},
		{
			type: 'category',
			label: 'Server modules',
			items: [
				'modules/server/popover',
				'modules/server/preview',
				'modules/server/rest',
			],
		},
		'development',
		'testing',
	],
};

export default sidebars;
