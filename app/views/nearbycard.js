Crave.views.NearbyCard = Ext.extend(Ext.Panel, {
	id : 'nearby',
	title: 'nearby',
	iconCls: 'nearBy',
	layout : 'card',
	items: [
		{
			xtype: 'dishlistcard'
		},
		{
			xtype: 'reslistcard'
		},
		{
			xtype: 'dishpagecard'
		}
	]
});
Ext.reg('nearbycard', Crave.views.NearbyCard);