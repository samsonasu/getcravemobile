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

var resList = new Ext.List({
	sorters: 'distance',
    itemTpl : '<div class="iconHolder"><img src="{icon}" height="80" width="80"/></div><div class="dishInfo"><div class="dishName">{name}</div><div class="resName">{dishno} dish reviews</div><div class="resName">{distance} feet away</div></div>',
    store: store,
	 onItemDisclosure: function(record, btn, index) {
                Ext.Msg.alert('Tap', 'Disclose more info for ' + record.get('name'), Ext.emptyFn);
     }
});
Crave.views.ResListView = Ext.extend(Ext.Panel, {
	items: [resList],
	//style : "background-color: #254785;",
	    initComponent: function() {
        
        Crave.views.ResListView.superclass.initComponent.apply(this, arguments);
    }
});
Ext.reg('reslistcard', Crave.views.ResListView);