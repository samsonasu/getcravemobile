Ext.regModel('ResItem', {
    fields: ['name', 'dishno','distance','icon']
});

var store = new Ext.data.JsonStore({
    model  : 'DishItem',
    data: [
        {name: 'A16',   dishno: '1847', distance: '55' , icon: 'salad.jpg'},
		{name: 'Caras cup cake',   dishno: '501', distance: '206' , icon: 'icecream.jpg'},
		{name: 'A16',   dishno: '1847', distance: '268' , icon: 'salad.jpg'},
		{name: 'A16',   dishno: '1847', distance: '55' , icon: 'salad.jpg'},
		{name: 'Caras cup cake',   dishno: '501', distance: '206' , icon: 'icecream.jpg'},
		{name: 'A16',   dishno: '1847', distance: '268' , icon: 'salad.jpg'},
		{name: 'Cream Ice',   dishno: '1847', distance: '301' , icon: 'icecream.jpg'}
    ]
});
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
	iconCls: 'filter',
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
var resList = new Ext.List({
	dockedItems :[nearByToolbar,nearBySearchToolbar],
	sorters: 'distance',
    itemTpl : '<div class="iconHolder"><img src="{icon}" height="80" width="80"/></div><div class="dishInfo"><div class="dishName">{name}</div><div class="resName">{dishno} dish reviews</div><div class="resName">{distance} feet away</div></div>',
    store: store,
	 onItemDisclosure: function(record, btn, index) {
                Ext.Msg.alert('Tap', 'Disclose more info for ' + record.get('name'), Ext.emptyFn);
     }
});
Crave.views.ResListView = Ext.extend(Ext.Panel, {
	dockedItems :[nearByToolbar,nearBySearchToolbar],
	items: [resList]
});
Ext.reg('reslistcard', Crave.views.ResListView);