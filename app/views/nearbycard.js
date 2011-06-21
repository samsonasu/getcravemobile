var dishesBtn = new Ext.Button({
	text: 'Dishes',
	iconMask: true,
	iconCls: 'dishes',
	ui: 'decline',
	width : "40%",
	handler : function(b,e) {
			Ext.dispatch({
				controller: Crave.controllers.nearby,
				action    : 'showDishes',
				animation: {type:'slide', direction:'left'}
			});
	}
});
var resBtn = new Ext.Button({
	text: 'Restaurents',
	iconMask: true,
	iconCls: 'res',
	ui: 'decline',
	width : "40%",
	handler : function(b,e) {
			Ext.dispatch({
				controller: Crave.controllers.nearby,
				action    : 'showRes',
				animation: {type:'slide', direction:'left'}
			});
		//this.setActiveitem(Crave.views.reslistcard, {type: 'slide',direction: 'left'});
	}
});
var uBtn = new Ext.Button({
	iconMask: true,
	iconCls: 'res',
	ui: 'decline',
	width : "20%"
});
var nearByToolbar = new Ext.Toolbar({
	dock :'top',
	ui : 'light',
	padding : 5,
	items:[dishesBtn,resBtn,uBtn]
});
var nearBySearchToolbar = new Ext.Toolbar({
	dock : 'top',
	items: [{
		xtype: 'searchfield',
        name: 'searchBox',
		width : '100%'
	}]
});

Crave.views.NearbyCard = Ext.extend(Ext.Panel, {
	id : 'nearby',
	title: 'nearby',
	iconCls: 'nearBy',
	dockedItems :[nearByToolbar,nearBySearchToolbar],
	layout : 'card',
	items: [
		{
			xtype: 'dishlistcard'
		},
		{
			xtype: 'reslistcard'
		}
	]
});

Ext.reg('nearbycard', Crave.views.NearbyCard);