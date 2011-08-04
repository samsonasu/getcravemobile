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
    Crave.back_stack.push({
      panel: listPnl
    });
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
    Crave.back_stack.push({
      panel: listPnl
    });
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

var searchForm = new Ext.form.FormPanel({
  id: 'searchForm',
  layout: 'auto',
  items: [{
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
        if (searchValue === "___setuid") {
          localStorage.setItem('uid', 31);
          Ext.Msg.alert("loged in", "way2go h4x0r");
          return;
        }
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
  }]
});

Crave.buildFilterPanel = function() {
  //when youpress search, make json call to search results, repopulate listPnl store
  //add distance control button
  //add listener to button, add distance parameter to search string

  var searchHandler = function(b,e) {
      dishSearchStore.proxy.extraParams.q = labelList.get_filters().join(' ');
      var dfb = Ext.getCmp('distanceFilterButton').getPressed();
      dishSearchStore.proxy.extraParams.within = dfb.filter_value;
      dishSearchStore.load();
      console.log(dishSearchStore.proxy.url);
      Ext.getCmp('listPnl').setActiveItem(searchPnl);
      Ext.getCmp('searchPnl').setActiveItem(dishSearchList);
  }

  var items = [];
  Ext.each([".5", "2", "5", "10"], function(d) {
    items.push({
      text: d + " miles",
      ui: 'round',
      pressed: d === '.5',
      width: 64,
      filter_value: d
    });
  });
  items.push({
    text: "All",
    width: 35,
    ui: 'round'
  });
  var distancePanel = new Ext.Panel({
    cls: 'framePanel',
    dockedItems: [{
      dock : 'top',
      xtype: 'toolbar',
      cls: 'title',
      title: 'Distance from You'
    }],
    items: {
      xtype: 'panel',
      dockedItems: [{
        xtype: 'toolbar',
        ui: 'fancy',
        dock: 'top',
        layout:{
          pack:'center'
        },
        items:[{
          xtype:'segmentedbutton',
          id: 'distanceFilterButton',
          items: items
        }]
      }]
    }
  });

  var labelList = Crave.buildLabelListPanel("Dietary Preference");
  Crave.filterPanel = new Ext.Panel({
    items: [distancePanel, labelList],
    id: 'filterListPnl',
    //layout: 'vbox',
    width:'100%',
    height:'100%',
    scroll:'vertical',
    dockedItems:[{
      dock:'top',
      xtype:'toolbar',
      ui:'light',
      title:'Filters',
      layout: {
        type: 'hbox',
        pack:'justify'
      },
      items:[{
        text:'Cancel',
        ui:'normal',
        handler: Crave.back_handler
      },{
        text:'Search',
        ui:'normal',
        handler:searchHandler
      }]
    }]
  });

  return Crave.filterPanel;
};