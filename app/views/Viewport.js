Crave.views.Viewport = Ext.extend(Ext.TabPanel, {
	fullscreen: true,
	tabBar: {
        dock: 'bottom',
        layout: {
            pack: 'center'
        }
    },
	items: [
		{
			xtype: 'nearbycard'
		},
		{
			xtype: 'savedcard'	
		},
		{
			xtype: 'followingcard'
		},
		{
			xtype: 'mecard'
		}
	]
});
