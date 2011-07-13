
dishSearchTemplate = new Ext.XTemplate('<tpl for="."><div class="adish"><b>{name}</b><br/>{description}</div></tpl>');


var dishSearchStore = new Ext.data.Store({
    model: 'DishSearch',
    proxy: {
       type:'ajax',
       url:'/items/search.json',
       extraParams: {
         distance: 'yes'
       },
       reader: {
           type:'json',
           record:'menu_item'
       }
    }
});

var restaurantSearchStore = new Ext.data.Store({
    model: 'Restaurants',
    id: 'restaurants',
    proxy: {
        type:'ajax',
        url:'',
        reader: {
           type:'json',
           record:'restaurant'
        }
    }
});

var restaurantSearchList = new Ext.List({
    itemTpl: restaurantTemplate,
    singleSelect: true,
    grouped: false,
    indexBar: false,
    store: restaurantSearchStore
});

restaurantSearchList.on('itemtap', function(dataView, index, item, e) {
    record = dataView.store.data.items[index];
    placeDisplay(record.data.id);
});

var dishSearchList = new Ext.List({
    itemTpl: dishSearchTemplate,
    singleSelect: true,
    grouped: false,
    indexBar: false,
    store: dishSearchStore,
    scroll:'vertical'
});

dishSearchList.on('itemtap', function(dataView, index, item, e) {
    record = dataView.store.data.items[index];
    Crave.show_menu_item(record.data.id);
});

var searchPnl = new Ext.Panel({
    items: [dishSearchList,restaurantSearchList],
    layout:'card',
    id: 'searchPnl',
    width:'100%',
    height:'288px'
});

/*
var nearBySearchToolbar = new Ext.Toolbar({
	dock : 'top',
	items: [{
		xtype: 'searchfield',
        name: 'searchBox',
		width : '100%'
	}]
});
*/

var searchForm = new Ext.Toolbar({
    id: 'searchForm',
    items: [
        {
            xtype: 'searchfield',
            name: 'searchString',
            inputType: 'search',
            useClearIcon:true,
            id: 'searchBox',
            ui: 'search',
            placeHolder: 'Search for dish, restaurant or diet...',
            listeners: {
                change: function() {
                    searchValue = Ext.getCmp("searchBox").getValue();
                    //get active button, do appropriate search, set card in searchPnl
                    if(Ext.getCmp('placesButton').pressed) {
                        restaurantSearchStore.proxy.url = urlPrefix+'/places/search.json?q='+searchValue;
                        restaurantSearchStore.load();
                        console.log(restaurantSearchStore.proxy.url);
                        Ext.getCmp('listPnl').setActiveItem(searchPnl);
                        Ext.getCmp('searchPnl').setActiveItem(restaurantSearchList);
                    }
                    if(Ext.getCmp('dishesButton').pressed) {
                        dishSearchStore.proxy.url = urlPrefix+'/items/search.json?q='+searchValue;
                        dishSearchStore.load();
                        console.log(dishSearchStore.proxy.url);
                        Ext.getCmp('listPnl').setActiveItem(searchPnl);
                        Ext.getCmp('searchPnl').setActiveItem(dishSearchList);                        
                    }
                }
            }
        }
    ]
});
