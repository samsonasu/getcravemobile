/*Ext.regModel('DishItem', {
    fields: ['name', 'resName','distance','icon']
});

var store = new Ext.data.JsonStore({
    model  : 'DishItem',
    data: [
        {name: 'Tea Leaf Salad',   resName: 'Burma Superstar', distance: '55' , icon: 'salad.jpg'},
		{name: 'Salted Caramel Ice Cream',   resName: 'Birite Creamy', distance: '206' , icon: 'icecream.jpg'},
		{name: 'Tea Leaf Salad',   resName: 'Burma Superstar', distance: '268' , icon: 'salad.jpg'},
		{name: 'Tea Leaf Salad',   resName: 'Burma Superstar', distance: '55' , icon: 'salad.jpg'},
		{name: 'Salted Caramel Ice Cream',   resName: 'Birite Creamy', distance: '206' , icon: 'icecream.jpg'},
		{name: 'Tea Leaf Salad',   resName: 'Burma Superstar', distance: '268' , icon: 'salad.jpg'},
		{name: 'Cream Ice',   resName: 'Burma Superstar', distance: '301' , icon: 'icecream.jpg'}
    ]
});

var dishPage = new Ext.List({
	sorters: 'distance',
    itemTpl : '<div class="iconHolder"><img src="{icon}" height="80" width="80"/></div><div class="dishInfo"><div class="dishName">{name}</div><div class="resName">@{resName}</div><div class="resName">{distance} feet away</div></div>',
    store: store,
	 onItemDisclosure: function(record, btn, index) {
                Ext.Msg.alert('Tap', 'Disclose more info for ' + record.get('name'), Ext.emptyFn);
     }
});*/
var bBtn = new Ext.Button({
	ui : 'back',
	text : 'Back',
	handler : function(b,e){
			Ext.dispatch({
				controller: Crave.controllers.nearby,
				action    : 'showDish',
				animation: {type:'slide', direction:'left'}
			});
	}
});
var camera = new Ext.Button({
	iconCls: 'camera',
	handler : function(b,e){
	}
});
var toolBar = new Ext.Toolbar({
	dock: 'top',
	items: [bBtn,{xtype: 'spacer'},camera],
	titleCls: 'crave-title'
}); 
Crave.views.DishPageView = Ext.extend(Ext.Panel, {
	dockedItems: [toolBar],
	style : "background-color : #456756;"
	//items: [dishList]
});
Ext.reg('dishpagecard', Crave.views.DishPageView);