Ext.regModel('DishItem', {
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

var dishList = new Ext.List({
	sorters: 'distance',
    itemTpl : '<div class="iconHolder"><img src="{icon}" height="80" width="80"/></div><div class="dishInfo"><div class="dishName">{name}</div><div class="resName">@{resName}</div><div class="resName">{distance} feet away</div></div>',
    store: store,
	 onItemDisclosure: function(record, btn, index) {
                Ext.Msg.alert('Tap', 'Disclose more info for ' + record.get('name'), Ext.emptyFn);
     }
});
Crave.views.DishListView = Ext.extend(Ext.Panel, {
	items: [dishList]
});
Ext.reg('dishlistcard', Crave.views.DishListView);